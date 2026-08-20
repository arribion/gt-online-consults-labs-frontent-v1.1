import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import { authService, errorMessage, membersService } from "@/services";
import { isAdminRole, type Member, type MemberRole } from "@/types";

type AuthContextValue = {
  /**
   * The signed-in user's full profile. `/auth/verify` only returns name, email
   * and role — but ids are needed all over the app (claiming a dispute,
   * generating your own invoice, spotting yourself in a roster), so the session
   * check and `/members/me` are resolved together and the profile is what the
   * app reads.
   */
  user: Member | null;
  role: MemberRole | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  /** True only while the initial session check is running. */
  isLoading: boolean;
  isSubmitting: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  /** Re-read the profile after the user edits it. */
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSession = useCallback(async () => {
    const [, profile] = await Promise.all([authService.verify(), membersService.me()]);
    setUser(profile);
  }, []);

  useEffect(() => {
    loadSession()
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [loadSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsSubmitting(true);
      try {
        const session = await authService.login(email, password);
        // The login response carries no id, so pull the full profile before
        // handing control to the route guard.
        const profile = await membersService.me().catch(() => null);
        setUser(profile);
        toast.success(`Welcome back, ${(profile?.full_name ?? session.full_name).split(" ")[0]}!`);
        return true;
      } catch (err) {
        toast.error(errorMessage(err));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // The cookie may already be gone; clearing local state is what matters.
    }
    setUser(null);
    toast.success("Signed out.");
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setUser(await membersService.me());
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isLoggedIn: !!user,
      isAdmin: isAdminRole(user?.role),
      isLoading,
      isSubmitting,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, isSubmitting, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default useAuth;
