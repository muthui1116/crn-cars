import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import db from "../../_lib/db";
import type { RegisterRequestBody, RegisterResponseBody } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterRequestBody;
  const { name, email: rawEmail, password } = body;
  const email = rawEmail?.trim().toLowerCase();

  if (!name || !name.trim()) {
    return NextResponse.json<RegisterResponseBody>(
      { success: false, message: "Name is required." },
      { status: 400 }
    );
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json<RegisterResponseBody>(
      { success: false, message: "Enter a valid email address." },
      { status: 400 }
    );
  }

  if (!password || password.length < 8) {
    return NextResponse.json<RegisterResponseBody>(
      { success: false, message: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  try {
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json<RegisterResponseBody>(
        { success: false, message: "A user with this email already exists." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)`,
      [name.trim(), email, hashed]
    );

    return NextResponse.json<RegisterResponseBody>(
      { success: true, message: "Registered successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json<RegisterResponseBody>(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}