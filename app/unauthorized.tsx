import Link from "next/link";

export default function Unauthorized() {
  return (
    <section className="mx-auto mt-16 max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-10 text-amber-900 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wide text-amber-700">
        401 · Unauthorized
      </p>
      <h1 className="mt-2 text-3xl font-semibold">
        You need to sign in to continue.
      </h1>
      <p className="mt-4 text-base">
        This page is protected by Clerk. Sign in to access your dashboard or
        return home.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/sign-in"
          className="rounded-full bg-amber-900 px-5 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-800"
        >
          Go to sign in
        </Link>
        <Link
          href="/"
          className="rounded-full border border-amber-300 px-5 py-2 text-sm font-semibold text-amber-900 transition hover:border-amber-400"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}

