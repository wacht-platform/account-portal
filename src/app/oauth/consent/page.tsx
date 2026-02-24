"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    NavigateToSignIn,
    SignedIn,
    SignedOut,
    useClient,
    useDeployment,
} from "@wacht/nextjs";

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
};

function AppAvatar({
    name,
    logoUrl,
}: {
    name: string;
    logoUrl?: string | null;
}) {
    const initial = (name ?? "A").slice(0, 1).toUpperCase();
    if (logoUrl) {
        return (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
                <img
                    src={logoUrl}
                    alt={name}
                    className="h-full w-full object-contain p-1.5"
                />
            </div>
        );
    }
    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-700 text-base font-normal dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            {initial}
        </div>
    );
}

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
        <li className="flex items-start gap-3 py-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
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
                <p className="text-sm font-normal text-foreground leading-5">
                    {label || scope}
                </p>
                {description?.trim() ? (
                    <p className="text-xs text-muted-foreground leading-5">
                        {description}
                    </p>
                ) : (
                    <p className="text-xs text-muted-foreground leading-5">
                        {scope}
                    </p>
                )}
            </div>
        </li>
    );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonLine({ w, h = "h-4" }: { w: string; h?: string }) {
    return (
        <div
            className={`${h} ${w} animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800`}
        />
    );
}

function LoadingSkeleton({ logoUrl }: { logoUrl?: string | null }) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
            <div className="w-full max-w-[420px] rounded-2xl border border-neutral-200 bg-surface shadow-sm dark:border-neutral-800 px-4 py-4 space-y-4">
                <div className="flex items-center gap-3">
                    {logoUrl && (
                        <div className="h-6 w-12 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                    )}
                    <SkeletonLine w="w-32" h="h-5" />
                </div>

                <div className="flex items-center gap-4 border-y border-neutral-200 py-4 dark:border-neutral-800">
                    <div className="h-14 w-14 rounded-xl animate-pulse bg-neutral-200 dark:bg-neutral-800 shrink-0" />
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
                                <div className="h-5 w-5 rounded-full animate-pulse bg-neutral-200 dark:bg-neutral-800 shrink-0" />
                                <div className="space-y-1.5">
                                    <SkeletonLine w="w-40" />
                                    <SkeletonLine w="w-52" h="h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <div className="h-10 flex-1 rounded-lg animate-pulse bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-10 flex-1 rounded-lg animate-pulse bg-neutral-200 dark:bg-neutral-800" />
                </div>
            </div>
        </div>
    );
}

// ── Error ─────────────────────────────────────────────────────────────────────

function ErrorCard() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
            <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-surface shadow-sm dark:border-neutral-800 px-4 py-4 space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                            stroke="#ef4444"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <div className="space-y-1">
                    <h2 className="text-base font-normal text-foreground">
                        Failed to load consent
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Please restart the OAuth flow from the application.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

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
                    (payload?.resource as string | undefined) ||
                        (payload?.resource_options?.[0]?.value as
                            | string
                            | undefined) ||
                        "",
                );
                setError(null);
                setLoading(false);
                return;
            } else {
                setError("Somehting went wrong. Please try again later.");
                setLoading(false);
            }
        };

        void load();
    }, [clientLoading]);

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
                    <LoadingSkeleton logoUrl={logoUrl} />
                ) : error ? (
                    <ErrorCard />
                ) : !context ? (
                    <ErrorCard />
                ) : (
                    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
                        <div className="w-full max-w-[420px] rounded-2xl border border-neutral-200 bg-surface shadow-sm dark:border-neutral-800 overflow-hidden">
                            <div className="px-4 pt-4 pb-3 flex items-center gap-3">
                                {logoUrl && (
                                    <img
                                        src={logoUrl}
                                        alt="Logo"
                                        className="h-6 w-auto object-contain max-w-[120px]"
                                    />
                                )}
                                <h1 className="text-lg font-normal text-foreground">
                                    Authorize access
                                </h1>
                            </div>

                            <div className="border-y border-neutral-200 px-4 py-4 dark:border-neutral-800">
                                <div className="flex items-center gap-3">
                                    <AppAvatar name={displayName} />
                                    <div className="space-y-0.5 min-w-0">
                                        <h2 className="text-sm font-normal text-foreground truncate">
                                            {displayName}
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            is requesting permission to access
                                            your account.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 py-4 space-y-2">
                                <p className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                                    Permissions requested
                                </p>
                                <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
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

                            {(context.resource_options?.length ?? 0) > 0 && (
                                <>
                                    <hr className="border-neutral-200 dark:border-neutral-800" />
                                    <div className="px-4 py-4 space-y-1.5">
                                        <p className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                                            Grant access to
                                        </p>
                                        <div className="relative">
                                            <select
                                                className="w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 pr-9 text-sm text-neutral-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                                name="resource"
                                                value={selectedResource}
                                                onChange={(e) =>
                                                    setSelectedResource(
                                                        e.target.value,
                                                    )
                                                }
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
                                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-500">
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
                            )}

                            <hr className="border-neutral-200 dark:border-neutral-800" />

                            <div className="px-4 py-4 space-y-2.5">
                                <div className="flex items-center gap-2">
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
                                        <button
                                            type="submit"
                                            className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-normal text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            Deny
                                        </button>
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
                                            name="resource"
                                            value={selectedResource}
                                        />
                                        <button
                                            type="submit"
                                            className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-normal text-white hover:bg-blue-500 active:bg-blue-700 transition-colors"
                                        >
                                            Allow access
                                        </button>
                                    </form>
                                </div>

                                <p className="text-center text-[11px] text-muted-foreground">
                                    {context.redirect_uri ? (
                                        <>
                                            Approving will redirect you to{" "}
                                            <span className="text-foreground">
                                                {context.redirect_uri}
                                            </span>
                                            .{" "}
                                        </>
                                    ) : (
                                        "Only authorize apps you trust."
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
