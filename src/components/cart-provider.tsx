"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const CART_KEY = "cave-solive.panier";
const CART_EVENT = "cave-solive-panier";

export type CartLine = {
  slug: string;
  quantity: number;
};

type AddResult = {
  added: number;
  capped: boolean;
};

type CartContextValue = {
  ready: boolean;
  lines: CartLine[];
  count: number;
  add: (slug: string, quantity: number, stock: number) => AddResult;
  setQuantity: (slug: string, quantity: number, stock: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(
    subscribeCart,
    readCartSnapshot,
    readCartServerSnapshot,
  );
  const lines = useMemo(() => parseCart(raw ?? "[]"), [raw]);
  const ready = raw !== null;
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  const add = useCallback((slug: string, quantity: number, stock: number) => {
    const current = parseCart(readCartSnapshot());
    if (stock <= 0 || quantity <= 0) {
      return { added: 0, capped: true };
    }

    const currentQty = current.find((line) => line.slug === slug)?.quantity ?? 0;
    const nextQty = Math.min(stock, currentQty + quantity);
    const added = nextQty - currentQty;
    const capped = nextQty < currentQty + quantity;
    const exists = current.some((line) => line.slug === slug);
    const next = exists
      ? current.map((line) =>
          line.slug === slug ? { ...line, quantity: nextQty } : line,
        )
      : [...current, { slug, quantity: nextQty }];

    commitCart(next);
    return { added, capped };
  }, []);

  const setQuantity = useCallback(
    (slug: string, quantity: number, stock: number) => {
      const current = parseCart(readCartSnapshot());
      if (quantity <= 0 || stock <= 0) {
        commitCart(current.filter((line) => line.slug !== slug));
        return;
      }
      const nextQty = Math.min(quantity, stock);
      commitCart(
        current.map((line) =>
          line.slug === slug ? { ...line, quantity: nextQty } : line,
        ),
      );
    },
    [],
  );

  const remove = useCallback((slug: string) => {
    commitCart(parseCart(readCartSnapshot()).filter((line) => line.slug !== slug));
  }, []);

  const clear = useCallback(() => {
    commitCart([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({ ready, lines, count, add, setQuantity, remove, clear }),
    [add, clear, count, lines, ready, remove, setQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé dans CartProvider.");
  }
  return context;
}

function subscribeCart(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CART_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CART_EVENT, callback);
  };
}

function readCartSnapshot() {
  return window.localStorage.getItem(CART_KEY) ?? "[]";
}

function readCartServerSnapshot() {
  return null;
}

function commitCart(lines: CartLine[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(CART_EVENT));
}

function parseCart(raw: string): CartLine[] {
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];

    return data.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const slug = "slug" in item ? item.slug : undefined;
      const quantity = "quantity" in item ? item.quantity : undefined;
      if (typeof slug !== "string" || slug.length === 0) return [];
      if (
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return [];
      }
      return [{ slug, quantity: Math.min(quantity, 99) }];
    });
  } catch {
    return [];
  }
}
