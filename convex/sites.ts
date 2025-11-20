import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const buildIdentity = (subject: string) => `user:${subject}`;

export const listSites = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const ownerKey = buildIdentity(identity.subject);
    return ctx.db
      .query("sites")
      .withIndex("by_identity", (q) => q.eq("identity", ownerKey))
      .order("desc")
      .collect();
  },
});

export const getSite = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const site = await ctx.db.get(args.siteId);
    if (!site) {
      return null;
    }

    if (site.identity !== buildIdentity(identity.subject)) {
      return null;
    }

    const pages = await ctx.db
      .query("pages")
      .withIndex("by_site", (q) => q.eq("siteId", site._id))
      .collect();

    return { site, pages };
  },
});

export const publicGetSite = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const site = await ctx.db
      .query("sites")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!site) {
      return null;
    }

    const pages = await ctx.db
      .query("pages")
      .withIndex("by_site", (q) => q.eq("siteId", site._id))
      .collect();

    return { site, pages };
  },
});

export const createSite = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be signed in");
    }

    const ownerKey = buildIdentity(identity.subject);
    const existingSlug = await ctx.db
      .query("sites")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existingSlug) {
      throw new Error("Slug already in use");
    }

    const siteId = await ctx.db.insert("sites", {
      identity: ownerKey,
      slug: args.slug,
      name: args.name,
      description: args.description,
      theme: {
        primary: "#000000",
        accent: "#f97316",
      },
      published: false,
      createdAt: Date.now(),
    });

    await ctx.db.insert("pages", {
      siteId,
      slug: "home",
      title: "Home",
      content: {
        hero: {
          heading: "Launch your next idea",
          subheading:
            "Describe your product or service here and encourage visitors to take action.",
          ctaLabel: "Get started",
          ctaHref: "#cta",
        },
        features: [
          {
            title: "Beautiful sections",
            description: "Pre-built layouts you can customize to tell your story.",
          },
          {
            title: "Convex powered",
            description: "Your content is stored in Convex for real-time updates.",
          },
          {
            title: "Fast checkout",
            description: "Collect payments through Polar without touching billing code.",
          },
        ],
        cta: {
          heading: "Ready to publish?",
          subheading: "Upgrade your account, add your content, and go live in minutes.",
          ctaLabel: "Upgrade now",
          ctaHref: "/#pricing",
        },
      },
      updatedAt: Date.now(),
    });

    return siteId;
  },
});

export const updateSite = mutation({
  args: {
    siteId: v.id("sites"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    theme: v.optional(v.any()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be signed in");
    }

    const site = await ctx.db.get(args.siteId);
    if (!site || site.identity !== buildIdentity(identity.subject)) {
      throw new Error("Not found");
    }

    await ctx.db.patch(site._id, {
      ...("name" in args ? { name: args.name } : {}),
      ...("description" in args ? { description: args.description } : {}),
      ...("theme" in args ? { theme: args.theme } : {}),
      ...("published" in args ? { published: args.published } : {}),
    });
  },
});

export const savePage = mutation({
  args: {
    siteId: v.id("sites"),
    slug: v.string(),
    title: v.string(),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be signed in");
    }

    const site = await ctx.db.get(args.siteId);
    if (!site || site.identity !== buildIdentity(identity.subject)) {
      throw new Error("Not found");
    }

    const existing = await ctx.db
      .query("pages")
      .withIndex("by_site_slug", (q) =>
        q.eq("siteId", args.siteId).eq("slug", args.slug),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        content: args.content,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return ctx.db.insert("pages", {
      siteId: args.siteId,
      slug: args.slug,
      title: args.title,
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

