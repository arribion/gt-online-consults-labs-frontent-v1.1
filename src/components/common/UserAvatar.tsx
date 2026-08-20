import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

const TONES = [
  "from-azure to-[#0f4fa8]",
  "from-[#22b8a6] to-[#0d7a86]",
  "from-amber to-[#d97a1f]",
  "from-[#5cc6ff] to-[#2563c9]",
  "from-[#7f8ff0] to-[#3b4fc0]",
  "from-[#f07fa0] to-[#b83a66]",
];

/** Stable per-person tone, so the same face keeps the same colour across screens. */
const toneFor = (seed: string): string => {
  let hash = 0;
  for (let index = 0; index < seed.length; index++) hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
};

export function UserAvatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dimension = { sm: "h-8 w-8 text-[10px]", md: "h-10 w-10 text-xs", lg: "h-14 w-14 text-sm" }[
    size
  ];

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn("shrink-0 rounded-full object-cover ring-2 ring-line2/60", dimension, className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-linear-to-br font-bold text-white ring-2 ring-line2/60",
        toneFor(name),
        dimension,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
