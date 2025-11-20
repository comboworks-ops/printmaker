"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const POLAR_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL ?? "https://polar.sh/login";

export function PolarCheckoutButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="secondary"
      onClick={() => {
        setLoading(true);
        window.open(POLAR_CHECKOUT_URL, "_blank", "noreferrer");
        setTimeout(() => setLoading(false), 1000);
      }}
      disabled={loading}
    >
      {loading ? "Opening..." : "Upgrade via Polar"}
    </Button>
  );
}

