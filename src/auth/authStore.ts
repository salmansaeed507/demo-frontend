import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchSession,
  loginRequest,
  logoutRequest,
} from "../api/auth";
import { apiGatewayClient } from "../api/client";

export type AuthSession = {
  fullName: string;
  token: string;
};

type AuthState = {
  session: AuthSession | null;
  userId: number | null;
  setSession: (session: AuthSession | null) => void;
  setUserId: (userId: number | null) => void;
  login: (fullName: string, loginToken: string) => Promise<void>;
  logout: () => Promise<void>;
  validateSession: () => Promise<void>;
};

export const AUTH_STORE_KEY = "demo-hub-auth-store";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      userId: null,
      setSession: (session) => {
        apiGatewayClient.setAuthToken(session?.token ?? null);
        set({ session });
      },
      setUserId: (userId) => set({ userId }),
      login: async (fullName, loginToken) => {
        const result = await loginRequest(
          loginToken.trim(),
          fullName.trim(),
          get().userId,
        );
        apiGatewayClient.setAuthToken(result.token);
        set({
          userId: result.user_id,
          session: { fullName: result.name, token: result.token },
        });
      },
      logout: async () => {
        try {
          if (apiGatewayClient.getAuthToken()) {
            await logoutRequest();
          }
        } catch {
          /* clear local session even if gateway logout fails */
        }
        apiGatewayClient.setAuthToken(null);
        set({ session: null });
      },
      validateSession: async () => {
        const current = get().session;
        if (!current) return;

        try {
          const remote = await fetchSession();
          set({
            userId: remote.user_id,
            session: { fullName: remote.name, token: current.token },
          });
        } catch {
          apiGatewayClient.setAuthToken(null);
          set({ session: null });
        }
      },
    }),
    {
      name: AUTH_STORE_KEY,
      partialize: (state) => ({
        session: state.session,
        userId: state.userId,
      }),
      onRehydrateStorage: () => (state) => {
        apiGatewayClient.setAuthToken(state?.session?.token ?? null);
      },
    },
  ),
);
