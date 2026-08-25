/**
 * Rankings (/rankings) — public rankings hub: category rail, filters,
 * professional table with mini OVR + weekly deltas, chart mode,
 * Talent of the Week, SponsorSlot and methodology/integrity strip.
 * Design spec: design/rankings.md.
 */
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Download,
  Flag,
  Handshake,
  Minus,
  Shield,
  Sparkles,
  Star,
  Table2,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils';
import type { Sport } from '@/data';
import { getClub } from '@/data';
import {
  ISLANDS,
  RANKING_CATEGORY_IDS,
  TALENT_OF_WEEK_ID,
  ageGroupOf,
  athleteSex,
  demoAge,
  getPublicAthlete,
  rankingFor,
  type RankingCategoryId,
  type RankingRow,
} from '@/data/extra-public';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import OvrSquare from '@/components/shared/OvrSquare';
import SponsorSlot from '@/components/shared/SponsorSlot';
import StatusBadge from '@/components/shared/StatusBadge';
import { useDemoToast } from '@/components/shared/DemoToast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type CategoryId = RankingCategoryId | 'talentOfWeek';
const CATEGORIES: CategoryId[] = [...RANKING_CATEGORY_IDS, 'talentOfWeek'];

const CATEGORY_ICONS: Record<CategoryId, typeof Trophy> = {
  topAthletes: Trophy,
  topU18: Star,
  topSeniors: Users,
  topScorers: Target,
  topAssists: Handshake,
  bestDefenders: Shield,
  talentOfWeek: Sparkles,
  mostImproved: TrendingUp,
};

const SPORTS: Sport[] = ['basketball', 'football', 'athletics'];
const AGE_GROUPS = ['u14', 'u16', 'u18', 'u21', 'senior'] as const;

function DeltaChip({ delta }: { delta: number }) {
  if (delta > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[12px] font-bold text-success tnum">
        <ArrowUp size={12} aria-hidden />
        {delta}
      </span>
    );
  if (delta < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[12px] font-bold text-danger tnum">
        <ArrowDown size={12} aria-hidden />
        {Math.abs(delta)}
      </span>
    );
  return (
    <span className="inline-flex items-center text-[12px] font-bold text-ink-600">
      <Minus size={12} aria-hidden />
    </span>
  );
}

