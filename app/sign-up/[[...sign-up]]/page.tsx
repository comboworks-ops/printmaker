import { hasClerkPublishableKey } from "@/lib/clerkConfig";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export const metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  const isReady = hasClerkPublishableKey();

  if (!isReady) {
    return (
      <section className="mx-auto mt-16 max-w-xl rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-zinc-900 shadow-sm">
        <h1 className="text-3xl font-semibold">Clerk isn&apos;t configured yet</h1>
        <p className="mt-4 text-base text-zinc-600">
          Add your real `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to `.env.local` and restart
          the dev server to load the hosted sign-up experience.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-400"
          >
            ← Back home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}

