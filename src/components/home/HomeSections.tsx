/**
 * Home sections 4–11 (feature trio, sports strip, rankings teaser, competitions,
 * roles grid, sponsors, roadmap, final CTA). Framer Motion only — no GSAP here.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  ClipboardList,
  Eye,
  Globe,
  HandCoins,
  Landmark,
  Minus,
  Plus,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useI18n, useT } from '@/i18n';
import { rankings, talentOfWeekId } from '@/data/rankings';
import { getAthlete } from '@/data/athletes';
import { getClub } from '@/data/clubs';
import { competitions } from '@/data/competitions';
import type { Role, Sport } from '@/data/types';
import SectionHeading from '@/components/shared/SectionHeading';
import StatusBadge from '@/components/shared/StatusBadge';
import SponsorSlot from '@/components/shared/SponsorSlot';
import OvrSquare, { PotChip } from '@/components/shared/OvrSquare';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import TabsUnderline from '@/components/shared/TabsUnderline';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
} as const;

/* ---------- Section 4 — Feature trio ---------- */
export function FeatureTrio() {
  const t = useT();
  const features = [
    { img: '/feature-fieldmode.jpg', key: 'f1', to: '/match-scouting/demo-match' },
    { img: '/feature-training.jpg', key: 'f2', to: '/athletes/erick-semedo' },
    { img: '/feature-football.jpg', key: 'f3', to: '/rankings' },
  ];
  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.key}
              {...reveal}
              transition={{ duration: 0.6, ease, delay: i * 0.1 }}
              className="group overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(10,10,11,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={f.img}
                  alt={t(`home.features.${f.key}.title`)}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-bold text-ink-950">{t(`home.features.${f.key}.title`)}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-600">{t(`home.features.${f.key}.body`)}</p>
                <Link to={f.to} className="mt-4 inline-block text-[14px] font-semibold text-brand-600 hover:text-brand-500">
                  {t(`home.features.${f.key}.cta`)} →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 5 — Sports strip (dark) ---------- */
function SportGlyph({ sport }: { sport: Sport }) {
  // Simple 2-stroke line icons on a Lucide-compatible 24 grid (design.md sec. 6)
  const common = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, 'aria-hidden': true };
  if (sport === 'basketball')
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
      </svg>
    );
  if (sport === 'football')
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7l3.5 2.6-1.3 4.1H9.8L8.5 9.6 12 7zM12 3v4M20.6 9.5l-3.1.1M16 20l-1.8-2.4M8 20l1.8-2.4M3.4 9.5l3.1.1" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M4 20h16M13 4a2 2 0 1 1 0.01 0M8 20l2.5-6 3 2 2.5 4M10.5 14L7 11l3-4 3 2 3.5 1" />
    </svg>
  );
}

export function SportsStrip() {
  const t = useT();
  const rows: { sport: Sport; statKey: string }[] = [
    { sport: 'basketball', statKey: 'home.sportsStrip.s1.stat' },
    { sport: 'football', statKey: 'home.sportsStrip.s2.stat' },
    { sport: 'athletics', statKey: 'home.sportsStrip.s3.stat' },
  ];
  return (
    <section className="bg-ink-950 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          {rows.map((row, i) => (
            <motion.div
              key={row.sport}
              {...reveal}
              transition={{ duration: 0.6, ease, delay: i * 0.12 }}
              className="group flex items-center gap-5 rounded-xl border border-ink-700 bg-ink-900 px-5 py-6 transition-colors hover:border-ink-600"
            >
              <span className="h-8 w-[3px] rounded-full bg-ink-700 transition-colors group-hover:bg-brand-500" aria-hidden />
              <span className="text-white/70 transition-transform duration-300 group-hover:rotate-[8deg] group-hover:text-brand-500">
                <SportGlyph sport={row.sport} />
              </span>
              <h3 className="font-display text-2xl font-extrabold text-white transition-transform duration-300 group-hover:translate-x-1.5">
                {t(`sports.${row.sport}`)}
              </h3>
              <span className="ml-auto text-[13px] font-semibold text-white/50 tnum">{t(row.statKey)}</span>
            </motion.div>
          ))}
          <motion.div
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.36 }}
            className="flex items-center gap-5 rounded-xl border border-dashed border-ink-700 px-5 py-6"
          >
            <span className="h-8 w-[3px] rounded-full bg-ink-700" aria-hidden />
            <p className="font-display text-xl font-bold text-white/50">{t('sports.moreSoon')}</p>
            <span className="ml-auto max-w-xs text-right text-[12px] text-white/40">{t('home.sportsStrip.more')}</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 6 — Rankings teaser ---------- */
