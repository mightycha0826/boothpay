import { json, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { clubId, pin, studentId, items } = await request.json();

  if (!clubId || !/^[0-9]{4}$/.test(pin ?? '')) throw error(400, 'invalid_input');
  if (!/^[0-9]{5}$/.test(studentId ?? '')) throw error(400, 'invalid_student_id');
  if (!Array.isArray(items) || items.length === 0) throw error(400, 'empty_cart');
  for (const it of items) {
    if (!it?.product_id || !Number.isInteger(it.quantity) || it.quantity <= 0)
      throw error(400, 'invalid_item');
  }

  const { data, error: e } = await supabaseAdmin.rpc('checkout', {
    p_club_id: clubId, p_pin: pin, p_student_id: studentId, p_items: items
  });
  if (e) {
    const msg = e.message || 'checkout_failed';
    if (msg.includes('invalid_pin')) throw error(401, 'PIN이 올바르지 않습니다.');
    if (msg.includes('insufficient_stock')) throw error(409, '재고 부족: ' + msg.split(':').pop());
    if (msg.includes('product_not_found')) throw error(404, '상품을 찾을 수 없습니다.');
    throw error(500, msg);
  }
  return json({ orderId: data });
};
