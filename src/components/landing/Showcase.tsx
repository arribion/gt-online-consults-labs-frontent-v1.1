
import Features from "./Features";
import Process from "./Process";
import Details from "./Details";

// function GoalsMock({ title, tint }: { title: string; tint: string }) {
//   return (
//     <div className="glow-ring rounded-2xl border border-line2/60 bg-deep/90 p-5">
//       <div className="flex items-center justify-between border-b border-line/60 pb-3">
//         <p className="font-display text-sm font-bold text-frost">{title}</p>
//         <span className="rounded-md bg-panel px-2 py-1 text-[10px] font-semibold text-mist">Live</span>
//       </div>
//       <div className="mt-3 space-y-2.5">
//         {rows.map((r) => (
//           <div key={r.t} className="flex items-center gap-3 rounded-xl border border-line/60 bg-panel/60 p-3 transition-colors hover:border-line2">
//             <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${r.tone}`}>
//               <ListTodo className="h-4 w-4" />
//             </span>
//             <div className="min-w-0 flex-1">
//               <p className="truncate text-xs font-semibold text-frost">{r.t}</p>
//               <p className="truncate text-[10px] text-mist">{r.s}</p>
//             </div>
//             <div className="w-14">
//               <div className="h-1 overflow-hidden rounded-full bg-line">
//                 <div className={`h-full rounded-full ${tint}`} style={{ width: `${r.p}%` }} />
//               </div>
//               <p className="mt-1 text-right text-[9px] text-dim">{r.p}%</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
// );
  
export default function Showcase() {
  return (
    <>
      <Details />
      <Process />
      <Features />
    </>
  );
}
