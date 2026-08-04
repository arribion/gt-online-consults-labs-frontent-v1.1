import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

type User = {
  role: "TASKER" | "ADMIN";
  email: string
} | null;

type AuthContextType = {
  user: User;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const BASE_URL = import.meta.env.VITE_BASE_URL;

if (!BASE_URL) {
  console.error(
    "Environment Error: VITE_BASE_URL is missing from your .env file.",
  );
}

const API_URL = `${BASE_URL}/api/v1/auth`;

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Automatically check session on page mount/reload
  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        const res = await axios.get(`${API_URL}/verify`, {
          withCredentials: true,
        });
        if (res.data?.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        // Silently fail on mount if cookies are expired or missing
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    verifyUserSession();
  }, []);

  // 2. Login function wired to your exact backend route
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/login`,
        { email, password },
        { withCredentials: true }, // Handles HTTP-only cookies from backend
      );
      if (res.data?.success) {
        setUser(res.data.user); // { email, role }
        toast.success("Welcome back!");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Something went wrong.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Logout function to clear backend cookies
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      setUser(null);
      toast.success("Logged out successfully.");
    } catch (error) {
      toast.error("Logout failed.");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default useAuth;
