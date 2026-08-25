/**
 * SportHub Scout — i18n infrastructure (design.md sec. 9)
 *
 * - Locales: pt-PT (default) + en. Dictionaries are nested objects keyed by page
 *   (e.g. home.hero.title). Lookup via dot paths: t('home.hero.title').
 * - Interpolation: t('key', { name: 'Erick' }) replaces {name} placeholders.
 * - Persisted in localStorage under `shs-locale`; <html lang> is kept in sync.
 * - To add a locale: create locales/<code>.ts with the same shape as pt-PT,
 *   register it in `dictionaries` below and in `LOCALES`. No other code change.
 *
 * CONTRIBUTION RULE FOR PAGE AGENTS: zero hardcoded UI strings. Add your page's
 * keys to BOTH locales/pt-PT.ts and locales/en.ts under a top-level section
 * named after the page (e.g. `athleteProfile: { ... }`). Reuse nav.*, common.*,
 * badges.*, sports.* and roles.* keys instead of duplicating them.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ptPT } from './locales/pt-PT';
import { en } from './locales/en';

export type Locale = 'pt-PT' | 'en';
export type Dictionary = typeof ptPT;

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'pt-PT', label: 'PT' },
  { code: 'en', label: 'EN' },
];

const STORAGE_KEY = 'shs-locale';

const dictionaries: Record<Locale, Dictionary> = {
  'pt-PT': ptPT,
  en: en as Dictionary,
};

function resolve(dict: unknown, path: string): string | undefined {
  let node: unknown = dict;
  for (const part of path.split('.')) {
    if (node == null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] != null ? String(vars[k]) : `{${k}}`,
  );
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Translate a dot-path key, with optional {var} interpolation. Falls back to pt-PT, then the key itself. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Intl helpers bound to the active locale */
  formatNumber: (n: number) => string;
  formatDate: (d: Date | string, opts?: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function initialLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'pt-PT' || stored === 'en') return stored;
  } catch {
    /* ignore */
  }
  return 'pt-PT';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const raw =
        resolve(dictionaries[locale], key) ?? resolve(dictionaries['pt-PT'], key) ?? key;
      return interpolate(raw, vars);
    },
    [locale],
  );

  const formatNumber = useCallback(
    (n: number) => new Intl.NumberFormat(locale).format(n),
    [locale],
  );

  const formatDate = useCallback(
    (d: Date | string, opts?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, opts ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(
        typeof d === 'string' ? new Date(d) : d,
      ),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, formatNumber, formatDate }),
    [locale, setLocale, t, formatNumber, formatDate],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

/** Shortcut: const t = useT(); t('nav.discover') */
export function useT() {
  return useI18n().t;
}
