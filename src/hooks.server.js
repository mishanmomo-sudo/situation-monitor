export async function handle({ event, resolve }) {
    const host = event.url.host;
    const allowedDomain = 'https://monitor.mishan3.xyz/'; // Replace with your actual domain

    // 1. Allow Vercel's internal build/prerender processes
    const isPrerender = event.request.headers.get('x-prerender') || process.env.VERCEL === '1';
    
    if (isPrerender) {
        return resolve(event);
    }

    // 2. Domain Validation: Block if the host isn't your GoDaddy domain
    if (host !== allowedDomain) {
        return new Response('BLOCKED BY GATEWAY: Please use the official domain.', { 
            status: 403 
        });
    }

    // 3. If everything is fine, proceed to the app
    return resolve(event);
}
