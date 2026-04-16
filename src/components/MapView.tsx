"use client";

import dynamic from "next/dynamic";

// Leaflet must be loaded client-side only (no SSR)
const MapInner = dynamic(() => import("./MapInner"), { ssr: false });

export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  popup?: string;
  href?: string;
}

interface MapViewProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function MapView({
  markers,
  center = [-25.2744, 133.7751], // Australia center
  zoom = 4,
  height = "500px",
}: MapViewProps) {
  return (
    <div style={{ height, width: "100%" }}>
      <MapInner markers={markers} center={center} zoom={zoom} />
    </div>
  );
}
