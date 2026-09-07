// app/(admin)/admin/orders/actions.ts
"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendOrderStatusEmail } from "../../_lib/email";
import { updateOrderStatus } from "./orders/queries";

const VALID_STATUSES = ["pending", "paid", "failed", "shipped", "delivered"];

export async function changeOrderStatus(orderId: string, status: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 1) {
    return { error: "Not authorized" };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status" };
  }

  const order = await updateOrderStatus(orderId, status);
  if (!order) return { error: "Update failed" };

  try {
    await sendOrderStatusEmail({
      email: order.email,
      customerName: order.name,
      orderId: String(order.id),
      status: order.status,
      total: order.total_amount,
    });
  } catch (error) {
    console.error("Order status email failed:", error);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  return { success: true };
}
