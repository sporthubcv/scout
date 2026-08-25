/**
 * AthleteDashboard (/dashboard/athlete) — design: athlete-dashboard.md.
 * Demo session: Erick Semedo (flagship athlete). Uses DashboardShell.
 * Views (hash-synced tabs): #overview · #stats · #plan.
 * Demo CRUD persists to localStorage under shs-athlete-*.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  CalendarClock,
  Check,
  FileCheck2,
  LayoutDashboard,
  Play,
  Plus,
  TrendingUp,
  Trophy,
  Upload,
  User,
  Video,
  Zap,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardShell, { type ShellMenuSection } from '@/components/DashboardShell';
import { useI18n, useT } from '@/i18n';
import { useDemoSession } from '@/data/demoSession';
import {
  getAthleteReports,
  getAthleteStats,
  getScout,
  opportunities,
  videos,
  type VerificationStatus,
} from '@/data';
import {
  athleteEvidenceRows,
  athleteOvrEvolution,
  athleteRankingHistory,
  athleteRecentMatches,
} from '@/data/extra-dash-a';
import StatTile from '@/components/shared/StatTile';
import StatusBadge from '@/components/shared/StatusBadge';
import TabsUnderline from '@/components/shared/TabsUnderline';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import OvrSquare, { DataConfidence, PotChip } from '@/components/shared/OvrSquare';
import { cn } from '@/lib/utils';
import {
  btnGhost,
  btnOutline,
  btnPrimary,
  DashCard,
  DashModal,
  inputCls,
  labelCls,
  StatTileSkeleton,
  useHashTab,
  useSimulatedLoading,
  useToasts,
  verificationBadgeVariant,
} from '@/components/dashboards-a/ui';

/* ---------- localStorage helpers ---------- */

