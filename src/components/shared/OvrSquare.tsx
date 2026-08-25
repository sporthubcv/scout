/**
 * OvrSquare (design.md 7.9) — signature OVR display: ink square, Manrope 800
 * number, 3px orange bottom bar, micro "OVR" label. Optional POT chip and
 * Data Confidence indicator (dot + label + tooltip).
 */
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import type { Confidence } from '@/data/types';

const confidenceDot: Record<Confidence, string> = {
  high: 'bg-success',
  medium: 'bg-warning',
  low: 'bg-danger',
};

export function DataConfidence({ confidence, className }: { confidence: Confidence; className?: string }) {
  const t = useT();
  const label = t(`common.confidence.${confidence}`);
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-600', className)}
      title={`${t('common.dataConfidence')}: ${label} — ${t('common.confidenceHint')}`}
    >
      <span className={cn('h-2 w-2 rounded-full', confidenceDot[confidence])} aria-hidden />
      {t('common.dataConfidence')}: {label}
      <span aria-hidden className="text-ink-600/60">ⓘ</span>
    </span>
  );
}

export default function OvrSquare({
  value,
  size = 64,
  variant = 'dark-on-light',
  className,
}: {
  value: number;
  size?: number;
  variant?: 'dark-on-light' | 'white-on-dark';
  className?: string;
}) {
  const fontSize = Math.round(size * 0.38);
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-lg',
        variant === 'dark-on-light' ? 'bg-ink-950 text-white' : 'bg-white text-ink-950',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span className="font-display font-extrabold leading-none tnum" style={{ fontSize }}>
        {value}
      </span>
      <span
        className={cn(
          'text-[9px] font-bold uppercase tracking-[0.14em] leading-none mt-0.5',
          variant === 'dark-on-light' ? 'text-white/50' : 'text-ink-600',
        )}
      >
        OVR
      </span>
      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-500" aria-hidden />
    </div>
  );
}

export function PotChip({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-brand-600 tnum',
        className,
      )}
    >
      POT {value}
    </span>
  );
}
