// Proxy for POST /chat.
//
// This exists because a Next.js *rewrite* gives up after 30 seconds, and a
// grounded legal answer takes 20-80. Every real question was failing with a 500
// at exactly 30.0s. An API route has no such cap, so the forward is written by
// hand and given a budget slightly above the backend's own 180s timeout.
//
// pages/api/* is matched before the rewrites in next.config.js, so this shadows
// the generic /api/:path* rule for this one path. The fast endpoints
// (/api/important_numbers, /api/corpus_version, /api/health) keep using it.

const BACKEND = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8030';
const TIMEOUT_MS = 190_000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(`${BACKEND}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body ?? {}),
      signal: controller.signal,
    });
    const payload = await upstream.json().catch(() => ({ detail: 'Upstream returned no JSON' }));
    return res.status(upstream.status).json(payload);
  } catch (error) {
    // An abort here means the backend outlasted even its own timeout.
    const timedOut = error?.name === 'AbortError';
    return res.status(timedOut ? 504 : 502).json({
      detail: timedOut ? 'The service took too long to respond.' : 'The service is unreachable.',
    });
  } finally {
    clearTimeout(timer);
  }
}
