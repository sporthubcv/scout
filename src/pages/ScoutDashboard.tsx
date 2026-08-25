/**
 * ScoutDashboard (/dashboard/scout) — design: scout-dashboard.md.
 * Demo session: verified scout persona (Carlos Moniz). Uses DashboardShell.
 * Views (hash-synced tabs): #overview · #watched · #reports · #scouting · #reco.
 * Demo CRUD persists to localStorage under shs-scout-*.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  ClipboardList,
  Eye,
  FileText,
  LayoutDashboard,
  Play,
  Radio,
  Star,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardShell, { type ShellMenuSection } from '@/components/DashboardShell';
import { useI18n, useT } from '@/i18n';
import { useDemoSession } from '@/data/demoSession';
import { athletes, getAthlete, scoutReports, type ScoutReport } from '@/data';
import {
  scoutActivityByGame,
  scoutClips,
  scoutDrafts,
  scoutMatchHistory,
  scoutRatingCategories,
  scoutRecoBoard,
  scoutUpcomingGames,
  scoutWatchlist,
  type RecoColumn,
} from '@/data/extra-dash-a';
import StatTile from '@/components/shared/StatTile';
import StatusBadge from '@/components/shared/StatusBadge';
import TabsUnderline from '@/components/shared/TabsUnderline';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import OvrSquare, { PotChip } from '@/components/shared/OvrSquare';
import { cn } from '@/lib/utils';
import {
  btnGhost,
  btnOutline,
  btnPrimary,
  DashCard,
  DashModal,
  inputCls,
  labelCls,
  loadLS,
  saveLS,
  StatTileSkeleton,
  useHashTab,
  useSimulatedLoading,
  useToasts,
} from '@/components/dashboards-a/ui';

const LS_REPORTS = 'shs-scout-reports';
const LS_RECO = 'shs-scout-reco';

interface CreatedReport {
  id: string;
  athleteId: string;
  context: string;
  ratings: Record<string, number>;
  strengths: string[];
  areas: string[];
  recommendation: string;
  visibility: 'clubs' | 'public';
  status: 'draft' | 'published';
  date: string;
}

const TABS = ['overview', 'watched', 'reports', 'scouting', 'reco'] as const;
type Tab = (typeof TABS)[number];

const emptyReportForm = {
  athleteId: athletes[0].id,
  context: '',
  ratings: { technique: 7, tactical: 7, physical: 7, mental: 7, potential: 7 } as Record<string, number>,
  strengths: [] as string[],
  areas: [] as string[],
  recommendation: 'follow',
  visibility: 'clubs' as 'clubs' | 'public',
};

export default function ScoutDashboard() {
  const t = useT();
  const { formatDate } = useI18n();
  const { persona } = useDemoSession();
  const loading = useSimulatedLoading(600);
  const { push, stack } = useToasts();
  const [tab, setTab] = useHashTab(TABS, 'overview');

  const [createdReports, setCreatedReports] = useState<CreatedReport[]>(() => loadLS(LS_REPORTS, []));
  const [recoBoard, setRecoBoard] = useState<Record<RecoColumn, string[]>>(() => loadLS(LS_RECO, scoutRecoBoard));
  useEffect(() => saveLS(LS_REPORTS, createdReports), [createdReports]);
  useEffect(() => saveLS(LS_RECO, recoBoard), [recoBoard]);

  /* report form modal */
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState(emptyReportForm);

  /* evaluation modal */
  const [evalTarget, setEvalTarget] = useState<string | null>(null);
  const [evalRatings, setEvalRatings] = useState<Record<string, number>>({ ...emptyReportForm.ratings });

  /* reco confirm */
  const [recoConfirm, setRecoConfirm] = useState<{ athleteId: string; from: RecoColumn } | null>(null);

  const publishedCount = 18 + createdReports.filter((r) => r.status === 'published').length;
  const myReports = useMemo(
    () => scoutReports.filter((r) => r.scoutId === 'scout-carlos-moniz'),
    [],
  );

  const saveReport = (status: 'draft' | 'published') => {
    setCreatedReports((rows) => [
      { id: `rep-${Date.now()}`, ...reportForm, status, date: '2027-01-24' },
      ...rows,
    ]);
    setReportForm(emptyReportForm);
    setReportOpen(false);
    push(t(status === 'published' ? 'scoutDash.toasts.published' : 'scoutDash.toasts.draftSaved'));
  };

  const moveReco = (athleteId: string, from: RecoColumn, to: RecoColumn) => {
    if (from === to) return;
    setRecoBoard((b) => ({
      ...b,
      [from]: b[from].filter((id) => id !== athleteId),
      [to]: [athleteId, ...b[to]],
    }));
    push(t(to === 'accepted' ? 'scoutDash.toasts.accepted' : 'scoutDash.toasts.moved'));
  };

  const sections: ShellMenuSection[] = [
    {
      label: t('scoutDash.menu.groupMain'),
      items: [
        { to: '#overview', label: t('scoutDash.menu.overview'), icon: LayoutDashboard },
        { to: '#watched', label: t('scoutDash.menu.watched'), icon: Eye },
        { to: '#reports', label: t('scoutDash.menu.reports'), icon: FileText },
        { to: '#scouting', label: t('scoutDash.menu.matchScouting'), icon: Radio },
        { to: '#reco', label: t('scoutDash.menu.recommendations'), icon: Star },
      ],
    },
    {
      label: t('scoutDash.menu.groupPlatform'),
      items: [
        { to: '/athletes/erick-semedo', label: t('scoutDash.menu.profile'), icon: Users },
        { to: '/videos', label: t('scoutDash.menu.clips'), icon: Video },
        { to: '/competitions', label: t('scoutDash.menu.agenda'), icon: CalendarClock },
      ],
    },
  ];

  return (
    <DashboardShell
      title={t('scoutDash.title')}
      sections={sections}
      plan={{ name: t('scoutDash.planCard.name'), usageLabel: t('scoutDash.planCard.usage'), usagePct: 67 }}
      actions={
        <button type="button" onClick={() => setReportOpen(true)} className={cn(btnPrimary, 'h-9 px-3 text-[13px]')}>
          <FileText size={15} aria-hidden />
          <span className="hidden sm:inline">{t('scoutDash.reportsTab.new')}</span>
        </button>
      }
    >
      <div className="mb-5">
        <h1 className="font-display text-[28px] font-extrabold tracking-tight text-ink-950">
          {t('scoutDash.title')} — {persona?.name ?? 'Carlos Moniz'}
        </h1>
        <p className="mt-1 text-[13px] text-ink-600">
          {persona?.org ?? 'Horizonte Scouting'} · {t('common.season')} 2026/27
        </p>
      </div>

      <TabsUnderline
        id="scout-dash"
        active={tab}
        onChange={(id) => setTab(id as Tab)}
        tabs={[
          { id: 'overview', label: t('scoutDash.menu.overview') },
          { id: 'watched', label: t('scoutDash.menu.watched') },
          { id: 'reports', label: t('scoutDash.menu.reports') },
          { id: 'scouting', label: t('scoutDash.menu.matchScouting') },
          { id: 'reco', label: t('scoutDash.menu.recommendations') },
        ]}
        className="mb-6"
      />

      {tab === 'overview' && (
        <OverviewView loading={loading} t={t} formatDate={formatDate} onReel={() => push(t('scoutDash.toasts.reel'))} />
      )}

      {tab === 'watched' && (
        <WatchedView
          t={t}
          onEval={(id) => {
            setEvalTarget(id);
            setEvalRatings({ ...emptyReportForm.ratings });
          }}
          onClip={() => push(t('scoutDash.toasts.clip'))}
        />
      )}

      {tab === 'reports' && (
        <ReportsView
          t={t}
          formatDate={formatDate}
          myReports={myReports}
          created={createdReports}
          publishedCount={publishedCount}
          onNew={() => setReportOpen(true)}
        />
      )}

      {tab === 'scouting' && <ScoutingHistoryView t={t} formatDate={formatDate} />}

      {tab === 'reco' && (
        <RecoView
          t={t}
          board={recoBoard}
          onMove={moveReco}
          onAskAccept={(athleteId, from) => setRecoConfirm({ athleteId, from })}
        />
      )}

      {/* New scout report modal */}
      <DashModal open={reportOpen} onClose={() => setReportOpen(false)} title={t('scoutDash.form.title')} wide>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t('scoutDash.form.athlete')}</label>
            <select
              className={inputCls}
              value={reportForm.athleteId}
              onChange={(e) => setReportForm({ ...reportForm, athleteId: e.target.value })}
            >
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>{a.name} — {a.position}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t('scoutDash.form.matchContext')}</label>
            <input
              className={inputCls}
              value={reportForm.context}
              onChange={(e) => setReportForm({ ...reportForm, context: e.target.value })}
              placeholder="INTER LICEU 2027 · Jornada 5"
            />
          </div>
        </div>

        <p className="mt-5 mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-600">
          {t('scoutDash.form.ratingTitle')}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {scoutRatingCategories.map((cat) => (
            <div key={cat}>
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-ink-950">{t(`scoutDash.form.rating.${cat}`)}</label>
                <span className="font-display text-[15px] font-extrabold text-ink-950 tnum">{reportForm.ratings[cat]}/10</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={reportForm.ratings[cat]}
                onChange={(e) => setReportForm({ ...reportForm, ratings: { ...reportForm.ratings, [cat]: Number(e.target.value) } })}
                className="mt-1 w-full accent-brand-500"
              />
            </div>
          ))}
        </div>

        <TagEditor
          label={t('scoutDash.form.strengths')}
          items={reportForm.strengths}
          placeholder={t('scoutDash.form.itemPlaceholder')}
          onAdd={(v) => setReportForm({ ...reportForm, strengths: [...reportForm.strengths, v] })}
          onRemove={(v) => setReportForm({ ...reportForm, strengths: reportForm.strengths.filter((s) => s !== v) })}
        />
        <TagEditor
          label={t('scoutDash.form.devAreas')}
          items={reportForm.areas}
          placeholder={t('scoutDash.form.itemPlaceholder')}
          onAdd={(v) => setReportForm({ ...reportForm, areas: [...reportForm.areas, v] })}
          onRemove={(v) => setReportForm({ ...reportForm, areas: reportForm.areas.filter((s) => s !== v) })}
        />

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t('scoutDash.form.recommendation')}</label>
            <select
              className={inputCls}
              value={reportForm.recommendation}
              onChange={(e) => setReportForm({ ...reportForm, recommendation: e.target.value })}
            >
              {(['follow', 'shortlist', 'sign', 'monitor'] as const).map((r) => (
                <option key={r} value={r}>{t(`scoutDash.form.rec.${r}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t('scoutDash.form.visibility')}</label>
            <select
              className={inputCls}
              value={reportForm.visibility}
              onChange={(e) => setReportForm({ ...reportForm, visibility: e.target.value as 'clubs' | 'public' })}
            >
              <option value="clubs">{t('scoutDash.form.visClubs')}</option>
              <option value="public">{t('scoutDash.form.visPublic')}</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btnOutline} onClick={() => saveReport('draft')}>
            {t('scoutDash.form.saveDraft')}
          </button>
          <button type="button" className={btnPrimary} onClick={() => saveReport('published')}>
            {t('scoutDash.form.publish')}
          </button>
        </div>
      </DashModal>

      {/* Quick evaluation modal (5 sliders) */}
      <DashModal
        open={evalTarget !== null}
        onClose={() => setEvalTarget(null)}
        title={t('scoutDash.evalModal.title', { name: evalTarget ? getAthlete(evalTarget)?.name ?? '' : '' })}
      >
        <div className="space-y-3">
          {scoutRatingCategories.map((cat) => (
            <div key={cat}>
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-ink-950">{t(`scoutDash.form.rating.${cat}`)}</label>
                <span className="font-display text-[15px] font-extrabold text-ink-950 tnum">{evalRatings[cat]}/10</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={evalRatings[cat]}
                onChange={(e) => setEvalRatings({ ...evalRatings, [cat]: Number(e.target.value) })}
                className="mt-1 w-full accent-brand-500"
              />
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={() => setEvalTarget(null)}>{t('common.close')}</button>
          <button
            type="button"
            className={btnPrimary}
            onClick={() => {
              setEvalTarget(null);
              push(t('scoutDash.toasts.evalSaved'));
            }}
          >
            {t('scoutDash.evalModal.save')}
          </button>
        </div>
      </DashModal>

      {/* Reco accept confirm */}
      <DashModal open={recoConfirm !== null} onClose={() => setRecoConfirm(null)} title={t('scoutDash.reco.accepted')}>
        <p className="text-[14px] text-ink-950">{t('scoutDash.reco.confirmAccept')}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={() => setRecoConfirm(null)}>{t('common.close')}</button>
          <button
            type="button"
            className={btnPrimary}
            onClick={() => {
              if (recoConfirm) moveReco(recoConfirm.athleteId, recoConfirm.from, 'accepted');
              setRecoConfirm(null);
            }}
          >
            {t('scoutDash.reco.confirm')}
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

function TagEditor({
  label,
  items,
  placeholder,
  onAdd,
  onRemove,
}: {
  label: string;
  items: string[];
  placeholder: string;
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (v && !items.includes(v)) onAdd(v);
    setDraft('');
  };
  return (
    <div className="mt-4">
      <label className={labelCls}>{label}</label>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-white px-2 py-1.5">
        {items.map((item) => (
          <span key={item} className="inline-flex items-center gap-1 rounded-full bg-paper-100 px-2.5 py-1 text-[12px] font-semibold text-ink-950">
            {item}
            <button type="button" onClick={() => onRemove(item)} className="cursor-pointer text-ink-600 hover:text-danger" aria-label={item}>×</button>
          </span>
        ))}
        <input
          className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-[13px] outline-none"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
        />
      </div>
    </div>
  );
}

function OverviewView({ loading, t, formatDate, onReel }: { loading: boolean; t: TFn; formatDate: FDate; onReel: () => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }, (_, i) => <StatTileSkeleton key={i} />)
        ) : (
          <>
            <StatTile label={t('scoutDash.kpi.evaluated')} value={47} delta={3} />
            <StatTile label={t('scoutDash.kpi.reports')} value={18} delta={2} />
            <StatTile label={t('scoutDash.kpi.matches')} value={26} />
            <StatTile label={t('scoutDash.kpi.clips')} value={96} delta={9} />
            <StatTile label={t('scoutDash.kpi.accepted')} value={12} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Upcoming games */}
          <DashCard title={t('scoutDash.upcoming.title')}>
            <ul className="space-y-3">
              {scoutUpcomingGames.map((g) => (
                <li key={g.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-paper-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-600">{g.competition}</span>
                      {g.live && <StatusBadge variant="live" />}
                    </div>
                    <p className="mt-1.5 text-[14px] font-semibold text-ink-950">{g.home} × {g.away}</p>
                    <p className="mt-0.5 text-[12px] text-ink-600">{g.venue} · {formatDate(g.date, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {g.live ? (
                    <Link to="/match-scouting/demo-match" className={cn(btnPrimary, 'h-10')}>
                      <Radio size={15} aria-hidden />
                      {t('scoutDash.upcoming.open')}
                    </Link>
                  ) : (
                    <span className="text-[12px] font-semibold text-ink-600">{t('scoutDash.upcoming.scheduled')}</span>
                  )}
                </li>
              ))}
            </ul>
          </DashCard>

          {/* Recent clips rail */}
          <DashCard
            title={t('scoutDash.clips.title')}
            action={
              <button type="button" onClick={onReel} className={cn(btnOutline, 'h-9 px-3 text-[13px]')}>
                <Video size={14} aria-hidden />
                {t('scoutDash.clips.reel')}
              </button>
            }
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {scoutClips.map((c, i) => (
                <motion.button
                  key={c.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-line text-left"
                  onClick={onReel}
                >
                  <div className="relative aspect-video overflow-hidden bg-ink-gradient">
                    <img src={c.thumb} alt="" className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-950/70 text-white"><Play size={13} aria-hidden /></span>
                    </span>
                    <span className="absolute left-2 top-2 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white tnum">{c.event}</span>
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-[12px] font-semibold text-ink-950">{c.athlete}</p>
                    <p className="text-[11px] text-ink-600 tnum">{c.clock} · {c.game}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </DashCard>

          {/* Activity chart */}
          <DashCard title={t('scoutDash.activity.title')}>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoutActivityByGame} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoutActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A0A0B" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#0A0A0B" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E6E6E9" vertical={false} />
                  <XAxis dataKey="game" tick={{ fontSize: 12, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E6E6E9', fontSize: 13 }} />
                  <Area type="monotone" dataKey="events" stroke="#0A0A0B" strokeWidth={2.5} fill="url(#scoutActivity)" dot={{ r: 4, fill: '#F97316', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashCard>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <DashCard title={t('scoutDash.watchlist.title')}>
            <ul className="space-y-3">
              {scoutWatchlist.map((w) => {
                const a = getAthlete(w.athleteId);
                if (!a) return null;
                const max = Math.max(...w.spark);
                return (
                  <li key={w.athleteId} className="flex items-center gap-3">
                    <MonogramAvatar name={a.name} size={36} />
                    <div className="min-w-0 flex-1">
                      <Link to={`/athletes/${a.id}`} className="truncate text-[13px] font-semibold text-ink-950 hover:text-brand-600">{a.name}</Link>
                      <div className="mt-1 flex h-4 items-end gap-[2px]" aria-hidden>
                        {w.spark.map((v, i) => (
                          <span key={i} className={cn('w-1.5 rounded-sm', i === w.spark.length - 1 ? 'bg-brand-500' : 'bg-paper-100')} style={{ height: `${(v / max) * 100}%` }} />
                        ))}
                      </div>
                    </div>
                    <span className="rounded-lg bg-ink-950 px-2 py-1 font-display text-[12px] font-extrabold text-white tnum">{w.lastEval.toFixed(1)}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', 'bg-ink-950 text-white')}>
                      {t('scoutDash.watchlist.following')}
                    </span>
                  </li>
                );
              })}
            </ul>
          </DashCard>

          <DashCard title={t('scoutDash.drafts.title')}>
            <ul className="space-y-3">
              {scoutDrafts.map((d) => {
                const a = getAthlete(d.athleteId);
                return (
                  <li key={d.id} className="rounded-xl border border-line p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-ink-950">{a?.name}</p>
                      <span className="text-[11px] text-ink-600 tnum">{d.progress}%</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-paper-100">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${d.progress}%` }} />
                    </div>
                    <Link to="#reports" className="mt-2 inline-block text-[12px] font-semibold text-brand-600 hover:text-brand-500">
                      {t('scoutDash.drafts.continue')} →
                    </Link>
                  </li>
                );
              })}
            </ul>
          </DashCard>

          <DashCard title={t('scoutDash.trust.title')}>
            <p className="font-display text-[36px] font-extrabold leading-none text-ink-950 tnum">67%</p>
            <p className="mt-2 flex items-start gap-1.5 text-[12px] text-ink-600">
              <TrendingUp size={14} className="mt-0.5 shrink-0 text-success" aria-hidden />
              {t('scoutDash.trust.body')}
            </p>
          </DashCard>
        </div>
      </div>
    </div>
  );
}

