import { json, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { clubId, pin } = await request.json();
  if (!clubId || !/^[0-9]{4}$/.test(pin ?? '')) throw error(400, 'invalid_input');

  const { data, error: e } = await supabaseAdmin
    .from('clubs').select('id').eq('id', clubId).eq('pin', pin).maybeSingle();
  if (e) throw error(500, e.message);
  if (!data) throw error(401, 'invalid_pin');
  return json({ ok: true });
};
