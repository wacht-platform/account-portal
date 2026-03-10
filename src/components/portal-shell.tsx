"use client";

import type { ReactNode } from "react";
import { DefaultStylesProvider } from "@wacht/nextjs";

export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <DefaultStylesProvider>
      <div
        className="min-h-screen"
        style={{
          background: "var(--color-background, var(--background))",
          color: "var(--color-foreground, var(--foreground))",
        }}
      >
        {children}
      </div>
    </DefaultStylesProvider>
  );
}
