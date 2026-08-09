import { ArrowRight, AtSign, Bug, Globe, Rss, Send } from "lucide-react";
import { Logo, Reveal } from "./ui";

const cols = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
  },
  { title: "Company", links: ["About", "Careers", "Blog", "Press", "Contact"] },
  {
    title: "Resources",
    links: ["Help Center", "API Docs", "Community", "Status", "Security"],
  },
];

export default function Footer() {
  return (
    <footer className="relative">
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

      {/* footer grid */}
      <div className="border-t border-line/60 bg-deep/70">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-mist">
              footer kasmall about one or two sentences
            </p>
            <div className="mt-6 flex gap-3">
              {[AtSign, Globe, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#top"
                  aria-label="Social link"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-line2/60 bg-panel text-mist transition-all hover:-translate-y-0.5 hover:border-sky2/60 hover:text-sky2">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky2">
                {c.title}
              </p>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#top"
                      className="text-sm text-mist transition-colors hover:text-frost">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-line/50">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-dim sm:flex-row lg:px-8">
            <p className="text-sm text-sky-100">
              &copy; {new Date().getFullYear()} GT. All Rights Reserved.
            </p>
            <p>
              Designed and Developed by:{" "}
              <a
                target="_blank"
                href="www.arribion.com"
                className="font-semibold text-mist transition-colors hover:text-sky2">
                - Arribion Technologies
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t flex justify-center border-sky-400 mt-8 px-6 py-4 flex-col md:flex-row items-center gap-4">
        <a
          href="https://wa.me/254707468863?text=I would like to report a bug/suggestion in the qt-online application."
          target="_blank"
          rel="noopener noreferrer">
          <button
            className="flex items-center gap-2 rounded-3xl bg-linear-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white hover:from-emerald-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label="Report a bug or suggestion">
            <Bug size={16} />
            Report a Bug & Suggestions
          </button>
        </a>
      </div>
    </footer>
  );
}