function WatchedView({ t, onEval, onClip }: { t: TFn; onEval: (id: string) => void; onClip: () => void }) {
  const [posFilter, setPosFilter] = useState<string>('all');
  const positions = ['Base', 'Extremo', 'Poste'];
  const rows = scoutWatchlist
    .map((w) => ({ w, a: getAthlete(w.athleteId) }))
    .filter((r): r is { w: (typeof scoutWatchlist)[number]; a: NonNullable<ReturnType<typeof getAthlete>> } => Boolean(r.a))
    .filter((r) => posFilter === 'all' || r.a.position.includes(posFilter));

  return (
    <DashCard title={t('scoutDash.watchedTab.title')}>
      <div className="mb-4 flex flex-wrap gap-2">
        {['all', ...positions].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPosFilter(p)}
            className={cn(
              'h-9 cursor-pointer rounded-full border px-3.5 text-[13px] font-semibold transition-colors',
              posFilter === p ? 'border-ink-950 bg-ink-950 text-white' : 'border-line text-ink-600 hover:border-ink-950',
            )}
          >
            {p === 'all' ? t('scoutDash.watchedTab.all') : p}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
              <th className="pb-2 pr-3">{t('nav.athletes')}</th>
              <th className="pb-2 pr-3">{t('common.position')}</th>
              <th className="pb-2 pr-3">OVR</th>
              <th className="pb-2 pr-3">{t('scoutDash.watchedTab.lastEval')}</th>
              <th className="pb-2 pr-3">{t('scoutDash.watchedTab.trend')}</th>
              <th className="pb-2 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ w, a }) => (
              <tr key={a.id} className="border-b border-line/60 last:border-0 hover:bg-paper-50">
                <td className="py-2.5 pr-3">
                  <span className="flex items-center gap-2.5">
                    <MonogramAvatar name={a.name} size={32} />
                    <Link to={`/athletes/${a.id}`} className="font-semibold text-ink-950 hover:text-brand-600">{a.name}</Link>
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-ink-600">{a.position}</td>
                <td className="py-2.5 pr-3">
                  <span className="flex items-center gap-1.5">
                    <OvrSquare value={a.ovr.value} size={28} />
                    <PotChip value={a.pot} />
                  </span>
                </td>
                <td className="py-2.5 pr-3 font-display font-extrabold tnum">{w.lastEval.toFixed(1)}/10</td>
                <td className={cn('py-2.5 pr-3 font-semibold tnum', w.trend >= 0 ? 'text-success' : 'text-danger')}>
                  {w.trend >= 0 ? '+' : ''}{w.trend.toFixed(1)}
                </td>
                <td className="py-2.5">
                  <div className="flex justify-end gap-1.5">
                    <button type="button" onClick={() => onEval(a.id)} className={cn(btnOutline, 'h-8 px-2.5 text-[12px]')}>
                      {t('scoutDash.watchedTab.newEval')}
                    </button>
                    <button type="button" onClick={onClip} className={cn(btnGhost, 'h-8 px-2.5 text-[12px]')}>
                      {t('scoutDash.watchedTab.createClip')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashCard>
  );
}

function ReportsView({
  t,
  formatDate,
  myReports,
  created,
  publishedCount,
  onNew,
}: {
  t: TFn;
  formatDate: FDate;
  myReports: ScoutReport[];
  created: CreatedReport[];
  publishedCount: number;
  onNew: () => void;
}) {
  const { locale } = useI18n();
  const [sub, setSub] = useState<'published' | 'drafts'>('published');
  const createdPublished = created.filter((r) => r.status === 'published');
  const createdDrafts = created.filter((r) => r.status === 'draft');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsUnderline
          id="scout-reports"
          active={sub}
          onChange={(id) => setSub(id as 'published' | 'drafts')}
          tabs={[
            { id: 'published', label: `${t('scoutDash.reportsTab.published')} (${publishedCount})` },
            { id: 'drafts', label: `${t('scoutDash.reportsTab.draftsLabel')} (${scoutDrafts.length + createdDrafts.length})` },
          ]}
        />
        <button type="button" onClick={onNew} className={cn(btnPrimary, 'h-9 px-3 text-[13px]')}>
          <FileText size={14} aria-hidden />
          {t('scoutDash.reportsTab.new')}
        </button>
      </div>

      {sub === 'published' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {createdPublished.map((r) => {
            const a = getAthlete(r.athleteId);
            const avg = Object.values(r.ratings).reduce((s, v) => s + v, 0) / Math.max(1, Object.values(r.ratings).length);
            const grade = avg >= 8 ? 'A' : avg >= 6.5 ? 'B' : avg >= 5 ? 'C' : 'D';
            return (
              <div key={r.id} className="rounded-xl border border-line bg-white p-5">
                <div className="flex items-center gap-3">
                  <MonogramAvatar name={a?.name ?? '?'} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-ink-950">{a?.name}</p>
                    <p className="text-[12px] text-ink-600 tnum">{r.context || '—'} · {formatDate(r.date)}</p>
                  </div>
                  <span className="rounded-lg bg-ink-950 px-2 py-1 font-display text-[13px] font-extrabold text-white">{grade}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.strengths.map((s) => (
                    <span key={s} className="rounded-full bg-paper-100 px-2.5 py-0.5 text-[11px] font-semibold text-ink-950">{s}</span>
                  ))}
                </div>
                <p className="mt-3 text-[12px] font-medium text-ink-600">
                  {t('scoutDash.form.recommendation')}: {t(`scoutDash.form.rec.${r.recommendation}`)} · {r.visibility === 'clubs' ? t('scoutDash.form.visClubs') : t('scoutDash.form.visPublic')}
                </p>
              </div>
            );
          })}
          {myReports.map((r) => {
            const a = getAthlete(r.athleteId);
            return (
              <div key={r.id} className="rounded-xl border border-line bg-white p-5">
                <div className="flex items-center gap-3">
                  <MonogramAvatar name={a?.name ?? '?'} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-ink-950">{a?.name}</p>
                    <p className="text-[12px] text-ink-600 tnum">{formatDate(r.date)}</p>
                  </div>
                  <span className="rounded-lg bg-ink-950 px-2 py-1 font-display text-[13px] font-extrabold text-white">{r.grade}</span>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-950">{locale === 'pt-PT' ? r.summaryPt : r.summaryEn}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.strengths.map((s) => (
                    <span key={s} className="rounded-full bg-paper-100 px-2.5 py-0.5 text-[11px] font-semibold text-ink-950">{s}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[...scoutDrafts.map((d) => ({ id: d.id, name: getAthlete(d.athleteId)?.name ?? '—', date: d.updatedAt, progress: d.progress })),
            ...createdDrafts.map((d) => ({ id: d.id, name: getAthlete(d.athleteId)?.name ?? '—', date: d.date, progress: 50 })),
          ].map((d) => (
            <div key={d.id} className="rounded-xl border border-dashed border-line bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-semibold text-ink-950">{d.name}</p>
                <span className="text-[11px] text-ink-600 tnum">{d.progress}% · {formatDate(d.date)}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-paper-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${d.progress}%` }} />
              </div>
              <button type="button" onClick={onNew} className="mt-3 text-[13px] font-semibold text-brand-600 hover:text-brand-500">
                {t('scoutDash.drafts.continue')} →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoutingHistoryView({ t, formatDate }: { t: TFn; formatDate: FDate }) {
  return (
    <div className="space-y-5">
      {/* Live CTA banner */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl bg-ink-950 p-5 text-white">
        <span className="relative flex h-2.5 w-2.5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500" />
        </span>
        <p className="min-w-0 flex-1 text-[14px] font-semibold">{t('scoutDash.liveBanner')}</p>
        <Link to="/match-scouting/demo-match" className={cn(btnPrimary, 'h-11 px-5')}>
          <Radio size={16} aria-hidden />
          {t('scoutDash.upcoming.open')}
        </Link>
      </div>

      <DashCard title={t('scoutDash.matchScoutingTab.title')}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                <th className="pb-2 pr-3">{t('scoutDash.matchScoutingTab.match')}</th>
                <th className="pb-2 pr-3">{t('athleteDash.table.date')}</th>
                <th className="pb-2 pr-3 text-right">{t('scoutDash.matchScoutingTab.events')}</th>
                <th className="pb-2 pr-3 text-right">{t('scoutDash.matchScoutingTab.clips')}</th>
                <th className="pb-2 pr-3">{t('scoutDash.matchScoutingTab.report')}</th>
                <th className="pb-2 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {scoutMatchHistory.map((m) => (
                <tr key={m.id} className="border-b border-line/60 last:border-0 hover:bg-paper-50">
                  <td className="py-2.5 pr-3 font-semibold text-ink-950">{m.match}</td>
                  <td className="py-2.5 pr-3 text-ink-600 tnum">{formatDate(m.date)}</td>
                  <td className="py-2.5 pr-3 text-right tnum">{m.events}</td>
                  <td className="py-2.5 pr-3 text-right tnum">{m.clips}</td>
                  <td className="py-2.5 pr-3">
                    {m.hasReport ? (
                      <span className="inline-flex items-center gap-1 text-success"><ClipboardList size={14} aria-hidden />✓</span>
                    ) : (
                      <span className="text-ink-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    <Link to="/match-scouting/demo-match" className="text-[12px] font-semibold text-brand-600 hover:text-brand-500">
                      {t('scoutDash.matchScoutingTab.reopen')} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>
    </div>
  );
}

const RECO_COLS: RecoColumn[] = ['follow', 'recommended', 'accepted'];

function RecoView({
  t,
  board,
  onMove,
  onAskAccept,
}: {
  t: TFn;
  board: Record<RecoColumn, string[]>;
  onMove: (id: string, from: RecoColumn, to: RecoColumn) => void;
  onAskAccept: (id: string, from: RecoColumn) => void;
}) {
  const colRefs = useRef<Record<RecoColumn, HTMLDivElement | null>>({ follow: null, recommended: null, accepted: null });

  const handleDrop = (athleteId: string, from: RecoColumn, point: { x: number; y: number }) => {
    for (const col of RECO_COLS) {
      const el = colRefs.current[col];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom) {
        if (col === from) return;
        if (col === 'accepted') onAskAccept(athleteId, from);
        else onMove(athleteId, from, col);
        return;
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {RECO_COLS.map((col) => (
        <div
          key={col}
          ref={(el) => {
            colRefs.current[col] = el;
          }}
          className="rounded-xl border border-line bg-paper-50 p-3"
        >
          <div className="mb-3 flex items-center gap-2 px-1">
            <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden />
            <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink-950">{t(`scoutDash.reco.${col}`)}</h3>
            <span className="ml-auto rounded-full bg-paper-100 px-2 py-0.5 text-[11px] font-bold text-ink-600 tnum">{board[col].length}</span>
          </div>
          <div className="space-y-2.5">
            {board[col].map((athleteId) => {
              const a = getAthlete(athleteId);
              if (!a) return null;
              return (
                <motion.div
                  key={athleteId}
                  layout
                  layoutId={athleteId}
                  drag
                  dragSnapToOrigin
                  onDragEnd={(_, info) => handleDrop(athleteId, col, info.point)}
                  whileDrag={{ scale: 1.03, zIndex: 30 }}
                  className="relative cursor-grab rounded-xl border border-line bg-white p-3.5 shadow-[0_1px_2px_rgba(10,10,11,.05)] active:cursor-grabbing"
                >
                  <div className="flex items-center gap-3">
                    <MonogramAvatar name={a.name} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink-950">{a.name}</p>
                      <p className="text-[11px] text-ink-600">{a.position}</p>
                    </div>
                    <OvrSquare value={a.ovr.value} size={30} />
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {RECO_COLS.filter((c) => c !== col).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => (c === 'accepted' ? onAskAccept(athleteId, col) : onMove(athleteId, col, c))}
                        className="cursor-pointer rounded-full bg-paper-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-600 hover:bg-ink-950 hover:text-white"
                      >
                        → {t(`scoutDash.reco.${c}`)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
