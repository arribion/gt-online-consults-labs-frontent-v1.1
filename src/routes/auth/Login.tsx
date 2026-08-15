import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthGlob from "../../components/AuthGlob";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login, isLoading, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role === "SUPERADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/client/dashboard", { replace: true });
      }
    }
  }, [isLoggedIn, user, navigate]);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    login(trimmedEmail, trimmedPassword);
  };

  return (
    <section className="flex flex-col sm:flex-row h-screen w-screen overflow-hidden">
      {/* glob */}
      <div className="hidden sm:block sm:w-1/2 h-full bg-black/5">
        <AuthGlob
          scale={9}
          oceanColor="#0a0a2a"
          fill="dots"
          // @ts-ignore – TypeScript complains but the shape is correct
          dots={{
            color: "#60a5fa",
            size: 3, // dots size
            density: 9, // dots spacing
          }}
          showOutline={false}
          showGrid={false}
          stopOnHover={false}
          direction="right"
          // Optional: set initial view to show a nice angle
          initialLatitude={20}
          initialLongitude={0}
        />
      </div>

      {/* login */}
      <div className="flex-1 sm:w-1/2 h-full flex items-center justify-center p-4 bg-linear-to-br from-slate-900/90 via-slate-800/90 to-black/90 sm:bg-transparent">
        <div>
          <h1>Welcome back Login and continue Tasking </h1>
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm p-6 rounded-lg bg-white/10 backdrop-blur-sm shadow-2xl border border-white/20 text-white">
            <h1 className="text-center font-bold text-3xl text-sky-400 mb-6">
              GT LOGIN
            </h1>

            {error && (
              <p className="text-red-400 text-sm text-center mb-4">{error}</p>
            )}

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200">
                Email:
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trimStart())}
                className="w-full p-2 rounded border border-gray-600 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                required
              />
            </div>

            <div className="mb-6 relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200">
                Password:
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value.trimStart())}
                className="w-full p-2 rounded border border-gray-600 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-9 text-gray-400 hover:text-white transition">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded bg-sky-500 text-white font-medium hover:bg-sky-600 transition disabled:bg-slate-500 disabled:cursor-not-allowed">
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;