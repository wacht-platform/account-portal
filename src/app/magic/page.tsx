"use client";

import { MagicLinkVerification } from "@wacht/nextjs";

export default function MagicPage() {
  return (
    <div className="flex w-full h-[90vh] items-center justify-center">
      <MagicLinkVerification />
    </div>
  );
}
