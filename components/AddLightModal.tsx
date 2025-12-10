import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useState } from "react";
import { X } from "lucide-react";

interface AddLightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { label: string; zone: string }) => void;
  lat: number;
  lng: number;
}

const ZONES = [
  "Runway 12-30",
  "Runway 08-26",
  "Taxiway Alpha",
  "Taxiway Bravo",
  "Apron A",
  "Apron B",
];

export function AddLightModal({
  isOpen,
  onClose,
  onAdd,
  lat,
  lng,
}: AddLightModalProps) {
  const [label, setLabel] = useState("");
  const [zone, setZone] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label && zone) {
      onAdd({ label, zone });
      setLabel("");
      setZone("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-[400px] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>הוסף נורה חדשה</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="label" className="text-right text-sm font-medium">
                שם הנורה
              </label>
              <input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="לדוגמה: RWY-12-L1"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="zone" className="text-right text-sm font-medium">
                אזור
              </label>
              <select
                id="zone"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  בחר אזור
                </option>
                {ZONES.map((z) => (
                  <SelectItem key={z} value={z} />
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 text-sm text-muted-foreground">
              <span className="text-right font-medium">מיקום</span>
              <div className="col-span-3 font-mono text-xs">
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" disabled={!label || !zone}>
              הוסף
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Helper component for select items just to accept the key/value pattern cleanly
function SelectItem({ value }: { value: string }) {
  return (
    <option value={value} className="bg-popover text-popover-foreground">
      {value}
    </option>
  );
}