export default function Rankings() {
  const t = useT();
  const navigate = useNavigate();
  const { toast, toastNode } = useDemoToast();

  const [category, setCategory] = useState<CategoryId>('topAthletes');
  const [fSports, setFSports] = useState<Sport[]>([]);
  const [fAges, setFAges] = useState<string[]>([]);
  const [fSex, setFSex] = useState<'all' | 'm' | 'f'>('all');
  const [fIsland, setFIsland] = useState<string>('');
  const [fSeason, setFSeason] = useState('2026/27');
  const [fCompetition, setFCompetition] = useState('');
  const [view, setView] = useState<'table' | 'chart'>('table');
  const [weeklyTick, setWeeklyTick] = useState(0);

  const totwAthlete = getPublicAthlete(TALENT_OF_WEEK_ID);
  const totwClub = totwAthlete?.clubId ? getClub(totwAthlete.clubId) : undefined;

  const rows: RankingRow[] = useMemo(() => {
    if (fSeason !== '2026/27') return [];
    let list: RankingRow[];
    if (category === 'talentOfWeek') {
      const a = totwAthlete;
      list = a
        ? [{ athleteId: a.id, rank: 1, delta: 0, ovr: a.ovr.value, statValue: a.keyStat.value, statLabel: a.keyStat.label, games: 8 }]
        : [];
    } else {
      list = rankingFor(category);
    }
    list = list.filter((r) => {
      const a = getPublicAthlete(r.athleteId);
      if (!a) return false;
      if (fSports.length && !fSports.includes(a.sport)) return false;
      if (fAges.length && !fAges.includes(ageGroupOf(a))) return false;
      if (fSex !== 'all' && athleteSex[a.id] !== fSex) return false;
      if (fIsland && a.island !== fIsland) return false;
      if (fCompetition === 'inter-liceu-2027' && a.sport !== 'basketball') return false;
      return true;
    });
    // demo "weekly update": deterministic reshuffle per tick
    if (weeklyTick > 0) {
      list = list
        .map((r) => ({ ...r, score: r.ovr + Math.sin((weeklyTick + 1) * r.rank * 3.7) * 2 }))
        .sort((a, b) => b.score - a.score)
        .map((r, i) => ({ ...r, rank: i + 1, delta: (r.delta + (weeklyTick % 3)) % 4 - 1 }));
    }
    return list.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [category, fSports, fAges, fSex, fIsland, fSeason, fCompetition, weeklyTick, totwAthlete]);

  const statHeader = rows.find((r) => r.statLabel !== '—')?.statLabel ?? 'OVR';
  const youRow = rows.find((r) => r.athleteId === 'erick-semedo');

  const toggleIn = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const chipCls = (active: boolean) =>
    cn(
      'inline-flex h-9 shrink-0 cursor-pointer items-center rounded-full border px-3.5 text-[13px] font-semibold transition-colors',
      active ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white text-ink-950 hover:border-ink-950/40',
    );

  const chartData = rows.slice(0, 10).map((r) => {
    const a = getPublicAthlete(r.athleteId);
    return { name: a?.name.split(' ')[0] ?? '', ovr: r.ovr, pot: a?.pot ?? 0, full: a?.name ?? '' };
  });
  const scatterData = rows.map((r) => {
    const a = getPublicAthlete(r.athleteId);
    return { x: r.ovr, y: a?.pot ?? 0, name: a?.name ?? '' };
  });

  return (
    <div>
      {/* Section 1 — header + Talent of the Week */}
      <section className="py-12">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:px-6 lg:px-8 xl:grid-cols-[1fr_380px]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
              {t('rankingsPage.eyebrow')}
            </p>
            <h1 className="font-display text-[32px] font-extrabold tracking-[-0.02em] text-ink-950 lg:text-[44px]">
              {t('rankingsPage.title')}
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-600">{t('rankingsPage.sub')}</p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600/70">
              {t('rankingsPage.updated')}
            </p>
          </motion.div>

          {/* TOTW dark card */}
          {totwAthlete && (
            <motion.aside
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl bg-ink-950 p-5"
            >
              <span className="absolute inset-x-0 top-0 h-[2px] bg-brand-500" aria-hidden />
              <div className="bg-glow-orange pointer-events-none absolute inset-0" aria-hidden />
              <SponsorSlot dark label="POWERED BY" placeholder="MARCA PARCEIRA — espaço de demonstração" className="relative" />
              <div className="relative mt-4 flex items-center gap-4">
                <MonogramAvatar name={totwAthlete.name} size={64} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-500">
                    {t('rankingsPage.totw.label')}
                  </p>
                  <h3 className="mt-1 font-display text-[20px] font-extrabold text-white">{totwAthlete.name}</h3>
                  <p className="text-[12px] text-white/60">
                    {t(`sports.${totwAthlete.sport}`)} · {totwAthlete.position} · {totwClub?.name ?? ''}
                  </p>
                </div>
                <OvrSquare value={totwAthlete.ovr.value} size={64} />
              </div>
              <p className="relative mt-3 text-[13px] font-medium text-white/80">{t('rankingsPage.totw.mark')}</p>
              <Link
                to={`/athletes/${totwAthlete.id}`}
                className="relative mt-4 inline-flex h-10 items-center rounded-lg bg-brand-500 px-4 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600"
              >
                {t('common.viewProfile')}
              </Link>
            </motion.aside>
          )}
        </div>
      </section>

      {/* Section 2 — category rail */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex snap-x gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat];
            const active = category === cat;
            const preview =
              cat === 'talentOfWeek'
                ? totwAthlete
                  ? [{ athleteId: totwAthlete.id, ovr: totwAthlete.ovr.value }]
                  : []
                : rankingFor(cat as RankingCategoryId).slice(0, 3);
            return (
              <motion.button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className={cn(
                  'w-[220px] shrink-0 cursor-pointer snap-start rounded-xl border p-4 text-left transition-colors duration-200',
                  active ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white hover:border-ink-950/40',
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className={active ? 'text-brand-500' : 'text-ink-600'} aria-hidden />
                  <span className={cn('text-[11px] font-bold uppercase tracking-[0.08em]', active ? 'text-white' : 'text-ink-950')}>
                    {t(`rankingsPage.categories.${cat}`)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {preview.slice(0, 3).map((r) => {
                    const a = getPublicAthlete(r.athleteId);
                    return a ? <MonogramAvatar key={r.athleteId} name={a.name} size={26} /> : null;
                  })}
                  <span className={cn('ml-auto font-display text-[15px] font-extrabold tnum', active ? 'text-brand-500' : 'text-ink-950')}>
                    {preview[0]?.ovr ?? '—'}
                  </span>
                </div>
                {active && <span className="mt-2 block h-0.5 w-8 bg-brand-500" aria-hidden />}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Section 3 — sticky filters */}
      <div className="sticky top-16 z-30 mt-6 border-y border-line bg-white py-3">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {SPORTS.map((s) => (
            <button key={s} type="button" onClick={() => setFSports(toggleIn(fSports, s))} className={chipCls(fSports.includes(s))}>
              {t(`sports.${s}`)}
            </button>
          ))}
          <span className="h-5 w-px shrink-0 bg-line" aria-hidden />
          {AGE_GROUPS.map((a) => (
            <button key={a} type="button" onClick={() => setFAges(toggleIn(fAges, a))} className={chipCls(fAges.includes(a))}>
              {t(`discover.ageGroups.${a}`)}
            </button>
          ))}
          <span className="h-5 w-px shrink-0 bg-line" aria-hidden />
          {(['all', 'm', 'f'] as const).map((sx) => (
            <button key={sx} type="button" onClick={() => setFSex(sx)} className={chipCls(fSex === sx)} aria-label={t('rankingsPage.filters.sex')}>
              {t(`rankingsPage.sex.${sx}`)}
            </button>
          ))}
          <span className="h-5 w-px shrink-0 bg-line" aria-hidden />
          <select
            value={fCompetition}
            onChange={(e) => setFCompetition(e.target.value)}
            aria-label={t('rankingsPage.filters.competition')}
            className="h-9 shrink-0 cursor-pointer rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-ink-950"
          >
            <option value="">{t('rankingsPage.filters.competition')}</option>
            <option value="inter-liceu-2027">INTER LICEU 2027</option>
          </select>
          <select
            value={fIsland}
            onChange={(e) => setFIsland(e.target.value)}
            aria-label={t('rankingsPage.filters.region')}
            className="h-9 shrink-0 cursor-pointer rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-ink-950"
          >
            <option value="">{t('rankingsPage.filters.region')}</option>
            {ISLANDS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
          <select
            value={fSeason}
            onChange={(e) => setFSeason(e.target.value)}
            aria-label={t('rankingsPage.filters.season')}
            className="h-9 shrink-0 cursor-pointer rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-ink-950"
          >
            <option value="2026/27">2026/27</option>
            <option value="2025/26">2025/26</option>
          </select>
          <div className="ml-auto flex shrink-0 items-center gap-2 pl-2">
            <button
              type="button"
              onClick={() => setWeeklyTick((v) => v + 1)}
              className="hidden h-9 cursor-pointer items-center rounded-full border border-line bg-white px-3.5 text-[13px] font-semibold text-ink-950 hover:border-ink-950 lg:inline-flex"
            >
              {t('rankingsPage.weeklyUpdate')}
            </button>
            <button
              type="button"
              onClick={() => setView(view === 'table' ? 'chart' : 'table')}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-[13px] font-semibold text-ink-950 hover:border-ink-950"
            >
              {view === 'table' ? <BarChart3 size={15} aria-hidden /> : <Table2 size={15} aria-hidden />}
              {view === 'table' ? t('rankingsPage.viewChart') : t('rankingsPage.viewTable')}
            </button>
            <button
              type="button"
              disabled
              title={t('rankingsPage.exportHint')}
              className="hidden h-9 cursor-not-allowed items-center gap-1.5 rounded-full border border-dashed border-line px-3.5 text-[13px] font-semibold text-ink-600/60 sm:inline-flex"
            >
              <Download size={15} aria-hidden />
              {t('rankingsPage.exportCsv')}
            </button>
          </div>
        </div>
      </div>

      {/* Section 4 — ranking table / charts */}
      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {view === 'table' ? (
            <motion.div
              key={`table-${category}-${weeklyTick}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-x-auto rounded-xl border border-line bg-white"
            >
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="bg-paper-50 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                    <th className="px-4 py-3">{t('rankingsPage.table.rank')}</th>
                    <th className="px-4 py-3">{t('rankingsPage.table.athlete')}</th>
                    <th className="px-4 py-3">{t('rankingsPage.table.club')}</th>
                    <th className="px-4 py-3">{t('rankingsPage.table.age')}</th>
                    <th className="px-4 py-3">{t('rankingsPage.table.pos')}</th>
                    <th className="px-4 py-3 text-right">{t('rankingsPage.table.games')}</th>
                    <th className="px-4 py-3 text-right">{statHeader}</th>
                    <th className="px-4 py-3 text-center">{t('rankingsPage.table.ovr')}</th>
                    <th className="px-4 py-3 text-right">{t('rankingsPage.table.delta')}</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {rows.map((r, i) => {
                      const a = getPublicAthlete(r.athleteId);
                      if (!a) return null;
                      const club = a.clubId ? getClub(a.clubId) : undefined;
                      const isYou = r.athleteId === 'erick-semedo';
                      return (
                        <motion.tr
                          key={r.athleteId}
                          layout
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.4) }}
                          onClick={() => navigate(`/athletes/${a.id}`)}
                          className={cn(
                            'h-14 cursor-pointer border-t border-line transition-colors hover:bg-paper-50 active:bg-brand-50',
                            isYou && 'border-l-[3px] border-l-brand-500 bg-brand-50/50',
                          )}
                        >
                          <td className="px-4 py-2">
                            {r.rank === 1 ? (
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 font-display text-[13px] font-extrabold text-white tnum">
                                1
                              </span>
                            ) : (
                              <span className="font-display text-[15px] font-extrabold text-ink-950 tnum">{r.rank}</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-3">
                              <MonogramAvatar name={a.name} size={40} />
                              <div>
                                <p className="flex items-center gap-1.5 text-[14px] font-semibold text-ink-950">
                                  {a.name}
                                  {a.verification === 'verified' && (
                                    <span title={t('badges.verifiedProfile')}>
                                      <StatusBadge variant="verifiedProfile" className="px-1.5" />
                                    </span>
                                  )}
                                  {a.statsVerified && (
                                    <span title={t('badges.verifiedStats')}>
                                      <StatusBadge variant="verifiedStats" className="px-1.5" />
                                    </span>
                                  )}
                                </p>
                                {a.boostActive && <StatusBadge variant="boost" className="mt-1" />}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-[13px] text-ink-600">{club?.name ?? '—'}</td>
                          <td className="px-4 py-2 text-[13px] text-ink-600 tnum">{demoAge(a)}</td>
                          <td className="px-4 py-2 text-[13px] text-ink-600">{a.position}</td>
                          <td className="px-4 py-2 text-right text-[13px] text-ink-950 tnum">{r.games}</td>
                          <td className="px-4 py-2 text-right font-display text-[14px] font-bold text-ink-950 tnum">
                            {r.statValue}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex justify-center">
                              <OvrSquare value={r.ovr} size={32} />
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <DeltaChip delta={r.delta} />
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
              {rows.length === 0 && (
                <p className="p-10 text-center text-[14px] text-ink-600">{t('discover.empty.title')}</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`chart-${category}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 lg:grid-cols-2"
            >
              <div className="rounded-xl border border-line bg-white p-5">
                <h3 className="mb-4 font-display text-[16px] font-bold text-ink-950">
                  {t('rankingsPage.charts.top10', { category: t(`rankingsPage.categories.${category}`) })}
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                      <CartesianGrid stroke="#E6E6E9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#3F4248' }} />
                      <YAxis domain={[0, 99]} tick={{ fontSize: 11, fill: '#3F4248' }} />
                      <RTooltip
                        formatter={(v) => [String(v), 'OVR']}
                        labelFormatter={(_, payload) => (payload?.[0]?.payload as { full?: string })?.full ?? ''}
                      />
                      <Bar dataKey="ovr" radius={[4, 4, 0, 0]}>
                        {chartData.map((d, i) => (
                          <Cell key={d.full} fill={i === 0 ? '#F97316' : '#0A0A0B'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl border border-line bg-white p-5">
                <h3 className="mb-4 font-display text-[16px] font-bold text-ink-950">{t('rankingsPage.charts.potVsOvr')}</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                      <CartesianGrid stroke="#E6E6E9" />
                      <XAxis type="number" dataKey="x" domain={[40, 90]} tick={{ fontSize: 11, fill: '#3F4248' }} name="OVR" />
                      <YAxis type="number" dataKey="y" domain={[40, 99]} tick={{ fontSize: 11, fill: '#3F4248' }} name="POT" />
                      <ReferenceLine x={70} stroke="#D4D4D8" strokeDasharray="4 4" />
                      <ReferenceLine y={80} stroke="#D4D4D8" strokeDasharray="4 4" />
                      <RTooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(v, name) => [String(v), String(name)]}
                        labelFormatter={(_, payload) => (payload?.[0]?.payload as { name?: string })?.name ?? ''}
                      />
                      <Scatter data={scatterData} fill="#F97316" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "Your position" sticky pill (demo session as athlete) */}
        {youRow && (
          <div className="sticky bottom-20 z-20 mt-4 flex justify-center md:bottom-6">
            <Link
              to="/athletes/erick-semedo"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-950 px-5 text-[13px] font-semibold text-white shadow-lg"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
              {t('rankingsPage.yourPosition', { rank: youRow.rank, delta: Math.max(youRow.delta, 0) })}
            </Link>
          </div>
        )}
      </section>

      {/* Section 5 — methodology + integrity */}
      <section className="border-t border-line bg-paper-50 py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-[24px] font-extrabold text-ink-950">
            {t('rankingsPage.methodology.title')}
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border border-line bg-white p-5"
            >
              <h3 className="font-display text-[16px] font-bold text-ink-950">{t('rankingsPage.methodology.howTitle')}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-600">{t('rankingsPage.methodology.howBody')}</p>
              <Accordion type="single" collapsible className="mt-2">
                <AccordionItem value="full" className="border-none">
                  <AccordionTrigger className="py-2 text-[13px] font-semibold text-brand-600 hover:no-underline">
                    {t('rankingsPage.methodology.howLink')}
                  </AccordionTrigger>
                  <AccordionContent className="text-[13px] leading-relaxed text-ink-600">
                    {t('rankingsPage.methodology.howMore')}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: 0.07 }}
              className="rounded-xl border border-line bg-white p-5"
            >
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-brand-500" aria-hidden />
                <h3 className="font-display text-[16px] font-bold text-ink-950">{t('rankingsPage.methodology.integrityTitle')}</h3>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-600">{t('rankingsPage.methodology.integrityBody')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="rounded-xl border border-line bg-white p-5"
            >
              <h3 className="font-display text-[16px] font-bold text-ink-950">{t('rankingsPage.methodology.fairTitle')}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-600">{t('rankingsPage.methodology.fairBody')}</p>
              <button
                type="button"
                onClick={() => toast(t('rankingsPage.methodology.reportSent'))}
                className="mt-4 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-ink-950/15 px-3.5 text-[13px] font-semibold text-ink-950 transition-colors hover:border-ink-950"
              >
                <Flag size={14} aria-hidden />
                {t('rankingsPage.methodology.report')}
              </button>
            </motion.div>
          </div>
        </div>
      </section>
      {toastNode}
    </div>
  );
}
