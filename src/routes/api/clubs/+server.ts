import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const { data, error } = await supabaseAdmin
    .from('clubs').select('id, name').order('name');
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ clubs: data ?? [] });
};
