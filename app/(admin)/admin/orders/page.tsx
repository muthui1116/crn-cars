// app/(admin)/admin/orders/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAllOrders } from "./queries";
import StatusSelect from "./StatusSelect";
import styles from "./orders.module.css";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== 1) redirect("/"); // not admin

  const orders = await getAllOrders();

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.backLink}>
          &larr; Back to storefront
        </Link>

        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>Operations</p>
            <h1 className={styles.title}>Order management</h1>
            <p className={styles.subtitle}>
              Review customer orders and keep fulfillment status up to date.
            </p>
          </div>
          <div className={styles.count}>
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </div>
        </div>

        {orders.length === 0 ? (
          <section className={styles.empty}>
            <h2 className={styles.emptyTitle}>No orders yet</h2>
            <p className={styles.emptyText}>New customer orders will appear here.</p>
          </section>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Phone no.</th>
                  <th>Total</th>
                  <th>Placed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className={styles.orderId}>#{order.id}</td>
                    <td>
                      <div className={styles.email}>{order.email}</div>
                      <div className={styles.userId}>User {order.user_id}</div>
                    </td>
                    <td>{order.shipping_phone}</td>
                    <td className={styles.total}>KES {order.total_amount}</td>
                    <td className={styles.date}>
                      {new Date(order.created_at).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <StatusSelect orderId={String(order.id)} currentStatus={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