export function RankingsTeaser() {
  const t = useT();
  const [tab, setTab] = useState<Sport>('basketball');
  const ranking = rankings.find((r) => r.sport === tab)!;
  const talent = getAthlete(talentOfWeekId)!;
  const talentClub = talent.clubId ? getClub(talent.clubId) : undefined;

  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('home.rankings.title')}
          action={{ label: t('home.rankings.viewAll'), to: '/rankings' }}
        />
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <TabsUnderline
              id="home-rankings"
              tabs={(['basketball', 'football', 'athletics'] as Sport[]).map((s) => ({ id: s, label: t(`sports.${s}`) }))}
              active={tab}
              onChange={(id) => setTab(id as Sport)}
            />
            <table className="mt-2 w-full">
              <thead>
                <tr className="text-left text-[11px] font-bold uppercase tracking-[0.08em] text-ink-600">
                  <th className="py-2 pr-2">{t('home.rankings.table.rank')}</th>
                  <th className="py-2">{t('home.rankings.table.athlete')}</th>
                  <th className="hidden py-2 sm:table-cell">{t('home.rankings.table.club')}</th>
                  <th className="py-2 text-right">{t('home.rankings.table.ovr')}</th>
                  <th className="py-2 pl-3 text-right">{t('home.rankings.table.delta')}</th>
                </tr>
              </thead>
              <tbody>
                {ranking.entries.map((entry, i) => {
                  const a = getAthlete(entry.athleteId);
                  if (!a) return null;
                  const club = a.clubId ? getClub(a.clubId) : undefined;
                  return (
                    <motion.tr
                      key={entry.athleteId}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, ease, delay: i * 0.06 }}
                      className="border-t border-line"
                    >
                      <td className="py-3 pr-2 font-display text-lg font-extrabold text-ink-950 tnum">{entry.rank}</td>
                      <td className="py-3">
                        <Link to={`/athletes/${a.id}`} className="flex items-center gap-2.5">
                          <MonogramAvatar name={a.name} size={30} />
                          <span className="text-[14px] font-semibold text-ink-950 hover:text-brand-600">{a.name}</span>
                        </Link>
                      </td>
                      <td className="hidden py-3 text-[13px] text-ink-600 sm:table-cell">{club?.name ?? '—'}</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-ink-950 font-display text-[13px] font-extrabold text-white tnum">
                          {entry.ovr}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <span
                          className={cn(
                            'inline-flex items-center gap-0.5 text-[12px] font-bold tnum',
                            entry.delta > 0 && 'text-success',
                            entry.delta < 0 && 'text-danger',
                            entry.delta === 0 && 'text-ink-600',
                          )}
                        >
                          {entry.delta > 0 ? <TrendingUp size={13} aria-hidden /> : entry.delta < 0 ? <TrendingDown size={13} aria-hidden /> : <Minus size={13} aria-hidden />}
                          {entry.delta !== 0 && Math.abs(entry.delta)}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Talent of the Week */}
          <motion.aside {...reveal} transition={{ duration: 0.6, ease, delay: 0.1 }} className="h-fit rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
            <SponsorSlot label="POWERED BY" placeholder={t('home.rankings.poweredBy')} />
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">
              {t('home.rankings.talentOfWeek')}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <MonogramAvatar name={talent.name} size={52} />
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold text-ink-950">{talent.name}</p>
                <p className="text-[12px] text-ink-600">{talentClub?.name} · {talent.position}</p>
              </div>
              <OvrSquare value={talent.ovr.value} size={56} className="ml-auto" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <PotChip value={talent.pot} />
              <StatusBadge variant="verifiedStats" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
              {[
                { l: 'PPG', v: '18.4' },
                { l: 'AST', v: '5.8' },
                { l: '3P%', v: '38%' },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-xl font-extrabold text-ink-950 tnum">{s.v}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-600">{s.l}</p>
                </div>
              ))}
            </div>
            <Link
              to={`/athletes/${talent.id}`}
              className="mt-5 flex h-10 items-center justify-center rounded-lg bg-ink-950 text-[14px] font-semibold text-white transition-colors hover:bg-ink-800"
            >
              {t('common.viewProfile')}
            </Link>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 7 — Competitions teaser ---------- */
