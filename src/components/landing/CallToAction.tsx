import { ArrowRight, Rss } from "lucide-react";
import { Reveal } from "./ui";

const CallToAction = () => {
  return (
      <section>
           {/* CTA band */}
                <div className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
                  <Reveal>
                    <div className="relative overflow-hidden rounded-3xl border border-azure/40 bg-linear-to-br from-[#0c2c58] via-panel to-ink2 px-8 py-14 text-center sm:px-14">
                      <div
                        className="pointer-events-none absolute inset-0 opacity-60"
                        style={{
                          background:
                            "radial-gradient(500px 220px at 20% 0%, rgba(47,157,255,0.28), transparent 65%), radial-gradient(500px 240px at 85% 100%, rgba(92,198,255,0.2), transparent 65%)",
                        }}
                      />
                      <div className="relative">
                        <span className="inline-flex items-center gap-2 rounded-full border border-line2/70 bg-deep/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-sky2">
                          <Rss className="h-3.5 w-3.5" /> Start free today
                        </span>
                        <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-frost sm:text-4xl">
                          Ready to Let GT onlineconsult help you utilize your potential?
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-mist">
                          Join 100,000+ founders who stopped organizing and started
                          shipping. Your first workspace is live in under a minute.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                          <a
                            href="#top"
                            className="group inline-flex items-center gap-2.5 rounded-xl bg-linear-to-r from-azure to-[#1873e0] px-7 py-3.5 text-sm font-bold text-white shadow-[0_16px_44px_-12px_rgba(47,157,255,0.85)] transition-all hover:-translate-y-0.5">
                            Join our Network Talents
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </a>
                          <a
                            href="#how"
                            className="inline-flex items-center gap-2 rounded-xl border border-line2 bg-deep/50 px-7 py-3.5 text-sm font-bold text-frost transition-colors hover:border-sky2/60">
                            Hire Trainers
                          </a>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>
    </section>
  )
}

export default CallToAction