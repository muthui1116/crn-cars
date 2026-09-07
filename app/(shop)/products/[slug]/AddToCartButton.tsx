"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "../../cart/CartContext";

interface AddToCartButtonProps {
  id: number;
  name: string;
  price: number;
  image_url: string;
}

export default function AddToCartButton({
  id,
  name,
  price,
  image_url,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const { status } = useSession();

  function handleAddToCart() {
    if (status !== "authenticated") {
      sessionStorage.setItem(
        "pendingCartItem",
        JSON.stringify({ id, name, price, image_url })
      );
      router.push("/login?callbackUrl=/cart");
      return;
    }

    addItem({ id, name, price, image_url });
    router.push("/cart");
  }

  return (
    <button
      onClick={handleAddToCart}
      className="mt-4 w-full sm:w-auto px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
    >
      Add to Cart
    </button>
  );
}