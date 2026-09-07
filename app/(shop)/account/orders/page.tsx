// app/(shop)/account/orders/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrdersForUser } from "./queries";
import styles from "./orders.module.css";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await getOrdersForUser(session.user.id);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.backLink}>
          &larr; Back to shopping
        </Link>

        <header className={styles.heading}>
          <p className={styles.eyebrow}>Account</p>
          <h1 className={styles.title}>My orders</h1>
          <p className={styles.subtitle}>Track your purchases and view order details.</p>
        </header>

        {orders.length === 0 ? (
          <section className={styles.empty}>
            <h2 className={styles.emptyTitle}>No orders yet</h2>
            <p className={styles.emptyText}>Your orders will appear here after checkout.</p>
          </section>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className={styles.orderId} data-label="Order">#{order.id}</td>
                    <td className={styles.date} data-label="Date">
                      {new Date(order.created_at).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className={styles.total} data-label="Total">KES {order.total_amount}</td>
                    <td data-label="Status">
                      <span className={`${styles.status} ${styles[`status${order.status[0].toUpperCase()}${order.status.slice(1)}`]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td data-label="">
                      <Link className={styles.detailsLink} href={`/account/orders/${order.id}`}>
                        View details
                      </Link>
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
