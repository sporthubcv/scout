/**
 * StatusBadge (design.md 7.11) — all badge/status chip variants.
 */
import { BadgeCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';

export type BadgeVariant =
  | 'verifiedProfile'
  | 'verifiedStats'
  | 'selfReported'
  | 'pending'
  | 'rejected'
  | 'boost'
  | 'live'
  | 'demo'
  | 'comingLater';

const micro = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] leading-none';

const styles: Record<BadgeVariant, string> = {
  verifiedProfile: 'bg-ink-950 text-white',
  verifiedStats: 'bg-ink-950 text-white',
  selfReported: 'border border-warning/40 bg-amber-50 text-warning',
  pending: 'border border-info/40 bg-blue-50 text-info',
  rejected: 'border border-danger/40 bg-red-50 text-danger',
  boost: 'bg-brand-500 text-white',
  live: 'bg-danger text-white',
  demo: 'bg-paper-100 text-ink-600',
  comingLater: 'border border-dashed border-line text-ink-600',
};

const i18nKey: Record<BadgeVariant, string> = {
  verifiedProfile: 'badges.verifiedProfile',
  verifiedStats: 'badges.verifiedStats',
  selfReported: 'badges.selfReported',
  pending: 'badges.pendingVerification',
  rejected: 'badges.rejectedVerification',
  boost: 'badges.boostActive',
  live: 'badges.live',
  demo: 'badges.demo',
  comingLater: 'badges.comingLater',
};

export default function StatusBadge({
  variant,
  className,
}: {
  variant: BadgeVariant;
  className?: string;
}) {
  const t = useT();
  return (
    <span
      className={cn(micro, styles[variant], className)}
      title={variant === 'boost' ? t('badges.boostTooltip') : undefined}
    >
      {variant === 'verifiedProfile' && <BadgeCheck size={12} className="text-brand-500" aria-hidden />}
      {variant === 'verifiedStats' && <BadgeCheck size={12} className="text-success" aria-hidden />}
      {variant === 'boost' && <Zap size={12} aria-hidden />}
      {variant === 'live' && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
      )}
      {variant === 'pending' && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-info" />
        </span>
      )}
      {t(i18nKey[variant])}
    </span>
  );
}
