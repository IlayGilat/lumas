import { CircleMarker, Popup, Marker } from "react-leaflet";
import { Doc } from "@/convex/_generated/dataModel";
import StatusBadge from "./StatusBadge";
import { Button } from "./ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Trash2, Move } from "lucide-react";
import L from "leaflet";

interface LightMarkerProps {
  light: Doc<"lights">;
  isEditorMode?: boolean;
}

export default function LightMarker({
  light,
  isEditorMode = false,
}: LightMarkerProps) {
  const toggle = useMutation(api.lights.toggle);
  const remove = useMutation(api.lights.remove);
  const updatePosition = useMutation(api.lights.updatePosition);
  const color = light.isOn ? "#00ff41" : "#ff003c";

  const eventHandlers = {
    dragend(e: L.LeafletEvent) {
      const marker = e.target;
      const position = marker.getLatLng();
      updatePosition({
        id: light._id,
        lat: position.lat,
        lng: position.lng,
      });
    },
  };

  // Custom div icon for editor mode to show it's draggable
  const editorIcon = L.divIcon({
    className: "bg-transparent",
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.5);
      cursor: move;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10], // Center the icon
  });

  if (isEditorMode) {
    return (
      <Marker
        position={[light.lat, light.lng]}
        icon={editorIcon}
        draggable={true}
        eventHandlers={eventHandlers}
      >
        <Popup className="aviation-popup">
          <div className="p-2 min-w-[200px]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">{light.label}</h3>
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Drag to move
                </span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1 mb-3">
              <p>
                Zone: <span className="text-foreground">{light.zone}</span>
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="w-full gap-2"
              onClick={() => remove({ id: light._id })}
            >
              <Trash2 className="h-4 w-4" />
              מחק נורה
            </Button>
          </div>
        </Popup>
      </Marker>
    );
  }

  return (
    <CircleMarker
      center={[light.lat, light.lng]}
      radius={8}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: light.isOn ? 0.9 : 0.4,
        weight: 3,
        className: light.isOn ? "light-marker-glow" : "",
      }}
    >
      <Popup className="aviation-popup">
        <div className="p-2 min-w-[200px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">{light.label}</h3>
            <StatusBadge isOn={light.isOn} />
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              Zone: <span className="text-foreground">{light.zone}</span>
            </p>
            <p>
              Lat: <span className="font-mono">{light.lat.toFixed(6)}</span>
            </p>
            <p>
              Lng: <span className="font-mono">{light.lng.toFixed(6)}</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={() => toggle({ id: light._id })}
          >
            {light.isOn ? "Turn Off" : "Turn On"}
          </Button>
        </div>
      </Popup>
    </CircleMarker>
  );
}
