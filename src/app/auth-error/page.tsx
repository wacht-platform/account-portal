"use client";

import { useSearchParams } from "next/navigation";
import { AppState } from "@/components/app-state";

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
    <AppState
      eyebrow="Authentication"
      title={errorDetails.title}
      description={errorDetails.description}
      actions={[
        { href: "/sign-in", label: "Try signing in again" },
        { href: "/", label: "Go home", variant: "secondary" },
      ]}
      meta={error ? <>Error code: {error}</> : undefined}
    />
  );
}
