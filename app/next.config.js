/** @type {import('next').NextConfig} */
const backend = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8030';

module.exports = {
  reactStrictMode: true,
  // Same-origin proxy to the FastAPI backend. Keeping the browser on one origin
  // means no CORS preflight on every question, and the service worker can treat
  // /api/* uniformly whichever host the app is served from.
  //
  // These rewrites are for the *fast* endpoints only. POST /chat is handled by
  // pages/api/chat.js instead, because a rewrite gives up after 30 seconds and a
  // grounded answer routinely takes longer. pages/api/* is matched first, so
  // that route shadows this rule for /api/chat.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${backend}/:path*` }];
  },
};
