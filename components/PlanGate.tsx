"use client";

import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type PlanGateProps = {
  requiredPlan?: "free" | "pro";
  fallback?: ReactNode;
  children: ReactNode;
};

export default function PlanGate({ children }: PlanGateProps) {
  const data = useQuery(api.userPlans.getCurrentPlan, {});
  console.debug("plan data", data);

  // Temporary bypass while Clerk production instance is being configured.
  return <>{children}</>;
}

