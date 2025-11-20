import ConvexMessages from "@/components/ConvexMessages";
import PlanGate from "@/components/PlanGate";
import SiteBuilderPanel from "@/components/SiteBuilderPanel";
import { Button } from "@/components/ui/button";
import { isClerkFullyConfigured } from "@/lib/clerkConfig";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { forbidden, unauthorized } from "next/navigation";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  if (!isClerkFullyConfigured()) {
    return (
      <section className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 shadow-sm">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Authentication disabled
        </h2>
        <p className="mt-2 text-base text-zinc-600">
          Add real Clerk keys to `.env.local` and restart the dev server to test
          the protected dashboard route.
        </p>
      </section>
    );
  }

  const { userId } = await auth();

  if (!userId) {
    unauthorized();
  }

  const user = await currentUser();

  const canViewDashboardEntry =
    (user?.publicMetadata?.["canViewDashboard"] as boolean | undefined) ??
    true;

  if (!canViewDashboardEntry) {
    forbidden();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
        <div>
          <p className="text-sm font-medium text-zinc-500">Secured area</p>
          <h1 className="text-3xl font-semibold text-zinc-900">Dashboard</h1>
        </div>
        <div className="mt-6 rounded-2xl border border-zinc-100 bg-zinc-50 p-6">
          <h2 className="text-xl font-semibold text-zinc-900">
            Welcome back, {user?.firstName ?? "friend"}!
          </h2>
          <p className="mt-2 text-base text-zinc-600">
            The content on this page is rendered only after Clerk validates your
            session on the server. Use this pattern for any data that must
            remain private.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full border border-zinc-300 px-4 py-2 text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900"
          >
            ← Back home
          </Link>
          <Button asChild variant="secondary">
            <a
              href="https://polar.sh/login"
              target="_blank"
              rel="noreferrer"
            >
              Polar dashboard
            </a>
          </Button>
        </div>
      </div>
      <PlanGate>
        <div className="space-y-6">
          <SiteBuilderPanel />
          <ConvexMessages />
        </div>
      </PlanGate>
    </section>
  );
}

