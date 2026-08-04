import { Bell, LogOut, Star, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const ClientHeader = () => {
  const [showMiniProfileCard, setShowMiniProfileCard] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowMiniProfileCard(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold text-sky-500">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back, manage your projects efficiently.
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* Notification */}
        <button
          aria-label="Notifications"
          className="relative text-slate-700 rounded-xl p-2 transition hover:bg-gray-100">
          <Star size={22} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
        {/* Notification */}
        <button
          aria-label="Notifications"
          className="relative  text-slate-700  rounded-xl p-2 transition hover:bg-gray-100">
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
              <nav className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-100 bg-white shadow-lg">
                <ul className="py-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    <User size={14} />
                    Account
                  </li>
                  <li
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    <LogOut size={14} />
                    Logout
                  </li>
                </ul>
              </nav>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default ClientHeader;