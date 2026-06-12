"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    NavigateToSignIn,
    SignedIn,
    SignedInAccounts,
    SignedOut,
    useClient,
    useDeployment,
    useSession,
} from "@wacht/nextjs";
import { AppState } from "@/components/app-state";

/// Keyed by handoff_id (URL query): set when we've already forced re-auth for
/// this OAuth flow once. Prevents an infinite signOut→signIn→signOut loop
/// when the RP keeps `prompt=login` on the request.
function promptLoginEnforcedKey(): string | null {
    if (typeof window === "undefined") return null;
    const id = new URLSearchParams(window.location.search).get("handoff_id");
    return id ? `wacht.oauth.prompt-login.${id}` : null;
}

/// Mirrors @wacht/jsx's `getStoredDevSession` scope→key derivation so we
/// pick up the correct host-scoped dev_session that the SDK is rotating on
/// every API response. Reading the bare `__dev_session__` key returns either
/// nothing or a stale value because the SDK writes to a scoped variant.
function readDevSession(scopeHost: string | null | undefined): string | null {
    if (typeof window === "undefined") return null;
    const value = (scopeHost ?? "").trim();
    let normalized: string | null = null;
    if (value) {
        try {
            const parsed = new URL(value.includes("://") ? value : `https://${value}`);
            normalized = parsed.host.toLowerCase();
        } catch {
            normalized = value.toLowerCase().replace(/\/+$/, "");
        }
    }
    const suffix = normalized
        ? `_${normalized.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 64)}`
        : "";
    const scopedKey = `__dev_session__${suffix}`;
    return (
        window.localStorage.getItem(scopedKey) ||
        window.localStorage.getItem("__dev_session__") ||
        null
    );
}

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
    /** Space-separated OIDC `prompt` values from the RP. */
    prompt?: string | null;
    max_age?: number | null;
    /** True when the user has already granted these scopes/resource. */
    grant_already_covers?: boolean;
    /** Canonical resource URN to auto-approve against. */
    auto_approve_resource?: string | null;
};

function parsePromptValues(prompt: string | null | undefined): Set<string> {
    return new Set((prompt ?? "").split(/\s+/).filter(Boolean));
}

const OIDC_STANDARD_SCOPES = new Set([
    "openid",
    "profile",
    "email",
    "offline_access",
]);

/// True when every requested scope is purely OIDC identity (no Wacht
/// tenant-data scopes). In that case there's nothing meaningful to pick a
/// resource for — the user is the resource.
function isIdentityOnlyRequest(scopes: string[] | undefined): boolean {
    if (!scopes?.length) return false;
    return scopes.every((s) => OIDC_STANDARD_SCOPES.has(s));
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
        <li className="flex items-start gap-3 py-2">
            <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{
                    background: "var(--wa-primary-soft)",
                    color: "var(--wa-primary)",
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
                    style={{ color: "var(--wa-text)" }}
                >
                    {label || scope}
                </p>
                <p
                    className="text-[11px] leading-5"
                    style={{ color: "var(--wa-text-muted)" }}
                >
                    {description?.trim() || scope}
                </p>
            </div>
        </li>
    );
}

function LoadingSkeleton() {
    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-10"
            style={{ background: "var(--wa-background)", color: "var(--wa-text)" }}
        >
            <div className="w-card w-auth-card">
                <div className="w-create-body">
                    <div className="w-auth-skel" aria-hidden="true">
                        <div className="w-auth-skel-head">
                            <span className="w-skel w-skel-avatar" />
                            <span className="w-skel w-skel-title" />
                            <span className="w-skel w-skel-sub" />
                        </div>
                        <div className="w-auth-skel-fields">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span
                                        className="w-skel shrink-0"
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: "50%",
                                        }}
                                    />
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <span
                                            className="w-skel"
                                            style={{ height: 11, width: "58%" }}
                                        />
                                        <span
                                            className="w-skel"
                                            style={{ height: 9, width: "78%" }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-3 pt-1">
                                <span className="w-skel w-skel-btn flex-1" />
                                <span className="w-skel w-skel-btn flex-1" />
                            </div>
                        </div>
                    </div>
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
        <button type="submit" className="w-btn w-btn--secondary w-btn--block">
            {children}
        </button>
    );
}

