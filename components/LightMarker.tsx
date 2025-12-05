import { CircleMarker, Popup } from "react-leaflet";
import { Doc } from "@/convex/_generated/dataModel";
import StatusBadge from "./StatusBadge";

interface LightMarkerProps {
    light: Doc<"lights">;
}

export default function LightMarker({ light }: LightMarkerProps) {
    const color = light.isOn ? "#00ff41" : "#ff003c";

    return (
        <CircleMarker
            center={[light.lat, light.lng]}
            radius={8}
            pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: light.isOn ? 0.9 : 0.4,
                weight: 3,
                className: light.isOn ? 'light-marker-glow' : ''
            }}
        >
            <Popup className="aviation-popup">
                <div className="p-2 min-w-[200px]">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg">{light.label}</h3>
                        <StatusBadge isOn={light.isOn} />
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p>Zone: <span className="text-foreground">{light.zone}</span></p>
                        <p>Lat: <span className="font-mono">{light.lat.toFixed(6)}</span></p>
                        <p>Lng: <span className="font-mono">{light.lng.toFixed(6)}</span></p>
                    </div>
                </div>
            </Popup>
        </CircleMarker>
    );
}
