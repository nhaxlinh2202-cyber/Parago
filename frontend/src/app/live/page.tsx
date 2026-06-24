"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Avatar, StarRating, FAB, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  IconChevronLeft,
  IconPhone,
  IconMessage,
  IconShieldCheck,
  IconShare,
  IconCurrentLocation,
} from "@tabler/icons-react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth-store";
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";

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

// Custom component to handle map events and panning
const MapUpdater = dynamic(
  () => import('./MapUpdater'),
  { ssr: false }
);

interface LocationUpdate {
  userId: string;
  rideId: string;
  lat: number;
  lng: number;
  timestamp: number;
}

export default function LiveTrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rideId = searchParams.get("id") || "demo-ride";
  
  const [locations, setLocations] = useState<LocationUpdate[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const { accessToken } = useAuthStore();
  
  const defaultLat = 21.0051;
  const defaultLng = 105.8456;
  
  // The driver's location (assuming the first active location is the driver for dev)
  const driverLocation = locations.length > 0 ? locations[0] : null;

  useEffect(() => {
    if (!accessToken) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    const newSocket = io(`${API_URL}/tracking`, {
      auth: { token: accessToken }
    });

    newSocket.on('connect', () => {
      console.log('Connected to live tracking socket');
      newSocket.emit('joinRide', { rideId });
    });

    newSocket.on('locationsUpdate', (data: LocationUpdate[]) => {
      setLocations(data);
    });

    newSocket.on('sosAlert', (alert: any) => {
      console.warn('SOS Alert received!', alert);
      setSosActive(true);
      alert('⚠️ CẢNH BÁO SOS ⚠️\nCó người vừa kích hoạt SOS trong chuyến đi này!');
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leaveRide', { rideId });
      newSocket.disconnect();
    };
  }, [rideId, accessToken]);

  const handleTriggerSOS = () => {
    if (socket && driverLocation) {
      socket.emit('triggerSOS', { rideId, lat: driverLocation.lat, lng: driverLocation.lng });
    } else if (socket) {
      socket.emit('triggerSOS', { rideId, lat: defaultLat, lng: defaultLng });
    }
  };

  return (
    <div className="relative h-screen w-full bg-[#E5E3DF] overflow-hidden">
      {/* REAL MAP BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[defaultLat, defaultLng]} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {driverLocation && (
            <MapUpdater lat={driverLocation.lat} lng={driverLocation.lng} />
          )}
          {driverLocation && (
            <Marker position={[driverLocation.lat, driverLocation.lng]} />
          )}
        </MapContainer>
      </div>

      {/* TOP HEADER & ROUTE INFO */}
      <div className="absolute top-0 left-0 right-0 z-20 safe-top p-4 space-y-4 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-surface-50 transition-colors"
          >
            <IconChevronLeft size={24} />
          </button>
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-4 border border-white/50 pointer-events-auto"
        >
          <div className="flex justify-between items-center mb-1">
            <div>
              <h2 className="text-2xl font-bold text-primary-500">12 phút</h2>
              <p className="text-sm text-[var(--text-muted)]">3.2 km • 14:45 đến nơi</p>
            </div>
            <div className="text-right">
              {sosActive ? (
                <Badge variant="danger" className="animate-pulse">KHẨN CẤP SOS</Badge>
              ) : (
                <Badge variant="success" className="animate-pulse">Đang di chuyển</Badge>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* FLOATING ACTION BUTTONS */}
      <div className="absolute right-4 bottom-48 z-20 flex flex-col gap-3">
        <button className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-[var(--text-heading)] hover:bg-surface-50 transition-colors">
          <IconCurrentLocation size={24} />
        </button>
        <button className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors">
          <IconShare size={24} />
        </button>
        <button onClick={handleTriggerSOS} className="w-12 h-12 bg-red-600 shadow-lg shadow-red-600/30 rounded-full flex items-center justify-center text-white relative">
          <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-50" />
          <IconShieldCheck size={24} />
        </button>
      </div>

      {/* DRIVER INFO BOTTOM SHEET */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-surface-200 pb-safe"
      >
        <div className="w-12 h-1.5 bg-surface-300 rounded-full mx-auto my-3" />
        <div className="p-5 pt-2 space-y-5">
          {/* Driver & Vehicle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name="Trần Văn Minh" size="lg" verified premium />
              <div>
                <h3 className="font-bold text-lg text-[var(--text-heading)]">Trần Văn Minh</h3>
                <div className="flex items-center gap-1">
                  <StarRating rating={4.9} size="sm" />
                  <span className="text-xs text-[var(--text-muted)]">4.9 • Honda Vision</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-surface-100 border border-surface-200 px-3 py-1 rounded-lg text-sm font-bold tracking-wider mb-1">
                29A-123.45
              </div>
              <p className="text-xs text-[var(--text-muted)]">Màu xanh đen</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/messages/2" className="flex-1">
              <button className="w-full py-3 bg-surface-100 hover:bg-surface-200 text-[var(--text-heading)] rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                <IconMessage size={20} /> Nhắn tin
              </button>
            </Link>
            <button className="flex-[2] py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 transition-colors">
              <IconPhone size={20} /> Gọi điện
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
