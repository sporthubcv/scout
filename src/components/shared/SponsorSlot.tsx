/**
 * SponsorSlot (design.md 7.16) — honest standardized placement.
 * Hairline-bordered strip, micro caps label + text placeholder. No real brands.
 */
import { cn } from '@/lib/utils';

export default function SponsorSlot({
  label,
  placeholder,
  dark = false,
  className,
}: {
  /** e.g. 'PATROCINADO POR' / 'POWERED BY' */
  label: string;
  /** e.g. 'MARCA PARCEIRA — espaço de demonstração' */
  placeholder: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5',
        dark ? 'border-ink-700' : 'border-line',
        className,
      )}
    >
      <span className={cn('text-[10px] font-bold uppercase tracking-[0.14em]', dark ? 'text-white/40' : 'text-ink-600/70')}>
        {label}
      </span>
      <span className={cn('text-[12px] font-semibold', dark ? 'text-white/50' : 'text-ink-600')}>{placeholder}</span>
    </div>
  );
}
