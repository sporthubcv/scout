/**
 * Competition Detail (/competitions/:id) — full competition hub.
 * Flagship demo: INTER LICEU 2027 (basketball, 10 teams, groups A/B/C,
 * ✓ Competição Verificada). Tabs: Jogos, Classificação, Estatísticas, MVP,
 * Rankings, Scouting, Vídeos, Equipas, Patrocinadores.
 * Design spec: design/competition-detail.md.
 */
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  BarChart3,
  Bell,
  BellRing,
  ChevronRight,
  Eye,
  FileText,
  Lock,
  Play,
  Radio,
  Table2,
  Users,
  Video,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useI18n, useT } from '@/i18n';
import { cn } from '@/lib/utils';
import { videos, formatDuration, getMatch, getMatchEvents } from '@/data';
import {
  IL_PLAYED_GAMES,
  IL_PLAYERS_COUNT,
  IL_TEAM_PLAYERS,
  IL_TOTAL_GAMES,
  LEADER_CATEGORIES,
  boxScoreFor,
  getPublicAthlete,
  interLiceuClips,
  interLiceuFixtures,
  interLiceuLeaders,
  interLiceuReports,
  interLiceuTeamRadar,
  mvpRace,
  publicAthletes,
  demoAge,
  athleteDemoStats,
  type Fixture,
  type LeaderCategory,
} from '@/data/extra-public';
import { getPublicCompetition, VERIFIED_COMPETITIONS } from '@/data/extra-public';
import EmptyState from '@/components/shared/EmptyState';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import OvrSquare from '@/components/shared/OvrSquare';
import SponsorSlot from '@/components/shared/SponsorSlot';
import StatusBadge from '@/components/shared/StatusBadge';
import TabsUnderline from '@/components/shared/TabsUnderline';
import { useDemoToast } from '@/components/shared/DemoToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TAB_IDS = ['games', 'standings', 'stats', 'mvp', 'rankings', 'scouting', 'videos', 'teams', 'sponsors'] as const;
type TabId = (typeof TAB_IDS)[number];

const fmt1 = (n: number) => n.toFixed(1);

/* --------------------------- Jogos tab ------------------------------ */

function LiveMatchCard() {
  const t = useT();
  const { locale } = useI18n();
  const match = getMatch('demo-match');
  const events = getMatchEvents('demo-match');
  if (!match) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-2xl bg-ink-950 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge variant="live" />
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-white/60">
          {match.venue} · {t('competitionDetail.games.today')} {match.date.slice(11, 16)}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center gap-3">
          <MonogramAvatar name={match.homeTeam} size={48} />
          <p className="font-display text-[16px] font-bold text-white">{match.homeTeam}</p>
        </div>
        <div className="text-center">
          <p className="font-display text-[36px] font-extrabold leading-none text-white tnum">
            {match.homeScore}–{match.awayScore}
          </p>
          <p className="mt-1 text-[12px] font-bold text-brand-500 tnum">
            {match.quarter} · {match.clock}
          </p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <p className="text-right font-display text-[16px] font-bold text-white">{match.awayTeam}</p>
          <MonogramAvatar name={match.awayTeam} size={48} />
        </div>
      </div>
      <div className="mt-5 space-y-1.5 border-t border-ink-700 pt-4" aria-live="polite">
        {events.slice(-3).map((ev) => (
          <motion.p
            key={ev.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-[12px] text-white/70"
          >
            <span className="font-mono text-[11px] text-brand-500 tnum">{ev.quarter} {ev.clock}</span>
            {locale === 'en' ? ev.descriptionEn : ev.descriptionPt}
            {ev.clipMarked && <Video size={12} className="text-brand-500" aria-hidden />}
          </motion.p>
        ))}
      </div>
      <Link
        to="/match-scouting/demo-match"
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 font-semibold text-white transition-colors hover:bg-brand-600 active:scale-[0.97]"
      >
        <Radio size={16} aria-hidden />
        {t('competitionDetail.games.openScouting')} →
      </Link>
    </motion.div>
  );
}

