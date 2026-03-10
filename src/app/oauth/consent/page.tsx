"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    NavigateToSignIn,
    SignedIn,
    SignedOut,
    useClient,
    useDeployment,
} from "@wacht/nextjs";
import { AppState } from "@/components/app-state";

type ConsentContext = {
    client_name?: string | null;
    client_id: string;
    redirect_uri: string;
    scopes: string[];
    scope_definitions?: Array<{
        scope: string;
        display_name: string;
        description: string;
        required: boolean;
        archived?: boolean;
    }>;
    resource?: string | null;
    resource_options?: Array<{
        value: string;
        type: "user" | "organization" | "workspace";
        id: string;
        label: string;
    }>;
    state?: string | null;
    expires_at: number;
    csrf_token: string;
};

function ScopeRow({
    scope,
    displayName,
    description,
}: {
    scope: string;
    displayName?: string;
    description?: string;
}) {
    const label =
        displayName?.trim() ||
        scope
            .split(/[_:.-]/g)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");

    return (
        <li
            className="flex items-start gap-3 py-2"
            style={{
                borderTopColor:
                    "color-mix(in srgb, var(--color-border, var(--border)) 55%, transparent)",
            }}
        >
            <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{
                    background: "var(--color-primary-background)",
                    color: "var(--color-primary, var(--primary))",
                }}
            >
                <svg
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M2 6.5L4.5 9L10 3"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            <div className="min-w-0">
                <p
                    className="text-[13px] font-normal leading-5"
                    style={{
                        color: "var(--color-foreground, var(--foreground))",
                    }}
                >
                    {label || scope}
                </p>
                <p
                    className="text-[11px] leading-5"
                    style={{
                        color: "var(--color-secondary-text, var(--muted-foreground))",
                    }}
                >
                    {description?.trim() || scope}
                </p>
            </div>
        </li>
    );
}

function SkeletonLine({ w, h = "h-4" }: { w: string; h?: string }) {
    return (
        <div
            className={`${h} ${w} animate-pulse rounded-full`}
            style={{
                background:
                    "var(--color-background-hover, var(--color-accent, var(--accent)))",
            }}
        />
    );
}

