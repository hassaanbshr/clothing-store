import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  productIds: string[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      add: (productId) => {
        set((state) =>
          state.productIds.includes(productId)
            ? state
            : { productIds: [...state.productIds, productId] }
        );
      },
      remove: (productId) => {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        }));
      },
      toggle: (productId) => {
        const has = get().has(productId);
        if (has) get().remove(productId);
        else get().add(productId);
      },
      has: (productId) => get().productIds.includes(productId),
    }),
    { name: "clothing-store-wishlist" }
  )
);
