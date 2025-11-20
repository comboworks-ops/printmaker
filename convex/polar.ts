import { api } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";
import { httpAction } from "./_generated/server";

const POLAR_SIGNATURE_HEADER = "x-polar-signature";
const POLAR_EVENT_HEADER = "x-polar-event";

const textEncoder = new TextEncoder();
const cryptoApi = globalThis.crypto;

const normalizeSignature = (signature: string) => {
  const trimmed = signature.trim();
  if (!trimmed.includes("=")) {
    return trimmed;
  }

  const [, value] = trimmed.split("=", 2);
  return value ?? trimmed;
};

const hexFromBuffer = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const hmacSha256Hex = async (secret: string, payload: string) => {
  if (!cryptoApi?.subtle) {
    throw new Error("Web Crypto API unavailable");
  }

  const key = await cryptoApi.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await cryptoApi.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(payload),
  );

  return hexFromBuffer(signature);
};

const timingSafeCompare = (a: string, b: string) => {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
};

const verifySignature = async (
  payload: string,
  signature: string,
  secret: string,
) => {
  const normalized = normalizeSignature(signature);
  const expected = await hmacSha256Hex(secret, payload);
  return timingSafeCompare(expected, normalized);
};

const generateUuid = () =>
  typeof cryptoApi?.randomUUID === "function"
    ? cryptoApi.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

type PolarEvent = {
  id?: string;
  type?: string;
  data?: Record<string, unknown> | null;
};

type PolarActor = {
  id?: string;
  user_id?: string;
  email?: string;
  email_address?: string;
};

type PolarData = {
  product_id?: string;
  productId?: string;
  product?: { id?: string };
  order_id?: string;
  orderId?: string;
  customer?: PolarActor;
  user?: PolarActor;
  licensor?: PolarActor;
  order?: {
    customer?: PolarActor;
    id?: string;
  };
  customer_email?: string;
};

const extractEventMetadata = (event: PolarEvent) => {
  const data = (event?.data ?? {}) as PolarData;
  const productId =
    data?.product_id ?? data?.productId ?? data?.product?.id ?? undefined;
  const customer =
    data?.customer ??
    data?.user ??
    data?.licensor ??
    data?.order?.customer ??
    {};
  const customerEmail =
    customer?.email ?? customer?.email_address ?? data?.customer_email;

  return {
    productId,
    customerId: customer?.id ?? customer?.user_id,
    customerEmail,
  };
};

const storeEvent = async (ctx: ActionCtx, event: PolarEvent) => {
  const eventId = event.id ?? generateUuid();
  const metadata = extractEventMetadata(event);

  await ctx.runMutation(api.webhookEvents.recordEvent, {
    eventId,
    eventType: event.type ?? "untyped",
    payload: event,
    productId: metadata.productId ?? undefined,
    customerId: metadata.customerId ?? undefined,
    customerEmail: metadata.customerEmail ?? undefined,
    receivedAt: Date.now(),
  });

  return metadata;
};

const fetchPolarResource = async (path: string) => {
  const apiKey = process.env.POLAR_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch(`https://api.polar.sh/${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.warn("Polar API request failed", response.status, path);
    return null;
  }

  return response.json();
};

const handleOrderCompleted = async (ctx: ActionCtx, event: PolarEvent) => {
  const data = (event?.data ?? {}) as PolarData;
  const orderId =
    data?.order_id ?? data?.orderId ?? data?.order?.id ?? undefined;

  if (!orderId) {
    return;
  }

  const order = await fetchPolarResource(`v1/orders/${orderId}`);
  if (!order) {
    return;
  }

  await ctx.runMutation(api.webhookEvents.recordEvent, {
    eventId: `${order.id}-details`,
    eventType: "order.details",
    payload: order,
    productId: order.product_id ?? order.productId ?? undefined,
    customerId: order.customer_id ?? order.customerId ?? undefined,
    customerEmail: order.customer?.email,
    receivedAt: Date.now(),
  });
};

export const polarWebhook = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get(POLAR_SIGNATURE_HEADER);

  if (!signature || !(await verifySignature(rawBody, signature, secret))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: PolarEvent;
  try {
    event = JSON.parse(rawBody);
  } catch (error) {
    console.error("Unable to parse Polar event", error);
    return new Response("Invalid payload", { status: 400 });
  }

  const metadata = await storeEvent(ctx, event);

  const normalizedType =
    event.type ?? request.headers.get(POLAR_EVENT_HEADER) ?? "untyped";

  if (normalizedType === "order.completed") {
    await handleOrderCompleted(ctx, event);
  }

  if (metadata.customerEmail) {
    await ctx.runMutation(api.userPlans.applyPolarEvent, {
      eventType: normalizedType,
      customerEmail: metadata.customerEmail,
      productId: metadata.productId ?? undefined,
    });
  }

  return new Response("ok");
});

