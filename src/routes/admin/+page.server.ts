import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [{ data: orders }, { data: clubs }] = await Promise.all([
    supabaseAdmin.from('orders').select('club_id, total_price'),
    supabaseAdmin.from('clubs').select('id, name').order('name')
  ]);

  const byClub = new Map<string, number>();
  let total = 0;
  for (const o of orders ?? []) {
    total += o.total_price;
    byClub.set(o.club_id, (byClub.get(o.club_id) ?? 0) + o.total_price);
  }

  const breakdown = (clubs ?? []).map((c) => ({
    id: c.id, name: c.name, revenue: byClub.get(c.id) ?? 0
  }));

  return { total, breakdown, orderCount: orders?.length ?? 0 };
};
