import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/utils/supabaseClient";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "メールアドレス", type: "text", placeholder: "メールアドレス" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('[NextAuth] Credentials missing');
          return null;
        }

        try {
          // 環境変数の確認
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

          if (!supabaseUrl || !supabaseKey) {
            console.error('[NextAuth] Supabase environment variables missing', {
              hasUrl: !!supabaseUrl,
              hasKey: !!supabaseKey
            });
            return null;
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error('[NextAuth] Supabase sign in error:', error.message);
            return null;
          }

          if (!data.user || !data.session) {
            console.error('[NextAuth] No user or session returned');
            return null;
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email,
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
          };
        } catch (error: any) {
          console.error('[NextAuth] Authorization error:', error?.message || error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id;
          token.accessToken = user.accessToken;
          token.refreshToken = user.refreshToken;
        }
        return token;
      } catch (error: any) {
        console.error('[NextAuth] JWT callback error:', error?.message || error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (token && session) {
          if (token.id) {
            session.user.id = token.id as string;
          }
          if (token.accessToken) {
            session.accessToken = token.accessToken as string;
          }
          if (token.refreshToken) {
            session.refreshToken = token.refreshToken as string;
          }
        }
        return session;
      } catch (error: any) {
        console.error('[NextAuth] Session callback error:', error?.message || error);
        return session;
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 1年間
  },
  // セッション永続化の設定
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 365 * 24 * 60 * 60 // 1年間
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 365 * 24 * 60 * 60
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 365 * 24 * 60 * 60
      }
    }
  },
  // セッション更新の設定
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});