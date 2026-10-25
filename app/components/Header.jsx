import Link from 'next/link';

import { LANGUAGES, t } from '../lib/i18n';

/**
 * The AION mark is deliberately small. This is a public-service tool; the
 * citizen's question is the subject, the provider is a footnote.
 */
export default function Header({ language, onLanguageChange, onHelp }) {
  return (
    <header className="sticky top-0 z-20 bg-ink text-paper shadow-premium">
      {/* On a phone the title gets its own row and the controls sit below it,
          right-aligned: side by side, the controls left the title about 120 px
          and it wrapped to seven lines (mobile check, 25 Oct 2026). */}
      <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:flex-nowrap sm:px-4 sm:py-3">
        <img
          src="/favicon.svg"
          alt="AION Analytics"
          width={28}
          height={28}
          className="shrink-0 rounded"
        />
        <div className="min-w-0 flex-1 basis-[calc(100%-3rem)] sm:basis-auto">
          {/* Wrap, never truncate: on a 390 px phone the controls leave about 120 px,
              and truncation cut the name to "Kno…" (mobile check, 25 Oct 2026). */}
          <h1 className="break-words text-base font-semibold leading-tight" lang={language}>
            {t(language, 'appName')}
          </h1>
          <p className="break-words text-xs leading-snug text-paper-muted" lang={language}>
            {t(language, 'tagline')}
          </p>
        </div>

        {/* Always reachable, on every screen, in one tap. Someone in an
            emergency should never have to find their way back to the home
            screen first. It is a link, not a button, so it still works if the
            app's JavaScript has not finished loading. */}
        <div className="ml-auto flex items-center gap-2">
        <Link
          href="/emergency"
          aria-label={t(language, 'sosLabel')}
          className="kyr-tap rounded bg-error px-3 py-1.5 text-sm font-bold tracking-wide text-white shadow-premium hover:brightness-110"
        >
          {t(language, 'sos')}
        </Link>

        <label className="sr-only" htmlFor="language-select">
          {t(language, 'language')}
        </label>
        <select
          id="language-select"
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          className="kyr-tap rounded border border-paper-muted/40 bg-ink-card px-2 text-sm text-paper"
        >
          {LANGUAGES.map((entry) => (
            <option key={entry.code} value={entry.code}>
              {entry.native}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onHelp}
          aria-label={t(language, 'help')}
          className="kyr-tap rounded border border-paper-muted/40 px-3 text-sm font-medium text-paper hover:bg-ink-card"
        >
          ?
        </button>
        </div>
      </div>
    </header>
  );
}
