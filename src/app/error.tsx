"use client";

import { useEffect } from "react";
import { AppState } from "@/components/app-state";
import { isIgnorablePortalError } from "@/lib/errors";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const ignoreError = isIgnorablePortalError(error);

  useEffect(() => {
    if (ignoreError) {
      reset();
    }
  }, [ignoreError, reset]);

  if (ignoreError) {
    return null;
  }

  return (
    <AppState
      eyebrow="Portal error"
      title="Something went wrong"
      description="The portal hit an unexpected error. Try the action again or return to the start page."
      actions={[
        { label: "Try again", onClick: reset },
        { href: "/", label: "Go home", variant: "secondary" },
      ]}
      meta={error.digest ? <>Error ID: {error.digest}</> : undefined}
    />
  );
}
