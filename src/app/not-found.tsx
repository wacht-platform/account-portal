import { AppState } from "@/components/app-state";

export default function NotFound() {
  return (
    <AppState
      eyebrow="404"
      title="Page not found"
      description="The page you requested does not exist or is no longer available."
      actions={[{ href: "/", label: "Go home" }]}
    />
  );
}
