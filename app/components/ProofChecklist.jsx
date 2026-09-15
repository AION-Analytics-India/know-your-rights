/**
 * "Keep this proof" — the Paper Trail Doctrine, rendered under a procedural answer.
 *
 * This block is **built by the backend, not written by the model**. See
 * `docs/PAPER_TRAIL_DOCTRINE.md`: a model asked to invent a documentation
 * checklist invents a plausible one, and a citizen who follows a
 * plausible-but-wrong checklist ends up with no usable record — which is the
 * exact failure this whole layer exists to prevent.
 *
 * It is open by default, unlike the evidence block. The acknowledgement line is
 * the single most consequential sentence in the product, and burying it behind a
 * tap would lose it for exactly the readers who most need it.
 */
export default function ProofChecklist({ checklist, helplines, language }) {
  if (!checklist?.items?.length) return null;

  return (
    <section
      className="mt-3 rounded-lg border-2 border-ink/25 bg-white/80 text-[0.95rem]"
      lang={language}
      aria-labelledby="proof-heading"
    >
      <h3
        id="proof-heading"
        className="border-b border-ink/10 px-3 py-2 font-semibold"
      >
        📎 {checklist.title}
      </h3>

      <div className="px-3 py-3">
        {checklist.acknowledgement_line ? (
          <p className="mb-3 rounded bg-ink/5 px-2 py-2 font-semibold">
            {checklist.acknowledgement_line}
          </p>
        ) : null}

        <ul className="list-disc space-y-1 pl-5">
          {checklist.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        {helplines?.length ? (
          <div className="mt-3 border-t border-ink/10 pt-2">
            <ul className="flex flex-wrap gap-2">
              {helplines.map((line) => (
                <li key={line.key}>
                  {/* tel: so one tap dials. Numbers come from the backend's
                      verified list; the page never holds a literal of its own. */}
                  <a
                    href={`tel:${(line.numbers[0] || '').replace(/\s/g, '')}`}
                    className="kyr-tap inline-block rounded border border-ink/25 px-2 py-1 font-semibold"
                  >
                    {line.numbers[0]} · {line.labels?.[language] || line.labels?.en}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
