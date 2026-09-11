# API contract

Everything the client needs, and nothing about how answers are produced. Any
service implementing this contract works with the app in [`../app`](../app).

All requests and responses are JSON unless stated. There is no authentication in
the contract itself — deployments put their own gateway in front.

---

## `POST /chat`

Answer a legal question.

```json
{ "query": "Can the police arrest me without a warrant?", "caller_hash": "" }
```

`caller_hash` is optional and, if sent, must already be hashed by the caller. The
service never receives or hashes an address, a token or a header.

**Response**

```json
{
  "answer": "…",
  "sources": [
    {
      "citation": "The Bharatiya Nagarik Suraksha Sanhita, 2023 - Section 35",
      "section": "35",
      "article": "",
      "text_snippet": "…",
      "corpus_version": "bnss_2023_act46",
      "source_url": "https://indiacode.gov.in/…"
    }
  ],
  "fallback": false,
  "language": "en",
  "domain": "legal",
  "cached": false,
  "evidence_tip": null,
  "remedies": null,
  "standing": null,
  "query_id": "…"
}
```

| Field | Meaning |
| --- | --- |
| `answer` | The answer, in the language of the question. |
| `sources` | Provisions the answer rests on. **Always render these.** An answer without its citation cannot be checked, and an unverifiable legal answer is not usable. |
| `fallback` | `true` when nothing relevant was retrieved. The `answer` is then a refusal, not information. |
| `language` | Detected language of the question (ISO 639-1). |
| `domain` | Routed domain, e.g. `legal`, `tenancy`, `healthcare`. `unknown` means no domain filter was applied. |
| `cached` | `true` when served from a curated or runtime cache. |
| `evidence_tip` | Guidance on preserving evidence, or `null`. See below. |
| `remedies` | Fixed, cited remedies when the question names a violation, or `null`. See below. |
| `standing` | Reassurance accompanying a remedy, or `null`. |
| `query_id` | Opaque id to attach feedback to. Not a session or user id. |

### `evidence_tip` and `remedies` — the two-column rule

Both carry `statutory` and `practical` lists, and **a client must never merge
them**. `statutory` entries cite a provision that exists in the corpus and can be
checked. `practical` entries are ordinary prudence and make no claim about what
the law says. Presenting prudence as law is the failure this split exists to
prevent; render them under separate headings.

A `remedies` entry looks like:

```json
{
  "key": "detained_beyond_24_hours",
  "label": "Held longer than twenty-four hours without a magistrate",
  "statutory": [
    { "source": "constitution_part_iii", "unit": "Article 22", "says": "…" }
  ],
  "practical": ["Write down the time of arrest and the police station. …"],
  "forum": "High Court under Article 226, or the Supreme Court under Article 32. …",
  "urgency": "immediate",
  "notes": { "applicability": "Gujarat, Bihar" }
}
```

`notes.applicability`, when present, means the rule holds only in those states.
Render it, or a reader elsewhere will take it for the national position.

**Errors.** `422` the query was empty or too long · `502` the model returned
something invalid · `503` a dependency is unavailable · `504` the model timed out.

---

## `POST /chat/stream`

The same answer, streamed as Server-Sent Events. A grounded answer takes 20–80
seconds to write, so this turns a blank screen into text arriving as it is
produced.

Frames, in order:

| Event | Payload |
| --- | --- |
| `sources` | The provisions the answer will rest on, sent *before* any text. |
| `token` | `{ "text": "…" }` — the answer so far, cumulative. |
| `final` | The complete `/chat` response object. **Authoritative.** |
| `error` | `{ "detail": "…" }` — errors arrive inside the stream, because the HTTP status is already 200. |

The stream ends with `data: [DONE]`.

**The `final` frame replaces what was streamed.** The service validates the whole
answer once assembled and may rewrite it. A client that keeps the streamed text
instead will sometimes show text the service rejected.

---

## `GET /rights_remedies`

What to do when an authority oversteps. Fixed text — no model is called, the
response is identical between calls, and it stays available when generation is
degraded.

| Query param | |
| --- | --- |
| `language` | `en`, `hi` or `gu`. An unsupported value is served in English rather than refused. |
| `q` | Describe a situation to narrow the list. **An unmatched query returns every remedy, not none** — an empty response would imply the person has no remedy. |

Returns `remedies`, `count`, `standing`, `language`, `uncited_routes` and
`disclaimer`.

`uncited_routes` names real routes carried *without* a citation because the Act
governing them is not indexed. It is published so the omission stays visible.

### `GET /rights_remedies/{key}`

One remedy. `404` if the key is unknown.

---

## `GET /important_numbers`

Verified helplines, for a client to cache and show offline. Only numbers
confirmed against an official source are served; each carries `source_url` and
`verified_on`. A number nobody could verify is absent, never guessed.

## `GET /complaint_templates`

Statutory complaint procedures, each with a paste-ready drafting prompt. Optional
`domain` filter. Timelines come from the statute and are stated rather than
generated.

## `GET /cached_questions`

Questions answered instantly from a curated cache, for one-tap shortcuts. The
list is deliberately short: a curated answer bypasses retrieval entirely, so only
verified ones are included.

## `GET /recording_guidance`

What may lawfully be recorded in common situations, split `statutory` /
`practical` as above.

## `GET /corpus_version`

Fingerprint of the indexed corpus, for cache invalidation.

```json
{ "available": true, "version": "…", "generated_at": "…",
  "chunk_count": 4002, "embedding_model": "…", "sources": { "…": "…" } }
```

Returns `available: false` rather than an error when nothing is indexed yet — the
service is up, it simply has no corpus, and a client should tell those apart.

## `POST /feedback`

A citizen's verdict on one answer, keyed by `query_id`.

## `GET /health`

Liveness. Touches neither corpus nor model.

## `GET /pilot_status`

Aggregate pilot progress. Contains no question text.

---

## Voice

`GET /voice/status` reports whether voice is available — **check it first**, as
deployments may run with voice disabled.

`POST /voice/transcribe` (multipart audio) → transcript ·
`POST /voice/synthesize` → audio ·
`POST /voice/chat` (multipart audio) → a transcript plus a full chat response.

Audio is transcribed locally. A spoken question is stored as its transcript and
nothing else; no audio is retained.

---

## Two obligations on any client

1. **Always show the citations.** The whole design assumes the reader can check
   the answer against the provision.
2. **Never present `practical` as `statutory`.** They are separated at every
   layer of the service; a client that merges them undoes that.
