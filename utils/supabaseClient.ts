import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// NextAuthのセッションからSupabaseクライアントを認証状態にする関数
export const setSupabaseAuth = async (session: any) => {
  if (session?.accessToken) {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: session.accessToken,
        refresh_token: session.refreshToken || '',
      });
      if (error) {
        console.error('Supabaseセッション設定エラー:', error);
      }
    } catch (error) {
      console.error('Supabaseセッション設定エラー:', error);
    }
  } else {
    // セッションがない場合は、Supabaseセッションをクリア
    await supabase.auth.signOut();
  }
};
