"use client";

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import type { CartState, CartAction, CartContextValue } from "./types";

const STORAGE_KEY = "crn-cart";
const initialState: CartState = { items: [] };

function sanitizeQuantity(value: number) {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.payload.id);

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }

      return { items: [...state.items, { ...action.payload, quantity: 1 }] };
    }

    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.id !== action.payload.id) };

    case "UPDATE_QUANTITY": {
      const nextQuantity = sanitizeQuantity(action.payload.quantity);
      return {
        items: state.items
          .map((i) =>
            i.id === action.payload.id ? { ...i, quantity: nextQuantity } : i
          )
          .filter((i) => i.quantity > 0),
      };
    }

    case "CLEAR_CART":
      return { items: [] };

    default:
      return state;
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    if (typeof window === "undefined") return initialState;

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const addItem: CartContextValue["addItem"] = (item) =>
    dispatch({ type: "ADD_ITEM", payload: item });

  const removeItem: CartContextValue["removeItem"] = (id) =>
    dispatch({ type: "REMOVE_ITEM", payload: { id } });

  const updateQuantity: CartContextValue["updateQuantity"] = (id, quantity) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}