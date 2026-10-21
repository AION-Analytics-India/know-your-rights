# Privacy

People ask this service questions they would not ask a stranger — about an
arrest, a hospital bill, a landlord, a bribe they were asked for. This document
says exactly what is kept and what is not.

*Last reviewed: 21 October 2026, when the public pilot began asking for an email
address (see [The pilot email](#the-pilot-email)). Previously reviewed 11 September 2026.*

---

## The short version

- **Your question never leaves the machine the service runs on.** There is no
  third-party model API in the path. Nothing is sent to OpenAI, Google, Anthropic
  or anyone else.
- **The answering service has no account, no login and no profile.** It does not
  know who you are and has nowhere to put a name if you gave it one.
- **The public pilot asks for your email address first.** Since 21 October 2026
  the website that hosts the pilot asks for an email address before the first
  question. The website keeps it in its own records, apart from your questions;
  the answering service never receives it. See [The pilot email](#the-pilot-email).
- **The answering service never receives or stores your IP address.** The pilot
  website keeps the IP address you agreed from with your email record; see
  [The pilot email](#the-pilot-email).
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

**Your question text is stored.** That is the honest position, stated plainly
rather than buried: we cannot tell whether a legal answer was wrong without
reading the question that produced it. It is the single most privacy-affecting
thing the service does, and two things limit it.

**Identifiers are stripped before the question is written to disk.** Aadhaar
numbers, PAN, phone numbers, email addresses and long account numbers are
replaced with a placeholder at the moment of logging — not filtered later when
something is read, because a reader who forgets to filter is how a redacted log
leaks anyway. Section and article numbers survive, because they are the substance
of the question.

This is deliberately conservative: it removes *number shapes*, not names. A name
cannot be detected reliably without a model, a model would be wrong often, and a
redactor that errs on the permissive side is worse than none because it invites
false confidence. So **please still avoid putting names, addresses or case
numbers in a question** — the service does not need them to answer.

**The text is deleted after 90 days.** The record survives — the counts, the
language, whether it answered — and the words are dropped. The reason for keeping
text has a shelf life: a fault nobody has looked at in three months will not be
found by the words sitting on disk, while the counts that show a fault exists
identify nobody and are kept.

You can check this is really happening: `queries_with_text_expired` and
`text_retention_days` are published at
[`/pilot_status`](https://dashboard.aiondashboard.site/demo/kyr/status).

## `caller_hash`

If a deployment puts a gateway in front of the service, that gateway may pass a
hashed caller identifier, truncated to 32 characters, so that abuse can be rate
limited.

The service **never receives an IP address, a token or a header**, and never
computes the hash itself — it only ever sees a value already hashed by something
else. There is no code path through which a raw address could be logged.

## The pilot email

Since 21 October 2026 the public pilot at
[aionanalytics.in/models/know-your-rights/demo](https://aionanalytics.in/models/know-your-rights/demo)
asks for an email address before the first question, with two acknowledgements:
that the pilot gives legal information, not legal advice, and can be wrong, so you
check the cited section or ask a lawyer before acting on it; and that you have read
how your email and your questions are handled. We ask for it so that we can count
how many people try the pilot, and how often it answers or declines.

The email is kept by the website that hosts the pilot, not by the answering
service. With the address, the website keeps:

- when it was first and last seen;
- when you gave the two acknowledgements, and the IP address you gave them from;
- which versions of the pilot notice and of the privacy policy you accepted;
- how many questions you asked, and how many were answered or declined.

**The email is never sent to the answering service and never joined to a
question.** The question log described above is unchanged and holds no email; the
email record holds counts, not questions.

Your browser keeps a random access code, so the same device is not asked for the
email again.

The email record is deleted 12 months after your last question, or sooner if you
ask at [contact@aionanalytics.in](mailto:contact@aionanalytics.in?subject=Pilot%20email%20deletion).

The pilot page shows two counts: how many people have tried the pilot since
21 October 2026, and how many questions have been answered. Test and AION
addresses are left out of both. No address appears in either.

What the website keeps is governed by its own privacy policy, which has a section
on this pilot: [aionanalytics.in/privacy](https://aionanalytics.in/privacy).

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

That is true of this app. The public pilot page is part of the website, and what
that page loads is described in the website's privacy policy. On that page your
browser also keeps the random access code described in
[The pilot email](#the-pilot-email); clearing your browser data removes it too.

## What we publish

Aggregate statistics from the pilot are public: how many questions were asked,
in which languages, how many the service could not answer and in which areas of
law, how many people came back, and what proportion were rated useful. The pilot
page also shows the two counts described in [The pilot email](#the-pilot-email).

Every one of those is a count. There is no field in it a person could be found
in, which is what makes publishing it possible — and publishing it is a stronger
claim than this document can make in words. **A service that collected more than
it needed could not show you everything it holds.**

## Who can see the log

The trial log stays on the machine the service runs on. It is read by the project
team to find wrong answers and fix them. It is not sold, shared or published.

If the anonymised log were ever published to support research, question text
would be reviewed and stripped of anything identifying first — and this document
would be updated before it happened, not after.

## What you can ask for

The answering service has no account, so we cannot look up "your" questions:
there is nothing linking them to you. If you can supply the `query_id` shown with
an answer, we can delete that record. Otherwise there is no identifier to search
on, which is a consequence of collecting so little.

Your pilot email record is different. It is kept under your address, so you can
ask for it to be deleted at
[contact@aionanalytics.in](mailto:contact@aionanalytics.in?subject=Pilot%20email%20deletion).
Your questions are not linked to it, so they cannot be found through it.

## Children

The service is not directed at children and asks for no age information.

## Changes

This document is versioned in the repository, so any change is visible in its
history rather than announced and forgotten.

- **21 October 2026.** The public pilot began asking for an email address before
  the first question, and [The pilot email](#the-pilot-email) was added. Until
  then this document said "No account, no login, no profile" and "Your IP address
  is never written to disk" without qualification. Both now apply to the
  answering service only. The earlier text is in this file's history.

## Contact

**[contact@aionanalytics.in](mailto:contact@aionanalytics.in?subject=Privacy)**, or via
[AION Analytics (India)](https://github.com/AION-Analytics-India).

If you want a record deleted and have the `query_id` shown with the answer, send
it to that address and we will remove it. The same address deletes your pilot
email record.
