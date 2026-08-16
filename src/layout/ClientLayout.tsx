import { Outlet } from "react-router-dom";
import  clientLinks  from "../constants/client-Links";
// sidebar
import gt_logo from "../assets/gt-logo.png";
import { Link, NavLink } from "react-router-dom";

// HEADER
import { Bell, LogOut, Star, User, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const linkBaseStyle =
  "flex items-center gap-3 px-4 py-2 rounded-[5px] transition-colors hover:bg-white/10";
const getLinkStyle = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? `${linkBaseStyle} bg-white/20 text-white font-medium`
    : `${linkBaseStyle} text-slate-200`;

const ClientLayout: React.FC = () => {
  const [showMiniProfileCard, setShowMiniProfileCard] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
      )}

      {/* Sidebar - Edge Scrollable Panel */}
      <aside
        ref={sidebarRef}
        className={`bg-[#071832]  fixed bottom-0 top-0 z-50 flex w-64 flex-col text-slate-200 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        {/* Branding header: Keeps persistent spacing */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={gt_logo} alt="GT-ONLINE" className="max-w-[2em]" />
            <h1 className="text-slate-50 text-[12px] font-semibold">
              GT-ONLINE
            </h1>
          </Link>
          {/* Mobile close toggle */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded p-1 hover:bg-white/10 lg:hidden text-slate-200"
            aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Scrollbar-to-edge content panel */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 mt-6">
          <ul className="space-y-2">
            {clientLinks.map((item) => {
              const Icon = item.icon ?? null;
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.link}
                    className={getLinkStyle}
                    onClick={() => setIsSidebarOpen(false)}>
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

      {/* Primary Workspace Viewport Container */}
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-64">
        {/* Responsive Navbar */}
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-8">
          {/* Top Bar Left Side Elements */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mobile-toggle-btn rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
              aria-label="Open menu">
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-sky-500 sm:text-2xl">
                Dashboard
              </h1>
              <p className="hidden text-sm text-gray-500 sm:block">
                Welcome back, manage your projects efficiently.
              </p>
            </div>
          </div>

          {/* Top Bar Right Side Utility Items */}
          <div className="flex items-center gap-2 sm:gap-5">
            <button
              aria-label="Favorites"
              className="relative text-slate-700 rounded-xl p-2 transition hover:bg-gray-100">
              <Star size={22} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button
              aria-label="Notifications"
              className="relative text-slate-700 rounded-xl p-2 transition hover:bg-gray-100">
              <Bell size={22} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Profile Menu Trigger */}
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

        {/* Dynamic Child Routes Container view */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;