import { env } from '$env/dynamic/private';

export const config = { runtime: 'nodejs' };

export async function handle({ event, resolve }) {
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    const accept = event.request.headers.get('accept') || '';
    const isHtml = accept.includes('text/html');

    if (!isHtml) return resolve(event);

    if (token === env.GATEWAY_TOKEN || session === 'authorized') {
        const response = await resolve(event);

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
