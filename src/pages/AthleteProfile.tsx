/**
 * AthleteProfile (/athletes/:id) — flagship scouting dossier.
 * Design spec: /mnt/agents/output/design/athlete-profile.md
 * Hero (dark) + sticky tabs: Visão Geral · Estatísticas · Evolução · Vídeos ·
 * Relatórios · Histórico. All demo data is fictional.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronRight,
  CircleCheck,
  FileImage,
  Info,
  Mail,
  Plus,
  Share2,
  ShieldCheck,
  Trophy,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useI18n, useT } from '@/i18n';
import { getAthlete, getAthleteReports, getClub, useDemoSession } from '@/data';
import {
  OVR_ALGORITHM_VERSION,
  demoAge,
  getAthleteExtras,
  getAthleteVideos,
  hasGuardianProtection,
} from '@/data/extra-profiles';
import type { GameLogRow } from '@/data/extra-profiles';
import type { VerificationStatus } from '@/data/types';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import OvrSquare, { PotChip } from '@/components/shared/OvrSquare';
import StatusBadge from '@/components/shared/StatusBadge';
import StatTile from '@/components/shared/StatTile';
import TabsUnderline from '@/components/shared/TabsUnderline';
import EmptyState from '@/components/shared/EmptyState';
import SponsorSlot from '@/components/shared/SponsorSlot';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDemoToast } from '@/components/profiles/DemoToast';
import { VideoGallery } from '@/components/profiles/VideoComponents';
import { EvaluationBars, ScoutReportCard } from '@/components/profiles/ReportComponents';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const TAB_IDS = ['overview', 'stats', 'evolution', 'videos', 'reports', 'history'] as const;
type TabId = (typeof TAB_IDS)[number];

function verifBadge(v: VerificationStatus) {
  if (v === 'verified') return <CircleCheck size={14} className="text-success" aria-label="verified" />;
  if (v === 'selfReported') return <StatusBadge variant="selfReported" />;
  if (v === 'pending') return <StatusBadge variant="pending" />;
  return <StatusBadge variant="rejected" />;
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero({
  athlete,
  onContact,
  onFollow,
  following,
  onShare,
  onConfidence,
}: {
  athlete: NonNullable<ReturnType<typeof getAthlete>>;
  onContact: () => void;
  onFollow: () => void;
  following: boolean;
  onShare: () => void;
  onConfidence: () => void;
}) {
  const t = useT();
  const club = athlete.clubId ? getClub(athlete.clubId) : undefined;
  const minor = hasGuardianProtection(athlete);

  // OVR count-up 0 -> value over 1s (design.md athlete-profile sec. 1)
  const [ovrShown, setOvrShown] = useState(0);
  useEffect(() => {
    setOvrShown(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1000);
      setOvrShown(Math.round(athlete.ovr.value * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [athlete.ovr.value]);

  const meta = [
    t(`sports.${athlete.sport}`),
    athlete.position,
    t('athleteProfile.hero.ageYears', { age: demoAge(athlete) }),
    t('athleteProfile.hero.country'),
    `${athlete.city}, ${athlete.island}`,
    club?.name ?? '',
  ].filter(Boolean);

  return (
    <section className="bg-ink-gradient bg-glow-orange text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-8 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50">
          <Link to="/discover" className="transition-colors hover:text-white">{t('nav.discover')}</Link>
          <ChevronRight size={12} aria-hidden />
          <Link to="/discover" className="transition-colors hover:text-white">{t('nav.athletes')}</Link>
          <ChevronRight size={12} aria-hidden />
          <span className="text-white/80">{athlete.name}</span>
        </nav>

        <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr_auto]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease }}
          >
            <MonogramAvatar name={athlete.name} size={160} className="rounded-xl" />
          </motion.div>

          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.08 }}
              className="font-display text-[32px] font-extrabold uppercase leading-[1.1] tracking-[-0.02em] lg:text-[44px]"
            >
              {athlete.name}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.4 }}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              {athlete.verification === 'verified' && <StatusBadge variant="verifiedProfile" />}
              {athlete.statsVerified && <StatusBadge variant="verifiedStats" />}
              {minor && (
                <span className="inline-flex items-center gap-1 rounded-full border border-info/40 bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-info">
                  <ShieldCheck size={12} aria-hidden />
                  {t('athleteProfile.hero.managedChip')}
                </span>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.2 }}
              className="mt-4 flex flex-wrap gap-1.5"
            >
              {meta.map((m) => (
                <span key={m} className="rounded-full bg-ink-800 px-3 py-1 text-[12px] font-medium text-white/80">
                  {m}
                </span>
              ))}
            </motion.div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onFollow}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-ink-700 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-ink-800 cursor-pointer"
              >
                {following ? <UserCheck size={16} aria-hidden /> : <UserPlus size={16} aria-hidden />}
                {following ? t('athleteProfile.hero.following') : t('athleteProfile.hero.follow')}
              </button>
              <button
                type="button"
                onClick={onContact}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-[14px] font-semibold text-white transition-all hover:bg-brand-600 active:scale-[0.97] cursor-pointer"
              >
                <Mail size={16} aria-hidden />
                {t('athleteProfile.hero.contact')}
              </button>
              <button
                type="button"
                onClick={onShare}
                aria-label={t('athleteProfile.hero.share')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-ink-800 hover:text-white cursor-pointer"
              >
                <Share2 size={18} aria-hidden />
              </button>
            </div>
          </div>

          {/* OVR cluster */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.25 }}
            className="flex items-center gap-4 lg:flex-col lg:items-end"
          >
            <OvrSquare value={ovrShown} size={96} variant="white-on-dark" />
            <PotChip value={athlete.pot} />
            <button
              type="button"
              onClick={onConfidence}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/60 transition-colors hover:text-white cursor-pointer"
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  athlete.ovr.confidence === 'high' && 'bg-success',
                  athlete.ovr.confidence === 'medium' && 'bg-warning',
                  athlete.ovr.confidence === 'low' && 'bg-danger',
                )}
                aria-hidden
              />
              {t('common.dataConfidence')}: {t(`common.confidence.${athlete.ovr.confidence}`)}
              <Info size={12} aria-hidden />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Visão Geral                                                    */
