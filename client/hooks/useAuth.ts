import { useMemo } from "react";
import { jwtDecode} from "jwt-decode";

export function useAuth() {
  const token = localStorage.getItem("token");

  const auth = useMemo(() => {
    if (!token) return { isAuthenticated: false, role: null };

    try {
      const decoded: any = jwtDecode(token);
      return {
        isAuthenticated: true,
        role: decoded.role, 
      };
    } catch (e) {
      return { isAuthenticated: false, role: null };
    }
  }, [token]);

  return auth;
}
