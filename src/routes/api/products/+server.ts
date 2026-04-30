import { json, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const clubId = url.searchParams.get('clubId');
  if (!clubId) throw error(400, 'clubId required');
  const { data, error: e } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('club_id', clubId)
    .eq('is_visible', true)
    .order('name');
  if (e) throw error(500, e.message);
  return json({ products: data ?? [] });
};
