export async function handle({ event, resolve }) {
  const url = event.url;
  const isPrerender =
    event.request.headers.get('x-prerender') ||
    process.env.VERCEL_ENV === 'production' && event.request.headers.get('user-agent')?.includes('vercel');

  // Allow all during build / prerender
  if (isPrerender || process.env.VERCEL === '1') {
    return resolve(event);
  }

  return new Response('BLOCKED BY GATEWAY', { status: 403 });
}
