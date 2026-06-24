"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapUpdaterProps {
  lat: number;
  lng: number;
}

export default function MapUpdater({ lat, lng }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), {
      animate: true,
      duration: 1.5,
    });
  }, [lat, lng, map]);

  return null;
}