/* ------------------------------------------------------------------ */

function OverviewTab({ athleteId, onOpenReports }: { athleteId: string; onOpenReports: () => void }) {
  const t = useT();
  const { locale, formatDate } = useI18n();
  const athlete = getAthlete(athleteId)!;
  const extras = getAthleteExtras(athlete);
  const club = athlete.clubId ? getClub(athlete.clubId) : undefined;
  const topReport = getAthleteReports(athleteId)[0];

  const infoRows: [string, string][] = [
    [t('athleteProfile.info.fullName'), athlete.name],
    [t('athleteProfile.info.birthDate'), formatDate(extras.birthDate)],
    [t('athleteProfile.info.nationality'), t('athleteProfile.hero.country')],
    [t('athleteProfile.info.location'), `${athlete.city}, ${athlete.island}`],
  ];
  if (athlete.heightCm) {
    infoRows.push([t('athleteProfile.info.height'), `${(athlete.heightCm / 100).toFixed(2).replace('.', ',')} m`]);
  }
  if (extras.weightKg) {
    infoRows.push([t('athleteProfile.info.weight'), `${extras.weightKg} kg`]);
  }
  infoRows.push(
    [t('athleteProfile.info.position'), athlete.position],
    [t('athleteProfile.info.dominantHand'), t(`athleteProfile.info.${extras.dominantHand}`)],
    [t('athleteProfile.info.currentClub'), club?.name ?? '—'],
    [t('athleteProfile.info.previousClubs'), extras.previousClubs],
    [t('athleteProfile.info.titles'), String(extras.titles)],
    [t('athleteProfile.info.awards'), extras.award],
  );

  return (
    <div className="grid gap-6 py-10 lg:grid-cols-[2fr_1fr]">
      {/* Left column */}
      <div className="space-y-6">
        {/* Attributes */}
        <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
          <h2 className="font-display text-xl font-bold text-ink-950">{t('athleteProfile.overview.attributesTitle')}</h2>
          <div className="mt-5 space-y-3.5">
            {extras.attributes.map((attr, i) => (
              <div key={attr.key} className="flex items-center gap-3" title={t('athleteProfile.overview.attributesHint')}>
                <span className="w-36 shrink-0 text-[13px] font-medium text-ink-600">
                  {t(`athleteProfile.attr.${attr.key}`)}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper-100">
                  <motion.span
                    initial={{ width: 0 }}
                    whileInView={{ width: `${attr.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.06, ease }}
                    className="block h-full rounded-full bg-gradient-to-r from-ink-950 via-ink-950 to-brand-500"
                  />
                </span>
                <span className="w-8 text-right font-display text-[15px] font-extrabold text-ink-950 tnum">
                  {attr.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Season summary */}
        <section>
          <h2 className="mb-4 font-display text-xl font-bold text-ink-950">{t('athleteProfile.overview.seasonTitle')}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {extras.seasonSummary.map((s) => (
              <StatTile
                key={s.label}
                label={s.label}
                value={s.value}
                delta={s.delta}
                deltaLabel={s.delta !== undefined ? t('athleteProfile.overview.vsLastSeason') : undefined}
              />
            ))}
          </div>
        </section>

        {/* Latest games */}
        <section className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(10,10,11,.05)]">
          <h2 className="border-b border-line px-5 py-4 font-display text-xl font-bold text-ink-950">
            {t('athleteProfile.overview.lastGames')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[13px]">
              <thead>
                <tr className="bg-paper-50 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                  <th className="px-5 py-2.5">{t('athleteProfile.stats.colDate')}</th>
                  <th className="px-3 py-2.5">{t('athleteProfile.stats.colOpponent')}</th>
                  <th className="px-3 py-2.5">{t('athleteProfile.stats.colResult')}</th>
                  {extras.statColumns.slice(1, 4).map((c) => (
                    <th key={c} className="px-3 py-2.5 uppercase">{c}</th>
                  ))}
                  <th className="px-5 py-2.5" aria-label="verification" />
                </tr>
              </thead>
              <tbody>
                {extras.gameLog.slice(0, 5).map((g, i) => (
                  <motion.tr
                    key={g.id}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.04, ease }}
                    className="border-t border-line hover:bg-paper-50"
                  >
                    <td className="px-5 py-3 text-ink-600 tnum">{formatDate(g.date, { day: 'numeric', month: 'short' })}</td>
                    <td className="px-3 py-3 font-medium text-ink-950">{g.opponent}</td>
                    <td className={cn('px-3 py-3 font-bold tnum', g.result === 'W' ? 'text-success' : g.result === 'L' ? 'text-danger' : 'text-ink-600')}>
                      {g.result === 'W' ? 'V' : g.result === 'L' ? 'D' : '—'}
                    </td>
                    {extras.statColumns.slice(1, 4).map((c) => (
                      <td key={c} className="px-3 py-3 tnum text-ink-950">{g.stats[c] ?? '—'}</td>
                    ))}
                    <td className="px-5 py-3">{verifBadge(g.verification)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
          <h2 className="font-display text-xl font-bold text-ink-950">{t('athleteProfile.overview.infoTitle')}</h2>
          <dl className="mt-4 divide-y divide-line">
            {infoRows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[12px] font-medium text-ink-600">{k}</dt>
                <dd className="text-right text-[13px] font-semibold text-ink-950">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Scout evaluation (dark card) */}
        <section className="rounded-xl bg-ink-gradient p-5 text-white">
          <h2 className="font-display text-xl font-bold">{t('athleteProfile.overview.scoutEvalTitle')}</h2>
          <div className="mt-4">
            <EvaluationBars
              dark
              scores={{
                technical: extras.scoutEval.technical,
                decision: extras.scoutEval.decision,
                defense: extras.scoutEval.defense,
                athleticism: extras.scoutEval.athleticism,
                potential: extras.scoutEval.potential,
              }}
            />
          </div>
          {topReport && (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink-700 pt-4">
              <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                {t(`athleteProfile.recommendation.${topReport.recommendation === 'sign' ? 'highPotential' : topReport.recommendation}`)}
              </span>
              <button
                type="button"
                onClick={onOpenReports}
                className="text-[13px] font-semibold text-brand-500 transition-colors hover:text-brand-100 cursor-pointer"
              >
                {t('athleteProfile.overview.readFullReport')} →
              </button>
            </div>
          )}
        </section>

        <SponsorSlot
          label={locale === 'en' ? 'POWERED BY' : 'PATROCINADO POR'}
          placeholder="MARCA PARCEIRA — espaço de demonstração"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Estatísticas                                                   */
/* ------------------------------------------------------------------ */

type ViewMode = 'perGame' | 'totals' | 'per36';

function transformCell(value: string, mode: ViewMode, min: number): string {
  if (mode === 'perGame' || value.includes('%') || value === '—') return value;
  const n = parseFloat(value);
  if (Number.isNaN(n)) return value;
  if (mode === 'totals') return String(Math.round(n * 24));
  // per 36 minutes
  return min > 0 ? ((n * 36) / min).toFixed(1) : value;
}

function StatsTab({
  athleteId,
  onToast,
  isOwnProfile,
}: {
  athleteId: string;
  onToast: (msg: string) => void;
  isOwnProfile: boolean;
}) {
  const t = useT();
  const { formatDate } = useI18n();
  const athlete = getAthlete(athleteId)!;
  const extras = getAthleteExtras(athlete);
  const [view, setView] = useState<ViewMode>('perGame');
  const [competition, setCompetition] = useState<string>('all');
  const [drawerGame, setDrawerGame] = useState<GameLogRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const competitions = useMemo(
    () => Array.from(new Set(extras.gameLog.map((g) => g.competition))),
    [extras],
  );
  const rows = competition === 'all' ? extras.gameLog : extras.gameLog.filter((g) => g.competition === competition);

  const handleAddSubmit = () => {
    setAddOpen(false);
    onToast(t('athleteProfile.stats.toastSelf'));
    window.setTimeout(() => onToast(t('athleteProfile.stats.toastPending')), 1500);
  };

  return (
    <div className="py-10">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-950">
          {t('athleteProfile.stats.season')}
          <select className="h-9 rounded-lg border border-line bg-white px-2 text-[13px] font-medium" defaultValue="2026/27">
            <option value="2026/27">2026/27</option>
            <option value="2025/26">2025/26</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('athleteProfile.stats.competition')}>
          {['all', ...competitions].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCompetition(c)}
              className={cn(
                'h-9 rounded-full border px-3.5 text-[12px] font-semibold transition-colors cursor-pointer',
                competition === c ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white text-ink-600 hover:border-ink-950',
              )}
            >
              {c === 'all' ? t('athleteProfile.stats.allCompetitions') : c}
            </button>
          ))}
        </div>
        <div className="ml-auto flex rounded-lg border border-line bg-white p-0.5" role="group" aria-label="view mode">
          {(['perGame', 'totals', 'per36'] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setView(m)}
              className={cn(
                'h-8 rounded-md px-3 text-[12px] font-semibold transition-colors cursor-pointer',
                view === m ? 'bg-ink-950 text-white' : 'text-ink-600 hover:text-ink-950',
              )}
            >
              {t(`athleteProfile.stats.${m}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Source banner */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-info/30 bg-blue-50/60 p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-info" aria-hidden />
        <div>
          <p className="text-[13px] font-medium text-ink-950">{t('athleteProfile.stats.sourceBanner')}</p>
          <div className="mt-2 flex flex-wrap gap-2" aria-label={t('athleteProfile.stats.legendTitle')}>
            <StatusBadge variant="verifiedStats" />
            <StatusBadge variant="selfReported" />
            <StatusBadge variant="pending" />
            <StatusBadge variant="rejected" />
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-[14px] font-semibold text-white transition-all hover:bg-brand-600 active:scale-[0.97] cursor-pointer"
          >
            <Plus size={16} aria-hidden />
            {t('athleteProfile.stats.addStat')}
          </button>
        </div>
      )}

      {/* Main table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(10,10,11,.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[13px]">
            <thead className="sticky top-0">
              <tr className="bg-paper-50 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                <th className="px-4 py-3">{t('athleteProfile.stats.colDate')}</th>
                <th className="px-3 py-3">{t('athleteProfile.stats.colOpponent')}</th>
                {extras.statColumns.map((c) => (
                  <th key={c} className="px-3 py-3 uppercase">{c}</th>
                ))}
                <th className="px-4 py-3" aria-label="verification" />
              </tr>
            </thead>
            <tbody>
              {rows.map((g, i) => {
                const min = parseFloat(g.stats.min ?? '0') || 0;
                return (
                  <motion.tr
                    key={g.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    onClick={() => setDrawerGame(g)}
                    className={cn(
                      'cursor-pointer border-t border-line transition-colors hover:bg-paper-50',
                      i % 2 === 1 && 'bg-paper-50/50',
                    )}
                  >
                    <td className="px-4 py-3 text-ink-600 tnum">{formatDate(g.date, { day: 'numeric', month: 'short' })}</td>
                    <td className="px-3 py-3 font-medium text-ink-950">
                      {g.opponent}
                      <span className="ml-2 text-[11px] text-ink-600/60">{g.competition}</span>
                    </td>
                    {extras.statColumns.map((c) => (
                      <td key={c} className="px-3 py-3 tnum text-ink-950">
                        {transformCell(g.stats[c] ?? '—', view, min)}
                      </td>
                    ))}
                    <td className="px-4 py-3">{verifBadge(g.verification)}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
          <h3 className="font-display text-lg font-bold text-ink-950">{t('athleteProfile.stats.chartPts')}</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={extras.perfSeries} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="#E6E6E9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                <RTooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E6E6E9', fontSize: 12 }}
                  formatter={(value) => [String(value), 'PTS']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0A0A0B"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload, index } = props as { cx: number; cy: number; payload: { verified: boolean }; index: number };
                    return (
                      <circle
                        key={index}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={payload.verified ? '#F97316' : '#fff'}
                        stroke={payload.verified ? '#F97316' : '#9CA3AF'}
                        strokeWidth={2}
                      />
                    );
                  }}
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-600">
            <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden /> {t('athleteProfile.stats.chartPtsVerified')}
          </p>
        </section>

        <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
          <h3 className="font-display text-lg font-bold text-ink-950">{t('athleteProfile.stats.chartSplits')}</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={extras.splits} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="#E6E6E9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #E6E6E9', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="athlete" name={t('athleteProfile.stats.athlete')} fill="#F97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="average" name={t('athleteProfile.stats.positionAvg')} fill="#D4D4D8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Evidence drawer */}
      <Sheet open={drawerGame != null} onOpenChange={(o) => !o && setDrawerGame(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[420px]">
          {drawerGame && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">{t('athleteProfile.stats.drawerTitle')}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-5 px-4 pb-6">
                <div>
                  <p className="font-display text-lg font-bold text-ink-950">{drawerGame.opponent}</p>
                  <p className="text-[13px] text-ink-600 tnum">
                    {formatDate(drawerGame.date)} · {drawerGame.competition}
                    {drawerGame.score ? ` · ${drawerGame.score}` : ''}
                  </p>
                  <div className="mt-2">{verifBadge(drawerGame.verification)}</div>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-600">
                    {t('athleteProfile.stats.evidenceTitle')}
                  </p>
                  <div className="mt-2 flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-paper-50 text-ink-600">
                    <FileImage size={24} strokeWidth={1.5} aria-hidden />
                    <span className="text-[12px]">{t('athleteProfile.stats.evidencePlaceholder')}</span>
                  </div>
                  <p className="mt-2 text-[12px] text-ink-600">{drawerGame.evidenceLabel}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-600">
                    {t('athleteProfile.stats.timelineTitle')}
                  </p>
                  <ol className="mt-3 space-y-0">
                    {[
                      { label: t('athleteProfile.stats.stepSubmitted'), at: '2027-01-25 09:14' },
                      { label: t('athleteProfile.stats.stepInReview'), at: '2027-01-25 14:02' },
                      { label: t('athleteProfile.stats.stepApproved'), at: '2027-01-26 10:41' },
                    ].map((step, i) => {
                      const done =
                        drawerGame.verification === 'verified' ||
                        (drawerGame.verification === 'pending' && i < 2) ||
                        i === 0;
                      const last = i === 2;
                      return (
                        <li key={step.label} className="relative flex gap-3 pb-5">
                          {!last && <span className="absolute left-[7px] top-5 h-full w-px bg-line" aria-hidden />}
                          <span
                            className={cn(
                              'mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                              done ? 'bg-success' : 'border border-line bg-white',
                            )}
                          >
                            {done && <Check size={10} className="text-white" aria-hidden />}
                          </span>
                          <div>
                            <p className={cn('text-[13px] font-semibold', done ? 'text-ink-950' : 'text-ink-600/50')}>
                              {step.label}
                            </p>
                            {done && <p className="text-[11px] text-ink-600 tnum">{step.at}</p>}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add statistic modal (demo session: viewing as the athlete) */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{t('athleteProfile.stats.addStatTitle')}</DialogTitle>
            <DialogDescription>{t('common.demoTooltip')}</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleAddSubmit();
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <label className="text-[12px] font-semibold text-ink-950">
                {t('athleteProfile.stats.addCompetition')}
                <input required className="mt-1 h-10 w-full rounded-lg border border-line px-3 text-[13px] font-normal" defaultValue="INTER LICEU 2027" />
              </label>
              <label className="text-[12px] font-semibold text-ink-950">
                {t('athleteProfile.stats.addDate')}
                <input required type="date" className="mt-1 h-10 w-full rounded-lg border border-line px-3 text-[13px] font-normal" defaultValue="2027-02-01" />
              </label>
              <label className="text-[12px] font-semibold text-ink-950">
                {t('athleteProfile.stats.addOpponent')}
                <input required className="mt-1 h-10 w-full rounded-lg border border-line px-3 text-[13px] font-normal" />
              </label>
              <label className="text-[12px] font-semibold text-ink-950">
                {t('athleteProfile.stats.addPoints')}
                <input required type="number" min={0} className="mt-1 h-10 w-full rounded-lg border border-line px-3 text-[13px] font-normal" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-[13px] font-medium text-ink-950">
              <input type="checkbox" checked readOnly className="h-4 w-4 accent-brand-500" />
              {t('athleteProfile.stats.addSelfReported')}
            </label>
            <div className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-paper-50 text-ink-600">
              <FileImage size={20} strokeWidth={1.5} aria-hidden />
              <span className="text-[12px]">{t('athleteProfile.stats.evidenceDrop')}</span>
            </div>
            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-brand-500 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600 cursor-pointer"
            >
              {t('athleteProfile.stats.submit')}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Evolução                                                       */
/* ------------------------------------------------------------------ */

function EvolutionTab({ athleteId }: { athleteId: string }) {
  const t = useT();
  const { locale, formatDate } = useI18n();
  const athlete = getAthlete(athleteId)!;
  const extras = getAthleteExtras(athlete);
  const reports = getAthleteReports(athleteId);
  const [selected, setSelected] = useState(extras.evolution.length - 2);

  // Split actual vs projection so the projection renders dashed.
  const chartData = extras.evolution.map((p, i) => ({
    label: formatDate(p.date, { month: 'short', year: 'numeric' }),
    value: p.projected ? null : p.value,
    proj: p.projected || i === extras.evolution.length - 2 ? p.value : null,
  }));
  const snap = extras.evolution[selected];

  return (
    <div className="space-y-6 py-10">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
          <h3 className="font-display text-lg font-bold text-ink-950">{t('athleteProfile.evolution.ovrTitle')}</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="#E6E6E9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 90]} tick={{ fontSize: 11, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #E6E6E9', fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0A0A0B"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0A0A0B' }}
                  activeDot={{
                    r: 6,
                    fill: '#F97316',
                    onClick: (_e: unknown, payload: unknown) => {
                      const idx = (payload as { index?: number })?.index;
                      if (typeof idx === 'number') setSelected(idx);
                    },
                  }}
                  animationDuration={1200}
                />
                <Line
                  type="monotone"
                  dataKey="proj"
                  stroke="#F97316"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={{ r: 4, fill: '#F97316' }}
                  activeDot={{
                    r: 6,
                    fill: '#F97316',
                    onClick: (_e: unknown, payload: unknown) => {
                      const idx = (payload as { index?: number })?.index;
                      if (typeof idx === 'number') setSelected(idx);
                    },
                  }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 flex items-center gap-4 text-[11px] text-ink-600">
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-ink-950" aria-hidden /> OVR</span>
            <span className="flex items-center gap-1.5">
              <span className="h-0 w-5 border-t-2 border-dashed border-brand-500" aria-hidden /> {t('athleteProfile.evolution.projection')}
            </span>
          </p>
        </section>

        {/* Snapshot detail card */}
        <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
          <h3 className="font-display text-lg font-bold text-ink-950">{t('athleteProfile.evolution.snapshotTitle')}</h3>
          <dl className="mt-4 divide-y divide-line text-[13px]">
            <div className="flex justify-between py-2.5">
              <dt className="text-ink-600">{t('athleteProfile.evolution.date')}</dt>
              <dd className="font-semibold text-ink-950 tnum">{formatDate(snap.date, { month: 'long', year: 'numeric' })}</dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-ink-600">{t('athleteProfile.evolution.value')}</dt>
              <dd className="flex items-center gap-2 font-display text-xl font-extrabold text-ink-950 tnum">
                {snap.value}
                {snap.projected && (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-600">
                    {t('athleteProfile.evolution.projection')}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-ink-600">{t('athleteProfile.evolution.algoLabel')}</dt>
              <dd className="font-mono text-[12px] font-semibold text-ink-950">{OVR_ALGORITHM_VERSION}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-ink-600">{t('athleteProfile.evolution.confidence')}</dt>
              <dd className="font-semibold text-ink-950">
                {t(`common.confidence.${snap.projected ? 'medium' : athlete.ovr.confidence}`)}
              </dd>
            </div>
            <div className="py-2.5">
              <dt className="text-ink-600">{t('athleteProfile.evolution.inputs')}</dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {athlete.ovr.inputs.map((input) => (
                  <span key={input} className="rounded-full bg-paper-100 px-2 py-0.5 text-[11px] font-semibold text-ink-600">
                    {input === 'verifiedMatches'
                      ? t('athleteProfile.confidenceModal.inputVerifiedMatches')
                      : input === 'evidence'
                        ? t('athleteProfile.confidenceModal.inputEvidence')
                        : t('athleteProfile.confidenceModal.inputScoutReports')}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attribute comparison 2026 vs 2027 */}
        <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
          <h3 className="font-display text-lg font-bold text-ink-950">{t('athleteProfile.evolution.attrCompare')}</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={extras.attributes.map((a) => ({
                  label: t(`athleteProfile.attr.${a.key}`),
                  y2026: a.prev,
                  y2027: a.value,
                }))}
                margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
              >
                <CartesianGrid stroke="#E6E6E9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#3F4248' }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={48} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #E6E6E9', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="y2026" name="2026" fill="#D4D4D8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="y2027" name="2027" fill="#F97316" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="space-y-6">
          {/* Ranking evolution */}
          <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
            <h3 className="font-display text-lg font-bold text-ink-950">{t('athleteProfile.evolution.rankTitle')}</h3>
            <p className="text-[12px] text-ink-600">{t('athleteProfile.evolution.rankLabel')}</p>
            <div className="mt-2 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={extras.rankHistory} margin={{ top: 8, right: 12, bottom: 0, left: -24 }}>
                  <CartesianGrid stroke="#E6E6E9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                  <YAxis reversed domain={[1, 'dataMax + 1']} allowDecimals={false} tick={{ fontSize: 11, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                  <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #E6E6E9', fontSize: 12 }} />
                  <Line type="monotone" dataKey="rank" stroke="#F97316" strokeWidth={2.5} dot={{ r: 4, fill: '#F97316' }} animationDuration={900} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Scout evals over time */}
          <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
            <h3 className="font-display text-lg font-bold text-ink-950">{t('athleteProfile.evolution.evalsTitle')}</h3>
            <div className="mt-3 space-y-2">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3.5 py-2.5">
                  <div>
                    <p className="text-[13px] font-semibold text-ink-950">{r.grade} · {t(`athleteProfile.recommendation.${r.recommendation === 'sign' ? 'highPotential' : r.recommendation}`)}</p>
                    <p className="text-[11px] text-ink-600 tnum">{formatDate(r.date)}</p>
                  </div>
                  <span className="font-display text-xl font-extrabold text-brand-500 tnum">
                    {extras.scoutEval.potential.toFixed(1)}
                  </span>
                </div>
              ))}
              {reports.length === 0 && <p className="text-[13px] text-ink-600">{t('common.demoData')}</p>}
            </div>
          </section>
        </div>
      </div>

      {/* Titles & awards */}
      <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
        <h3 className="font-display text-lg font-bold text-ink-950">{t('athleteProfile.evolution.titlesTitle')}</h3>
        <ul className="mt-3 divide-y divide-line">
          {extras.career.map((c) => (
            <li key={c.date + c.textPt} className="flex items-center gap-3 py-2.5">
              <Trophy size={15} className="shrink-0 text-brand-500" aria-hidden />
              <span className="text-[13px] font-medium text-ink-950">{locale === 'en' ? c.textEn : c.textPt}</span>
              <span className="ml-auto text-[12px] text-ink-600 tnum">{c.date}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Vídeos                                                         */
/* ------------------------------------------------------------------ */

function VideosTab({ athleteId }: { athleteId: string }) {
  const t = useT();
  const athlete = getAthlete(athleteId)!;
  const vids = getAthleteVideos(athleteId);
  const highlights = vids.filter((v) => v.kind === 'highlight');
  const fullGames = vids.filter((v) => v.kind === 'fullGame');
  const scoutClips = vids.filter((v) => v.kind === 'scoutClip');
  const minor = hasGuardianProtection(athlete);

  const Section = ({ title, items }: { title: string; items: typeof vids }) => (
    <section>
      <h3 className="mb-4 font-display text-lg font-bold text-ink-950">{title}</h3>
      {items.length === 0 ? (
        <EmptyState title={t('athleteProfile.videos.emptyTitle')} body={t('athleteProfile.videos.emptyBody')} />
      ) : (
        <>
          <VideoGallery items={items} />
          {minor && items.some((v) => v.visibility !== 'public') && (
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-600">
              <ShieldCheck size={13} className="text-info" aria-hidden />
              {t('athleteProfile.videos.privateNote')}
            </p>
          )}
        </>
      )}
    </section>
  );

  return (
    <div className="space-y-10 py-10">
      <Section title={t('athleteProfile.videos.highlights')} items={highlights} />
      <Section title={t('athleteProfile.videos.fullGames')} items={fullGames} />
      <Section title={t('athleteProfile.videos.scoutClips')} items={scoutClips} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs: Relatórios / Histórico                                        */
/* ------------------------------------------------------------------ */

function ReportsTab({ athleteId }: { athleteId: string }) {
  const t = useT();
  const reports = getAthleteReports(athleteId);
  return (
    <div className="py-10">
      <p className="mb-6 flex items-center gap-2 text-[13px] text-ink-600">
        <Info size={14} className="text-info" aria-hidden />
        {t('athleteProfile.reports.visibilityNote')}
      </p>
      {reports.length === 0 ? (
        <EmptyState title={t('athleteProfile.reports.title')} body={t('common.demoData')} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {reports.map((r) => (
            <ScoutReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryTab({ athleteId }: { athleteId: string }) {
  const { locale } = useI18n();
  const athlete = getAthlete(athleteId)!;
  const extras = getAthleteExtras(athlete);
  return (
    <div className="py-10">
      <ol className="relative ml-2 space-y-6 border-l border-line pl-6">
        {extras.career.map((c, i) => (
          <motion.li
            key={c.date + c.textPt}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07, ease }}
            className="relative"
          >
            <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-50" aria-hidden />
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-600 tnum">{c.date}</p>
            <p className="mt-0.5 text-[14px] font-medium text-ink-950">{locale === 'en' ? c.textEn : c.textPt}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AthleteProfile() {
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const { toast, show } = useDemoToast();
  const { role } = useDemoSession();
  const athlete = id ? getAthlete(id) : undefined;

  const [tab, setTab] = useState<TabId>('overview');
  const [following, setFollowing] = useState(false);
  const [confidenceOpen, setConfidenceOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  if (!athlete) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          useIllustration
          title={t('athleteProfile.notFoundTitle')}
          body={t('athleteProfile.notFoundBody')}
          ctaLabel={t('athleteProfile.notFoundCta')}
          onCta={() => {
            window.location.href = '/discover';
          }}
        />
      </div>
    );
  }

  const extras = getAthleteExtras(athlete);
  const minor = hasGuardianProtection(athlete);
  const isOwnProfile = role === 'athlete' && athlete.id === 'erick-semedo';
  const verifiedCount = extras.gameLog.filter((g) => g.verification === 'verified').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
    >
      <Hero
        athlete={athlete}
        following={following}
        onFollow={() => {
          setFollowing((f) => !f);
          show(t('athleteProfile.hero.followDone'));
        }}
        onShare={() => show(t('athleteProfile.hero.shareDone'))}
        onContact={() => setContactOpen(true)}
        onConfidence={() => setConfidenceOpen(true)}
      />

      {/* Sticky tab bar */}
      <div className="sticky top-16 z-30 border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TabsUnderline
            id="athlete-profile"
            tabs={TAB_IDS.map((tabId) => ({ id: tabId, label: t(`athleteProfile.tabs.${tabId}`) }))}
            active={tab}
            onChange={(id) => setTab(id as TabId)}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'overview' && <OverviewTab athleteId={athlete.id} onOpenReports={() => setTab('reports')} />}
            {tab === 'stats' && <StatsTab athleteId={athlete.id} onToast={show} isOwnProfile={isOwnProfile} />}
            {tab === 'evolution' && <EvolutionTab athleteId={athlete.id} />}
            {tab === 'videos' && <VideosTab athleteId={athlete.id} />}
            {tab === 'reports' && <ReportsTab athleteId={athlete.id} />}
            {tab === 'history' && <HistoryTab athleteId={athlete.id} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed bottom-[57px] left-0 right-0 z-30 flex gap-2 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => {
            setFollowing((f) => !f);
            show(t('athleteProfile.hero.followDone'));
          }}
          className="h-11 flex-1 rounded-lg border border-ink-950/15 text-[14px] font-semibold text-ink-950 cursor-pointer"
        >
          {following ? t('athleteProfile.hero.following') : t('athleteProfile.hero.follow')}
        </button>
        <button
          type="button"
          onClick={() => setContactOpen(true)}
          className="h-11 flex-1 rounded-lg bg-brand-500 text-[14px] font-semibold text-white cursor-pointer"
        >
          {t('athleteProfile.hero.contact')}
        </button>
      </div>

      {/* Data confidence transparency modal */}
      <Dialog open={confidenceOpen} onOpenChange={setConfidenceOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{t('athleteProfile.confidenceModal.title')}</DialogTitle>
            <DialogDescription>{t('athleteProfile.confidenceModal.body')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-[13px]">
            <div className="flex items-center justify-between rounded-lg bg-paper-50 px-3.5 py-2.5">
              <span className="font-medium text-ink-600">{t('athleteProfile.confidenceModal.algoLabel')}</span>
              <span className="font-mono text-[12px] font-bold text-ink-950">{athlete.ovr.algorithmVersion}</span>
            </div>
            <div>
              <p className="font-medium text-ink-600">{t('athleteProfile.confidenceModal.inputsLabel')}</p>
              <ul className="mt-2 space-y-1.5">
                {athlete.ovr.inputs.map((input) => (
                  <li key={input} className="flex items-center gap-2 text-ink-950">
                    <Check size={14} className="text-success" aria-hidden />
                    {input === 'verifiedMatches'
                      ? t('athleteProfile.confidenceModal.inputVerifiedMatches')
                      : input === 'evidence'
                        ? t('athleteProfile.confidenceModal.inputEvidence')
                        : t('athleteProfile.confidenceModal.inputScoutReports')}
                  </li>
                ))}
              </ul>
            </div>
            <p className="rounded-lg border border-line bg-white px-3.5 py-2.5 text-ink-600">
              {t('athleteProfile.confidenceModal.basedOn', {
                matches: athlete.statsVerified ? 14 : verifiedCount,
                evidence: athlete.statsVerified ? 6 : Math.max(1, verifiedCount),
                reports: getAthleteReports(athlete.id).length,
              })}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact modal (minors protection aware) */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{t('athleteProfile.contact.title')}</DialogTitle>
            <DialogDescription>{t('athleteProfile.contact.body')}</DialogDescription>
          </DialogHeader>
          {minor && (
            <p className="flex items-start gap-2 rounded-lg border border-info/40 bg-blue-50 p-3 text-[13px] font-medium text-info">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden />
              {t('athleteProfile.contact.minorBody')}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setContactOpen(false);
              show(t('athleteProfile.contact.sent'));
            }}
            className="h-11 w-full rounded-lg bg-brand-500 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600 cursor-pointer"
          >
            {t('athleteProfile.contact.cta')}
          </button>
        </DialogContent>
      </Dialog>

      {toast}
    </motion.div>
  );
}
