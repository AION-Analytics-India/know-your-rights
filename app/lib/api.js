// Backend calls. Everything goes through /api/*, which next.config.js rewrites
// to the FastAPI server, so the browser stays on one origin.

const TIMEOUT_MS = 200_000; // the backend's own budget is 180s

async function request(path, options = {}, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`/api${path}`, { ...options, signal: controller.signal });
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      try {
        error.detail = (await response.json()).detail;
      } catch {
        /* body was not JSON; the status is enough */
      }
      throw error;
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Ask a question. The backend detects the language itself. */
export function ask(query) {
  return request('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
}

/**
 * Ask a question and receive the answer as it is written.
 *
 * Streaming is not decoration here: a grounded answer takes 20-80 seconds, and
 * watching text appear is the difference between "working" and "broken". The
 * citations arrive first, before any prose, so the reader can see which law is
 * being used while the explanation is still being written.
 *
 * `onToken` receives fragments to append. `onSources` may fire once, early.
 * The promise resolves with the final payload, which is authoritative: the
 * backend validates the assembled answer and may replace it (`replaced: true`),
 * in which case what was streamed must be discarded in favour of `answer`.
 */
export async function askStream(query, { onSources, onToken, signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  signal?.addEventListener('abort', () => controller.abort(), { once: true });

  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });

    if (!response.ok || !response.headers.get('content-type')?.includes('text/event-stream')) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      try {
        error.detail = (await response.json()).detail;
      } catch {
        /* body was not JSON; the status is enough */
      }
      throw error;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let streamed = '';
    let final = null;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Frames are separated by a blank line. A partial frame stays in the
      // buffer: parsing half a JSON payload would throw away a real token.
      let split;
      while ((split = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, split);
        buffer = buffer.slice(split + 2);
        if (frame.trim() === 'data: [DONE]') continue;

        let event = null;
        let data = '';
        for (const line of frame.split('\n')) {
          if (line.startsWith('event: ')) event = line.slice(7).trim();
          else if (line.startsWith('data: ')) data += line.slice(6);
        }
        if (!event || !data) continue;

        let payload;
        try {
          payload = JSON.parse(data);
        } catch {
          continue; // a malformed frame is not worth failing the answer over
        }

        if (event === 'sources') onSources?.(payload.sources || []);
        else if (event === 'token') {
          streamed += payload.text || '';
          onToken?.(payload.text || '', streamed);
        } else if (event === 'final') final = payload;
        else if (event === 'error') {
          const error = new Error(payload.detail || 'stream failed');
          error.status = payload.status || 502;
          error.detail = payload.detail;
          throw error;
        }
      }
    }

    // No final frame means the connection dropped part-way. Whatever arrived is
    // unvalidated and possibly a half sentence, so it is not offered as an answer.
    if (!final) {
      const error = new Error('stream ended without a final answer');
      error.status = 502;
      throw error;
    }
    return final;
  } finally {
    clearTimeout(timer);
  }
}

/** Questions the backend answers instantly from its curated cache. */
export function cachedQuestions() {
  return request('/cached_questions', {}, 15_000);
}

/** Verified helplines. Cached for offline use. */
export function importantNumbers() {
  return request('/important_numbers', {}, 15_000);
}

/** Corpus fingerprint, for telling the user the law behind answers has changed. */
export function corpusVersion() {
  return request('/corpus_version', {}, 15_000);
}

export function health() {
  return request('/health', {}, 8_000);
}

// --- Voice -----------------------------------------------------------------
// The audio is sent, transcribed and dropped. Nothing here writes it anywhere,
// and the backend has no path that stores it either.

/** Whether this deployment has voice turned on, and with what. Cheap to call. */
export function voiceStatus() {
  return request('/voice/status');
}

/** Send recorded audio, get the transcript back. */
export async function transcribe(blob, language) {
  const form = new FormData();
  form.append('audio', blob, 'question.webm');
  if (language) form.append('language', language);
  return request('/voice/transcribe', { method: 'POST', body: form });
}

/** Ask by voice: one round trip that transcribes and answers. */
export async function askByVoice(blob, language, callerHash) {
  const form = new FormData();
  form.append('audio', blob, 'question.webm');
  if (language) form.append('language', language);
  if (callerHash) form.append('caller_hash', callerHash);
  return request('/voice/chat', { method: 'POST', body: form });
}

/**
 * Speak an answer. Returns an object URL the caller must revoke.
 *
 * Not routed through `request`, which expects JSON; the body here is a WAV.
 */
export async function synthesize(text, language, timeout = 60_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch('/api/voice/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: language || '' }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return URL.createObjectURL(await response.blob());
  } finally {
    clearTimeout(timer);
  }
}

/** Fixed guidance on preserving evidence. Available even when voice is off. */
export function recordingGuidance(category, language) {
  const params = new URLSearchParams({ category, language: language || 'en' });
  return request(`/recording_guidance?${params}`);
}
