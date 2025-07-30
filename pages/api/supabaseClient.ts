import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing'
  });
}

// 一時的にダミーURLを使用（実際のURLに置き換えてください）
const fallbackUrl = 'https://example.supabase.co';
const fallbackKey = 'dummy-key';

export const supabase = createClient(
  supabaseUrl || fallbackUrl, 
  supabaseAnonKey || fallbackKey, 
  {
    auth: {
      autoRefreshToken: false, // 一時的に無効化
      persistSession: false,   // 一時的に無効化
      detectSessionInUrl: false
    }
  }
);