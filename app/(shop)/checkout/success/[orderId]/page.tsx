import  db  from "../../../../_lib/db";

export default async function SuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const result = await db.query(
    `SELECT total_amount, mpesa_receipt_number FROM orders WHERE id = $1`,
    [orderId]
  );
  const order = result.rows[0];

  return (
    <div>
      <h1>Order confirmed 🎉</h1>
      <p>Order #{orderId}</p>
      <p>Amount paid: KSh {order.total_amount}</p>
      <p>M-Pesa receipt: {order.mpesa_receipt_number}</p>
    </div>
  );
}