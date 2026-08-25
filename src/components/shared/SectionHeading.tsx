/**
 * SectionHeading — eyebrow (micro caps, orange dot) + H2 + optional sub + optional action link.
 */
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function SectionHeading({
  eyebrow,
  title,
  sub,
  action,
  dark = false,
  center = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  action?: { label: string; to: string };
  dark?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('mb-10', center && 'text-center', className)}>
      {eyebrow && (
        <p
          className={cn(
            'mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em]',
            center && 'justify-center',
            dark ? 'text-white/60' : 'text-ink-600',
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
          {eyebrow}
        </p>
      )}
      <div className={cn('flex flex-wrap items-end justify-between gap-4', center && 'flex-col items-center')}>
        <h2 className={cn('font-display text-[26px] font-extrabold leading-[1.15] tracking-[-0.015em] lg:text-[32px]', dark ? 'text-white' : 'text-ink-950')}>
          {title}
        </h2>
        {action && (
          <Link
            to={action.to}
            className="text-[14px] font-semibold text-brand-600 transition-colors hover:text-brand-500"
          >
            {action.label} →
          </Link>
        )}
      </div>
      {sub && (
        <p className={cn('mt-3 max-w-2xl text-[15px] leading-relaxed', dark ? 'text-white/60' : 'text-ink-600', center && 'mx-auto')}>
          {sub}
        </p>
      )}
    </div>
  );
}
