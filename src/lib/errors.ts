export function isIgnorablePortalError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`.toLowerCase()
      : String(error ?? "").toLowerCase();

  return (
    message.includes("aborterror") ||
    message.includes("aborted") ||
    message.includes("cancelled") ||
    message.includes("canceled") ||
    message.includes("signal is aborted") ||
    message.includes("passkey sign-in was cancelled")
  );
}
