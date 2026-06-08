import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Gamepad2,
  TrendingUp,
  FileBarChart,
  Trophy,
  BookOpen,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/simulations", label: "Simulations", icon: Gamepad2 },
  { to: "/progress", label: "My Progress", icon: TrendingUp },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/resources", label: "Resources", icon: BookOpen },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex w-[240px] flex-col bg-sidebar text-sidebar-foreground shrink-0 sticky top-0 h-screen">
      <div className="px-5 pt-6 pb-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-[15px] text-white">ProductPush</div>
            <div className="text-[10px] tracking-[0.18em] text-sidebar-foreground/60 uppercase">
              Simulator
            </div>
          </div>
        </Link>
      </div>

      <nav className="px-3 flex flex-col gap-1 flex-1">
        {nav.map((item) => {
          const active =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-glow"
                  : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4">
        <div className="rounded-xl bg-white/5 p-4 border border-white/5">
          <div className="text-[11px] text-sidebar-foreground/60 uppercase tracking-wider">
            Current Streak
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">7 days</span>
            <Flame className="size-5 text-warning" />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-t border-sidebar-border flex items-center gap-3">
        <div className="size-9 rounded-full bg-gradient-primary grid place-items-center text-white font-semibold text-sm">
          A
        </div>
        <div className="flex-1 leading-tight">
          <div className="text-sm font-medium text-white">Alex Johnson</div>
          <div className="text-xs text-sidebar-foreground/60">Student</div>
        </div>
      </div>
    </aside>
  );
}
