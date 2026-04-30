import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  const { data } = await supabaseAdmin.from('clubs').select('*').order('name');
  return { clubs: data ?? [] };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const fd = await request.formData();
    const name = String(fd.get('name') ?? '').trim();
    const pin = String(fd.get('pin') ?? '');
    if (!name || !/^[0-9]{4}$/.test(pin)) return fail(400, { error: 'invalid' });
    const { error } = await supabaseAdmin.from('clubs').insert({ name, pin });
    if (error) return fail(500, { error: error.message });
    return { ok: true };
  },
  update: async ({ request }) => {
    const fd = await request.formData();
    const id = String(fd.get('id'));
    const name = String(fd.get('name') ?? '').trim();
    const pin = String(fd.get('pin') ?? '');
    if (!id || !name || !/^[0-9]{4}$/.test(pin)) return fail(400, { error: 'invalid' });
    const { error } = await supabaseAdmin.from('clubs').update({ name, pin }).eq('id', id);
    if (error) return fail(500, { error: error.message });
    return { ok: true };
  },
  delete: async ({ request }) => {
    const fd = await request.formData();
    const id = String(fd.get('id'));
    const { error } = await supabaseAdmin.from('clubs').delete().eq('id', id);
    if (error) return fail(500, { error: error.message });
    return { ok: true };
  }
};
