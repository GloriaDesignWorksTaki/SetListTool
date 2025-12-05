import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 実行時（クライアント側）のみ環境変数をチェック
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing'
  });
  throw new Error(
    'Supabase環境変数が設定されていません。Vercelのダッシュボードで環境変数（NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEY）を設定してください。'
  );
}

// ビルド時には環境変数がなくてもビルドを通すために、空文字列でクライアントを作成
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// NextAuthのセッションからSupabaseクライアントを認証状態にする関数
export const setSupabaseAuth = (session: any) => {
  if (session?.accessToken) {
    // NextAuthのセッションからSupabaseのアクセストークンを設定
    supabase.auth.setSession({
      access_token: session.accessToken,
      refresh_token: session.refreshToken || '',
    });
  }
};