export async function handle({ event, resolve }) {
    // 1. Get the current environment and headers
    const isVercel = process.env.VERCEL === '1';
    const isPrerender = event.request.headers.get('x-prerender');
    
    // 2. IMPORTANT: Allow all internal build/prerender traffic
    // This fixes the "Error: 500 /" and "npm run build" failure
    if (isVercel || isPrerender) {
        return resolve(event);
    }

    // 3. Your Security Logic for real users
    const VALID_TOKEN = "ZP9SDHxWEzx87uK7T0A"; 
    const token = event.url.searchParams.get('token');
    const session = event.cookies.get('gateway_session');

    if (token === VALID_TOKEN || session === 'authorized') {
        const response = await resolve(event);
        if (token === VALID_TOKEN) {
            response.headers.append('Set-Cookie', event.cookies.serialize('gateway_session', 'authorized', {
                path: '/',
                httpOnly: true,
                sameSite: 'none', 
                secure: true,
                maxAge: 60 * 60 * 24
            }));
        }
        return response;
    }

    // 4. Block direct public access
    return new Response('BLOCKED BY GATEWAY', { status: 403 });
}
