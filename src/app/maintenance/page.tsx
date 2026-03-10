"use client";

import { AppState } from "@/components/app-state";

export default function Maintenance() {
  return (
    <AppState
      eyebrow="Maintenance"
      title="The portal is temporarily unavailable"
      description="Scheduled maintenance is in progress. Check again in a moment."
      actions={[{ label: "Check again", onClick: () => window.location.reload() }]}
    />
  );
}
