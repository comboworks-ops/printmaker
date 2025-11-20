import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";

const buildIdentity = (kind: "user" | "email", raw: string) =>
  `${kind}:${raw.trim().toLowerCase()}`;

const PLAN_FREE = "free";

export const getCurrentPlan = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { plan: PLAN_FREE };
    }

    const userKey = buildIdentity("user", identity.subject);
    const record = await ctx.db
      .query("userPlans")
      .withIndex("by_identity", (q) => q.eq("identity", userKey))
      .unique();

    if (!record) {
      return { plan: PLAN_FREE };
    }

    return {
      plan: record.plan,
      updatedAt: record.updatedAt,
      source: record.source,
      email: record.email,
      identity: record.identity,
    };
  },
});

export const syncCurrentUserPlan = mutation({
  args: {
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be signed in to sync plan");
    }

    const userKey = buildIdentity("user", identity.subject);
    const existing = await ctx.db
      .query("userPlans")
      .withIndex("by_identity", (q) => q.eq("identity", userKey))
      .unique();

    if (existing) {
      return existing.plan;
    }

    const email =
      args.email?.toLowerCase() ?? identity.email?.toLowerCase() ?? undefined;

    if (!email) {
      return PLAN_FREE;
    }

    const emailKey = buildIdentity("email", email);
    const entryByEmail = await ctx.db
      .query("userPlans")
      .withIndex("by_identity", (q) => q.eq("identity", emailKey))
      .unique();

    if (!entryByEmail) {
      return PLAN_FREE;
    }

    await ctx.db.patch(entryByEmail._id, {
      identity: userKey,
      userId: identity.subject,
      email,
      updatedAt: Date.now(),
    });

    return entryByEmail.plan;
  },
});

const determinePlanFromEvent = (
  eventType: string,
  productId: string | null | undefined,
) => {
  const targetProduct = process.env.POLAR_PRODUCT_ID;

  if (eventType === "order.completed" && targetProduct) {
    if (!productId || productId !== targetProduct) {
      return null;
    }

    return "pro";
  }

  if (
    eventType === "order.refunded" ||
    eventType === "order.cancelled" ||
    eventType === "subscription.cancelled"
  ) {
    return PLAN_FREE;
  }

  return null;
};

const upsertPlan = async (
  ctx: MutationCtx,
  identityKey: string,
  plan: string,
  details: { email?: string; userId?: string; source?: string },
) => {
  const existing = await ctx.db
    .query("userPlans")
    .withIndex("by_identity", (q) => q.eq("identity", identityKey))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      plan,
      updatedAt: Date.now(),
      ...details,
    });
    return;
  }

  await ctx.db.insert("userPlans", {
    identity: identityKey,
    plan,
    updatedAt: Date.now(),
    ...details,
  });
};

export const applyPolarEvent = mutation({
  args: {
    eventType: v.string(),
    customerEmail: v.optional(v.string()),
    productId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const plan = determinePlanFromEvent(args.eventType, args.productId ?? null);

    if (!plan) {
      return;
    }

    const email = args.customerEmail?.toLowerCase();

    if (!email) {
      console.warn(
        "Polar event could not be applied because no customer email was present",
      );
      return;
    }

    const identityKey = buildIdentity("email", email);
    await upsertPlan(ctx, identityKey, plan, {
      email,
      source: "polar",
    });
  },
});

