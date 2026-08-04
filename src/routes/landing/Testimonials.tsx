// // New Testimonials Section
// export function TestimonialsSection() {
//   const testimonials = [
//     {
//       name: "Amelia Earhart",
//       role: "Freelancer",
//       feedback:
//         "The most difficult thing is the decision to act, the rest is merely tenacity.",
//     },
//     {
//       name: "Karen Lamb",
//       role: "##########",
//       feedback: "A year from now you may wish you had started today.",
//     },
//     {
//       name: "Winston Churchill",
//       role: "##########",
//       feedback:
//         "Success is not final; failure is not fatal: It is the courage to continue that counts.",
//     },
//     {
//       name: "Walt Disney",
//       role: "Consultant",
//       feedback:
//         "All our dreams can come true, if we have the courage to pursue them.",
//     },
//   ];

//   return (
//     <section className="py-20 ">
//       <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-4 gap-8">
//           {testimonials.map((t) => (
//             <div
//               key={t.name}
//               className="rounded-xl border border-border bg-card p-6 shadow-card">
//               <div className="flex items-center mb-4">
//                 {[...Array(5)].map((_, i) => (
//                   <Star
//                     key={i}
//                     className="h-4 w-4 text-yellow-400 fill-yellow-400"
//                   />
//                 ))}
//               </div>
//               <p className="text-muted-foreground mb-4">"{t.feedback}"</p>
//               <h4 className="text-sm font-semibold text-card-foreground">
//                 <del>{t.name}</del>
//               </h4>
//               <p className="text-xs text-muted-foreground">{t.role}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
