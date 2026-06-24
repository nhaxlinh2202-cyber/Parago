"use client";

import React, { useEffect, useState, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { Input } from "@/components/ui";
import { IconSearch, IconMapPin } from "@tabler/icons-react";
import "leaflet/dist/leaflet.css";

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

/*
 * LƯU Ý QUAN TRỌNG VỀ ĐỊNH VỊ:
 * Đây là giải pháp tạm thời sử dụng Nominatim (OpenStreetMap) vì nó hoàn toàn miễn phí.
 * Tuy nhiên, Nominatim xử lý địa chỉ tiếng Việt rất yếu.
 * KHI TÀI KHOẢN GOONG ĐƯỢC DUYỆT, CẦN CHUYỂN SANG GOONG MAPS API:
 * - Thay thế endpoint /maps/autocomplete và /maps/geocode trong backend để gọi Goong API.
 * - Goong Maps API có độ chính xác cao hơn rất nhiều cho thị trường Việt Nam.
 */

export const PRESET_LOCATIONS = [
  // Trường đại học
  { id: 'hust', name: 'Đại học Bách Khoa Hà Nội', type: 'university', icon: '🎓', lat: 21.0055269, lng: 105.8435926, address: 'Đại học Bách khoa Hà Nội, Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội' },
  { id: 'neu', name: 'Đại học Kinh tế Quốc dân', type: 'university', icon: '🎓', lat: 20.9997459, lng: 105.8434973, address: 'Đại học Kinh tế Quốc dân, 207 Giải Phóng, Hai Bà Trưng, Hà Nội' },
  { id: 'vnu', name: 'Đại học Quốc gia Hà Nội', type: 'university', icon: '🎓', lat: 21.0388103, lng: 105.7818897, address: 'Đại học Quốc gia Hà Nội, 144 Xuân Thủy, Cầu Giấy, Hà Nội' },
  { id: 'ftu', name: 'Đại học Ngoại thương', type: 'university', icon: '🎓', lat: 21.0225029, lng: 105.8051480, address: 'Đại học Ngoại thương, 91 Chùa Láng, Đống Đa, Hà Nội' },
  { id: 'xaydung', name: 'Đại học Xây dựng', type: 'university', icon: '🎓', lat: 21.0005518, lng: 105.8452410, address: 'Đại học Xây dựng Hà Nội, 55 Giải Phóng, Hai Bà Trưng, Hà Nội' },
  { id: 'thuyloi', name: 'Đại học Thủy lợi', type: 'university', icon: '🎓', lat: 21.0068, lng: 105.8242, address: 'Đại học Thủy lợi, 175 Tây Sơn, Đống Đa, Hà Nội' },
  // Ký túc xá
  { id: 'ktx_hust', name: 'KTX Bách Khoa', type: 'dorm', icon: '🏠', lat: 21.0040, lng: 105.8465, address: 'Ký túc xá Đại học Bách khoa Hà Nội, Tạ Quang Bửu, Hai Bà Trưng, Hà Nội' },
  { id: 'ktx_metri', name: 'KTX Mễ Trì', type: 'dorm', icon: '🏠', lat: 21.0000, lng: 105.7950, address: 'Ký túc xá Mễ Trì, Lương Thế Vinh, Thanh Xuân, Hà Nội' },
  // Giao thông
  { id: 'noibai', name: 'Sân bay Nội Bài', type: 'airport', icon: '✈️', lat: 21.2169534, lng: 105.7937453, address: 'Sân bay Quốc tế Nội Bài, Phú Minh, Sóc Sơn, Hà Nội' },
  { id: 'mydinh_bus', name: 'Bến xe Mỹ Đình', type: 'bus', icon: '🚌', lat: 21.0284045, lng: 105.7783143, address: 'Bến xe Mỹ Đình, 20 Phạm Hùng, Nam Từ Liêm, Hà Nội' },
  { id: 'giapbat', name: 'Bến xe Giáp Bát', type: 'bus', icon: '🚌', lat: 20.9802349, lng: 105.8420007, address: 'Bến xe Giáp Bát, Giải Phóng, Hoàng Mai, Hà Nội' },
  // Nổi tiếng
  { id: 'mydinh_stadium', name: 'Sân vận động Mỹ Đình', type: 'landmark', icon: '🏟️', lat: 21.0205027, lng: 105.7639271, address: 'Sân vận động Quốc gia Mỹ Đình, Lê Đức Thọ, Nam Từ Liêm, Hà Nội' },
];

const QUICK_PICK_IDS = ['hust', 'neu', 'vnu', 'mydinh_bus', 'noibai'];

interface LocationPickerProps {
  label?: string;
  placeholder?: string;
  value?: LocationData;
  onChange: (data: LocationData) => void;
  className?: string;
  isPickup?: boolean;
}

// Leaflet components MUST be loaded dynamically to avoid SSR "window is not defined" error
import dynamic from 'next/dynamic';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

// We need a separate component inside MapContainer to use hooks
const MapEventsAndState = dynamic(
  () => import('./MapEventsAndState'),
  { ssr: false }
);

export function LocationPicker({
  label,
  placeholder = "Tìm kiếm địa chỉ...",
  value,
  onChange,
  className,
  isPickup = false,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [presetSuggestions, setPresetSuggestions] = useState<typeof PRESET_LOCATIONS>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const defaultLat = value?.lat || 21.0051; // Bách Khoa Hà Nội
  const defaultLng = value?.lng || 105.8456;

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoSelectingRef = useRef(false);

  useEffect(() => {
    if (value?.address && value.address !== searchQuery && !isAutoSelectingRef.current) {
      setSearchQuery(value.address);
    }
    // Reset the flag after it's been consumed
    isAutoSelectingRef.current = false;
  }, [value?.address]);

  const handleLocationChange = async (lat: number, lng: number) => {
    try {
      const res = await apiClient.post("/maps/reverse-geocode", { lat, lng });
      const address = res.data?.results?.[0]?.formatted_address || "Vị trí đã chọn";
      isAutoSelectingRef.current = true; // Prevent input text override from parent
      setSearchQuery(address);
      onChange({ lat, lng, address });
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ:", error);
      onChange({ lat, lng, address: "Vị trí đã chọn" });
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    // Xử lý gợi ý Preset Local (Cực nhanh)
    const lowerText = text.toLowerCase();
    let filteredPresets: typeof PRESET_LOCATIONS = [];
    if (lowerText) {
      if (lowerText.includes('đại học') || lowerText.includes('dai hoc') || lowerText.includes('dh')) {
        filteredPresets = PRESET_LOCATIONS.filter(p => p.type === 'university');
      } else if (lowerText.includes('ktx') || lowerText.includes('ký túc')) {
        filteredPresets = PRESET_LOCATIONS.filter(p => p.type === 'dorm');
      } else if (lowerText.includes('bến xe') || lowerText.includes('ben xe')) {
        filteredPresets = PRESET_LOCATIONS.filter(p => p.type === 'bus');
      } else if (lowerText.includes('sân bay') || lowerText.includes('nội bài')) {
        filteredPresets = PRESET_LOCATIONS.filter(p => p.type === 'airport');
      } else {
        filteredPresets = PRESET_LOCATIONS.filter(p => p.name.toLowerCase().includes(lowerText));
      }
    }
    setPresetSuggestions(filteredPresets);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await apiClient.post("/maps/autocomplete", { input: text });
        const predictions = res.data?.predictions || [];
        setSuggestions(predictions);
        setShowDropdown(true);
        // BỎ TỰ ĐỘNG CHỌN: Không tự động nhảy marker tới kết quả đầu tiên nữa
        // Để người dùng tự chọn từ dropdown
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectPlace = async (placeId: string) => {
    setShowDropdown(false);
    try {
      const res = await apiClient.post("/maps/geocode", { placeId });
      const location = res.data?.result?.geometry?.location;
      if (location) {
        const { lat, lng } = location;
        const address = res.data.result.formatted_address || res.data.result.name;
        
        // Fallback thông minh: Cảnh báo nếu không chứa Hà Nội/Việt Nam
        const addressLower = address.toLowerCase();
        if (!addressLower.includes("hà nội") && !addressLower.includes("việt nam")) {
          setWarningMessage("Không tìm thấy địa điểm chính xác — bạn có thể kéo marker để điều chỉnh vị trí");
        } else {
          setWarningMessage("");
        }

        setSearchQuery(address);
        onChange({ lat, lng, address });
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết địa điểm:", error);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationChange(latitude, longitude);
          setShowDropdown(false);
        },
        (error) => {
          console.error("Lỗi lấy vị trí:", error);
          alert("Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí.");
        }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ định vị GPS.");
    }
  };

  const handlePresetSelect = (preset: typeof PRESET_LOCATIONS[0]) => {
    setSearchQuery(preset.address);
    setWarningMessage("");
    setShowDropdown(false);
    onChange({ lat: preset.lat, lng: preset.lng, address: preset.address });
  };

  return (
    <div className={`space-y-2 relative ${showDropdown ? "z-50" : "z-10"} ${className || ""}`}>
      {label && <label className="text-sm font-medium text-[var(--text-primary)]">{label}</label>}
      
      <div className="relative z-50">
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          leftIcon={<IconSearch size={18} />}
          onFocus={() => setShowDropdown(true)}
        />

        {showDropdown && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-2 shadow-xl">
            {/* Nếu input rỗng, hiển thị Quick Picks List thẳng trong dropdown, hoặc ta hiển thị dạng Chip ở dưới ô input */}
            
            {/* 
              Đã chuyển "Dùng vị trí hiện tại" xuống Quick Picks Chips theo yêu cầu mới.
              Tuy nhiên vẫn có thể giữ lại ở đây nếu muốn người dùng bấm từ dropdown.
              Để gọn gàng, ta sẽ ẩn nó khỏi dropdown nếu đã có ở Quick Picks.
              Hoặc cứ giữ lại ở Dropdown làm tuỳ chọn.
            */}
            {presetSuggestions.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  📍 Địa điểm phổ biến
                </div>
                {presetSuggestions.map((preset) => (
                  <li
                    key={preset.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-[var(--surface-hover)]"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <div className="mt-0.5 rounded-full bg-[var(--surface-100)] p-1.5 text-xl leading-none">
                      {preset.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-heading)]">
                        {preset.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {preset.address}
                      </p>
                    </div>
                  </li>
                ))}
                {suggestions.length > 0 && <div className="h-px bg-[var(--border-light)] my-1" />}
              </>
            )}

            {/* Nominatim Suggestions */}
            {suggestions.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  🔍 Kết quả tìm kiếm
                </div>
                {suggestions.map((place) => (
                  <li
                    key={place.place_id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-[var(--surface-hover)]"
                    onClick={() => handleSelectPlace(place.place_id)}
                  >
                    <div className="mt-0.5 rounded-full bg-[var(--primary-50)] p-1.5 text-[var(--primary)]">
                      <IconMapPin size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-heading)]">
                        {place.structured_formatting?.main_text || place.description}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {place.structured_formatting?.secondary_text || place.description}
                      </p>
                    </div>
                  </li>
                ))}
              </>
            )}
          </ul>
        )}
      </div>

      {/* Quick Picks Chips (chỉ hiện khi chưa gõ gì hoặc đang focus) */}
      {!(showDropdown && searchQuery.trim().length > 0) && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 w-full">
          {isPickup && (
            <button
              type="button"
              onClick={handleCurrentLocation}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-medium transition-colors whitespace-nowrap overflow-hidden"
            >
              <span>📍</span> Vị trí của tôi
            </button>
          )}
          
          {!isPickup && PRESET_LOCATIONS.filter(p => QUICK_PICK_IDS.includes(p.id))
            .sort((a, b) => QUICK_PICK_IDS.indexOf(a.id) - QUICK_PICK_IDS.indexOf(b.id))
            .map(preset => (
            <button
              type="button"
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-100)] text-xs font-medium text-[var(--text-secondary)] transition-colors whitespace-nowrap overflow-hidden"
            >
              <span>{preset.icon}</span> {preset.name}
            </button>
          ))}
        </div>
      )}

      {warningMessage && (
        <div className="text-xs font-medium text-orange-500 bg-orange-50 p-2 rounded-md">
          ⚠️ {warningMessage}
        </div>
      )}

      <div className="relative z-0 h-48 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-gray-100">
        <MapContainer 
          center={[defaultLat, defaultLng]} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEventsAndState 
            lat={defaultLat} 
            lng={defaultLng} 
            onLocationChange={handleLocationChange} 
            hasValue={true}
          />
        </MapContainer>
      </div>
    </div>
  );
}
