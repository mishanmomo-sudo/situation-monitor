import { DASHBOARD_TOKEN } from '$env/static/private';
import { json } from '@sveltejs/kit';

export const config = {
    runtime: 'nodejs'
};

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');
    
    // 2. Update logic to use DASHBOARD_TOKEN
    const isAuthenticated = session === DASHBOARD_TOKEN || token === DASHBOARD_TOKEN;

    // Security Gate
    if (!isAuthenticated) {
        return new Response('Access Denied', { status: 403 });
    }

    // 3. Set the cookie for the iframe (SameSite=None is critical)
    if (token === DASHBOARD_TOKEN && !session) {
        event.cookies.set('gateway_session', DASHBOARD_TOKEN, {
            path: '/',
            httpOnly: true,
            sameSite: 'none', // Allows cookie to work inside the iframe
            secure: true,     // Required for sameSite: 'none'
            maxAge: 60 * 60 * 24 * 7 
        });
    }

    const response = await resolve(event);

    // Ensure headers allow the iframe to load
    response.headers.set('X-Frame-Options', 'ALLOWALL'); 
    response.headers.set('Content-Security-Policy', "frame-ancestors 'self' https://mishan3.xyz https://www.mishan3.xyz;");

    return response;
}
