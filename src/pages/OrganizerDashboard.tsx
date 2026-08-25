/**
 * OrganizerDashboard (/dashboard/organizer) — competition management suite for
 * the fictional organizer of INTER LICEU 2027 (design: organizer-dashboard.md).
 * Single-route dashboard: sidebar items are in-page hash sections.
 * Demo CRUD persists to localStorage under shs-* keys.
 */
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  CalendarDays,
  Check,
  Handshake,
  LayoutDashboard,
  ListOrdered,
  Plus,
  Radar,
  Settings,
  Shield,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardShell, { type ShellMenuSection } from '@/components/DashboardShell';
import StatTile from '@/components/shared/StatTile';
import StatusBadge from '@/components/shared/StatusBadge';
import SponsorSlot from '@/components/shared/SponsorSlot';
import OvrSquare from '@/components/shared/OvrSquare';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import { useI18n, useT } from '@/i18n';
import { competitions as baseCompetitions, getCompetition } from '@/data';
import {
  LS_ORG_COMPETITIONS,
  LS_ORG_PUBLISHED,
  estimateWizardPrice,
  orgCoverage,
  orgGames,
  orgPlayers,
  orgRevenue,
  orgScouts,
  orgSponsorSlots,
  orgTasks,
  readJson,
  wizardDefaults,
  wizardGroups,
  wizardPricing,
  writeJson,
  type OrgGame,
  type WizardState,
} from '@/data/extra-dash-b';
import { cn } from '@/lib/utils';
import {
  CountUp,
  CveValue,
  DashCard,
  DashDrawer,
  DashModal,
  DashSectionHeader,
  DashTable,
  DashToggle,
  Field,
  GhostButton,
  OutlineButton,
  PrimaryButton,
  Num,
  Skeleton,
  THead,
  TRow,
  ToastProvider,
  Td,
  Th,
  inputCls,
  textareaCls,
  useDemoLoading,
  useToast,
} from '@/components/dash-b/kit';

const SECTION_IDS = [
  'overview',
  'competitions',
  'teams',
  'players',
  'games',
  'standings',
  'stats',
  'scouting',
  'sponsors',
  'revenue',
  'settings',
] as const;

type SectionId = (typeof SECTION_IDS)[number];

interface DraftCompetition {
  id: string;
  name: string;
  sport: string;
  season: string;
  teams: number;
  published: boolean;
}

export default function OrganizerDashboard() {
  return (
    <ToastProvider>
      <OrganizerInner />
    </ToastProvider>
  );
}

function OrganizerInner() {
  const t = useT();
  const location = useLocation();
  const loading = useDemoLoading();
  const toast = useToast();

  const section = (location.hash.replace('#', '') || 'overview') as SectionId;
  const [wizardOpen, setWizardOpen] = useState(false);
  const [drafts, setDrafts] = useState<DraftCompetition[]>(() => readJson(LS_ORG_COMPETITIONS, []));
  const [publishedGames, setPublishedGames] = useState<string[]>(() => readJson(LS_ORG_PUBLISHED, []));
  const [doneTasks, setDoneTasks] = useState<string[]>([]);
  const [teamDrawer, setTeamDrawer] = useState<string | null>(null);

  const sections: ShellMenuSection[] = [
    {
      items: [
        { to: '#overview', label: t('organizerDash.menu.overview'), icon: LayoutDashboard, end: true },
        { to: '#competitions', label: t('organizerDash.menu.competitions'), icon: Trophy },
        { to: '#teams', label: t('organizerDash.menu.teams'), icon: Shield },
        { to: '#players', label: t('organizerDash.menu.players'), icon: Users },
        { to: '#games', label: t('organizerDash.menu.games'), icon: CalendarDays },
        { to: '#standings', label: t('organizerDash.menu.standings'), icon: ListOrdered },
        { to: '#stats', label: t('organizerDash.menu.stats'), icon: BarChart3 },
        { to: '#scouting', label: t('organizerDash.menu.scouting'), icon: Radar },
        { to: '#sponsors', label: t('organizerDash.menu.sponsors'), icon: Handshake },
        { to: '#revenue', label: t('organizerDash.menu.revenue'), icon: Wallet },
        { to: '#settings', label: t('organizerDash.menu.settings'), icon: Settings },
      ],
    },
  ];

  const isGamePublished = (g: OrgGame) => g.published || publishedGames.includes(g.id);

  const publishGame = (id: string) => {
    const next = [...publishedGames, id];
    setPublishedGames(next);
    writeJson(LS_ORG_PUBLISHED, next);
    toast(t('organizerDash.games.resultToast'));
  };

  const addDraft = (w: WizardState) => {
    const draft: DraftCompetition = {
      id: `draft-${Date.now()}`,
      name: w.name || t('organizerDash.competitions.draftName'),
      sport: w.sport,
      season: w.season,
      teams: w.teams,
      published: false,
    };
    const next = [...drafts, draft];
    setDrafts(next);
    writeJson(LS_ORG_COMPETITIONS, next);
  };

  const publishDraft = (id: string) => {
    const next = drafts.map((d) => (d.id === id ? { ...d, published: true } : d));
    setDrafts(next);
    writeJson(LS_ORG_COMPETITIONS, next);
    toast(t('organizerDash.competitions.publishedToast'));
  };

  const kpiSkeletons = (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-[92px]" />
      ))}
    </div>
  );

  return (
    <DashboardShell
      title={t('organizerDash.title')}
      sections={sections}
      plan={{ name: t('organizerDash.planCard.name'), usageLabel: t('organizerDash.planCard.usage'), usagePct: 62 }}
      actions={
        <PrimaryButton className="hidden sm:inline-flex" onClick={() => setWizardOpen(true)}>
          <Plus size={16} aria-hidden />
          {t('organizerDash.actions.newCompetition')}
        </PrimaryButton>
      }
    >
      {section === 'overview' && (
        <>
          {loading ? (
            kpiSkeletons
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatTile label={t('organizerDash.kpis.competitions')} value={3} />
              <StatTile label={t('organizerDash.kpis.teams')} value={10} />
              <StatTile label={t('organizerDash.kpis.players')} value={186} />
              <StatTile label={t('organizerDash.kpis.games')} value="24/45" />
              <StatTile label={t('organizerDash.kpis.scouts')} value={6} />
            </div>
          )}
          <OverviewSection
            doneTasks={doneTasks}
            onToggleTask={(id) =>
              setDoneTasks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
            }
          />
        </>
      )}

      {section === 'competitions' && (
        <CompetitionsSection drafts={drafts} onCreate={() => setWizardOpen(true)} onPublishDraft={publishDraft} />
      )}

      {section === 'teams' && <TeamsSection onOpenTeam={(name) => setTeamDrawer(name)} />}

      {section === 'players' && <PlayersSection />}

      {section === 'games' && (
        <GamesSection isGamePublished={isGamePublished} onPublish={publishGame} />
      )}

      {section === 'standings' && <StandingsSection />}

      {section === 'stats' && <StatsSection />}

      {section === 'scouting' && <ScoutingSection />}

      {section === 'sponsors' && <SponsorsSection />}

      {section === 'revenue' && <RevenueSection />}

      {section === 'settings' && (
        <DashCard title={t('organizerDash.settings.heading')}>
          <p className="text-[14px] text-ink-600">{t('organizerDash.settings.body')}</p>
        </DashCard>
      )}

      <CompetitionWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreated={(w) => {
          addDraft(w);
          setWizardOpen(false);
          toast(t('organizerDash.wizard.successTitle'));
        }}
      />

      <TeamDrawer teamName={teamDrawer} onClose={() => setTeamDrawer(null)} />
    </DashboardShell>
  );
}

