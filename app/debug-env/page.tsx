export const dynamic = "force-dynamic";

export default function DebugEnvPage() {
  const hasPublishable = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasSecret = !!process.env.CLERK_SECRET_KEY;
  const secretLength = process.env.CLERK_SECRET_KEY?.length ?? 0;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  return (
    <div className="p-10 font-mono space-y-4">
      <h1 className="text-xl font-bold">Environment Debugger</h1>
      <div>
        <strong>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:</strong>{" "}
        {hasPublishable ? "✅ Present" : "❌ MISSING"}
      </div>
      <div>
        <strong>CLERK_SECRET_KEY:</strong>{" "}
        {hasSecret ? `✅ Present (Length: ${secretLength})` : "❌ MISSING"}
      </div>
      <div>
        <strong>NEXT_PUBLIC_CONVEX_URL:</strong>{" "}
        {convexUrl ? `✅ ${convexUrl}` : "❌ MISSING"}
      </div>
      <div className="text-sm text-gray-500 mt-8">
        (This page is for debugging only. Delete after use.)
      </div>
    </div>
  );
}

