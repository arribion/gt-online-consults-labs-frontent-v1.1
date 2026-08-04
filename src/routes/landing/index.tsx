import { Check, Loader, Star } from "lucide-react";
import { FeaturesSection, HeroSection, TestimonialsSection } from "./HeroSection";

const services = [
  {
    title: "VIDEO  ANNOTATION",
    subtitle: "Labeling & tagging for AI",
    imgAlt: "Video annotation",
    imgSrc: "https://picsum.photos/seed/3dart/400/300",
  },
  {
    title: "BUG HUNTING",
    subtitle: "Identifying and fixing software issues",
    imgAlt: "Bug hunting",
    imgSrc: "https://picsum.photos/seed/bughunting/400/300",
  },
  {
    title: "MAP ANNOTATION",
    subtitle: "Geospatial data labeling",
    imgAlt: "Map annotation",
    imgSrc: "https://picsum.photos/seed/map/400/300",
  },
  {
    title: "PROMPT ENGINEERING",
    subtitle: "Optimizing AI prompts for better results",
    imgAlt: "Prompt engineering",
    imgSrc: "https://picsum.photos/seed/prompt/400/300",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main>
        <HeroSection />

        <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <div>
            <h2 className="text-sm font-semibold text-sky-500">
              POPULAR SERVICES
            </h2>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
              Find and Work as Online freelancer
            </h1>
            <p className="mt-4 text-gray-600 max-w-xl">
              Browse curated online work and get payed without any middlemen and
              delays. Reliable, fast, and secure.
            </p>

            <div
              id="services"
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((s) => (
                <div
                  key={s.title}
                  className="bg-white rounded-lg shadow-sm overflow-hidden flex">
                  <div className="w-1/3">
                    <img
                      src={s.imgSrc}
                      alt={s.imgAlt}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="text-xs text-gray-500">{s.title}</div>
                    <div className="mt-2 font-semibold">{s.subtitle}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">
                        <Star size={20} color="blue"/>
                      </span>
                      <span className="text-sm text-gray-500">Top rated</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            {/* Hero image: person sitting casual */}
            <img
              src="https://picsum.photos/seed/hero-person/600/500"
              alt="Person sitting"
              className="rounded-xl shadow-lg object-cover w-full "
            />
          </div>
        </section>

        <FeaturesSection />

        {/* FEATURE / OUTSTANDING WORKMANSHIP */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex items-center justify-center">
              <img
                src="https://picsum.photos/seed/laptop-work/560/360"
                alt="Man working on laptop"
                className="rounded-xl shadow-md object-cover w-full"
              />
            </div>

            <div>
              <h3 className="text-indigo-600 font-semibold">
                FIND OUTSTANDING ONLINEWORK
              </h3>
              <h2 className="mt-4 text-3xl font-bold">
                Professional results, every time
              </h2>
              <p className="mt-4 text-gray-600">
                We connect you with verified online jobs. From from assessment, onboarding and finally tasking.
                We ensure that you get easy good paying projects to task on.                </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Check size={20} />
                  </div>
                  <div>
                    <div className="font-semibold">Vetted talent</div>
                    <div className="text-sm text-gray-500">
                      Only top-rated freelancers make the cut.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Loader className="animate-spin" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold">Fast Payment</div>
                    <div className="text-sm text-gray-500">
                      Timely Payment for your quality work.
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <TestimonialsSection />
      </main>
    </div>
  );
}
