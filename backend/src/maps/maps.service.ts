import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);

  // Headers required by Nominatim OSM usage policy
  private readonly headers = {
    'User-Agent': 'Parago-App/1.0 (dev)',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
  };

  // Strictly enforce Nominatim's 1 request per second policy globally across all clients
  private nominatimQueue: Promise<void> = Promise.resolve();

  private async enforceNominatimRateLimit(): Promise<void> {
    const currentQueue = this.nominatimQueue;
    this.nominatimQueue = currentQueue.then(() => new Promise(resolve => setTimeout(resolve, 1000)));
    await currentQueue;
  }

  async estimateRoute(originLat: number, originLng: number, destLat: number, destLng: number) {
    try {
      // NOTE: Using public OSRM for dev. MUST switch to Goong in production.
      const url = `http://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}`;
      const response = await axios.get(url, {
        params: { overview: 'full', geometries: 'polyline' },
        headers: this.headers,
      });

      const data = response.data;
      if (!data.routes || data.routes.length === 0) {
        throw new BadRequestException('Cannot find a route between these two locations.');
      }

      const route = data.routes[0];
      const distance = route.distance; // in meters
      const duration = route.duration; // in seconds

      return {
        distance,
        distanceText: distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`,
        duration,
        durationText: duration >= 3600 
          ? `${Math.floor(duration / 3600)} giờ ${Math.round((duration % 3600) / 60)} phút`
          : `${Math.round(duration / 60)} phút`,
        polyline: route.geometry,
      };
    } catch (error) {
      this.logger.error('OSRM API Error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to estimate route from OSRM API.');
    }
  }

  async autocomplete(input: string, lat?: number, lng?: number) {
    try {
      // Normalize common Vietnamese abbreviations
      let normalizedInput = input
        .replace(/\bktx\b/gi, 'ký túc xá')
        .replace(/\bđh\b/gi, 'đại học')
        .replace(/\b(cd|cđ)\b/gi, 'cao đẳng')
        .replace(/\bpt\b/gi, 'phổ thông')
        .replace(/\bthpt\b/gi, 'trung học phổ thông')
        .replace(/\b(gv|giảng viên)\b/gi, 'giảng viên')
        .replace(/\b(sv|sinh viên)\b/gi, 'sinh viên')
        .replace(/\b(bv|bệnh viện)\b/gi, 'bệnh viện');

      // Tự động thêm Hà Nội nếu chưa có
      if (!normalizedInput.toLowerCase().includes('hà nội')) {
        normalizedInput += ' Hà Nội';
      }
      
      // Mapping một số địa danh hay sai bằng Regex để bắt từ khóa
      const mappings = [
        { regex: /ktx bách khoa/i, replace: 'Ký túc xá Đại học Bách khoa Hà Nội' },
        { regex: /bách khoa/i, replace: 'Đại học Bách khoa Hà Nội' },
        { regex: /m[ỹĩ] đình/i, replace: 'Sân vận động Mỹ Đình Hà Nội' },
        { regex: /nội bài/i, replace: 'Sân bay Nội Bài Hà Nội' },
        { regex: /hồ gươm/i, replace: 'Hồ Hoàn Kiếm Hà Nội' },
        { regex: /văn miếu/i, replace: 'Văn Miếu Quốc Tử Giám Hà Nội' },
      ];

      for (const mapping of mappings) {
        if (mapping.regex.test(normalizedInput)) {
          normalizedInput = mapping.replace;
          break;
        }
      }

      // Strictly enforce 1 request per second
      await this.enforceNominatimRateLimit();

      // NOTE: Using public Nominatim for dev. MUST switch to Goong in production.
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: normalizedInput,
          format: 'jsonv2',
          addressdetails: 1,
          countrycodes: 'vn',
          viewbox: '105.7,20.9,106.0,21.1',
          bounded: 1,
          limit: 5,
        },
        headers: {
          ...this.headers,
          'Accept-Language': 'vi',
        },
      });

      const predictions = response.data.map((item: any) => {
        const address = item.address || {};
        const mainText = address.road || address.pedestrian || item.name || item.display_name.split(',')[0];
        const parsedLat = parseFloat(item.lat);
        const parsedLng = parseFloat(item.lon);
        
        // Encode lat/lon into place_id to avoid an extra lookup in geocode
        const fakePlaceId = Buffer.from(JSON.stringify({ 
          lat: parsedLat, 
          lng: parsedLng,
          address: item.display_name
        })).toString('base64');

        return {
          place_id: fakePlaceId,
          lat: parsedLat,
          lng: parsedLng,
          description: item.display_name,
          structured_formatting: {
            main_text: mainText,
            secondary_text: item.display_name,
          }
        };
      });

      return { predictions };
    } catch (error) {
      this.logger.error('Nominatim Autocomplete Error:', error.message);
      throw new BadRequestException('Failed to fetch autocomplete suggestions');
    }
  }

  async geocode(placeId: string) {
    try {
      // Decode the fake place_id we generated in autocomplete
      const decoded = JSON.parse(Buffer.from(placeId, 'base64').toString('utf-8'));
      
      return {
        result: {
          geometry: {
            location: {
              lat: decoded.lat,
              lng: decoded.lng,
            }
          },
          formatted_address: decoded.address,
          name: decoded.address,
        }
      };
    } catch (error) {
      this.logger.error('Geocode Error:', error.message);
      throw new BadRequestException('Failed to parse place_id details');
    }
  }

  async reverseGeocode(lat: number, lng: number) {
    try {
      // Strictly enforce 1 request per second
      await this.enforceNominatimRateLimit();

      // NOTE: Using public Nominatim for dev. MUST switch to Goong in production.
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat,
          lon: lng,
          format: 'jsonv2',
        },
        headers: this.headers,
      });

      return {
        results: [
          {
            formatted_address: response.data.display_name,
          }
        ]
      };
    } catch (error) {
      this.logger.error('Nominatim Reverse Geocode Error:', error.message);
      throw new BadRequestException('Failed to reverse geocode');
    }
  }
}
