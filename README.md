# Know Your Rights

**A multilingual legal-information service for Indian citizens. Ask by typing in your own
language and get a plain-language answer that names the law it came from. The
public pilot is text-only; voice is in development.**

English · हिन्दी · ગુજરાતી — including questions typed in Roman script
(*"mera landlord notice ke bina nikal raha hai"*).

> **Legal information, not legal advice.** This is not a substitute for a
> qualified lawyer or a legal aid service, and it does not present itself as one.

---


## Start here

- [Try the public pilot](https://aionanalytics.in/models/know-your-rights/demo). The pilot is text-only and asks for an email address before the first question. Read the consent and current usage limits on that page.
- [Read the product status and limitations](https://aionanalytics.in/models/know-your-rights). Coverage is partial. This is legal information, not legal advice.
- Developers: this repository contains the client and [API contract](docs/api.md). The answering service is hosted separately; cloning this repository does not provide that service. See [Running the app](#running-the-app).
- [Report a reproducible issue](https://github.com/AION-Analytics-India/know-your-rights/issues/new) or [join a discussion](https://github.com/AION-Analytics-India/know-your-rights/discussions). Include the language and expected behavior; leave personal details out of public reports.
- Reviewers: [read how to take part in the pilot](#trials). Advocate and native-speaker review are still needed.

## The problem

Most people meet the law at the worst possible moment — stopped at a checkpoint,
handed an eviction notice, refused a document they are entitled to, admitted to a
hospital. The question at that moment is narrow and urgent: *what am I actually
entitled to here, and what do I do next?*

The information is public. It is also spread across statutes, rules and scheme
documents, written in English legalese, and organised for lawyers rather than for
the person standing in the situation. The barrier is not secrecy. It is language,
structure and time.

Two failure modes make a naive chatbot worse than useless here:

- **A confident wrong answer.** The person asking cannot detect it, and may act on it.
- **An answer with no source.** Legal information that cannot be checked cannot be
  used to assert a right.

Everything below exists to avoid both.

## What it does

- **Every answer cites the provision it came from** — section, article or scheme
  field — so it can be checked rather than trusted.
- **It declines when it does not know.** Out-of-scope questions (market data,
  clinical advice, predictions about how your case will end) are refused, not guessed.
- **Answers in the language of the question**, in the right script.
- **A direct answer when an authority oversteps.** For situations like being held
  past twenty-four hours, refused school admission for a child, asked for a bribe,
  or threatened with eviction from forest land, it names the forum to approach and
  the provision behind it. This part is fixed and checked rather than composed on
  the spot, so it reads the same every time and stays available when the rest of
  the service is degraded.
- **What the law requires and what is merely prudent are never merged.** A remedy
  whose governing Act is not yet loaded appears *without* a citation rather than
  with a plausible one.
- **What to do, not only what the law says.** For 28 common situations it gives the
  first steps, the office to write to **by designation** — "the Superintendent of
  Police", not "the authorities" — where to escalate if that fails, and a
  fill-in-the-blank letter in English and Hindi.
- **Every procedural answer ends with a proof checklist.** In India a verbal
  complaint leaves no trace and a written one without an acknowledgement can be
  denied. So the answer tells you to get a stamp, a signature or an inward number
  on *your* copy; to photograph the submission if that is refused; to send it by
  registered post and keep the receipt. This block is fixed, not composed per
  question.
- **A pack for women travelling alone**, covering unsafe cabs, harassment on
  trains, hotel safety, being followed, late-night police stops, and lost
  documents. Every card leads with safety: **in immediate danger, call 112 first** —
  the paperwork can wait.
- **Verified helplines, offline.** The emergency page works with no connection.
  Every number carries the official source it was read from and the date it was
  checked, and any number that could not be confirmed is left out rather than
  guessed.
- **Voice in and out**, for people who find typing in their own script hard.
  *In development: the public pilot is text-only for now.*
- **Installable as a progressive web app.**

## Coverage

Central law across arrest and police procedure, tenancy and property, healthcare
and patient rights, consumer and banking grievances, identity documents, education,
social justice, and gambling. State-specific material where it has been sourced —
currently Gujarat in the greatest depth.

## Privacy

The service runs on local infrastructure. **No question leaves the machine it runs
on**, there is no third-party model API in the path, and voice is transcribed
locally. The evidence recorder in the app writes to your own device and uploads
nothing — there is no endpoint that would accept it.

**The public pilot asks for an email address before the first question**, since
21 October 2026. The website that hosts the pilot keeps the email in its own
records, apart from your questions: the answering service never receives it, and
the questions it keeps are not linked to it. The email record is deleted 12 months
after your last question, or sooner if you ask at contact@aionanalytics.in.

Full detail: [`docs/privacy.md`](docs/privacy.md).

## Status

**Public pilot: open, text-only, and accepting users. Not a released product.**

Release is deliberately gated on three things engineering cannot clear alone:

1. **Legal validation by practising advocates**, domain by domain.
2. **Corpus review** — bodies of law a citizen may need are not yet covered. These
   are documented rather than hidden; see [Limitations](docs/limitations.md).
3. **Controlled user testing** with the communities it is built for, in their own
   languages.

### ▶ Try it

**[aionanalytics.in/models/know-your-rights/demo](https://aionanalytics.in/models/know-your-rights/demo)**

Open and running. Since 21 October 2026 the pilot asks for an email address
before the first question, and for two acknowledgements: that it gives legal
information, not legal advice, and can be wrong, so you check the cited section
or ask a lawyer before acting on it; and that you have read how your email and
your questions are handled. Your browser then keeps a random access code, so the
same device is not asked again. The page shows how many people have tried the
pilot since 21 October 2026 and how many questions have been answered.

The number of free questions, and how rating an answer unlocks the next, are
stated on the pilot page. There is also a daily limit, because every answer is
generated on our own hardware.

**If you use it, please rate the answer.** The pilot exists to find what the
service gets wrong, and a rating on a *wrong* answer is worth more to us than a
rating on a right one. Voice is switched off in the pilot for now; it returns
once the speech licence and native-speaker review are complete.

## Quality

Measured against a 208-question evaluation set spanning all three languages and
every supported domain.

| Property | Result |
| --- | --- |
| Declines questions it should decline | **100%** (34 / 34) |
| Numbers quoted correctly (fines, deadlines, limits) | **100%** |
| Answers citing the correct provision | 97.6% |
| Language identified correctly | 99.5% |
| Overall pass rate | 93.8% |

The two properties that matter most for a legal service — **refusing what it
cannot answer** and **never quoting a number wrong** — are both at 100%.

**Read these numbers with two caveats, because they are the honest ones.** They
were measured before the most recent corpus expansion and have not yet been
re-run. And they cannot see a particular failure that matters: an answer can cite
the correct section, quote every number correctly, and still be poorly worded or
wrong in its conclusion — in Hindi and Gujarati especially. Native-speaker review
is the only thing that catches that, and it is in progress rather than finished.
This is why advocate validation gates release and a scorecard does not.

## Repository contents

This repository carries the **client application, the API contract and the public
documentation**. The retrieval and answer-generation implementation is not
included and is not public.

```
app/     the progressive web app (Next.js)
docs/    API contract, privacy, limitations
```

## Running the app

The app needs a Know Your Rights API endpoint to talk to. If you have one:

```bash
cd app
npm install
cp .env.local.example .env.local     # set NEXT_PUBLIC_API_BASE to your endpoint
npm run dev                          # http://localhost:3000
```

Build for production with `npm run build && npm start`.

The API it expects is documented in [`docs/api.md`](docs/api.md) — endpoints,
request and response shapes, and streaming frames. Any service implementing that
contract will work with this client.

## When the law changes

Indian law moves constantly, and most people find out after it has affected them.
A watcher checks official sources every morning — India Code and the Press
Information Bureau — and announces central and constitutional changes as it finds
them: a new Act commencing, an amendment to a Schedule of the Constitution, an
ordinance.

- **Telegram:** [@AionAnalyticsIndia](https://t.me/AionAnalyticsIndia)
- **Discord:** [discord.gg/Dk9Pjc9cVa](https://discord.gg/Dk9Pjc9cVa)

Each notice says *that* the law moved and links the source. It does not tell you
what the law now says, because at that point nobody has reviewed it — and
announcing an interpretation before a human has read the provision is the exact
failure this project exists to prevent.

## Trials

The service is in controlled trial rather than open release, because a legal
answer that is wrong can cost somebody something real. The
[demo](https://aionanalytics.in/models/know-your-rights/demo) is
open to anyone who gives an email address; what gates a wider release is review by
people who know the law.

**We are looking for:**

- **Practising advocates** willing to review answers in one domain and tell us
  where they are wrong. This is the gate on release, and it is the most valuable
  contribution anyone can make.
- **Native Hindi and Gujarati speakers** to judge whether answers read naturally
  and say the right thing, not merely whether they cite the right section.
- **Legal aid organisations and NGOs** who would put this in front of the people
  they serve, and tell us what breaks.

To take part, open an issue or email **[contact@aionanalytics.in](mailto:contact@aionanalytics.in?subject=Know%20Your%20Rights%20trial)**.
Tell us which domain you work in and which language you read; that is enough to
start.

## Reporting a wrong answer

A wrong legal answer is the most serious bug this project can have. If you find
one, open an issue — or email **[contact@aionanalytics.in](mailto:contact@aionanalytics.in?subject=Wrong%20answer)**
if you would rather not do it in public — with the question asked, the language,
the answer given and what it should have said.

**Please do not include personal details of a real situation.** We do not need
them, and an issue is public.

## Licence and use

See [`LICENSE`](LICENSE). The client and documentation are published so the
service can be evaluated and integrated; the underlying method is proprietary and
patent-pending.

---

Built by [AION Analytics (India)](https://github.com/AION-Analytics-India).
