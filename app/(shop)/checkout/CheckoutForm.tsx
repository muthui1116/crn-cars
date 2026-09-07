"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../cart/CartContext";
import { placeOrder, payWithMpesa, checkOrderStatus } from "./actions";
import type { ShippingInfo, CheckoutStep } from "./types";
import styles from "./checkout.module.css";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200";

export default function CheckoutForm() {
  const { items, subtotal } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [shipping, setShipping] = useState<ShippingInfo>({
    name: "",
    phone: "",
    address: "",
    city: "",
  });
  const [error, setError] = useState("");

  async function handlePay() {
    setStep("paying");
    setError("");

    const orderResult = await placeOrder(items, shipping);
    if (!orderResult.success) {
      setError(orderResult.error);
      setStep("review");
      return;
    }

    const payResult = await payWithMpesa(orderResult.orderId, shipping.phone, subtotal);
    if (!payResult.success) {
      setError(payResult.error);
      setStep("review");
      return;
    }

    const poll = setInterval(async () => {
      const status = await checkOrderStatus(orderResult.orderId);
      if (status === "paid") {
        clearInterval(poll);
        router.push(`/checkout/success/${orderResult.orderId}`);
      } else if (status === "failed") {
        clearInterval(poll);
        setError("Payment failed or was cancelled. Please try again.");
        setStep("review");
      }
    }, 3000);
  }

  if (step === "shipping") {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>
              1
            </div>
            <div>
              <p className={styles.eyebrow}>Checkout</p>
              <h1 className={styles.title}>Shipping details</h1>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep("review");
            }}
            className={styles.layout}
          >
            <div className={`${styles.panel} ${styles.formPanel}`}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                <input
                  className={inputClass}
                  placeholder="Jane Doe"
                  value={shipping.name}
                  onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Phone number</label>
                <input
                  className={inputClass}
                  placeholder="2547XXXXXXXX"
                  value={shipping.phone}
                  onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  pattern="254[0-9]{9}"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
                <input
                  className={inputClass}
                  placeholder="123 Market Street"
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
                <input
                  className={inputClass}
                  placeholder="Nairobi"
                  value={shipping.city}
                  onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Continue to review
              </button>
            </div>
            </div>

            <aside className={`${styles.panel} ${styles.summary}`}>
              <p className={styles.summaryLabel}>Order summary</p>
              <div className={styles.itemList}>
                {items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemMeta}>Qty {item.quantity}</p>
                    </div>
                    <p className={styles.itemPrice}>KSh {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className={styles.total}>
                <span>Total</span>
                <span className={styles.totalAmount}>KSh {subtotal.toFixed(2)}</span>
              </div>
            </aside>
          </form>
        </div>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className={styles.page}>
        <div className={`${styles.container} ${styles.narrow}`}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>
              2
            </div>
            <div>
              <p className={styles.eyebrow}>Checkout</p>
              <h1 className={styles.title}>Review your order</h1>
            </div>
          </div>

          <div className={`${styles.panel} ${styles.formPanel}`}>
          <div className={styles.itemList}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemMeta}>Qty {item.quantity}</p>
                </div>
                <p className={styles.itemPrice}>KSh {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className={styles.shippingBox}>
            <p className={styles.shippingTitle}>Shipping to</p>
            <p>{shipping.name}</p>
            <p>{shipping.address}</p>
            <p>{shipping.city}</p>
            <p>{shipping.phone}</p>
          </div>

          <div className={styles.total}>
            <span>Total</span>
            <span className={styles.totalAmount}>KSh {subtotal.toFixed(2)}</span>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setStep("shipping")}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handlePay}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Pay with M-Pesa
            </button>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.container} ${styles.narrow}`}>
        <div className={`${styles.panel} ${styles.paymentPanel}`}>
          <div className={styles.paymentIcon}>
            📱
          </div>
          <h1 className={styles.title}>Check your phone</h1>
          <p className={styles.paymentText}>
            Enter your M-Pesa PIN on the prompt sent to <strong>{shipping.phone}</strong>.
          </p>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}