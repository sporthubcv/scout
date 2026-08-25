/**
 * Shared building blocks for the dashboards-a pages (athlete / scout / club).
 * Local to this agent's scope — not part of the scaffold's shared/ components.
 * Design refs: design.md sec. 7.15 (modals/toasts), sec. 8 (dashboard patterns).
 */
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';

/* ---------- Buttons / inputs (class presets) ---------- */

export const btnPrimary =
  'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50';
export const btnSecondary =
  'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-ink-950 px-4 text-[14px] font-semibold text-white transition-colors hover:bg-ink-800 active:scale-[0.97]';
export const btnOutline =
  'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-ink-950/15 bg-white px-4 text-[14px] font-semibold text-ink-950 transition-colors hover:border-ink-950 active:scale-[0.97]';
export const btnGhost =
  'inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-950';
export const inputCls =
  'h-10 w-full rounded-lg border border-line bg-white px-3 text-[14px] text-ink-950 outline-none transition-shadow focus:ring-2 focus:ring-brand-500';
export const labelCls = 'mb-1 block text-[12px] font-semibold text-ink-600';

/* ---------- Card ---------- */

export function DashCard({
  title,
  action,
  children,
  className,
  padded = true,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(10,10,11,.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]',
        padded && 'p-5',
        className,
      )}
    >
      {(title || action) && (
        <div className={cn('flex items-center justify-between gap-3', padded ? 'mb-4' : 'p-5 pb-0 mb-4')}>
          <h2 className="font-display text-[17px] font-bold tracking-tight text-ink-950">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/* ---------- Simulated loading skeletons (600ms, design.md sec. 5) ---------- */

export function useSimulatedLoading(ms = 600): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(id);
  }, [ms]);
  return loading;
}

export function StatTileSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="h-3 w-20 rounded animate-shimmer" />
      <div className="mt-3 h-8 w-24 rounded animate-shimmer" />
      <div className="mt-3 h-3 w-14 rounded animate-shimmer" />
    </div>
  );
}

/* ---------- Modal (design.md 7.15) ---------- */

export function DashModal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const t = useT();
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'relative max-h-[85dvh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl',
              wide ? 'max-w-2xl' : 'max-w-lg',
            )}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-display text-[18px] font-bold text-ink-950">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('common.close')}
                className="cursor-pointer rounded-lg p-1.5 text-ink-600 hover:bg-paper-100"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Toasts (design.md 7.15: ink-950, orange icon, auto-dismiss 4s) ---------- */

interface ToastItem {
  id: number;
  message: string;
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, message }]);
    window.setTimeout(() => setToasts((items) => items.filter((t) => t.id !== id)), 4000);
  }, []);

  const stack = (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-1/2 z-[80] flex w-full max-w-sm -translate-x-1/2 flex-col items-stretch gap-2 px-4 sm:left-auto sm:right-6 sm:translate-x-0 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex min-h-12 items-center gap-2.5 rounded-lg bg-ink-950 px-4 py-2.5 text-[13px] font-medium text-white shadow-lg"
          >
            <CheckCircle2 size={16} className="shrink-0 text-brand-500" aria-hidden />
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return { push, stack };
}

/* ---------- Usage meter (orange progress bar, near-limit warning) ---------- */

export function UsageMeter({
  label,
  used,
  total,
  suffix = '',
  warnLabel,
}: {
  label: string;
  used: number;
  total: number;
  suffix?: string;
  warnLabel?: string;
}) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  const near = pct >= 90;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium text-ink-950">{label}</span>
        <span className="text-[12px] text-ink-600 tnum">
          {used}/{total}
          {suffix}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-100">
        <motion.div
          className="h-full rounded-full bg-brand-500"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {near && warnLabel && (
        <p className="mt-1 text-[11px] font-semibold text-warning">{warnLabel}</p>
      )}
    </div>
  );
}

/* ---------- localStorage demo persistence (shs-*) ---------- */

export function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLS(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/* ---------- Verification chip (maps VerificationStatus -> StatusBadge variant) ---------- */

export function verificationBadgeVariant(status: string) {
  switch (status) {
    case 'verified':
      return 'verifiedStats' as const;
    case 'pending':
      return 'pending' as const;
    case 'rejected':
      return 'rejected' as const;
    default:
      return 'selfReported' as const;
  }
}

/* ---------- Page tab switching via URL hash ---------- */

export function useHashTab<T extends string>(tabs: readonly T[], fallback: T): [T, (id: T) => void] {
  const read = (): T => {
    const h = window.location.hash.replace('#', '');
    return (tabs as readonly string[]).includes(h) ? (h as T) : fallback;
  };
  const [tab, setTabState] = useState<T>(read);

  useEffect(() => {
    const onHash = () => setTabState(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTab = useCallback((id: T) => {
    if (window.location.hash !== `#${id}`) {
      window.history.pushState(null, '', `#${id}`);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
    setTabState(id);
    window.scrollTo({ top: 0 });
  }, []);

  return [tab, setTab];
}
