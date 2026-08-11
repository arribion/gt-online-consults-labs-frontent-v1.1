import openAI from "../../assets/icons/open-ai.png";
import brex from "../../assets/icons/brex.png";
import shopify from "../../assets/icons/shopfy.png";
import deel from "../../assets/icons/deel.png";
import remote from "../../assets/icons/remote.png";
import sumsub from "../../assets/icons/sumsub.png";
import github from "../../assets/icons/github.png";
import canva from "../../assets/icons/canva.png";

import { Reveal } from "./ui";

const brands = [
  { icon: openAI, alt: "OpenAI" },
  { icon: brex, alt: "Brex" },
  { icon: shopify, alt: "Shopify" },
  { icon: deel, alt: "Deel" },
  { icon: sumsub, alt: "Sumsub" },
  { icon: remote, alt: "Remote" },
  { icon: github, alt: "GitHub" },
  { icon: canva, alt: "Canva" },
];

// Duplicate the array to create a seamless looping illusion
const duplicatedBrands = [...brands, ...brands];

export default function TrustedByCarousel() {
  return (
    <Reveal className="mt-16 w-full max-w-5xl mx-auto overflow-hidden">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-sky2/80 mb-6">
        Trusted by founders building at
      </p>

      {/* Main Container: Masks the overflowing logos */}
      <div className="relative flex w-full overflow-x-hidden rounded  py-5">
        {/* Optional CSS Gradient Fades for a premium look */}
        <div className="absolute inset-y-0 left-0 w-16 bg-linear-to-r from-deep/50 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-linear-to-l from-deep/50 to-transparent z-10 pointer-events-none" />

        {/* Moving Track */}
        <div
          className="flex gap-12 w-max px-6"
          style={{
            animation: "infiniteScroll 25s linear infinite",
          }}>
          {/* Injecting keyframes globally so you don't need tailwind.config.js */}
          <style>{`
    @keyframes infiniteScroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
  `}</style>

          {duplicatedBrands.map((brand, index) => (
            <span
              key={index}
              className="flex shrink-0 items-center justify-center transition-opacity hover:opacity-100 opacity-80">
              <img
                src={brand.icon}
                alt={brand.alt}
                className="h-7 w-auto object-contain"
              />
            </span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}