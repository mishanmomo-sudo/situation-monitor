/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const VALID_TOKEN = "ZP9SDHxWEzx87uK7T0A"; // Must match your Flask/Frontend token
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    // 1. Allow Vercel's internal build processes
    if (process.env.VERCEL === '1' || event.request.headers.get('x-prerender')) {
        return resolve(event);
    }

    // 2. Check for Authorization
    // If they have the token in the URL, they are coming from your Domain
    if (token === VALID_TOKEN) {
        const response = await resolve(event);
        
        // Set a cookie so they stay logged in as they click around the dashboard
        response.headers.append('Set-Cookie', event.cookies.serialize('gateway_session', 'authorized', {
            path: '/',
            httpOnly: true,
            sameSite: 'none', // Critical for iframes
            secure: true,
            maxAge: 60 * 60 * 24 // 1 day
        }));
        
        return response;
    }

    // 3. If they already have the cookie, let them in
    if (session === 'authorized') {
        return resolve(event);
    }

    // 4. BLOCK EVERYTHING ELSE
    // If they go to the Vercel URL directly without a token, they get this:
    return new Response('BLOCKED BY GATEWAY: Unauthorized direct access.', { 
        status: 403 
    });
}
