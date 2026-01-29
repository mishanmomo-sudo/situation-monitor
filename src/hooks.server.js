import { env } from '$env/dynamic/private';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const VALID_TOKEN = env.GATEWAY_TOKEN; 
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');
    
    // 🚩 STRATEGY: Check multiple ways GoDaddy identifies itself
    const referer = event.request.headers.get('referer') || '';
    const origin = event.request.headers.get('origin') || '';
    const host = event.request.headers.get('host') || '';
    
    // Replace 'yourgodaddydomain.com' with your actual domain name
    const isFromDomain = referer.includes('mishan3.xyz') || 
                         origin.includes('mishan3.xyz');

    // 🚩 AUTHORIZATION LOGIC
    if (token === VALID_TOKEN || session === 'authorized' || isFromDomain) {
        
        // Let SvelteKit process the request
        const response = await resolve(event);
        
        // 🚩 FORCE HEADERS: Tell the browser it's okay to frame this site
        response.headers.set('X-Frame-Options', 'ALLOWALL');
        response.headers.set('Content-Security-Policy', "frame-ancestors 'self' https://mishan3.xyz https://www.mishan3.xyz;");
        // Ensure the browser doesn't try to "sniff" and block the content
        response.headers.set('X-Content-Type-Options', 'nosniff');

        // Set cookie with the ONLY settings that work inside an iframe
        if (token === VALID_TOKEN || isFromDomain) {
            event.cookies.set('gateway_session', 'authorized', {
                path: '/',
                httpOnly: true,
                sameSite: 'none', // MUST BE NONE
                secure: true,     // MUST BE TRUE
                maxAge: 60 * 60 * 24 
            });
        }
        return response;
    }

    // If we get here, log the headers so you can see why it's failing in Vercel Logs
    console.log("Blocking Request - Referer:", referer, "Origin:", origin);

    return new Response('403 Forbidden: Access through domain only.', { status: 403 });
}
