import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [{ title: "My Progress — ProductPush" }] }),
  component: Progress,
});

function Progress() {
  return (
    <AppShell>
      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">My Progress</h1>
        <p className="text-sm text-muted-foreground">Track your simulation history and skill growth.</p>

        <div className="mt-8 rounded-2xl border bg-card p-10 text-center shadow-card">
          <div className="size-12 rounded-full bg-primary/10 grid place-items-center mx-auto">
            <TrendingUp className="size-6 text-primary" />
          </div>
          <h2 className="mt-4 font-semibold">Your performance history will appear here</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete a simulation to start tracking skill growth across sessions.
          </p>
          <Button asChild className="mt-6 bg-gradient-primary text-primary-foreground shadow-glow">
            <Link to="/simulations">Start a Simulation</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
