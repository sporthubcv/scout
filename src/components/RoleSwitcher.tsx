/**
 * RoleSwitcher (design.md 7.5) — floating bottom-right demo role selector.
 * Visually distinct (ink-950 pill + orange active dot) so the simulation is obvious.
 * Selecting a role sets the demo session and routes to that role's dashboard.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  ChevronUp,
  ClipboardList,
  Eye,
  Landmark,
  ShieldCheck,
  Trophy,
  User,
  UserRound,
  Users,
  HandCoins,
  Globe,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useT } from '@/i18n';
import { roleDashboardPath, useDemoSession } from '@/data/demoSession';
import type { Role } from '@/data/types';
import { cn } from '@/lib/utils';

const ROLE_ICONS: Record<Role, LucideIcon> = {
  athlete: User,
  guardian: UserRound,
  club: Building2,
  scout: Eye,
  coach: ClipboardList,
  organizer: Trophy,
  federation: Landmark,
  intlClub: Globe,
  sponsor: HandCoins,
  admin: ShieldCheck,
};

const ROLE_ORDER: Role[] = [
  'athlete',
  'guardian',
  'club',
  'scout',
  'coach',
  'organizer',
  'federation',
  'intlClub',
  'sponsor',
  'admin',
];

export default function RoleSwitcher() {
  const t = useT();
  const navigate = useNavigate();
  const { role, setRole } = useDemoSession();
  const [open, setOpen] = useState(false);

  // Only visible when a demo session is active (design.md 7.5)
  if (!role) return null;

  const select = (r: Role) => {
    setRole(r);
    setOpen(false);
    navigate(roleDashboardPath(r));
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-14 right-0 w-64 rounded-xl bg-ink-950 p-2 text-white shadow-lg"
          >
            <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              {t('roleSwitcher.title')}
            </p>
            <ul className="max-h-80 overflow-y-auto">
              {ROLE_ORDER.map((r) => {
                const Icon = ROLE_ICONS[r];
                const active = r === role;
                return (
                  <li key={r}>
                    <button
                      type="button"
                      onClick={() => select(r)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] font-medium transition-colors cursor-pointer',
                        active ? 'bg-ink-800 text-white' : 'text-white/70 hover:bg-ink-800 hover:text-white',
                      )}
                    >
                      <Icon size={16} className={active ? 'text-brand-500' : 'text-white/40'} aria-hidden />
                      <span className="flex-1">{t(`roles.${r}`)}</span>
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-ink-700 px-3 pb-1.5 pt-2 text-[10px] leading-snug text-white/40">
              {t('roleSwitcher.hint')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 items-center gap-2 rounded-full bg-ink-950 px-4 text-[13px] font-semibold text-white shadow-lg transition-transform active:scale-[0.97] cursor-pointer"
        aria-expanded={open}
      >
        <Users size={15} className="text-brand-500" aria-hidden />
        {t('roleSwitcher.viewAs')}: {t(`roles.${role}`)}
        <ChevronUp size={14} className={cn('transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
    </div>
  );
}
