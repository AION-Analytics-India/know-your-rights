import { useState } from 'react';
import { t } from '../lib/i18n';

/**
 * What to do when an authority oversteps — fixed text, not a generated answer.
 *
 * This block comes from the backend's rules index, so unlike the prose above it
 * no model wrote it: it is byte-identical between calls and cannot drift with a
 * sampling temperature. That is the whole reason it is shown *beside* the answer
 * rather than folded into it.
 *
 * It keeps the same two-column discipline as `EvidenceGuidance`, and for the
 * same reason: `statutory` lines cite a provision that exists in the corpus and
 * can be checked; `practical` lines are ordinary prudence and claim nothing
 * about the law. They are never merged.
 *
 * Open by default, which `EvidenceGuidance` is not. Evidence guidance is useful
 * background; this block appears only when the question described a violation,
 * and someone in that position should not have to find and tap a disclosure to
 * see which forum to go to.
 */
export default function RightsRemedy({ remedies, standing, language }) {
  const [open, setOpen] = useState(true);

  if (!remedies?.length) return null;

  return (
    <section className="mt-3 rounded-lg border-2 border-ink/25 bg-white/80 text-[0.95rem]" lang={language}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="kyr-tap flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-semibold"
      >
        <span>⚖️ {t(language, 'remedyTitle')}</span>
        <span aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div className="border-t border-ink/10 px-3 py-3">
          {/* Shown once, above the remedies, because it is about the person
              rather than about any one of them. */}
          {standing ? (
            <p className="mb-3 rounded bg-paper p-2 text-sm leading-relaxed">{standing}</p>
          ) : null}

          {remedies.map((remedy) => (
            <article key={remedy.key} className="mb-4 last:mb-0">
              <h4 className="mb-2 font-semibold">{remedy.label}</h4>

              {remedy.forum ? (
                <p className="mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-ink/60">
                    {t(language, 'remedyForum')}
                  </span>
                  <br />
                  {remedy.forum}
                </p>
              ) : null}

              {remedy.statutory?.length ? (
                <>
                  <h5 className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/60">
                    {t(language, 'remedyLaw')}
                  </h5>
                  <ul className="mb-2 list-disc space-y-1 pl-5">
                    {remedy.statutory.map((cite) => (
                      <li key={`${cite.source}-${cite.unit}`}>
                        <span className="font-semibold">{cite.unit}</span> — {cite.says}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {remedy.practical?.length ? (
                <>
                  <h5 className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/60">
                    {t(language, 'remedyPractical')}
                  </h5>
                  <ul className="mb-2 list-disc space-y-1 pl-5">
                    {remedy.practical.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {/* A rule that applies only in some states says so, or a reader
                  in another state will take it as the national position. */}
              {remedy.notes?.applicability ? (
                <p className="text-xs text-ink/70">
                  {t(language, 'remedyApplies')}: {remedy.notes.applicability}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
