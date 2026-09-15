import { useState } from 'react';
import Link from 'next/link';

import { quickReplies, t, travellerReplies } from '../lib/i18n';

/**
 * A blank text box is a poor starting point for someone who is not sure what to
 * ask, or is not confident writing. Each tile sends a complete, well-formed
 * question in the chosen language.
 *
 * `instant` holds questions the backend answers straight from its curated
 * cache — no retrieval, no model, no wait. They are shown separately and first,
 * because "this one is immediate" is worth knowing before you tap. The list is
 * short by design: only answers that are fixed and verified are curated.
 */
//: More than this on first paint is a wall of text for someone who is not a
//: confident reader. The rest are one tap away, not hidden.
const VISIBLE = 6;

export default function QuickReplies({ language, onPick, disabled, instant = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [traveller, setTraveller] = useState(false);
  const travelling = travellerReplies(language);
  const all = quickReplies(language);
  const shown = expanded ? all : all.slice(0, VISIBLE);
  const shortcuts = instant
    .map((item) => ({ key: item.key, label: item.questions?.[language] || item.questions?.en }))
    .filter((item) => item.label)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Solo female traveller pack. Its own entry point rather than more tiles
          in the general grid: these are asked away from home, often while the
          situation is still happening, so the safety line leads. */}
      <section aria-labelledby="traveller-heading" className="px-1">
        <button
          type="button"
          onClick={() => setTraveller((value) => !value)}
          aria-expanded={traveller}
          disabled={disabled}
          className="kyr-tap flex w-full items-center justify-between gap-2 rounded-lg border-2 border-ink/25 bg-white/70 px-3 py-2 text-left font-semibold"
        >
          <span id="traveller-heading" lang={language}>🧳 {t(language, 'travellerOpen')}</span>
          <span aria-hidden="true">{traveller ? '▲' : '▼'}</span>
        </button>
        {traveller ? (
          <>
            <p className="mt-2 rounded bg-ink/5 px-2 py-1 text-sm font-semibold" lang={language}>
              {t(language, 'travellerSafety')}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {travelling.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPick(item.query)}
                  lang={language}
                  className="kyr-tap rounded-lg border border-ink/20 bg-paper px-2 py-2 text-left text-sm"
                >
                  <span aria-hidden="true">{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </section>

      {shortcuts.length ? (
        <section aria-labelledby="instant-heading" className="px-1">
          <h2 id="instant-heading" className="text-sm font-semibold text-ink/70" lang={language}>
            {t(language, 'instantTitle')}
          </h2>
          <p className="mb-2 text-xs text-ink/60" lang={language}>
            {t(language, 'instantHint')}
          </p>
          <ul className="flex flex-wrap gap-2">
            {shortcuts.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPick(item.label)}
                  className="kyr-tap rounded-full border border-brass/40 bg-brass/10 px-3 py-2 text-left text-sm font-medium text-ink transition hover:border-brass hover:bg-brass/20 disabled:opacity-50"
                  lang={language}
                >
                  <span aria-hidden="true" className="mr-1">⚡</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="quick-heading" className="px-1">
        <h2 id="quick-heading" className="mb-2 text-sm font-semibold text-ink/70" lang={language}>
          {t(language, 'quickTitle')}
        </h2>
        <ul className="grid grid-cols-2 gap-2">
          {shown.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(item.query)}
                className="kyr-tap flex w-full items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-3 text-left text-sm font-medium shadow-premium transition hover:border-brass hover:bg-brass/5 disabled:opacity-50"
                lang={language}
              >
                <span aria-hidden="true" className="text-xl">{item.icon}</span>
                <span className="leading-snug">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        {all.length > VISIBLE ? (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            className="kyr-tap mt-2 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
            lang={language}
          >
            {t(language, expanded ? 'less' : 'more')}
          </button>
        ) : null}
      </section>

      {/* Reachable with no network and without loading the chat. */}
      <div className="px-1">
        <Link
          href="/emergency"
          className="kyr-tap flex items-center justify-between rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm font-semibold shadow-premium hover:border-brass"
          lang={language}
        >
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="text-xl">🆘</span>
            {t(language, 'emergencyLink')}
          </span>
          <span aria-hidden="true" className="text-ink/60">→</span>
        </Link>
      </div>
    </div>
  );
}
