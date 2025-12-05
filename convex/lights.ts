import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("lights").collect();
    },
});

export const get = query({
    args: { id: v.id("lights") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const toggle = mutation({
    args: { id: v.id("lights") },
    handler: async (ctx, args) => {
        const light = await ctx.db.get(args.id);
        if (!light) throw new Error("Light not found");

        await ctx.db.patch(args.id, { isOn: !light.isOn });
    },
});

export const setStatus = mutation({
    args: { id: v.id("lights"), isOn: v.boolean() },
    handler: async (ctx, args) => {
        const light = await ctx.db.get(args.id);
        if (!light) throw new Error("Light not found");

        await ctx.db.patch(args.id, { isOn: args.isOn });
    },
});

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const lights = await ctx.db.query("lights").collect();
        const total = lights.length;
        const operational = lights.filter((l) => l.isOn).length;
        const failed = total - operational;
        const health = total > 0 ? Math.round((operational / total) * 100) : 0;

        return {
            total,
            operational,
            failed,
            health,
        };
    },
});
