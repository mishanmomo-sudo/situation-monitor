import type { Handle } from '@sveltejs/kit';

const ALLOWED_HOST = 'monitor.mishan3.xyz'; // CHANGE THIS

export const handle: Handle = async ({ event, resolve }) => {
  const url = event.url;
  const token = url.searchParams.get('token');
  const host = event.request.headers.get('host');

  // Block raw vercel.app access
  if (host && host !== ALLOWED_HOST) {
    return new Response('Not Found', { status: 404 });
  }

  // Require token
  if (token !== process.env.DASHBOARD_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  return resolve(event);
};
