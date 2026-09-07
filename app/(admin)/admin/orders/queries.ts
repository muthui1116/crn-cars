// app/(admin)/admin/orders/queries.ts
import db from "../../../_lib/db";

export async function getAllOrders() {
  try {
    const result = await db.query(
      `SELECT o.id, o.user_id, u.email, o.shipping_phone, o.status, o.total_amount, o.created_at
       FROM orders AS o
       JOIN users AS u ON u.id = o.user_id
       ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (err) {
    console.error("getAllOrders failed:", err);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const result = await db.query(
      `UPDATE orders AS o
       SET status = $1
       FROM users AS u
       WHERE o.id = $2 AND o.user_id = u.id
       RETURNING o.id, o.status, o.total_amount, u.email, u.name`,
      [status, orderId]
    );
    return result.rows[0] ?? null;
  } catch (err) {
    console.error("updateOrderStatus failed:", err);
    return null;
  }
}
