export async function handle({ event, resolve }) {
    // 1. ONLY allow internal build/prerender tools
    const isPrerendering = event.request.headers.get('x-prerender');
    if (isPrerendering) {
        return resolve(event);
    }

    // 2. Security Check
    const VALID_TOKEN = "ZP9SDHxWEzx87uK7T0A"; 
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    // If they have the token OR the cookie, let them in
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

    // 3. Reject everyone else
    return new Response('BLOCKED BY GATEWAY', { status: 403 });
}
