/**
 * ClubDashboard (/dashboard/club) — design: club-dashboard.md ("MY CLUB").
 * Demo session: Atlético Achada. Uses DashboardShell.
 * Views (hash-synced tabs): #overview · #roster · #matches · #stats · #scouting · #reports · #billing.
 * Demo CRUD persists to localStorage under shs-club-*.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CalendarClock,
  CreditCard,
  Download,
  FileText,
  LayoutDashboard,
  Play,
  Plus,
  Radar,
  Search,
  Trophy,
  UserCog,
  Users,
  Video,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardShell, { type ShellMenuSection } from '@/components/DashboardShell';
import { useI18n, useT } from '@/i18n';
import { useDemoSession } from '@/data/demoSession';
import { getAthlete, scoutReports, videos } from '@/data';
import {
  clubDevHighlights,
  clubInvoices,
  clubMatchRows,
  clubPerformanceSeries,
  clubPlayerStats,
  clubRankingRows,
  clubScoutedMatches,
  clubShortlistBoard,
  clubStaff,
  clubUpcomingMatches,
  clubUsageMeters,
  type ClubMatchRow,
  type ShortlistColumn,
} from '@/data/extra-dash-a';
import StatTile from '@/components/shared/StatTile';
import StatusBadge from '@/components/shared/StatusBadge';
import TabsUnderline from '@/components/shared/TabsUnderline';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import OvrSquare from '@/components/shared/OvrSquare';
import { cn } from '@/lib/utils';
import {
  btnGhost,
  btnOutline,
  btnPrimary,
  btnSecondary,
  DashCard,
  DashModal,
  inputCls,
  labelCls,
  loadLS,
  saveLS,
  StatTileSkeleton,
  UsageMeter,
  useHashTab,
  useSimulatedLoading,
  useToasts,
} from '@/components/dashboards-a/ui';

const LS_ROSTER = 'shs-club-roster';
const LS_MATCHES = 'shs-club-matches';
const LS_SHORTLIST = 'shs-club-shortlist';

const TABS = ['overview', 'roster', 'matches', 'stats', 'scouting', 'reports', 'billing'] as const;
type Tab = (typeof TABS)[number];

interface RosterState {
  invited: string[];
  removed: string[];
}

export default function ClubDashboard() {
  const t = useT();
  const { formatDate, formatNumber } = useI18n();
  const { persona } = useDemoSession();
  const loading = useSimulatedLoading(600);
  const { push, stack } = useToasts();
  const [tab, setTab] = useHashTab(TABS, 'overview');

  const [roster, setRoster] = useState<RosterState>(() => loadLS(LS_ROSTER, { invited: [], removed: [] }));
  const [clubMatches, setClubMatches] = useState<ClubMatchRow[]>(() => loadLS(LS_MATCHES, clubMatchRows));
  const [shortlist, setShortlist] = useState<Record<ShortlistColumn, string[]>>(() => loadLS(LS_SHORTLIST, clubShortlistBoard));

  useEffect(() => saveLS(LS_ROSTER, roster), [roster]);
  useEffect(() => saveLS(LS_MATCHES, clubMatches), [clubMatches]);
  useEffect(() => saveLS(LS_SHORTLIST, shortlist), [shortlist]);

  /* modals */
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ competition: '', opponent: '', date: '', venue: '' });
  const [publishTarget, setPublishTarget] = useState<string | null>(null);
  const [scoreUs, setScoreUs] = useState('');
  const [scoreThem, setScoreThem] = useState('');

  const clubName = persona?.name ?? 'Atlético Achada';

  const invite = () => {
    const name = inviteName.trim();
    if (!name) return;
    setRoster((r) => ({ ...r, invited: [name, ...r.invited] }));
    setInviteName('');
    setInviteOpen(false);
    push(t('clubDash.toasts.invited'));
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    setRoster((r) => ({ ...r, removed: [...r.removed, removeTarget], invited: r.invited.filter((n) => n !== removeTarget) }));
    setRemoveTarget(null);
    push(t('clubDash.toasts.removed'));
  };

  const scheduleGame = () => {
    if (!scheduleForm.opponent || !scheduleForm.date) return;
    setClubMatches((rows) => [
      {
        id: `gm-${Date.now()}`,
        date: scheduleForm.date,
        competition: scheduleForm.competition || 'INTER LICEU 2027',
        opponent: scheduleForm.opponent,
        result: null,
        scoutingAssigned: false,
        statsVerifiedByClub: false,
      },
      ...rows,
    ]);
    setScheduleForm({ competition: '', opponent: '', date: '', venue: '' });
    setScheduleOpen(false);
    push(t('clubDash.toasts.gameSaved'));
  };

  const publishResult = () => {
    if (!publishTarget || !scoreUs || !scoreThem) return;
    const us = Number(scoreUs);
    const them = Number(scoreThem);
    const tag = us >= them ? 'V' : 'D';
    setClubMatches((rows) =>
      rows.map((m) =>
        m.id === publishTarget ? { ...m, result: `${tag} ${us}–${them}`, statsVerifiedByClub: true } : m,
      ),
    );
    setPublishTarget(null);
    setScoreUs('');
    setScoreThem('');
    push(t('clubDash.toasts.resultPublished'));
  };

  const moveShortlist = (athleteId: string, from: ShortlistColumn, to: ShortlistColumn) => {
    if (from === to) return;
    setShortlist((b) => ({
      ...b,
      [from]: b[from].filter((id) => id !== athleteId),
      [to]: [athleteId, ...b[to]],
    }));
    push(t('clubDash.toasts.moved'));
  };

  const sections: ShellMenuSection[] = [
    {
      label: t('clubDash.menu.groupMain'),
      items: [
        { to: '#overview', label: t('clubDash.menu.overview'), icon: LayoutDashboard },
        { to: '#roster', label: t('clubDash.menu.roster'), icon: Users },
        { to: '#roster', label: t('clubDash.menu.staff'), icon: UserCog },
        { to: '#matches', label: t('clubDash.menu.matches'), icon: CalendarClock },
        { to: '#stats', label: t('clubDash.menu.stats'), icon: BarChart3 },
      ],
    },
    {
      label: t('clubDash.menu.groupScouting'),
      items: [
        { to: '#scouting', label: t('clubDash.menu.scouting'), icon: Radar },
        { to: '#reports', label: t('clubDash.menu.reports'), icon: FileText },
        { to: '#reports', label: t('clubDash.menu.videos'), icon: Video },
        { to: '#stats', label: t('clubDash.menu.rankings'), icon: Trophy },
      ],
    },
    {
      label: t('clubDash.menu.groupAccount'),
      items: [{ to: '#billing', label: t('clubDash.menu.billing'), icon: CreditCard }],
    },
  ];

  return (
    <DashboardShell
      title={t('clubDash.title')}
      sections={sections}
      plan={{ name: t('clubDash.planCard.name'), usageLabel: t('clubDash.planCard.usage'), usagePct: 90 }}
      actions={
        <Link to="/match-scouting/demo-match" className={cn(btnPrimary, 'h-9 px-3 text-[13px]')}>
          <Radar size={15} aria-hidden />
          <span className="hidden sm:inline">{t('clubDash.quick.newScouting')}</span>
        </Link>
      }
    >
      <div className="mb-5">
        <h1 className="font-display text-[28px] font-extrabold tracking-tight text-ink-950">{clubName}</h1>
        <p className="mt-1 text-[13px] text-ink-600">
          {t('clubDash.planCard.name')} · {t('common.season')} 2026/27
        </p>
      </div>

      <TabsUnderline
        id="club-dash"
        active={tab}
        onChange={(id) => setTab(id as Tab)}
        tabs={TABS.map((id) => ({ id, label: t(`clubDash.menu.${id === 'reports' ? 'reports' : id}`) }))}
        className="mb-6"
      />

      {tab === 'overview' && (
        <OverviewView
          loading={loading}
          t={t}
          formatDate={formatDate}
          onAddGame={() => setScheduleOpen(true)}
          onManagePlan={() => setTab('billing')}
        />
      )}
      {tab === 'roster' && (
        <RosterView
          t={t}
          roster={roster}
          onInvite={() => setInviteOpen(true)}
          onRemove={(name) => setRemoveTarget(name)}
        />
      )}
      {tab === 'matches' && (
        <MatchesView
          t={t}
          formatDate={formatDate}
          matches={clubMatches}
          onSchedule={() => setScheduleOpen(true)}
          onPublish={(id) => setPublishTarget(id)}
        />
      )}
      {tab === 'stats' && <StatsView t={t} onExport={() => push(t('clubDash.toasts.export'))} />}
      {tab === 'scouting' && (
        <ScoutingView t={t} formatDate={formatDate} board={shortlist} onMove={moveShortlist} />
      )}
      {tab === 'reports' && <ReportsView t={t} formatDate={formatDate} onUpload={() => push(t('clubDash.toasts.videoAdded'))} />}
      {tab === 'billing' && <BillingView t={t} formatDate={formatDate} formatNumber={formatNumber} />}

      {/* Invite athlete modal */}
      <DashModal open={inviteOpen} onClose={() => setInviteOpen(false)} title={t('clubDash.roster.inviteTitle')}>
        <label className={labelCls}>{t('clubDash.roster.invite')}</label>
        <input
          className={inputCls}
          placeholder={t('clubDash.roster.invitePlaceholder')}
          value={inviteName}
          onChange={(e) => setInviteName(e.target.value)}
        />
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={() => setInviteOpen(false)}>{t('common.close')}</button>
          <button type="button" className={btnPrimary} onClick={invite} disabled={!inviteName.trim()}>
            {t('clubDash.roster.inviteSend')}
          </button>
        </div>
      </DashModal>

      {/* Remove confirm */}
      <DashModal open={removeTarget !== null} onClose={() => setRemoveTarget(null)} title={t('clubDash.roster.remove')}>
        <p className="text-[14px] text-ink-950">{t('clubDash.roster.removeConfirm', { name: removeTarget ?? '' })}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={() => setRemoveTarget(null)}>{t('common.close')}</button>
          <button type="button" className={btnPrimary} onClick={confirmRemove}>{t('clubDash.roster.remove')}</button>
        </div>
      </DashModal>

      {/* Schedule game modal */}
      <DashModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title={t('clubDash.matches.scheduleTitle')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t('clubDash.matches.competition')}</label>
            <input className={inputCls} value={scheduleForm.competition} onChange={(e) => setScheduleForm({ ...scheduleForm, competition: e.target.value })} placeholder="INTER LICEU 2027" />
          </div>
          <div>
            <label className={labelCls}>{t('clubDash.matches.opponent')}</label>
            <input className={inputCls} value={scheduleForm.opponent} onChange={(e) => setScheduleForm({ ...scheduleForm, opponent: e.target.value })} placeholder="Estrela do Sul" />
          </div>
          <div>
            <label className={labelCls}>{t('clubDash.matches.date')}</label>
            <input type="datetime-local" className={inputCls} value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t('clubDash.matches.venue')}</label>
            <input className={inputCls} value={scheduleForm.venue} onChange={(e) => setScheduleForm({ ...scheduleForm, venue: e.target.value })} placeholder="Pavilhão da Várzea, Praia" />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={() => setScheduleOpen(false)}>{t('common.close')}</button>
          <button type="button" className={btnPrimary} onClick={scheduleGame} disabled={!scheduleForm.opponent || !scheduleForm.date}>
            {t('clubDash.matches.save')}
          </button>
        </div>
      </DashModal>

      {/* Publish result modal */}
      <DashModal
        open={publishTarget !== null}
        onClose={() => setPublishTarget(null)}
        title={t('clubDash.matches.publishTitle', { opponent: clubMatches.find((m) => m.id === publishTarget)?.opponent ?? '' })}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('clubDash.matches.scoreUs')}</label>
            <input inputMode="numeric" className={cn(inputCls, 'tnum')} value={scoreUs} onChange={(e) => setScoreUs(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t('clubDash.matches.scoreThem')}</label>
            <input inputMode="numeric" className={cn(inputCls, 'tnum')} value={scoreThem} onChange={(e) => setScoreThem(e.target.value)} />
          </div>
        </div>
        <p className="mt-3 rounded-lg bg-paper-50 px-3 py-2.5 text-[12px] text-ink-600">{t('clubDash.matches.boxNote')}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={() => setPublishTarget(null)}>{t('common.close')}</button>
          <button type="button" className={btnPrimary} onClick={publishResult} disabled={!scoreUs || !scoreThem}>
            {t('clubDash.matches.publish')}
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
type FNum = ReturnType<typeof useI18n>['formatNumber'];

function OverviewView({
  loading,
  t,
  formatDate,
  onAddGame,
  onManagePlan,
}: {
  loading: boolean;
  t: TFn;
  formatDate: FDate;
  onAddGame: () => void;
  onManagePlan: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }, (_, i) => <StatTileSkeleton key={i} />)
        ) : (
          <>
            <StatTile label={t('clubDash.kpi.athletes')} value={42} delta={3} />
            <StatTile label={t('clubDash.kpi.games')} value={18} deltaLabel={t('clubDash.kpi.record')} />
            <StatTile label={t('clubDash.kpi.reports')} value={34} delta={5} />
            <StatTile label={t('clubDash.kpi.scoutingUsed')} value="18/20" spark={[2, 1, 2, 3, 2, 4]} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Upcoming matches */}
          <DashCard
            title={t('clubDash.upcoming.title')}
            action={
              <button type="button" onClick={onAddGame} className={cn(btnOutline, 'h-9 px-3 text-[13px]')}>
                <Plus size={14} aria-hidden />
                {t('clubDash.upcoming.add')}
              </button>
            }
          >
            <ul className="divide-y divide-line">
              {clubUpcomingMatches.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
                    m.home ? 'bg-ink-950 text-white' : 'bg-paper-100 text-ink-600',
                  )}>
                    {m.home ? t('clubDash.upcoming.home') : t('clubDash.upcoming.away')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-ink-950">× {m.opponent}</p>
                    <p className="text-[12px] text-ink-600">{m.competition} · {m.venue}</p>
                  </div>
                  <span className="text-[13px] font-medium text-ink-600 tnum">
                    {formatDate(m.date, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          </DashCard>

          {/* Team performance */}
          <DashCard title={t('clubDash.performance.title')}>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={clubPerformanceSeries} margin={{ top: 8, right: 0, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#E6E6E9" vertical={false} />
                  <XAxis dataKey="game" tick={{ fontSize: 12, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="pts" tick={{ fontSize: 12, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="eff" orientation="right" domain={[0, 100]} tick={{ fontSize: 12, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E6E6E9', fontSize: 13 }} />
                  <Bar yAxisId="pts" dataKey="pts" name={t('clubDash.performance.pts')} fill="#0A0A0B" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Line yAxisId="eff" type="monotone" dataKey="eff" name={t('clubDash.performance.eff')} stroke="#F97316" strokeWidth={2.5} dot={{ r: 3, fill: '#F97316', strokeWidth: 0 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex gap-4 text-[12px] font-medium text-ink-600">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-ink-950" aria-hidden />{t('clubDash.performance.pts')}</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-brand-500" aria-hidden />{t('clubDash.performance.eff')}</span>
            </div>
          </DashCard>

          {/* Player development highlights */}
          <DashCard title={t('clubDash.development.title')}>
            <ul className="divide-y divide-line">
              {clubDevHighlights.map((d) => {
                const a = getAthlete(d.athleteId);
                if (!a) return null;
                return (
                  <li key={d.athleteId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <MonogramAvatar name={a.name} size={36} />
                    <div className="min-w-0 flex-1">
                      <Link to={`/athletes/${a.id}`} className="text-[14px] font-semibold text-ink-950 hover:text-brand-600">{a.name}</Link>
                      <p className="text-[12px] text-ink-600 tnum">{d.note}</p>
                    </div>
                    <span className="rounded-full bg-success/10 px-2.5 py-1 text-[12px] font-bold text-success tnum">
                      ▲{d.delta} {t('clubDash.development.delta')}
                    </span>
                  </li>
                );
              })}
            </ul>
          </DashCard>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <DashCard title={t('clubDash.usage.title')}>
            <p className="mb-4 text-[13px] font-semibold text-ink-950">{t('clubDash.usage.plan')}</p>
            <div className="space-y-4">
              <UsageMeter label={t('clubDash.usage.games')} used={clubUsageMeters.games.used} total={clubUsageMeters.games.total} warnLabel={t('clubDash.usage.nearLimit')} />
              <UsageMeter label={t('clubDash.usage.athletes')} used={clubUsageMeters.athletes.used} total={clubUsageMeters.athletes.total} />
              <UsageMeter label={t('clubDash.usage.scouts')} used={clubUsageMeters.scouts.used} total={clubUsageMeters.scouts.total} />
              <UsageMeter label={t('clubDash.usage.reports')} used={clubUsageMeters.reports.used} total={clubUsageMeters.reports.total} />
              <UsageMeter label={t('clubDash.usage.video')} used={clubUsageMeters.videoGb.used} total={clubUsageMeters.videoGb.total} />
            </div>
            <button type="button" onClick={onManagePlan} className="mt-4 text-[13px] font-semibold text-brand-600 hover:text-brand-500">
              {t('clubDash.usage.manage')} →
            </button>
          </DashCard>

          <DashCard title={t('clubDash.quick.title')}>
            <div className="space-y-2.5">
              <Link to="/match-scouting/demo-match" className={cn(btnPrimary, 'w-full')}>
                <Radar size={15} aria-hidden />
                {t('clubDash.quick.newScouting')}
              </Link>
              <Link to="/discover" className={cn(btnOutline, 'w-full')}>
                <Search size={15} aria-hidden />
                {t('clubDash.quick.findPlayers')}
              </Link>
            </div>
          </DashCard>
        </div>
      </div>
    </div>
  );
}

function RosterView({
  t,
  roster,
  onInvite,
  onRemove,
}: {
  t: TFn;
  roster: RosterState;
  onInvite: () => void;
  onRemove: (name: string) => void;
}) {
  const players = clubPlayerStats
    .map((p) => ({ p, a: getAthlete(p.athleteId) }))
    .filter((r): r is { p: (typeof clubPlayerStats)[number]; a: NonNullable<ReturnType<typeof getAthlete>> } => Boolean(r.a))
    .filter((r) => !roster.removed.includes(r.a.name));

  return (
    <div className="space-y-5">
      <DashCard
        title={t('clubDash.roster.title')}
        action={
          <button type="button" onClick={onInvite} className={cn(btnPrimary, 'h-9 px-3 text-[13px]')}>
            <Plus size={14} aria-hidden />
            {t('clubDash.roster.invite')}
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                <th className="pb-2 pr-3">{t('clubDash.roster.colAthlete')}</th>
                <th className="pb-2 pr-3">{t('common.position')}</th>
                <th className="pb-2 pr-3 text-right">{t('clubDash.roster.colAge')}</th>
                <th className="pb-2 pr-3">OVR</th>
                <th className="pb-2 pr-3">{t('clubDash.roster.colStats')}</th>
                <th className="pb-2 pr-3">{t('clubDash.roster.colState')}</th>
                <th className="pb-2 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {players.map(({ p, a }) => (
                <tr key={a.id} className="border-b border-line/60 last:border-0 hover:bg-paper-50">
                  <td className="py-2.5 pr-3">
                    <span className="flex items-center gap-2.5">
                      <MonogramAvatar name={a.name} size={32} />
                      <Link to={`/athletes/${a.id}`} className="font-semibold text-ink-950 hover:text-brand-600">{a.name}</Link>
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-ink-600">{a.position}</td>
                  <td className="py-2.5 pr-3 text-right tnum">{2027 - a.birthYear}</td>
                  <td className="py-2.5 pr-3"><OvrSquare value={a.ovr.value} size={28} /></td>
                  <td className="py-2.5 pr-3 text-ink-600 tnum">{p.ppg} PTS · {p.apg} AST · {p.rpg} REB</td>
                  <td className="py-2.5 pr-3">
                    {a.verification === 'verified' ? <StatusBadge variant="verifiedProfile" /> : <StatusBadge variant="pending" />}
                  </td>
                  <td className="py-2.5 text-right">
                    <button type="button" onClick={() => onRemove(a.name)} className={cn(btnGhost, 'h-8 px-2.5 text-[12px] text-danger')}>
                      {t('clubDash.roster.remove')}
                    </button>
                  </td>
                </tr>
              ))}
              {roster.invited.map((name) => (
                <tr key={name} className="border-b border-line/60 last:border-0 hover:bg-paper-50">
                  <td className="py-2.5 pr-3">
                    <span className="flex items-center gap-2.5">
                      <MonogramAvatar name={name} size={32} />
                      <span className="font-semibold text-ink-950">{name}</span>
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-ink-600">—</td>
                  <td className="py-2.5 pr-3 text-right text-ink-600">—</td>
                  <td className="py-2.5 pr-3 text-ink-600">—</td>
                  <td className="py-2.5 pr-3 text-ink-600">—</td>
                  <td className="py-2.5 pr-3"><StatusBadge variant="pending" /></td>
                  <td className="py-2.5 text-right">
                    <button type="button" onClick={() => onRemove(name)} className={cn(btnGhost, 'h-8 px-2.5 text-[12px] text-danger')}>
                      {t('clubDash.roster.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>

      <DashCard title={t('clubDash.roster.staffTitle')}>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {clubStaff.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
              <MonogramAvatar name={s.name} size={36} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink-950">{s.name}</p>
                <p className="text-[12px] text-ink-600">{t(`clubDash.roster.staffRole.${s.role}`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </DashCard>
    </div>
  );
}

function MatchesView({
  t,
  formatDate,
  matches,
  onSchedule,
  onPublish,
}: {
  t: TFn;
  formatDate: FDate;
  matches: ClubMatchRow[];
  onSchedule: () => void;
  onPublish: (id: string) => void;
}) {
  return (
    <DashCard
      title={t('clubDash.matches.title')}
      action={
        <button type="button" onClick={onSchedule} className={cn(btnPrimary, 'h-9 px-3 text-[13px]')}>
          <Plus size={14} aria-hidden />
          {t('clubDash.matches.schedule')}
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
              <th className="pb-2 pr-3">{t('clubDash.matches.date')}</th>
              <th className="pb-2 pr-3">{t('clubDash.matches.competition')}</th>
              <th className="pb-2 pr-3">{t('clubDash.matches.opponent')}</th>
              <th className="pb-2 pr-3">{t('athleteDash.table.result')}</th>
              <th className="pb-2 pr-3">{t('athleteDash.table.status')}</th>
              <th className="pb-2 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id} className="border-b border-line/60 last:border-0 hover:bg-paper-50">
                <td className="py-2.5 pr-3 whitespace-nowrap text-ink-600 tnum">{formatDate(m.date, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="py-2.5 pr-3 text-[12px] font-semibold text-ink-600">{m.competition}</td>
                <td className="py-2.5 pr-3 font-semibold text-ink-950">{m.opponent}</td>
                <td className="py-2.5 pr-3 tnum">{m.result ?? t('clubDash.matches.scheduled')}</td>
                <td className="py-2.5 pr-3">
                  <div className="flex flex-wrap gap-1.5">
                    {m.scoutingAssigned && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-600">
                        {t('clubDash.matches.scoutingAssigned')}
                      </span>
                    )}
                    {m.statsVerifiedByClub && <StatusBadge variant="verifiedStats" />}
                  </div>
                </td>
                <td className="py-2.5 text-right">
                  {!m.result && (
                    <button type="button" onClick={() => onPublish(m.id)} className={cn(btnOutline, 'h-8 px-2.5 text-[12px]')}>
                      {t('clubDash.matches.publishResult')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashCard>
  );
}

function StatsView({ t, onExport }: { t: TFn; onExport: () => void }) {
  const avgPts = (clubPerformanceSeries.reduce((s, g) => s + g.pts, 0) / clubPerformanceSeries.length).toFixed(1);
  const avgEff = (clubPerformanceSeries.reduce((s, g) => s + g.eff, 0) / clubPerformanceSeries.length).toFixed(1);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={t('clubDash.performance.pts')} value={avgPts} />
        <StatTile label={t('clubDash.performance.eff')} value={`${avgEff}%`} delta={4} />
        <StatTile label={t('clubDash.kpi.games')} value={18} deltaLabel={t('clubDash.kpi.record')} />
        <StatTile label={t('clubDash.kpi.athletes')} value={42} />
      </div>

      <DashCard
        title={t('clubDash.stats.perPlayer')}
        action={
          <button type="button" onClick={onExport} className={cn(btnOutline, 'h-9 px-3 text-[13px]')} title={t('common.demoTooltip')}>
            <Download size={14} aria-hidden />
            {t('clubDash.stats.export')}
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                <th className="pb-2 pr-3">{t('clubDash.stats.player')}</th>
                <th className="pb-2 pr-3 text-right">{t('clubDash.stats.games')}</th>
                <th className="pb-2 pr-3 text-right">PTS</th>
                <th className="pb-2 pr-3 text-right">AST</th>
                <th className="pb-2 text-right">REB</th>
              </tr>
            </thead>
            <tbody>
              {clubPlayerStats.map((p) => {
                const a = getAthlete(p.athleteId);
                return (
                  <tr key={p.athleteId} className="border-b border-line/60 last:border-0 hover:bg-paper-50">
                    <td className="py-2.5 pr-3 font-semibold text-ink-950">{a?.name ?? p.athleteId}</td>
                    <td className="py-2.5 pr-3 text-right tnum">{p.games}</td>
                    <td className="py-2.5 pr-3 text-right font-display font-extrabold tnum">{p.ppg}</td>
                    <td className="py-2.5 pr-3 text-right tnum">{p.apg}</td>
                    <td className="py-2.5 text-right tnum">{p.rpg}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashCard>

      <DashCard title={t('clubDash.stats.rankingsTitle')}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                <th className="pb-2 pr-3">{t('clubDash.stats.player')}</th>
                <th className="pb-2 pr-3">{t('clubDash.stats.category')}</th>
                <th className="pb-2 pr-3 text-right">{t('clubDash.stats.rank')}</th>
                <th className="pb-2 text-right">Δ</th>
              </tr>
            </thead>
            <tbody>
              {clubRankingRows.map((r) => {
                const a = getAthlete(r.athleteId);
                return (
                  <tr key={r.athleteId} className="border-b border-line/60 last:border-0 hover:bg-paper-50">
                    <td className="py-2.5 pr-3 font-semibold text-ink-950">{a?.name ?? r.athleteId}</td>
                    <td className="py-2.5 pr-3">
                      <span className="rounded-full bg-paper-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-600">{r.category}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-display font-extrabold tnum">#{r.rank}</td>
                    <td className={cn('py-2.5 text-right font-semibold tnum', r.delta >= 0 ? 'text-success' : 'text-danger')}>
                      {r.delta >= 0 ? '▲' : '▼'}{Math.abs(r.delta)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashCard>
    </div>
  );
}

const SHORTLIST_COLS: ShortlistColumn[] = ['observe', 'contact', 'sign'];

function ScoutingView({
  t,
  formatDate,
  board,
  onMove,
}: {
  t: TFn;
  formatDate: FDate;
  board: Record<ShortlistColumn, string[]>;
  onMove: (id: string, from: ShortlistColumn, to: ShortlistColumn) => void;
}) {
  const colRefs = useRef<Record<ShortlistColumn, HTMLDivElement | null>>({ observe: null, contact: null, sign: null });

  const handleDrop = (athleteId: string, from: ShortlistColumn, point: { x: number; y: number }) => {
    for (const col of SHORTLIST_COLS) {
      const el = colRefs.current[col];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom) {
        if (col !== from) onMove(athleteId, from, col);
        return;
      }
    }
  };

  return (
    <div className="space-y-5">
      <DashCard title={t('clubDash.scouting.historyTitle')}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                <th className="pb-2 pr-3">{t('clubDash.matches.title')}</th>
                <th className="pb-2 pr-3">{t('clubDash.matches.date')}</th>
                <th className="pb-2 pr-3 text-right">{t('clubDash.scouting.events')}</th>
                <th className="pb-2 pr-3 text-right">{t('clubDash.scouting.clips')}</th>
                <th className="pb-2 pr-3">{t('clubDash.scouting.report')}</th>
                <th className="pb-2 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {clubScoutedMatches.map((m) => (
                <tr key={m.id} className="border-b border-line/60 last:border-0 hover:bg-paper-50">
                  <td className="py-2.5 pr-3 font-semibold text-ink-950">{m.match}</td>
                  <td className="py-2.5 pr-3 text-ink-600 tnum">{formatDate(m.date)}</td>
                  <td className="py-2.5 pr-3 text-right tnum">{m.events}</td>
                  <td className="py-2.5 pr-3 text-right tnum">{m.clips}</td>
                  <td className="py-2.5 pr-3">{m.report ? <StatusBadge variant="verifiedStats" /> : <span className="text-ink-600">—</span>}</td>
                  <td className="py-2.5 text-right">
                    <Link to="/match-scouting/demo-match" className="text-[12px] font-semibold text-brand-600 hover:text-brand-500">
                      {t('clubDash.scouting.reopen')} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-[17px] font-bold tracking-tight text-ink-950">{t('clubDash.scouting.shortlistTitle')}</h2>
          <span className="text-[11px] font-semibold text-ink-600">{t('clubDash.scouting.minorNote')}</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {SHORTLIST_COLS.map((col) => (
            <div
              key={col}
              ref={(el) => {
                colRefs.current[col] = el;
              }}
              className="rounded-xl border border-line bg-paper-50 p-3"
            >
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden />
                <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink-950">{t(`clubDash.scouting.${col}`)}</h3>
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
                      {a.guardianLinked && (
                        <p className="mt-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-info">
                          {t('clubDash.scouting.minorNote')}
                        </p>
                      )}
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {SHORTLIST_COLS.filter((c) => c !== col).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => onMove(athleteId, col, c)}
                            className="cursor-pointer rounded-full bg-paper-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-600 hover:bg-ink-950 hover:text-white"
                          >
                            → {t(`clubDash.scouting.${c}`)}
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
      </div>
    </div>
  );
}

function ReportsView({ t, formatDate, onUpload }: { t: TFn; formatDate: FDate; onUpload: () => void }) {
  const { locale } = useI18n();
  return (
    <div className="space-y-5">
      <DashCard title={t('clubDash.reportsTab.title')}>
        <ul className="divide-y divide-line">
          {scoutReports.slice(0, 3).map((r) => {
            const a = getAthlete(r.athleteId);
            return (
              <li key={r.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <MonogramAvatar name={a?.name ?? '?'} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-semibold text-ink-950">{a?.name}</p>
                    <span className="rounded-lg bg-ink-950 px-2 py-0.5 font-display text-[12px] font-extrabold text-white">{r.grade}</span>
                    <span className="text-[11px] text-ink-600 tnum">{formatDate(r.date)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[13px] text-ink-600">{locale === 'pt-PT' ? r.summaryPt : r.summaryEn}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </DashCard>

      <DashCard
        title={t('clubDash.reportsTab.videosTitle')}
        action={
          <button type="button" onClick={onUpload} className={cn(btnPrimary, 'h-9 px-3 text-[13px]')}>
            <Play size={14} aria-hidden />
            {t('clubDash.reportsTab.upload')}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {videos.slice(0, 4).map((v) => (
            <div key={v.id} className="group overflow-hidden rounded-xl border border-line">
              <div className="relative aspect-video overflow-hidden bg-ink-gradient">
                <img src={v.thumb} alt="" className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950/70 text-white"><Play size={14} aria-hidden /></span>
                </span>
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-[12px] font-semibold text-ink-950">{v.title}</p>
                <span className="mt-1.5 inline-block rounded-full bg-paper-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-600">
                  {v.visibility === 'public' ? t('clubDash.reportsTab.visibilityPublic') : t('clubDash.reportsTab.visibilityPrivate')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </DashCard>
    </div>
  );
}

function BillingView({ t, formatDate, formatNumber }: { t: TFn; formatDate: FDate; formatNumber: FNum }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <DashCard title={t('clubDash.billing.currentPlan')}>
          <p className="font-display text-[24px] font-extrabold text-ink-950">{t('clubDash.planCard.name')}</p>
          <p className="mt-1 text-[13px] text-ink-600 tnum">
            {t('clubDash.billing.perMonth')} <span className="text-[12px]">({t('clubDash.billing.eurHint')})</span>
          </p>
          <p className="mt-2 text-[12px] text-ink-600 tnum">{t('clubDash.billing.renewal', { date: formatDate('2027-02-01') })}</p>
          <Link to="/pricing" className={cn(btnSecondary, 'mt-4 w-full')}>
            {t('clubDash.billing.manage')}
          </Link>
        </DashCard>

        <DashCard title={t('clubDash.billing.paymentMethod')}>
          <p className="font-display text-[18px] font-extrabold text-ink-950 tnum">{t('clubDash.billing.cardNote')}</p>
          <p className="mt-3 rounded-lg border border-warning/40 bg-amber-50 px-3 py-2.5 text-[12px] font-medium text-warning">
            {t('clubDash.billing.forecast')}
          </p>
        </DashCard>

        <DashCard title={t('clubDash.usage.title')}>
          <div className="space-y-4">
            <UsageMeter label={t('clubDash.usage.games')} used={clubUsageMeters.games.used} total={clubUsageMeters.games.total} warnLabel={t('clubDash.usage.nearLimit')} />
            <UsageMeter label={t('clubDash.usage.athletes')} used={clubUsageMeters.athletes.used} total={clubUsageMeters.athletes.total} />
            <UsageMeter label={t('clubDash.usage.scouts')} used={clubUsageMeters.scouts.used} total={clubUsageMeters.scouts.total} />
          </div>
        </DashCard>
      </div>

      <DashCard title={t('clubDash.billing.invoices')}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                <th className="pb-2 pr-3">{t('clubDash.billing.invoice')}</th>
                <th className="pb-2 pr-3">{t('clubDash.billing.period')}</th>
                <th className="pb-2 pr-3 text-right">{t('clubDash.billing.amount')}</th>
                <th className="pb-2 pr-3">{t('clubDash.billing.statusLabel')}</th>
                <th className="pb-2 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {clubInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-line/60 last:border-0 hover:bg-paper-50">
                  <td className="py-2.5 pr-3 font-medium text-ink-950 tnum">{inv.id}</td>
                  <td className="py-2.5 pr-3 text-ink-600 tnum">{formatDate(`${inv.period}-01`, { month: 'long', year: 'numeric' })}</td>
                  <td className="py-2.5 pr-3 text-right font-display font-extrabold tnum">esc {formatNumber(inv.amountCve)}</td>
                  <td className="py-2.5 pr-3">
                    <span className="rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-success">
                      {t('clubDash.billing.paid')}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <button type="button" className={cn(btnGhost, 'h-8 px-2.5 text-[12px]')} title={t('common.demoTooltip')}>
                      <Download size={13} aria-hidden />
                      PDF
                    </button>
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
