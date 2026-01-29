export const config = { runtime: 'nodejs' };
import { env } from '$env/dynamic/private';

export async function handle({ event, resolve }) {
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');
    const accept = event.request.headers.get('accept') || '';

    const debug = {
        token_received: token,
        env_token: env.GATEWAY_TOKEN,
        token_equal: token === env.GATEWAY_TOKEN,
        session_cookie: session,
        accept
    };

    console.log('DEBUG HOOK:', debug);

    // Always respond with JSON for debugging
    return new Response(JSON.stringify(debug, null, 2), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}
