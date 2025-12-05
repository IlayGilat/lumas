import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    lights: defineTable({
        lat: v.number(),
        lng: v.number(),
        isOn: v.boolean(),
        zone: v.string(),
        label: v.string(),
        status: v.optional(v.string()), // "operational", "failed", "maintenance"
    }),
});
