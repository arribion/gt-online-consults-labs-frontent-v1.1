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

export type IconComponent = React.ComponentType<
  React.ComponentProps<typeof Grid>
    >;

export interface ClientLink {
  id: number;
  label: string;
  link: string;
  icon?: IconComponent;
  disabled?: boolean;
}

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

export default clientLinks