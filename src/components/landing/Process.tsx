import {
  ArrowRight,
  Lightbulb,
  LogIn,
  NotepadText,
  ScanFace,
} from "lucide-react";
import { Reveal, SectionTag } from "./ui";
import { Fragment } from "react/jsx-runtime";

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

export function Process() {
  return (
    <section id="how" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag icon={<Lightbulb className="h-3.5 w-3.5" />}>
            The process
          </SectionTag>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-frost sm:text-4xl">
            It's That Simple. Just Write, and Let AI Do the Rest.
          </h2>
          <p className="mt-4 text-mist">
            StartNotesAI fits into your workflow — not the other way around.
            Here's how to get started:
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
                  <h3 className="mt-4 font-display text-lg font-bold text-frost">
                    {s.title}
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-mist">
                    {s.body}
                  </p>
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


export default Process