function BoxScoreDialog({ fixture, onClose }: { fixture: Fixture | null; onClose: () => void }) {
  const t = useT();
  const box = fixture && fixture.status === 'finished' ? boxScoreFor(fixture) : null;
  const teamTable = (team: string, rows: NonNullable<typeof box>['home']) => (
    <div className="mt-4">
      <p className="mb-2 flex items-center gap-2 text-[13px] font-bold text-ink-950">
        <MonogramAvatar name={team} size={22} />
        {team}
      </p>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-[0.06em] text-ink-600">
            <th className="py-1 pr-2">{t('competitionDetail.games.colPlayer')}</th>
            <th className="py-1 pr-2 text-right">{t('competitionDetail.games.colPts')}</th>
            <th className="py-1 pr-2 text-right">{t('competitionDetail.games.colReb')}</th>
            <th className="py-1 text-right">{t('competitionDetail.games.colAst')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-line text-[13px]">
              <td className="py-1.5 pr-2 font-medium text-ink-950">
                {r.athleteId ? (
                  <Link to={`/athletes/${r.athleteId}`} className="text-brand-600 hover:text-brand-500">
                    {r.name}
                  </Link>
                ) : (
                  r.name
                )}
              </td>
              <td className="py-1.5 pr-2 text-right tnum">{r.pts}</td>
              <td className="py-1.5 pr-2 text-right tnum">{r.reb}</td>
              <td className="py-1.5 text-right tnum">{r.ast}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <Dialog open={!!fixture} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        {fixture && (
          <>
            <DialogHeader>
              <DialogTitle className="text-[16px]">
                {t('competitionDetail.games.boxScoreTitle', { home: fixture.homeTeam, away: fixture.awayTeam })}
              </DialogTitle>
            </DialogHeader>
            <p className="font-display text-[28px] font-extrabold text-ink-950 tnum">
              {fixture.homeScore}–{fixture.awayScore}
            </p>
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-success">
              <BadgeCheck size={13} aria-hidden />
              {t('competitionDetail.games.verifiedSheet')}
            </p>
            {box && (
              <>
                {teamTable(fixture.homeTeam, box.home)}
                {teamTable(fixture.awayTeam, box.away)}
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GamesTab() {
  const t = useT();
  const { formatDate } = useI18n();
  const [group, setGroup] = useState<string>('');
  const [round, setRound] = useState<string>('');
  const [sheetFixture, setSheetFixture] = useState<Fixture | null>(null);

  const rounds = useMemo(
    () => [...new Set(interLiceuFixtures.map((f) => f.round))].sort((a, b) => a - b),
    [],
  );
  const fixtures = interLiceuFixtures.filter(
    (f) => (!group || f.group === group) && (!round || f.round === Number(round)),
  );

  const byDate = useMemo(() => {
    const map = new Map<string, Fixture[]>();
    for (const f of fixtures) {
      const day = f.date.slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(f);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [fixtures]);

  const chipCls = (active: boolean) =>
    cn(
      'inline-flex h-9 cursor-pointer items-center rounded-full border px-3.5 text-[13px] font-semibold transition-colors',
      active ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white text-ink-950 hover:border-ink-950/40',
    );

  const statusLabel = (f: Fixture) =>
    f.status === 'live'
      ? t('competitionDetail.games.statusLive')
      : f.status === 'finished'
        ? t('competitionDetail.games.statusFinished')
        : t('competitionDetail.games.statusScheduled');

  return (
    <div className="space-y-8">
      <LiveMatchCard />

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setGroup('')} className={chipCls(group === '')}>
          {t('competitionDetail.games.allGroups')}
        </button>
        {['A', 'B', 'C'].map((g) => (
          <button key={g} type="button" onClick={() => setGroup(group === g ? '' : g)} className={chipCls(group === g)}>
            {t('competitionDetail.games.group', { g })}
          </button>
        ))}
        <select
          value={round}
          onChange={(e) => setRound(e.target.value)}
          className="h-9 cursor-pointer rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-ink-950"
        >
          <option value="">{t('competitionDetail.games.round', { n: '—' })}</option>
          {rounds.map((r) => (
            <option key={r} value={r}>
              {t('competitionDetail.games.round', { n: r })}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {byDate.map(([day, dayFixtures]) => (
          <div key={day}>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-600">
              {formatDate(day, { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
            <div className="overflow-hidden rounded-xl border border-line bg-white">
              {dayFixtures.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
                  className={cn(
                    'grid grid-cols-[52px_1fr_auto] items-center gap-3 border-t border-line px-4 py-3 first:border-t-0 sm:grid-cols-[64px_1fr_auto_1fr_120px]',
                  )}
                >
                  <span className="text-[12px] font-semibold text-ink-600 tnum">{f.date.slice(11, 16)}</span>
                  <div className="flex items-center gap-2">
                    <MonogramAvatar name={f.homeTeam} size={28} />
                    <span className="truncate text-[13px] font-semibold text-ink-950">{f.homeTeam}</span>
                  </div>
                  <span className="font-display text-[16px] font-extrabold text-ink-950 tnum">
                    {f.status === 'scheduled' ? 'vs' : `${f.homeScore}–${f.awayScore}`}
                  </span>
                  <div className="hidden items-center justify-end gap-2 sm:flex">
                    <span className="truncate text-right text-[13px] font-semibold text-ink-950">{f.awayTeam}</span>
                    <MonogramAvatar name={f.awayTeam} size={28} />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className={cn(
                        'hidden rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] lg:inline',
                        f.status === 'finished'
                          ? 'bg-paper-100 text-ink-600'
                          : f.status === 'live'
                            ? 'bg-danger text-white'
                            : 'border border-info/40 bg-blue-50 text-info',
                      )}
                    >
                      {statusLabel(f)}
                    </span>
                    {f.status === 'finished' && (
                      <button
                        type="button"
                        onClick={() => setSheetFixture(f)}
                        className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-line px-2.5 text-[12px] font-semibold text-ink-950 hover:border-ink-950"
                      >
                        <FileText size={13} aria-hidden />
                        {t('competitionDetail.games.sheet')}
                      </button>
                    )}
                    {f.id === 'demo-match' && (
                      <Link
                        to="/match-scouting/demo-match"
                        className="inline-flex h-8 items-center rounded-lg bg-brand-500 px-2.5 text-[12px] font-semibold text-white hover:bg-brand-600"
                      >
                        {t('competitionDetail.games.openScouting')}
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <BoxScoreDialog fixture={sheetFixture} onClose={() => setSheetFixture(null)} />
    </div>
  );
}

/* ------------------------- Classificação tab ------------------------ */

function StandingsTab({ teams }: { teams: NonNullable<import('@/data').Competition['teams']> }) {
  const t = useT();
  const [view, setView] = useState<'table' | 'chart'>('table');

  const groupNames = [...new Set(teams.map((tm) => tm.group))].sort();
  const withPts = teams.map((tm) => ({ ...tm, pts: tm.won * 2 + tm.lost, diff: tm.pointsFor - tm.pointsAgainst }));
  const chartData = withPts.map((tm) => ({ name: tm.name.split(' ').slice(0, 2).join(' '), pts: tm.pts, full: tm.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-ink-600" title={t('competitionDetail.standings.tiebreak')}>
          ⓘ {t('competitionDetail.standings.tiebreak')}
        </p>
        <button
          type="button"
          onClick={() => setView(view === 'table' ? 'chart' : 'table')}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-[13px] font-semibold text-ink-950 hover:border-ink-950"
        >
          {view === 'table' ? <BarChart3 size={15} aria-hidden /> : <Table2 size={15} aria-hidden />}
          {view === 'table' ? t('competitionDetail.standings.viewChart') : t('competitionDetail.standings.viewTable')}
        </button>
      </div>

      {view === 'chart' ? (
        <div className="rounded-xl border border-line bg-white p-5">
          <h3 className="mb-4 font-display text-[16px] font-bold text-ink-950">
            {t('competitionDetail.standings.chartTitle')}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -24, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid stroke="#E6E6E9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#3F4248' }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: '#3F4248' }} />
                <RTooltip labelFormatter={(_, payload) => (payload?.[0]?.payload as { full?: string })?.full ?? ''} />
                <Bar dataKey="pts" fill="#0A0A0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {groupNames.map((g) => {
            const gTeams = withPts
              .filter((tm) => tm.group === g)
              .sort((a, b) => b.pts - a.pts || b.diff - a.diff);
            return (
              <motion.div
                key={g}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-x-auto rounded-xl border border-line bg-white"
              >
                <p className="border-b border-line bg-paper-50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-600">
                  {t('competitionDetail.games.group', { g })}
                </p>
                <table className="w-full min-w-[300px] text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-[0.06em] text-ink-600">
                      <th className="px-4 py-2">{t('competitionDetail.standings.team')}</th>
                      <th className="px-2 py-2 text-right">{t('competitionDetail.standings.j')}</th>
                      <th className="px-2 py-2 text-right">{t('competitionDetail.standings.w')}</th>
                      <th className="px-2 py-2 text-right">{t('competitionDetail.standings.l')}</th>
                      <th className="px-2 py-2 text-right">{t('competitionDetail.standings.diff')}</th>
                      <th className="px-4 py-2 text-right">{t('competitionDetail.standings.pts')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gTeams.map((tm, i) => (
                      <tr
                        key={tm.id}
                        title={i < 2 ? t('competitionDetail.standings.playoffZone') : i === gTeams.length - 1 ? t('competitionDetail.standings.eliminated') : undefined}
                        className={cn(
                          'border-t border-line text-[13px] transition-colors hover:bg-paper-50',
                          i < 2 && 'border-l-[3px] border-l-brand-500',
                          i === gTeams.length - 1 && 'border-l-[3px] border-l-danger/60',
                        )}
                      >
                        <td className="px-4 py-2.5">
                          <span className="flex items-center gap-2 font-semibold text-ink-950">
                            <MonogramAvatar name={tm.name} size={24} />
                            <span className="truncate">{tm.name}</span>
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-right text-ink-600 tnum">{tm.played}</td>
                        <td className="px-2 py-2.5 text-right text-ink-600 tnum">{tm.won}</td>
                        <td className="px-2 py-2.5 text-right text-ink-600 tnum">{tm.lost}</td>
                        <td className={cn('px-2 py-2.5 text-right tnum', tm.diff >= 0 ? 'text-success' : 'text-danger')}>
                          {tm.diff >= 0 ? '+' : ''}{tm.diff}
                        </td>
                        <td className="px-4 py-2.5 text-right font-display font-extrabold text-ink-950 tnum">{tm.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------- Estatísticas tab ------------------------ */

function StatsTab() {
  const t = useT();
  const [cat, setCat] = useState<LeaderCategory>('pts');

  const sorted = [...interLiceuLeaders].sort((a, b) => b[cat] - a[cat]);
  const cardCats: { cat: LeaderCategory; labelKey: string }[] = [
    { cat: 'pts', labelKey: 'competitionDetail.statsTab.topScorer' },
    { cat: 'ast', labelKey: 'competitionDetail.statsTab.topAssister' },
    { cat: 'reb', labelKey: 'competitionDetail.statsTab.topRebounder' },
    { cat: 'efic', labelKey: 'competitionDetail.statsTab.topEfficiency' },
  ];
  const top4 = cardCats.map(({ cat: c, labelKey }) => ({
    label: t(labelKey),
    leader: [...interLiceuLeaders].sort((a, b) => b[c] - a[c])[0],
    cat: c,
  }));

  const radarDims = ['attack', 'defense', 'pace', 'discipline', 'form'] as const;
  const radarData = radarDims.map((d) => {
    const row: Record<string, string | number> = { dim: d.toUpperCase() };
    for (const tm of interLiceuTeamRadar) row[tm.team] = tm[d];
    return row;
  });
  const radarColors = ['#0A0A0B', '#F97316', '#9CA3AF', '#D4D4D8'];

  return (
    <div className="space-y-8">
      {/* leader cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {top4.map(({ label, leader, cat: c }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, rotateY: 8, y: 16 }}
            animate={{ opacity: 1, rotateY: 0, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className="rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(10,10,11,.05)]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">{label}</p>
            <div className="mt-3 flex items-center gap-3">
              <MonogramAvatar name={leader.name} size={44} />
              <div className="min-w-0">
                {leader.athleteId ? (
                  <Link to={`/athletes/${leader.athleteId}`} className="block truncate text-[14px] font-bold text-ink-950 hover:text-brand-600">
                    {leader.name}
                  </Link>
                ) : (
                  <p className="truncate text-[14px] font-bold text-ink-950">{leader.name}</p>
                )}
                <p className="truncate text-[11px] text-ink-600">{leader.team}</p>
              </div>
            </div>
            <p className="mt-3 font-display text-[28px] font-extrabold leading-none text-ink-950 tnum">
              {fmt1(leader[c])}
              <span className="ml-1 text-[11px] font-bold uppercase text-ink-600">{c === 'efic' ? 'EFIC' : c.toUpperCase()}</span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* leaders table */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-[18px] font-bold text-ink-950">{t('competitionDetail.statsTab.leadersTitle')}</h3>
          <label className="flex items-center gap-2 text-[12px] font-semibold text-ink-600">
            {t('competitionDetail.statsTab.category')}
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as LeaderCategory)}
              className="h-9 cursor-pointer rounded-lg border border-line bg-white px-2 text-[13px] font-semibold text-ink-950"
            >
              {LEADER_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === 'efic' ? 'EFIC' : c.toUpperCase()}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="bg-paper-50 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-600">
                <th className="px-4 py-2.5">#</th>
                <th className="px-4 py-2.5">{t('competitionDetail.statsTab.colPlayer')}</th>
                <th className="px-4 py-2.5">{t('competitionDetail.statsTab.colTeam')}</th>
                <th className="px-4 py-2.5 text-right">{t('competitionDetail.statsTab.colGames')}</th>
                <th className="px-4 py-2.5 text-right">{t('competitionDetail.statsTab.colValue')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((l, i) => (
                <tr key={l.id} className="border-t border-line text-[13px] transition-colors hover:bg-paper-50">
                  <td className="px-4 py-2.5 font-display font-extrabold text-ink-950 tnum">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2 font-semibold text-ink-950">
                      <MonogramAvatar name={l.name} size={28} />
                      {l.athleteId ? (
                        <Link to={`/athletes/${l.athleteId}`} className="hover:text-brand-600">{l.name}</Link>
                      ) : (
                        l.name
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">{l.team}</td>
                  <td className="px-4 py-2.5 text-right text-ink-600 tnum">{l.games}</td>
                  <td className="px-4 py-2.5 text-right font-display font-extrabold text-ink-950 tnum">{fmt1(l[cat])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* team radar */}
      <div className="rounded-xl border border-line bg-white p-5">
        <h3 className="mb-4 font-display text-[16px] font-bold text-ink-950">{t('competitionDetail.statsTab.radarTitle')}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="70%">
              <PolarGrid stroke="#E6E6E9" />
              <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: '#3F4248' }} />
              <RTooltip />
              {interLiceuTeamRadar.map((tm, i) => (
                <Radar key={tm.team} name={tm.team} dataKey={tm.team} stroke={radarColors[i]} fill={radarColors[i]} fillOpacity={0.08} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-4">
          {interLiceuTeamRadar.map((tm, i) => (
            <span key={tm.team} className="flex items-center gap-1.5 text-[12px] font-medium text-ink-600">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: radarColors[i] }} aria-hidden />
              {tm.team}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ MVP tab ----------------------------- */

function MvpTab() {
  const t = useT();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-[20px] font-bold text-ink-950">{t('competitionDetail.mvp.title')}</h3>
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-600">{t('competitionDetail.mvp.index')}</p>
        </div>
        <SponsorSlot label="POWERED BY" placeholder="MARCA PARCEIRA — espaço demo" className="max-w-md" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {mvpRace.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className={cn(
              'relative rounded-xl border bg-white p-4 shadow-[0_1px_2px_rgba(10,10,11,.05)]',
              i === 0 ? 'border-brand-500' : 'border-line',
            )}
          >
            <span className="absolute right-3 top-3 font-display text-[24px] font-extrabold text-paper-100 tnum" aria-hidden>
              {i + 1}
            </span>
            <MonogramAvatar name={c.name} size={52} />
            {c.athleteId ? (
              <Link to={`/athletes/${c.athleteId}`} className="mt-3 block truncate font-display text-[16px] font-bold text-ink-950 hover:text-brand-600">
                {c.name}
              </Link>
            ) : (
              <p className="mt-3 truncate font-display text-[16px] font-bold text-ink-950">{c.name}</p>
            )}
            <p className="truncate text-[12px] text-ink-600">{c.team}</p>
            <p className="mt-2 text-[12px] font-semibold text-ink-950 tnum">{c.statLine}</p>
            <p className="mt-3 font-display text-[32px] font-extrabold leading-none text-brand-600 tnum">{c.index}</p>
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-ink-600">{t('competitionDetail.mvp.trend')}</p>
              <svg viewBox="0 0 100 28" className="mt-1 h-7 w-full" preserveAspectRatio="none" aria-hidden>
                <polyline
                  points={c.trend.map((v, j) => `${(j / (c.trend.length - 1)) * 100},${26 - ((v - 60) / 40) * 24}`).join(' ')}
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-600/70">
        {t('competitionDetail.mvp.poweredBy')}
      </p>
    </div>
  );
}

/* ---------------------------- Rankings tab -------------------------- */

function MiniRanking({ title, athleteIds }: { title: string; athleteIds: string[] }) {
  const t = useT();
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line bg-paper-50 px-4 py-2.5">
        <h4 className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-600">{title}</h4>
        <Link to="/rankings" className="text-[12px] font-semibold text-brand-600 hover:text-brand-500">
          {t('competitionDetail.rankingsTab.viewFull')} →
        </Link>
      </div>
      {athleteIds.map((id, i) => {
        const a = getPublicAthlete(id);
        if (!a) return null;
        return (
          <Link
            key={id}
            to={`/athletes/${id}`}
            className="flex h-14 items-center gap-3 border-t border-line px-4 transition-colors first:border-t-0 hover:bg-paper-50"
          >
            <span className="w-5 font-display text-[14px] font-extrabold text-ink-950 tnum">{i + 1}</span>
            <MonogramAvatar name={a.name} size={34} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink-950">{a.name}</p>
              <p className="truncate text-[11px] text-ink-600">{a.position}</p>
            </div>
            <OvrSquare value={a.ovr.value} size={30} />
          </Link>
        );
      })}
    </div>
  );
}

function RankingsTab() {
  const t = useT();
  const bball = publicAthletes.filter((a) => a.sport === 'basketball');
  const u18 = bball.filter((a) => demoAge(a) <= 18).sort((a, b) => b.ovr.value - a.ovr.value).slice(0, 5).map((a) => a.id);
  const defenders = bball
    .slice()
    .sort((a, b) => (athleteDemoStats[b.id]?.defense ?? 0) - (athleteDemoStats[a.id]?.defense ?? 0))
    .slice(0, 5)
    .map((a) => a.id);
  const improved = bball
    .slice()
    .sort((a, b) => (athleteDemoStats[b.id]?.improvement ?? 0) - (athleteDemoStats[a.id]?.improvement ?? 0))
    .slice(0, 5)
    .map((a) => a.id);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <MiniRanking title={t('competitionDetail.rankingsTab.u18')} athleteIds={u18} />
      <MiniRanking title={t('competitionDetail.rankingsTab.defenders')} athleteIds={defenders} />
      <MiniRanking title={t('competitionDetail.rankingsTab.improved')} athleteIds={improved} />
    </div>
  );
}

/* ---------------------------- Scouting tab -------------------------- */

const REC_STYLES: Record<string, string> = {
  sign: 'bg-success/10 text-success border border-success/30',
  shortlist: 'bg-brand-100 text-brand-600',
  follow: 'bg-blue-50 text-info border border-info/30',
  monitor: 'bg-paper-100 text-ink-600',
};

function ScoutingTab() {
  const t = useT();
  const { locale, formatDate } = useI18n();
  const band = [
    { value: 6, label: t('competitionDetail.scoutingTab.scouts') },
    { value: 18, label: t('competitionDetail.scoutingTab.games') },
    { value: 142, label: t('competitionDetail.scoutingTab.events') },
    { value: 34, label: t('competitionDetail.scoutingTab.clips') },
  ];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-paper-50 p-5 lg:grid-cols-4">
        {band.map((b) => (
          <p key={b.label} className="text-[13px] text-ink-600">
            <span className="mr-1 font-display text-[22px] font-extrabold text-ink-950 tnum">{b.value}</span>
            {b.label}
          </p>
        ))}
      </div>

      <div>
        <h3 className="mb-4 font-display text-[18px] font-bold text-ink-950">{t('competitionDetail.scoutingTab.clipsTitle')}</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {interLiceuClips.map((clip, i) => (
            <motion.div
              key={clip.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3) }}
              className="group overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(10,10,11,.05)]"
            >
              <div className="relative aspect-video overflow-hidden bg-ink-950">
                <img src={clip.thumb} alt="" className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90">
                    <Play size={18} className="ml-0.5 text-ink-950" aria-hidden />
                  </span>
                </span>
                <span className="absolute bottom-2 right-2 rounded-md bg-ink-950/80 px-1.5 py-0.5 text-[10px] font-bold text-white tnum">
                  {formatDuration(clip.durationSec)}
                </span>
              </div>
              <div className="p-3">
                <p className="text-[13px] font-semibold text-ink-950">
                  {clip.athleteId ? (
                    <Link to={`/athletes/${clip.athleteId}`} className="hover:text-brand-600">{clip.athleteName}</Link>
                  ) : (
                    clip.athleteName
                  )}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-600 tnum">{locale === 'en' ? clip.tagEn : clip.tagPt}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-display text-[18px] font-bold text-ink-950">{t('competitionDetail.scoutingTab.reportsTitle')}</h3>
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          {interLiceuReports.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3 first:border-t-0">
              <MonogramAvatar name={r.scoutName} size={30} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ink-950">
                  {r.scoutName} →{' '}
                  {r.athleteId ? (
                    <Link to={`/athletes/${r.athleteId}`} className="text-brand-600 hover:text-brand-500">{r.athleteName}</Link>
                  ) : (
                    r.athleteName
                  )}
                </p>
                <p className="text-[11px] text-ink-600 tnum">{formatDate(r.date)}</p>
              </div>
              <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]', REC_STYLES[r.recommendation])}>
                {t(`competitionDetail.scoutingTab.rec.${r.recommendation}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Vídeos tab --------------------------- */

function VideosTab() {
  const t = useT();
  const { formatNumber } = useI18n();
  const compVideos = videos.filter((v) => v.competitionId === 'inter-liceu-2027' || v.sport === 'basketball');
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {compVideos.map((v, i) => (
        <motion.div
          key={v.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3) }}
          className="group overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(10,10,11,.05)]"
        >
          <div className="relative aspect-video overflow-hidden bg-ink-950">
            <img src={v.thumb} alt="" className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90">
                <Play size={18} className="ml-0.5 text-ink-950" aria-hidden />
              </span>
            </span>
            <span className="absolute bottom-2 right-2 rounded-md bg-ink-950/80 px-1.5 py-0.5 text-[10px] font-bold text-white tnum">
              {formatDuration(v.durationSec)}
            </span>
            <span
              className={cn(
                'absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]',
                v.visibility === 'public' ? 'bg-white/90 text-ink-950' : 'bg-ink-950/80 text-white',
              )}
            >
              {v.visibility === 'private' && <Lock size={10} aria-hidden />}
              {v.visibility === 'public' ? t('competitionDetail.videosTab.public') : t('competitionDetail.videosTab.private')}
            </span>
          </div>
          <div className="p-3">
            <p className="line-clamp-2 text-[13px] font-semibold text-ink-950">{v.title}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-600 tnum">
              <Eye size={11} aria-hidden />
              {t('competitionDetail.videosTab.views', { count: formatNumber(v.views) })}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ----------------------------- Equipas tab -------------------------- */

function TeamsTab({ teams }: { teams: NonNullable<import('@/data').Competition['teams']> }) {
  const t = useT();
  const [rosterTeam, setRosterTeam] = useState<string | null>(null);
  const groupNames = [...new Set(teams.map((tm) => tm.group))].sort();
  const roster = rosterTeam ? (IL_TEAM_PLAYERS[rosterTeam] ?? []) : [];

  return (
    <div className="space-y-8">
      {groupNames.map((g) => (
        <div key={g}>
          <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-600">
            {t('competitionDetail.teamsTab.group', { g })}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teams
              .filter((tm) => tm.group === g)
              .map((tm) => {
                const rosterCount = (IL_TEAM_PLAYERS[tm.name] ?? []).length;
                return (
                  <button
                    key={tm.id}
                    type="button"
                    onClick={() => setRosterTeam(tm.name)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-4 text-left shadow-[0_1px_2px_rgba(10,10,11,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]"
                  >
                    <MonogramAvatar name={tm.name} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold text-ink-950">{tm.name}</p>
                      <p className="text-[12px] text-ink-600 tnum">
                        {t('competitionDetail.teamsTab.record', { w: tm.won, l: tm.lost })} ·{' '}
                        {t('competitionDetail.teamsTab.players', { count: rosterCount })}
                      </p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-ink-600" aria-hidden />
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      <Dialog open={!!rosterTeam} onOpenChange={(open) => !open && setRosterTeam(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px]">
              {t('competitionDetail.teamsTab.rosterTitle', { team: rosterTeam ?? '' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            {roster.map((p) => (
              <div key={p.name} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-paper-50">
                <MonogramAvatar name={p.name} size={32} />
                {p.athleteId ? (
                  <Link to={`/athletes/${p.athleteId}`} className="text-[14px] font-semibold text-brand-600 hover:text-brand-500">
                    {p.name}
                  </Link>
                ) : (
                  <span className="text-[14px] font-semibold text-ink-950">{p.name}</span>
                )}
                {p.athleteId && <StatusBadge variant="verifiedProfile" className="ml-auto" />}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------- Patrocinadores tab ---------------------- */

function SponsorsTab() {
  const t = useT();
  const properties = ['naming', 'mvp', 'totw', 'broadcast', 'equipment'] as const;
  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <h3 className="font-display text-[20px] font-bold text-ink-950">{t('competitionDetail.sponsorsTab.title')}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-600">{t('competitionDetail.sponsorsTab.body')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <div key={p} className="flex flex-col rounded-xl border border-line bg-white p-5">
            <p className="font-display text-[16px] font-bold text-ink-950">{t(`competitionDetail.sponsorsTab.${p}`)}</p>
            <div className="mt-3 flex-1 rounded-lg border border-dashed border-line bg-paper-50 px-4 py-6 text-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-600/60">
                {t('competitionDetail.sponsorsTab.demoSpace')}
              </span>
            </div>
            <Link
              to="/dashboard/sponsor"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-ink-950 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-ink-800"
            >
              {t('competitionDetail.sponsorsTab.cta')}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ page -------------------------------- */

export default function CompetitionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useT();
  const { formatNumber } = useI18n();
  const { toast, toastNode } = useDemoToast();
  const comp = id ? getPublicCompetition(id) : undefined;

  const [tab, setTab] = useState<TabId>('games');
  const [following, setFollowing] = useState(false);

  const isFlagship = comp?.id === 'inter-liceu-2027';
  const verified = comp ? VERIFIED_COMPETITIONS.has(comp.id) : false;

  if (!comp) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          useIllustration
          title={t('competitionDetail.notFoundTitle')}
          body={t('competitionDetail.notFoundBody')}
          ctaLabel={t('competitionDetail.notFoundBack')}
          onCta={() => navigate('/competitions')}
        />
      </div>
    );
  }

  const heroStats = [
    { label: t('competitionDetail.stats.teams'), value: String(comp.teamsCount) },
    { label: t('competitionDetail.stats.players'), value: isFlagship ? String(IL_PLAYERS_COUNT) : '—' },
    { label: t('competitionDetail.stats.games'), value: isFlagship ? `${IL_PLAYED_GAMES}/${IL_TOTAL_GAMES}` : '—' },
    { label: t('competitionDetail.stats.scouts'), value: isFlagship ? '6' : '—' },
    { label: t('competitionDetail.stats.pageViews'), value: isFlagship ? formatNumber(4200) : '—' },
  ];

  const toggleFollow = () => {
    setFollowing((f) => {
      if (!f) toast(t('competitionDetail.followToast', { name: comp.name }));
      return !f;
    });
  };

  return (
    <div>
      {/* Hero (dark) */}
      <section className="relative overflow-hidden bg-ink-950 py-12">
        <div className="bg-glow-orange pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-white/50" aria-label="breadcrumb">
            <Link to="/competitions" className="hover:text-white">
              {t('nav.competitions')}
            </Link>
            <ChevronRight size={12} aria-hidden />
            <span className="text-white/80">{comp.name}</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[32px] font-extrabold tracking-[-0.02em] text-white lg:text-[44px]">
                  {comp.name}
                </h1>
                {verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-white">
                    <BadgeCheck size={13} className="text-brand-500" aria-hidden />
                    {t('competitionsPage.verifiedBadge')}
                  </span>
                )}
                {comp.status === 'live' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-danger px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-white">
                    <span className="relative flex h-1.5 w-1.5" aria-hidden>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    {isFlagship ? t('competitionDetail.liveChip', { round: 7 }) : t('badges.live')}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[12px] font-semibold text-white/70">
                <span className="rounded-full border border-ink-700 px-2.5 py-1">{t(`sports.${comp.sport}`)}</span>
                <span className="rounded-full border border-ink-700 px-2.5 py-1 tnum">{comp.season}</span>
                <span className="rounded-full border border-ink-700 px-2.5 py-1">Praia, {comp.island}</span>
                <span className="rounded-full border border-ink-700 px-2.5 py-1 tnum">
                  {t('competitionsPage.featured.metaTeams', { count: comp.teamsCount })}
                </span>
                {isFlagship && (
                  <span className="rounded-full border border-ink-700 px-2.5 py-1 tnum">{IL_TOTAL_GAMES} {t('competitionDetail.stats.games').toLowerCase()}</span>
                )}
              </div>
            </motion.div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={toggleFollow}
                className={cn(
                  'inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border px-5 font-semibold transition-colors active:scale-[0.97]',
                  following ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-700 text-white hover:bg-ink-800',
                )}
              >
                {following ? <BellRing size={16} aria-hidden /> : <Bell size={16} aria-hidden />}
                {following ? t('competitionDetail.following') : t('competitionDetail.follow')}
              </button>
              {comp.status === 'live' && (
                <Link
                  to="/match-scouting/demo-match"
                  className="inline-flex h-11 items-center rounded-lg bg-brand-500 px-5 font-semibold text-white transition-colors hover:bg-brand-600 active:scale-[0.97]"
                >
                  {t('competitionDetail.watchLive')}
                </Link>
              )}
            </div>
          </div>

          {/* stat strip */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {heroStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <p className="font-display text-[26px] font-extrabold leading-none text-white tnum">{s.value}</p>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white/50">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <TabsUnderline
            id="comp-detail"
            tabs={TAB_IDS.map((idTab) => ({ id: idTab, label: t(`competitionDetail.tabs.${idTab}`) }))}
            active={tab}
            onChange={(idTab) => setTab(idTab as TabId)}
          />
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        {isFlagship ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'games' && <GamesTab />}
              {tab === 'standings' && comp.teams && <StandingsTab teams={comp.teams} />}
              {tab === 'stats' && <StatsTab />}
              {tab === 'mvp' && <MvpTab />}
              {tab === 'rankings' && <RankingsTab />}
              {tab === 'scouting' && <ScoutingTab />}
              {tab === 'videos' && <VideosTab />}
              {tab === 'teams' && comp.teams && <TeamsTab teams={comp.teams} />}
              {tab === 'sponsors' && <SponsorsTab />}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Non-flagship competitions: hub modules unlock as data flows in (demo). */
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-paper-50 p-5 lg:grid-cols-4">
              <p className="text-[13px] text-ink-600">
                <Users size={14} className="mr-1 inline text-ink-950" aria-hidden />
                <span className="font-display text-[22px] font-extrabold text-ink-950 tnum">{comp.teamsCount}</span>{' '}
                {t('competitionDetail.stats.teams').toLowerCase()}
              </p>
              <p className="text-[13px] text-ink-600">
                <span className="font-display text-[22px] font-extrabold text-ink-950 tnum">{comp.season}</span>{' '}
                {t('common.season').toLowerCase()}
              </p>
            </div>
            <EmptyState
              useIllustration
              title={t('common.comingSoon')}
              body={t('competitionsPage.sub')}
              ctaLabel="INTER LICEU 2027"
              onCta={() => navigate('/competitions/inter-liceu-2027')}
            />
          </div>
        )}
      </div>
      {toastNode}
    </div>
  );
}
