const sanitizeConvexUrl = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  if (value.includes("YOUR_CONVEX")) {
    return undefined;
  }

  return value;
};

export const getConvexUrl = () =>
  sanitizeConvexUrl(process.env.NEXT_PUBLIC_CONVEX_URL);

export const hasConvexUrl = () => Boolean(getConvexUrl());

