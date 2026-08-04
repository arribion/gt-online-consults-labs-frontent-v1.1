import { ArrowDownLeft, ArrowUpRight, Activity } from "lucide-react";
const stats = [
  {
    label: "Paid",
    value: "KES 0,000",
    change: "+12%",
    icon: ArrowDownLeft,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    badge: "bg-green-100 text-green-700",
  },
  {
    label: "Pending",
    value: "KES 0,000",
    change: "+5%",
    icon: ArrowUpRight,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
  },
  {
    label: "Tasks",
    value: "00",
    change: "+8",
    icon: Activity,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
];

const ClientStats = () => {
    return (
      <article>
        <div className="grid gap-5 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>

              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>

              <p className="mt-1 text-sm text-slate-500">
                {stat.label} this week
              </p>

              <div className="mt-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stat.badge}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </article>
    );
};

export default ClientStats;
