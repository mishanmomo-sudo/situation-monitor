export const config = { runtime: 'nodejs' };
import { env } from '$env/dynamic/private';

export async function handle({ event, resolve }) {
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    // Debug output
    return new Response(
        JSON.stringify({
            token_received: token,
            env_token: env.GATEWAY_TOKEN,
            token_equal: token === env.GATEWAY_TOKEN,
            session_cookie: session
        }, null, 2),
        {
            status: 200,
            headers: { 'content-type': 'application/json' }
        }
    );
}
