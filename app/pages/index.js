import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';

import { HelpDialog, OfflineBanner, UpdateBanner } from '../components/Banners';
import ChatMessage from '../components/ChatMessage';
import Composer from '../components/Composer';
import EmergencyNumbers from '../components/EmergencyNumbers';
import Header from '../components/Header';
import QuickReplies from '../components/QuickReplies';
import Thinking from '../components/Thinking';
import { ask, askStream, cachedQuestions, corpusVersion, importantNumbers, voiceStatus } from '../lib/api';
import { t } from '../lib/i18n';
import * as storage from '../lib/storage';

export default function Home() {
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([]);
  // Whether spoken answers are available here; probed once on load.
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [helplines, setHelplines] = useState([]);
  const [updateReady, setUpdateReady] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  // The answer being written right now. Kept out of `messages` on purpose: it
  // changes ~20 times a second, and `messages` is persisted to localStorage on
  // every change. A half-written answer is also not history — if the connection
  // drops it is discarded, never saved.
  const [live, setLive] = useState(null);
  const [instant, setInstant] = useState([]);
  const endRef = useRef(null);
  const abortRef = useRef(null);

  // --- restore ------------------------------------------------------------
  useEffect(() => {
    const saved = storage.loadLanguage();
    if (saved) setLanguage(saved);
    else if (typeof navigator !== 'undefined') {
      // Meet the user in their phone's language rather than defaulting to English.
      const code = (navigator.language || 'en').slice(0, 2);
      if (['hi', 'gu'].includes(code)) setLanguage(code);
    }
    setMessages(storage.loadHistory());
    // One probe, so the listen button is only offered when it would work.
    voiceStatus()
      .then((status) => setVoiceEnabled(Boolean(status?.enabled)))
      .catch(() => {});
    const cached = storage.loadNumbers();
    if (cached) setHelplines(cached);
  }, []);

  useEffect(() => { storage.saveHistory(messages); }, [messages]);
  useEffect(() => { document.documentElement.lang = language; }, [language]);

  // --- connectivity -------------------------------------------------------
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  // --- emergency numbers and corpus freshness -----------------------------
  useEffect(() => {
    if (offline) return;
    importantNumbers()
      .then((data) => {
        setHelplines(data.helplines || []);
        storage.saveNumbers(data.helplines || []);
      })
      .catch(() => undefined); // the cached copy stands

    cachedQuestions()
      .then((data) => setInstant(data.questions || []))
      .catch(() => undefined); // shortcuts are a convenience, not a requirement

    corpusVersion()
      .then((data) => {
        if (!data?.available || !data.version) return;
        const known = storage.loadCorpusVersion();
        // First run just records the version; only a *change* is worth reporting.
        if (known && known !== data.version) setUpdateReady(true);
        if (!known) storage.saveCorpusVersion(data.version);
      })
      .catch(() => undefined);
  }, [offline]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy, live?.text]);

  const refresh = useCallback(async () => {
    try {
      const data = await corpusVersion();
      if (data?.version) storage.saveCorpusVersion(data.version);
    } catch {
      /* refreshing anyway */
    }
    setUpdateReady(false);
    window.location.reload();
  }, []);

  const send = useCallback(
    async (query) => {
      setMessages((current) => [...current, { role: 'user', text: query, id: Date.now() }]);
      setBusy(true);
      setLive({ text: '', sources: [] });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const data = await askStream(query, {
          signal: controller.signal,
          // Citations arrive before the prose, so the reader can see which law
          // is being used while the explanation is still being written.
          onSources: (sources) => setLive((current) => ({ ...(current || { text: '' }), sources })),
          onToken: (_fragment, text) => setLive((current) => ({ ...(current || { sources: [] }), text })),
        });

        // The final payload is authoritative. The backend validates the whole
        // answer once assembled and may replace it, so what was streamed is
        // dropped rather than merged.
        setMessages((current) => [
          ...current,
          {
            role: 'assistant',
            text: data.answer,
            sources: data.sources,
            fallback: data.fallback,
            evidenceTip: data.evidence_tip,
            proofChecklist: data.proof_checklist,
            helplines: data.helplines,
            proceduralGuide: data.procedural_guide,
            remedies: data.remedies,
            standing: data.standing,
            voiceEnabled,
            at: Date.now(),
            id: Date.now() + 1,
          },
        ]);
      } catch (error) {
        if (error?.name === 'AbortError') return; // the user stopped it; say nothing

        // A dropped stream is usually the connection or a proxy, not the
        // backend refusing. Ask once more without streaming before giving up —
        // it costs another wait, but a real answer is worth more than a fast
        // error. A 4xx is the query itself and would fail again, so it is not
        // retried.
        const worthRetrying = !error?.status || error.status >= 500;
        if (worthRetrying) {
          try {
            setLive(null);
            const data = await ask(query);
            setMessages((current) => [
              ...current,
              {
                role: 'assistant',
                text: data.answer,
                sources: data.sources,
                fallback: data.fallback,
                evidenceTip: data.evidence_tip,
            proofChecklist: data.proof_checklist,
            helplines: data.helplines,
            proceduralGuide: data.procedural_guide,
                remedies: data.remedies,
                standing: data.standing,
                voiceEnabled,
                note: t(language, 'streamFailed'),
                at: Date.now(),
                id: Date.now() + 1,
              },
            ]);
            return;
          } catch (second) {
            if (second?.name === 'AbortError') return;
          }
        }

        // 502/503/504 mean the model is busy or slow, which is worth saying
        // plainly rather than reporting as a generic failure.
        const busyStatus = [502, 503, 504].includes(error?.status);
        setMessages((current) => [
          ...current,
          {
            role: 'assistant',
            text: t(language, busyStatus ? 'errorBusy' : 'errorGeneric'),
            error: true,
            retry: query,
            at: Date.now(),
            id: Date.now() + 1,
          },
        ]);
      } finally {
        abortRef.current = null;
        setLive(null);
        setBusy(false);
      }
    },
    [language]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const changeLanguage = (code) => {
    setLanguage(code);
    storage.saveLanguage(code);
  };

  const clear = () => {
    setMessages([]);
    storage.clearHistory();
  };

  const empty = messages.length === 0;

  return (
    <>
      <Head>
        <title>{t(language, 'appName')}</title>
      </Head>

      <div className="flex min-h-[100dvh] flex-col">
        <Header language={language} onLanguageChange={changeLanguage} onHelp={() => setHelpOpen(true)} />
        {offline ? <OfflineBanner language={language} /> : null}
        {updateReady ? <UpdateBanner language={language} onRefresh={refresh} /> : null}

        <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-3 py-4">
          {empty ? (
            <>
              <QuickReplies
                language={language}
                onPick={send}
                disabled={busy || offline}
                instant={instant}
              />
              <EmergencyNumbers helplines={helplines} language={language} />
            </>
          ) : (
            <>
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    language={language}
                    onRetry={message.retry && !busy ? () => send(message.retry) : undefined}
                  />
                ))}
                {live?.text ? (
                  <ChatMessage
                    message={{
                      role: 'assistant',
                      text: live.text,
                      sources: live.sources,
                      streaming: true,
                      id: 'live',
                    }}
                    language={language}
                  />
                ) : null}
                {busy && !live?.text ? <Thinking language={language} /> : null}
              </div>
              {busy ? (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={stop}
                    className="kyr-tap rounded-lg border border-ink/20 px-3 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
                    lang={language}
                  >
                    {t(language, 'stop')}
                  </button>
                </div>
              ) : null}
              {!busy ? (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={clear}
                    className="kyr-tap text-sm text-ink/60 underline underline-offset-4 hover:text-ink"
                    lang={language}
                  >
                    {t(language, 'clear')}
                  </button>
                </div>
              ) : null}
            </>
          )}
          <div ref={endRef} />
        </main>

        <Composer language={language} onSend={send} busy={busy} offline={offline} />
      </div>

      {helpOpen ? <HelpDialog language={language} onClose={() => setHelpOpen(false)} /> : null}
    </>
  );
}
