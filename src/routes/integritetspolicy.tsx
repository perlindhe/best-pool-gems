import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy Swedish URL — permanently redirect to the English /privacy.
export const Route = createFileRoute("/integritetspolicy")({
  beforeLoad: () => {
    throw redirect({ to: "/privacy", replace: true });
  },
  component: () => null,
});
