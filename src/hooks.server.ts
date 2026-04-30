import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;

  // Protect admin pages and admin API endpoints
  const isAdminPage = path.startsWith('/admin') && path !== '/admin/login';
  const isAdminApi = path.startsWith('/api/admin') && path !== '/api/admin/login';

  if (isAdminPage || isAdminApi) {
    const ok = event.cookies.get('bp_admin') === '1';
    if (!ok) {
      if (isAdminApi) return new Response('unauthorized', { status: 401 });
      throw redirect(303, '/admin/login');
    }
  }

  return resolve(event);
};
