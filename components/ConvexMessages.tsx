"use client";

import { hasConvexUrl } from "@/lib/convexConfig";
import { useState } from "react";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "@/convex/_generated/api";

const ConvexNotConfigured = () => (
  <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
    Convex isn&apos;t configured yet. Set a real `NEXT_PUBLIC_CONVEX_URL`
    pointing to your deployment to see live data here.
  </div>
);

function MessageList() {
  const messages = useQuery(api.messages.list);

  if (!messages) {
    return <p className="text-sm text-zinc-500">Loading messages…</p>;
  }

  if (messages.length === 0) {
    return <p className="text-sm text-zinc-500">No notes yet. Add one!</p>;
  }

  return (
    <ul className="space-y-3">
      {messages.map((message) => (
        <li
          key={message._id}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3"
        >
          <p className="text-sm text-zinc-900">{message.text}</p>
          <p className="text-xs text-zinc-400">
            {new Date(message.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}

function MessageComposer() {
  const [value, setValue] = useState("");
  const createMessage = useMutation(api.messages.create);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!value.trim()) {
      return;
    }

    await createMessage({ text: value.trim() });
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="convex-note" className="text-sm font-medium text-zinc-700">
        Quick note
      </label>
      <textarea
        id="convex-note"
        className="w-full rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none"
        rows={3}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Type something and press Save"
      />
      <button
        type="submit"
        className="self-start rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        disabled={!value.trim()}
      >
        Save note
      </button>
    </form>
  );
}

export default function ConvexMessages() {
  if (!hasConvexUrl()) {
    return <ConvexNotConfigured />;
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">
        Convex-backed notes
      </h2>
      <AuthLoading>
        <p className="text-sm text-zinc-500">Checking Convex session…</p>
      </AuthLoading>
      <Unauthenticated>
        <p className="text-sm text-zinc-600">
          Sign in to Clerk to save notes in Convex.
        </p>
      </Unauthenticated>
      <Authenticated>
        <MessageComposer />
        <MessageList />
      </Authenticated>
    </div>
  );
}

