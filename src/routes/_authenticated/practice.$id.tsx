import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPractice, type PracticeTask } from "@/lib/course/practice";
import { gradeWritten, type GradeResult } from "@/lib/course/grading.functions";
import { upsertProgress, recordAttempt } from "@/lib/course/progress.functions";
import { LessonRadar } from "@/components/course/LessonRadar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Send,
  MessageSquare,
  Mail,
  PhoneCall,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  X,
  Wifi,
  Battery,
  SignalHigh,
} from "lucide-react";
import officeBg from "@/assets/office-bg.jpg";
import laptopImg from "@/assets/office-laptop.png";
import phoneImg from "@/assets/office-phone.png";
import mugImg from "@/assets/office-mug.png";
import plantImg from "@/assets/office-plant.png";
import stickyImg from "@/assets/office-stickynote.png";
import notebookImg from "@/assets/office-notebook.png";

export const Route = createFileRoute("/_authenticated/practice/$id")({
  component: PracticeRunner,
});

type Outcome = "solved_self" | "solved_with_help" | "failed";

const CHANNEL_META = {
  chat: { icon: MessageSquare, label: "Командный чат", tint: "text-sky-400", dot: "bg-sky-400" },
  email: { icon: Mail, label: "Почта", tint: "text-amber-400", dot: "bg-amber-400" },
  call: { icon: PhoneCall, label: "Звонок", tint: "text-emerald-400", dot: "bg-emerald-400" },
} as const;

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function PracticeRunner() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const practice = getPractice(id);
  const saveProgress = useServerFn(upsertProgress);

  const [stage, setStage] = useState<"intro" | "work" | "summary">("intro");
  const [taskIndex, setTaskIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<Record<number, Outcome>>({});
  const [scores, setScores] = useState<Record<number, number>>({});
  const [open, setOpen] = useState<null | "laptop" | "phone" | "whiteboard">(null);

  // ESC closes modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!practice) return;
    const status = stage === "summary" ? "completed" : "in_progress";
    void saveProgress({ data: { lessonId: practice.id, currentStep: taskIndex, status } }).catch(() => {});
  }, [stage, taskIndex, practice, saveProgress]);

  if (!practice) {
    return (
      <div className="min-h-screen grid place-items-center bg-[oklch(0.14_0.02_265)] text-white">
        <div className="text-center">
          <p>Практика не найдена.</p>
          <Link to="/course" className="text-primary hover:underline">К списку уроков</Link>
        </div>
      </div>
    );
  }

  const total = practice.tasks.length;
  const done = Object.keys(outcomes).length;
  const progressPct = stage === "summary" ? 100 : Math.round((done / total) * 100);
  const values = practice.tasks.map((_, i) => scores[i] ?? 0);
  const completed = values.filter((_, i) => outcomes[i] !== undefined);
  const avgScore = completed.length
    ? Math.round(values.reduce((a, b, i) => (outcomes[i] !== undefined ? a + b : a), 0) / completed.length)
    : 0;
  const pending = practice.tasks.filter((_, i) => !outcomes[i]).length;

  // Synthetic performance indexes (presentation, derived from outcomes)
  const base = 45 + done * 6;
  const indexes = [
    { key: "pt", label: "Project Thinking", value: clamp(base + 4) },
    { key: "da", label: "Data Analysis", value: clamp(base - 3) },
    { key: "sm", label: "Stakeholder Mgmt", value: clamp(base + 8) },
    { key: "dm", label: "Decision Making", value: clamp(base + 2 + done) },
    { key: "ex", label: "Execution", value: clamp(base) },
    { key: "co", label: "Communication", value: clamp(base + 11) },
  ];

  const activeTask = practice.tasks[taskIndex];

  function finishTask(o: Outcome, score: number) {
    setOutcomes((prev) => ({ ...prev, [taskIndex]: o }));
    setScores((prev) => ({ ...prev, [taskIndex]: score }));
    setOpen(null);
    if (taskIndex + 1 < total) {
      setTaskIndex((i) => i + 1);
    } else {
      setStage("summary");
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[oklch(0.16_0.025_265)] text-white">
      {/* Dark textured office wall behind the stage */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 65% -10%, oklch(0.28 0.04 260 / 0.9), transparent 55%), radial-gradient(ellipse at 10% 110%, oklch(0.1 0.02 260 / 0.9), transparent 60%), linear-gradient(180deg, oklch(0.20 0.03 265), oklch(0.12 0.02 265))",
        }}
        aria-hidden
      />

      {/* Header */}
      <div className="relative z-10 px-4 md:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center gap-3 justify-between rounded-xl bg-black/40 backdrop-blur-md px-4 py-2 border border-white/10 shadow-xl">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/course" className="inline-flex items-center text-xs text-white/70 hover:text-white gap-1 shrink-0">
              <ArrowLeft className="size-3.5" />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-7 rounded-md bg-gradient-primary grid place-items-center shrink-0 shadow-glow">
                <Sparkles className="size-3.5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/50 leading-none">Рабочий день · PM</div>
                <div className="text-sm font-semibold truncate">{practice.title}</div>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-white/60">
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">{practice.covers}</span>
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
              Входящих {done} / {total}
            </span>
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 inline-flex items-center gap-1.5">
              <SignalHigh className="size-3" /> <Wifi className="size-3" /> <Battery className="size-3.5" />
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/course" })}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white h-8"
          >
            Выйти из офиса
          </Button>
        </div>
      </div>

      {/* Main grid: sidebar + stage */}
      <div className="relative z-10 px-3 md:px-6 lg:px-8 pb-6 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* LEFT KPI SIDEBAR */}
        <aside className="rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 shadow-2xl p-4 space-y-5 self-start lg:sticky lg:top-3">
          <section>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-2">Прогресс дня</div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-bold tabular-nums">{progressPct}%</span>
              <span className="text-[11px] font-mono text-white/60">{done}/{total} задач</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 py-2">
              <span className="text-[11px] uppercase tracking-wider text-white/60">Средний балл</span>
              <span className="text-base font-bold text-amber-300 tabular-nums">{avgScore}</span>
            </div>
          </section>

          <section>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-2">Навыки PM</div>
            <div className="space-y-2.5">
              {indexes.map((ix) => (
                <PerfBar key={ix.key} label={ix.label} value={ix.value} />
              ))}
            </div>
          </section>

          <section>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-2">Входящие задачи</div>
            <ul className="space-y-1.5">
              {practice.tasks.map((t, i) => {
                const isDone = outcomes[i] !== undefined;
                const active = i === taskIndex && stage === "work";
                const meta = CHANNEL_META[t.channel];
                return (
                  <li
                    key={i}
                    className={cn(
                      "flex items-start gap-2 rounded-md px-2 py-1.5 text-[12px] leading-snug border transition-colors",
                      isDone && "bg-emerald-500/10 border-emerald-500/30 text-white/70",
                      active && "bg-primary/15 border-primary/40 text-white",
                      !isDone && !active && "border-white/5 text-white/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 size-4 shrink-0 rounded-full grid place-items-center text-[10px] font-bold",
                        isDone ? "bg-emerald-500 text-white" : active ? "bg-primary text-white" : "bg-white/10 text-white/40",
                      )}
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    <span className="flex-1 truncate">
                      {t.from} · <span className={meta.tint}>{meta.label}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>

        {/* STAGE */}
        <div className="relative">
          <div
            className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ aspectRatio: "16 / 10", minHeight: 520 }}
          >
            <img
              src={officeBg}
              alt="Интерьер IT-офиса: рабочее место PM"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover select-none"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 35%, transparent 40%, rgba(0,0,0,0.55) 100%)" }}
              aria-hidden
            />

            {/* Whiteboard — current scenario / active task brief */}
            <button
              type="button"
              onClick={() => setOpen("whiteboard")}
              className="absolute group cursor-pointer text-left"
              style={{ left: "24%", top: "8%", width: "52%", height: "40%" }}
              aria-label="Открыть доску с задачей"
            >
              <div
                className="relative w-full h-full rounded-md p-[10px] shadow-[0_25px_45px_-15px_rgba(0,0,0,0.85)]"
                style={{ background: "linear-gradient(145deg, oklch(0.75 0.02 80), oklch(0.42 0.03 70) 50%, oklch(0.62 0.03 75))" }}
              >
                <div className="relative w-full h-full rounded-sm bg-[oklch(0.98_0.005_90)] overflow-hidden">
                  <WhiteboardWriting practice={practice} stage={stage} task={activeTask} taskIndex={taskIndex} total={total} />
                  <span className="absolute inset-0 ring-0 group-hover:ring-2 ring-amber-300/60 transition rounded-sm" />
                </div>
                <div
                  className="absolute left-[4%] right-[4%] -bottom-2 h-2 rounded-b shadow-md"
                  style={{ background: "linear-gradient(180deg, oklch(0.45 0.03 70), oklch(0.22 0.02 65))" }}
                />
                <div className="absolute left-[10%] -bottom-1.5 flex gap-1.5">
                  {["#1f2937", "#2563eb", "#dc2626", "#16a34a"].map((c) => (
                    <span key={c} className="block w-5 h-1.5 rounded-sm shadow-sm" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </button>

            {/* Static desk decor */}
            <img src={mugImg} alt="Кружка с кофе" draggable={false} className="absolute pointer-events-none select-none drop-shadow-[0_18px_18px_rgba(0,0,0,0.65)]" style={{ left: "2%", bottom: "5%", width: "9%" }} />
            <img src={notebookImg} alt="Ежедневник на столе" draggable={false} className="absolute pointer-events-none select-none drop-shadow-[0_18px_18px_rgba(0,0,0,0.6)]" style={{ left: "13%", bottom: "2%", width: "12%", transform: "rotate(-6deg)" }} />
            <img src={plantImg} alt="Растение в горшке" draggable={false} className="absolute pointer-events-none select-none drop-shadow-[0_18px_18px_rgba(0,0,0,0.6)]" style={{ right: "1%", bottom: "4%", width: "10%" }} />
            <img src={stickyImg} alt="Стикеры с заметками" draggable={false} className="absolute pointer-events-none select-none drop-shadow-[0_10px_12px_rgba(0,0,0,0.5)]" style={{ right: "20%", bottom: "2%", width: "11%", transform: "rotate(4deg)" }} />

            {/* Interactive desk objects */}
            <div className="absolute inset-x-0 bottom-0 h-[44%] pointer-events-none">
              <DeskObject
                style={{ left: "28%", bottom: "0%", width: "42%" }}
                src={laptopImg}
                label="Рабочий ноутбук — ответить"
                ariaLabel="Открыть ноутбук и ответить"
                onClick={() => stage !== "summary" && setOpen("laptop")}
                glow
                disabled={stage === "summary"}
              />
              <DeskObject
                style={{ right: "11%", bottom: "10%", width: "9%" }}
                src={phoneImg}
                label="Входящие сообщения"
                ariaLabel="Открыть телефон"
                onClick={() => setOpen("phone")}
                badge={pending > 0 ? String(pending) : undefined}
                pulseBadge={pending > 0}
              />
            </div>

            {/* Intro / summary overlay sit over the stage */}
            {stage === "intro" && (
              <div className="absolute inset-0 grid place-items-center p-4 bg-black/35 backdrop-blur-[2px]">
                <IntroCard practice={practice} onStart={() => setStage("work")} />
              </div>
            )}
            {stage === "summary" && (
              <div className="absolute inset-0 grid place-items-center p-4 bg-black/45 backdrop-blur-[2px] overflow-y-auto">
                <SummaryCard practice={practice} scores={scores} avg={avgScore} onFinish={() => navigate({ to: "/course" })} />
              </div>
            )}
          </div>

          {/* Timeline strip */}
          <div className="mt-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2.5 shadow-xl">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1.5">Хронология рабочего дня</div>
            <div className="flex flex-wrap items-center gap-1.5">
              {practice.tasks.map((_, i) => {
                const isDone = outcomes[i] !== undefined;
                const active = i === taskIndex && stage === "work";
                return (
                  <div
                    key={i}
                    className={cn(
                      "size-6 rounded-full grid place-items-center text-[11px] font-semibold border transition-all",
                      isDone && "bg-primary text-primary-foreground border-primary",
                      active && "bg-primary/25 text-white border-primary ring-2 ring-primary/50",
                      !isDone && !active && "bg-white/5 text-white/50 border-white/20",
                    )}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {open === "whiteboard" && (
        <Modal onClose={() => setOpen(null)} label="Доска · задача дня" wide>
          <WhiteboardFull practice={practice} task={activeTask} taskIndex={taskIndex} total={total} stage={stage} />
        </Modal>
      )}
      {open === "phone" && (
        <Modal onClose={() => setOpen(null)} label="Входящие" narrow>
          <PhonePanel practice={practice} outcomes={outcomes} activeIndex={stage === "work" ? taskIndex : -1} />
        </Modal>
      )}
      {open === "laptop" && stage === "work" && (
        <Modal onClose={() => setOpen(null)} label={CHANNEL_META[activeTask.channel].label} wide>
          <AnswerComposer
            key={taskIndex}
            practiceId={practice.id}
            task={activeTask}
            index={taskIndex}
            total={total}
            onDone={finishTask}
          />
        </Modal>
      )}
    </div>
  );
}

/* ---------- Sidebar perf bar ---------- */
function PerfBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="text-white/70">{label}</span>
        <span className="font-mono text-white/50 tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/* ---------- Desk object ---------- */
function DeskObject({
  style,
  src,
  label,
  ariaLabel,
  onClick,
  badge,
  pulseBadge,
  glow,
  disabled,
}: {
  style: React.CSSProperties;
  src: string;
  label: string;
  ariaLabel: string;
  onClick: () => void;
  badge?: string;
  pulseBadge?: boolean;
  glow?: boolean;
  disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} disabled={disabled} className="absolute pointer-events-auto group focus:outline-none disabled:opacity-60" style={style}>
      <div className="relative transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-[1.04] office-bob">
        <img
          src={src}
          alt={label}
          draggable={false}
          className={cn("w-full h-auto select-none drop-shadow-[0_25px_25px_rgba(0,0,0,0.55)]", glow && !disabled && "group-hover:drop-shadow-[0_0_30px_rgba(99,102,241,0.55)]")}
          style={{ filter: "contrast(1.02)" }}
        />
        {badge && (
          <span className={cn("absolute -top-1 -right-1 min-w-6 h-6 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold grid place-items-center shadow-lg", pulseBadge && "office-notif")}>
            {badge}
          </span>
        )}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-[11px] font-medium text-white bg-black/70 backdrop-blur px-2 py-0.5 rounded-md whitespace-nowrap">{label}</span>
      </div>
    </button>
  );
}

/* ---------- Whiteboard preview ---------- */
function WhiteboardWriting({
  practice,
  stage,
  task,
  taskIndex,
  total,
}: {
  practice: NonNullable<ReturnType<typeof getPractice>>;
  stage: "intro" | "work" | "summary";
  task: PracticeTask;
  taskIndex: number;
  total: number;
}) {
  return (
    <div className="absolute inset-0 p-[6%] text-[oklch(0.25_0.04_260)]">
      <div className="office-handwrite" style={{ animationDelay: "60ms" }}>
        <div className="font-marker text-[clamp(11px,1.2vw,18px)] tracking-wide text-[oklch(0.45_0.18_260)] uppercase">
          {stage === "summary" ? "Итог" : `Задача ${Math.min(taskIndex + 1, total)} / ${total}`}
        </div>
        <div className="font-handwriting font-bold leading-[1.05] mt-1 text-[clamp(14px,1.7vw,28px)]" style={{ color: "oklch(0.2 0.04 260)" }}>
          {practice.subtitle}
        </div>
        {stage !== "summary" && (
          <div className="font-handwriting mt-2 text-[clamp(12px,1.3vw,20px)] leading-snug" style={{ color: "oklch(0.3 0.03 260)" }}>
            {task.from} ({task.role}) → {task.prompt}
          </div>
        )}
      </div>
      <div className="absolute font-handwriting text-[clamp(10px,1vw,14px)] leading-tight rotate-[5deg] shadow-md p-2 w-[24%]" style={{ right: "4%", bottom: "6%", background: "oklch(0.95 0.13 95)", color: "oklch(0.25 0.05 80)" }}>
        Отвечай как настоящий PM ★
      </div>
    </div>
  );
}

/* ---------- Whiteboard full ---------- */
function WhiteboardFull({
  practice,
  task,
  taskIndex,
  total,
  stage,
}: {
  practice: NonNullable<ReturnType<typeof getPractice>>;
  task: PracticeTask;
  taskIndex: number;
  total: number;
  stage: "intro" | "work" | "summary";
}) {
  return (
    <div className="p-6 md:p-8 bg-[oklch(0.98_0.005_90)] text-[oklch(0.2_0.04_260)]">
      <div className="font-marker text-sm uppercase text-[oklch(0.45_0.18_260)]">{practice.covers}</div>
      <h2 className="font-handwriting font-bold text-3xl md:text-4xl leading-tight mt-1">{practice.title}</h2>
      <p className="font-handwriting text-xl mt-3 text-[oklch(0.32_0.03_260)]">{practice.subtitle}</p>
      <p className="mt-4 font-sans text-sm leading-relaxed text-[oklch(0.32_0.03_260)]">{practice.intro}</p>
      {stage === "work" && (
        <div className="mt-6 rounded-lg border border-[oklch(0.45_0.18_260)]/30 bg-[oklch(0.45_0.18_260)]/10 p-4">
          <div className="font-marker text-xs uppercase text-[oklch(0.45_0.18_260)]">Текущая задача {taskIndex + 1} / {total}</div>
          <p className="mt-1 font-sans text-sm font-semibold">{task.prompt}</p>
        </div>
      )}
    </div>
  );
}

/* ---------- Phone panel (incoming queue) ---------- */
function PhonePanel({
  practice,
  outcomes,
  activeIndex,
}: {
  practice: NonNullable<ReturnType<typeof getPractice>>;
  outcomes: Record<number, Outcome>;
  activeIndex: number;
}) {
  return (
    <div className="bg-[oklch(0.13_0.02_255)] text-white">
      <div className="bg-black/50 px-5 pt-2.5 pb-2 flex items-center justify-between text-[10px] text-white/70">
        <span>9:41</span>
        <span className="flex items-center gap-1">
          <SignalHigh className="size-3" /> <Wifi className="size-3" /> <Battery className="size-3.5" />
        </span>
      </div>
      <div className="px-3 py-3 space-y-2 max-h-[70vh] overflow-y-auto">
        {practice.tasks.map((t, i) => {
          const meta = CHANNEL_META[t.channel];
          const Icon = meta.icon;
          const isDone = outcomes[i] !== undefined;
          const active = i === activeIndex;
          return (
            <div key={i} className={cn("relative rounded-xl border px-2.5 py-2 transition-all", active ? "border-primary/60 bg-primary/15 shadow-glow" : isDone ? "border-white/5 bg-white/[0.03] opacity-60" : "border-white/10 bg-white/5")}>
              {!isDone && !active && <span className={cn("absolute -left-0.5 -top-0.5 size-2 rounded-full animate-pulse", meta.dot)} />}
              <div className="flex items-center gap-2">
                <div className="size-9 shrink-0 rounded-full bg-white/10 grid place-items-center text-lg">{t.avatar}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[12px] font-semibold truncate">
                    {t.from} <Icon className={cn("size-3", meta.tint)} />
                  </div>
                  <div className="text-[11px] text-white/50 line-clamp-2">{t.message}</div>
                </div>
                {isDone && <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Intro card ---------- */
function IntroCard({ practice, onStart }: { practice: NonNullable<ReturnType<typeof getPractice>>; onStart: () => void }) {
  return (
    <div className="w-full max-w-lg rounded-2xl bg-black/55 backdrop-blur-xl border border-white/15 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-[11px] uppercase tracking-[0.18em] text-primary font-semibold">{practice.covers}</div>
      <h1 className="mt-2 text-2xl font-bold">{practice.title}</h1>
      <p className="mt-1 text-white/70">{practice.subtitle}</p>
      <p className="mt-4 leading-relaxed text-white/80 text-sm">{practice.intro}</p>
      <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/70">
        Сегодня в офисе тебя ждут <b className="text-white">{practice.tasks.length}</b> входящих от команды и заказчиков.
        Они в телефоне на столе — открой ноутбук и отвечай как PM.
      </div>
      <Button className="mt-6 w-full" onClick={onStart}>
        Начать рабочий день <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

/* ---------- Summary card ---------- */
function SummaryCard({
  practice,
  scores,
  avg,
  onFinish,
}: {
  practice: NonNullable<ReturnType<typeof getPractice>>;
  scores: Record<number, number>;
  avg: number;
  onFinish: () => void;
}) {
  const skills = useMemo(() => {
    const b = { productThinking: 55, analytics: 55, communication: 55, prioritization: 55, execution: 55, riskManagement: 55 };
    practice.tasks.forEach((t, i) => {
      const s = scores[i] ?? 0;
      if (t.channel === "call" || t.channel === "email") b.communication = Math.max(b.communication, s);
      if (t.prompt.match(/риск|митигац/i)) b.riskManagement = Math.max(b.riskManagement, s);
      if (t.prompt.match(/приорит|mvp|scope/i)) b.prioritization = Math.max(b.prioritization, s);
      b.execution = Math.round((b.execution + s) / 2);
      b.productThinking = Math.round((b.productThinking + s) / 2);
      b.analytics = Math.round((b.analytics + s) / 2);
    });
    return b;
  }, [practice.tasks, scores]);

  return (
    <div className="w-full max-w-lg rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-[11px] uppercase tracking-[0.18em] text-primary font-semibold">Итог практики</div>
      <h2 className="mt-2 text-2xl font-bold">Рабочий день закрыт 🎉</h2>
      <div className="mt-4 flex items-center gap-4">
        <div className="rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-center">
          <div className="text-3xl font-bold text-amber-300 tabular-nums">{avg}</div>
          <div className="text-[11px] uppercase tracking-wider text-white/50">средний балл</div>
        </div>
        <p className="text-sm text-white/70">
          {avg >= 85 ? "Сильно! Ты держишь команду, заказчика и процесс." : avg >= 60 ? "Хорошо. Есть что усилить — посмотри обратную связь по задачам." : "Стоит вернуться к теории пройденных уроков и попробовать снова."}
        </p>
      </div>
      <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/10 p-2">
        <LessonRadar skills={skills} />
      </div>
      <Button className="mt-5 w-full" onClick={onFinish}>
        Вернуться к курсу <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

/* ---------- Modal wrapper ---------- */
function Modal({
  onClose,
  label,
  wide,
  narrow,
  children,
}: {
  onClose: () => void;
  label: string;
  wide?: boolean;
  narrow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 py-6">
      <button type="button" aria-label="Закрыть" onClick={onClose} className="absolute inset-0 bg-black/60 office-backdrop-in" />
      <div className={cn("relative w-full animate-in fade-in zoom-in-95 duration-200", narrow ? "max-w-[340px]" : wide ? "max-w-3xl" : "max-w-md")}>
        <div className="rounded-2xl bg-card text-foreground shadow-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-secondary/50">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
            <button type="button" onClick={onClose} className="size-7 rounded-md grid place-items-center hover:bg-secondary text-muted-foreground hover:text-foreground" aria-label="Закрыть">
              <X className="size-4" />
            </button>
          </div>
          <div className="max-h-[88vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Answer composer (laptop) ---------- */
function AnswerComposer({
  practiceId,
  task,
  index,
  total,
  onDone,
}: {
  practiceId: string;
  task: PracticeTask;
  index: number;
  total: number;
  onDone: (o: Outcome, score: number) => void;
}) {
  const grade = useServerFn(gradeWritten);
  const logAttempt = useServerFn(recordAttempt);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GradeResult | null>(null);
  const giveUp = attempts >= 3;
  const meta = CHANNEL_META[task.channel];
  const Icon = meta.icon;

  async function submit() {
    if (!answer.trim() || loading) return;
    setLoading(true);
    try {
      const res = (await grade({
        data: { prompt: `${task.prompt}\n\nКонтекст сообщения: ${task.message}`, criteria: task.criteria, answer },
      })) as GradeResult;
      setResult(res);
      const n = attempts + 1;
      setAttempts(n);
      if (res.passed) {
        const score = n === 1 ? 100 : n === 2 ? 80 : 65;
        void logAttempt({ data: { lessonId: practiceId, taskType: "written", attemptNo: n, status: "solved_self", score } }).catch(() => {});
        setTimeout(() => onDone(n === 1 ? "solved_self" : "solved_with_help", score), 900);
      }
    } catch {
      setResult({
        passed: false,
        metCriteria: [],
        unmetCriteria: task.criteria,
        guidingQuestion: "Попробуй конкретнее раскрыть пункты задания.",
        feedback: "Не удалось проверить ответ, попробуй ещё раз.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-1.5 text-[11px] font-semibold", meta.tint)}>
          <Icon className="size-3.5" /> {meta.label}
        </div>
        <span className="text-[11px] text-muted-foreground">Входящее {index + 1} / {total}</span>
      </div>

      <div className="mt-3 flex gap-3">
        <div className="size-10 shrink-0 rounded-full bg-secondary grid place-items-center text-xl">{task.avatar}</div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            {task.from} <span className="font-normal text-muted-foreground">· {task.role}</span>
          </div>
          <div className="mt-1 rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-[15px] leading-relaxed">{task.message}</div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm">
        <span className="font-semibold text-primary">Твоя задача: </span>
        {task.prompt}
      </div>

      <Textarea
        className="mt-3 min-h-28"
        placeholder={task.channel === "call" ? "Что ты скажешь собеседнику?…" : "Напиши свой ответ как PM…"}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={loading || (result?.passed ?? false)}
      />

      {result && !result.passed && (
        <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-sm">
          <div className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-300">
            <Lightbulb className="size-4" /> Обратная связь
          </div>
          <p className="mt-1">{result.feedback}</p>
          {result.guidingQuestion && <p className="mt-1.5 text-muted-foreground">{result.guidingQuestion}</p>}
        </div>
      )}

      {result?.passed && (
        <div className="mt-3 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          <CheckCircle2 className="size-4" /> Отлично, ответ принят!
        </div>
      )}

      {giveUp && !result?.passed && (
        <div className="mt-3 rounded-lg border bg-secondary/50 p-3 text-sm">
          <div className="font-semibold">Пример сильного ответа</div>
          <p className="mt-1 text-muted-foreground">{task.reference}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!result?.passed && !giveUp && (
          <Button className="flex-1" onClick={submit} disabled={loading || !answer.trim()}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Отправить ответ
          </Button>
        )}
        {giveUp && !result?.passed && (
          <Button className="flex-1" variant="outline" onClick={() => onDone("failed", 40)}>
            Двигаться дальше <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
