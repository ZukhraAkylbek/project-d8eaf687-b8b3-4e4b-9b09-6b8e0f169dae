import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ScenarioCard } from "@/components/ScenarioCard";
import { type ScenarioCategory, type ScenarioLevel, type ScenarioRole } from "@/lib/scenarios";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/simulations/")({
  head: () => ({
    meta: [
      { title: "Choose Simulation — ProductPush" },
      { name: "description", content: "Pick a Product or Project Manager simulation to practice." },
    ],
  }),
  component: Simulations,
});

const ROLES: ("All Roles" | ScenarioRole)[] = ["All Roles", "Product Manager", "Project Manager", "Stakeholder Roleplay"];
const CATS: ("All Types" | ScenarioCategory)[] = [
  "All Types",
  "Analytics",
  "Strategy",
  "Product Discovery",
  "Stakeholder",
  "Execution",
  "Risk",
];
const LEVELS: ("All Levels" | ScenarioLevel)[] = ["All Levels", "Junior", "Mid-level", "Senior"];

function Simulations() {
  const { t, tCategory, tRole, tLevel, scenarios } = useI18n();
  const [role, setRole] = useState<(typeof ROLES)[number]>("All Roles");
  const [cat, setCat] = useState<(typeof CATS)[number]>("All Types");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All Levels");

  const filtered = scenarios.filter(
    (s) =>
      (role === "All Roles" || s.role === role) &&
      (cat === "All Types" || s.category === cat) &&
      (level === "All Levels" || s.level === level),
  );

  const labelFor = (opt: string): string => {
    if (opt === "All Roles") return t("sim.filter.allRoles");
    if (opt === "All Types") return t("sim.filter.allTypes");
    if (opt === "All Levels") return t("sim.filter.allLevels");
    if ((ROLES as readonly string[]).includes(opt)) return tRole(opt as ScenarioRole);
    if ((CATS as readonly string[]).includes(opt)) return tCategory(opt as ScenarioCategory);
    if ((LEVELS as readonly string[]).includes(opt)) return tLevel(opt as ScenarioLevel);
    return opt;
  };

  return (
    <AppShell>
      <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{t("sim.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("sim.sub")}</p>
        </header>

        <div className="space-y-3 mb-8">
          <FilterRow options={ROLES} value={role} onChange={setRole} labelFor={labelFor} />
          <FilterRow options={CATS} value={cat} onChange={setCat} labelFor={labelFor} />
          <FilterRow options={LEVELS} value={level} onChange={setLevel} labelFor={labelFor} />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            {t("sim.empty")}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <ScenarioCard key={s.id} scenario={s} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function FilterRow<T extends string>({
  options,
  value,
  onChange,
  labelFor,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labelFor: (v: string) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium border transition-all",
            value === opt
              ? "bg-primary text-primary-foreground border-primary shadow-glow"
              : "bg-card text-foreground border-border hover:border-primary/40 hover:text-primary",
          )}
        >
          {labelFor(opt)}
        </button>
      ))}
    </div>
  );
}
