/* ---------- brand ---------- */
import logo from "../../assets/gt-logo.png";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="group flex items-center gap-2.5">
      {/* Outer wrapper wrapper holds the defined size */}
      <span className="relative grid h-9 w-9 place-items-center rounded bg-linear-to-br from-azure to-[#eff3f9] shadow-[0_8px_24px_-8px_rgba(47,157,255,0.7)]">
        {/* Core Logo Image */}
        <img src={logo} alt="" className="max-w-[2em]" />

        {/* Notification indicator positioned relative to the outer h-9 w-9 container */}
        <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
          {/* Pulsing Aura */}
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75 shadow-[0_0_10px_rgba(255,180,84,0.9)]"></span>
          {/* Solid Center */}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
        </span>
      </span>

      {!compact && (
        <div>
          <span className="font-display font-bold tracking-tight text-frost">
            GT. <span className="text-sky2">ONLINECONSULTS</span>
          </span>
          <p className="text-[4px]">AI & TECHNOLOGY</p>
        </div>
      )}
    </a>
  );
}