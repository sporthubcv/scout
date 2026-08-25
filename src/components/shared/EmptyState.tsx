/**
 * EmptyState (design.md 7.17) — dashed container, illustration/icon, H3, body, CTA.
 */
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  body,
  ctaLabel,
  onCta,
  useIllustration = false,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  ctaLabel?: string;
  onCta?: () => void;
  /** use /empty-state.svg illustration instead of a Lucide icon */
  useIllustration?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 py-12 text-center',
        className,
      )}
    >
      {useIllustration ? (
        <img src="/empty-state.svg" alt="" width={160} height={120} className="opacity-80" />
      ) : (
        <Icon size={40} strokeWidth={1.5} className="text-ink-600/40" aria-hidden />
      )}
      <h3 className="mt-4 font-display text-xl font-bold text-ink-950">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-[13px] text-ink-600">{body}</p>}
      {ctaLabel && (
        <button
          type="button"
          onClick={onCta}
          className="mt-5 inline-flex h-11 items-center rounded-lg bg-brand-500 px-5 font-semibold text-white transition-colors hover:bg-brand-600 active:scale-[0.97]"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