/* ============================ Visão Geral ================================= */

function OverviewSection({
  doneTasks,
  onToggleTask,
}: {
  doneTasks: string[];
  onToggleTask: (id: string) => void;
}) {
  const t = useT();
  const { formatDate } = useI18n();
  const [compId, setCompId] = useState('inter-liceu-2027');
  const comp = getCompetition(compId);
  const todayGames = orgGames.filter((g) => g.round === 7);
  const recent = orgGames.filter((g) => g.status === 'finished').slice(0, 3);

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-5">
        <DashCard title={t('organizerDash.overview.selector')}>
          <div className="flex flex-wrap gap-2">
            {baseCompetitions.slice(0, 2).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCompId(c.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3.5 h-9 text-[13px] font-semibold transition-colors cursor-pointer',
                  compId === c.id ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white text-ink-600 hover:border-ink-950',
                )}
              >
                {c.name}
                <StatusBadge variant={c.status === 'live' ? 'live' : 'demo'} />
              </button>
            ))}
          </div>
          {comp && (
            <p className="mt-3 text-[13px] text-ink-600">
              {comp.name} · {t(`sports.${comp.sport}`)} · {comp.season} · {formatDate(comp.startDate)} — {formatDate(comp.endDate)}
            </p>
          )}
        </DashCard>

        <DashCard title={t('organizerDash.overview.today', { round: 7 })}>
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-600">
            {t('organizerDash.overview.gamesToday', { count: todayGames.length })}
          </p>
          <ul className="divide-y divide-line">
            {todayGames.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[13px] font-medium text-ink-950">
                  {g.home} <span className="text-ink-600">{t('organizerDash.games.vs')}</span> {g.away}
                </span>
                <span className="flex items-center gap-2">
                  {g.status === 'live' ? (
                    <>
                      <span className="tnum text-[13px] font-bold text-ink-950">
                        {g.homeScore} — {g.awayScore}
                      </span>
                      <StatusBadge variant="live" />
                    </>
                  ) : (
                    <span className="tnum text-[12px] text-ink-600">{formatDate(g.date, { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </DashCard>

        <DashCard title={t('organizerDash.overview.recentResults')} pad={false}>
          <DashTable>
            <THead>
              <Th>{t('organizerDash.games.round', { n: '' }).replace(/\s+/g, ' ').trim() || '#'}</Th>
              <Th>{t('organizerDash.teams.teamName')}</Th>
              <Th className="text-right">{t('admin.tables.cols.score')}</Th>
            </THead>
            <tbody>
              {recent.map((g) => (
                <TRow key={g.id}>
                  <Td className="tnum text-ink-600">J{g.round}</Td>
                  <Td>
                    {g.home} <span className="text-ink-600">{t('organizerDash.games.vs')}</span> {g.away}
                  </Td>
                  <Td className="text-right font-display font-extrabold tnum">
                    {g.homeScore} — {g.awayScore}
                  </Td>
                </TRow>
              ))}
            </tbody>
          </DashTable>
        </DashCard>
      </div>

      <div className="space-y-5">
        <DashCard title={t('organizerDash.overview.revenueTitle')}>
          <dl className="space-y-2.5 text-[13px]">
            <div className="flex items-center justify-between">
              <dt className="text-ink-600">{t('organizerDash.overview.gross')}</dt>
              <dd className="font-semibold text-ink-950"><CveValue cve={orgRevenue.grossCve} showEur={false} /></dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-600">{t('organizerDash.overview.platformCosts')}</dt>
              <dd className="font-semibold text-danger tnum">− esc {<Num value={orgRevenue.platformCostCve} />}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-2.5">
              <dt className="font-semibold text-ink-950">{t('organizerDash.overview.net')}</dt>
              <dd className="font-display text-[18px] font-extrabold text-ink-950">
                <CveValue cve={orgRevenue.grossCve - orgRevenue.platformCostCve} />
              </dd>
            </div>
          </dl>
        </DashCard>

        <DashCard title={t('organizerDash.overview.tasksTitle')}>
          <ul className="space-y-1">
            {orgTasks.map((task) => {
              const done = doneTasks.includes(task.id);
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-paper-50 cursor-pointer"
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                        done ? 'border-success bg-success text-white' : 'border-line bg-white',
                      )}
                      aria-hidden
                    >
                      {done && <Check size={13} />}
                    </span>
                    <span className={cn('text-[13px] font-medium text-ink-950 transition-all', done && 'text-ink-600 line-through')}>
                      {t(`organizerDash.overview.tasks.${task.labelKey}`)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </DashCard>

        <SponsorSlot
          label={t('organizerDash.overview.sponsoredBy')}
          placeholder={t('organizerDash.overview.sponsoredPlaceholder')}
        />
      </div>
    </div>
  );
}

/* ============================ Competições ================================= */

function CompetitionsSection({
  drafts,
  onCreate,
  onPublishDraft,
}: {
  drafts: DraftCompetition[];
  onCreate: () => void;
  onPublishDraft: (id: string) => void;
}) {
  const t = useT();
  return (
    <>
      <DashSectionHeader title={t('organizerDash.competitions.heading')} />
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <DashCard pad={false}>
          <DashTable>
            <THead>
              <Th>{t('organizerDash.competitions.cols.name')}</Th>
              <Th>{t('organizerDash.competitions.cols.sport')}</Th>
              <Th>{t('organizerDash.competitions.cols.season')}</Th>
              <Th>{t('organizerDash.competitions.cols.teams')}</Th>
              <Th>{t('organizerDash.competitions.cols.status')}</Th>
              <Th />
            </THead>
            <tbody>
              {baseCompetitions.map((c) => (
                <TRow key={c.id}>
                  <Td className="font-semibold">{c.name}</Td>
                  <Td>{t(`sports.${c.sport}`)}</Td>
                  <Td className="tnum">{c.season}</Td>
                  <Td className="tnum">{c.teamsCount}</Td>
                  <Td>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]',
                        c.status === 'live' && 'bg-brand-100 text-brand-600',
                        c.status === 'upcoming' && 'bg-paper-100 text-ink-600',
                        c.status === 'finished' && 'bg-ink-950 text-white',
                      )}
                    >
                      {t(`organizerDash.status.${c.status}`)}
                    </span>
                  </Td>
                  <Td />
                </TRow>
              ))}
              {drafts.map((d) => (
                <TRow key={d.id}>
                  <Td className="font-semibold">{d.name}</Td>
                  <Td>{t(`sports.${d.sport}`)}</Td>
                  <Td className="tnum">{d.season}</Td>
                  <Td className="tnum">{d.teams}</Td>
                  <Td>
                    {d.published ? (
                      <StatusBadge variant="verifiedStats" />
                    ) : (
                      <span className="inline-flex rounded-full border border-dashed border-line px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                        {t('organizerDash.status.draft')}
                      </span>
                    )}
                  </Td>
                  <Td className="text-right">
                    {!d.published && (
                      <OutlineButton onClick={() => onPublishDraft(d.id)}>{t('organizerDash.competitions.publish')}</OutlineButton>
                    )}
                  </Td>
                </TRow>
              ))}
            </tbody>
          </DashTable>
        </DashCard>
        <button
          type="button"
          onClick={onCreate}
          className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-white px-6 py-10 text-center transition-colors hover:border-brand-500 hover:bg-brand-50 cursor-pointer"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Plus size={22} aria-hidden />
          </span>
          <span className="font-display text-[18px] font-bold text-ink-950">{t('organizerDash.competitions.createTitle')}</span>
          <span className="text-[13px] text-ink-600">{t('organizerDash.competitions.createBody')}</span>
        </button>
      </div>
    </>
  );
}

/* ============================ Equipas ===================================== */

function TeamsSection({ onOpenTeam }: { onOpenTeam: (name: string) => void }) {
  const t = useT();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const comp = getCompetition('inter-liceu-2027');
  const groups = ['A', 'B', 'C'];
  // demo: 2 teams pending confirmation
  const pendingTeams = new Set(['Colégio São José (fictício)', 'Escola da Várzea']);

  return (
    <>
      <DashSectionHeader
        title={t('organizerDash.menu.teams')}
        actions={
          <PrimaryButton onClick={() => setAddOpen(true)}>
            <Plus size={16} aria-hidden />
            {t('organizerDash.teams.addTeam')}
          </PrimaryButton>
        }
      />
      <div className="grid gap-5 md:grid-cols-3">
        {groups.map((g) => (
          <DashCard key={g} title={t('organizerDash.teams.groupLabel', { g })} pad={false}>
            <ul className="divide-y divide-line">
              {(comp?.teams ?? [])
                .filter((team) => team.group === g)
                .map((team) => {
                  const count = orgPlayers.filter((p) => p.team === team.name).length + 17;
                  const confirmed = !pendingTeams.has(team.name);
                  return (
                    <li key={team.id}>
                      <button
                        type="button"
                        onClick={() => onOpenTeam(team.name)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-paper-50 cursor-pointer"
                      >
                        <MonogramAvatar name={team.name} size={36} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-ink-950">{team.name}</span>
                          <span className="block text-[11px] text-ink-600 tnum">
                            {t('organizerDash.teams.playersCount', { count })}
                          </span>
                        </span>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]',
                            confirmed ? 'bg-ink-950 text-white' : 'border border-info/40 bg-blue-50 text-info',
                          )}
                        >
                          {confirmed ? t('organizerDash.teams.confirmed') : t('organizerDash.teams.pending')}
                        </span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </DashCard>
        ))}
      </div>

      <DashModal open={addOpen} onClose={() => setAddOpen(false)} title={t('organizerDash.teams.addTeam')}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setAddOpen(false);
            setNewName('');
            toast(t('organizerDash.teams.addedToast'));
          }}
        >
          <Field label={t('organizerDash.teams.teamName')}>
            <input
              className={inputCls}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('organizerDash.teams.teamNamePlaceholder')}
              required
            />
          </Field>
          <PrimaryButton type="submit" className="w-full">
            {t('organizerDash.teams.addTeam')}
          </PrimaryButton>
        </form>
      </DashModal>
    </>
  );
}

function TeamDrawer({ teamName, onClose }: { teamName: string | null; onClose: () => void }) {
  const t = useT();
  const toast = useToast();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [position, setPosition] = useState('');
  const roster = teamName ? orgPlayers.filter((p) => p.team === teamName) : [];

  return (
    <DashDrawer open={teamName !== null} onClose={onClose} title={t('organizerDash.teams.drawerTitle')}>
      {teamName && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <MonogramAvatar name={teamName} size={44} />
            <p className="font-display text-[16px] font-bold text-ink-950">{teamName}</p>
          </div>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {roster.length === 0 && (
              <li className="px-4 py-6 text-center text-[13px] text-ink-600">{t('admin.tables.empty')}</li>
            )}
            {roster.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                <MonogramAvatar name={p.name} size={30} />
                <span className="flex-1 text-[13px] font-medium text-ink-950">{p.name}</span>
                <span className="tnum text-[12px] text-ink-600">
                  {t('common.age')} {p.age}
                </span>
              </li>
            ))}
          </ul>
          <form
            className="space-y-3 rounded-xl border border-dashed border-line p-4"
            onSubmit={(e) => {
              e.preventDefault();
              setName('');
              setAge('');
              setPosition('');
              toast(t('organizerDash.teams.playerAddedToast'));
            }}
          >
            <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink-600">
              {t('organizerDash.teams.addPlayer')}
            </p>
            <Field label={t('organizerDash.teams.playerName')}>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('organizerDash.teams.playerAge')}>
                <input className={inputCls} type="number" min={10} max={40} value={age} onChange={(e) => setAge(e.target.value)} required />
              </Field>
              <Field label={t('organizerDash.teams.playerPosition')}>
                <input className={inputCls} value={position} onChange={(e) => setPosition(e.target.value)} required />
              </Field>
            </div>
            <p className="text-[11px] text-ink-600">{t('organizerDash.teams.quickNote')}</p>
            <PrimaryButton type="submit" className="w-full">
              {t('organizerDash.teams.addPlayer')}
            </PrimaryButton>
          </form>
        </div>
      )}
    </DashDrawer>
  );
}

