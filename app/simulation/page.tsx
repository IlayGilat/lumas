"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, LayoutDashboard, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SimulationPage() {
  const lights = useQuery(api.lights.list);
  const toggleLight = useMutation(api.lights.toggle);
  const seedLights = useMutation(api.seed.seedLights);

  // Group lights by zone
  const zones = lights?.reduce(
    (acc, light) => {
      if (!acc[light.zone]) {
        acc[light.zone] = [];
      }
      acc[light.zone].push(light);
      return acc;
    },
    {} as Record<string, typeof lights>
  );

  const handleSeed = async () => {
    await seedLights();
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="icon" title="חזרה ללוח הבקרה">
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-wider text-primary">
                סימולציית תאורה
              </h1>
              <p className="text-muted-foreground">לוח בקרה ידני</p>
            </div>
          </div>

          <Button onClick={handleSeed} variant="secondary" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            אתחול / איפוס מערכת
          </Button>
        </div>

        {zones &&
          Object.entries(zones).map(([zone, zoneLights]) => (
            <Card key={zone} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary tracking-widest uppercase text-sm">
                  {zone}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {zoneLights.map((light) => (
                    <Button
                      key={light._id}
                      variant="outline"
                      className={cn(
                        "h-24 flex flex-col gap-2 transition-all duration-300",
                        light.isOn
                          ? "border-primary bg-primary/10 hover:bg-primary/20"
                          : "border-border hover:border-primary/50 opacity-50"
                      )}
                      onClick={() => toggleLight({ id: light._id })}
                    >
                      <Lightbulb
                        className={cn(
                          "h-8 w-8 transition-all duration-300",
                          light.isOn
                            ? "text-primary drop-shadow-[0_0_8px_rgba(0,112,224,0.5)]"
                            : "text-muted-foreground"
                        )}
                      />
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold">{light.label}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {light.isOn ? "פעיל" : "כבוי"}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

        {!lights?.length && (
          <div className="text-center py-20 text-muted-foreground">
            <p>לא זוהו נורות במערכת.</p>
            <p className="text-sm mt-2">
              לחץ על &quot;אתחול מערכת&quot; כדי לטעון נתונים.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
