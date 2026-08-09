import { ArrowRight, Check, Crown } from "lucide-react";
import { Reveal, SectionTag } from "./ui";

const plans = [
  {
    name: "Starter",
    price: "Free",
    per: "",
    blurb: "Perfect for early-stage founders",
    features: [
      "Up to 100 notes/tasks/month",
      "Basic AI suggestions",
      "Daily summary",
      "1 workspace",
    ],
    cta: "Get started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$12",
    per: "/month",
    blurb: "Built for serious solo builders",
    features: [
      "Unlimited notes & tasks",
      "Advanced AI features",
      "Goal tracking & reminders",
      "Project timelines",
      "3 workspaces",
    ],
    cta: "Get started",
    featured: true,
  },
  {
    name: "Team",
    price: "$29",
    per: "/month",
    blurb: "For fast-moving teams",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Shared notes/tasks",
      "Admin & permissions",
      "Slack/Calendar integration",
    ],
    cta: "Contact Us",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag icon={<Crown className="h-3.5 w-3.5" />}>Pricing for Companies</SectionTag>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-frost sm:text-4xl">
            Start Smart. <span className="text-sky2">Scale Fast.</span>
          </h2>
          <p className="mt-4 text-mist">
            Whether you're a solo founder or a growing team, there's a plan to help you stay
            productive and focused.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 120}>
              <div
                className={`card-hover relative flex h-full flex-col rounded-2xl border p-7 ${
                  p.featured
                    ? "border-azure/60 bg-linear-to-b from-azure/12 to-panel/70 shadow-[0_30px_80px_-30px_rgba(47,157,255,0.55)] lg:-translate-y-3"
                    : "border-line2/60 bg-panel/60"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3.5 right-6 inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-amber to-[#e88a2a] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-deep shadow-lg">
                    <Crown className="h-3 w-3" /> Popular
                  </span>
                )}
                <h3 className="font-display text-xl font-bold text-frost">{p.name}</h3>
                <p className="mt-1 text-xs text-mist">{p.blurb}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="font-display text-4xl font-extrabold text-frost">{p.price}</span>
                  {p.per && <span className="pb-1 text-sm text-mist">{p.per}</span>}
                </div>
                <div className="my-6 h-px bg-line/70" />
                <ul className="flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-frost/90">
                      <span
                        className={`mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full ${
                          p.featured ? "bg-azure/25 text-sky2" : "bg-[#22b8a6]/15 text-[#4fd8c6]"
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#top"
                  className={`group mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                    p.featured
                      ? "bg-linear-to-r from-azure to-[#1873e0] text-white shadow-[0_14px_36px_-12px_rgba(47,157,255,0.8)] hover:-translate-y-0.5"
                      : "border border-line2 bg-ink2 text-frost hover:border-sky2/60 hover:bg-panel"
                  }`}
                >
                  {p.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <p className="text-xs text-mist">
            All plans include end-to-end encryption · No credit card required · Cancel anytime
          </p>
        </Reveal>
      </div>
    </section>
  );
}