/* ============================ Jogadores =================================== */

function PlayersSection() {
  const t = useT();
  const [filter, setFilter] = useState<string>('all');
  const teams = useMemo(() => Array.from(new Set(orgPlayers.map((p) => p.team))), []);
  const rows = filter === 'all' ? orgPlayers : orgPlayers.filter((p) => p.team === filter);

  return (
    <>
      <DashSectionHeader title={t('organizerDash.players.heading')} />
      <div className="mb-4 flex flex-wrap gap-2">
        {['all', ...teams].map((team) => (
          <button
            key={team}
            type="button"
            onClick={() => setFilter(team)}
            className={cn(
              'h-9 rounded-full border px-3.5 text-[13px] font-semibold transition-colors cursor-pointer',
              filter === team ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white text-ink-600 hover:border-ink-950',
            )}
          >
            {team === 'all' ? t('organizerDash.players.filterAll') : team}
          </button>
        ))}
      </div>
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('organizerDash.players.cols.name')}</Th>
            <Th>{t('organizerDash.players.cols.team')}</Th>
            <Th>{t('organizerDash.players.cols.age')}</Th>
            <Th>{t('organizerDash.players.cols.ovr')}</Th>
            <Th>{t('organizerDash.players.cols.ppg')}</Th>
            <Th>{t('organizerDash.players.cols.verification')}</Th>
          </THead>
          <tbody>
            {rows.map((p) => (
              <TRow key={p.id}>
                <Td>
                  <span className="flex items-center gap-2.5">
                    <MonogramAvatar name={p.name} size={28} />
                    <span className="font-semibold">{p.name}</span>
                  </span>
                </Td>
                <Td className="text-ink-600">{p.team}</Td>
                <Td className="tnum">{p.age}</Td>
                <Td>
                  <OvrSquare value={p.ovr} size={28} />
                </Td>
                <Td className="tnum font-semibold">{p.ppg}</Td>
                <Td>
                  <StatusBadge
                    variant={p.verification === 'verified' ? 'verifiedStats' : p.verification === 'pending' ? 'pending' : 'selfReported'}
                  />
                </Td>
              </TRow>
            ))}
          </tbody>
        </DashTable>
      </DashCard>
    </>
  );
}

