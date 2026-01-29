import { env } from '$env/dynamic/private';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // 1. Safety valve for Vercel's build/preview bots
    const userAgent = event.request.headers.get('user-agent') || '';
    const isBuildBot = event.request.headers.get('x-prerender') || userAgent.includes('vercel');

    if (isBuildBot) {
        return resolve(event);
    }

    // 2. Dashboard Access Logic
    const VALID_TOKEN = env.GATEWAY_TOKEN; 
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    // 3. Authorization Check
    // If we have a token or a valid session, let them through
    if (token === VALID_TOKEN || session === 'authorized') {
        const response = await resolve(event);
        
        // 🚩 FIX: Security Headers to allow GoDaddy Iframe "Mirroring"
        // This stops the "Refused to connect" error
        response.headers.set('X-Frame-Options', 'ALLOWALL');
        response.headers.set('Content-Security-Policy', "frame-ancestors 'self' https://mishan3.xyz;");

        if (token === VALID_TOKEN) {
            response.headers.append('Set-Cookie', event.cookies.serialize('gateway_session', 'authorized', {
                path: '/',
                httpOnly: true,
                sameSite: 'none', // Required for iframes
                secure: true,     // Required for sameSite: 'none'
                maxAge: 60 * 60 * 24 
            }));
        }
        return response;
    }

    // 4. Reject Direct Public Traffic
    // 🚩 WITTY NOTE: If you reach here, SvelteKit thinks you are an intruder!
    return new Response('403 Forbidden: Access through domain only.', { status: 403 });
}
