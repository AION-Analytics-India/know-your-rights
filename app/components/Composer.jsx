import { useEffect, useRef, useState } from 'react';
import { t } from '../lib/i18n';
import { useVoiceInput } from '../lib/useVoiceInput';

/** Fixed bottom bar: the input stays under the thumb on a phone. */
export default function Composer({ language, onSend, busy, offline }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Server-side recognition when the backend offers it, the browser's otherwise.
  const { supported, listening, busy: transcribing, seconds, usingServer, start, stop } =
    useVoiceInput(language, (transcript, isFinal) => {
      setValue(transcript);
      if (isFinal) textareaRef.current?.focus();
    });

  // Grow with the text instead of scrolling a one-line box.
  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, 140)}px`;
  }, [value]);

  const submit = (event) => {
    event?.preventDefault();
    const query = value.trim();
    if (!query || busy) return;
    if (listening) stop();
    setValue('');
    onSend(query);
  };

  const disabled = busy || offline || transcribing;

  return (
    <form
      onSubmit={submit}
      className="sticky bottom-0 border-t border-ink/10 bg-paper/95 px-3 py-2 backdrop-blur"
    >
      {offline ? (
        <p role="status" className="mb-2 rounded bg-warning/20 px-3 py-2 text-sm" lang={language}>
          {t(language, 'offlineAsk')}
        </p>
      ) : null}

      <div className="mx-auto flex max-w-2xl items-end gap-2">
        <label className="sr-only" htmlFor="composer-input">
          {t(language, 'placeholder')}
        </label>
        <textarea
          id="composer-input"
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          lang={language}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends; Shift+Enter makes a new line.
            if (event.key === 'Enter' && !event.shiftKey) submit(event);
          }}
          placeholder={
            transcribing
              ? t(language, 'transcribing')
              : listening
                ? t(language, 'listening')
                : t(language, 'placeholder')
          }
          className="flex-1 resize-none rounded-lg border border-ink/20 bg-white px-3 py-3 text-[1.0625rem] shadow-premium placeholder:text-ink/60 disabled:opacity-60"
        />

        {supported ? (
          <button
            type="button"
            onClick={listening ? stop : start}
            disabled={busy || offline || transcribing}
            aria-pressed={listening}
            aria-label={t(language, listening ? 'micStop' : 'micStart')}
            className={`kyr-tap rounded-lg border px-3 py-3 text-xl shadow-premium disabled:opacity-50 ${
              listening ? 'animate-pulse border-error bg-error/15' : 'border-ink/20 bg-white'
            }`}
          >
            <span aria-hidden="true">{listening ? '⏹' : '🎤'}</span>
            {/* Recording length matters: the server refuses past two minutes. */}
            {listening && usingServer ? (
              <span className="ml-1 text-xs tabular-nums" aria-hidden="true">
                {String(Math.floor(seconds / 60)).padStart(1, '0')}:
                {String(seconds % 60).padStart(2, '0')}
              </span>
            ) : null}
          </button>
        ) : null}

        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label={t(language, 'send')}
          className="kyr-tap rounded-lg bg-ink px-4 py-3 font-semibold text-paper shadow-premium hover:bg-ink-card disabled:opacity-40"
        >
          <span aria-hidden="true">➤</span>
        </button>
      </div>
    </form>
  );
}
