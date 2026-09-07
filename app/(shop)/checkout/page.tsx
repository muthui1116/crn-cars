// app/(shop)/checkout/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CheckoutForm from "./CheckoutForm";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/checkout");

  return <CheckoutForm />;
}