export function CompetitionsTeaser() {
  const t = useT();
  return (
    <section className="bg-paper-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('home.competitions.title')} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {competitions.map((c, i) => (
            <motion.div key={c.id} {...reveal} transition={{ duration: 0.5, ease, delay: i * 0.05 }}>
              <Link
                to={`/competitions/${c.id}`}
                className="block h-full rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-paper-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                    {t(`sports.${c.sport}`)}
                  </span>
                  {c.status === 'live' && <StatusBadge variant="live" />}
                </div>
                <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink-950">{c.name}</h3>
                <p className="mt-1.5 text-[13px] text-ink-600 tnum">
                  {c.season} · {c.teamsCount} {t('nav.clubs').toLowerCase()} · {c.island}
                </p>
                <p className="mt-3 border-t border-line pt-3 text-[12px] text-ink-600">{c.organizer}</p>
              </Link>
            </motion.div>
          ))}
          {/* Organizer CTA card */}
          <motion.div {...reveal} transition={{ duration: 0.5, ease, delay: 0.15 }}>
            <Link
              to="/pricing#calculator"
              className="flex h-full flex-col justify-center rounded-xl border border-dashed border-line bg-white/50 p-5 transition-colors hover:border-brand-500"
            >
              <h3 className="font-display text-lg font-bold text-ink-950">{t('home.competitions.organizer.title')}</h3>
              <p className="mt-1.5 text-[13px] text-ink-600">{t('home.competitions.organizer.body')}</p>
              <span className="mt-4 text-[14px] font-semibold text-brand-600">
                {t('home.competitions.organizer.cta')} →
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 8 — Roles grid (dark) ---------- */
const ROLE_TILES: { role: Role; icon: LucideIcon; capKey: string }[] = [
  { role: 'athlete', icon: User, capKey: 'athlete' },
  { role: 'guardian', icon: UserRound, capKey: 'guardian' },
  { role: 'club', icon: Building2, capKey: 'club' },
  { role: 'scout', icon: Eye, capKey: 'scout' },
  { role: 'coach', icon: ClipboardList, capKey: 'coach' },
  { role: 'organizer', icon: Trophy, capKey: 'organizer' },
  { role: 'federation', icon: Landmark, capKey: 'federation' },
  { role: 'intlClub', icon: Globe, capKey: 'intlClub' },
  { role: 'sponsor', icon: HandCoins, capKey: 'sponsor' },
  { role: 'admin', icon: ShieldCheck, capKey: 'admin' },
];

