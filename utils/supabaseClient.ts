import { createClient } from '@supabase/supabase-js'
import type { Session } from 'next-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

/** NextAuth 経由で受け取った Supabase access token（ブラウザ用） */
let currentAccessToken: string | null = null

/**
 * setSession（→ /auth/v1/user）を使わず、RLS 用に Bearer を付け替える。
 * /auth/v1/* には付けない（signup / resend / password リセットが破綻しないように）。
 */
const authAwareFetch: typeof fetch = async (input, init) => {
  const headers = new Headers(init?.headers)
  const url =
    typeof input === 'string'
      ? input
      : input instanceof Request
        ? input.url
        : String(input)

  const isAuthEndpoint = url.includes('/auth/v1/')
  if (currentAccessToken && !isAuthEndpoint) {
    headers.set('Authorization', `Bearer ${currentAccessToken}`)
  }

  return fetch(input, { ...init, headers })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: authAwareFetch,
  },
})

const hasJwtShape = (token: string): boolean => token.split('.').length === 3

/**
 * NextAuth セッションの accessToken を Supabase クライアントへ反映する。
 * setSession は /auth/v1/user を呼ぶため、期限切れ・不正 JWT で 403 になりアプリが止まる。
 * ここではトークンをヘッダへ載せるだけに留め、refresh は NextAuth jwt コールバックに任せる。
 */
export const setSupabaseAuth = async (session: Session | null): Promise<void> => {
  const token = session?.accessToken

  if (!token || !hasJwtShape(token)) {
    currentAccessToken = null
    try {
      // realtime の認証解除（未使用でも無害）
      supabase.realtime.setAuth('')
    } catch {
      // ignore
    }
    return
  }

  currentAccessToken = token
  try {
    supabase.realtime.setAuth(token)
  } catch {
    // ignore
  }
}

/** 現在ブラウザに載せている access token（デバッグ・テスト用） */
export const getBrowserSupabaseAccessToken = (): string | null => currentAccessToken
