import {
  Home,
  UserCheck,
  FolderOpenDot,
  FileText,
  Box,
  Users,
  Settings,
  CreditCard,
  MessageCircle,
  User,
} from "lucide-react";

/**
 * Use a safe type for icon components: React component that accepts SVG props.
 * This avoids depending on a specific lucide-react export type.
 */
/**
 * Use a safe type for icon components: React component that accepts SVG props.
 * This avoids depending on a specific lucide-react export type.
 */
import type { AdminSidebarLink } from "../types/links";

export const AdminsideBarLinks: AdminSidebarLink[] = [
  {
    id: 1,
    icon: Home,
    name: "Dashboard",
    link: "/admin",
  },

  {
    id: 2,
    icon: FolderOpenDot,
    name: "Projects",
    link: "/admin/projects",
  },

  {
    id: 3,
    icon: UserCheck,
    name: "Tasks",
    link: "/admin/tasks",
  },

  {
    id: 4,
    icon: CreditCard,
    name: "Invoicing",
    link: "/admin/invoicing",
  },

  {
    id: 5,
    icon: Box,
    name: "Resources",
    link: "/admin/resources",
  },

  {
    id: 6,
    icon: FileText,
    name: "Financies",
    link: "/admin/financies",
  },

  {
    id: 7,
    icon: Users,
    name: "Members",
    link: "/admin/members",
  },
  {
    id: 11,
    icon: User,
    name: "Disputes",
    link: "/disputes",
  },
  {
    id: 8,
    icon: MessageCircle,
    name: "Communication",
    link: "#",
  },
  {
    id: 19,
    icon: Settings,
    name: "Talents",
    link: "/admin/talents",
  },
  {
    id: 19,
    icon: Settings,
    name: "Companies",
    link: "/admin/talents",
  },
  {
    id: 19,
    icon: Settings,
    name: "Pricing",
    link: "/admin/pricing",
  },
  {
    id: 9,
    icon: Settings,
    name: "Settings",
    link: "/admin/settings",
  },
];

export default AdminsideBarLinks;
