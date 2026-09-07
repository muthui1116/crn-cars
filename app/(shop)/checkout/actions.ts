"use server";

import db from "../../_lib/db";
import { auth } from "@/auth";
import { initiateStkPush } from "../../_lib/mpesa";
import { checkRateLimit } from "../../_lib/rate-limit";
import type { ShippingInfo, PlaceOrderResult, PaymentResult } from "./types";

type CartLine = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

function normalizePhone(phone: string) {
  const value = phone.trim();
  return value.startsWith("+254") ? value.replace("+", "") : value;
}

function validateShipping(
  shipping: ShippingInfo
):
  | { ok: true; cleaned: { name: string; phone: string; address: string; city: string } }
  | { ok: false; error: string } {
  const cleaned = {
    name: shipping.name.trim(),
    phone: normalizePhone(shipping.phone),
    address: shipping.address.trim(),
    city: shipping.city.trim(),
  };

  if (!cleaned.name || !cleaned.address || !cleaned.city) {
    return { ok: false, error: "Name, address, and city are required." };
  }

  if (!/^254\d{9}$/.test(cleaned.phone)) {
    return {
      ok: false,
      error: "Enter a valid M-Pesa number in the format 2547XXXXXXXX.",
    };
  }

  return { ok: true, cleaned };
}

function validateCartItems(cart: CartLine[]):
  | { ok: true; validCart: CartLine[]; total: number }
  | { ok: false; error: string } {
  const validCart = cart.filter((item) => item.quantity > 0 && Number.isFinite(item.price));
  if (validCart.length === 0) {
    return { ok: false, error: "Your cart is empty" };
  }

  const total = validCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!Number.isFinite(total) || total <= 0) {
    return { ok: false, error: "Order total must be greater than zero." };
  }

  return { ok: true, validCart, total };
}

// Step 1: create the order + line items in one transaction, status = 'pending'
export async function placeOrder(
  cart: CartLine[],
  shipping: ShippingInfo
): Promise<PlaceOrderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to checkout" };
  }

  try {
    const { allowed } = await checkRateLimit(`checkout:${session.user.id}`, 5, 10);
    if (!allowed) {
      return { success: false, error: "Too many checkout attempts. Please try again in 10 minutes." };
    }
  } catch (error) {
    console.error("Checkout rate limit failed:", error);
    return { success: false, error: "Checkout is temporarily unavailable. Please try again." };
  }

  const cartValidation = validateCartItems(cart);
  if (!cartValidation.ok) {
    return { success: false, error: cartValidation.error };
  }

  const shippingValidation = validateShipping(shipping);
  if (!shippingValidation.ok) {
    return { success: false, error: shippingValidation.error };
  }

  const { validCart, total } = cartValidation;
  const { cleaned } = shippingValidation;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, total_amount, shipping_name, shipping_phone, shipping_address, shipping_city)
       VALUES ($1, 'pending', $2, $3, $4, $5, $6)
       RETURNING id`,
      [session.user.id, total, cleaned.name, cleaned.phone, cleaned.address, cleaned.city]
    );
    const orderId = orderResult.rows[0].id;

    for (const item of validCart) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.id, item.name, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");
    return { success: true, orderId };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("placeOrder failed:", err);
    return { success: false, error: "Could not create order" };
  } finally {
    client.release();
  }
}

// Step 2: order exists, now trigger the M-Pesa prompt on the customer's phone
export async function payWithMpesa(
  orderId: number,
  phone: string,
  amount: number
): Promise<PaymentResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to pay" };
    }

    const { allowed } = await checkRateLimit(`payment:${session.user.id}`, 3, 10);
    if (!allowed) {
      return { success: false, error: "Too many payment attempts. Please try again in 10 minutes." };
    }

    const normalizedPhone = normalizePhone(phone);
    if (!/^254\d{9}$/.test(normalizedPhone)) {
      return { success: false, error: "Enter a valid M-Pesa number in the format 2547XXXXXXXX." };
    }

    const checkoutRequestId = await initiateStkPush({ phone: normalizedPhone, amount, orderId });

    await db.query(
      `UPDATE orders SET mpesa_checkout_request_id = $1 WHERE id = $2`,
      [checkoutRequestId, orderId]
    );

    return { success: true, checkoutRequestId };
  } catch (err) {
    console.error("payWithMpesa failed:", err);
    return { success: false, error: "Could not start M-Pesa payment. Try again." };
  }
}

// Step 3: poll from the client to see if the callback has confirmed payment yet
export async function checkOrderStatus(orderId: number) {
  const result = await db.query(`SELECT status FROM orders WHERE id = $1`, [orderId]);
  return result.rows[0]?.status ?? "unknown";
}