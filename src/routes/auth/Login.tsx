import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login, isLoading, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role === "ADMIN") {
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

  // const validatePassword = (password: string) => {
  //   const regex =
  //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  //   return regex.test(password);
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // if (!validatePassword(trimmedPassword)) {
    //   setError(
    //     "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
    //   );
    //   return;
    // }

    setError("");
    login(trimmedEmail, trimmedPassword);
  };

  const btnStyle = isLoading ? { color: "gray" } : undefined;

  return (
    <section className="min-h-[80vh] flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="shadow-card md:w-md mt-[5em] w-fit p-4 rounded max-h-fit">
        <h1 className="text-center font-bold text-2xl text-sky-500">
          GT LOGIN
        </h1>
        {error && (
          <p className="text-red-500 text-sm text-center mb-2">{error}</p>
        )}
        <div>
          <label htmlFor="email">Email:</label>
          <br />
          <input
            type="email"
            id="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trimStart())}
            className="border rounded p-1 w-full"
            required
          />
        </div>
        <div className="mt-4 relative">
          <label htmlFor="password">Password:</label>
          <br />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value.trimStart())}
            className="border rounded p-1 w-full pr-10"
            required
          />
          {/* Eye toggle button */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-8 text-gray-500 hover:text-gray-700">
            {showPassword ? <EyeOff/> : <Eye/>}
          </button>
        </div>
        
        <button
          type="submit"
          style={btnStyle}
          disabled={isLoading}
          className="bg-sky-500 text-slate-50 my-6 w-full rounded py-2 font-medium hover:bg-sky-600 transition-colors disabled:bg-slate-300">
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </section>
  );
};

export default Login;