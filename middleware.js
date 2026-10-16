// Vercel Routing Middleware: puts the whole site (docs, /examples/*, prototypes)
// behind a sign-in page styled like the docs. The password is the SITE_PASSWORD
// environment variable set in the Vercel project settings. A correct password sets
// a 30-day cookie derived from it, so changing the password signs everyone out.
// Runs only on Vercel — `npm run docs` locally is not protected.
import { loginPage } from './login-page.js';

export const config = { matcher: '/:path*' };

const COOKIE = 'ds_auth';
const MAX_AGE = 60 * 60 * 24 * 30;

export default async function middleware(request) {
  const password = process.env.SITE_PASSWORD;
  if (!password) {
    return new Response('SITE_PASSWORD is not set for this deployment.', { status: 503 });
  }

  const url = new URL(request.url);
  const token = await tokenFor(password);

  if (url.pathname === '/__login' && request.method === 'POST') {
    const form = await request.formData();
    const next = safeNext(form.get('next'));
    if (safeEqual(String(form.get('password') ?? ''), password)) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: next,
          'Set-Cookie': `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return page(loginPage({ next, error: true }));
  }

  if (url.pathname === '/__logout') {
    return new Response(null, {
      status: 303,
      headers: { Location: '/', 'Set-Cookie': `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` },
    });
  }

  if (safeEqual(readCookie(request, COOKIE), token)) {
    // Same as `next()` from @vercel/functions, without adding a dependency.
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }

  // Pages get the sign-in screen; scripts, styles and images just get a 401.
  if ((request.headers.get('accept') || '').includes('text/html')) {
    return page(loginPage({ next: url.pathname + url.search }));
  }
  return new Response('Sign in required.', { status: 401 });
}

function page(html) {
  return new Response(html, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

async function tokenFor(password) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('design-specs-auth'));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(request, name) {
  const match = (request.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : '';
}

// Only same-site paths, so the form can't be used to redirect elsewhere.
function safeNext(value) {
  const next = String(value ?? '');
  return next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : '/';
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
