/**
 * dash-b kit — small shared building blocks for the organizer / sponsor / admin
 * dashboards (dashboards-b scope). All labels arrive via props (i18n'd by callers).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, animate, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { cveToEur } from '@/data';

/* ---------------- simulated loading (600ms skeletons, design.md 5) -------- */

export function useDemoLoading(ms = 600): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(id);
  }, [ms]);
  return loading;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-shimmer rounded-lg bg-paper-100', className)} aria-hidden />;
}

/* ---------------- count-up number (900ms, tnum) ---------------------------- */

export function CountUp({ value, format }: { value: number; format?: (n: number) => string }) {
  const { formatNumber } = useI18n();
  const fmt = format ?? formatNumber;
  const [display, setDisplay] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    const controls = animate(ref.current, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        ref.current = v;
        setDisplay(v);
      },
    });
    return () => controls.stop();
  }, [value]);
  return <span className="tnum">{fmt(Math.round(display))}</span>;
}

/* ---------------- cards ---------------------------------------------------- */

export function DashCard({
  title,
  action,
  children,
  className,
  pad = true,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <section className={cn('rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(10,10,11,.05)]', className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="font-display text-[16px] font-bold text-ink-950">{title}</h2>
          {action}
        </header>
      )}
      <div className={cn(pad && 'p-5')}>{children}</div>
    </section>
  );
}

/* ---------------- tables (design.md 7.12) ---------------------------------- */

export function DashTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[560px] border-collapse text-left">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="bg-paper-50 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
        {children}
      </tr>
    </thead>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn('px-4 py-2.5 font-bold whitespace-nowrap', className)}>{children}</th>;
}

export function TRow({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'h-14 border-t border-line text-[13px] text-ink-950 transition-colors',
        onClick && 'cursor-pointer hover:bg-paper-50 active:bg-brand-50',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className, colSpan }: { children?: ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={cn('px-4 py-2 align-middle', className)}>{children}</td>;
}

/* ---------------- locale-aware number -------------------------------------- */

export function Num({ value, className }: { value: number; className?: string }) {
  const { formatNumber } = useI18n();
  return <span className={cn('tnum', className)}>{formatNumber(value)}</span>;
}

/* ---------------- CVE value with € hint ------------------------------------ */

export function CveValue({ cve, className, showEur = true }: { cve: number; className?: string; showEur?: boolean }) {
  const { t, formatNumber } = useI18n();
  return (
    <span className={cn('tnum whitespace-nowrap', className)}>
      esc {formatNumber(cve)}
      {showEur && (
        <span className="ml-1 text-[11px] font-medium text-ink-600">
          {t('common.currencyHint', { eur: formatNumber(cveToEur(cve)) })}
        </span>
      )}
    </span>
  );
}

/* ---------------- toasts (design.md 7.15) ---------------------------------- */

interface ToastItem {
  id: number;
  message: string;
}

const ToastContext = createContext<{ push: (message: string) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const push = useCallback((message: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const value = useMemo(() => ({ push }), [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(92vw,360px)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex h-12 items-center gap-2.5 rounded-lg bg-ink-950 px-4 text-[13px] font-medium text-white shadow-lg"
            >
              <CheckCircle2 size={16} className="shrink-0 text-brand-500" aria-hidden />
              <span className="truncate">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): (message: string) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.push;
}

/* ---------------- modal (design.md 7.15) ----------------------------------- */

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
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'relative max-h-[90dvh] w-full overflow-y-auto rounded-2xl bg-white shadow-xl',
              wide ? 'max-w-3xl' : 'max-w-lg',
            )}
          >
            <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-white px-5 py-4">
              <h2 className="font-display text-[18px] font-bold text-ink-950">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-ink-600 hover:bg-paper-100 cursor-pointer"
                aria-label="close"
              >
                <X size={18} aria-hidden />
              </button>
            </header>
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- drawer (design.md 7.15) ---------------------------------- */

export function DashDrawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: 440 }}
            animate={{ x: 0 }}
            exit={{ x: 440 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 right-0 w-full max-w-[420px] overflow-y-auto bg-white shadow-xl"
          >
            <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-white px-5 py-4">
              <h2 className="font-display text-[18px] font-bold text-ink-950">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-ink-600 hover:bg-paper-100 cursor-pointer"
                aria-label="close"
              >
                <X size={18} aria-hidden />
              </button>
            </header>
            <div className="p-5">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- small form bits ------------------------------------------ */

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-ink-950">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  'h-10 w-full rounded-lg border border-line bg-white px-3 text-[14px] text-ink-950 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

export const textareaCls =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-[14px] text-ink-950 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

export function PrimaryButton({
  children,
  onClick,
  className,
  type = 'button',
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 text-[14px] font-semibold text-white transition-all hover:bg-brand-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  onClick,
  className,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-ink-950/15 bg-white px-3.5 text-[13px] font-semibold text-ink-950 transition-colors hover:border-ink-950 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-950 cursor-pointer',
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ---------------- toggle switch -------------------------------------------- */

export function DashToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 py-1 text-left cursor-pointer"
    >
      <span className="text-[14px] font-medium text-ink-950">{label}</span>
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-brand-500' : 'bg-paper-100',
        )}
        aria-hidden
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  );
}

/* ---------------- section header inside a dashboard section ----------------- */

export function DashSectionHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-[26px] font-extrabold tracking-[-0.015em] text-ink-950">{title}</h2>
        {sub && <p className="mt-1 text-[13px] text-ink-600">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------------- horizontal pct bar ---------------------------------------- */

export function PctBar({ pct, className }: { pct: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-100">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="w-10 text-right text-[12px] font-semibold text-ink-950 tnum">{pct}%</span>
    </div>
  );
}
