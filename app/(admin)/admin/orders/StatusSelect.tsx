// app/(admin)/admin/orders/StatusSelect.tsx
"use client";

import { useState, useTransition } from "react";
import { changeOrderStatus } from "../actions";
import styles from "./orders.module.css";

const STATUSES = ["pending", "paid", "failed", "shipped", "delivered"];

export default function StatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleChange(newStatus: string) {
    setStatus(newStatus); // optimistic
    startTransition(async () => {
      const result = await changeOrderStatus(orderId, newStatus);
      if (result.error) setStatus(currentStatus); // revert on failure
    });
  }

  return (
    <select
      className={styles.statusSelect}
      value={status}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value)}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
