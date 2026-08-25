/**
 * TabsUnderline (design.md 7.14) — underline tabs with Framer Motion layoutId indicator.
 * Controlled component; page owns the state.
 */
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface UnderlineTab {
  id: string;
  label: string;
}

export default function TabsUnderline({
  tabs,
  active,
  onChange,
  id,
  dark = false,
  className,
}: {
  tabs: UnderlineTab[];
  active: string;
  onChange: (id: string) => void;
  /** unique prefix so layoutId is scoped to this tab group */
  id: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn('flex gap-6 overflow-x-auto border-b', dark ? 'border-ink-700' : 'border-line', className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative whitespace-nowrap pb-3 text-[14px] font-semibold transition-colors cursor-pointer',
              isActive
                ? dark
                  ? 'text-white'
                  : 'text-ink-950'
                : dark
                  ? 'text-white/50 hover:text-white'
                  : 'text-ink-600 hover:text-ink-950',
            )}
          >
            {tab.label}
            {isActive && (
              <motion.span
                layoutId={`${id}-tab-indicator`}
                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-brand-500"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
