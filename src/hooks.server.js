export const config = { runtime: 'nodejs' };
import { env } from '$env/dynamic/private';

export async function handle({ event, resolve }) {
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    const accept = event.request.headers.get('accept') || '';
    const isHtml = accept.includes('text/html');

    // Allow all non-HTML requests (JS, CSS, images, etc.)
    if (!isHtml) return resolve(event);

    // Gate only the HTML page
    if (token === env.GATEWAY_TOKEN || session === 'authorized') {
        const response = await resolve(event);

        // Iframe headers
        response.headers.set(
            'Content-Security-Policy',
            "frame-ancestors 'self' https://mishan3.xyz https://www.mishan3.xyz;"
        );

        if (token === env.GATEWAY_TOKEN && session !== 'authorized') {
            event.cookies.set('gateway_session', 'authorized', {
                path: '/',
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 86400
            });
        }

        return response;
    }

    return new Response('Access Denied', { status: 403 });
}
