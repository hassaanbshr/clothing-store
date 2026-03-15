import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
  theme: "light" | "dark";
  cartOpen: boolean;
  quickViewProductId: string | null;
  setTheme: (theme: "light" | "dark") => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openQuickView: (productId: string) => void;
  closeQuickView: () => void;
  recentlyViewedIds: string[];
  addRecentlyViewed: (productId: string) => void;
};

const MAX_RECENTLY_VIEWED = 20;

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "light",
      cartOpen: false,
      quickViewProductId: null,
      recentlyViewedIds: [],
      setTheme: (theme) => set({ theme }),
      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),
      toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
      openQuickView: (productId) => set({ quickViewProductId: productId }),
      closeQuickView: () => set({ quickViewProductId: null }),
      addRecentlyViewed: (productId) => {
        set((state) => {
          const filtered = state.recentlyViewedIds.filter((id) => id !== productId);
          const next = [productId, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
          return { recentlyViewedIds: next };
        });
      },
    }),
    {
      name: "clothing-store-ui",
      partialize: (s) => ({ theme: s.theme, recentlyViewedIds: s.recentlyViewedIds }),
    }
  )
);
