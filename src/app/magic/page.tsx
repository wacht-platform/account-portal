"use client";

import { MagicLinkVerification } from "@wacht/nextjs";

export default function MagicPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-10">
      <MagicLinkVerification />
    </div>
  );
}
