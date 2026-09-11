// Small wrappers over localStorage. Every read and write is guarded: a private
// window, cleared site data or a browser blocking storage all throw, and none of
// them is a reason to fail to answer a legal question.

const KEYS = {
  language: 'kyr.language',
  history: 'kyr.history',
  numbers: 'kyr.numbers',
  corpusVersion: 'kyr.corpusVersion',
};

const read = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full; the app works without it */
  }
};

export const loadLanguage = () => read(KEYS.language, null);
export const saveLanguage = (code) => write(KEYS.language, code);

// History is capped: it is a convenience, not an archive, and the questions
// people ask a legal service are not something to accumulate on a shared phone.
const HISTORY_LIMIT = 20;
export const loadHistory = () => read(KEYS.history, []);
export const saveHistory = (messages) => write(KEYS.history, messages.slice(-HISTORY_LIMIT));
export const clearHistory = () => {
  try {
    window.localStorage.removeItem(KEYS.history);
  } catch {
    /* nothing to do */
  }
};

export const loadNumbers = () => read(KEYS.numbers, null);
export const saveNumbers = (payload) => write(KEYS.numbers, payload);

export const loadCorpusVersion = () => read(KEYS.corpusVersion, null);
export const saveCorpusVersion = (version) => write(KEYS.corpusVersion, version);
