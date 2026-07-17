"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path issues in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewerProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  popupText?: string;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapViewer({ latitude, longitude, zoom = 14, popupText = "Lokasi" }: MapViewerProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div style={{ height: "100%", width: "100%", position: "relative", zIndex: 1 }}>
      <MapContainer 
        center={position} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{popupText}</Popup>
        </Marker>
        <MapUpdater center={position} />
      </MapContainer>
    </div>
  );
}
