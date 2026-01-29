import { env } from '$env/dynamic/private';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // 1. Get environment variables safely
    const VALID_TOKEN = env.GATEWAY_TOKEN || 'fallback_if_env_missing'; 
    
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');
    
    const referer = event.request.headers.get('referer') || '';
    const origin = event.request.headers.get('origin') || '';
    
    // Replace with your actual domain
    const isFromDomain = referer.includes('mishan3.xyz') || 
                         origin.includes('mishan3.xyz');

    // 2. Authorization Check
    if (token === VALID_TOKEN || session === 'authorized' || isFromDomain) {
        
        const response = await resolve(event);
        
        // 🚩 Security Headers for the Iframe
        response.headers.set('X-Frame-Options', 'ALLOWALL');
        response.headers.set('Content-Security-Policy', "frame-ancestors 'self' https://mishan3.xyz https://www.mishan3.xyz;");

        // 🚩 Corrected Cookie Syntax (Fixes the 500 Error)
        if (token === VALID_TOKEN || isFromDomain) {
            event.cookies.set('gateway_session', 'authorized', {
                path: '/',
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 60 * 60 * 24 
            });
        }
        return response;
    }

    return new Response('Access Denied', { status: 403 });
}
