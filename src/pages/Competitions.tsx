/**
 * Competitions (/competitions) — directory of competitions with filters,
 * featured INTER LICEU 2027 dark banner and organizer CTA with price hint.
 * Design spec: design/competitions.md.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { BadgeCheck, Check, Plus } from 'lucide-react';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils';
import type { Competition, Sport } from '@/data';
import { getCompetition } from '@/data';
import {
  ISLANDS,
  VERIFIED_COMPETITIONS,
  publicCompetitions,
} from '@/data/extra-public';
import EmptyState from '@/components/shared/EmptyState';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import StatusBadge from '@/components/shared/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const SPORTS: Sport[] = ['basketball', 'football', 'athletics'];
const STATUSES = ['live', 'upcoming', 'finished'] as const;
const SEASONS = ['2026/27', '2027', '2025/26'];

/** Demo "today" — the platform timeline is January 2027. */
const DEMO_TODAY = new Date('2027-01-24T12:00:00');

function daysUntil(dateIso: string) {
  return Math.max(0, Math.ceil((new Date(dateIso).getTime() - DEMO_TODAY.getTime()) / 86400000));
}

/* price count-up (design: 600–900ms counters) */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return (
    <span ref={ref} className="tnum">
      {display.toLocaleString('pt-PT').replace(/,/g, '.')}
    </span>
  );
}

function StatusChip({ comp }: { comp: Competition }) {
  const t = useT();
  if (comp.status === 'live') return <StatusBadge variant="live" />;
  if (comp.status === 'upcoming')
    return (
      <span className="inline-flex items-center rounded-full border border-info/40 bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-info">
        {t('competitionsPage.startsIn', { days: daysUntil(comp.startDate) })}
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-paper-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
      {t('competitionsPage.status.finished')}
    </span>
  );
}

function CompetitionCard({ comp, index }: { comp: Competition; index: number }) {
  const t = useT();
  const verified = VERIFIED_COMPETITIONS.has(comp.id);
  const topTeams = comp.teams?.slice(0, 3) ?? [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.06 }}
    >
      <Link
        to={`/competitions/${comp.id}`}
        className="group flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-paper-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
            {t(`sports.${comp.sport}`)}
          </span>
          <StatusChip comp={comp} />
        </div>
        <h3 className="mt-3 font-display text-[18px] font-bold leading-snug text-ink-950">{comp.name}</h3>
        <p className="mt-1 text-[13px] text-ink-600">
          {comp.season} · {comp.island} · {t('competitionsPage.card.teams', { count: comp.teamsCount })}
        </p>
        <div className="mt-3 flex items-center gap-2">
          {verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-950 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white">
              <BadgeCheck size={12} className="text-brand-500" aria-hidden />
              {t('competitionsPage.verifiedBadge')}
            </span>
          )}
          {topTeams.length > 0 && (
            <span className="ml-auto flex -space-x-1.5">
              {topTeams.map((team) => (
                <MonogramAvatar key={team.id} name={team.name} size={24} className="ring-2 ring-white" />
              ))}
            </span>
          )}
        </div>
        <p className="mt-3 border-t border-line pt-3 text-[12px] text-ink-600">
          {t('competitionsPage.card.organizedBy', { org: comp.organizer })}
        </p>
      </Link>
    </motion.div>
  );
}

