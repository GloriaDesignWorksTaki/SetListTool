import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// NextAuthのセッションからSupabaseクライアントを認証状態にする関数
export const setSupabaseAuth = async (session: any) => {
  if (session?.accessToken) {
    try {
      await supabase.auth.setSession({
        access_token: session.accessToken,
        refresh_token: session.refreshToken || '',
      });
    } catch (error) {
      console.error('Supabaseセッション設定エラー:', error);
    }
  }
};