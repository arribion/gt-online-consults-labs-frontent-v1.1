import { Fragment } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  ListTodo,
  LogIn,
  MessageSquareText,
  NotepadText,
  ScanFace,
  Search,
  Tags,
  Wand2,
} from "lucide-react";
import { Reveal, SectionTag } from "./ui";

/* ================= goals list mockup ================= */
function GoalsMock({ title, tint }: { title: string; tint: string }) {
  const rows = [
    { tone: "bg-azure/20 text-sky2", t: "Close seed round", s: "2 follow-ups · deck v4 ready", p: 72 },
    { tone: "bg-[#22b8a6]/20 text-[#4fd8c6]", t: "Ship onboarding flow", s: "4 tasks · 1 blocked", p: 45 },
    { tone: "bg-amber/20 text-amber", t: "Hire founding engineer", s: "6 applicants to review", p: 30 },
    { tone: "bg-[#7f9df5]/20 text-[#9db4ff]", t: "Publish launch post", s: "Draft linked · due Fri", p: 58 },
  ];
  return (
    <div className="glow-ring rounded-2xl border border-line2/60 bg-deep/90 p-5">
      <div className="flex items-center justify-between border-b border-line/60 pb-3">
        <p className="font-display text-sm font-bold text-frost">{title}</p>
        <span className="rounded-md bg-panel px-2 py-1 text-[10px] font-semibold text-mist">Live</span>
      </div>
      <div className="mt-3 space-y-2.5">
        {rows.map((r) => (
          <div key={r.t} className="flex items-center gap-3 rounded-xl border border-line/60 bg-panel/60 p-3 transition-colors hover:border-line2">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${r.tone}`}>
              <ListTodo className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-frost">{r.t}</p>
              <p className="truncate text-[10px] text-mist">{r.s}</p>
            </div>
            <div className="w-14">
              <div className="h-1 overflow-hidden rounded-full bg-line">
                <div className={`h-full rounded-full ${tint}`} style={{ width: `${r.p}%` }} />
              </div>
              <p className="mt-1 text-right text-[9px] text-dim">{r.p}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= detail rows ================= */
function DetailRows() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl space-y-24 px-5 lg:px-8">
        {/* row 1 */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <h3 className="font-display text-2xl font-extrabold leading-snug text-frost sm:text-3xl">
              Get Smart Recommendations That <span className="text-sky2">Actually Help</span>
            </h3>
            <p className="mt-4 leading-relaxed text-mist">
              You don't need to figure out what to do next — we'll tell you. The AI analyzes your
              Tasks and suggest your top 3 priorities, follow-ups, and overdue tasks
              based on your goals.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Priorities ranked by deadline and goal impact",
                "Stale threads and forgotten follow-ups resurfaced",
                "Suggestions explain themselves — see the “why”",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-frost/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#4fd8c6]" /> {b}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <GoalsMock title="Today's Goals" tint="bg-gradient-to-r from-azure to-sky2" />
          </Reveal>
        </div>

        {/* row 2 — reversed */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal delay={120} className="lg:order-1">
            <GoalsMock title="Team's Goals" tint="bg-gradient-to-r from-[#22b8a6] to-[#4fd8c6]" />
          </Reveal>
          <Reveal className="lg:order-2">
            <h3 className="font-display text-2xl font-extrabold leading-snug text-frost sm:text-3xl">
              Think Once. <span className="text-sky2">Take Action Forever.</span>
            </h3>
            <p className="mt-4 leading-relaxed text-mist">
              get description 
            </p>
            <a
              href="#pricing"
              className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-sky2 hover:text-ice"
            >
              get started as trainer
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= the process ================= */
const steps = [
  {
    n: "1",
    icon: LogIn,
    title: "process 1",
    body: "Get me the description i will add hapa",
  },
  {
    n: "2",
    icon: ScanFace,
    title: "process 2",
    body: "Get me the description i will add hapa. i can be length up to two sentences",
  },
  {
    n: "3",
    icon: NotepadText,
    title: "process 3",
    body: "Get me the description i will add hapa",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag icon={<Lightbulb className="h-3.5 w-3.5" />}>The process</SectionTag>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-frost sm:text-4xl">
            It's That Simple. Just Write, and Let AI Do the Rest.
          </h2>
          <p className="mt-4 text-mist">
            StartNotesAI fits into your workflow — not the other way around. Here's how to get started:
          </p>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-6">
          {steps.map((s, i) => (
            <Fragment key={s.n}>
              <Reveal delay={i * 130}>
                <div className="group text-center">
                  <span className="relative inline-grid place-items-center">
                    <span className="bg-linear-to-b from-sky2 to-[#1860c4] bg-clip-text font-display text-7xl font-extrabold text-transparent drop-shadow-[0_0_24px_rgba(47,157,255,0.35)]">
                      {s.n}
                    </span>
                    <s.icon className="absolute -right-5 top-1 h-5 w-5 text-amber transition-transform group-hover:rotate-12" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-frost">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-mist">{s.body}</p>
                </div>
              </Reveal>
              {i < 2 && (
                <div className="hidden items-center lg:flex">
                  <ArrowRight className="h-6 w-6 text-line2" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= workflow ================= */
function Workflow() {
  const tasks = [
    { time: "9:00", t: "Review AI morning summary", tag: "Auto", tone: "text-sky2" },
    { time: "11:30", t: "Investor call — notes auto-captured", tag: "Meeting", tone: "text-[#4fd8c6]" },
    { time: "14:00", t: "3 tasks generated from call notes", tag: "AI", tone: "text-amber" },
    { time: "16:30", t: "Follow-up email drafted & linked", tag: "Draft", tone: "text-[#9db4ff]" },
  ];
  return (
    <section id="workflow" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag icon={<Tags className="h-3.5 w-3.5" />}>Features</SectionTag>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-frost sm:text-4xl">
            You Focus on Building.
            <br />
            <span className="text-sky2">We Handle the Workflow.</span>
          </h2>
          <p className="mt-4 text-mist">
            Startup founders shouldn't spend hours organizing. StartNotesAI does the heavy lifting,
            giving you clarity and momentum from day one.
          </p>
        </Reveal>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="glow-ring rounded-2xl border border-line2/60 bg-deep/90 p-5">
              <div className="flex items-center justify-between border-b border-line/60 pb-3">
                <p className="font-display text-sm font-bold text-frost">Today's tasks</p>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#4fd8c6]">
                  <span className="anim-pulse-dot h-1.5 w-1.5 rounded-full bg-[#4fd8c6]" /> Synced
                </span>
              </div>
              <div className="mt-3 space-y-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.t}
                    className="flex items-center gap-3 rounded-xl border border-line/60 bg-panel/60 p-3 transition-all hover:translate-x-1 hover:border-line2"
                  >
                    <span className="w-10 shrink-0 text-[10px] font-bold text-dim">{task.time}</span>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink2 text-mist">
                      <MessageSquareText className="h-3.5 w-3.5" />
                    </span>
                    <p className="min-w-0 flex-1 truncate text-xs font-medium text-frost/90">{task.t}</p>
                    <span className={`text-[10px] font-bold ${task.tone}`}>{task.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h3 className="font-display text-2xl font-extrabold text-frost">
              Organize Instantly, <span className="text-sky2">Not Manually</span>
            </h3>
            <p className="mt-4 leading-relaxed text-mist">
              No more hunting through scattered docs or sticky notes. StartNotesAI uses AI to
              auto-tag and group your notes by theme, project, or meeting — keeping everything
              connected and searchable.
            </p>
            <ul className="mt-7 space-y-4">
              {[
                { icon: Tags, t: "Auto-tagging by theme, project, or meeting — zero filing." },
                { icon: Search, t: "Semantic search that finds ideas, not just keywords." },
                { icon: Wand2, t: "One click from messy note to structured action plan." },
              ].map((b) => (
                <li key={b.t} className="flex items-start gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line2/60 bg-panel text-sky2">
                    <b.icon className="h-4 w-4" />
                  </span>
                  <p className="pt-1.5 text-sm text-frost/90">{b.t}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function Showcase() {
  return (
    <>
      <DetailRows />
      <HowItWorks />
      <Workflow />
    </>
  );
}
