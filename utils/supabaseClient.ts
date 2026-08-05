import { createClient } from '@supabase/supabase-js'
import type { Session } from 'next-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})

/** accessToken が変わったときだけ setSession する（無駄な往復を減らす） */
let lastAccessToken: string | null = null

// NextAuthのセッションからSupabaseクライアントを認証状態にする関数
export const setSupabaseAuth = async (session: Session | null): Promise<void> => {
  if (!session?.accessToken) {
    if (lastAccessToken !== null) {
      lastAccessToken = null
      await supabase.auth.signOut({ scope: 'local' })
    }
    return
  }

  if (session.accessToken === lastAccessToken) {
    return
  }

  await supabase.auth.setSession({
    access_token: session.accessToken,
    refresh_token: session.refreshToken || '',
  })
  lastAccessToken = session.accessToken
}
