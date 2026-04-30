import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { password } = await request.json();
  const expected = (env.ADMIN_PASSWORD ?? '').trim();
  if (!expected || String(password ?? '').trim() !== expected) {
    throw error(401, 'unauthorized');
  }
  cookies.set('bp_admin', '1', {
    path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 8
  });
  return json({ ok: true });
};
