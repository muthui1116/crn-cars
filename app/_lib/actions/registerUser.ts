import bcrypt from "bcrypt";
import { headers } from "next/headers";
import db from "../../_lib/db";
import { checkRateLimit } from "../../_lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterResult = {
  success: boolean;
  message: string;
};

export async function registerUser(prevState: unknown, formData: FormData): Promise<RegisterResult> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || name.length < 2) {
    return { success: false, message: "Please enter a valid name." };
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return { success: false, message: "Enter a valid email address." };
  }

  if (!password || password.length < 8) {
    return { success: false, message: "Password must be at least 8 characters." };
  }

  try {
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      const { allowed } = await checkRateLimit(`register:${ip}`, 2, 10);
      if (!allowed) {
        return { success: false, message: "Too many attempts. Please try again in 10 minutes." };
      }
      return { success: false, message: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (name, email, password, provider)
       VALUES ($1, $2, $3, 'credentials')`,
      [name, email, hashedPassword]
    );

    return { success: true, message: "Registered successfully." };
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === "23505") {
      const { allowed } = await checkRateLimit(`register:${ip}`, 2, 10);
      if (!allowed) {
        return { success: false, message: "Too many attempts. Please try again in 10 minutes." };
      }
      return { success: false, message: "An account with this email already exists." };
    }

    console.error("User registration failed:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}