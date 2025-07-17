import { useSelector } from "react-redux";
import type { RootState } from "../store";

export function useAuth() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  return {
    user,
    isAuthenticated: !!user && !!token,
    role: user?.role || null,
  };
}
