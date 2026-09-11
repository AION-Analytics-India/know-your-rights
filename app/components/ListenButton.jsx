import { useEffect, useRef, useState } from 'react';
import { synthesize } from '../lib/api';
import { t } from '../lib/i18n';

/**
 * Plays an answer aloud.
 *
 * Fetched on demand rather than with the answer, so a slow voice never delays
 * the text a citizen can already read. If synthesis fails the button says so and
 * the written answer is untouched -- speech is an addition here, never the only
 * copy of the answer.
 */
export default function ListenButton({ text, language, enabled }) {
  const [state, setState] = useState('idle'); // idle | loading | playing | failed
  const audioRef = useRef(null);
  const urlRef = useRef(null);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  if (!enabled || !text?.trim()) return null;

  const stop = () => {
    audioRef.current?.pause();
    setState('idle');
  };

  const play = async () => {
    if (state === 'playing') return stop();
    setState('loading');
    try {
      if (!urlRef.current) urlRef.current = await synthesize(text, language);
      const audio = audioRef.current || new Audio();
      audioRef.current = audio;
      audio.src = urlRef.current;
      audio.onended = () => setState('idle');
      await audio.play();
      setState('playing');
    } catch {
      setState('failed');
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={play}
        disabled={state === 'loading'}
        aria-label={t(language, state === 'playing' ? 'listenStop' : 'listen')}
        className="kyr-tap rounded border border-ink/20 px-2 py-1 text-sm disabled:opacity-50"
      >
        <span aria-hidden="true">{state === 'playing' ? '⏸' : '🔊'}</span>{' '}
        {t(language, state === 'playing' ? 'listenStop' : 'listen')}
      </button>
      {state === 'failed' ? (
        <span role="status" className="text-xs text-ink/60">
          {t(language, 'listenFailed')}
        </span>
      ) : null}
    </span>
  );
}
