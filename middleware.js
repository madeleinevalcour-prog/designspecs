// Vercel Routing Middleware: puts the whole site (docs, /examples/*, prototypes)
// behind a browser password prompt. Any username works; the password is the
// SITE_PASSWORD environment variable set in the Vercel project settings.
// Runs only on Vercel — `npm run docs` locally is not protected.

export const config = { matcher: '/:path*' };

export default function middleware(request) {
  const password = process.env.SITE_PASSWORD;
  if (!password) {
    return new Response('SITE_PASSWORD is not set for this deployment.', { status: 503 });
  }

  const [scheme, encoded] = (request.headers.get('authorization') || '').split(' ');
  if (scheme === 'Basic' && encoded) {
    let decoded = '';
    try {
      decoded = atob(encoded);
    } catch {}
    const supplied = decoded.slice(decoded.indexOf(':') + 1);
    if (safeEqual(supplied, password)) {
      // Same as `next()` from @vercel/functions, without adding a dependency.
      return new Response(null, { headers: { 'x-middleware-next': '1' } });
    }
  }

  return new Response('Password required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Design Specs", charset="UTF-8"' },
  });
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
