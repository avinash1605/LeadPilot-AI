import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";
import { loginCredentials, users } from "@/lib/mock-data/users";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      login: (email, password) => {
        const credential = loginCredentials[email];
        if (!credential || credential.password !== password) {
          return false;
        }
        const user = users.find((entry) => entry.id === credential.userId) || null;
        set({ currentUser: user, isAuthenticated: Boolean(user) });
        return Boolean(user);
      },
      logout: () => set({ currentUser: null, isAuthenticated: false }),
    }),
    {
      name: "leadpilot-auth",
    }
  )
);
