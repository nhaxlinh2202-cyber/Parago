"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import { useMap, useMapEvents, Marker } from 'react-leaflet';
import L from 'leaflet';

interface MapEventsAndStateProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
  hasValue?: boolean;
}

export default function MapEventsAndState({ lat, lng, onLocationChange, hasValue = true }: MapEventsAndStateProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  const position = useMemo(() => new L.LatLng(lat, lng), [lat, lng]);

  // When lat/lng props change from outside, move the map
  useEffect(() => {
    map.flyTo(position, 15);
  }, [position, map]);

  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const pos = marker.getLatLng();
          onLocationChange(pos.lat, pos.lng);
        }
      },
    }),
    [onLocationChange]
  );

  const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  if (!hasValue) return null;

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={customIcon}
    />
  );
}
