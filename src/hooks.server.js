/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // 1. Allow internal build/prerender requests to pass
    // This prevents the "403" build error you are seeing
    if (event.request.headers.get('x-prerender')) {
        return resolve(event);
    }

    const VALID_TOKEN = "ZP9SDHxWEzx87uK7T0A"; // Use your actual secret
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    // 2. Allow access if the token is present or a session exists
    if (token === VALID_TOKEN || session === 'authorized') {
        const response = await resolve(event);
        
        // Set the session cookie for subsequent requests
        if (token === VALID_TOKEN) {
            response.headers.append('Set-Cookie', event.cookies.serialize('gateway_session', 'authorized', {
                path: '/',
                httpOnly: true,
                sameSite: 'none', // Required for display in GoDaddy iframes
                secure: true,
                maxAge: 60 * 60 * 24 // 24 hours
            }));
        }
        return response;
    }

    // 3. Block all other unauthorized traffic
    return new Response('BLOCKED BY GATEWAY', { status: 403 });
}
