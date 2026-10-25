# Changelog

Changes to this repository. This file starts on 21 October 2026; earlier changes
are in the commit history.

## 2026-10-25

### Fixed
- `app/components/Header.jsx`: on a phone the app name and tagline were cut off ("Kno..."). The title now has its
  own row and the SOS, language and help buttons sit below it.

## 2026-10-23

### Security
- `app/package-lock.json`: `npm audit fix` updated sharp, source-map-js and postcss to patched versions. The app
  builds unchanged. Six high-severity findings remain in build-time tooling only (the Tailwind 3 chain and the
  postcss copy inside Next.js); they need Tailwind 4 and Next 16, which are planned, not done.

## 2026-10-21

### Documentation
- The public pilot now asks for an email address before the first question, with
  two acknowledgements. `README.md`, `llms.txt` and `docs/privacy.md` no longer say
  that the pilot needs no sign-up or that nothing identifying is kept. They now
  say what the website that hosts the pilot keeps with the email, that the
  answering service never receives it, that questions are not linked to it, and
  how it is deleted.
- `docs/privacy.md`: new section "The pilot email"; the statements "No account, no
  login, no profile" and "Your IP address is never written to disk" now apply to
  the answering service only, as recorded under "Changes" in that file.
- The pilot links in `README.md` point at aionanalytics.in. The old address
  redirects there.
- The README no longer states the number of free questions; the pilot page states it.
