export type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface AdminSidebarLink {
  id: number;
  name: string;
  link: string;
  icon?: IconComponent;
  /** optional: mark as external or disabled in the UI */
  external?: boolean;
  disabled?: boolean;
}
