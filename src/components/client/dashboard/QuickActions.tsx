import { Send, Download, CalendarDays, BookOpenText } from "lucide-react";
import { Link } from "react-router-dom";


export function QuickActions() {
  const actions = [
    {
      icon: CalendarDays,
      label: "Google Calenda",
      color: "bg-warning",
      link: "https://calendar.google.com/calendar/u/0/r?cid=ZjI2MmQwYTExZTE4MzY5ZTIxMzA2MTBmMWUxOTRlNGNlYTYyYzA4ODM0NTExMmIyMTM0MWZiNTE0MDIzNTY2OUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t",
    },
    {
      icon: BookOpenText,
      label: "Google Form",
      color: "bg-green-500",
      link: "https://docs.google.com/forms/d/e/1FAIpQLSfE3VTctziQDu15Odjr12wgCL6_-B3cfKQJjWuW2BvE5avB-A/closedform",
    },
    {
      icon: Send,
      label: "Task Logging",
      color: "bg-gray-500",
      link: "/client/tasks",
    },
    {
      icon: Download,
      label: "Export Invoice",
      color: "bg-gray-500",
      link: "#",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-1">
      {actions.map((action) => (
        <Link
          key={action.label}
          to={action.link}
          className="group flex flex-col items-center gap-4 rounded-[10px] border border-border bg-card p-4 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
          <button>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color} transition-transform group-hover:scale-105`}>
              <action.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xs font-semibold text-sky-500">
              {action.label}
            </span>
          </button>
        </Link>
      ))}
    </div>
  );
}
