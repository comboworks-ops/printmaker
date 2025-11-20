import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const recordEvent = mutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    payload: v.any(),
    productId: v.optional(v.string()),
    customerId: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    receivedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("webhookEvents", args);
  },
});

