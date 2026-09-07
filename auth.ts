// auth.ts — full config, Node runtime, used by the route handler and Server Components
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import db from "./app/_lib/db";
import { authConfig } from "./auth.config";

const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim();
if (!nextAuthSecret) {
  throw new Error("Missing required environment variable: NEXTAUTH_SECRET");
}

export function resolveSessionUserId(tokenUserId?: string, fallbackUserId?: string) {
  const candidate = [tokenUserId, fallbackUserId].find(
    (value) => typeof value === "string" && value.trim().length > 0
  );

  return candidate ? String(candidate).trim() : "";
}

const nextAuth = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = (credentials?.email as string)?.toLowerCase().trim();
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        const valid = user?.password ? await bcrypt.compare(password, user.password) : false;
        if (!user || !valid) return null;

        return { id: String(user.id), name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user?.email) {
          console.warn("Google signIn: missing user.email.", { account });
        } else {
          try {
            const existing = await db.query("SELECT * FROM users WHERE email = $1", [user.email]);

            if (existing.rows.length === 0) {
              await db.query(
                `INSERT INTO users (name, email, password, provider)
                 VALUES ($1, $2, NULL, 'google')`,
                [user.name ?? user.email, user.email]
              );
            }
          } catch (err) {
            console.error("Error ensuring google user exists:", err);
          }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      const fallbackUserId = typeof user?.id === "string" ? user.id : undefined;
      const resolvedUserId = resolveSessionUserId(token.sub, fallbackUserId);

      if (resolvedUserId) {
        token.userId = resolvedUserId;
        token.sub = resolvedUserId;
      }

      if (user && "role" in user && typeof user.role === "number") {
        token.role = user.role;
      }

      const email = token.email ?? (typeof user?.email === "string" ? user.email : undefined);
      if (!email) {
        return token;
      }

      try {
        const result = await db.query("SELECT id, role FROM users WHERE email = $1", [email]);
        const dbUser = result.rows[0];

        if (!dbUser) {
          return token;
        }

        const dbUserId = String(dbUser.id);
        token.userId = dbUserId;
        token.sub = dbUserId;
        token.role = Number(dbUser.role ?? token.role ?? 2);
      } catch (err) {
        console.error("Failed to resolve user role/id from DB in jwt callback:", err);
      }

      return token;
    },
  },
  secret: nextAuthSecret,
});

export const { handlers, auth, signIn, signOut } = nextAuth;