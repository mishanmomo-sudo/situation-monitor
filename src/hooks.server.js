export async function handle({ event, resolve }) {
    const url = event.url;
    const token = url.searchParams.get('token');
    const secretToken = 'ZP9SDHxWEzx87uK7T0A'; // Change this!

    // 1. Allow Vercel internal processes
    if (process.env.VERCEL === '1' || event.request.headers.get('x-prerender')) {
        return resolve(event);
    }

    // 2. Logic: Only allow if the token matches
    // Once matched, we set a session cookie so the user can navigate 
    // without needing the token on every single click.
    const hasSession = event.cookies.get('gateway_auth') === 'true';

    if (token === secretToken || hasSession) {
        const response = await resolve(event);
        
        // Set the cookie if they just arrived with the token
        if (token === secretToken) {
            response.headers.append('Set-Cookie', event.cookies.serialize('gateway_auth', 'true', {
                path: '/',
                httpOnly: true,
                sameSite: 'none', // Critical for iframes
                secure: true,
                maxAge: 60 * 60 * 24 // 24 hours
            }));
        }
        return response;
    }

    // 3. If no token and no session: Ghost mode (403 Forbidden)
    return new Response('403 Forbidden', { status: 403 });
}
