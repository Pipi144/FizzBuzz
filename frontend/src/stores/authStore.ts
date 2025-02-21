import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { getCookie, setCookie, deleteCookie } from "cookies-next/client";
import { TUser } from "@/models/user";
import { COOKIES_KEYS } from "@/utils/cookies";

export type TAuthStore = {
  currentUser: TUser | null;
  setCurrentUser: (user: TUser | null) => void;
  removeUser: () => void;
};

// Custom Cookie Storage Handler with JSON Parsing
const cookieStorage: PersistStorage<TAuthStore> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null; // Prevents SSR errors
    const cookieValue = getCookie(name);
    return cookieValue ? JSON.parse(cookieValue) : null;
  },
  setItem: (name, value) => {
    setCookie(name, JSON.stringify(value), { maxAge: 60 * 60 * 24 * 7 }); //  7-day expiration
  },
  removeItem: (name) => {
    deleteCookie(name);
  },
};

// Zustand Store with Cookie Persistence
export const useAuthStore = create(
  persist(
    immer<TAuthStore>((set) => ({
      currentUser: null, //  Default state to prevent hydration mismatch
      setCurrentUser: (user) =>
        set((state) => {
          state.currentUser = user;
        }),
      removeUser: () => {
        set((state) => {
          state.currentUser = null;
        });
        useAuthStore.persist.clearStorage();
      },
    })),
    {
      name: COOKIES_KEYS.CurrentUser, // ✅ Key for the cookie
      storage: cookieStorage, // ✅ Use the updated cookieStorage
    }
  )
);
