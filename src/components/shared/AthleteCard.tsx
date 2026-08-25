/**
 * AthleteCard (design.md 7.8) — 4:5 monogram area, name, sport/position chips,
 * club, OVR square overlapping top-right, verified badge, footer with age · island · key stat.
 */
import { Link } from 'react-router-dom';
import { useT } from '@/i18n';
import type { AthleteProfile } from '@/data/types';
import { getClub } from '@/data/clubs';
import { initialsOf } from './MonogramAvatar';
import OvrSquare, { PotChip } from './OvrSquare';
import StatusBadge from './StatusBadge';

export default function AthleteCard({ athlete }: { athlete: AthleteProfile }) {
  const t = useT();
  const club = athlete.clubId ? getClub(athlete.clubId) : undefined;
  // Demo timeline is set in the 2026/27 season; compute age against 2027.
  const demoAge = 2027 - athlete.birthYear;

  return (
    <Link
      to={`/athletes/${athlete.id}`}
      className="group relative block rounded-xl border border-line bg-white p-0 shadow-[0_1px_2px_rgba(10,10,11,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-xl bg-ink-gradient transition-transform duration-500 group-hover:scale-[1.04]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden>
          <path d="M -10 100 A 46 46 0 0 1 42 132" stroke="#F97316" strokeWidth="2" fill="none" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-6xl font-extrabold text-white" aria-hidden>
          {initialsOf(athlete.name)}
        </span>
        <div className="absolute right-3 top-3">
          <OvrSquare value={athlete.ovr.value} size={56} />
        </div>
        {athlete.verification === 'verified' && (
          <div className="absolute bottom-3 left-3">
            <StatusBadge variant="verifiedProfile" />
          </div>
        )}
        <span className="absolute bottom-3 right-3 translate-y-2 text-[13px] font-semibold text-brand-500 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          {t('common.viewProfile')} →
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-bold text-ink-950">{athlete.name}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-paper-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
            {t(`sports.${athlete.sport}`)}
          </span>
          <span className="text-[12px] font-medium text-ink-600">{athlete.position}</span>
          <PotChip value={athlete.pot} />
        </div>
        <p className="mt-2 text-[13px] font-medium text-ink-600">{club?.name ?? '—'}</p>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[13px] text-ink-600">
          <span className="tnum">
            {demoAge} {t('common.age').toLowerCase()} · {athlete.island}
          </span>
          <span className="font-display text-base font-extrabold text-ink-950 tnum">
            {athlete.keyStat.value}
            <span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-ink-600">{athlete.keyStat.label}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