function PrimaryActionButton({ children }: { children: React.ReactNode }) {
    return (
        <button type="submit" className="w-btn w-btn--primary w-btn--block">
            {children}
        </button>
    );
}

export default function OAuthConsentPage() {
    const { client, loading: clientLoading } = useClient();
    const { deployment } = useDeployment();
    const { signOut } = useSession();
    const logoUrl = deployment?.ui_settings?.logo_image_url ?? null;
    const didLoadRef = useRef(false);
    const autoSubmittedRef = useRef(false);
    const forcedReauthRef = useRef(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [context, setContext] = useState<ConsentContext | null>(null);
    const [selectedResource, setSelectedResource] = useState<string>("");
    // OIDC `prompt=select_account`: render the account picker once, then
    // continue to the consent UI for the chosen signin.
    const [accountPicked, setAccountPicked] = useState(false);

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
                const options = payload?.resource_options ?? [];
                // Identity-only OIDC requests always grant against the
                // personal user resource — find it in the options rather
                // than defaulting to options[0] which can be an org/workspace
                // when the user has multiple memberships.
                const userResource =
                    options.find(
                        (o: { type: string; value: string }) =>
                            o.type === "user",
                    )?.value ?? options[0]?.value ?? "";
                setSelectedResource(
                    isIdentityOnlyRequest(payload?.scopes)
                        ? userResource
                        : (options[0]?.value ?? ""),
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

    const prompts = useMemo(
        () => parsePromptValues(context?.prompt),
        [context],
    );
    const wantsSelectAccount = prompts.has("select_account") && !accountPicked;
    // Auto-submit fires when the RP requested no UI (`prompt=none`) OR when
    // the user already consented to these scopes/resource before — except
    // `prompt=consent` forces the UI regardless of prior coverage.
    const wantsAutoSubmit =
        prompts.has("none") ||
        (Boolean(context?.grant_already_covers) && !prompts.has("consent"));
    // `prompt=login` is satisfied as soon as we've forced one re-auth for
    // this handoff (sessionStorage marker survives the sign-in round trip).
    const needsForceLogin = useMemo(() => {
        if (!prompts.has("login")) return false;
        const key = promptLoginEnforcedKey();
        if (!key || typeof window === "undefined") return true;
        return !window.sessionStorage.getItem(key);
    }, [prompts]);

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

    // Not memoized: dev_session rotates on sign-in, so a value captured at
    // mount time goes stale across the sign-in round trip. Reading the
    // host-scoped storage key (same one the SDK writes to on every API
    // response) picks up the latest rotated token.
    const submitUrl = (() => {
        if (!deployment) return "";
        const rawHost = (deployment.backend_host || "").trim();
        if (!rawHost) return "";
        const backendBase =
            rawHost.startsWith("http://") || rawHost.startsWith("https://")
                ? rawHost
                : `https://${rawHost}`;
        const url = new URL("/oauth/consent/submit", backendBase);
        if (deployment.mode === "staging") {
            const devSession = readDevSession(rawHost);
            if (devSession) {
                url.searchParams.set("__dev_session__", devSession);
            }
        }
        return url.toString();
    })();

    // `prompt=login`: force a fresh sign-in even if a session exists. signOut
    // flips us into `<SignedOut>` which renders `<NavigateToSignIn />` —
    // that preserves the current URL, so re-auth lands the user back here
    // with the sessionStorage marker set, satisfying the prompt.
    useEffect(() => {
        if (loading || !context || !needsForceLogin) return;
        if (forcedReauthRef.current) return;
        forcedReauthRef.current = true;
        const flagKey = promptLoginEnforcedKey();
        if (flagKey) window.sessionStorage.setItem(flagKey, "1");
        void signOut();
    }, [loading, context, needsForceLogin, signOut]);

    // Auto-submit cases:
    //   1. `prompt=none` — RP asked for no UI. If platform-api can't issue
    //      a code, it redirects with the spec error; nothing we do here
    //      changes that outcome.
    //   2. `grant_already_covers` — the user previously consented and the
    //      RP didn't override with `prompt=consent`. Frontend-api already
    //      picked the right canonical resource (`auto_approve_resource`).
    useEffect(() => {
        if (!wantsAutoSubmit || !context || !submitUrl) return;
        if (wantsSelectAccount) return;
        if (autoSubmittedRef.current) return;
        // Pick the resource: auto-approve helper wins, then the selector
        // value, finally bail when there are options but nothing is chosen.
        const grantedResource = context.auto_approve_resource || selectedResource;
        if (!grantedResource && (context.resource_options?.length ?? 0) > 0) {
            return;
        }
        autoSubmittedRef.current = true;
        const form = document.createElement("form");
        form.method = "POST";
        form.action = submitUrl;
        const fields: Array<[string, string]> = [
            ["action", "approve"],
            ["csrf_token", context.csrf_token],
            ["granted_resource", grantedResource],
        ];
        for (const [name, value] of fields) {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = value;
            form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
    }, [
        wantsAutoSubmit,
        wantsSelectAccount,
        context,
        submitUrl,
        selectedResource,
    ]);

    return (
        <>
            <SignedOut>
                <NavigateToSignIn />
            </SignedOut>
            <SignedIn>
                {loading || needsForceLogin ? (
                    <LoadingSkeleton />
                ) : error || !context ? (
                    <ErrorState />
                ) : wantsSelectAccount ? (
                    <div className="min-h-screen flex items-center justify-center px-4 py-10">
                        <SignedInAccounts
                            onAccountSelect={() => setAccountPicked(true)}
                        />
                    </div>
                ) : wantsAutoSubmit ? (
                    <LoadingSkeleton />
                ) : (
                    <div
                        className="min-h-screen flex items-center justify-center px-4 py-10"
                        style={{
                            background: "var(--wa-background)",
                            color: "var(--wa-text)",
                        }}
                    >
                        <div className="w-card w-auth-card">
                            <div className="px-6 pt-7 pb-4 text-center">
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt=""
                                        className="mx-auto mb-3 h-9 w-auto max-w-30 object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                ) : null}
                                <h1
                                    className="truncate w-auth-title"
                                    style={{ fontSize: 18 }}
                                >
                                    {displayName}
                                </h1>
                                <p className="mt-1.5 w-auth-sub">
                                    is requesting access to
                                </p>
                            </div>

                            <div className="px-6 py-2 space-y-1.5">
                                <p
                                    className="text-[12px] font-normal uppercase tracking-wide"
                                    style={{ color: "var(--wa-text-muted)" }}
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

                            {(context.resource_options?.length ?? 0) > 0 &&
                            !isIdentityOnlyRequest(context.scopes) ? (
                                <>
                                    <hr className="w-hr" />
                                    <div className="px-6 py-4 space-y-2">
                                        <p
                                            className="text-[12px] font-normal uppercase tracking-wide"
                                            style={{ color: "var(--wa-text-muted)" }}
                                        >
                                            Grant access to
                                        </p>
                                        <div className="relative">
                                            <select
                                                className="w-input appearance-none pr-9"
                                                name="granted_resource"
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
                                            <span
                                                className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                                                style={{
                                                    color: "var(--wa-text-muted)",
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

                            <hr className="w-hr" />

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
                                    className="text-center text-[11px] leading-5"
                                    style={{ color: "var(--wa-text-muted)" }}
                                >
                                    {context.redirect_uri ? (
                                        <>
                                            Next destination{" "}
                                            <span style={{ color: "var(--wa-text)" }}>
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
