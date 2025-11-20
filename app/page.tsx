import { hasClerkPublishableKey } from "@/lib/clerkConfig";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const isClerkConfigured = hasClerkPublishableKey();

  return (
    <section className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 shadow-sm">
      {isClerkConfigured ? (
        <>
          <SignedOut>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-zinc-900">
                Welcome! Let&apos;s secure this app.
              </h2>
              <p className="text-base text-zinc-600">
                Use the buttons below to create an account or sign in with Clerk.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <SignUpButton />
                <SignInButton />
              </div>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-zinc-900">
                You&apos;re signed in!
              </h2>
              <p className="text-base text-zinc-600">
                Start building protected pages by combining Clerk components
                with the Next.js App Router.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Go to dashboard →
              </Link>
            </div>
          </SignedIn>
        </>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Local development mode
          </h2>
          <p className="text-base text-zinc-600">
            Clerk isn&apos;t configured yet. Add your publishable and secret keys
            to `.env.local` to enable authentication flows.
          </p>
        </div>
      )}
    </section>
  );
}
