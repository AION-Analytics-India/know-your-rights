import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Microphone capture via MediaRecorder.
 *
 * Two things this does that the Web Speech API cannot.
 *
 * **It works in every browser that has a microphone**, including Firefox, where
 * `webkitSpeechRecognition` does not exist at all.
 *
 * **It sends the audio to our own recogniser.** Web Speech ships the audio to
 * whatever service the browser vendor chose, which for Hindi and Gujarati is
 * both less accurate and not a place a question about a police stop should go.
 *
 * The blob is handed to the caller and then dropped. Nothing is stored here, and
 * the track is stopped on unmount so the recording indicator never outlives the
 * page.
 */
const PREFERRED_TYPES = [
  'audio/webm;codecs=opus',
  'audio/ogg;codecs=opus',
  'audio/webm',
  'audio/mp4',
];

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  return PREFERRED_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

export function useRecorder({ maxSeconds = 120 } = {}) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState(null);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const resolveRef = useRef(null);

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' &&
        typeof MediaRecorder !== 'undefined' &&
        Boolean(navigator.mediaDevices?.getUserMedia),
    );
  }, []);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** Start recording. Resolves with a Blob when `stop` is called. */
  const start = useCallback(async () => {
    if (recorderRef.current) return null;
    setError(null);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      // Denied permission is the common case and is not a fault to shout about.
      setError(err?.name === 'NotAllowedError' ? 'permission' : 'unavailable');
      return null;
    }

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];
    streamRef.current = stream;
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data?.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      chunksRef.current = [];
      recorderRef.current = null;
      releaseStream();
      setRecording(false);
      setSeconds(0);
      resolveRef.current?.(blob);
      resolveRef.current = null;
    };

    recorder.start();
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((value) => {
        const next = value + 1;
        // Stop ourselves at the ceiling rather than let the server reject it.
        if (next >= maxSeconds) recorderRef.current?.stop();
        return next;
      });
    }, 1000);
    return recorder;
  }, [maxSeconds, releaseStream]);

  /** Stop recording and resolve with the captured audio. */
  const stop = useCallback(
    () =>
      new Promise((resolve) => {
        if (!recorderRef.current) {
          resolve(null);
          return;
        }
        resolveRef.current = resolve;
        recorderRef.current.stop();
      }),
    [],
  );

  const cancel = useCallback(() => {
    resolveRef.current = null;
    if (recorderRef.current) {
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    chunksRef.current = [];
    releaseStream();
    setRecording(false);
    setSeconds(0);
  }, [releaseStream]);

  useEffect(() => () => cancel(), [cancel]);

  return { supported, recording, seconds, error, start, stop, cancel };
}
