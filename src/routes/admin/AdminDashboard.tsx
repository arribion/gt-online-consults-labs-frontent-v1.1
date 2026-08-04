import { useEffect, useMemo, useState } from "react";
import {
  Users,
  FolderKanban,
  BadgeCheck,
  Clock3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import QuickActions from "../../components/admin/QuickActions";
import { Oval } from "react-loader-spinner";
import toast from "react-hot-toast";
import useAdminApi from "../../hooks/useAdminApi";
import type { StatItem, PaymentItem } from "../../types/admin";

// Chart imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const statIcons = {
  members: Users,
  projects: FolderKanban,
  paid: BadgeCheck,
  pending: Clock3,
};

const buildStatCards = (s: any): StatItem[] => {
  return [
    {
      label: "Total Members",
      value: String(s.totalMembers ?? 0),
      change: s.membersChange ?? "+0%",
      trend: (s.membersTrend ?? "up") as "up" | "down",
      icon: statIcons.members,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Projects",
      value: String(s.totalProjects ?? 0),
      change: s.projectsChange ?? "+0%",
      trend: (s.projectsTrend ?? "up") as "up" | "down",
      icon: statIcons.projects,
      accent: "bg-green-50 text-green-600",
    },
    {
      label: "Paid Users",
      value: String(s.paidUsers ?? 0),
      change: s.paidChange ?? "+0%",
      trend: (s.paidTrend ?? "up") as "up" | "down",
      icon: statIcons.paid,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Pending Payments",
      value: String(s.pendingPayments ?? 0),
      change: s.pendingChange ?? "+0%",
      trend: (s.pendingTrend ?? "down") as "up" | "down",
      icon: statIcons.pending,
      accent: "bg-amber-50 text-amber-600",
    },
  ];
};

const DEFAULT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const AdminDashboard = () => {
  const { getStats, getRecentPayments } = useAdminApi();
  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const s = await getStats();
        const payments = await getRecentPayments();

        if (!mounted) return;

        setStats(buildStatCards(s));
        setRecentPayments(payments.length ? payments : []);
      } catch (err: any) {
        if (!mounted) return;
        toast.error("Unable to load dashboard data. Showing defaults.");
        setStats(buildStatCards({}));
        setRecentPayments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [getStats, getRecentPayments]);

  // Build chart data from recentPayments
  const chartData = useMemo(() => {
    // If payments include a date and status, aggregate by month
    const months = DEFAULT_MONTHS;
    const paidByMonth = new Array(12).fill(0);
    const pendingByMonth = new Array(12).fill(0);

    recentPayments.forEach((p) => {
      // try to parse date; fallback to current month
      const d = p.date ? new Date(p.date) : new Date();
      const m = isNaN(d.getMonth()) ? new Date().getMonth() : d.getMonth();
      if (String(p.status).toLowerCase().includes("paid")) {
        paidByMonth[m] +=
          Number(String(p.amount).replace(/[^0-9.-]+/g, "")) || 0;
      } else {
        pendingByMonth[m] +=
          Number(String(p.amount).replace(/[^0-9.-]+/g, "")) || 0;
      }
    });

    // If no payments, show small defaults so chart renders
    const hasData =
      paidByMonth.some((v) => v > 0) || pendingByMonth.some((v) => v > 0);
    const paid = hasData ? paidByMonth : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const pending = hasData
      ? pendingByMonth
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    return {
      labels: months,
      datasets: [
        {
          label: "Paid (KES)",
          data: paid,
          backgroundColor: "rgba(16,185,129,0.85)", // emerald-500
          borderColor: "rgba(16,185,129,1)",
          borderWidth: 1,
        },
        {
          label: "Pending (KES)",
          data: pending,
          backgroundColor: "rgba(250,204,21,0.85)", // amber-400
          borderColor: "rgba(250,204,21,1)",
          borderWidth: 1,
        },
      ],
    };
  }, [recentPayments]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" as const },
        title: {
          display: true,
          text: "Monthly Payments (Paid vs Pending)",
          font: { size: 14 },
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const value = context.raw ?? 0;
              return `KES ${Number(value).toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: function (value: any) {
              return `KES ${Number(value).toLocaleString()}`;
            },
          },
        },
      },
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Oval height={80} width={80} color="#0EA5E9" visible />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-green-700">Dashboard/</h1>
        <p className="mb-2 text-gray-600">
          Overview of members, projects, payments, and pending balances.
        </p>
      </div>

      {/* Parent grid: ensure items align to start so columns don't stretch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: stats + chart */}
        <div className="lg:col-span-2">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 auto-rows-min">
            {stats.map((item) => {
              const Icon = item.icon;
              const TrendIcon =
                item.trend === "up" ? ArrowUpRight : ArrowDownRight;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {item.label}
                      </p>
                      <h2 className="mt-3 text-3xl font-bold text-gray-900">
                        {item.value}
                      </h2>
                    </div>

                    <div className={`rounded-2xl p-3 ${item.accent}`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-sm font-medium">
                    <TrendIcon
                      size={18}
                      className={
                        item.trend === "up" ? "text-green-600" : "text-red-600"
                      }
                    />
                    <span
                      className={
                        item.trend === "up" ? "text-green-600" : "text-red-600"
                      }>
                      {item.change}
                    </span>
                    <span className="text-gray-500">from last month</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart card */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between px-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Payments Trend
                </h3>
                <p className="text-sm text-gray-500">
                  Monthly paid vs pending totals
                </p>
              </div>
              <div className="text-sm text-gray-500">Last 12 months</div>
            </div>

            <div className="mt-4 h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* QuickActions: prevent stretching with self-start and keep a sensible max width */}
        <div className="lg:col-span-1 self-start">
          <QuickActions />
        </div>
      </div>

      {/* Payments overview and table remain the same; they will render with empty data if none */}
      {/* Keep your existing Payments Overview and Recent Payments table below */}
    </div>
  );
};

export default AdminDashboard;