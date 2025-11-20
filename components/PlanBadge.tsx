"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PlanBadge() {
  const data = useQuery(api.userPlans.getCurrentPlan, {});
  const plan = data?.plan ?? "free";

  const isPro = plan !== "free";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isPro
          ? "bg-emerald-100 text-emerald-700"
          : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {isPro ? "Pro plan" : "Free plan"}
    </span>
  );
}