export function RolesGrid() {
  const t = useT();
  return (
    <section className="bg-ink-950 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('home.rolesSection.title')} dark />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ROLE_TILES.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.role}
                {...reveal}
                transition={{ duration: 0.5, ease, delay: i * 0.05 }}
                className="group rounded-xl border border-ink-700 bg-ink-900 p-5 transition-colors hover:bg-ink-800"
              >
                <Icon size={22} strokeWidth={1.75} className="text-brand-500 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden />
                <p className="mt-3 font-display text-[16px] font-bold text-white">{t(`roles.${r.role}`)}</p>
                <p className="mt-1 text-[12px] leading-snug text-white/50">{t(`home.rolesSection.caps.${r.capKey}`)}</p>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-8">
          <Link to="/auth?demo=roles" className="text-[14px] font-semibold text-brand-500 hover:text-brand-600">
            {t('home.rolesSection.footerLink')} →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 9 — Sponsors ---------- */
const METRICS = [
  { key: 'reach', value: 48200 },
  { key: 'impressions', value: 214000 },
  { key: 'athletes', value: 1284 },
  { key: 'games', value: 96 },
];

const PROPERTY_KEYS = ['platform', 'rankings', 'mvp', 'talent', 'tournaments', 'scouting', 'scholarships', 'equipment'];

export function SponsorsSection() {
  const { t, formatNumber } = useI18n();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('home.sponsors.title')} sub={t('home.sponsors.body')} />
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.key}
                {...reveal}
                transition={{ duration: 0.5, ease, delay: i * 0.05 }}
                className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-600">
                  {t(`home.sponsors.metrics.${m.key}`)}
                </p>
                <p className="mt-2 font-display text-[32px] font-extrabold text-ink-950 tnum">
                  {formatNumber(m.value)}
                </p>
                <StatusBadge variant="demo" className="mt-2" />
              </motion.div>
            ))}
          </div>
          <div>
            <ul className="divide-y divide-line border-y border-line">
              {PROPERTY_KEYS.map((key) => {
                const isOpen = open === key;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : key)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between py-3.5 text-left cursor-pointer"
                    >
                      <span className="text-[15px] font-semibold text-ink-950">
                        {t(`home.sponsors.properties.${key}.name`)}
                      </span>
                      <Plus
                        size={16}
                        className={cn('text-brand-500 transition-transform duration-200', isOpen && 'rotate-45')}
                        aria-hidden
                      />
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                      transition={{ duration: 0.25, ease }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 text-[13px] text-ink-600">{t(`home.sponsors.properties.${key}.desc`)}</p>
                    </motion.div>
                  </li>
                );
              })}
            </ul>
            <Link to="/dashboard/sponsor" className="mt-6 inline-block text-[14px] font-semibold text-brand-600 hover:text-brand-500">
              {t('home.sponsors.cta')} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 10 — Roadmap ---------- */
export function RoadmapSection() {
  const t = useT();
  const phases = ['p1', 'p2', 'p3', 'p4', 'p5'];
  return (
    <section className="bg-paper-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('home.roadmap.title')} className="mb-12" />
        <div className="relative">
          <div className="absolute left-0 right-0 top-3 h-px bg-line" aria-hidden />
          <ol className="relative grid grid-cols-2 gap-8 sm:grid-cols-5">
            {phases.map((p, i) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, ease, delay: i * 0.15 }}
                className="flex flex-col items-start"
              >
                <span
                  className={cn(
                    'relative z-10 h-6 w-6 rounded-full border-2',
                    i === 0 ? 'border-brand-500 bg-brand-500' : 'border-ink-600/40 bg-paper-50',
                  )}
                  aria-hidden
                />
                <p className={cn('mt-3 text-[13px] font-bold', i === 0 ? 'text-brand-600' : 'text-ink-950')}>
                  {t(`home.roadmap.${p}`)}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 11 — Final CTA ---------- */
export function FinalCta() {
  const t = useT();
  return (
    <section className="relative overflow-hidden py-28">
      <motion.img
        src="/cta-stadium.jpg"
        alt=""
        aria-hidden
        initial={{ scale: 1 }}
        whileInView={{ scale: 1.06 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 1.6, ease: 'linear' }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink-950/70" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <motion.h2
          {...reveal}
          transition={{ duration: 0.7, ease }}
          className="font-display text-[36px] font-extrabold leading-[1.05] tracking-[-0.025em] text-white md:text-[56px]"
        >
          {t('home.finalCta.title')}
        </motion.h2>
        <motion.p {...reveal} transition={{ duration: 0.6, ease, delay: 0.1 }} className="mt-4 text-lg text-white/70">
          {t('home.finalCta.sub')}
        </motion.p>
        <motion.div {...reveal} transition={{ duration: 0.6, ease, delay: 0.2 }} className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/auth?mode=register"
            className="inline-flex h-11 items-center rounded-lg bg-brand-500 px-5 font-semibold text-white transition-all hover:bg-brand-600 active:scale-[0.97]"
          >
            {t('home.finalCta.primary')}
          </Link>
          <a
            href="mailto:demo@sporthub.cv"
            className="inline-flex h-11 items-center rounded-lg border border-ink-700 px-5 font-semibold text-white transition-colors hover:bg-ink-800"
          >
            {t('home.finalCta.ghost')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/** End of home sections. */
