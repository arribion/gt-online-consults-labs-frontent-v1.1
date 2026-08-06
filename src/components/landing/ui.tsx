import type { ReactNode } from "react";
import {  Star } from "lucide-react";
import { useReveal } from "../../hooks/hooks";
import logo from "../../assets/gt-logo.png";
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

/* ---------- brand ---------- */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="group flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-azure to-[#eff3f9] shadow-[0_8px_24px_-8px_rgba(47,157,255,0.7)]">
        <img src={logo} alt="" className="max-w-[2em]" />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber shadow-[0_0_10px_rgba(255,180,84,0.9)]" />
      </span>
      {!compact && (
        <div>
          <span className="font-display text-lg font-bold tracking-tight text-frost">
            GT. <span className="text-sky2">ONLINECONSULTS</span>
          </span>
          <p className="text-[4px]">AI & TECHNOLOGY</p>
        </div>
      )}
    </a>
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
