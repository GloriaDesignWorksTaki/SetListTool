import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createServerSupabaseClient } from "@/utils/createServerSupabaseClient";
import { isAdminEmail } from "@/utils/adminAuth";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not set.");
}

/** JWT の exp（秒）をミリ秒で返す */
const getJwtExpiryMs = (accessToken?: string): number | undefined => {
  if (!accessToken) return undefined;
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return undefined;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: number;
    };
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : undefined;
  } catch {
    return undefined;
  }
};

/** 期限の60秒前ならリフレッシュ対象 */
const shouldRefreshAccessToken = (expiresAt?: number): boolean => {
  if (!expiresAt) return true;
  return Date.now() >= expiresAt - 60_000;
};

/** Supabase / NextAuth で共通化しやすいエラー文言 */
const AUTH_ERRORS = {
  emailNotConfirmed: "Email not confirmed",
  invalidCredentials: "Invalid login credentials",
} as const;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "メールアドレス", type: "text", placeholder: "メールアドレス" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // リクエスト単位の独立クライアント（共有インスタンス禁止）
        const supabase = createServerSupabaseClient();

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          const msg = error.message || ""
          if (/email not confirmed/i.test(msg)) {
            throw new Error(AUTH_ERRORS.emailNotConfirmed)
          }
          if (/invalid login credentials/i.test(msg)) {
            throw new Error(AUTH_ERRORS.invalidCredentials)
          }
          throw new Error(msg || AUTH_ERRORS.invalidCredentials)
        }

        if (!data.user || !data.session) {
          throw new Error(AUTH_ERRORS.invalidCredentials)
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          accessTokenExpiresAt:
            getJwtExpiryMs(data.session.access_token) ??
            Date.now() + (data.session.expires_in ?? 3600) * 1000,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 初回ログイン
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpiresAt =
          user.accessTokenExpiresAt ?? getJwtExpiryMs(user.accessToken);
        token.error = undefined;
        return token;
      }

      // まだ有効ならそのまま
      if (!shouldRefreshAccessToken(token.accessTokenExpiresAt as number | undefined)) {
        return token;
      }

      // access token の更新
      if (!token.refreshToken) {
        return { ...token, error: "RefreshAccessTokenError" };
      }

      try {
        const supabase = createServerSupabaseClient();
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: token.refreshToken as string,
        });

        if (error || !data.session) {
          return { ...token, error: "RefreshAccessTokenError" };
        }

        return {
          ...token,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token ?? token.refreshToken,
          accessTokenExpiresAt:
            getJwtExpiryMs(data.session.access_token) ??
            Date.now() + (data.session.expires_in ?? 3600) * 1000,
          error: undefined,
        };
      } catch {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string | undefined;
        // setSession 用に必要。JWT は httpOnly クッキー内、session API 経由でのみ露出
        session.refreshToken = token.refreshToken as string | undefined;
        session.error = token.error as string | undefined;
        session.isAdmin = isAdminEmail(session.user.email);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 1年間
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 365 * 24 * 60 * 60,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 365 * 24 * 60 * 60,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 365 * 24 * 60 * 60,
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
  useSecureCookies: process.env.NODE_ENV === "production",
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
