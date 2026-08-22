import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Cloud,
  FileText,
  Hash,
  Mail,
  Network,
  ChartNoAxesCombined,
  StickyNote,
  Target,
} from "lucide-react";
import { Reveal, SectionTag } from "./ui";

/* ---------- context-aware linking graph ---------- */
const nodes = [
  {
    icon: Hash,
    x: 18,
    y: 12,
    tone: "text-[#e8a33d] border-[#e8a33d]/40 bg-[#e8a33d]/10",
  },
  { icon: StickyNote, x: 80, y: 15, tone: "text-frost border-line2 bg-panel" },
  {
    icon: CalendarDays,
    x: 88,
    y: 55,
    tone: "text-sky2 border-azure/40 bg-azure/10",
  },
  {
    icon: Cloud,
    x: 72,
    y: 88,
    tone: "text-[#4fd8c6] border-[#22b8a6]/40 bg-[#22b8a6]/10",
  },
  {
    icon: Mail,
    x: 22,
    y: 86,
    tone: "text-[#7f9df5] border-[#7f9df5]/40 bg-[#7f9df5]/10",
  },
  {
    icon: FileText,
    x: 10,
    y: 48,
    tone: "text-amber border-amber/40 bg-amber/10",
  },
];

function LinkGraph() {
  return (
    <div className="relative mt-6 aspect-square w-full">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        {nodes.map((n, i) => (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={n.x}
            y2={n.y}
            stroke="rgba(92,198,255,0.35)"
            strokeWidth="0.6"
            className="anim-dash"
          />
        ))}
      </svg>
      {/* center node */}
      <span className="anim-pulse-dot absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-linear-to-br from-azure to-[#1257b8] text-white shadow-lg">
        <ChartNoAxesCombined className="h-5 w-5" />
      </span>
      {nodes.map((n, i) => (
        <span
          key={i}
          className={`absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg border backdrop-blur ${n.tone}`}
          style={{ left: `${n.x}%`, top: `${n.y}%` }}>
          <n.icon className="h-4 w-4" />
        </span>
      ))}
    </div>
  );
}

export default function Benefits() {
  return (
    <section id="features" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag icon={<ChartNoAxesCombined className="h-3.5 w-3.5" />}>
            Benefits
          </SectionTag>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-frost sm:text-4xl">
            Everything You Need to Stay Organized{" "}
            <span className="text-sky2">Without Lifting a Finger at GT labs</span>
          </h2>
          <p className="mt-4 text-mist">
            Built for the fast-paced life of startup founders, these AI-powered
            features eliminate busywork and help you focus on building.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {/* Targeted Skills */}
          <Reveal className="lg:col-span-2">
            <div className="card-hover h-full rounded-2xl border border-line2/60 bg-panel/60 p-7">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-azure/15 text-sky2">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-frost">
                    Targeted Skills
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mist">
                    Pinpoints specific weaknesses in a workforce and delivers
                    instant, customized lessons to fix them.
                  </p>
                </div>
              </div>
              {/* mini transform mock */}
              <div className="mt-6 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <div className="rounded-xl border border-line/70 bg-deep/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-dim">
                    Tasks
                  </p>
                  <div className="mt-2 space-y-1.5">
                    <div className="h-1.5 w-full rounded bg-line" />
                    <div className="h-1.5 w-4/5 rounded bg-line" />
                    <div className="h-1.5 w-11/12 rounded bg-line" />
                    <div className="h-1.5 w-3/5 rounded bg-line" />
                  </div>
                </div>
                <span className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-azure/50 bg-azure/15 text-sky2">
                  <ArrowRight className="h-4 w-4" />
                </span>
                <div className="space-y-2 rounded-xl border border-[#22b8a6]/30 bg-[#22b8a6]/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#4fd8c6]">
                    Solutions
                  </p>
                  {[
                    "gt onlineconsult lab solution 1",
                    "gt onlineconsult lab solution 2",
                    "gt onlineconsult lab solution 3",
                  ].map((t) => (
                    <div
                      key={t}
                      className="flex items-center gap-2 text-[11px] text-frost/90">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#4fd8c6]" />{" "}
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Ethical Awareness Linking — tall */}
          <Reveal delay={120} className="lg:row-span-2">
            <div className="card-hover flex h-full flex-col rounded-2xl border border-line2/60 bg-panel/60 p-7">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#7f9df5]/15 text-[#9db4ff]">
                <Network className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-frost">
                Ethical Awareness
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mist">
                Integrates governance rules to ensure models and users act
                responsibly and fairly
              </p>
              <LinkGraph />
            </div>
          </Reveal>

          {/* Daily Smart Summaries */}
          <Reveal delay={80}>
            <div className="card-hover h-full rounded-2xl border border-line2/60 bg-panel/60 p-7">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber/15 text-amber">
                <CalendarDays className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-frost">
                Daily Smart Summaries
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mist">
                Wake up to a digest of what's on your plate — tasks, priorities,
                and what AI suggests.
              </p>
              <div className="mt-5 space-y-2.5">
                <div className="rounded-lg border border-line/70 bg-deep/70 px-3.5 py-2.5">
                  <p className="text-[10px] font-bold text-sky2">
                    AI Morning Summary
                  </p>
                  <p className="mt-0.5 text-[11px] text-mist">
                    3 priorities · 2 follow-ups · 1 win to log
                  </p>
                </div>
                <div className="rounded-lg border border-line/70 bg-deep/70 px-3.5 py-2.5">
                  <p className="text-[10px] font-bold text-amber">
                    Smart Risk Alert
                  </p>
                  <p className="mt-0.5 text-[11px] text-mist">
                    Board deck deadline at risk — reprioritize?
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Scalability */}
          <Reveal delay={140}>
            <div className="card-hover h-full rounded-2xl border border-line2/60 bg-panel/60 p-7">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#22b8a6]/15 text-[#4fd8c6]">
                <Target className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-frost">
                Scalability
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mist">
                Reaches large groups of workers or processes massive datasets
                all at once without losing quality.
              </p>
              <div className="mt-5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-frost">Launch beta</span>
                  <span className="text-sky2">68%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full w-[68%] rounded-full bg-linear-to-r from-azure to-sky2" />
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
