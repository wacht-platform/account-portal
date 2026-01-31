"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
  }, [error]);

  return (
    <html>
      <body className="bg-background">
        <div className="flex w-full h-screen items-center justify-center">
          <div className="max-w-[400px] w-full bg-surface dark:bg-zinc-900 rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <h1 className="text-xl text-foreground mb-2">System Error</h1>
              <p className="text-muted-foreground text-sm mb-6">
                We encountered a critical error. Please try refreshing the page.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.href = "/"}
                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm text-foreground bg-background dark:bg-zinc-800 border border-border hover:bg-accent dark:hover:bg-zinc-700 rounded-md transition-colors"
              >
                Go Home
              </button>
            </div>

            {error.digest && (
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}