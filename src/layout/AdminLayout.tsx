import { Outlet } from "react-router-dom";
// sidebar import
import { Link, NavLink } from "react-router-dom";
import gt_logo from "../assets/gt-logo.png";
import AdminsideBarLinks from "../constants/admin-Links";
// HEADER
import {
  Bell,
  LogOut,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AdminLayout = () => {
  // HEADER & LAYOUT STATES
  const [showMiniProfileCard, setShowMiniProfileCard] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse state
  const [hoveredLink, setHoveredLink] = useState<number | null>(null); // Tooltip state

  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkBaseStyle =
    "flex items-center gap-3 px-4 py-2 rounded transition-all duration-200 hover:bg-white/10 relative group";
  const getLinkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${linkBaseStyle} bg-white/20 text-white font-medium`
      : `${linkBaseStyle} text-slate-200`;

  const toggleMiniProfileCard = () => {
    setShowMiniProfileCard((prev) => !prev);
  };

  const handleLogout = async () => {
    await logout();
    setShowMiniProfileCard(false);
    navigate("/");
  };

  // Close dropdown and mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowMiniProfileCard(false);
      }
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".mobile-toggle-btn")
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`bg-[#071832] fixed bottom-0 top-0 z-50 flex flex-col shadow-card text-slate-200 transition-all duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}>
        {/* Branding header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 min-h-18">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={gt_logo}
              alt="GT-ONLINE"
              className="max-w-[2em] shrink-0"
            />
            <h1
              className={`text-slate-50 font-bold transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100"}`}>
              GT-ONLINE
            </h1>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded p-1 hover:bg-white/10 lg:hidden"
            aria-label="Close menu">
            <X size={20} />
          </button>

          {/* Collapse/Expand toggle button for desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center rounded p-1.5 hover:bg-white/10 text-slate-400 hover:text-white"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 mt-6">
          <ul className="space-y-2">
            {AdminsideBarLinks.map((path) => {
              const Icon = (path as any).icon || (path as any).icons || null;
              return (
                <li key={path.id} className="relative">
                  <NavLink
                    to={path.link}
                    className={getLinkStyle}
                    onClick={() => setIsSidebarOpen(false)}
                    onMouseEnter={() => isCollapsed && setHoveredLink(path.id)}
                    onMouseLeave={() => setHoveredLink(null)}>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-200">
                      {Icon ? <Icon size={16} /> : null}
                    </span>
                    <span
                      className={`truncate transition-opacity duration-200 ${isCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100"}`}>
                      {path.name}
                    </span>
                  </NavLink>

                  {/* Desktop Hover Tooltip Modal */}
                  {isCollapsed && hoveredLink === path.id && (
                    <div className="hidden lg:block fixed left-24 z-60 -mt-9 bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded shadow-xl pointer-events-none whitespace-nowrap">
                      <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900 border-l border-b border-slate-700"></div>
                      {path.name}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Wrapper */}
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-8">
          {/* Left Side Header */}
          <div className="flex items-center gap-3">
            {/* Hamburger Toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mobile-toggle-btn rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
              aria-label="Open menu">
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-sky-500 sm:text-2xl">
                super-admin
              </h1>
              <p className="hidden text-sm text-gray-500 sm:block">
                Welcome back, manage your projects efficiently.
              </p>
            </div>
          </div>

          {/* Right Side Header */}
          <div className="flex items-center gap-2 sm:gap-5">
            {/* Notification */}
            <button
              aria-label="Notifications"
              className="relative rounded-xl p-2 transition hover:bg-gray-100">
              <Bell size={22} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* User Profile */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleMiniProfileCard}
                  className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-gray-100">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 font-semibold text-white">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div className="hidden text-left lg:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </button>
                {showMiniProfileCard && (
                  <nav className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-100 bg-white shadow-lg z-50">
                    <ul className="py-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                        <User size={14} /> Account
                      </li>
                      <li
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                        <LogOut size={14} /> Logout
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;