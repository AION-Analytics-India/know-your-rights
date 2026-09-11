import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import EmergencyNumbers from '../components/EmergencyNumbers';
import { importantNumbers } from '../lib/api';
import { t } from '../lib/i18n';
import * as storage from '../lib/storage';

/**
 * A page of its own, not a panel inside the chat.
 *
 * Someone reaching for an ambulance number should not have to load the chat,
 * scroll past quick replies, or wait for anything. This route is precached by
 * the service worker and renders entirely from localStorage, so it opens with
 * no network — which is the only condition under which it really matters.
 */
export default function Emergency() {
  const [language, setLanguage] = useState('en');
  const [helplines, setHelplines] = useState([]);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setLanguage(storage.loadLanguage() || 'en');
    setHelplines(storage.loadNumbers() || []);
    setOffline(!navigator.onLine);

    // Refresh in the background. The saved copy is already on screen, so a
    // failure here changes nothing the user can see.
    importantNumbers()
      .then((data) => {
        setHelplines(data.helplines || []);
        storage.saveNumbers(data.helplines || []);
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      <Head>
        <title>{`${t(language, 'emergencyTitle')} · ${t(language, 'appName')}`}</title>
      </Head>

      <div className="flex min-h-[100dvh] flex-col bg-paper">
        <header className="border-b border-ink/10 bg-white">
          <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-3 py-3">
            <Link
              href="/"
              className="kyr-tap inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
              lang={language}
            >
              <span aria-hidden="true">←</span> {t(language, 'back')}
            </Link>
            <h1 className="text-base font-semibold" lang={language}>
              {t(language, 'emergencyTitle')}
            </h1>
          </div>
        </header>

        <main className="mx-auto w-full max-w-2xl flex-1 space-y-3 px-3 py-4">
          <p className="text-sm text-ink/70" lang={language}>
            {t(language, offline ? 'offlineNumbers' : 'emergencyIntro')}
          </p>
          {helplines.length ? (
            <EmergencyNumbers helplines={helplines} language={language} />
          ) : (
            <p className="rounded-lg border border-ink/15 bg-white p-4 text-sm text-ink/60" lang={language}>
              {t(language, 'noNumbers')}
            </p>
          )}
        </main>
      </div>
    </>
  );
}
