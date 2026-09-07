// app/(auth)/register/page.tsx
// app/(auth)/login/page.tsx
import { Suspense } from "react";
import LoginForm from "../../_components/LoginForm";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <Suspense>
      <main className={styles.main}>
        <LoginForm />
      </main>
    </Suspense>
  );
}