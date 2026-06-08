import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [{ title: "My Progress — ProductPush" }] }),
  component: Progress,
});

function Progress() {
  const t = useT();
  return (
    <AppShell>
      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">{t("prog.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("prog.sub")}</p>

        <div className="mt-8 rounded-2xl border bg-card p-10 text-center shadow-card">
          <div className="size-12 rounded-full bg-primary/10 grid place-items-center mx-auto">
            <TrendingUp className="size-6 text-primary" />
          </div>
          <h2 className="mt-4 font-semibold">{t("prog.empty")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("prog.emptySub")}</p>
          <Button asChild className="mt-6 bg-gradient-primary text-primary-foreground shadow-glow">
            <Link to="/simulations">{t("home.cta.start")}</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
