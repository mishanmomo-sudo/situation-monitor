export async function handle({ event, resolve }) {
    // 1. Allow internal Vercel processes (Build/Prerender)
    const isInternal = event.request.headers.get('x-prerender') || process.env.VERCEL === '1';
    if (isInternal) {
        return resolve(event);
    }

    // 2. Check for your specific token in the URL parameters
    const token = event.url.searchParams.get('token');
    const VALID_TOKEN = 'xxxxx'; // Replace with your actual token value

    if (token !== VALID_TOKEN) {
        return new Response('BLOCKED BY GATEWAY: Unauthorized Access.', { 
            status: 403 
        });
    }

    // 3. If token is valid, let them in
    return resolve(event);
}
