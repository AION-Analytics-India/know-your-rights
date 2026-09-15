import { t } from '../lib/i18n';
import EvidenceGuidance from './EvidenceGuidance';
import ProofChecklist from './ProofChecklist';
import RightsRemedy from './RightsRemedy';
import ListenButton from './ListenButton';

function Sources({ sources, language }) {
  if (!sources?.length) return null;
  return (
    <div className="mt-3 border-t border-ink/10 pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/60" lang={language}>
        {t(language, 'sources')}
      </p>
      <ul className="flex flex-wrap gap-2">
        {sources.map((source, index) => {
          const label = source.citation || source.source || `Source ${index + 1}`;
          const detail = source.section_title || source.scheme_field || '';
          const chip = (
            <>
              <span className="font-medium">{label}</span>
              {detail ? <span className="text-ink/60"> · {detail}</span> : null}
            </>
          );
          return (
            <li key={`${label}-${index}`}>
              {source.source_url ? (
                <a
                  href={source.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded border border-brass/50 bg-brass/10 px-2 py-1 text-sm underline decoration-brass/60 underline-offset-2 hover:bg-brass/20"
                >
                  {chip}
                </a>
              ) : (
                <span className="inline-block rounded border border-brass/50 bg-brass/10 px-2 py-1 text-sm">
                  {chip}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Local time, hour and minute. A legal answer is tied to the law of a moment. */
function formatTime(at, language) {
  if (!at) return null;
  try {
    return new Intl.DateTimeFormat(`${language}-IN`, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(at));
  } catch {
    return null; // an unsupported locale is no reason to drop the message
  }
}

export default function ChatMessage({ message, language, onRetry }) {
  const { role, text, sources, fallback, error, streaming, note, at, retry, evidenceTip, remedies, standing, voiceEnabled, proofChecklist, helplines, proceduralGuide } =
    message;

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg bg-ink px-4 py-3 text-paper shadow-premium">
          <p className="sr-only">{t(language, 'you')}</p>
          <p className="whitespace-pre-wrap break-words" lang={language}>{text}</p>
        </div>
      </div>
    );
  }

  // A fallback is not a failure to be hidden. It is the honest answer when no
  // law matched, and it is styled distinctly so it is never mistaken for one.
  const tone = error
    ? 'border-error/40 bg-error/5'
    : fallback
      ? 'border-warning bg-warning/10'
      : 'border-ink/10 bg-white';

  return (
    <div className="flex justify-start">
      <article
        className={`max-w-[95%] rounded-lg border px-4 py-3 shadow-premium ${tone}`}
        // A screen reader should hear a settled answer, not each fragment as it
        // lands. The finished message is announced when streaming ends.
        aria-live={streaming ? 'off' : 'polite'}
        aria-busy={streaming ? 'true' : undefined}
      >
        <p className="sr-only">{t(language, 'assistant')}</p>

        {fallback && !error ? (
          <p className="mb-2 text-sm font-semibold text-ink/70" lang={language}>
            {t(language, 'fallbackNote')}
          </p>
        ) : null}

        {/* Safety first. Above the answer, not inside it: someone in danger must
            read 'call 112' before they read how to write to a Superintendent. The
            text comes from the card, never from the model. */}
        {proceduralGuide?.safety_note ? (
          <p role="alert" className="mb-3 rounded border-2 border-error/40 bg-error/10 px-3 py-2 font-semibold" lang={language}>
            🆘 {proceduralGuide.safety_note}
          </p>
        ) : null}
        <div
          className="whitespace-pre-wrap break-words"
          style={{ fontSize: 'var(--text-legal)' }}
          lang={language}
        >
          {text}
          {/* A caret while the answer is still arriving, so a pause between
              tokens reads as "still writing" rather than "finished". */}
          {streaming ? (
            <span aria-hidden="true" className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-ink/60 align-middle" />
          ) : null}
        </div>

        <Sources sources={sources} language={language} />

        {/* Fetched on demand, so a slow voice never delays readable text. */}
        {!error && !streaming ? (
          <div className="mt-3">
            <ListenButton text={text} language={language} enabled={voiceEnabled} />
          </div>
        ) : null}

        {/* Fixed, cited, and model-free. Placed above the evidence block because
            when both appear the question described something happening now, and
            the forum to go to matters before how to preserve proof of it. */}
        {!error && !streaming ? (
          <RightsRemedy remedies={remedies} standing={standing} language={language} />
        ) : null}

        {/* The paper trail. Placed above the evidence block and open by default:
            in India a complaint without an acknowledgement is deniable, so the
            acknowledgement line is the most consequential sentence here. */}
        {!error && !streaming ? (
          <ProofChecklist checklist={proofChecklist} helplines={helplines} language={language} />
        ) : null}

        {/* Guidance, not law -- the component keeps the two visibly apart. */}
        {!error && !streaming ? (
          <EvidenceGuidance tip={evidenceTip} language={language} />
        ) : null}

        {/* The disclaimer is withheld until the answer is complete: it belongs
            to a finished answer, and the backend may still replace this text. */}
        {!error && !streaming ? (
          <p className="mt-3 border-t border-ink/10 pt-2 text-xs leading-relaxed text-ink/60" lang={language}>
            {t(language, 'disclaimer')}
          </p>
        ) : null}

        {note && !streaming ? (
          <p className="mt-2 text-xs text-ink/60" lang={language}>{note}</p>
        ) : null}

        {retry && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="kyr-tap mt-3 rounded-lg border border-ink/25 px-4 py-2 text-sm font-semibold hover:bg-ink/5"
            lang={language}
          >
            {t(language, 'retry')}
          </button>
        ) : null}

        {!streaming && formatTime(at, language) ? (
          <p className="mt-2 text-right text-xs tabular-nums text-ink/60">
            <time dateTime={new Date(at).toISOString()}>{formatTime(at, language)}</time>
          </p>
        ) : null}
      </article>
    </div>
  );
}
