import type { ReactNode } from "react";

type Action = {
  href?: string;
  onClick?: () => void;
  label: string;
  variant?: "primary" | "secondary";
};

function ActionButton({ action }: { action: Action }) {
  const className =
    action.variant === "secondary"
      ? "inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm transition-colors hover:opacity-90"
      : "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm transition-opacity hover:opacity-90";

  const style =
    action.variant === "secondary"
      ? {
          color: "var(--color-foreground, var(--foreground))",
          borderColor: "var(--color-border, var(--border))",
          backgroundColor: "transparent",
        }
      : {
          backgroundColor: "var(--color-primary, var(--primary))",
          color: "var(--color-primary-foreground, #ffffff)",
        };

  if (action.href) {
    return (
      <a href={action.href} className={className} style={style}>
        {action.label}
      </a>
    );
  }

  return (
    <button onClick={action.onClick} className={className} style={style}>
      {action.label}
    </button>
  );
}

export function AppState({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: ReactNode;
  actions: Action[];
}) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16"
      style={{
        background: "var(--color-background, var(--background))",
        color: "var(--color-foreground, var(--foreground))",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div
          className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "color-mix(in srgb, var(--color-primary, var(--primary)) 10%, transparent)" }}
        />
        <div
          className="absolute bottom-0 right-0 h-64 w-64 rounded-full blur-3xl"
          style={{ background: "color-mix(in srgb, var(--color-accent, var(--accent, #f4f4f5)) 100%, transparent)" }}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <div
          className="mb-6 inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
          style={{
            borderColor: "color-mix(in srgb, var(--color-border, var(--border)) 70%, transparent)",
            color: "var(--color-secondary-text, var(--muted-foreground))",
          }}
        >
          {eyebrow}
        </div>

        <h1 className="max-w-xl text-4xl font-normal tracking-[-0.03em] text-balance sm:text-5xl">
          {title}
        </h1>
        <p
          className="mt-4 max-w-xl text-sm leading-6 sm:text-[15px]"
          style={{ color: "var(--color-secondary-text, var(--muted-foreground))" }}
        >
          {description}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {actions.map((action) => (
            <ActionButton
              key={`${action.label}-${action.href ?? "action"}`}
              action={action}
            />
          ))}
        </div>

        {meta ? (
          <div
            className="mt-10 border-t pt-4 text-xs"
            style={{
              borderColor: "color-mix(in srgb, var(--color-border, var(--border)) 70%, transparent)",
              color: "var(--color-secondary-text, var(--muted-foreground))",
            }}
          >
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
}
