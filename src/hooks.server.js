import { env } from '$env/dynamic/private';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const userAgent = event.request.headers.get('user-agent') || '';
    const isBuildBot = event.request.headers.get('x-prerender') || userAgent.includes('vercel');

    if (isBuildBot) return resolve(event);

    const VALID_TOKEN = env.GATEWAY_TOKEN; 
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');
    
    // 🚩 BACKUP: Check if the request is coming FROM your GoDaddy domain
    const referer = event.request.headers.get('referer') || '';
    const isFromDomain = referer.includes('yourgodaddydomain.com');

    // 3. Authorization Check (Allow if Token, Session, OR coming from the Domain Referer)
    if (token === VALID_TOKEN || session === 'authorized' || isFromDomain) {
        const response = await resolve(event);
        
        // Fix headers for the "Refused to Connect" issue
        response.headers.set('X-Frame-Options', 'ALLOWALL');
        response.headers.set('Content-Security-Policy', "frame-ancestors 'self' https://mishan3.xyz https://www.mishan3.xyz;");

        // Try to set the cookie, but use the new secure standards for Iframes
        if (token === VALID_TOKEN || isFromDomain) {
            event.cookies.set('gateway_session', 'authorized', {
                path: '/',
                httpOnly: true,
                sameSite: 'none', // Critical for iframes
                secure: true,     // Critical for iframes
                maxAge: 60 * 60 * 24 
            });
        }
        return response;
    }

    // 4. If all checks fail
    return new Response('403 Forbidden: Access through domain only.', { status: 403 });
}
