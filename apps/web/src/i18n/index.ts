import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import it from './locales/it.json';

/** UI languages (SPEC §2.1). Italian is the default; English is the alternative. */
export const UI_LANGUAGES = ['it', 'en'] as const;
export type UiLanguage = (typeof UI_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: UiLanguage = 'it';

const STORAGE_KEY = 'mappa.lang';

function isUiLanguage(value: string): value is UiLanguage {
  return (UI_LANGUAGES as readonly string[]).includes(value);
}

/**
 * Italian is the default for everyone, per SPEC §2.1 — this is a map of Italy
 * with Italian place names, category names and routing instructions, so
 * silently switching to English because a browser advertises `en-US` would be
 * the wrong call. English is one click away and the choice is remembered.
 */
function initialLanguage(): UiLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null && isUiLanguage(stored)) return stored;
  } catch {
    // Private mode or blocked storage: fall through to the default.
  }
  return DEFAULT_LANGUAGE;
}

/** Remember an explicit choice. Never throws: storage may be unavailable. */
export function rememberLanguage(lang: UiLanguage): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not being able to remember the choice must not break switching it.
  }
}

await i18n.use(initReactI18next).init({
  resources: {
    it: { translation: it },
    en: { translation: en },
  },
  lng: initialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
