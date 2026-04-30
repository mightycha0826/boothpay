import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const clubId = url.searchParams.get('clubId');

  let q = supabaseAdmin
    .from('orders')
    .select('id, created_at, student_id, club_id, clubs(name), order_items(quantity, unit_price, products(name))')
    .order('created_at', { ascending: true });
  if (clubId) q = q.eq('club_id', clubId);

  const { data, error } = await q;
  if (error) return json({ error: error.message }, { status: 500 });

  const rows: any[] = [];
  for (const o of data ?? []) {
    for (const it of (o as any).order_items ?? []) {
      rows.push({
        Timestamp: new Date(o.created_at).toISOString(),
        'Club Name': (o as any).clubs?.name ?? '',
        'Student ID': o.student_id,
        'Product Name': it.products?.name ?? '',
        'Unit Price': it.unit_price,
        Quantity: it.quantity,
        Subtotal: it.unit_price * it.quantity
      });
    }
  }
  return json({ rows });
};
