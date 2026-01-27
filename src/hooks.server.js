/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // 1. Allow the Vercel Build/Prerender bot to pass
    // This fixes the "failed with status 403" build error
    if (event.request.headers.get('x-prerender') || event.request.headers.get('user-agent')?.includes('vercel')) {
        return resolve(event);
    }

    const VALID_TOKEN = "ZP9SDHxWEzx87uK7T0A"; 
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    // 2. Security Logic
    if (token === VALID_TOKEN || session === 'authorized') {
        const response = await resolve(event);
        if (token === VALID_TOKEN) {
            response.headers.append('Set-Cookie', event.cookies.serialize('gateway_session', 'authorized', {
                path: '/',
                httpOnly: true,
                sameSite: 'none', 
                secure: true,
                maxAge: 60 * 60 * 24
            }));
        }
        return response;
    }

    // 3. Block everyone else
    return new Response('BLOCKED BY GATEWAY', { status: 403 });
}
