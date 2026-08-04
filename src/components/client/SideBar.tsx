import gt_logo from "../../assets/gt-logo.png";
import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  House,
  Grid,
  CheckSquare,
  FileText,
  FolderOpen,
  CreditCard,
  BookOpen,
  Settings,
  Notebook,
} from "lucide-react";

export type IconComponent = React.ComponentType<React.ComponentProps<typeof Grid>>;

export interface ClientLink {
  id: number;
  label: string;
  link: string;
  icon?: IconComponent;
  disabled?: boolean;
}
// /client/my - tasks;
const clientLinks: ClientLink[] = [
  { id: 1, label: "Dashboard", link: "/client/dashboard", icon: House },
  { id: 2, label: "My Tasks", link: "/client/my-tasks", icon: Grid },
  { id: 3, label: "Task Log", link: "/client/tasks-log", icon: CheckSquare },
  { id: 4, label: "Invoices", link: "/client/invoices", icon: FileText },
  { id: 5, label: "Projects", link: "/client/projects", icon: FolderOpen },
  { id: 6, label: "Payments", link: "/client/payments", icon: CreditCard },
  { id: 7, label: "Resources", link: "/client/resources", icon: BookOpen },
  { id: 8, label: "Quick Note", link: "/client/note", icon: Notebook },
  { id: 9, label: "Settings", link: "/client/settings", icon: Settings },
];

const linkBaseStyle =
  "flex  items-center gap-3 px-4 py-2 rounded-[5px] transition-colors hover:bg-white/10";
const getLinkStyle = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? `${linkBaseStyle} bg-white/20 text-white font-medium`
    : `${linkBaseStyle} text-slate-200`;

const SideBar: React.FC = () => {
  return (
    <aside className="gradient-primary fixed h-screen p-4 w-56 md:w-56 lg:w-62.5">
      <Link to="/" className="flex items-center gap-2.5 mb-4">
        <img src={gt_logo} alt="GT-ONLINE" className="max-w-[2em]" />
        <h1 className="text-slate-50 text-[12px] font-semibold">GT-ONLINE</h1>
      </Link>

      <nav className="mt-[2em]">
        <ul className="space-y-2">
          {clientLinks.map((item) => {
            const Icon = item.icon ?? null;
            return (
              <li key={item.id}>
                <NavLink to={item.link} className={getLinkStyle}>
                  {/* fixed-width icon container keeps labels aligned */}
                  <span className="flex h-5 w-5 items-center justify-center text-slate-200">
                    {Icon ? <Icon size={16} /> : null}
                  </span>

                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;