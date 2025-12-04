export type SetlistItem = {
  id: string;
  type: 'song' | 'mc';
  content: string;
  order: number;
};

export type Song = {
  id: string;
  title: string;
};

export type Band = {
  id: string;
  name: string;
  user_id: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}; 