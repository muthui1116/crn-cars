// auth.config.ts — Edge-safe: NO bcrypt, NO db, NO Credentials provider
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

const googleProviders =
  googleClientId && googleClientSecret
    ? [
        Google({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        }),
      ]
    : [];

export const authConfig = {
  providers: googleProviders,
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        const userId = token.sub ?? token.userId ?? "";
        session.user.id = userId ? String(userId) : "";

        const roleValue = Number(token.role ?? 2);
        session.user.role = Number.isFinite(roleValue) ? roleValue : 2;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
} satisfies NextAuthConfig;