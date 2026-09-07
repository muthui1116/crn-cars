// app/(shop)/account/orders/queries.ts
import db from "../../../_lib/db";

export async function getOrdersForUser(userId: string) {
  try {
    const result = await db.query(
      `SELECT id, status, total_amount, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (err) {
    console.error("getOrdersForUser failed:", err);
    return [];
  }
}

export async function getOrderDetail(orderId: string, userId: string) {
  try {
    const orderResult = await db.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [orderId, userId]
    );
    const order = orderResult.rows[0];
    if (!order) return null; // not found OR not theirs — same response either way

    const itemsResult = await db.query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [orderId]
    );
    return { ...order, items: itemsResult.rows };
  } catch (err) {
    console.error("getOrderDetail failed:", err);
    return null;
  }
}
