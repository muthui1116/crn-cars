"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartContext";

export default function CartPage() {
  const { items, addItem, removeItem, updateQuantity, subtotal } = useCart();

  useEffect(() => {
    const pending = sessionStorage.getItem("pendingCartItem");
    if (pending) {
      addItem(JSON.parse(pending));
      sessionStorage.removeItem("pendingCartItem");
    }
  }, [addItem]);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Your cart is empty
        </h1>
        <Link
          href="/products"
          className="inline-block mt-4 text-gray-900 underline"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>

      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-500">
                ${item.price.toFixed(2)}
              </p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(item.id, Number(e.target.value))
              }
              className="w-16 border rounded-md px-2 py-1 text-center"
            />
            <button
              onClick={() => removeItem(item.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <span className="text-lg font-semibold">
          Subtotal: ${subtotal.toFixed(2)}
        </span>
        <Link
          href="/checkout"
          className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}