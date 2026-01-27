/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // 1. Safety valve for Vercel's build/preview bots
    const userAgent = event.request.headers.get('user-agent') || '';
    const isBuildBot = event.request.headers.get('x-prerender') || userAgent.includes('vercel');

    if (isBuildBot) {
        return resolve(event);
    }

    // 2. Dashboard Access Logic
    const VALID_TOKEN = "ZP9SDHxWEzx87uK7T0A"; // Change to your actual token
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    // If they have the token OR already have an authorized session cookie
    if (token === VALID_TOKEN || session === 'authorized') {
        const response = await resolve(event);
        
        // If they just arrived with a valid token, set the persistent cookie
        if (token === VALID_TOKEN) {
            response.headers.append('Set-Cookie', event.cookies.serialize('gateway_session', 'authorized', {
                path: '/',
                httpOnly: true,
                sameSite: 'none', // Critical: allows cookie to work inside GoDaddy iframe
                secure: true,
                maxAge: 60 * 60 * 24 // 24 hour access
            }));
        }
        return response;
    }

    // 3. Reject Direct Public Traffic
    return new Response('403 Forbidden: Access through domain only.', { status: 403 });
}
