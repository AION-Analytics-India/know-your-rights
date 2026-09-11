import { useCallback, useEffect, useRef, useState } from 'react';
import { transcribe, voiceStatus } from './api';
import { useRecorder } from './useRecorder';
import { useSpeech } from './useSpeech';

/**
 * Voice input, preferring our own recogniser and falling back to the browser's.
 *
 * Server-side ASR is better for Hindi and Gujarati and keeps the audio inside
 * this system, so it is used whenever the backend reports voice enabled. When it
 * does not — a text-only deployment, or the model still downloading — the Web
 * Speech API is used exactly as before, so the PWA never loses a feature it had.
 *
 * The caller sees one interface and does not need to know which is in play.
 */
export function useVoiceInput(language, onTranscript) {
  const [serverVoice, setServerVoice] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const resultRef = useRef(onTranscript);
  resultRef.current = onTranscript;

  const recorder = useRecorder();
  const speech = useSpeech(language, (text, isFinal) => resultRef.current?.(text, isFinal));

  useEffect(() => {
    let cancelled = false;
    voiceStatus()
      .then((status) => {
        if (!cancelled) setServerVoice(Boolean(status?.enabled && status?.ffmpeg_available));
      })
      // A failed probe simply means we keep the browser path.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const useServer = serverVoice && recorder.supported;

  const start = useCallback(async () => {
    setError(null);
    if (useServer) {
      await recorder.start();
      return;
    }
    speech.start();
  }, [useServer, recorder, speech]);

  const stop = useCallback(async () => {
    if (!useServer) {
      speech.stop();
      return;
    }
    const blob = await recorder.stop();
    if (!blob?.size) return;
    setBusy(true);
    try {
      const result = await transcribe(blob, language);
      if (result.empty) {
        setError('nothing-heard');
      } else {
        resultRef.current?.(result.text, true);
      }
    } catch (err) {
      // Fall back to typing rather than leaving the citizen with a dead button.
      setError(err?.status === 503 ? 'unavailable' : 'failed');
    } finally {
      setBusy(false);
    }
  }, [useServer, recorder, speech, language]);

  const listening = useServer ? recorder.recording : speech.listening;

  return {
    supported: useServer || speech.supported,
    usingServer: useServer,
    listening,
    busy,
    seconds: recorder.seconds,
    error: error || (useServer ? recorder.error : speech.error),
    start,
    stop,
    toggle: () => (listening ? stop() : start()),
  };
}
