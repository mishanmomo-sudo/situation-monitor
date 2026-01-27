Here is the full, updated hooks.server.js code. This version switches from a hardcoded token to using the Vercel Environment Variable.

By using env.GATEWAY_TOKEN, you protect your secret even if your GitHub repository remains Public.

Updated src/hooks.server.js
JavaScript

import { env } from '$env/dynamic/private';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // 1. Safety valve for Vercel's build/preview bots
    // This prevents the build from failing with a 403 error
    const userAgent = event.request.headers.get('user-agent') || '';
    const isBuildBot = event.request.headers.get('x-prerender') || userAgent.includes('vercel');

    if (isBuildBot) {
        return resolve(event);
    }

    // 2. Dashboard Access Logic
    // This pulls the secret "ZP9SD..." from your Vercel Environment Variables
    const VALID_TOKEN = env.GATEWAY_TOKEN; 
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    // 3. Authorization Check
    // If they have the token in the URL OR already have an authorized session cookie
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

    // 4. Reject Direct Public Traffic
    // If someone visits the Vercel URL directly without the token, they see this:
    return new Response('403 Forbidden: Access through domain only.', { status: 403 });
}
