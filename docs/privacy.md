# Privacy

People ask this service questions they would not ask a stranger — about an
arrest, a hospital bill, a landlord, a bribe they were asked for. This document
says exactly what is kept and what is not.

*Last reviewed: 11 September 2026.*

---

## The short version

- **Your question never leaves the machine the service runs on.** There is no
  third-party model API in the path. Nothing is sent to OpenAI, Google, Anthropic
  or anyone else.
- **No account, no login, no profile.** The service does not know who you are and
  has nowhere to put a name if you gave it one.
- **Your IP address is never written to disk.**
- **Voice audio is never stored.** It is transcribed locally and discarded.

## What is recorded

To run a controlled trial we keep an append-only log of questions and answers.
One record per question, containing:

| Field | What it is |
| --- | --- |
| `query_id` | A random id, so a rating can be attached to an answer. **Not** a session or user id. |
| `timestamp` | When the question was asked (UTC). |
| `query_text` | Your question, truncated to 2,000 characters. |
| `transliterated_text` | The rewritten form, if you typed in Roman script. |
| `detected_language` | `en`, `hi` or `gu`. |
| `answer_text` | The answer given, truncated to 8,000 characters. |
| `retrieved_sections` | Which provisions the answer used. |
| `domain`, `fallback`, `cached` | Whether it answered, refused, or came from cache. |
| `corpus_version` | Which version of the legal corpus answered. |
| `input_mode` | `text` or `voice`. |
| `caller_hash` | See below. |

**Your question text is stored.** That is the honest position, and we are stating
it plainly rather than burying it: we cannot tell whether a legal answer was
wrong without being able to read the question that produced it. This is the
single most privacy-affecting thing the service does.

So: **please do not include names, addresses, phone numbers, case numbers or
other identifying details in a question.** The service does not need them to
answer, and they would be stored if you typed them.

## `caller_hash`

If a deployment puts a gateway in front of the service, that gateway may pass a
hashed caller identifier, truncated to 32 characters, so that abuse can be rate
limited.

The service **never receives an IP address, a token or a header**, and never
computes the hash itself — it only ever sees a value already hashed by something
else. There is no code path through which a raw address could be logged.

## Voice

Audio is transcribed on the same machine, using local models. **The transcript is
kept as the question text; the audio is not kept at all.** There is no parameter
through which audio could reach the log, and no endpoint that stores it.

Spoken answers are generated locally and cached as audio files keyed by a hash of
the text — the cache holds the *answer*, which is not personal, never the
question.

## The evidence recorder

The app can record audio for your own use, in situations where preserving
evidence matters.

**That recorder uploads nothing.** It captures to memory inside the page, hands
you a file, and forgets it. There is no request to the service and no endpoint
that would accept one. What you record stays on your device and is yours.

## In your browser

The app stores your language choice and recent conversation locally so it
survives a refresh and works offline. This never reaches the service. Clearing
your browser data removes it.

No analytics, no advertising trackers, no third-party scripts.

## Who can see the log

The trial log stays on the machine the service runs on. It is read by the project
team to find wrong answers and fix them. It is not sold, shared or published.

If the anonymised log were ever published to support research, question text
would be reviewed and stripped of anything identifying first — and this document
would be updated before it happened, not after.

## What you can ask for

Because there is no account, we cannot look up "your" data — there is nothing
linking records to you. If you can supply the `query_id` shown with an answer, we
can delete that record. Otherwise there is no identifier to search on, which is a
consequence of collecting so little.

## Children

The service is not directed at children and asks for no age information.

## Changes

This document is versioned in the repository, so any change is visible in its
history rather than announced and forgotten.

## Contact

Via [AION Analytics (India)](https://github.com/AION-Analytics-India).
