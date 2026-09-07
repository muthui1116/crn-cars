// app/(shop)/account/orders/[orderId]/page.tsx
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getOrderDetail } from "../queries";
import styles from "./order-detail.module.css";

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { orderId } = await params; // Next.js 15: params is a Promise
  const order = await getOrderDetail(orderId, session.user.id);
  if (!order) notFound();

  const statusClass = `status${order.status[0].toUpperCase()}${order.status.slice(1)}`;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/account/orders" className={styles.backLink}>
          &larr; Back to my orders
        </Link>

        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Order details</p>
            <h1 className={styles.title}>Order #{order.id}</h1>
            <p className={styles.date}>
              Placed {new Date(order.created_at).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span className={`${styles.status} ${styles[statusClass]}`}>
            {order.status}
          </span>
        </header>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelHeading}>
              <h2 className={styles.panelTitle}>Items in this order</h2>
            </div>
            <table className={styles.items}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th className={styles.number}>Qty</th>
                  <th className={styles.number}>Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: OrderItem) => (
                  <tr key={item.id}>
                    <td className={styles.itemName}>{item.product_name}</td>
                    <td className={styles.number}>{item.quantity}</td>
                    <td className={styles.number}>KES {item.unit_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalAmount}>KES {order.total_amount}</span>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeading}>
              <h2 className={styles.panelTitle}>Shipping details</h2>
            </div>
            <div className={styles.details}>
              <div>
                <p className={styles.detailLabel}>Recipient</p>
                <p className={styles.detailValue}>{order.shipping_name}</p>
              </div>
              <div>
                <p className={styles.detailLabel}>Address</p>
                <p className={styles.detailValue}>
                  {order.shipping_address}, {order.shipping_city}
                </p>
              </div>
              <div>
                <p className={styles.detailLabel}>Phone</p>
                <p className={styles.detailValue}>{order.shipping_phone}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
