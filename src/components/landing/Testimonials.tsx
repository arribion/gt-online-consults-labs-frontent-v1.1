import { Quote } from "lucide-react";
import { Avatar, Reveal, SectionTag, Stars } from "./ui";

const testimonials = [
  {
    text: "Hapa its for demmy reviews",
    name: "Lauren K.",
    role: "Fintech Founder",
  },
  {
    text: "Hapa its for demmy reviews. One sentence or two each",
    name: "Brian G.",
    role: "Healthtech CEO",
  },
  {
    text: "I wish I had this when I was just starting out.",
    name: "Alex M.",
    role: "VC Founder",
  },
  {
    text: "It's like having a chief of staff who actually understands me.",
    name: "Dana S.",
    role: "Edtech Co-Founder",
  },
  {
    text: "Everything's here. Notes, tasks, what I need to do next all clean and ready.",
    name: "Chris P.",
    role: "SaaS Found",
  },
  {
    text: "This app actually thinks and helps me get things done faster than I ever could alone.",
    name: "Maya R.",
    role: "Startup Operator",
  },
];

// Duplicate items to ensure seamless infinite looping
const row1 = [...testimonials.slice(0, 3), ...testimonials.slice(0, 3)];
const row2 = [...testimonials.slice(3), ...testimonials.slice(3)];

export default function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-24 py-24 overflow-hidden">
      {/* Small inline style helper just to handle the pause-on-hover effect cleanly */}
      <style>{`
        .pause-on-hover:hover {
          animation-play-state: paused !important;
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-5 lg:px-8 mb-14">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag icon={<Quote className="h-3.5 w-3.5" />}>
            Testimonials
          </SectionTag>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-frost sm:text-4xl">
            What Founders Are <span className="text-sky2">Saying</span>
          </h2>
          <p className="mt-4 text-mist">
            gt online consults is helping startup leaders stay focused, ship
            faster, and feel in control.
          </p>
        </Reveal>
      </div>

      {/* Infinite Carousel Container with edge fading masks */}
      <div className="flex flex-col gap-6 w-full mask-[linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
        {/* Top Row: Moving Right (Reuses your tailwind config animation, but reversed) */}
        <div className="flex w-full overflow-hidden">
          <div
            className="flex gap-12 w-max px-6 pause-on-hover"
            style={{ animation: "infiniteScroll 25s linear infinite reverse" }}>
            {row1.map((t, i) => (
              <TestimonialCard key={`r1-${t.name}-${i}`} t={t} i={i} />
            ))}
          </div>
        </div>

        {/* Bottom Row: Moving Left (Uses your exact tailwind config animation setup) */}
        <div className="flex w-full overflow-hidden">
          <div
            className="flex gap-12 w-max px-6 pause-on-hover"
            style={{ animation: "infiniteScroll 25s linear infinite" }}>
            {row2.map((t, i) => (
              <TestimonialCard key={`r2-${t.name}-${i}`} t={t} i={i + 3} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t, i }: { t: typeof testimonials[number]; i: number }) {
  return (
    <figure className="card-hover relative w-90 shrink-0 rounded-2xl border border-line2/60 bg-panel/60 p-7">
      <Quote className="absolute right-6 top-6 h-8 w-8 text-line2/70" />
      <Stars />
      <blockquote className="mt-4 pr-10 text-[15px] leading-relaxed text-frost/90">
        "{t.text}"
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line/60 pt-5">
        <Avatar name={t.name} i={i} />
        <div>
          <p className="text-sm font-bold text-frost">{t.name}</p>
          <p className="text-xs text-mist">{t.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}