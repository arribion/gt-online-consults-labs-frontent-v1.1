import { useEffect, useState } from "react";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  FileText,
  Globe,
  LayoutDashboard,
  Lightbulb,
  ListTodo,
  Network,
  PlayCircle,
  Quote,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  StickyNote,
  Target,
  Users,
} from "lucide-react";
import { Reveal, Avatar, Stars } from "./ui";
import { useCountUp } from "../../hooks/hooks";
import TrustedByCarousel from "./TrustedCarosel";

/* ================= dashboard mockup ================= */
function DashboardMock() {
  const side = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: StickyNote, label: "Notes" },
    { icon: ListTodo, label: "Tasks" },
    { icon: BellRing, label: "Reminders" },
    { icon: Target, label: "Goals" },
  ];
  return (
    <div className="glow-ring relative overflow-hidden rounded-2xl border border-line2/60 bg-deep/90">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-line/70 bg-panel/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 hidden items-center gap-2 rounded-md bg-deep/80 px-3 py-1 text-[10px] text-mist sm:flex">
          <Search className="h-3 w-3" /> Search notes, tasks…
        </span>
        <span className="ml-auto text-[10px] font-semibold text-sky2">⌘K</span>
      </div>

      <div className="flex">
        {/* sidebar */}
        <div className="hidden w-36 shrink-0 flex-col gap-1 border-r border-line/60 p-3 sm:flex">
          {side.map((s) => (
            <span
              key={s.label}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium ${
                s.active ? "bg-azure/15 text-sky2" : "text-mist"
              }`}
            >
              <s.icon className="h-3.5 w-3.5" /> {s.label}
            </span>
          ))}
          <span className="mt-3 rounded-md border border-dashed border-line2/70 px-2.5 py-2 text-[10px] text-dim">
            + New workspace
          </span>
        </div>

        {/* main */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-xs font-bold text-frost">Today · Thur, Jun 6</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/10 px-2.5 py-1 text-[10px] font-semibold text-amber">
              <Sparkles className="h-3 w-3" /> 3 Task priorities detected
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {[
              { tag: "Investor update", tone: "bg-azure/15 text-sky2", lines: 3 },
              { tag: "Product roadmap", tone: "bg-[#22b8a6]/15 text-[#4fd8c6]", lines: 2 },
            ].map((n) => (
              <div key={n.tag} className="rounded-lg border border-line/70 bg-panel/70 p-3">
                <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${n.tone}`}>{n.tag}</span>
                <div className="mt-2 space-y-1.5">
                  {Array.from({ length: n.lines }).map((_, i) => (
                    <div key={i} className="h-1.5 rounded bg-line/80" style={{ width: `${90 - i * 22}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-1.5 rounded-lg border border-line/70 bg-panel/50 p-3">
            {[
              { t: "Send deck to Ari at Horizon VC", done: true },
              { t: "Review onboarding copy draft", done: true },
              { t: "Prep metrics for ai tasking", done: false },
            ].map((task) => (
              <div key={task.t} className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 className={`h-3.5 w-3.5 ${task.done ? "text-[#4fd8c6]" : "text-line2"}`} />
                <span className={task.done ? "text-dim line-through" : "text-frost"}>{task.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= AI features panel (talent-panel analog) ================= */
const aiFeatures = [
  { icon: ListTodo, label: "AI Engineering" },
  { icon: FileText, label: "Software Developers" },
  { icon: Network, label: "Data anotation Specialist" },
  { icon: Target, label: "Computer Engineers" },
  { icon: BellRing, label: "Software Engineers" },
  { icon: Sparkles, label: "Machine Learning Engineers" },
  { icon: BellRing, label: "DevOps Engineers" },
];

function FeaturePanel() {
  return (
    <div className="rounded-2xl border border-line2/70 bg-panel/90 p-5 shadow-[0_24px_70px_-30px_rgba(10,60,140,0.8)] backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-bold text-sky2">
          In-Demand Talents
        </p>
        <Users className="h-4 w-4 text-mist" />
      </div>
      <ul className="mt-4 space-y-3">
        {aiFeatures.map((f) => (
          <li
            key={f.label}
            className="group flex items-center gap-3 text-[13px] font-medium text-frost/90">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line2/60 bg-ink2 text-sky2 transition-colors group-hover:border-azure/60 group-hover:bg-azure/10">
              <f.icon className="h-4 w-4" />
            </span>
            {f.label}
          </li>
        ))}
      </ul>
      <a
        href="/in-demand"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sky2 hover:text-ice">
        Explore all Talents <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

/* ================= stats ================= */
function Stat({ value, decimals = 0, prefix = "", suffix, label }: { value: number; decimals?: number; prefix?: string; suffix: string; label: string }) {
  const { ref, formatted } = useCountUp(value, decimals);
  return (
    <div className="flex flex-col gap-1 px-6 py-5 first:pl-0">
      <span className="font-display text-2xl font-extrabold text-frost sm:text-3xl">
        {prefix}
        <span ref={ref}>{formatted}</span>
        <span className="text-sky2">{suffix}</span>
      </span>
      <span className="text-xs font-medium text-mist">{label}</span>
    </div>
  );
}

/* ================= rotating testimonial ================= */
const quotes = [
  {
    text: "StartNotesAI has become my second brain. I dump messy thoughts in the morning and get a ranked plan back before my first coffee.",
    name: "Lauren K.",
    role: "Fintech Founder",
  },
  {
    text: "The AI surfaces follow-ups I would have completely forgotten. It's like having a chief of staff who never sleeps.",
    name: "Dana S.",
    role: "Edtech Co-Founder",
  },
  {
    text: "One brain-dump note turned into our entire sprint plan. Tasks, timelines, reminders — done in seconds.",
    name: "Brian G.",
    role: "Healthtech CEO",
  },
];

function QuoteRotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % quotes.length), 5200);
    return () => clearInterval(t);
  }, []);
  const q = quotes[i];
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-line2/60 bg-sky-500/20 p-6">
      <div>
        <span className="font-display text-4xl leading-none text-azure">
          <Quote color="white" />
        </span>
        <p key={i} className="quote-swap mt-1 text-sm leading-relaxed text-frost/90">
          {q.text}
        </p>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={q.name} i={i} />
          <div>
            <p className="text-sm font-bold text-frost">{q.name}</p>
            <p className="text-xs text-mist">{q.role}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {quotes.map((_, d) => (
            <button
              key={d}
              onClick={() => setI(d)}
              aria-label={`Quote ${d + 1}`}
              className={`h-1.5 rounded-full transition-all ${d === i ? "w-5 bg-sky2" : "w-1.5 bg-line2"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


/* ================= values strip ================= */
const values = [
  {
    icon: ShieldCheck,
    tone: "text-sky2",
    title: "INTEGRITY",
    lines: ["Honest Communication.", "Transpirate Process."],
  },
  {
    icon: Rocket,
    tone: "text-[#4fd8c6]",
    title: "EXECUTION",
    lines: ["We deliver on Promise.", "Results that Matter."],
  },
  {
    icon: Lightbulb,
    tone: "text-amber",
    title: "INOVATION",
    lines: ["AI-first Thinking.", "Future Focused Solutions."],
  },
  {
    icon: Globe,
    tone: "text-[#7f9df5]",
    title: "GLOBAL IMPACT",
    lines: ["Connecting Talents.", "Creating Oppotunities."],
  },
];

/* ================= HERO ================= */
export default function Hero() {
  return (
    <section id="top" className="relative pt-28 lg:pt-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* ---- row A: copy + visual ---- */}
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <Reveal>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-sky2">
              <span className="h-px w-8 bg-sky2" />
              GLOBAL TALENTS. LIMITLESS IMPACT.
            </p>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-frost sm:text-5xl xl:text-[3.4rem]">
              Connectiong Africa's
              <br className="hidden sm:block" /> Brightest Minds to Global
              <span className="text-shimmer"> AI Oppotunities</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
              GT.onlineConsults.empowers exceptional technology talents, through
              global outsourcing partinership built on integrity,execution and
              innovation.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#pricing"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-linear-to-r from-azure to-[#1873e0] px-6 py-3.5 text-sm font-bold text-white shadow-[0_16px_40px_-12px_rgba(47,157,255,0.75)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-12px_rgba(47,157,255,0.9)]">
                <Users className="h-4.5 w-4.5" />
                Join Our Talent Network
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#how"
                className="inline-flex items-center gap-2.5 rounded-xl border border-line2 bg-panel/50 px-6 py-3.5 text-sm font-bold text-frost transition-all hover:border-sky2/60 hover:bg-panel">
                <PlayCircle className="h-4.5 w-4.5 text-sky2" />
                Hire Top Talents
              </a>
            </div>
          </Reveal>

          {/* visual */}
          <Reveal delay={150} className="relative">
            <div className="anim-float">
              <DashboardMock />
            </div>
            {/* floating chip */}
            <div className="anim-float2 absolute -top-5 right-4 flex items-center gap-2 rounded-xl border border-line2/70 bg-panel/95 px-3.5 py-2.5 shadow-xl backdrop-blur">
              <span className="anim-pulse-dot h-2 w-2 rounded-full bg-[#4fd8c6]" />
              <span className="text-[11px] font-semibold text-frost">
                AI created 3 tasks from your note
              </span>
            </div>
            {/* feature panel */}
            <div className="relative z-10 mt-6 lg:absolute lg:-bottom-14 lg:-left-12 lg:mt-0 lg:w-64">
              <div className="anim-float2">
                <FeaturePanel />
              </div>
            </div>
          </Reveal>
        </div>

        {/* ---- row B: stats + quote ---- */}
        <div className="mt-24 grid gap-6 lg:mt-28 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div className="grid h-full grid-cols-2 divide-line/60 rounded-2xl border border-line2/60 bg-panel/50 sm:grid-cols-4 sm:divide-x">
              <Stat value={152} suffix="+" label="Talent Placed" />
              <Stat
                value={40}
                // decimals={1}
                suffix="+"
                label="Global Clinets"
              />
              <Stat
                value={12}
                // decimals={1}
                suffix="+"
                label="Contries Served"
              />
              <Stat
                value={98}
                decimals={1}
                suffix="%"
                label="Client Sertisfaction"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <QuoteRotator />
          </Reveal>
        </div>

        {/* ---- row C: trusted by ---- */}
         <TrustedByCarousel />

        {/* ---- row D: values ---- */}
        <Reveal className="mt-16 pb-20">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line/60 bg-line/40 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="group flex gap-4 bg-ink2/90 p-6 transition-colors hover:bg-panel/80">
                <v.icon
                  className={`h-7 w-7 shrink-0 ${v.tone} transition-transform group-hover:scale-110`}
                  strokeWidth={1.8}
                />
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.16em] ${v.tone}`}>
                    {v.title}
                  </p>
                  {v.lines.map((l) => (
                    <p
                      key={l}
                      className="mt-1 text-[13px] leading-snug text-mist">
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Stars />
            <span className="ml-2 text-xs text-mist">
              4.9 from 2,300+ founder reviews
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
