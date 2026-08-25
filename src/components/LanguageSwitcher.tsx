/**
 * LanguageSwitcher (design.md 7.4) — segmented [PT | EN] control.
 * Instant full-UI swap via i18n context; persists in localStorage (shs-locale).
 */
import { LOCALES, useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={cn('flex h-7 items-center rounded-full p-0.5', dark ? 'bg-ink-800' : 'bg-paper-100')}
    >
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          aria-pressed={locale === l.code}
          className={cn(
            'h-6 rounded-full px-2.5 text-[11px] font-bold tracking-wide transition-colors cursor-pointer',
            locale === l.code
              ? 'bg-ink-950 text-white'
              : dark
                ? 'text-white/50 hover:text-white'
                : 'text-ink-600 hover:text-ink-950',
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
