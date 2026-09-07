import bcrypt from "bcrypt";
import { headers } from "next/headers";
import db from "../db";
import { checkRateLimit } from "../../_lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginResult = {
  success: boolean;
  message: string;
};

export async function loginUser(formData: FormData): Promise<LoginResult> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !EMAIL_REGEX.test(email)) {
    return { success: false, message: "Enter a valid email address." };
  }

  if (!password || password.length < 8) {
    return { success: false, message: "Password must be at least 8 characters." };
  }

  try {
    const result = await db.query("SELECT id, password FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user?.password) {
      const { allowed } = await checkRateLimit(`login:${ip}`, 2, 10);
      if (!allowed) {
        return { success: false, message: "Too many failed attempts. Please try again in 10 minutes." };
      }
      return { success: false, message: "Invalid email or password." };
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      const { allowed } = await checkRateLimit(`login:${ip}`, 2, 10);
      if (!allowed) {
        return { success: false, message: "Too many failed attempts. Please try again in 10 minutes." };
      }
      return { success: false, message: "Invalid email or password." };
    }

    return { success: true, message: "Login successful." };
  } catch (error) {
    console.error("Login validation failed:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}