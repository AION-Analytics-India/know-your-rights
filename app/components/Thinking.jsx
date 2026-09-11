import { t } from '../lib/i18n';

/**
 * Answers take 20-80 seconds. Silence for that long reads as a broken app, so
 * the wait is named and explained rather than hidden behind a spinner.
 */
export default function Thinking({ language }) {
  return (
    <div className="flex justify-start" aria-live="polite">
      <div className="max-w-[85%] rounded-lg border border-ink/10 bg-white px-4 py-3 shadow-premium">
        <div className="flex items-center gap-2">
          <span className="flex gap-1" aria-hidden="true">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="h-2 w-2 animate-bounce rounded-full bg-brass"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </span>
          <span className="font-medium" lang={language}>
            {t(language, 'thinking')}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink/60" lang={language}>
          {t(language, 'thinkingHint')}
        </p>
      </div>
    </div>
  );
}
