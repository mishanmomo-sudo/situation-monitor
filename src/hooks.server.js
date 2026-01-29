import { GATEWAY_TOKEN } from '$env/static/private';
import { json } from '@sveltejs/kit';

export const config = {
    runtime: 'nodejs'
};

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');
    
    // 1. Check if user is already authenticated via cookie or provides a valid token
    const isAuthenticated = session === GATEWAY_TOKEN || token === GATEWAY_TOKEN;

    // DEBUGGING BLOCK
    // You can remove this once token_equal returns true
    if (event.url.searchParams.has('debug')) {
        return json({
            token_received: token,
            env_token_exists: !!GATEWAY_TOKEN, // Don't leak the actual token in JSON
            token_equal: token === GATEWAY_TOKEN,
            session_cookie_exists: !!session,
            protocol: event.url.protocol,
            host: event.url.host
        });
    }

    // 2. Security Gate
    if (!isAuthenticated) {
        return new Response('Access Denied: Invalid Token', { status: 403 });
    }

    // 3. Set the cookie if they used a token to get in
    // Note: 'SameSite: none' and 'Secure: true' are MANDATORY for iframes
    if (token === GATEWAY_TOKEN && !session) {
        event.cookies.set('gateway_session', GATEWAY_TOKEN, {
            path: '/',
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });
    }

    // 4. Proceed with the request
    const response = await resolve(event);

    // 5. Ensure Security Headers are present on the response
    // (Vercel.json handles this too, but redundancy here helps)
    response.headers.set('X-Frame-Options', 'ALLOWALL'); 
    response.headers.set('Content-Security-Policy', "frame-ancestors 'self' https://mishan3.xyz https://www.mishan3.xyz;");

    return response;
}
