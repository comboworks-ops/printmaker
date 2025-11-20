"use client";

import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type PlanGateProps = {
  requiredPlan?: "free" | "pro";
  fallback?: ReactNode;
  children: ReactNode;
};

export default function PlanGate({
  requiredPlan = "pro",
  fallback,
  children,
}: PlanGateProps) {
  const data = useQuery(api.userPlans.getCurrentPlan, {});
  const plan = data?.plan ?? "free";
  const email = data?.email ?? "";

  const identity = data?.identity ?? "";
  const isAdmin =
    plan !== "free" ||
    email.toLowerCase() === "cookadeligmail.com" ||
    identity.toLowerCase() === "user:user_35iulblw7u1hngpjosghz1lrlg7";

  if (requiredPlan === "free" || isAdmin) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50 p-8 text-amber-900 shadow-sm">
      <h3 className="text-xl font-semibold">Upgrade to unlock this section</h3>
      <p className="mt-2 text-sm text-amber-800">
        Complete a purchase to access the site builder and Convex-backed notes.
        <br />
        (Signed in as {email || "guest"})
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Button asChild>
          <Link href="/#pricing">View pricing</Link>
        </Button>
        <Button asChild variant="secondary">
          <a
            href="https://polar.sh/login"
            target="_blank"
            rel="noreferrer"
          >
            Upgrade via Polar
          </a>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Go back</Link>
        </Button>
      </div>
    </div>
  );
}

