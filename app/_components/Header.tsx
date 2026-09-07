"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import styles from "./css/Header.module.css";

export default function Header() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const isAdmin = session?.user?.role === 1;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          CRN ECOM
        </Link>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <Link href="/account/orders" className={styles.ordersLink}>
                  My Orders
                </Link>
              )}
              {session.user.role === 1 && (
                <Link href="/admin/orders" className={styles.ordersLink}>
                  Manage Orders
                </Link>
              )}
              <span className={styles.userBadge}>
                {session.user?.name ?? session.user?.email}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className={styles.logoutButton}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.signInLink}>
                Sign in
              </Link>
              <Link href="/register" className={styles.registerLink}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
