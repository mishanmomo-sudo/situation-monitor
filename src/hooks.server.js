import { GATEWAY_TOKEN } from '$env/static/private';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    // 🚩 Allow ALL non-page requests (JS, CSS, images, etc.)
    if (event.request.destination !== 'document') {
        return resolve(event);
    }

    // 🚩 Gate only the HTML document
    if (token === GATEWAY_TOKEN || session === 'authorized') {
        const response = await resolve(event);

        response.headers.set(
            'Content-Security-Policy',
            "frame-ancestors 'self' https://mishan3.xyz https://www.mishan3.xyz;"
        );

        // Set session cookie once
        if (token === GATEWAY_TOKEN && session !== 'authorized') {
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
