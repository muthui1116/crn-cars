// types/next-auth.d.ts
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role: number;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: number;
    userId?: string;
  }
}
