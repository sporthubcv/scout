/**
 * DemoBanner (design.md 7.1) — global top strip, dismissible per session,
 * state persisted in localStorage. Re-shown on first visit.
 */
import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { useT } from '@/i18n';

const STORAGE_KEY = 'shs-demo-banner-dismissed';

export default function DemoBanner() {
  const t = useT();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative flex h-9 items-center justify-center bg-ink-950 px-10">
      <p className="flex items-center gap-2 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-white/70">
        <Info size={13} className="shrink-0 text-white/50" aria-hidden />
        <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75 [animation-duration:2s]" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
        </span>
        <span className="hidden sm:inline">{t('demoBanner.text')}</span>
        <span className="sm:hidden">Demo</span>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('demoBanner.dismiss')}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/50 transition-colors hover:bg-ink-800 hover:text-white cursor-pointer"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}
