"use client";

import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  const getErrorDetails = () => {
    switch (error) {
      case "access_denied":
        return {
          title: "Access Denied",
          description: "You denied access to your account. No worries, you can try signing in again."
        };
      case "invalid_request":
        return {
          title: "Invalid Request",
          description: "There was a problem with the authentication request. Please try again."
        };
      case "temporarily_unavailable":
        return {
          title: "Service Temporarily Unavailable",
          description: "The authentication service is temporarily unavailable. Please try again in a few minutes."
        };
      case "server_error":
        return {
          title: "Server Error",
          description: "We encountered a server error during authentication."
        };
      default:
        return {
          title: "Authentication Error",
          description: message || "An unexpected error occurred during authentication."
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="flex w-full h-screen items-center justify-center bg-background">
      <div className="max-w-[400px] w-full bg-surface dark:bg-zinc-900 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-2xl text-foreground mb-2">{errorDetails.title}</h1>
          <p className="text-muted-foreground text-sm mb-6">{errorDetails.description}</p>
        </div>

        <div className="space-y-3">
          <a
            href="/sign-in"
            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
          >
            Try Signing In Again
          </a>

          <a
            href="/"
            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm text-foreground bg-background dark:bg-zinc-800 border border-border hover:bg-accent dark:hover:bg-zinc-700 rounded-md transition-colors"
          >
            Go Home
          </a>
        </div>

        {error && (
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Error code: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}