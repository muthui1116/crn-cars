// app/(auth)/register/page.tsx
import RegisterForm from "../../_components/RegisterForm";
import styles from "./register.module.css";

export default function RegisterPage() {
  return (
    <main className={styles.main}>
      <RegisterForm />
    </main>
  );
}