import { t } from '../lib/i18n';

/**
 * Cached on the device and shown even with no network. Every number here was
 * verified against an official source by the backend; the API serves nothing it
 * could not confirm.
 */
export default function EmergencyNumbers({ helplines, language }) {
  if (!helplines?.length) return null;
  return (
    <section aria-labelledby="emergency-heading" className="px-1">
      <h2 id="emergency-heading" className="mb-1 text-sm font-semibold text-ink/70" lang={language}>
        {t(language, 'emergency')}
      </h2>
      <p className="mb-2 text-xs text-ink/60" lang={language}>
        {t(language, 'emergencyHint')}
      </p>
      <ul className="space-y-2">
        {helplines.map((line) => (
          <li key={line.key}>
            <div className="rounded-lg border border-ink/15 bg-white p-3 shadow-premium">
              <p className="font-medium" lang={language}>
                {line.labels?.[language] || line.labels?.en || line.key}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {line.numbers.map((number) => (
                  <a
                    key={number}
                    href={`tel:${number}`}
                    className="kyr-tap inline-flex items-center rounded-lg bg-ink px-4 py-2 font-mono text-lg font-semibold text-paper hover:bg-ink-card"
                    aria-label={`${t(language, 'emergency')} ${number}`}
                  >
                    {number}
                  </a>
                ))}
              </div>
              {line.availability ? (
                <p className="mt-2 text-xs text-ink/60">{line.availability}</p>
              ) : null}
              {line.notes?.[language] ? (
                <p className="mt-1 text-xs text-ink/60" lang={language}>{line.notes[language]}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
