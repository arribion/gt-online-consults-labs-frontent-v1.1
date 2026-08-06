import { Quote } from "lucide-react";
import { Avatar, Reveal, SectionTag, Stars } from "./ui";

const testimonials = [
  {
    text: "StartNotesAI is the smartest tool I've used all year. I just type in my messy thoughts, and it somehow turns them into a Monday plan. Magic.",
    name: "Lauren K.",
    role: "Fintech Founder",
  },
  {
    text: "I replaced 3 apps with this one. No joke — it handles my tasks, notes, even reminds me of things I forgot I wrote.",
    name: "Brian G.",
    role: "Healthtech CEO",
  },
  {
    text: "The daily AI summaries help me refocus every morning. I wish I had this when I was just starting out.",
    name: "Alex M.",
    role: "VC Founder",
  },
  {
    text: "My productivity shot up since using StartNotesAI. It's like having a chief of staff who actually understands me.",
    name: "Dana S.",
    role: "Edtech Co-Founder",
  },
  {
    text: "This is the only tool I open in the morning now. Everything's here. Notes, tasks, what I need to do next — all clean and ready.",
    name: "Chris P.",
    role: "SaaS Founder",
  },
  {
    text: "It's not just about taking notes. This app actually thinks and helps me get things done — faster than I ever could alone.",
    name: "Maya R.",
    role: "Startup Operator",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag icon={<Quote className="h-3.5 w-3.5" />}>Testimonials</SectionTag>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-frost sm:text-4xl">
            What Founders Are <span className="text-sky2">Saying</span>
          </h2>
          <p className="mt-4 text-mist">
            StartNotesAI is helping startup leaders stay focused, ship faster, and feel in control.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 2) * 110}>
              <figure className="card-hover relative h-full rounded-2xl border border-line2/60 bg-panel/60 p-7">
                <Quote className="absolute right-6 top-6 h-8 w-8 text-line2/70" />
                <Stars />
                <blockquote className="mt-4 pr-10 text-[15px] leading-relaxed text-frost/90">
                  {t.text}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-line/60 pt-5">
                  <Avatar name={t.name} i={i} />
                  <div>
                    <p className="text-sm font-bold text-frost">{t.name}</p>
                    <p className="text-xs text-mist">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
