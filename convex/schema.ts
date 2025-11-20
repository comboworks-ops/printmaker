import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    text: v.string(),
    userId: v.string(),
    createdAt: v.float64(),
  }).index("by_user", ["userId"]),
  webhookEvents: defineTable({
    eventId: v.string(),
    eventType: v.string(),
    payload: v.any(),
    productId: v.optional(v.string()),
    customerId: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    receivedAt: v.float64(),
  }).index("by_eventId", ["eventId"]),
  userPlans: defineTable({
    identity: v.string(),
    plan: v.string(),
    updatedAt: v.float64(),
    email: v.optional(v.string()),
    userId: v.optional(v.string()),
    source: v.optional(v.string()),
  }).index("by_identity", ["identity"]),
  sites: defineTable({
    identity: v.string(),
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    theme: v.optional(v.any()),
    published: v.boolean(),
    createdAt: v.float64(),
  })
    .index("by_identity", ["identity"])
    .index("by_slug", ["slug"]),
  pages: defineTable({
    siteId: v.id("sites"),
    slug: v.string(),
    title: v.string(),
    content: v.any(),
    updatedAt: v.float64(),
  })
    .index("by_site", ["siteId"])
    .index("by_site_slug", ["siteId", "slug"]),
});

