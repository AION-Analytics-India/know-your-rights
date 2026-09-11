import { t } from '../lib/i18n';

export function OfflineBanner({ language }) {
  return (
    <div role="status" className="bg-warning/25 px-4 py-2 text-center text-sm" lang={language}>
      {t(language, 'offline')}
    </div>
  );
}

/** Shown when the corpus fingerprint changes: the law behind answers has moved. */
export function UpdateBanner({ language, onRefresh }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 bg-success/25 px-4 py-2 text-sm">
      <span lang={language}>{t(language, 'updateAvailable')}</span>
      <button
        type="button"
        onClick={onRefresh}
        className="kyr-tap rounded border border-ink/30 bg-white px-3 py-1 font-medium hover:bg-ink hover:text-paper"
        lang={language}
      >
        {t(language, 'updateAction')}
      </button>
    </div>
  );
}

export function HelpDialog({ language, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      className="fixed inset-0 z-30 flex items-end justify-center bg-ink/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-premium-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="help-title" className="mb-2 text-lg font-semibold" lang={language}>
          {t(language, 'help')}
        </h2>
        <p className="mb-4 leading-relaxed" lang={language}>{t(language, 'helpBody')}</p>
        <p className="mb-4 text-sm text-ink/60" lang={language}>{t(language, 'disclaimer')}</p>
        <button
          type="button"
          onClick={onClose}
          className="kyr-tap w-full rounded-lg bg-ink px-4 py-3 font-semibold text-paper hover:bg-ink-card"
          lang={language}
        >
          {t(language, 'close')}
        </button>
      </div>
    </div>
  );
}
