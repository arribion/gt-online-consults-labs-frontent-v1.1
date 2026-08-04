// // New Features Section
// export function FeaturesSection() {
//   const features = [
//     {
//       icon: Server,
//       title: "Task Automation",
//       description:
//         "Streamline workflows with automated task assignments and reminders.",
//     },
//     {
//       icon: Lock,
//       title: "Secure Payments",
//       description:
//         "We ensure your payed on time and securely with our integrated payment system.",
//     },
//     {
//       icon: Globe,
//       title: "Scalable Projects",
//       description:
//         "Handle small tasks or enterprise-level projects seamlessly.",
//     },
//     {
//       icon: Star,
//       title: "Real-time Updates",
//       description: "Stay informed with instant notifications and dashboards.",
//     },
//   ];

//   return (
//     <section className="py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[70vh]">
//       <div>
//         <h2 className="text-3xl font-bold text-center text-sky-500 mb-8">
//           Outstanding Workmanship
//         </h2>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {features.map((f) => (
//           <div
//             key={f.title}
//             className="rounded-lg border-l-4 border-sky-500 min-h-37.5 bg-card p-6 shadow-card">
//             <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white mb-4">
//               <f.icon className="h-5 w-5" />
//             </span>
//             <h3 className="text-xl font-semibold text-card-foreground mb-2">
//               {f.title}
//             </h3>
//             <p className="text-muted-foreground">{f.description}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }