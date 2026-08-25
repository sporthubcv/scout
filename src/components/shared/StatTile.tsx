/**
 * StatTile (design.md 7.8) — micro caps label, Manrope 800 number,
 * optional delta arrow (success/danger) and sparkline.
 */
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatTile({
  label,
  value,
  delta,
  deltaLabel,
  spark,
  dark = false,
  className,
}: {
  label: string;
  value: string | number;
  /** positive = up (success), negative = down (danger), undefined = no delta */
  delta?: number;
  deltaLabel?: string;
  /** tiny sparkline values (rendered as bars) */
  spark?: number[];
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        dark ? 'border-ink-700 bg-ink-900' : 'border-line bg-white shadow-[0_1px_2px_rgba(10,10,11,.05)]',
        className,
      )}
    >
      <p className={cn('text-[11px] font-bold uppercase tracking-[0.06em]', dark ? 'text-white/50' : 'text-ink-600')}>
        {label}
      </p>
      <div className="mt-1.5 flex items-end justify-between gap-3">
        <p className={cn('font-display text-[32px] font-extrabold leading-none tnum', dark ? 'text-white' : 'text-ink-950')}>
          {value}
        </p>
        {spark && spark.length > 1 && (
          <div className="flex h-8 items-end gap-[3px]" aria-hidden>
            {spark.map((v, i) => {
              const max = Math.max(...spark);
              return (
                <span
                  key={i}
                  className={cn('w-1.5 rounded-sm', i === spark.length - 1 ? 'bg-brand-500' : dark ? 'bg-ink-700' : 'bg-paper-100')}
                  style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
                />
              );
            })}
          </div>
        )}
      </div>
      {delta !== undefined && (
        <p
          className={cn(
            'mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold tnum',
            delta >= 0 ? 'text-success' : 'text-danger',
          )}
        >
          {delta >= 0 ? <TrendingUp size={13} aria-hidden /> : <TrendingDown size={13} aria-hidden />}
          {delta >= 0 ? '+' : ''}
          {delta}
          {deltaLabel ? <span className={cn('font-medium', dark ? 'text-white/40' : 'text-ink-600')}>{deltaLabel}</span> : null}
        </p>
      )}
    </div>
  );
}
