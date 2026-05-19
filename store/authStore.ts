import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

function setCookie(name: string, value: string, days = 1) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem("ajo_token", token);
    localStorage.setItem("ajo_user", JSON.stringify(user));
    setCookie("ajo_token", token);
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (partial) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...partial };
      localStorage.setItem("ajo_user", JSON.stringify(updated));
      return { user: updated };
    });
  },

  logout: () => {
    localStorage.removeItem("ajo_token");
    localStorage.removeItem("ajo_user");
    deleteCookie("ajo_token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    // Guard: only run in browser, never on server
    if (typeof window === "undefined") return;

    try {
      const token = localStorage.getItem("ajo_token");
      const userStr = localStorage.getItem("ajo_user");
      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isAuthenticated: true });
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.removeItem("ajo_token");
      localStorage.removeItem("ajo_user");
    }
  },
}));