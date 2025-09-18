"use client";

import { MagicLinkVerification } from "@snipextt/wacht-nextjs";

export default function MagicPage() {
  return (
    <div className="flex w-full h-[90vh] items-center justify-center">
      <MagicLinkVerification />
    </div>
  );
}
