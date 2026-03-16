"use client";

import { useEffect } from "react";
import { AppState } from "@/components/app-state";
import { isIgnorablePortalError } from "@/lib/errors";

export default function GlobalError({
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
        <html>
            <body className="bg-background">
                <AppState
                    eyebrow="Something went wrong"
                    title="Something went wrong. Try again."
                    description="A critical error interrupted this request. Refresh or return to the start page."
                    actions={[
                        { label: "Try again", onClick: reset },
                        { href: "/", label: "Go home", variant: "secondary" },
                    ]}
                    meta={
                        error.digest ? <>Error ID: {error.digest}</> : undefined
                    }
                />
            </body>
        </html>
    );
}
