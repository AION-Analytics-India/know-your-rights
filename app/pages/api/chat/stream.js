// Proxy for POST /chat/stream, forwarding Server-Sent Events unchanged.
//
// Same reason as pages/api/chat.js: a Next.js rewrite gives up after 30 seconds.
// Streaming makes that cap worse, not better — the connection is meant to stay
// open for the whole answer, so a rewrite would cut it off mid-sentence.
//
// The bytes are passed through verbatim. This route must not buffer, or the
// user waits for the complete answer and streaming has bought nothing.

const BACKEND = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8030';
const TIMEOUT_MS = 190_000;

export const config = {
  api: {
    // An answer is long, and Next's default 4 MB response cap logs a warning
    // for streamed responses whose length is not known in advance.
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  // If the user closes the tab or hits stop, drop the upstream request too
  // rather than leaving the model generating for nobody. This also fires on a
  // normal finish, where aborting a settled fetch is a no-op.
  res.on('close', () => controller.abort());

  try {
    const upstream = await fetch(`${BACKEND}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(req.body ?? {}),
      signal: controller.signal,
    });

    // A validation failure arrives as ordinary JSON, before any streaming.
    if (!upstream.ok || !upstream.headers.get('content-type')?.includes('text/event-stream')) {
      const payload = await upstream.json().catch(() => ({ detail: 'Upstream returned no JSON' }));
      return res.status(upstream.status).json(payload);
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders?.();

    const reader = upstream.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (res.writableEnded || res.destroyed) break; // client hung up
      res.write(value);
      // Node may hold small writes; compression middleware adds a flush method.
      res.flush?.();
    }
    return res.end();
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    if (res.headersSent) {
      // The commonest cause of an abort here is the client hanging up, which is
      // also what destroys the response — writing to it then throws.
      if (res.writableEnded || res.destroyed) return undefined;
      // Otherwise the client is still reading SSE, so the failure has to be a
      // frame: the status is long gone and an error it cannot see is no error.
      res.write(`event: error\ndata: ${JSON.stringify({
        detail: timedOut ? 'The service took too long to respond.' : 'The connection was lost.',
      })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }
    return res.status(timedOut ? 504 : 502).json({
      detail: timedOut ? 'The service took too long to respond.' : 'The service is unreachable.',
    });
  } finally {
    clearTimeout(timer);
  }
}
