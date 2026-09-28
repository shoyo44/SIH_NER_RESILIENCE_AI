import { createFileRoute, Outlet } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Bypassing authentication and providing a fake user for the demo
    return { user: { id: "demo-user", email: "admin@ner-resilience.in" } };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});