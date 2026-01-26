export async function handle() {
  return new Response('BLOCKED BY GATEWAY', { status: 403 });
}
