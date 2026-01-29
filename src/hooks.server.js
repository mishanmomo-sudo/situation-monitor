import { GATEWAY_TOKEN } from '$env/static/private';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const VALID_TOKEN = GATEWAY_TOKEN;
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    if (token === VALID_TOKEN || session === 'authorized') {
        const response = await resolve(event);

        response.headers.set(
            'Content-Security-Policy',
            "frame-ancestors 'self' https://mishan3.xyz https://www.mishan3.xyz;"
        );

        if (token === VALID_TOKEN && session !== 'authorized') {
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
