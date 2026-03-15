import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (productId: string, variantId?: string, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clear: () => void;
  getItemCount: () => number;
  getTotalItems: () => number;
};

const getKey = (productId: string, variantId?: string) => `${productId}:${variantId ?? ""}`;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId, variantId, quantity = 1) => {
        set((state) => {
          const key = getKey(productId, variantId);
          const existing = state.items.find(
            (i) => getKey(i.productId, i.variantId) === key
          );
          const next = existing
            ? state.items.map((i) =>
                getKey(i.productId, i.variantId) === key
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              )
            : [...state.items, { productId, variantId, quantity }];
          return { items: next };
        });
      },
      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => getKey(i.productId, i.variantId) !== getKey(productId, variantId)
          ),
        }));
      },
      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            getKey(i.productId, i.variantId) === getKey(productId, variantId)
              ? { ...i, quantity }
              : i
          ),
        }));
      },
      clear: () => set({ items: [] }),
      getItemCount: () => get().items.length,
      getTotalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "clothing-store-cart" }
  )
);
