import { Search, Tags, Wand2 } from "lucide-react";
import { Reveal, SectionTag } from "./ui";
import features from "../../assets/features.png";

export function Features() {
  return (
    <section id="workflow" className="scroll-mt-24 py-24 overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag icon={<Tags className="h-3.5 w-3.5" />}>
            Features
          </SectionTag>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-frost sm:text-4xl">
            You Focus on Building.
            <br />
            <span className="text-sky2">We Handle the Workflow.</span>
          </h2>
          <p className="mt-4 text-mist">
            Startup founders shouldn't spend hours organizing. StartNotesAI does
            the heavy lifting, giving you clarity and momentum from day one.
          </p>
        </Reveal>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          {/* Mobile: Order 2 (Bottom) | Desktop: Order 1 (Left) */}
          {/* Negative left margins pull the image out to the left edge safely */}
          <Reveal className="min-w-0 order-2 lg:order-1 -ml-10 sm:-ml-16">
            <div className="relative w-full">
              <img
                src={features}
                alt="Features presentation"
                className="w-full h-auto object-contain block"
              />
            </div>
          </Reveal>

          {/* Mobile: Order 1 (Top) | Desktop: Order 2 (Right) */}
          <Reveal delay={120} className="min-w-0 order-1 lg:order-2">
            <h3 className="font-display text-2xl font-extrabold text-frost">
              Organize Instantly,{" "}
              <span className="text-sky2">Not Manually</span>
            </h3>
            <p className="mt-4 leading-relaxed text-mist">
              No more hunting through scattered docs or sticky notes.
              StartNotesAI uses AI to auto-tag and group your notes by theme,
              project, or meeting — keeping everything connected and searchable.
            </p>
            <ul className="mt-7 space-y-4">
              {[
                {
                  icon: Tags,
                  t: "Auto-tagging by theme, project, or meeting — zero filing.",
                },
                {
                  icon: Search,
                  t: "Semantic search that finds ideas, not just keywords.",
                },
                {
                  icon: Wand2,
                  t: "One click from messy note to structured action plan.",
                },
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

export default Features;