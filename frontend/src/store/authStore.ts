import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthTokens, AuthUser } from "@/types";
import { decodeJwtPayload } from "@/utils/jwt";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (tokens: AuthTokens) => void;
  logout: () => void;
}

// Persisted to localStorage under "campushaven-auth" so a page refresh
// doesn't log the user out. The access token is short-lived by design
// (see backend JWT_ACCESS_EXPIRES_IN), so the exposure window from storing
// it client-side is intentionally small.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setTokens: (tokens) => {
        const payload = decodeJwtPayload<AuthUser & { exp: number }>(tokens.accessToken);
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: payload ? { id: payload.id, email: payload.email, role: payload.role } : null,
        });
      },
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "campushaven-auth" }
  )
);
