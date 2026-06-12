"use client";

import type { ReactNode } from "react";
import { DefaultStylesProvider } from "@wacht/nextjs";

export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <DefaultStylesProvider>
      <div
        className="min-h-screen"
        style={{
          background: "var(--wa-background)",
          color: "var(--wa-text)",
        }}
      >
        {children}
      </div>
    </DefaultStylesProvider>
  );
}
