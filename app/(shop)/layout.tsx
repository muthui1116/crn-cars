// app/(shop)/layout.tsx
import { CartProvider } from "./cart/CartContext";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}