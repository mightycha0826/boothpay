import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  const [{ data: products }, { data: clubs }] = await Promise.all([
    supabaseAdmin.from('products').select('*, clubs(name)').order('created_at', { ascending: false }),
    supabaseAdmin.from('clubs').select('id, name').order('name')
  ]);
  return { products: products ?? [], clubs: clubs ?? [] };
};

function parseProduct(fd: FormData) {
  const club_id = String(fd.get('club_id') ?? '');
  const name = String(fd.get('name') ?? '').trim();
  const price = Number(fd.get('price'));
  const stock = Number(fd.get('stock'));
  const is_visible = fd.get('is_visible') === 'on' || fd.get('is_visible') === 'true';
  if (!club_id || !name || !Number.isFinite(price) || price < 0 ||
      !Number.isFinite(stock) || stock < 0) return null;
  return { club_id, name, price: Math.floor(price), stock: Math.floor(stock), is_visible };
}

export const actions: Actions = {
  create: async ({ request }) => {
    const data = parseProduct(await request.formData());
    if (!data) return fail(400, { error: 'invalid' });
    const { error } = await supabaseAdmin.from('products').insert(data);
    if (error) return fail(500, { error: error.message });
    return { ok: true };
  },
  update: async ({ request }) => {
    const fd = await request.formData();
    const id = String(fd.get('id'));
    const data = parseProduct(fd);
    if (!id || !data) return fail(400, { error: 'invalid' });
    const { error } = await supabaseAdmin.from('products').update(data).eq('id', id);
    if (error) return fail(500, { error: error.message });
    return { ok: true };
  },
  delete: async ({ request }) => {
    const fd = await request.formData();
    const id = String(fd.get('id'));
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) return fail(500, { error: error.message });
    return { ok: true };
  }
};
