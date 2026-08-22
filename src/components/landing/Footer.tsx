import { AtSign, Globe, Send } from "lucide-react";
import { Logo } from "../common/Logo";

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
            <p className="text-sm text-sky-600">
              &copy; {new Date().getFullYear()} GT. All Rights Reserved.
            </p>
            <div>
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
      </div>
    </footer>
  );
}
