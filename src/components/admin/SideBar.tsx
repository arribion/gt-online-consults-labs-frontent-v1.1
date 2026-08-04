import { Link, NavLink } from "react-router-dom";
import gt_logo from "../../assets/gt-logo.png";
import { AdminsideBarLinks } from "../../constants/Paths";

export default function SideBar() {
  // make each link a horizontal flex row and give the icon a fixed width
  const linkBaseStyle =
    "flex items-center gap-3 px-4 py-2 rounded transition-colors hover:bg-white/10";
  const getLinkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${linkBaseStyle} bg-white/20 text-white font-medium`
      : `${linkBaseStyle} text-slate-200`;

  return (
    <aside className="gradient-primary fixed shadow-card text-slate-200 w-56 min-h-screen p-4">
      <Link to="/" className="flex items-center gap-2.5 mb-4">
        <img src={gt_logo} alt="GT-ONLINE" className="max-w-[2em]" />
        <h1 className="text-slate-50 text-[12px] font-semibold">GT-ONLINE</h1>
      </Link>

      <nav className="mt-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {AdminsideBarLinks.map((path) => {
            // prefer `icon` property; fall back to `icons` if needed
            const Icon = (path as any).icon || (path as any).icons || null;
            return (
              <li key={path.id}>
                <NavLink to={path.link} className={getLinkStyle}>
                  {/* fixed-width icon container keeps labels aligned */}
                  <span className="flex h-5 w-5 items-center justify-center text-slate-200">
                    {Icon ? <Icon size={16} /> : null}
                  </span>

                  {/* label */}
                  <span className="truncate">{path.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}