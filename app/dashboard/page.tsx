"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center text-muted-foreground">Loading Map System...</div>
});

export default function DashboardPage() {
    const stats = useQuery(api.lights.getStats);
    const lights = useQuery(api.lights.list);

    // Group lights by zone
    const zones = lights?.reduce((acc, light) => {
        if (!acc[light.zone]) {
            acc[light.zone] = { total: 0, operational: 0 };
        }
        acc[light.zone].total++;
        if (light.isOn) acc[light.zone].operational++;
        return acc;
    }, {} as Record<string, { total: number; operational: number }>);

    const failedLights = lights?.filter(l => !l.isOn) || [];

    return (
        <div className="flex h-screen bg-[#0a0a0f] text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside className="w-80 border-r border-white/10 bg-[#141419] flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-bold tracking-wider text-[var(--color-aviation-cyan)] flex items-center gap-2">
                        <Activity className="h-6 w-6" />
                        LUMAS
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">Runway Light Control</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* System Health */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">System Status</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="p-4 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-[var(--color-aviation-cyan)]">{stats?.total || 0}</span>
                                    <span className="text-xs text-muted-foreground uppercase mt-1">Total Units</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="p-4 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-[var(--color-aviation-cyan)]">{stats?.health || 0}%</span>
                                    <span className="text-xs text-muted-foreground uppercase mt-1">Health</span>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-green-500/10 border-green-500/20">
                                <CardContent className="p-4 flex flex-col items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mb-1" />
                                    <span className="text-xl font-bold text-green-500">{stats?.operational || 0}</span>
                                    <span className="text-xs text-muted-foreground uppercase">Active</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-red-500/10 border-red-500/20">
                                <CardContent className="p-4 flex flex-col items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mb-1" />
                                    <span className="text-xl font-bold text-red-500">{stats?.failed || 0}</span>
                                    <span className="text-xs text-muted-foreground uppercase">Failed</span>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Critical Alerts */}
                    {failedLights.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" /> Critical Alerts
                            </h2>
                            {failedLights.map(light => (
                                <div key={light._id} className="bg-red-500/10 border border-red-500/20 p-3 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-red-400">{light.label}</p>
                                        <p className="text-xs text-red-400/70">{light.zone}</p>
                                    </div>
                                    <StatusBadge isOn={false} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Zone Status */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Zone Status</h2>
                        {zones && Object.entries(zones).map(([zone, data]) => (
                            <div key={zone} className="bg-white/5 border border-white/10 p-3 rounded-md">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-sm">{zone}</span>
                                    <span className={`text-xs font-mono ${data.operational === data.total ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {data.operational}/{data.total}
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${data.operational === data.total ? 'bg-green-500' : 'bg-yellow-500'}`}
                                        style={{ width: `${(data.operational / data.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Map Area */}
            <main className="flex-1 relative">
                <div className="absolute bottom-4 right-4 z-[1000] bg-[#141419]/90 backdrop-blur border border-white/10 p-2 rounded-md shadow-xl">
                    <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[var(--color-aviation-cyan)] shadow-[0_0_8px_var(--color-aviation-cyan)]"></span>
                            <span>OPERATIONAL</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[var(--color-aviation-red)]"></span>
                            <span>OFFLINE</span>
                        </div>
                    </div>
                </div>
                <Map />
            </main>
        </div>
    );
}
