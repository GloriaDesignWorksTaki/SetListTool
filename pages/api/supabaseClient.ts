import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing'
  });
  throw new Error('Supabase environment variables are not configured. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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