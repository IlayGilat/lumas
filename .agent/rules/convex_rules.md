# Convex Guidelines

## Functions & Syntax

### Function Syntax
- **New Syntax:** ALWAYS use the new syntax object syntax.
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";
export const f = query({
  args: { name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => { /* body */ },
});
HTTP Endpoints: defined in convex/http.ts with httpAction.

TypeScript

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
const http = httpRouter();
http.route({
  path: "/echo",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    return new Response(await req.bytes(), { status: 200 });
  }),
});
export default http;
Registration & Calling
Public: query, mutation, action. Accessible via api object.

Internal: internalQuery, internalMutation, internalAction. Accessible via internal object.

Validators: ALWAYS include args and returns. If void, use returns: v.null().

Calling:

Use ctx.runQuery, ctx.runMutation, ctx.runAction with a FunctionReference.

Circular Dependencies: When calling functions in the same file, type annotate the return variable to avoid TS errors.

Action Logic: Only call action-from-action if crossing runtimes. Otherwise, extract shared logic to a helper function.

Validators & Types
Null: Use v.null(). undefined is invalid.

Unions: v.union(v.string(), v.number()).

Discriminated Unions:

TypeScript

v.union(
  v.object({ kind: v.literal("ok"), val: v.number() }),
  v.object({ kind: v.literal("err"), msg: v.string() })
)
Type Mapping:

Id: v.id("tableName") (String at runtime)

Int64: v.int64() (BigInt, -2^63 to 2^63-1). Note: v.bigint() is deprecated.

Float64: v.number()

String: v.string() (Max 1MB)

Bytes: v.bytes() (ArrayBuffer)

Array: v.array(v.string()) (Max 8192 items)

Object: v.object({ k: v.string() }) (Max 1024 entries)

Record: v.record(v.string(), v.number()) (Dynamic keys)

Schema & Database
Schema Definition
Define in convex/schema.ts.

System Fields: _id (v.id(table)) and _creationTime (v.number()) are automatic.

Indexes: Include all fields in name. Order matters.

TypeScript

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  users: defineTable({ name: v.string() }),
  msgs: defineTable({ chatId: v.id("chats") }).index("by_chatId", ["chatId"]),
});
Queries & Mutations
No Filters: Do NOT use .filter(). Use withIndex.

Ordering: Defaults to asc creation time. Use .order("desc") explicitly.

Search:

TypeScript

const res = await ctx.db.query("msgs")
  .withSearchIndex("search_body", (q) => q.search("body", "term").eq("channel", id))
  .take(10);
Modifying:

ctx.db.patch(id, { field: val }) (Merge)

ctx.db.replace(id, { field: val }) (Full overwrite)

ctx.db.delete(id)

No Batch Delete: Query -> .collect() -> loop -> ctx.db.delete().

Iteration: Use for await (const row of query) instead of .collect() for large sets.

Unique: Use .unique() to enforce single result (throws if multiple).

Pagination
TypeScript

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("t").paginate(args.paginationOpts);
  },
});
TypeScript Guidelines
IDs: Use Id<'tableName'> (from _generated/dataModel) instead of string.

Records: Record<Id<'users'>, string> correlates to v.record(v.id('users'), v.string()).

Literals: Use as const for union string literals.

Node: Add "use node"; to top of actions using Node built-ins.

Advanced Features
Actions
No DB Access: Actions cannot access ctx.db. Use ctx.runQuery/Mutation.

Async: Designed for 3rd party APIs (OpenAI, Stripe).

Scheduling (Crons)
Define in convex/crons.ts.

Use crons.interval or crons.cron. Do NOT use helper wrappers like crons.daily.

TypeScript

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
const crons = cronJobs();
crons.interval("cleanup", { hours: 2 }, internal.functions.cleanup, {});
export default crons;
File Storage
Upload/Download: Work with Blob.

Get URL: ctx.storage.getUrl(storageId).

Metadata: Query _storage system table via ctx.db.system.get(storageId).

Example: Chat App with AI
Task: Real-time chat, user/channel management, AI auto-response (GPT-4) context.

convex/schema.ts
TypeScript

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  channels: defineTable({ name: v.string() }),
  users: defineTable({ name: v.string() }),
  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")), // null = AI
    content: v.string(),
  }).index("by_channel", ["channelId"]),
});
convex/index.ts
TypeScript

import { query, mutation, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";

// --- Mutations ---

export const createUser = mutation({
  args: { name: v.string() },
  returns: v.id("users"),
  handler: async (ctx, args) => ctx.db.insert("users", { name: args.name }),
});

export const createChannel = mutation({
  args: { name: v.string() },
  returns: v.id("channels"),
  handler: async (ctx, args) => ctx.db.insert("channels", { name: args.name }),
});

export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    authorId: v.id("users"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Validation
    const [channel, user] = await Promise.all([
      ctx.db.get(args.channelId),
      ctx.db.get(args.authorId)
    ]);
    if (!channel || !user) throw new Error("Invalid ID");

    await ctx.db.insert("messages", {
      channelId: args.channelId,
      authorId: args.authorId,
      content: args.content,
    });
    // Schedule AI response immediately
    await ctx.scheduler.runAfter(0, internal.index.generateResponse, {
      channelId: args.channelId,
    });
  },
});

// --- Queries ---

export const listMessages = query({
  args: { channelId: v.id("channels") },
  returns: v.array(v.object({
    _id: v.id("messages"),
    _creationTime: v.number(),
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")),
    content: v.string(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10);
  },
});

export const loadContext = internalQuery({
  args: { channelId: v.id("channels") },
  returns: v.array(v.object({
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  })),
  handler: async (ctx, args) => {
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10);
    
    // Reverse to chronological order for AI context
    const context = [];
    for (const m of msgs) {
      if (m.authorId) {
        const user = await ctx.db.get(m.authorId);
        context.push({ role: "user" as const, content: `${user?.name}: ${m.content}` });
      } else {
        context.push({ role: "assistant" as const, content: m.content });
      }
    }
    return context.reverse();
  },
});

// --- Actions (AI) ---

const openai = new OpenAI();

export const generateResponse = internalAction({
  args: { channelId: v.id("channels") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(internal.index.loadContext, {
      channelId: args.channelId,
    });
    
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: context,
    });

    const content = res.choices[0].message.content;
    if (content) {
      await ctx.runMutation(internal.index.writeAgentResponse, {
        channelId: args.channelId,
        content,
      });
    }
  },
});

export const writeAgentResponse = internalMutation({
  args: { channelId: v.id("channels"), content: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      channelId: args.channelId,
      content: args.content,
    });
  },
});