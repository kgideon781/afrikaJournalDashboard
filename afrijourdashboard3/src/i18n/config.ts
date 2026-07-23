import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import ar from './locales/ar.json'
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import pt from './locales/pt.json'

/**
 * Supported UI locales, ordered as they appear in the switcher.
 * Add a new locale by dropping a JSON file into ./locales and extending
 * this array — the switcher and RTL helper auto-pick it up.
 */
export const SUPPORTED_LOCALES = ['en', 'fr', 'pt', 'ar', 'es'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  pt: 'Português',
  ar: 'العربية',
  es: 'Español',
}

export const RTL_LOCALES: readonly Locale[] = ['ar'] as const

export function isRtl(locale: string): boolean {
  return (RTL_LOCALES as readonly string[]).includes(locale)
}

export function normalizeLocale(candidate: string | null | undefined): Locale {
  if (!candidate) return 'en'
  const base = candidate.toLowerCase().split(/[-_]/)[0]
  return (SUPPORTED_LOCALES as readonly string[]).includes(base)
    ? (base as Locale)
    : 'en'
}

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  pt: { translation: pt },
  ar: { translation: ar },
  es: { translation: es },
} as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    interpolation: { escapeValue: false },
    detection: {
      // Look at URL path first (/fr/dashboard), then remembered choice, then browser.
      order: ['path', 'localStorage', 'navigator', 'htmlTag'],
      lookupFromPathIndex: 0,
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    returnEmptyString: false,
  })

/**
 * Keep the <html lang> and <html dir> attributes in sync with the active
 * locale. Called from the app shell after i18n bootstraps.
 */
export function applyDocumentLocale(locale: string) {
  const norm = normalizeLocale(locale)
  document.documentElement.lang = norm
  document.documentElement.dir = isRtl(norm) ? 'rtl' : 'ltr'
}

// Wire language changes to the DOM so any code path (router prefix change,
// switcher click, detector) keeps html lang/dir consistent.
i18n.on('languageChanged', (lng) => {
  applyDocumentLocale(lng)
})

export default i18n