export default function Competitions() {
  const t = useT();
  const [fSports, setFSports] = useState<Sport[]>([]);
  const [fStatus, setFStatus] = useState<string>('');
  const [fIsland, setFIsland] = useState('');
  const [fSeason, setFSeason] = useState('');
  const [fVerified, setFVerified] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const featured = getCompetition('inter-liceu-2027');

  const filtered = publicCompetitions.filter((c) => {
    if (fSports.length && !fSports.includes(c.sport)) return false;
    if (fStatus && c.status !== fStatus) return false;
    if (fIsland && c.island !== fIsland) return false;
    if (fSeason && c.season !== fSeason) return false;
    if (fVerified && !VERIFIED_COMPETITIONS.has(c.id)) return false;
    return true;
  });

  const chipCls = (active: boolean) =>
    cn(
      'inline-flex h-9 shrink-0 cursor-pointer items-center rounded-full border px-3.5 text-[13px] font-semibold transition-colors',
      active ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white text-ink-950 hover:border-ink-950/40',
    );

  const bullets = ['b1', 'b2', 'b3', 'b4'] as const;

  return (
    <div>
      {/* Section 1 — header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b border-line bg-paper-50 py-10"
      >
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
              {t('competitionsPage.eyebrow')}
            </p>
            <h1 className="font-display text-[32px] font-extrabold tracking-[-0.02em] text-ink-950 lg:text-[44px]">
              {t('competitionsPage.title')}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-600">{t('competitionsPage.sub')}</p>
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <motion.button
                type="button"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 0.6, delay: 0.8, times: [0, 0.5, 1] }}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-brand-500 px-5 font-semibold text-white transition-colors hover:bg-brand-600 active:scale-[0.97]"
              >
                <Plus size={16} aria-hidden />
                {t('competitionsPage.createCta')}
              </motion.button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('competitionsPage.modal.title')}</DialogTitle>
                <DialogDescription>{t('competitionsPage.modal.body')}</DialogDescription>
              </DialogHeader>
              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-10 cursor-pointer rounded-lg border border-ink-950/15 px-4 text-[14px] font-semibold text-ink-950 hover:border-ink-950"
                >
                  {t('common.close')}
                </button>
                <Link
                  to="/pricing#calculator"
                  className="inline-flex h-10 items-center rounded-lg bg-brand-500 px-4 text-[14px] font-semibold text-white hover:bg-brand-600"
                >
                  {t('competitionsPage.modal.cta')}
                </Link>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.header>

      {/* Section 2 — filter bar */}
      <div className="sticky top-16 z-30 border-b border-line bg-white py-3">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {SPORTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFSports(fSports.includes(s) ? fSports.filter((x) => x !== s) : [...fSports, s])}
              className={chipCls(fSports.includes(s))}
            >
              {t(`sports.${s}`)}
            </button>
          ))}
          <span className="h-5 w-px shrink-0 bg-line" aria-hidden />
          {STATUSES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFStatus(fStatus === st ? '' : st)}
              className={chipCls(fStatus === st)}
              aria-label={t('competitionsPage.filterStatus')}
            >
              {t(`competitionsPage.status.${st}`)}
            </button>
          ))}
          <span className="h-5 w-px shrink-0 bg-line" aria-hidden />
          <select
            value={fIsland}
            onChange={(e) => setFIsland(e.target.value)}
            aria-label={t('common.island')}
            className="h-9 shrink-0 cursor-pointer rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-ink-950"
          >
            <option value="">{t('common.island')}</option>
            {ISLANDS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
          <select
            value={fSeason}
            onChange={(e) => setFSeason(e.target.value)}
            aria-label={t('common.season')}
            className="h-9 shrink-0 cursor-pointer rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-ink-950"
          >
            <option value="">{t('common.season')}</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="button" onClick={() => setFVerified(!fVerified)} className={chipCls(fVerified)}>
            <BadgeCheck size={14} aria-hidden className="mr-1" />
            {t('competitionsPage.verifiedOnly')}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        {/* Section 3 — featured INTER LICEU 2027 */}
        {featured && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-ink-950 p-6 sm:p-8"
          >
            <motion.img
              src="/video-thumb-5.jpg"
              alt=""
              aria-hidden
              initial={{ scale: 1 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
              className="absolute inset-y-0 right-0 h-full w-2/3 object-cover opacity-40 [mask-image:linear-gradient(to_left,black,transparent)]"
            />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge variant="live" />
                <span className="rounded-full border border-ink-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white/70">
                  {t('competitionsPage.featured.liveTag')}
                </span>
              </div>
              <h2 className="mt-4 font-display text-[32px] font-extrabold tracking-[-0.02em] text-white lg:text-[40px]">
                {featured.name}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-white/70">
                <span className="rounded-full border border-ink-700 px-2.5 py-1">{t(`sports.${featured.sport}`)}</span>
                <span className="rounded-full border border-ink-700 px-2.5 py-1 tnum">
                  {t('competitionsPage.featured.metaTeams', { count: featured.teamsCount })}
                </span>
                <span className="rounded-full border border-ink-700 px-2.5 py-1 tnum">
                  {t('competitionsPage.featured.metaGroups', { count: featured.groupsCount })}
                </span>
                <span className="rounded-full border border-ink-700 px-2.5 py-1">Praia, Santiago</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-white">
                  <BadgeCheck size={12} className="text-brand-500" aria-hidden />
                  {t('competitionsPage.verifiedBadge')}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-6 text-white">
                <div>
                  <p className="font-display text-[24px] font-extrabold tnum">24/45</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-white/50">
                    {t('competitionsPage.featured.gamesPlayed')}
                  </p>
                </div>
                <div>
                  <p className="font-display text-[24px] font-extrabold tnum">18</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-white/50">
                    {t('competitionsPage.featured.scouting')}
                  </p>
                </div>
                <div>
                  <p className="font-display text-[24px] font-extrabold tnum">186</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-white/50">
                    {t('competitionsPage.featured.athletes')}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/competitions/${featured.id}`}
                  className="inline-flex h-11 items-center rounded-lg bg-brand-500 px-5 font-semibold text-white transition-colors hover:bg-brand-600 active:scale-[0.97]"
                >
                  {t('competitionsPage.featured.open')}
                </Link>
                <Link
                  to="/match-scouting/demo-match"
                  className="inline-flex h-11 items-center rounded-lg border border-ink-700 px-5 font-semibold text-white transition-colors hover:bg-ink-800"
                >
                  {t('competitionsPage.featured.watchLive')}
                </Link>
              </div>
            </div>
          </motion.section>
        )}

        {/* Section 4 — grid */}
        <section className="mt-10">
          {filtered.length === 0 ? (
            <EmptyState
              useIllustration
              title={t('competitionsPage.empty.title')}
              body={t('competitionsPage.empty.body')}
              ctaLabel={t('common.clearFilters')}
              onCta={() => {
                setFSports([]);
                setFStatus('');
                setFIsland('');
                setFSeason('');
                setFVerified(false);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c, i) => (
                <CompetitionCard key={c.id} comp={c} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Section 5 — organizer value band */}
      <section className="border-t border-line bg-paper-50 py-16">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-[26px] font-extrabold tracking-[-0.015em] text-ink-950 lg:text-[32px]">
              {t('competitionsPage.organizer.title')}
            </h2>
            <ul className="mt-6 space-y-3">
              {bullets.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-center gap-3 text-[15px] font-medium text-ink-950"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100">
                    <Check size={14} className="text-brand-600" aria-hidden />
                  </span>
                  {t(`competitionsPage.organizer.${b}`)}
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
              {t('competitionsPage.organizer.priceLabel')}
            </p>
            <p className="mt-2 text-[14px] text-ink-600">{t('competitionsPage.organizer.priceBody')}</p>
            <p className="mt-3 font-display text-[40px] font-extrabold leading-none text-ink-950">
              esc <CountUp value={74500} />
              <span className="ml-2 align-middle text-[14px] font-semibold text-ink-600">
                {t('competitionsPage.organizer.priceEur')}
              </span>
            </p>
            <Link
              to="/pricing#calculator"
              className="mt-4 inline-flex text-[14px] font-semibold text-brand-600 transition-colors hover:text-brand-500"
            >
              {t('competitionsPage.organizer.cta')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
