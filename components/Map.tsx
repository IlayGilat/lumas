"use client";

import {
  MapContainer,
  TileLayer,
  LayersControl,
  useMapEvents,
} from "react-leaflet";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import LightMarker from "./LightMarker";
import { AddLightModal } from "./AddLightModal";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default icon issue in Next.js
import L from "leaflet";
import { useEffect, useState } from "react";

const { BaseLayer } = LayersControl;

const ZONES = [
  "Runway 12-30",
  "Runway 08-26",
  "Taxiway Alpha",
  "Taxiway Bravo",
  "Apron A",
  "Apron B",
];

interface MapProps {
  isEditorMode?: boolean;
  isQuickAddMode?: boolean;
}

export default function Map({
  isEditorMode = false,
  isQuickAddMode = false,
}: MapProps) {
  const lights = useQuery(api.lights.list);
  const createLight = useMutation(api.lights.create);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLightLocation, setNewLightLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (isEditorMode) {
          if (isQuickAddMode) {
            // Quick Add Logic
            const randomZone = ZONES[Math.floor(Math.random() * ZONES.length)];
            const randomId = Math.floor(10000 + Math.random() * 90000);
            createLight({
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              label: `Quick-${randomId}`,
              zone: randomZone,
            });
          } else {
            // Default: Open Modal
            setNewLightLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
            setIsModalOpen(true);
          }
        }
      },
    });
    return null;
  };

  useEffect(() => {
    setIsMounted(true);
    // @ts-expect-error - Fix Leaflet icon issue
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  if (!isMounted)
    return <div className="h-full w-full bg-muted animate-pulse" />;

  // Center on Ben Gurion Airport
  const center: [number, number] = [32.0114, 34.8867];

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      className="bg-[#0a0a0f]"
    >
      <MapEvents />
      <AddLightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(data) => {
          if (newLightLocation) {
            createLight({
              lat: newLightLocation.lat,
              lng: newLightLocation.lng,
              label: data.label,
              zone: data.zone,
            });
          }
        }}
        lat={newLightLocation?.lat || 0}
        lng={newLightLocation?.lng || 0}
      />
      <LayersControl position="topright">
        <BaseLayer checked name="Satellite (Esri)">
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </BaseLayer>
        <BaseLayer name="Dark Mode">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </BaseLayer>
        <BaseLayer name="Street View">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </BaseLayer>
        <BaseLayer name="Terrain">
          <TileLayer
            attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
          />
        </BaseLayer>
      </LayersControl>

      {lights?.map((light) => (
        <LightMarker
          key={light._id}
          light={light}
          isEditorMode={isEditorMode}
        />
      ))}
    </MapContainer>
  );
}
