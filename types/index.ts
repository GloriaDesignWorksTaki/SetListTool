export type SetlistItem = {
  id: string;
  type: 'song' | 'mc';
  content: string;
  order: number;
};

export type Song = {
  id: string;
  title: string;
  band_id: string;
};

export type Band = {
  id: string;
  name: string;
  logo_url: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}; 