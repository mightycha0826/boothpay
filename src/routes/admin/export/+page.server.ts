import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const { data } = await supabaseAdmin.from('clubs').select('id, name').order('name');
  return { clubs: data ?? [] };
};
