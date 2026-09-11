import { useCallback, useEffect, useRef, useState } from 'react';

// BCP-47 tags for the Web Speech API. Without these it defaults to the browser
// locale and transcribes Hindi speech as English nonsense.
const RECOGNITION_LOCALE = { en: 'en-IN', hi: 'hi-IN', gu: 'gu-IN' };

/**
 * Voice input via the Web Speech API.
 *
 * Support is uneven — Chrome and Safari have it, Firefox does not — so
 * `supported` is exposed and the caller hides the microphone rather than
 * offering a button that does nothing.
 */
export function useSpeech(language, onResult) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const resultRef = useRef(onResult);
  resultRef.current = onResult;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(Boolean(Recognition));
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = RECOGNITION_LOCALE[language] || RECOGNITION_LOCALE.en;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      resultRef.current?.(transcript, event.results[event.results.length - 1].isFinal);
    };
    recognition.onerror = (event) => {
      // "no-speech" and "aborted" are ordinary; only surface real problems.
      if (!['no-speech', 'aborted'].includes(event.error)) setError(event.error);
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    setError(null);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [language]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { supported, listening, error, start, stop, toggle: () => (listening ? stop() : start()) };
}
