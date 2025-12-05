"use client";

import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LightMarker from "./LightMarker";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default icon issue in Next.js
import L from "leaflet";
import { useEffect, useState } from "react";

const { BaseLayer } = LayersControl;

export default function Map() {
    const lights = useQuery(api.lights.list);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // @ts-expect-error - Fix Leaflet icon issue
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
    }, []);

    if (!isMounted) return <div className="h-full w-full bg-muted animate-pulse" />;

    // Center on Ben Gurion Airport
    const center: [number, number] = [32.0114, 34.8867];

    return (
        <MapContainer
            center={center}
            zoom={14}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
            className="bg-[#0a0a0f]"
        >
            <LayersControl position="topright">
                <BaseLayer checked name="Satellite (Dark)">
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
            </LayersControl>

            {lights?.map((light) => (
                <LightMarker key={light._id} light={light} />
            ))}
        </MapContainer>
    );
}
