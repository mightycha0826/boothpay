import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

export type Club = { id: string; name: string };
export type Product = {
  id: string; club_id: string; name: string;
  price: number; stock: number; is_visible: boolean;
};