const LS_STATS = 'shs-athlete-stats';
const LS_EVIDENCE = 'shs-athlete-evidence';
const LS_PLAN = 'shs-athlete-plan';
const LS_BOOST = 'shs-athlete-boost';
const LS_APPLIED = 'shs-athlete-applied';

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function saveLS(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

interface SelfStat {
  id: string;
  competition: string;
  date: string;
  opponent: string;
  pts: string;
  ast: string;
  reb: string;
  stl: string;
  blk: string;
  verification: VerificationStatus;
}

interface EvidenceRow {
  id: string;
  file: string;
  stat: string;
  submitted: string;
  status: VerificationStatus;
  note?: string;
}

const TABS = ['overview', 'stats', 'plan'] as const;
type Tab = (typeof TABS)[number];

const emptyForm = { competition: '', date: '', opponent: '', pts: '', ast: '', reb: '', stl: '', blk: '' };

export default function AthleteDashboard() {
  const t = useT();
  const { formatDate } = useI18n();
  const { persona } = useDemoSession();
  const loading = useSimulatedLoading(600);
  const { push, stack } = useToasts();
  const [tab, setTab] = useHashTab(TABS, 'overview');

  const athleteName = persona?.name ?? 'Erick Semedo';
  const firstName = athleteName.split(' ')[0];

  /* ---------- persisted demo state ---------- */
  const [selfStats, setSelfStats] = useState<SelfStat[]>(() => loadLS(LS_STATS, []));
  const [evidence, setEvidence] = useState<EvidenceRow[]>(() => loadLS(LS_EVIDENCE, athleteEvidenceRows));
  const [plan, setPlan] = useState<'free' | 'premium'>(() => loadLS(LS_PLAN, 'free'));
  const [boost, setBoost] = useState<boolean>(() => loadLS(LS_BOOST, false));
  const [applied, setApplied] = useState<string[]>(() => loadLS(LS_APPLIED, []));

  useEffect(() => saveLS(LS_STATS, selfStats), [selfStats]);
  useEffect(() => saveLS(LS_EVIDENCE, evidence), [evidence]);
  useEffect(() => saveLS(LS_PLAN, plan), [plan]);
  useEffect(() => saveLS(LS_BOOST, boost), [boost]);
  useEffect(() => saveLS(LS_APPLIED, applied), [applied]);

  /* ---------- modals / forms ---------- */
  const [statModal, setStatModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [verifyTarget, setVerifyTarget] = useState<string | null>(null); // self-stat id
  const [evidenceFile, setEvidenceFile] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const baseStats = useMemo(() => getAthleteStats('erick-semedo'), []);
  const reports = useMemo(() => getAthleteReports('erick-semedo'), []);
  const myVideos = useMemo(() => videos.filter((v) => v.athleteId === 'erick-semedo'), []);

  const submitStat = () => {
    if (!form.competition || !form.opponent || !form.pts) return;
    const entry: SelfStat = {
      id: `self-${Date.now()}`,
      ...form,
      date: form.date || '2027-01-25',
      verification: 'selfReported',
    };
    setSelfStats((s) => [entry, ...s]);
    setForm(emptyForm);
    setStatModal(false);
    push(t('athleteDash.toasts.statSaved'));
  };

  const submitEvidence = () => {
    if (!verifyTarget) return;
    const target = selfStats.find((s) => s.id === verifyTarget);
    setSelfStats((rows) => rows.map((r) => (r.id === verifyTarget ? { ...r, verification: 'pending' } : r)));
    setEvidence((rows) => [
      {
        id: `ev-${Date.now()}`,
        file: evidenceFile ?? 'folha-jogo.jpg',
        stat: target ? `${target.pts} PTS vs ${target.opponent}` : '—',
        submitted: '2027-01-25',
        status: 'pending',
      },
      ...rows,
    ]);
    setVerifyTarget(null);
    setEvidenceFile(null);
    push(t('athleteDash.toasts.evidenceSent'));
  };

  const simulateVerification = (id: string) => {
    window.setTimeout(() => {
      setSelfStats((rows) => rows.map((r) => (r.id === id ? { ...r, verification: 'verified' } : r)));
      setEvidence((rows) => rows.map((r) => (r.status === 'pending' ? { ...r, status: 'verified' } : r)));
      push(t('athleteDash.toasts.verified'));
    }, 2000);
  };

  /* ---------- shell menu ---------- */
  const sections: ShellMenuSection[] = [
    {
      label: t('athleteDash.menu.groupMain'),
      items: [
        { to: '#overview', label: t('athleteDash.menu.overview'), icon: LayoutDashboard },
        { to: '#stats', label: t('athleteDash.menu.stats'), icon: BarChart3 },
        { to: '#stats', label: t('athleteDash.menu.evidences'), icon: FileCheck2 },
        { to: '#plan', label: t('athleteDash.menu.plan'), icon: Zap },
      ],
    },
    {
      label: t('athleteDash.menu.groupPlatform'),
      items: [
        { to: '/athletes/erick-semedo', label: t('athleteDash.menu.profile'), icon: User },
        { to: '/opportunities', label: t('athleteDash.menu.opportunities'), icon: Trophy },
        { to: '/videos', label: t('athleteDash.menu.videos'), icon: Video },
        { to: '/rankings', label: t('athleteDash.menu.development'), icon: TrendingUp },
      ],
    },
  ];

  const nextOpp = opportunities[2]; // basketball campus — compatible
  const latestReport = reports[0];
  const latestScout = latestReport ? getScout(latestReport.scoutId) : undefined;

  return (
    <DashboardShell
      title={t('athleteDash.title')}
      sections={sections}
      plan={{ name: t(`athleteDash.planTab.${plan === 'free' ? 'free' : 'premium'}`), usageLabel: t('athleteDash.planCard.usage'), usagePct: 86 }}
      actions={
        <button type="button" onClick={() => setStatModal(true)} className={cn(btnPrimary, 'h-9 px-3 text-[13px]')}>
          <Plus size={15} aria-hidden />
          <span className="hidden sm:inline">{t('athleteDash.recent.add')}</span>
        </button>
      }
    >
      {/* H1 + date */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-extrabold tracking-tight text-ink-950">
            {t('athleteDash.greeting', { name: firstName })}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-600">
            <CalendarClock size={14} aria-hidden />
            {formatDate('2027-01-24T17:30:00', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {t('common.season')} 2026/27
          </p>
        </div>
        {boost && <StatusBadge variant="boost" />}
      </div>

      <TabsUnderline
        id="athlete-dash"
        active={tab}
        onChange={(id) => setTab(id as Tab)}
        tabs={[
          { id: 'overview', label: t('athleteDash.menu.overview') },
          { id: 'stats', label: `${t('athleteDash.menu.stats')} & ${t('athleteDash.menu.evidences')}` },
          { id: 'plan', label: t('athleteDash.menu.plan') },
        ]}
        className="mb-6"
      />

      {tab === 'overview' && (
        <OverviewView
          loading={loading}
          t={t}
          formatDate={formatDate}
          athleteName={athleteName}
          boost={boost}
          reports={reports}
          latestReport={latestReport}
          latestScoutName={latestScout?.name ?? '—'}
          myVideosCount={myVideos.length}
          nextOppId={nextOpp.id}
          nextOppTitle={nextOpp.title}
          nextOppDeadline={formatDate(nextOpp.deadline)}
          applied={applied}
          onApply={(id) => {
            setApplied((a) => [...a, id]);
            push(t('athleteDash.toasts.applied'));
          }}
          onAddStat={() => setStatModal(true)}
          onDocSent={() => push(t('athleteDash.toasts.docSent'))}
        />
      )}

      {tab === 'stats' && (
        <StatsView
          t={t}
          formatDate={formatDate}
          baseStats={baseStats}
          selfStats={selfStats}
          evidence={evidence}
          onAddStat={() => setStatModal(true)}
          onVerify={(id) => setVerifyTarget(id)}
          onSimulate={simulateVerification}
        />
      )}

      {tab === 'plan' && (
        <PlanView
          t={t}
          plan={plan}
          boost={boost}
          onUpgrade={() => setCheckoutOpen(true)}
          onBoost={() => {
            setBoost(true);
            push(t('athleteDash.toasts.boostOn'));
          }}
        />
      )}

      {/* Add self-reported stat modal */}
      <DashModal open={statModal} onClose={() => setStatModal(false)} title={t('athleteDash.statsTab.addTitle')} wide>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelCls}>{t('athleteDash.statsTab.competition')}</label>
            <input className={inputCls} value={form.competition} onChange={(e) => setForm({ ...form, competition: e.target.value })} placeholder="INTER LICEU 2027" />
          </div>
          <div>
            <label className={labelCls}>{t('athleteDash.statsTab.date')}</label>
            <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t('athleteDash.statsTab.opponent')}</label>
            <input className={inputCls} value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} placeholder="Estrela do Sul" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(['pts', 'ast', 'reb', 'stl', 'blk'] as const).map((k) => (
            <div key={k}>
              <label className={labelCls}>{t(`athleteDash.statsTab.${k}`)}</label>
              <input inputMode="numeric" className={cn(inputCls, 'tnum')} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-warning/40 bg-amber-50 px-3 py-2.5 text-[12px] font-medium text-warning">
          <AlertTriangle size={14} aria-hidden />
          {t('athleteDash.statsTab.selfNote')}
          <StatusBadge variant="selfReported" className="ml-auto" />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={() => setStatModal(false)}>{t('common.close')}</button>
          <button type="button" className={btnPrimary} onClick={submitStat} disabled={!form.competition || !form.opponent || !form.pts}>
            {t('athleteDash.statsTab.submit')}
          </button>
        </div>
      </DashModal>

      {/* Verify statistic — simulated evidence upload */}
      <DashModal open={verifyTarget !== null} onClose={() => setVerifyTarget(null)} title={t('athleteDash.statsTab.evidenceTitle')}>
        {verifyTarget && (
          <p className="mb-3 text-[13px] text-ink-600">
            {t('athleteDash.statsTab.evidenceFor', {
              label: (() => {
                const s = selfStats.find((r) => r.id === verifyTarget);
                return s ? `${s.pts} PTS · ${s.ast} AST · ${s.reb} REB vs ${s.opponent}` : '—';
              })(),
            })}
          </p>
        )}
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 py-10 text-center transition-colors hover:border-brand-500">
          <Upload size={28} className="text-ink-600/50" aria-hidden />
          <span className="mt-3 text-[13px] font-medium text-ink-950">{evidenceFile ?? t('athleteDash.statsTab.dropzone')}</span>
          <span className="mt-1 text-[12px] font-semibold text-brand-600">{t('athleteDash.statsTab.chooseFile')}</span>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={(e) => setEvidenceFile(e.target.files?.[0]?.name ?? 'folha-jogo.jpg')}
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={() => setVerifyTarget(null)}>{t('common.close')}</button>
          <button type="button" className={btnPrimary} onClick={submitEvidence}>
            <FileCheck2 size={15} aria-hidden />
            {t('athleteDash.statsTab.send')}
          </button>
        </div>
      </DashModal>

      {/* Simulated checkout */}
      <DashModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} title={t('athleteDash.planTab.checkout')}>
        <p className="mb-4 rounded-lg bg-paper-50 px-3 py-2.5 text-[12px] text-ink-600">{t('athleteDash.planTab.checkoutNote')}</p>
        <label className={labelCls}>{t('athleteDash.planTab.cardNumber')}</label>
        <input className={cn(inputCls, 'tnum')} disabled value="4242 4242 4242 4242" readOnly />
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="font-display text-[20px] font-extrabold text-ink-950 tnum">
            {t('athleteDash.planTab.perMonth')} <span className="text-[12px] font-semibold text-ink-600">{t('athleteDash.planTab.eurHint')}</span>
          </p>
          <button
            type="button"
            className={btnPrimary}
            onClick={() => {
              setPlan('premium');
              setCheckoutOpen(false);
              push(t('athleteDash.toasts.planUpgraded'));
            }}
          >
            {t('athleteDash.planTab.pay')}
          </button>
        </div>
      </DashModal>

      {stack}
    </DashboardShell>
  );
}

/* ============================== Views ============================== */

type TFn = ReturnType<typeof useT>;
type FDate = ReturnType<typeof useI18n>['formatDate'];

function CompletionRing({ pct }: { pct: number }) {
  const C = 2 * Math.PI * 40;
  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 96 96" className="h-24 w-24">
        <circle cx="48" cy="48" r="40" stroke="#EFEFF1" strokeWidth="7" fill="none" />
        <motion.circle
          cx="48"
          cy="48"
          r="40"
          stroke="#F97316"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          whileInView={{ strokeDashoffset: C * (1 - pct / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform="rotate(-90 48 48)"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-[20px] font-extrabold text-ink-950 tnum">
        {pct}%
      </span>
    </div>
  );
}

function OverviewView(props: {
  loading: boolean;
  t: TFn;
  formatDate: FDate;
  athleteName: string;
  boost: boolean;
  reports: ReturnType<typeof getAthleteReports>;
  latestReport: ReturnType<typeof getAthleteReports>[number] | undefined;
  latestScoutName: string;
  myVideosCount: number;
  nextOppId: string;
  nextOppTitle: string;
  nextOppDeadline: string;
  applied: string[];
  onApply: (id: string) => void;
  onAddStat: () => void;
  onDocSent: () => void;
}) {
  const { loading, t, formatDate, latestReport, latestScoutName, myVideosCount, applied, onApply, onAddStat, onDocSent } = props;
  const { locale } = useI18n();
  const myVideos = videos.filter((v) => v.athleteId === 'erick-semedo' || v.competitionId === 'inter-liceu-2027').slice(0, 3);
  const oppList = [opportunities[2], opportunities[0]];

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }, (_, i) => <StatTileSkeleton key={i} />)
        ) : (
          <>
            <div className="col-span-2 flex items-center gap-4 rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(10,10,11,.05)] lg:col-span-1 lg:flex-col lg:items-start">
              <OvrSquare value={78} size={64} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">{t('athleteDash.kpi.ovr')}</p>
                <div className="mt-1"><PotChip value={86} /></div>
                <DataConfidence confidence="high" className="mt-1.5" />
              </div>
            </div>
            <StatTile label={t('athleteDash.kpi.ranking')} value="#2" delta={1} spark={athleteRankingHistory.map((r) => 6 - r)} />
            <StatTile label={t('athleteDash.kpi.games')} value={24} />
            <StatTile label={t('athleteDash.kpi.videos')} value={12} />
            <StatTile label={t('athleteDash.kpi.reports')} value={3} delta={1} />
          </>
        )}
      </div>

      {/* Grid 2fr / 1fr */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <DashCard
          className="lg:col-span-2"
          title={t('athleteDash.recent.title')}
          action={
            <button type="button" onClick={onAddStat} className={cn(btnPrimary, 'h-9 px-3 text-[13px]')}>
              <Plus size={14} aria-hidden />
              {t('athleteDash.recent.add')}
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                  <th className="pb-2 pr-3">{t('athleteDash.table.date')}</th>
                  <th className="pb-2 pr-3">{t('athleteDash.table.competition')}</th>
                  <th className="pb-2 pr-3">{t('athleteDash.table.opponent')}</th>
                  <th className="pb-2 pr-3">{t('athleteDash.table.result')}</th>
                  <th className="pb-2 pr-3 text-right">PTS</th>
                  <th className="pb-2 pr-3 text-right">AST</th>
                  <th className="pb-2 pr-3 text-right">REB</th>
                  <th className="pb-2">{t('athleteDash.table.status')}</th>
                </tr>
              </thead>
              <tbody>
                {athleteRecentMatches.map((m) => (
                  <tr key={m.id} className="border-b border-line/60 last:border-0 hover:bg-paper-50">
                    <td className="py-2.5 pr-3 whitespace-nowrap text-ink-600 tnum">{formatDate(m.date, { day: 'numeric', month: 'short' })}</td>
                    <td className="py-2.5 pr-3 text-[12px] font-semibold text-ink-600">{m.competition}</td>
                    <td className="py-2.5 pr-3 font-medium text-ink-950">{m.opponent}</td>
                    <td className="py-2.5 pr-3 tnum">{m.result}</td>
                    <td className="py-2.5 pr-3 text-right font-display font-extrabold tnum">{m.pts}</td>
                    <td className="py-2.5 pr-3 text-right tnum">{m.ast}</td>
                    <td className="py-2.5 pr-3 text-right tnum">{m.reb}</td>
                    <td className="py-2.5"><StatusBadge variant={verificationBadgeVariant(m.verification)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashCard>

        <div className="space-y-5">
          {/* Profile completion */}
          <DashCard title={t('athleteDash.completion.title', { pct: 86 })}>
            <div className="flex items-center gap-4">
              <CompletionRing pct={86} />
              <ul className="space-y-1.5 text-[13px]">
                <li className="flex items-center gap-2 text-ink-950"><Check size={14} className="text-success" aria-hidden />{t('athleteDash.completion.photo')}</li>
                <li className="flex items-center gap-2 text-ink-950"><Check size={14} className="text-success" aria-hidden />{t('athleteDash.completion.stats')}</li>
                <li className="flex items-center gap-2 text-warning"><AlertTriangle size={14} aria-hidden />{t('athleteDash.completion.evidencePending')}</li>
                <li className="flex items-center gap-2 text-ink-600"><span className="inline-block h-3.5 w-3.5 rounded-full border border-line" aria-hidden />{t('athleteDash.completion.fullGame')}</li>
              </ul>
            </div>
          </DashCard>

          {/* Next opportunity */}
          <DashCard title={t('athleteDash.nextOpp.title')}>
            <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-brand-600">
              {t('athleteDash.nextOpp.compatible')}
            </span>
            <p className="mt-2.5 text-[14px] font-semibold text-ink-950">{props.nextOppTitle}</p>
            <p className="mt-1 text-[12px] text-ink-600">{t('athleteDash.nextOpp.deadline')}: {props.nextOppDeadline}</p>
            <button
              type="button"
              disabled={applied.includes(props.nextOppId)}
              onClick={() => onApply(props.nextOppId)}
              className={cn(applied.includes(props.nextOppId) ? btnOutline : btnPrimary, 'mt-3 h-9 px-3 text-[13px]')}
            >
              {applied.includes(props.nextOppId) ? t('athleteDash.nextOpp.applied') : t('athleteDash.nextOpp.apply')}
            </button>
          </DashCard>

          {/* Ranking mini-card */}
          <DashCard title={t('athleteDash.rankingCard.title')}>
            <p className="text-[12px] text-ink-600">{t('athleteDash.rankingCard.subtitle')}</p>
            <div className="mt-3 flex h-12 items-end gap-1.5" aria-hidden>
              {athleteRankingHistory.map((r, i) => (
                <span
                  key={i}
                  className={cn('w-7 rounded-sm', i === athleteRankingHistory.length - 1 ? 'bg-brand-500' : 'bg-paper-100')}
                  style={{ height: `${((6 - r) / 5) * 100}%` }}
                  title={`#${r}`}
                />
              ))}
              <span className="ml-2 font-display text-[22px] font-extrabold text-ink-950 tnum">#2</span>
            </div>
            <Link to="/rankings" className="mt-3 inline-block text-[13px] font-semibold text-brand-600 hover:text-brand-500">
              {t('athleteDash.rankingCard.view')} →
            </Link>
          </DashCard>
        </div>
      </div>

      {/* Development chart + latest report */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <DashCard className="lg:col-span-2" title={t('athleteDash.development.title')}>
          <p className="mb-3 text-[12px] text-ink-600">{t('athleteDash.development.subtitle')}</p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={athleteOvrEvolution} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#E6E6E9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                <YAxis domain={[65, 85]} tick={{ fontSize: 12, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E6E6E9', fontSize: 13 }}
                  formatter={(value) => [String(value), 'OVR']}
                />
                <Line type="monotone" dataKey="ovr" stroke="#0A0A0B" strokeWidth={2.5} dot={{ r: 4, fill: '#F97316', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#F97316' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DashCard>

        <DashCard title={t('athleteDash.reports.title')}>
          {latestReport && (
            <div className="rounded-xl border border-line p-4">
              <div className="flex items-center gap-3">
                <MonogramAvatar name={latestScoutName} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink-950">{t('athleteDash.reports.by', { name: latestScoutName })}</p>
                  <p className="text-[12px] text-ink-600 tnum">{formatDate(latestReport.date)}</p>
                </div>
                <span className="ml-auto rounded-lg bg-ink-950 px-2 py-1 font-display text-[13px] font-extrabold text-white">
                  {t('athleteDash.reports.grade', { grade: latestReport.grade })}
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-950">
                {locale === 'pt-PT' ? latestReport.summaryPt : latestReport.summaryEn}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white">
                  {t('athleteDash.reports.highPotential')}
                </span>
                <span className="text-[12px] font-medium text-ink-600">
                  {t('athleteDash.reports.recommendation', { value: t(`athleteDash.reports.rec.${latestReport.recommendation}`) })}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-ink-600/70">{t('athleteDash.reports.visibility')}</p>
            </div>
          )}
        </DashCard>
      </div>

      {/* Videos */}
      <DashCard
        title={t('athleteDash.videos.title')}
        action={<span className="text-[12px] font-semibold text-ink-600 tnum">{myVideosCount} · + {t('athleteDash.videos.upload')}</span>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {myVideos.map((v) => (
            <div key={v.id} className="group overflow-hidden rounded-xl border border-line">
              <div className="relative aspect-video overflow-hidden bg-ink-gradient">
                <img src={v.thumb} alt="" className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950/70 text-white"><Play size={16} aria-hidden /></span>
                </span>
                <span className="absolute bottom-2 right-2 rounded bg-ink-950/80 px-1.5 py-0.5 text-[11px] font-bold text-white tnum">
                  {Math.floor(v.durationSec / 60)}:{String(v.durationSec % 60).padStart(2, '0')}
                </span>
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-[13px] font-semibold text-ink-950">{v.title}</p>
                <div className="mt-1.5 flex items-center justify-between text-[12px] text-ink-600">
                  <span className="rounded-full bg-paper-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    {v.visibility === 'public' ? t('athleteDash.videos.public') : t('athleteDash.videos.private')}
                  </span>
                  <span className="tnum">{t('athleteDash.videos.views', { n: v.views })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashCard>

      {/* Opportunities + verification */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <DashCard
          className="lg:col-span-2"
          title={t('athleteDash.opportunities.title')}
          action={
            <Link to="/opportunities" className="text-[13px] font-semibold text-brand-600 hover:text-brand-500">
              {t('athleteDash.opportunities.viewAll')} →
            </Link>
          }
        >
          <ul className="divide-y divide-line">
            {oppList.map((op) => (
              <li key={op.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-ink-950">{op.title}</p>
                  <p className="mt-0.5 text-[12px] text-ink-600">{op.organization} · {op.location} · {t('athleteDash.opportunities.deadline', { date: formatDate(op.deadline) })}</p>
                </div>
                <button
                  type="button"
                  disabled={applied.includes(op.id)}
                  onClick={() => onApply(op.id)}
                  className={cn(applied.includes(op.id) ? btnGhost : btnOutline, 'h-9 px-3 text-[13px]')}
                >
                  {applied.includes(op.id) ? t('athleteDash.opportunities.applied') : t('athleteDash.opportunities.apply')}
                </button>
              </li>
            ))}
          </ul>
        </DashCard>

        <DashCard title={t('athleteDash.verification.title')}>
          <ul className="space-y-3 text-[13px]">
            <li className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-medium text-ink-950"><BadgeCheck size={15} className="text-brand-500" aria-hidden />{t('athleteDash.verification.profile')}</span>
              <span className="text-[12px] text-success">{t('athleteDash.verification.verifiedOn', { date: formatDate('2026-03-12') })}</span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-medium text-ink-950"><BadgeCheck size={15} className="text-success" aria-hidden />{t('athleteDash.verification.statsLabel')}</span>
              <span className="text-[12px] text-ink-600 tnum">{t('athleteDash.verification.statsOf', { done: 14, total: 24 })}</span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="font-medium text-ink-950">{t('athleteDash.verification.identity')}</span>
              <button type="button" onClick={onDocSent} className="text-[12px] font-semibold text-info hover:underline">
                {t('athleteDash.verification.sendDoc')}
              </button>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="font-medium text-ink-950">{t('athleteDash.verification.consent')}</span>
              <span className="text-[12px] text-ink-600">{t('athleteDash.verification.consentNa')}</span>
            </li>
          </ul>
          <p className="mt-4 rounded-lg bg-paper-50 px-3 py-2 text-[11px] text-ink-600">{t('athleteDash.verification.note')}</p>
        </DashCard>
      </div>
    </div>
  );
}

function StatsView({
  t,
  formatDate,
  baseStats,
  selfStats,
  evidence,
  onAddStat,
  onVerify,
  onSimulate,
}: {
  t: TFn;
  formatDate: FDate;
  baseStats: ReturnType<typeof getAthleteStats>;
  selfStats: SelfStat[];
  evidence: EvidenceRow[];
  onAddStat: () => void;
  onVerify: (id: string) => void;
  onSimulate: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <DashCard
        title={t('athleteDash.statsTab.management')}
        action={
          <button type="button" onClick={onAddStat} className={cn(btnPrimary, 'h-9 px-3 text-[13px]')}>
            <Plus size={14} aria-hidden />
            {t('athleteDash.recent.add')}
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                <th className="pb-2 pr-3">{t('athleteDash.statsTab.stat')}</th>
                <th className="pb-2 pr-3">{t('athleteDash.statsTab.value')}</th>
                <th className="pb-2 pr-3">{t('common.season')}</th>
                <th className="pb-2 pr-3">{t('athleteDash.table.status')}</th>
                <th className="pb-2 text-right">{t('athleteDash.statsTab.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {baseStats.map((s) => (
                <tr key={s.id} className="border-b border-line/60 last:border-0 hover:bg-paper-50">
                  <td className="py-2.5 pr-3 font-semibold text-ink-950">{s.label}</td>
                  <td className="py-2.5 pr-3 font-display font-extrabold tnum">{s.value}</td>
                  <td className="py-2.5 pr-3 text-ink-600 tnum">{s.season}</td>
                  <td className="py-2.5 pr-3"><StatusBadge variant={verificationBadgeVariant(s.verification)} /></td>
                  <td className="py-2.5 text-right text-[12px] text-ink-600">—</td>
                </tr>
              ))}
              {selfStats.map((s) => (
                <tr key={s.id} className="border-b border-line/60 last:border-0 hover:bg-paper-50">
                  <td className="py-2.5 pr-3 font-semibold text-ink-950">vs {s.opponent}</td>
                  <td className="py-2.5 pr-3 tnum">{s.pts} PTS · {s.ast || 0} AST · {s.reb || 0} REB · {s.stl || 0} STL · {s.blk || 0} BLK</td>
                  <td className="py-2.5 pr-3 text-ink-600 tnum">{formatDate(s.date, { day: 'numeric', month: 'short' })}</td>
                  <td className="py-2.5 pr-3"><StatusBadge variant={verificationBadgeVariant(s.verification)} /></td>
                  <td className="py-2.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      {s.verification === 'selfReported' && (
                        <button type="button" onClick={() => onVerify(s.id)} className={cn(btnOutline, 'h-8 px-2.5 text-[12px]')}>
                          <Upload size={13} aria-hidden />
                          {t('athleteDash.statsTab.sendEvidence')}
                        </button>
                      )}
                      {s.verification === 'pending' && (
                        <button type="button" onClick={() => onSimulate(s.id)} className={cn(btnGhost, 'h-8 px-2.5 text-[12px] text-info')}>
                          {t('athleteDash.statsTab.simulate')}
                        </button>
                      )}
                      {s.verification === 'verified' && <Check size={16} className="mt-1.5 text-success" aria-hidden />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>

      <DashCard title={t('athleteDash.statsTab.evidencesTitle')}>
        {evidence.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-ink-600">{t('athleteDash.statsTab.emptyEvidence')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                  <th className="pb-2 pr-3">{t('athleteDash.statsTab.file')}</th>
                  <th className="pb-2 pr-3">{t('athleteDash.statsTab.linkedStat')}</th>
                  <th className="pb-2 pr-3">{t('athleteDash.statsTab.submitted')}</th>
                  <th className="pb-2 pr-3">{t('athleteDash.table.status')}</th>
                  <th className="pb-2">{t('athleteDash.statsTab.verifierNote')}</th>
                </tr>
              </thead>
              <tbody>
                {evidence.map((e) => (
                  <tr key={e.id} className="border-b border-line/60 last:border-0 hover:bg-paper-50">
                    <td className="py-2.5 pr-3 font-medium text-ink-950 tnum">{e.file}</td>
                    <td className="py-2.5 pr-3 text-ink-600">{e.stat}</td>
                    <td className="py-2.5 pr-3 text-ink-600 tnum">{formatDate(e.submitted)}</td>
                    <td className="py-2.5 pr-3"><StatusBadge variant={verificationBadgeVariant(e.status)} /></td>
                    <td className="py-2.5 text-[12px] text-ink-600">{e.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashCard>
    </div>
  );
}

function PlanView({
  t,
  plan,
  boost,
  onUpgrade,
  onBoost,
}: {
  t: TFn;
  plan: 'free' | 'premium';
  boost: boolean;
  onUpgrade: () => void;
  onBoost: () => void;
}) {
  const features = ['featStats', 'featVideos', 'featReports', 'featBadge'] as const;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <DashCard
          title={t('athleteDash.planTab.current')}
          className={cn(plan === 'premium' && 'border-brand-500 ring-2 ring-brand-500/20')}
        >
          <div className="flex items-center justify-between">
            <p className="font-display text-[24px] font-extrabold text-ink-950">{t(`athleteDash.planTab.${plan === 'free' ? 'free' : 'premium'}`)}</p>
            {plan === 'premium' && <StatusBadge variant="boost" />}
          </div>
          <p className="mt-1 text-[13px] text-ink-600 tnum">
            {plan === 'premium' ? `${t('athleteDash.planTab.perMonth')} (${t('athleteDash.planTab.eurHint')})` : 'esc 0'}
          </p>
          {plan === 'free' && (
            <button type="button" onClick={onUpgrade} className={cn(btnPrimary, 'mt-4 w-full')}>
              <Zap size={15} aria-hidden />
              {t('athleteDash.planTab.upgrade')} — {t('athleteDash.planTab.perMonth')} ({t('athleteDash.planTab.eurHint')})
            </button>
          )}
        </DashCard>

        <DashCard title={t('athleteDash.planTab.compare')} className="lg:col-span-2">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                <th className="pb-2 pr-3"> </th>
                <th className="pb-2 pr-3">{t('athleteDash.planTab.free')}</th>
                <th className="pb-2">{t('athleteDash.planTab.premium')}</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f} className="border-b border-line/60 last:border-0">
                  <td className="py-2.5 pr-3 font-medium text-ink-950">{t(`athleteDash.planTab.${f}`)}</td>
                  <td className="py-2.5 pr-3 text-ink-600">—</td>
                  <td className="py-2.5"><Check size={15} className="text-success" aria-hidden /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashCard>
      </div>

      <DashCard title={t('athleteDash.planTab.boostTitle')}>
        <p className="flex items-center gap-2 text-[13px] font-semibold text-success">
          <Check size={15} aria-hidden />
          {t('athleteDash.planTab.eligible')}
        </p>
        <p className="mt-3 rounded-xl bg-ink-950 px-4 py-3 text-[13px] font-semibold leading-relaxed text-white">
          {t('athleteDash.planTab.integrity')}
        </p>
        {boost ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StatusBadge variant="boost" />
            <span className="text-[13px] text-ink-600">{t('athleteDash.planTab.activeUntil', { date: '01/02/2027' })}</span>
            <span className="text-[13px] font-semibold text-brand-600 tnum">{t('athleteDash.planTab.reach')}</span>
          </div>
        ) : (
          <button type="button" onClick={onBoost} className={cn(btnPrimary, 'mt-4')}>
            <Zap size={15} aria-hidden />
            {t('athleteDash.planTab.activate')}
          </button>
        )}
      </DashCard>
    </div>
  );
}
