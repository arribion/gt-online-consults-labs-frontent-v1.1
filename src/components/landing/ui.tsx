import type { ReactNode } from "react";
import {  Star } from "lucide-react";
import { useReveal } from "../../hooks/hooks";

/* ---------- scroll reveal wrapper ---------- */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------- small pill tag above section titles ---------- */
export function SectionTag({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line2/70 bg-panel/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky2">
      {icon}
      {children}
    </span>
  );
}



/* ---------- star rating ---------- */
export function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber text-amber" />
      ))}
    </span>
  );
}

/* ---------- avatar with initials ---------- */
const avatarTones = [
  "from-azure to-[#0f4fa8]",
  "from-[#22b8a6] to-[#0d7a86]",
  "from-amber to-[#d97a1f]",
  "from-[#5cc6ff] to-[#2563c9]",
  "from-[#7f8ff0] to-[#3b4fc0]",
  "from-[#f07fa0] to-[#b83a66]",
];
export function Avatar({ name, i = 0 }: { name: string; i?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-linear-to-br ${avatarTones[i % avatarTones.length]} text-xs font-bold text-white ring-2 ring-line2/60`}
    >
      {initials}
    </span>
  );
}
