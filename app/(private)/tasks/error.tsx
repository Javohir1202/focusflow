"use client";

import { useEffect } from "react";

export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tasks page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">Couldn&apos;t load your tasks</h1>
        <p className="mt-1 text-sm text-red-700">
          Something went wrong while fetching your tasks. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
