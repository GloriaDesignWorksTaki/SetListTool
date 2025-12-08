import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/utils/supabaseClient";

// 環境変数の検証
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

if (!nextAuthSecret) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXTAUTH_SECRET environment variable is required in production. " +
      "Please set it in your Vercel project settings under Environment Variables. " +
      "You can generate one using: openssl rand -base64 32"
    );
  } else {
    console.warn(
      "⚠️  WARNING: NEXTAUTH_SECRET is not set. " +
      "Please add it to your .env.local file for development. " +
      "You can generate one using: openssl rand -base64 32"
    );
  }
}

// NEXTAUTH_URLの検証（本番環境では自動検出されるが、明示的に設定することを推奨）
if (!nextAuthUrl && process.env.NODE_ENV === "production") {
  console.warn(
    "⚠️  WARNING: NEXTAUTH_URL is not set. " +
    "It's recommended to set this in production for better security."
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "メールアドレス",
          type: "text",
          placeholder: "メールアドレス",
        },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[NextAuth] Credentials missing");
          return null;
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error("[NextAuth] Supabase sign in error:", error.message);
            return null;
          }

          if (!data.user || !data.session) {
            console.error("[NextAuth] No user or session returned");
            return null;
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email,
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
          } as any;
        } catch (error: any) {
          console.error(
            "[NextAuth] Authorization error:",
            error?.message || error
          );
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          const u = user as any;
          token.id = u.id;
          token.accessToken = u.accessToken;
          token.refreshToken = u.refreshToken;
        }
        return token;
      } catch (error: any) {
        console.error("[NextAuth] JWT callback error:", error?.message || error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session.user && token) {
          (session.user as any).id = token.id as string;
          (session as any).accessToken = token.accessToken as string;
          (session as any).refreshToken = token.refreshToken as string;
        }
        return session;
      } catch (error: any) {
        console.error(
          "[NextAuth] Session callback error:",
          error?.message || error
        );
        return session;
      }
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 1年
  },

  secret: nextAuthSecret || (process.env.NODE_ENV === "development" ? "development-secret-key-change-in-production" : undefined),
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);