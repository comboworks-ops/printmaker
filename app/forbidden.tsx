import Link from "next/link";

export default function Forbidden() {
  return (
    <section className="mx-auto mt-16 max-w-xl rounded-3xl border border-rose-200 bg-rose-50 p-10 text-rose-900 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wide text-rose-700">
        403 · Forbidden
      </p>
      <h1 className="mt-2 text-3xl font-semibold">You don&apos;t have access.</h1>
      <p className="mt-4 text-base">
        You are signed in, but your account lacks the permissions required to
        view this page. Contact an administrator if you believe this is a
        mistake.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full bg-rose-900 px-5 py-2 text-sm font-semibold text-rose-50 transition hover:bg-rose-800"
        >
          Return home
        </Link>
        <Link
          href="mailto:support@example.com"
          className="rounded-full border border-rose-300 px-5 py-2 text-sm font-semibold text-rose-900 transition hover:border-rose-400"
        >
          Contact support
        </Link>
      </div>
    </section>
  );
}