function LoadingSkeleton() {
    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-10"
            style={{
                background: "var(--color-background, var(--background))",
                color: "var(--color-foreground, var(--foreground))",
            }}
        >
            <div
                className="w-full max-w-[380px] space-y-6 overflow-hidden rounded-[var(--radius-lg)] border p-6"
                style={{
                    borderColor: "var(--color-border, var(--border))",
                    background: "var(--color-card, var(--surface))",
                    boxShadow: "var(--shadow-md)",
                }}
            >
                <div className="space-y-2 text-center">
                    <SkeletonLine w="mx-auto w-16" h="h-3" />
                    <SkeletonLine w="mx-auto w-32" h="h-5" />
                    <SkeletonLine w="mx-auto w-52" h="h-4" />
                </div>

                <div className="flex items-center gap-4">
                    <div
                        className="h-10 w-10 shrink-0 animate-pulse rounded-xl"
                        style={{
                            background:
                                "var(--color-background-hover, var(--color-accent, var(--accent)))",
                        }}
                    />
                    <div className="space-y-2">
                        <SkeletonLine w="w-52" h="h-5" />
                        <SkeletonLine w="w-64" h="h-4" />
                    </div>
                </div>

                <div className="space-y-2">
                    <SkeletonLine w="w-36" h="h-4" />
                    <div className="space-y-2 pt-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div
                                    className="h-5 w-5 shrink-0 rounded-full animate-pulse"
                                    style={{
                                        background:
                                            "var(--color-primary-background)",
                                    }}
                                />
                                <div className="space-y-1.5">
                                    <SkeletonLine w="w-40" />
                                    <SkeletonLine w="w-52" h="h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-1">
                    <div
                        className="h-9 flex-1 animate-pulse rounded-[var(--radius-lg)]"
                        style={{
                            background:
                                "var(--color-background-hover, var(--color-accent, var(--accent)))",
                        }}
                    />
                    <div
                        className="h-9 flex-1 animate-pulse rounded-[var(--radius-lg)]"
                        style={{
                            background:
                                "var(--color-background-hover, var(--color-accent, var(--accent)))",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

function ErrorState() {
    return (
        <AppState
            eyebrow="OAuth"
            title="Failed to load consent"
            description="The consent request could not be loaded. Restart the OAuth flow from the application and try again."
            actions={[{ href: "/", label: "Go home", variant: "secondary" }]}
        />
    );
}

function SecondaryActionButton({ children }: { children: React.ReactNode }) {
    return (
        <button
            type="submit"
            className="h-9 w-full rounded-[var(--radius-lg)] px-4 text-sm font-normal transition-opacity hover:opacity-90"
            style={{
                color: "var(--color-foreground, var(--foreground))",
                border: "var(--border-width-thin, 1px) solid var(--color-border, var(--border))",
                background: "transparent",
            }}
        >
            {children}
        </button>
    );
}

function PrimaryActionButton({ children }: { children: React.ReactNode }) {
    return (
        <button
            type="submit"
            className="h-9 w-full rounded-[var(--radius-lg)] px-4 text-sm font-normal transition-opacity hover:opacity-90"
            style={{
                background: "var(--color-primary, var(--primary))",
                color: "var(--color-primary-foreground, #ffffff)",
            }}
        >
            {children}
        </button>
    );
}

export default function OAuthConsentPage() {
    const { client, loading: clientLoading } = useClient();
    const { deployment } = useDeployment();
    const logoUrl = deployment?.ui_settings?.logo_image_url ?? null;
    const didLoadRef = useRef(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [context, setContext] = useState<ConsentContext | null>(null);
    const [selectedResource, setSelectedResource] = useState<string>("");

    useEffect(() => {
        const load = async () => {
            if (clientLoading || didLoadRef.current) return;
            didLoadRef.current = true;

            const res = await client("/oauth/consent/details", {
                method: "GET",
            });
            const body = await res.json().catch(() => null);

            if (res.ok) {
                const payload = body?.data ? body.data : body;
                setContext(payload as ConsentContext);
                setSelectedResource(
                    (payload?.resource_options?.[0]?.value as
                        | string
                        | undefined) || "",
                );
                setError(null);
                setLoading(false);
                return;
            }

            setError("Something went wrong. Please try again later.");
            setLoading(false);
        };

        void load();
    }, [client, clientLoading]);

    const displayName = useMemo(() => {
        const name = context?.client_name?.trim();
        if (name) return name;
        return context?.client_id ?? "Unknown client";
    }, [context]);

    const scopeItems = useMemo(() => {
        const byScope = new Map(
            (context?.scope_definitions || []).map((definition) => [
                definition.scope,
                definition,
            ]),
        );
        return (context?.scopes || []).map((scope) => {
            const definition = byScope.get(scope);
            return {
                scope,
                displayName: definition?.display_name,
                description: definition?.description,
            };
        });
    }, [context]);

    const submitUrl = useMemo(() => {
        if (!deployment) return "";
        const rawHost = (deployment.backend_host || "").trim();
        if (!rawHost) return "";
        const backendBase =
            rawHost.startsWith("http://") || rawHost.startsWith("https://")
                ? rawHost
                : `https://${rawHost}`;
        const url = new URL("/oauth/consent/submit", backendBase);
        if (deployment.mode === "staging") {
            const devSession = (
                localStorage.getItem("__dev_session__") || ""
            ).trim();
            if (devSession) {
                url.searchParams.set("__dev_session__", devSession);
            }
        }
        return url.toString();
    }, [deployment]);

    return (
        <>
            <SignedOut>
                <NavigateToSignIn />
            </SignedOut>
            <SignedIn>
                {loading ? (
                    <LoadingSkeleton />
                ) : error || !context ? (
                    <ErrorState />
                ) : (
                    <div
                        className="min-h-screen flex items-center justify-center px-4 py-10"
                        style={{
                            background:
                                "var(--color-background, var(--background))",
                            color: "var(--color-foreground, var(--foreground))",
                        }}
                    >
                        <div
                            className="w-full max-w-95 overflow-hidden rounded-lg border"
                            style={{
                                borderColor:
                                    "var(--color-border, var(--border))",
                                background: "var(--color-card, var(--surface))",
                                boxShadow: "var(--shadow-md)",
                            }}
                        >
                            <div className="px-6 pt-6 pb-2 text-center">
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt="Logo"
                                        className="mx-auto mb-2 h-9 w-auto max-w-30 object-contain"
                                    />
                                ) : null}
                                <h1
                                    className="mt-2 text-lg font-normal"
                                    style={{
                                        color: "var(--color-foreground, var(--foreground))",
                                    }}
                                >
                                    Authorize access
                                </h1>
                                <p
                                    className="mt-1.5 text-sm"
                                    style={{
                                        color: "var(--color-secondary-text, var(--muted-foreground))",
                                    }}
                                >
                                    Review the permissions below before
                                    continuing.
                                </p>
                            </div>

                            <div className="px-6 py-3">
                                <div className="min-w-0 space-y-0.5">
                                    <h2
                                        className="truncate text-sm font-normal"
                                        style={{
                                            color: "var(--color-foreground, var(--foreground))",
                                        }}
                                    >
                                        {displayName}
                                    </h2>
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-secondary-text, var(--muted-foreground))",
                                        }}
                                    >
                                        is requesting permission to access your
                                        account.
                                    </p>
                                </div>
                            </div>

                            <div className="px-6 py-4 space-y-1.5">
                                <p
                                    className="text-[14px] font-normal"
                                    style={{
                                        color: "var(--color-secondary-text, var(--muted-foreground))",
                                    }}
                                >
                                    Permissions requested
                                </p>
                                <ul>
                                    {scopeItems.map((item) => (
                                        <ScopeRow
                                            key={item.scope}
                                            scope={item.scope}
                                            displayName={item.displayName}
                                            description={item.description}
                                        />
                                    ))}
                                </ul>
                            </div>

                            {(context.resource_options?.length ?? 0) > 0 ? (
                                <>
                                    <hr
                                        style={{
                                            borderColor:
                                                "var(--color-border, var(--border))",
                                        }}
                                    />
                                    <div className="px-6 py-4 space-y-2">
                                        <p
                                            className="text-xs font-normal"
                                            style={{
                                                color: "var(--color-secondary-text, var(--muted-foreground))",
                                            }}
                                        >
                                            Grant access to
                                        </p>
                                        <div className="relative">
                                            <select
                                                className="h-9 w-full appearance-none rounded-lg border px-3 pr-9 text-sm outline-none transition"
                                                name="granted_resource"
                                                value={selectedResource}
                                                onChange={(e) =>
                                                    setSelectedResource(
                                                        e.target.value,
                                                    )
                                                }
                                                style={{
                                                    borderColor:
                                                        "var(--color-input-border, var(--color-border, var(--border)))",
                                                    background:
                                                        "var(--color-input-background, var(--color-card, var(--surface)))",
                                                    color: "var(--color-foreground, var(--foreground))",
                                                }}
                                            >
                                                {context.resource_options?.map(
                                                    (option) => (
                                                        <option
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <span
                                                className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                                                style={{
                                                    color: "var(--color-secondary-text, var(--muted-foreground))",
                                                }}
                                            >
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 20 20"
                                                    fill="none"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        d="M5 7.5L10 12.5L15 7.5"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : null}

                            <hr
                                style={{
                                    borderColor:
                                        "var(--color-border, var(--border))",
                                }}
                            />

                            <div className="px-6 py-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <form
                                        method="POST"
                                        action={submitUrl}
                                        className="flex-1"
                                    >
                                        <input
                                            type="hidden"
                                            name="action"
                                            value="deny"
                                        />
                                        <input
                                            type="hidden"
                                            name="csrf_token"
                                            value={context.csrf_token}
                                        />
                                        <SecondaryActionButton>
                                            Deny
                                        </SecondaryActionButton>
                                    </form>
                                    <form
                                        method="POST"
                                        action={submitUrl}
                                        className="flex-1"
                                    >
                                        <input
                                            type="hidden"
                                            name="action"
                                            value="approve"
                                        />
                                        <input
                                            type="hidden"
                                            name="csrf_token"
                                            value={context.csrf_token}
                                        />
                                        <input
                                            type="hidden"
                                            name="granted_resource"
                                            value={selectedResource}
                                        />
                                        <PrimaryActionButton>
                                            Allow access
                                        </PrimaryActionButton>
                                    </form>
                                </div>

                                <p
                                    className="text-center text-[11px]"
                                    style={{
                                        color: "var(--color-secondary-text, var(--muted-foreground))",
                                    }}
                                >
                                    {context.redirect_uri ? (
                                        <>
                                            Next destination{" "}
                                            <span
                                                style={{
                                                    color: "var(--color-foreground, var(--foreground))",
                                                }}
                                            >
                                                {context.redirect_uri}
                                            </span>
                                            .
                                        </>
                                    ) : (
                                        "Only authorize applications you trust."
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </SignedIn>
        </>
    );
}
