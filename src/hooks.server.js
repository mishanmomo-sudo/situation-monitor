export async function handle({ event, resolve }) {
    const token = event.url.searchParams.get('token');

    if (token === '34SIDJ68fSdas6d5ASD') {
        return resolve(event);
    }

    return new Response('Access Denied', { status: 403 });
}
