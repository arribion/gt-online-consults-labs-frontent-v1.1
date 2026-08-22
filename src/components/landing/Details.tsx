import image2 from "../../assets/image2.png"
import image1 from "../../assets/image1.png";
import { Reveal } from './ui';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const Details = () => {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl space-y-24 px-5 lg:px-8">
        {/* row 1 */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="min-w-0">
            <h3 className="font-display text-2xl font-extrabold leading-snug text-frost sm:text-3xl">
              Get Smart Recommendations That{" "}
              <span className="text-sky2">Actually Help</span>
            </h3>
            <p className="mt-4 leading-relaxed text-mist">
              You don't need to figure out what to do next — we'll tell you. The
              AI analyzes your Tasks and suggest your top 3 priorities,
              follow-ups, and overdue tasks based on your goals.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Priorities ranked by deadline and goal impact",
                "Stale threads and forgotten follow-ups resurfaced",
                "Suggestions explain themselves — see the “why”",
              ].map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 text-sm text-frost/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#4fd8c6]" />{" "}
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120} className="min-w-0">
            <div>
              <img src={image1} alt="" className="max-w-[30em]" />
            </div>
          </Reveal>
        </div>

        {/* row 2 — reversed */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Added -ml-4 lg:-ml-12 to pull the image left */}
          <Reveal
            delay={120}
            className="order-2 lg:order-1 min-w-0 -ml-3 lg:-ml-12">
            <div className="flex justify-start">
              <img src={image2} alt="" className="max-w-[30em] w-full h-auto" />
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2 min-w-0">
            <h3 className="font-display text-2xl font-extrabold leading-snug text-frost sm:text-3xl">
              Think Once.{" "}
              <span className="text-sky2">Take Action Forever.</span>
            </h3>
            <p className="mt-4 leading-relaxed text-mist">get description</p>
            <a
              href="#pricing"
              className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-sky2 hover:text-ice">
              get started as trainer
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default Details