import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { SKILL_LABELS, type SkillKey } from "@/lib/scenarios";

export function SkillRadar({ skills }: { skills: Record<SkillKey, number> }) {
  const data = (Object.keys(SKILL_LABELS) as SkillKey[]).map((k) => ({
    skill: SKILL_LABELS[k],
    value: skills[k],
  }));
  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
