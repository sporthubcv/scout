/**
 * ClubProfile (/clubs/:id) — public institutional club profile.
 * Design spec: /mnt/agents/output/design/club-profile.md
 * Hero (dark) + tabs: Plantel · Jogos · Estatísticas · Scouting · Vídeos · Sobre.
 * All clubs and data are fictional demo content.
 */
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, ChevronRight, ClipboardList, Eye, Radio, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import { getAthlete, getClub, matches } from '@/data';
import { allVideos, getClubExtras } from '@/data/extra-profiles';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import OvrSquare from '@/components/shared/OvrSquare';
import StatusBadge from '@/components/shared/StatusBadge';
import StatTile from '@/components/shared/StatTile';
import TabsUnderline from '@/components/shared/TabsUnderline';
import EmptyState from '@/components/shared/EmptyState';
import { useDemoToast } from '@/components/profiles/DemoToast';
import { VideoGallery } from '@/components/profiles/VideoComponents';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const TAB_IDS = ['roster', 'matches', 'stats', 'scouting', 'videos', 'about'] as const;
type TabId = (typeof TAB_IDS)[number];

export default function ClubProfile() {
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const { locale, formatDate } = useI18n();
  const { toast, show } = useDemoToast();
  const club = id ? getClub(id) : undefined;

  const [tab, setTab] = useState<TabId>('roster');
  const [following, setFollowing] = useState(false);
  const [rosterFilter, setRosterFilter] = useState<'all' | 'sub18' | 'senior'>('all');

  const extras = useMemo(() => (club ? getClubExtras(club) : null), [club]);

  if (!club || !extras) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          useIllustration
          title={t('clubProfile.notFoundTitle')}
          body={t('clubProfile.notFoundBody')}
          ctaLabel={t('clubProfile.notFoundCta')}
          onCta={() => {
            window.location.href = '/discover';
          }}
        />
      </div>
    );
  }

  const rosterAthletes = club.athleteIds
    .map((aid) => getAthlete(aid))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  const filteredExtraRoster = extras.rosterExtra.filter(
    (r) => rosterFilter === 'all' || r.ageGroup === rosterFilter,
  );
  const clubVideos = allVideos.filter(
    (v) => (v.athleteId && club.athleteIds.includes(v.athleteId)) || (v.competitionId && club.id === 'atletico-achada'),
  );
  const liveMatch = club.id === 'atletico-achada' ? matches.find((m) => m.status === 'live') : undefined;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
      {/* Hero */}
      <section className="bg-ink-gradient bg-glow-orange text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav aria-label="breadcrumb" className="mb-8 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50">
            <Link to="/discover" className="transition-colors hover:text-white">{t('nav.discover')}</Link>
            <ChevronRight size={12} aria-hidden />
            <Link to="/discover" className="transition-colors hover:text-white">{t('nav.clubs')}</Link>
            <ChevronRight size={12} aria-hidden />
            <span className="text-white/80">{club.name}</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr_auto]">
            <motion.div
              initial={{ opacity: 0, rotate: -4 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              <MonogramAvatar name={club.name} size={112} className="rounded-xl" />
            </motion.div>

            <div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.08 }}
                className="font-display text-[32px] font-extrabold uppercase leading-[1.1] tracking-[-0.02em] lg:text-[40px]"
              >
                {club.name}
              </motion.h1>
              {club.verified && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.4 }}
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-950"
                >
                  <BadgeCheck size={12} className="text-brand-500" aria-hidden />
                  {t('clubProfile.hero.verifiedClub')}
                </motion.span>
              )}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {club.sports.map((s) => (
                  <span key={s} className="rounded-full bg-ink-800 px-3 py-1 text-[12px] font-medium text-white/80">
                    {t(`sports.${s}`)}
                  </span>
                ))}
                <span className="rounded-full bg-ink-800 px-3 py-1 text-[12px] font-medium text-white/80">
                  {club.city}, {club.island}
                </span>
                <span className="rounded-full bg-ink-800 px-3 py-1 text-[12px] font-medium text-white/80 tnum">
                  {t('clubProfile.hero.founded', { year: club.founded })}
                </span>
                <span className="rounded-full bg-ink-800 px-3 py-1 text-[12px] font-medium text-white/80">{extras.venue}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFollowing((f) => !f);
                    show(t('clubProfile.hero.followDone'));
                  }}
                  className="inline-flex h-11 items-center rounded-lg border border-ink-700 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-ink-800 cursor-pointer"
                >
                  {following ? t('clubProfile.hero.following') : t('clubProfile.hero.follow')}
                </button>
                <a
                  href="#club-tabs"
                  className="inline-flex h-11 items-center rounded-lg bg-brand-500 px-5 text-[14px] font-semibold text-white transition-all hover:bg-brand-600 active:scale-[0.97]"
                >
                  {t('clubProfile.hero.viewRoster')}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:w-[300px] lg:grid-cols-1">
              {[
                { label: t('clubProfile.hero.rosterCount'), value: extras.rosterSize, icon: Users },
                { label: t('clubProfile.hero.gamesSeason'), value: extras.gamesSeason, icon: ClipboardList },
                { label: t('clubProfile.hero.titles'), value: extras.titles, icon: BadgeCheck },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease, delay: 0.15 + i * 0.08 }}
                  className="rounded-xl border border-ink-700 bg-white/5 p-4"
                >
                  <p className="font-display text-[26px] font-extrabold leading-none tnum">{s.value}</p>
                  <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-white/50">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="mt-8 border-t border-ink-700 pt-4 text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
            {t('clubProfile.hero.demoStrip')}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div id="club-tabs" className="sticky top-16 z-30 scroll-mt-20 border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TabsUnderline
            id="club-profile"
            tabs={TAB_IDS.map((tabId) => ({ id: tabId, label: t(`clubProfile.tabs.${tabId}`) }))}
            active={tab}
            onChange={(id) => setTab(id as TabId)}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* -------- Plantel -------- */}
            {tab === 'roster' && (
              <div className="py-10">
                <div className="flex flex-wrap items-center gap-2">
                  {(['all', 'sub18', 'senior'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setRosterFilter(f)}
                      className={cn(
                        'h-9 rounded-full border px-3.5 text-[12px] font-semibold transition-colors cursor-pointer',
                        rosterFilter === f ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white text-ink-600 hover:border-ink-950',
                      )}
                    >
                      {f === 'all' ? t('clubProfile.roster.filterAll') : f === 'sub18' ? t('clubProfile.roster.filterU18') : t('clubProfile.roster.filterSeniors')}
                    </button>
                  ))}
                  <span className="ml-auto text-[13px] font-medium text-ink-600">
                    {t('clubProfile.roster.coach', { name: extras.coach })}
                  </span>
                </div>

                <div className="mt-5 overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                  <ul className="divide-y divide-line">
                    {(rosterFilter === 'senior' ? [] : rosterAthletes).map((a, i) => (
                      <motion.li
                        key={a.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.04, ease }}
                      >
                        <Link to={`/athletes/${a.id}`} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-paper-50">
                          <span className="w-8 text-center font-display text-sm font-extrabold text-ink-600 tnum">#{7 + i}</span>
                          <MonogramAvatar name={a.name} size={40} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-semibold text-ink-950">{a.name}</p>
                            <p className="text-[12px] text-ink-600 tnum">
                              {2027 - a.birthYear} · {a.heightCm ? `${a.heightCm} cm · ` : ''}{a.position}
                            </p>
                          </div>
                          {a.verification === 'verified' && <StatusBadge variant="verifiedProfile" className="hidden sm:inline-flex" />}
                          <OvrSquare value={a.ovr.value} size={36} />
                        </Link>
                      </motion.li>
                    ))}
                    {filteredExtraRoster.map((r, i) => (
                      <motion.li
                        key={r.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (rosterAthletes.length + i) * 0.04, ease }}
                        className="flex items-center gap-4 px-4 py-3"
                      >
                        <span className="w-8 text-center font-display text-sm font-extrabold text-ink-600 tnum">#{r.shirt}</span>
                        <MonogramAvatar name={r.name} size={40} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-semibold text-ink-950">{r.name}</p>
                          <p className="text-[12px] text-ink-600 tnum">
                            {r.ageGroup === 'sub18' ? t('clubProfile.roster.filterU18') : t('clubProfile.roster.filterSeniors')} · {r.heightCm} cm · {r.position}
                          </p>
                        </div>
                        <OvrSquare value={r.ovr} size={36} />
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* -------- Jogos -------- */}
            {tab === 'matches' && (
              <div className="space-y-10 py-10">
                {liveMatch && (
                  <Link
                    to={`/match-scouting/${liveMatch.id}`}
                    className="flex flex-wrap items-center gap-4 rounded-xl border border-danger/30 bg-ink-950 p-5 text-white"
                  >
                    <StatusBadge variant="live" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/50">{t('clubProfile.matches.liveNow')}</p>
                      <p className="mt-0.5 font-display text-lg font-bold">
                        {liveMatch.homeTeam} <span className="tnum text-brand-500">{liveMatch.homeScore}–{liveMatch.awayScore}</span> {liveMatch.awayTeam}
                      </p>
                      <p className="text-[12px] text-white/60 tnum">{liveMatch.quarter} · {liveMatch.clock} · {liveMatch.venue}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-[13px] font-semibold">
                      <Radio size={15} aria-hidden />
                      {t('clubProfile.matches.watchLive')}
                    </span>
                  </Link>
                )}

                <section>
                  <h2 className="mb-4 font-display text-xl font-bold text-ink-950">{t('clubProfile.matches.upcoming')}</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {extras.upcoming.map((m) => (
                      <div key={m.date + m.opponent} className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-600 tnum">
                          {formatDate(m.date)} · {m.competition}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <MonogramAvatar name={m.opponent} size={36} />
                          <p className="font-display text-lg font-bold text-ink-950">{m.opponent}</p>
                        </div>
                        <p className="mt-2 text-[13px] text-ink-600">{m.venue}</p>
                        {m.scouting && (
                          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-brand-600">
                            <Eye size={11} aria-hidden />
                            {t('clubProfile.matches.scoutingAssigned')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="mb-4 font-display text-xl font-bold text-ink-950">{t('clubProfile.matches.results')}</h2>
                  <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                    <ul className="divide-y divide-line">
                      {extras.results.map((r, i) => (
                        <motion.li
                          key={r.date + r.opponent}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="flex flex-wrap items-center gap-4 px-5 py-3.5"
                        >
                          <span className="text-[12px] text-ink-600 tnum">{formatDate(r.date, { day: 'numeric', month: 'short' })}</span>
                          <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink-950">{r.opponent}</span>
                          <span className={cn('rounded-md px-2 py-0.5 font-display text-sm font-extrabold tnum', r.win ? 'bg-emerald-50 text-success' : 'bg-red-50 text-danger')}>
                            {r.win ? t('clubProfile.matches.win') : t('clubProfile.matches.loss')} {r.score}
                          </span>
                          <span className="hidden text-[12px] text-ink-600 sm:block">
                            {t('clubProfile.matches.topPerformer')}: {r.topPerformer}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>
            )}

            {/* -------- Estatísticas -------- */}
            {tab === 'stats' && (
              <div className="space-y-6 py-10">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {extras.teamStats.map((s) => (
                    <div key={s.labelKey} className="relative">
                      <StatTile label={t(`clubProfile.stats.${s.labelKey}`)} value={s.value} />
                      <span className="absolute right-3 top-3 rounded-full bg-paper-100 px-2 py-0.5 text-[10px] font-bold text-ink-600 tnum">
                        {t('clubProfile.stats.leagueRank', { rank: s.rank })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                    <h3 className="font-display text-lg font-bold text-ink-950">{t('clubProfile.stats.pointsPerGame')}</h3>
                    <div className="mt-4 h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={extras.pointsSeries.map((v, i) => ({ game: `J${i + 1}`, pts: v }))} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                          <CartesianGrid stroke="#E6E6E9" vertical={false} />
                          <XAxis dataKey="game" tick={{ fontSize: 11, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                          <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #E6E6E9', fontSize: 12 }} />
                          <Bar dataKey="pts" fill="#0A0A0B" radius={[4, 4, 0, 0]} animationDuration={600} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                  <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                    <h3 className="font-display text-lg font-bold text-ink-950">{t('clubProfile.stats.radarTitle')}</h3>
                    <div className="mt-4 h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={extras.radar} outerRadius="72%">
                          <PolarGrid stroke="#E6E6E9" />
                          <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: '#3F4248' }} />
                          <Radar name={t('clubProfile.stats.team')} dataKey="team" stroke="#F97316" fill="#F97316" fillOpacity={0.25} animationDuration={800} />
                          <Radar name={t('clubProfile.stats.leagueAvg')} dataKey="league" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.15} animationDuration={800} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* -------- Scouting -------- */}
            {tab === 'scouting' && (
              <div className="space-y-6 py-10">
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatTile label={t('clubProfile.scouting.reportsCreated')} value={extras.scouting.reports} />
                  <StatTile label={t('clubProfile.scouting.athletesObserved')} value={extras.scouting.observed} />
                  <StatTile label={t('clubProfile.scouting.matchScoutingUsed')} value={extras.scouting.matchScoutingGames} />
                </div>
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                  <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                    <h3 className="font-display text-lg font-bold text-ink-950">{t('clubProfile.scouting.recentActivity')}</h3>
                    <ul className="mt-3 divide-y divide-line">
                      {extras.scoutingActivity.map((a) => (
                        <li key={a.date + a.textPt} className="flex items-center justify-between gap-4 py-3">
                          <span className="text-[13px] font-medium text-ink-950">{locale === 'en' ? a.textEn : a.textPt}</span>
                          <span className="shrink-0 text-[12px] text-ink-600 tnum">{formatDate(a.date, { day: 'numeric', month: 'short' })}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/dashboard/club" className="mt-4 inline-block text-[14px] font-semibold text-brand-600 hover:text-brand-500">
                      {t('clubProfile.scouting.manage')} →
                    </Link>
                  </section>
                  <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                    <h3 className="font-display text-base font-bold text-ink-950">
                      {t('clubProfile.scouting.planUsage', { plan: extras.planUsage.plan })}
                    </h3>
                    <div className="mt-4 space-y-4">
                      {(
                        [
                          [t('clubProfile.scouting.usageGames'), extras.planUsage.games],
                          [t('clubProfile.scouting.usageAthletes'), extras.planUsage.athletes],
                          [t('clubProfile.scouting.usageScouts'), extras.planUsage.scouts],
                        ] as [string, [number, number]][]
                      ).map(([label, [used, total]]) => (
                        <div key={label}>
                          <div className="flex justify-between text-[12px] font-medium text-ink-600">
                            <span>{label}</span>
                            <span className="tnum">{used}/{total}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-100">
                            <div className="h-full rounded-full bg-brand-500" style={{ width: `${(used / total) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* -------- Vídeos -------- */}
            {tab === 'videos' && (
              <div className="space-y-10 py-10">
                <section>
                  <h2 className="mb-4 font-display text-xl font-bold text-ink-950">{t('clubProfile.videos.teamHighlights')}</h2>
                  {clubVideos.filter((v) => v.kind === 'highlight').length === 0 ? (
                    <EmptyState title={t('videosPage.empty.title')} body={t('videosPage.empty.body')} />
                  ) : (
                    <VideoGallery items={clubVideos.filter((v) => v.kind === 'highlight')} />
                  )}
                </section>
                <section>
                  <h2 className="mb-4 font-display text-xl font-bold text-ink-950">{t('clubProfile.videos.fullGames')}</h2>
                  {clubVideos.filter((v) => v.kind === 'fullGame').length === 0 ? (
                    <EmptyState title={t('videosPage.empty.title')} body={t('videosPage.empty.body')} />
                  ) : (
                    <VideoGallery items={clubVideos.filter((v) => v.kind === 'fullGame')} />
                  )}
                </section>
              </div>
            )}

            {/* -------- Sobre -------- */}
            {tab === 'about' && (
              <div className="grid gap-6 py-10 lg:grid-cols-[2fr_1fr]">
                <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                  <h2 className="font-display text-xl font-bold text-ink-950">{t('clubProfile.about.title')}</h2>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-600">
                    {locale === 'en' ? extras.descriptionEn : extras.descriptionPt}
                  </p>
                  <p className="mt-4 flex items-center gap-2 rounded-lg bg-paper-50 px-3.5 py-2.5 text-[12px] font-medium text-ink-600">
                    <BadgeCheck size={14} className="text-success" aria-hidden />
                    {t('clubProfile.about.contactsNote')}
                  </p>
                  <h3 className="mt-6 font-display text-base font-bold text-ink-950">{t('clubProfile.about.staff')}</h3>
                  <ul className="mt-3 divide-y divide-line">
                    {extras.staff.map((s) => (
                      <li key={s.name} className="flex items-center gap-3 py-2.5">
                        <MonogramAvatar name={s.name} size={32} />
                        <span className="text-[14px] font-semibold text-ink-950">{s.name} {t('clubProfile.about.fictionalTag')}</span>
                        <span className="ml-auto text-[12px] text-ink-600">
                          {s.role === 'coach' ? t('clubProfile.about.roleCoach') : s.role === 'fitness' ? t('clubProfile.about.roleFitness') : t('clubProfile.about.roleDirector')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                  <h3 className="font-display text-base font-bold text-ink-950">{t('clubProfile.about.facts')}</h3>
                  <dl className="mt-3 divide-y divide-line">
                    {(
                      [
                        [t('clubProfile.about.founded'), String(club.founded)],
                        [t('clubProfile.about.venue'), extras.venue],
                        [t('clubProfile.about.colors'), extras.colors],
                        [t('clubProfile.about.divisions'), extras.divisions],
                        [t('common.sport'), club.sports.map((s) => t(`sports.${s}`)).join(' · ')],
                        [t('common.island'), `${club.island} — ${club.city}`],
                      ] as [string, string][]
                    ).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-4 py-2.5">
                        <dt className="text-[12px] font-medium text-ink-600">{k}</dt>
                        <dd className="text-right text-[13px] font-semibold text-ink-950">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {toast}
    </motion.div>
  );
}
