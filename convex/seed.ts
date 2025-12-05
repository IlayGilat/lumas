import { mutation } from "./_generated/server";

export const seedLights = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("lights").collect();
        if (existing.length > 0) return; // Already seeded

        // Runway 03/21 coordinates
        // Start: 32.005622, 34.891736
        // End: 32.020083, 34.902556

        const startLat = 32.005622;
        const startLng = 34.891736;
        const endLat = 32.020083;
        const endLng = 34.902556;

        const count = 20;
        const lights = [];

        for (let i = 0; i < count; i++) {
            const ratio = i / (count - 1);
            const lat = startLat + (endLat - startLat) * ratio;
            const lng = startLng + (endLng - startLng) * ratio;

            // Add slight offset for left/right side of runway
            // Simple approximation for demo purposes
            const offset = 0.0002;

            // Left side light
            lights.push({
                lat: lat + offset,
                lng: lng - offset,
                isOn: true,
                zone: "Runway 03/21 Left",
                label: `L-${i + 1}`,
                status: "operational"
            });

            // Right side light
            lights.push({
                lat: lat - offset,
                lng: lng + offset,
                isOn: true,
                zone: "Runway 03/21 Right",
                label: `R-${i + 1}`,
                status: "operational"
            });
        }

        for (const light of lights) {
            await ctx.db.insert("lights", light);
        }

        return `Seeded ${lights.length} lights`;
    },
});
