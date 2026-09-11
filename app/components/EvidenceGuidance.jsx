import { useEffect, useRef, useState } from 'react';
import { t } from '../lib/i18n';
import { useRecorder } from '../lib/useRecorder';

/**
 * Guidance on preserving evidence, plus a recorder that never leaves the phone.
 *
 * Two things are kept visibly apart, because the guidance itself is built around
 * that distinction: `statutory` lines cite a provision and can be checked;
 * `practical` lines are ordinary care and are not claims about the law. They are
 * rendered under separate headings so a reader is never left guessing which is
 * which.
 *
 * **The recorder uploads nothing.** It captures to a Blob in the page, hands the
 * citizen a file, and forgets it. There is no request to the backend, and the
 * backend has no endpoint that would accept one.
 */
export default function EvidenceGuidance({ tip, language }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const recorder = useRecorder({ maxSeconds: 3600 });
  const urlRef = useRef(null);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  if (!tip) return null;

  const saveToDevice = async () => {
    const blob = await recorder.stop();
    if (!blob?.size) return;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = URL.createObjectURL(blob);

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const link = document.createElement('a');
    link.href = urlRef.current;
    // The timestamp is in the filename because the date is half the evidence.
    link.download = `evidence-${stamp}.webm`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setSaved(true);
  };

  return (
    <section
      className="mt-3 rounded-lg border border-ink/15 bg-white/70 text-[0.95rem]"
      lang={tip.language || language}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="kyr-tap flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-semibold"
      >
        <span>🛡 {tip.heading || t(language, 'evidenceTitle')}</span>
        <span aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div className="border-t border-ink/10 px-3 py-3">
          {tip.statutory?.length ? (
            <>
              <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/60">
                {t(language, 'evidenceLaw')}
              </h4>
              <ul className="mb-3 list-disc space-y-1 pl-5">
                {tip.statutory.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : null}

          {tip.practical?.length ? (
            <>
              <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/60">
                {t(language, 'evidencePractical')}
              </h4>
              <ul className="mb-3 list-disc space-y-1 pl-5">
                {tip.practical.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : null}

          {tip.caution ? <p className="mb-3 text-sm text-ink/70">{tip.caution}</p> : null}

          {recorder.supported ? (
            <div className="rounded border border-ink/15 bg-paper p-2">
              <button
                type="button"
                onClick={recorder.recording ? saveToDevice : recorder.start}
                aria-pressed={recorder.recording}
                className={`kyr-tap w-full rounded px-3 py-2 font-semibold ${
                  recorder.recording ? 'animate-pulse bg-error/15' : 'bg-ink text-paper'
                }`}
              >
                {recorder.recording
                  ? `⏹ ${t(language, 'recordLocalStop')} ${String(
                      Math.floor(recorder.seconds / 60),
                    )}:${String(recorder.seconds % 60).padStart(2, '0')}`
                  : `⏺ ${t(language, 'recordLocal')}`}
              </button>
              <p className="mt-2 text-xs text-ink/60">{t(language, 'recordLocalHint')}</p>
              {saved ? (
                <p role="status" className="mt-1 text-xs font-semibold text-ink">
                  {t(language, 'recordLocalSaved')}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