/* ============================ Jogos ======================================= */

function GamesSection({
  isGamePublished,
  onPublish,
}: {
  isGamePublished: (g: OrgGame) => boolean;
  onPublish: (id: string) => void;
}) {
  const t = useT();
  const { formatDate } = useI18n();
  const toast = useToast();
  const [publishTarget, setPublishTarget] = useState<OrgGame | null>(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [boxscore, setBoxscore] = useState('');
  const rounds = useMemo(() => Array.from(new Set(orgGames.map((g) => g.round))).sort((a, b) => a - b), []);

  return (
    <>
      <DashSectionHeader title={t('organizerDash.games.heading')} />
      <div className="space-y-5">
        {rounds.map((round) => (
          <DashCard key={round} title={t('organizerDash.games.round', { n: round })} pad={false}>
            <ul className="divide-y divide-line">
              {orgGames
                .filter((g) => g.round === round)
                .map((g) => {
                  const published = isGamePublished(g);
                  return (
                    <li key={g.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-ink-950">
                          {g.home} <span className="font-normal text-ink-600">{t('organizerDash.games.vs')}</span> {g.away}
                        </p>
                        <p className="text-[11px] text-ink-600">
                          {formatDate(g.date, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {g.venue} ·{' '}
                          {t('organizerDash.teams.groupLabel', { g: g.group })}
                        </p>
                      </div>
                      {g.status === 'finished' && (
                        <span className="tnum font-display text-[16px] font-extrabold text-ink-950">
                          {g.homeScore} — {g.awayScore}
                        </span>
                      )}
                      {g.status === 'live' && (
                        <span className="flex items-center gap-2">
                          <span className="tnum font-display text-[16px] font-extrabold text-ink-950">
                            {g.homeScore} — {g.awayScore}
                          </span>
                          <StatusBadge variant="live" />
                        </span>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {g.status === 'finished' &&
                          (published ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-ink-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                              <Check size={11} className="text-success" aria-hidden />
                              {t('organizerDash.games.publishedChip')}
                            </span>
                          ) : (
                            <PrimaryButton
                              className="h-9 px-3.5 text-[12px]"
                              onClick={() => {
                                setPublishTarget(g);
                                setHomeScore(String(g.homeScore ?? ''));
                                setAwayScore(String(g.awayScore ?? ''));
                                setBoxscore('');
                              }}
                            >
                              {t('organizerDash.games.publishResult')}
                            </PrimaryButton>
                          ))}
                        {g.status === 'live' && (
                          <a
                            href="/match-scouting/demo-match"
                            className="inline-flex h-9 items-center rounded-lg border border-ink-950/15 bg-white px-3.5 text-[13px] font-semibold text-ink-950 transition-colors hover:border-ink-950"
                          >
                            {t('organizerDash.games.monitor')}
                          </a>
                        )}
                        {g.status !== 'live' && (
                          <>
                            <OutlineButton onClick={() => toast(t('organizerDash.games.scoutToast'))}>
                              {t('organizerDash.games.assignScout')}
                            </OutlineButton>
                            <GhostButton>{t('organizerDash.games.edit')}</GhostButton>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </DashCard>
        ))}
      </div>

      <DashModal
        open={publishTarget !== null}
        onClose={() => setPublishTarget(null)}
        title={t('organizerDash.games.publishModalTitle')}
      >
        {publishTarget && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              onPublish(publishTarget.id);
              setPublishTarget(null);
            }}
          >
            <p className="text-[13px] font-semibold text-ink-950">
              {publishTarget.home} {t('organizerDash.games.vs')} {publishTarget.away}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`${t('organizerDash.games.score')} — ${publishTarget.home}`}>
                <input className={cn(inputCls, 'tnum')} type="number" min={0} value={homeScore} onChange={(e) => setHomeScore(e.target.value)} required />
              </Field>
              <Field label={`${t('organizerDash.games.score')} — ${publishTarget.away}`}>
                <input className={cn(inputCls, 'tnum')} type="number" min={0} value={awayScore} onChange={(e) => setAwayScore(e.target.value)} required />
              </Field>
            </div>
            <Field label={t('organizerDash.games.boxscore')}>
              <textarea
                className={textareaCls}
                rows={3}
                value={boxscore}
                onChange={(e) => setBoxscore(e.target.value)}
                placeholder={t('organizerDash.games.boxscorePlaceholder')}
              />
            </Field>
            <p className="rounded-lg border border-info/30 bg-blue-50 px-3 py-2 text-[12px] font-medium text-info">
              {t('organizerDash.games.trustNote')}
            </p>
            <PrimaryButton type="submit" className="w-full">
              {t('organizerDash.games.confirm')}
            </PrimaryButton>
          </form>
        )}
      </DashModal>
    </>
  );
}

/* ============================ Classificação =============================== */

function StandingsSection() {
  const t = useT();
  const toast = useToast();
  const comp = getCompetition('inter-liceu-2027');
  const groups = ['A', 'B', 'C'];

  return (
    <>
      <DashSectionHeader
        title={t('organizerDash.standings.heading')}
        sub={t('organizerDash.standings.autoNote')}
        actions={
          <OutlineButton onClick={() => toast(t('organizerDash.standings.overrideToast'))}>
            {t('organizerDash.standings.override')}
          </OutlineButton>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3">
        {groups.map((g) => {
          const rows = (comp?.teams ?? [])
            .filter((team) => team.group === g)
            .slice()
            .sort((a, b) => b.won * 2 + b.lost - (a.won * 2 + a.lost));
          return (
            <DashCard key={g} title={t('organizerDash.teams.groupLabel', { g })} pad={false}>
              <DashTable className="[&_table]:min-w-0">
                <THead>
                  <Th>{t('organizerDash.standings.cols.team')}</Th>
                  <Th className="text-center">{t('organizerDash.standings.cols.p')}</Th>
                  <Th className="text-center">{t('organizerDash.standings.cols.w')}</Th>
                  <Th className="text-center">{t('organizerDash.standings.cols.l')}</Th>
                  <Th className="text-center">{t('organizerDash.standings.cols.pts')}</Th>
                </THead>
                <tbody>
                  {rows.map((team, i) => (
                    <TRow key={team.id}>
                      <Td>
                        <span className="flex items-center gap-2">
                          <span className="tnum font-display font-extrabold text-ink-600">{i + 1}</span>
                          <span className="truncate text-[12px] font-semibold">{team.name}</span>
                        </span>
                      </Td>
                      <Td className="text-center tnum">{team.played}</Td>
                      <Td className="text-center tnum text-success font-semibold">{team.won}</Td>
                      <Td className="text-center tnum text-danger">{team.lost}</Td>
                      <Td className="text-center tnum font-display font-extrabold">{team.won * 2 + team.lost}</Td>
                    </TRow>
                  ))}
                </tbody>
              </DashTable>
            </DashCard>
          );
        })}
      </div>
    </>
  );
}

/* ============================ Estatísticas ================================ */

function StatsSection() {
  const t = useT();
  const leaders = orgPlayers.slice().sort((a, b) => parseFloat(b.ppg) - parseFloat(a.ppg)).slice(0, 5);
  const mvpRace = orgPlayers.slice().sort((a, b) => b.ovr - a.ovr).slice(0, 3);

  return (
    <>
      <DashSectionHeader title={t('organizerDash.stats.heading')} />
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <DashCard pad={false}>
          <DashTable>
            <THead>
              <Th>#</Th>
              <Th>{t('organizerDash.players.cols.name')}</Th>
              <Th>{t('organizerDash.players.cols.team')}</Th>
              <Th className="text-right">{t('organizerDash.players.cols.ppg')}</Th>
            </THead>
            <tbody>
              {leaders.map((p, i) => (
                <TRow key={p.id}>
                  <Td className="tnum font-display font-extrabold text-ink-600">{i + 1}</Td>
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <MonogramAvatar name={p.name} size={28} />
                      <span className="font-semibold">{p.name}</span>
                    </span>
                  </Td>
                  <Td className="text-ink-600">{p.team}</Td>
                  <Td className="text-right tnum font-display font-extrabold">{p.ppg}</Td>
                </TRow>
              ))}
            </tbody>
          </DashTable>
        </DashCard>
        <DashCard title={t('organizerDash.stats.mvpTitle')}>
          <ul className="space-y-3">
            {mvpRace.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="tnum font-display text-[18px] font-extrabold text-ink-600">{i + 1}</span>
                <MonogramAvatar name={p.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink-950">{p.name}</p>
                  <p className="text-[11px] text-ink-600">{p.team}</p>
                </div>
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-brand-600 tnum">
                  {t('organizerDash.stats.index')} {(p.ovr * 1.24).toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-line pt-3 text-[11px] text-ink-600">{t('organizerDash.stats.mvpNote')}</p>
        </DashCard>
      </div>
    </>
  );
}

/* ============================ Scouting ==================================== */

function ScoutingSection() {
  const t = useT();
  return (
    <>
      <DashSectionHeader
        title={t('organizerDash.scouting.heading')}
        sub={t('organizerDash.scouting.coverage', { covered: orgCoverage.gamesWithScouting, total: orgCoverage.gamesTotal })}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <DashCard>
          <p className="font-display text-[40px] font-extrabold leading-none text-ink-950 tnum">
            <CountUp value={Math.round((orgCoverage.gamesWithScouting / orgCoverage.gamesTotal) * 100)} />%
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-100">
            <motion.div
              className="h-full rounded-full bg-brand-500"
              initial={{ width: 0 }}
              animate={{ width: `${(orgCoverage.gamesWithScouting / orgCoverage.gamesTotal) * 100}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <p className="mt-3 text-[12px] text-ink-600">
            {t('organizerDash.scouting.coverage', { covered: orgCoverage.gamesWithScouting, total: orgCoverage.gamesTotal })}
          </p>
        </DashCard>
        <DashCard pad={false}>
          <DashTable>
            <THead>
              <Th>{t('organizerDash.scouting.cols.scout')}</Th>
              <Th className="text-center">{t('organizerDash.scouting.cols.games')}</Th>
              <Th className="text-center">{t('organizerDash.scouting.cols.reports')}</Th>
              <Th className="text-center">{t('organizerDash.scouting.cols.clips')}</Th>
            </THead>
            <tbody>
              {orgScouts.map((s) => (
                <TRow key={s.id}>
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <MonogramAvatar name={s.name} size={28} />
                      <span className="font-semibold">{s.name}</span>
                    </span>
                  </Td>
                  <Td className="text-center tnum">{s.gamesCovered}</Td>
                  <Td className="text-center tnum">{s.reports}</Td>
                  <Td className="text-center tnum">{s.clips}</Td>
                </TRow>
              ))}
            </tbody>
          </DashTable>
        </DashCard>
      </div>
    </>
  );
}

/* ============================ Patrocinadores ============================== */

function SponsorsSection() {
  const t = useT();
  return (
    <>
      <DashSectionHeader title={t('organizerDash.sponsors.heading')} />
      <div className="grid gap-4 sm:grid-cols-2">
        {orgSponsorSlots.map((slot) => (
          <DashCard key={slot.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-[16px] font-bold text-ink-950">{t(`organizerDash.sponsors.slots.${slot.nameKey}`)}</p>
                {slot.occupiedBy ? (
                  <p className="mt-1 text-[13px] text-ink-600">
                    {t('organizerDash.sponsors.occupiedBy', { name: slot.occupiedBy })}
                  </p>
                ) : (
                  <p className="mt-1 text-[13px] font-semibold text-success">{t('organizerDash.sponsors.available')}</p>
                )}
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em]',
                  slot.occupiedBy ? 'bg-ink-950 text-white' : 'border border-dashed border-line text-ink-600',
                )}
              >
                {slot.occupiedBy ? t('badges.demo') : t('organizerDash.sponsors.available')}
              </span>
            </div>
            <p className="mt-4 border-t border-line pt-3 text-[12px] text-ink-600">
              {t('organizerDash.sponsors.revenueLabel')}:{' '}
              <span className="font-semibold text-ink-950">
                <CveValue cve={slot.revenueCve} />
              </span>
            </p>
          </DashCard>
        ))}
      </div>
    </>
  );
}

/* ============================ Receita ===================================== */

function RevenueSection() {
  const t = useT();
  const { formatDate, formatNumber } = useI18n();
  const entriesTotal = orgRevenue.byMonth.reduce((acc, m) => acc + m.inscricoes, 0);
  const sponsorTotal = orgRevenue.byMonth.reduce((acc, m) => acc + m.patrocinios, 0);

  return (
    <>
      <DashSectionHeader title={t('organizerDash.revenue.heading')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label={t('organizerDash.revenue.entries')} value={`esc ${formatNumber(entriesTotal)}`} />
        <StatTile label={t('organizerDash.revenue.sponsorships')} value={`esc ${formatNumber(sponsorTotal)}`} />
        <StatTile label={t('organizerDash.revenue.total')} value={`esc ${formatNumber(entriesTotal + sponsorTotal)}`} delta={8.2} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <DashCard title={t('organizerDash.revenue.byMonth')}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orgRevenue.byMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#3F4248' }} tickLine={false} axisLine={{ stroke: '#E6E6E9' }} />
                <YAxis tick={{ fontSize: 11, fill: '#3F4248' }} tickLine={false} axisLine={false} width={56} />
                <Tooltip
                  cursor={{ fill: '#F7F7F8' }}
                  contentStyle={{ border: '1px solid #E6E6E9', borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => [`esc ${formatNumber(Number(value))}`]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="inscricoes" name={t('organizerDash.revenue.entries')} stackId="a" fill="#0A0A0B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="patrocinios" name={t('organizerDash.revenue.sponsorships')} stackId="a" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashCard>
        <DashCard title={t('organizerDash.revenue.invoices')} pad={false}>
          <ul className="divide-y divide-line">
            {orgRevenue.invoices.map((inv) => (
              <li key={inv.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="tnum text-[12px] font-bold text-ink-950">{inv.id}</p>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]',
                      inv.status === 'paid' ? 'bg-ink-950 text-white' : 'border border-warning/40 bg-amber-50 text-warning',
                    )}
                  >
                    {t(`organizerDash.revenue.${inv.status}`)}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-ink-600">{t(`organizerDash.revenue.${inv.conceptKey}`)}</p>
                <div className="mt-1 flex items-center justify-between text-[12px]">
                  <span className="text-ink-600 tnum">{formatDate(inv.date)}</span>
                  <CveValue cve={inv.cve} className="font-semibold text-ink-950" />
                </div>
              </li>
            ))}
          </ul>
        </DashCard>
      </div>
    </>
  );
}

/* ============================ Wizard de criação =========================== */

function CompetitionWizard({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (w: WizardState) => void;
}) {
  const t = useT();
  const { formatNumber } = useI18n();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [w, setW] = useState<WizardState>(wizardDefaults);
  const price = estimateWizardPrice(w);
  const groups = wizardGroups(w.teams);

  const stepKeys = ['data', 'structure', 'extras', 'review'] as const;

  const reset = () => {
    setStep(0);
    setDone(false);
    setW(wizardDefaults);
  };

  const patch = (p: Partial<WizardState>) => setW((prev) => ({ ...prev, ...p }));

  const pricePanel = (
    <aside className="rounded-xl bg-ink-gradient p-5 text-white">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">{t('organizerDash.wizard.priceTitle')}</p>
      <dl className="mt-4 space-y-2 text-[13px]">
        <div className="flex justify-between"><dt className="text-white/60">{t('organizerDash.wizard.priceBase')}</dt><dd className="tnum">esc {formatNumber(wizardPricing.baseCve)}</dd></div>
        <div className="flex justify-between"><dt className="text-white/60">{t('organizerDash.wizard.priceTeams', { teams: w.teams })}</dt><dd className="tnum">esc {formatNumber(w.teams * wizardPricing.perTeamCve)}</dd></div>
        <div className="flex justify-between"><dt className="text-white/60">{t('organizerDash.wizard.priceGroups', { groups: groups.length })}</dt><dd className="tnum">esc {formatNumber(groups.length * wizardPricing.perGroupCve)}</dd></div>
        {w.matchScouting && <div className="flex justify-between"><dt className="text-white/60">{t('organizerDash.wizard.matchScouting')}</dt><dd className="tnum">esc {formatNumber(wizardPricing.extras.matchScouting)}</dd></div>}
        {w.video && <div className="flex justify-between"><dt className="text-white/60">{t('organizerDash.wizard.video')}</dt><dd className="tnum">esc {formatNumber(wizardPricing.extras.video)}</dd></div>}
        {w.advancedStats && <div className="flex justify-between"><dt className="text-white/60">{t('organizerDash.wizard.advancedStats')}</dt><dd className="tnum">esc {formatNumber(wizardPricing.extras.advancedStats)}</dd></div>}
        <div className="flex justify-between"><dt className="text-white/60">{t('organizerDash.wizard.priceScouts', { scouts: w.scouts })}</dt><dd className="tnum">esc {formatNumber(w.scouts * wizardPricing.perScoutCve)}</dd></div>
      </dl>
      <div className="mt-4 border-t border-ink-700 pt-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">{t('organizerDash.wizard.priceTotal')}</p>
        <p className="mt-1 font-display text-[32px] font-extrabold leading-none tnum">
          esc <CountUp value={price} />
        </p>
        <p className="mt-1 text-[11px] text-white/50">{t('common.currencyHint', { eur: formatNumber(Math.round(price / 110)) })}</p>
        <p className="mt-2 text-[11px] text-white/40">{t('organizerDash.wizard.priceDisclaimer')}</p>
      </div>
    </aside>
  );

  return (
    <DashModal open={open} onClose={() => { onClose(); reset(); }} title={t('organizerDash.wizard.title')} wide>
      {done ? (
        <div className="py-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-950">
            <Check size={26} className="text-brand-500" aria-hidden />
          </span>
          <h3 className="mt-4 font-display text-[22px] font-extrabold text-ink-950">{t('organizerDash.wizard.successTitle')}</h3>
          <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink-600">{t('organizerDash.wizard.successBody')}</p>
          <PrimaryButton className="mt-6" onClick={() => { onCreated(w); reset(); }}>
            {t('organizerDash.wizard.close')}
          </PrimaryButton>
        </div>
      ) : (
        <>
          {/* Stepper */}
          <ol className="mb-6 flex items-center gap-2">
            {stepKeys.map((key, i) => (
              <li key={key} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold tnum',
                    i < step ? 'bg-success text-white' : i === step ? 'bg-brand-500 text-white' : 'bg-paper-100 text-ink-600',
                  )}
                >
                  {i < step ? <Check size={13} aria-hidden /> : i + 1}
                </span>
                <span className={cn('hidden text-[12px] font-semibold sm:block', i === step ? 'text-ink-950' : 'text-ink-600')}>
                  {t(`organizerDash.wizard.steps.${key}`)}
                </span>
                {i < stepKeys.length - 1 && <span className="h-px flex-1 bg-line" aria-hidden />}
              </li>
            ))}
          </ol>

          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="min-h-[300px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -32 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  {step === 0 && (
                    <div className="space-y-4">
                      <Field label={t('organizerDash.wizard.name')}>
                        <input className={inputCls} value={w.name} onChange={(e) => patch({ name: e.target.value })} placeholder={t('organizerDash.wizard.namePlaceholder')} />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label={t('organizerDash.wizard.sport')}>
                          <select className={inputCls} value={w.sport} onChange={(e) => patch({ sport: e.target.value as WizardState['sport'] })}>
                            <option value="basketball">{t('sports.basketball')}</option>
                            <option value="football">{t('sports.football')}</option>
                            <option value="athletics">{t('sports.athletics')}</option>
                          </select>
                        </Field>
                        <Field label={t('organizerDash.wizard.season')}>
                          <select className={inputCls} value={w.season} onChange={(e) => patch({ season: e.target.value })}>
                            <option value="2027">2027</option>
                            <option value="2027/28">2027/28</option>
                            <option value="2028">2028</option>
                          </select>
                        </Field>
                      </div>
                      <Field label={t('organizerDash.wizard.island')}>
                        <select className={inputCls} value={w.island} onChange={(e) => patch({ island: e.target.value })}>
                          {['Santiago', 'São Vicente', 'Sal', 'Fogo', 'Santo Antão', 'Boa Vista'].map((i) => (
                            <option key={i} value={i}>{i}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label={t('organizerDash.wizard.rules')}>
                        <textarea className={textareaCls} rows={4} value={w.rules} onChange={(e) => patch({ rules: e.target.value })} placeholder={t('organizerDash.wizard.rulesPlaceholder')} />
                      </Field>
                      <OutlineButton>{t('organizerDash.wizard.uploadPdf')}</OutlineButton>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-5">
                      <Field label={`${t('organizerDash.wizard.teams')}: ${w.teams}`}>
                        <input
                          type="range"
                          min={4}
                          max={16}
                          value={w.teams}
                          onChange={(e) => patch({ teams: Number(e.target.value) })}
                          className="w-full accent-brand-500"
                          aria-label={t('organizerDash.wizard.teams')}
                        />
                      </Field>
                      <Field label={t('organizerDash.wizard.format')}>
                        <div className="grid grid-cols-2 gap-2">
                          {(['league', 'cup'] as const).map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => patch({ format: f })}
                              className={cn(
                                'h-10 rounded-lg border text-[13px] font-semibold transition-colors cursor-pointer',
                                w.format === f ? 'border-ink-950 bg-ink-950 text-white' : 'border-line text-ink-600 hover:border-ink-950',
                              )}
                            >
                              {t(`organizerDash.wizard.${f === 'league' ? 'formatLeague' : 'formatCup'}`)}
                            </button>
                          ))}
                        </div>
                      </Field>
                      <div>
                        <p className="mb-2 text-[12px] font-semibold text-ink-950">{t('organizerDash.wizard.groupsAuto')}</p>
                        <div className="flex flex-wrap gap-2">
                          {groups.map((g) => (
                            <span key={g} className="rounded-full bg-ink-950 px-3 py-1.5 text-[12px] font-bold text-white">
                              {t('organizerDash.teams.groupLabel', { g })} · <span className="tnum">{Math.ceil(w.teams / groups.length)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-[12px] font-semibold text-ink-950">{t('organizerDash.wizard.calendarPreview')}</p>
                        <p className="mb-2 text-[11px] text-ink-600">{t('organizerDash.wizard.calendarNote')}</p>
                        <div className="overflow-hidden rounded-lg border border-line">
                          <table className="w-full text-left text-[12px]">
                            <tbody>
                              {[1, 2, 3].map((r) => (
                                <tr key={r} className="border-t border-line first:border-t-0">
                                  <td className="bg-paper-50 px-3 py-2 font-bold tnum">{t('organizerDash.games.round', { n: r })}</td>
                                  <td className="px-3 py-2 text-ink-600 tnum">{Math.floor(groups.length * Math.ceil(w.teams / groups.length) / 2)} × {t('organizerDash.menu.games').toLowerCase()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="divide-y divide-line rounded-xl border border-line px-4">
                        <div className="py-3"><DashToggle checked={w.matchScouting} onChange={(v) => patch({ matchScouting: v })} label={t('organizerDash.wizard.matchScouting')} /></div>
                        <div className="py-3"><DashToggle checked={w.video} onChange={(v) => patch({ video: v })} label={t('organizerDash.wizard.video')} /></div>
                        <div className="py-3"><DashToggle checked={w.advancedStats} onChange={(v) => patch({ advancedStats: v })} label={t('organizerDash.wizard.advancedStats')} /></div>
                      </div>
                      <Field label={`${t('organizerDash.wizard.scouts')}: ${w.scouts}`}>
                        <input
                          type="range"
                          min={0}
                          max={12}
                          value={w.scouts}
                          onChange={(e) => patch({ scouts: Number(e.target.value) })}
                          className="w-full accent-brand-500"
                          aria-label={t('organizerDash.wizard.scouts')}
                        />
                      </Field>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink-600">{t('organizerDash.wizard.summary')}</p>
                      <dl className="space-y-2 rounded-xl border border-line p-4 text-[13px]">
                        <div className="flex justify-between gap-3"><dt className="text-ink-600">{t('organizerDash.wizard.name')}</dt><dd className="font-semibold text-ink-950 text-right">{w.name || '—'}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-ink-600">{t('organizerDash.wizard.sport')}</dt><dd className="font-semibold text-ink-950">{t(`sports.${w.sport}`)}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-ink-600">{t('organizerDash.wizard.season')}</dt><dd className="font-semibold text-ink-950 tnum">{w.season}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-ink-600">{t('organizerDash.wizard.island')}</dt><dd className="font-semibold text-ink-950">{w.island}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-ink-600">{t('organizerDash.wizard.teams')}</dt><dd className="font-semibold text-ink-950 tnum">{w.teams} · {groups.map((g) => g).join('/')}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-ink-600">{t('organizerDash.wizard.format')}</dt><dd className="font-semibold text-ink-950">{t(`organizerDash.wizard.${w.format === 'league' ? 'formatLeague' : 'formatCup'}`)}</dd></div>
                      </dl>
                      <p className="rounded-lg border border-line bg-paper-50 px-3 py-2 text-[11px] text-ink-600">
                        {t('organizerDash.wizard.priceDisclaimer')}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {pricePanel}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
            <GhostButton onClick={() => setStep((s) => Math.max(0, s - 1))} className={step === 0 ? 'invisible' : ''}>
              {t('organizerDash.wizard.back')}
            </GhostButton>
            {step < 3 ? (
              <PrimaryButton onClick={() => setStep((s) => s + 1)} disabled={step === 0 && w.name.trim() === ''}>
                {t('organizerDash.wizard.next')}
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => setDone(true)}>{t('organizerDash.wizard.finish')}</PrimaryButton>
            )}
          </div>
        </>
      )}
    </DashModal>
  );
}
