const isRealKey = (value: string | undefined | null, prefix: string) => {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.startsWith("YOUR_")) {
    return false;
  }

  return trimmed.startsWith(prefix);
};

export const hasClerkPublishableKey = () =>
  isRealKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, "pk_");

export const hasClerkSecretKey = () =>
  isRealKey(process.env.CLERK_SECRET_KEY, "sk_");

export const getClerkPublishableKey = () =>
  hasClerkPublishableKey() ? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY : undefined;

export const isClerkFullyConfigured = () =>
  hasClerkPublishableKey() && hasClerkSecretKey();

