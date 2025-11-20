"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PlanSync() {
  const { isSignedIn, user } = useUser();
  const syncPlan = useMutation(api.userPlans.syncCurrentUserPlan);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isSignedIn || hasSynced.current) {
      return;
    }

    const email = user?.primaryEmailAddress?.emailAddress;

    syncPlan({
      email: email ?? undefined,
    })
      .catch((error) => {
        console.error("Failed to sync plan", error);
      })
      .finally(() => {
        hasSynced.current = true;
      });
  }, [isSignedIn, user?.primaryEmailAddress?.emailAddress, syncPlan]);

  return null;
}

