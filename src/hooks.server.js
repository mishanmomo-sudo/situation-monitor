/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // 1. Allow internal build processes to bypass the token check
    // This fixes the [500] error during deployment
    if (event.request.headers.get('x-prerender')) {
        return resolve(event);
    }

    // 2. Identify the requester
    const VALID_TOKEN = "ZP9SDHxWEzx87uK7T0A"; // Your secret token
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    // 3. Authorization Logic
    if (token === VALID_TOKEN || session === 'authorized') {
        const response = await resolve(event);
        
        // Grant a session cookie if they used a valid token
        if (token === VALID_TOKEN) {
            response.headers.append('Set-Cookie', event.cookies.serialize('gateway_session', 'authorized', {
                path: '/',
                httpOnly: true,
                sameSite: 'none', // Critical for GoDaddy Iframes
                secure: true,
                maxAge: 60 * 60 * 24
            }));
        }
        return response;
    }

    // 4. Block Direct Public Access
    return new Response('BLOCKED BY GATEWAY', { status: 403 });
}
