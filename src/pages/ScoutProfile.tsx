/**
 * ScoutProfile (/scouts/:id) — professional credibility profile for a scout.
 * Design spec: /mnt/agents/output/design/scout-profile.md
 * Hero (dark) + tabs: Visão Geral · Avaliações · Relatórios · Atletas
 * acompanhados · Jogos observados. All scouts and data are fictional.
 */
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, ChevronRight, ClipboardCheck, Mail, Radio, UserCheck, UserPlus } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useI18n, useT } from '@/i18n';
import { getAthlete, getScout, matches, scoutReports } from '@/data';
import { getScoutExtras } from '@/data/extra-profiles';
import type { ScoutEvaluationRow } from '@/data/extra-profiles';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import OvrSquare from '@/components/shared/OvrSquare';
import StatusBadge from '@/components/shared/StatusBadge';
import TabsUnderline from '@/components/shared/TabsUnderline';
import EmptyState from '@/components/shared/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDemoToast } from '@/components/profiles/DemoToast';
import { EvaluationBars, RecommendationChip, ScoutReportCard } from '@/components/profiles/ReportComponents';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const TAB_IDS = ['overview', 'evaluations', 'reports', 'followed', 'matches'] as const;
type TabId = (typeof TAB_IDS)[number];

export default function ScoutProfile() {
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const { locale, formatDate } = useI18n();
  const { toast, show } = useDemoToast();
  const scout = id ? getScout(id) : undefined;

  const [tab, setTab] = useState<TabId>('overview');
  const [following, setFollowing] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contextFilter, setContextFilter] = useState<'all' | 'game' | 'training'>('all');
  const [drawerEval, setDrawerEval] = useState<ScoutEvaluationRow | null>(null);

  const extras = useMemo(() => (scout ? getScoutExtras(scout) : null), [scout]);

  if (!scout || !extras) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          useIllustration
          title={t('scoutProfile.notFoundTitle')}
          body={t('scoutProfile.notFoundBody')}
          ctaLabel={t('scoutProfile.notFoundCta')}
          onCta={() => {
            window.location.href = '/discover';
          }}
        />
      </div>
    );
  }

  const reports = scoutReports.filter((r) => r.scoutId === scout.id);
  const evaluations = extras.evaluations.filter((e) => contextFilter === 'all' || e.context === contextFilter);
  const liveObserved = extras.matchesObserved.find((m) => m.live);

  const heroStats = [
    { label: t('scoutProfile.hero.evaluated'), value: extras.metrics.evaluated },
    { label: t('scoutProfile.hero.reports'), value: extras.metrics.reports },
    { label: t('scoutProfile.hero.recommended'), value: extras.metrics.recommended },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
      {/* Hero */}
      <section className="bg-ink-gradient bg-glow-orange text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav aria-label="breadcrumb" className="mb-8 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50">
            <Link to="/discover" className="transition-colors hover:text-white">{t('nav.discover')}</Link>
            <ChevronRight size={12} aria-hidden />
            <Link to="/discover" className="transition-colors hover:text-white">{t('nav.scouts')}</Link>
            <ChevronRight size={12} aria-hidden />
            <span className="text-white/80">{scout.name}</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr_auto]">
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }}>
              <MonogramAvatar name={scout.name} size={128} className="rounded-xl" />
            </motion.div>

            <div>
              <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-brand-500">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
                {t('scoutProfile.hero.eyebrow')}
              </p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.08 }}
                className="mt-2 font-display text-[32px] font-extrabold uppercase leading-[1.1] tracking-[-0.02em] lg:text-[40px]"
              >
                {scout.name}
              </motion.h1>
              {scout.verified && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.4 }}
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-950"
                >
                  <BadgeCheck size={12} className="text-brand-500" aria-hidden />
                  {t('scoutProfile.hero.verifiedScout')}
                </motion.span>
              )}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {scout.specialties.map((s) => (
                  <span key={s} className="rounded-full bg-ink-800 px-3 py-1 text-[12px] font-medium text-white/80">
                    {t(`sports.${s}`)}
                  </span>
                ))}
                {extras.specialtiesExtra.map((s) => (
                  <span key={s} className="rounded-full bg-ink-800 px-3 py-1 text-[12px] font-medium text-white/80">{s}</span>
                ))}
                <span className="rounded-full bg-ink-800 px-3 py-1 text-[12px] font-medium text-white/80">
                  {t('athleteProfile.hero.country')} · {scout.island}
                </span>
                <span className="rounded-full bg-ink-800 px-3 py-1 text-[12px] font-medium text-white/80">{scout.organization}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFollowing((f) => !f);
                    show(t('scoutProfile.hero.followDone'));
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-ink-700 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-ink-800 cursor-pointer"
                >
                  {following ? <UserCheck size={16} aria-hidden /> : <UserPlus size={16} aria-hidden />}
                  {following ? t('scoutProfile.hero.following') : t('scoutProfile.hero.follow')}
                </button>
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-[14px] font-semibold text-white transition-all hover:bg-brand-600 active:scale-[0.97] cursor-pointer"
                >
                  <Mail size={16} aria-hidden />
                  {t('scoutProfile.hero.contact')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:w-[280px] lg:grid-cols-1">
              {heroStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease, delay: 0.15 + i * 0.1 }}
                  className="rounded-xl border border-ink-700 bg-white/5 p-4"
                >
                  <p className="font-display text-[28px] font-extrabold leading-none tnum">{s.value}</p>
                  <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-white/50">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-16 z-30 border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TabsUnderline
            id="scout-profile"
            tabs={TAB_IDS.map((tabId) => ({ id: tabId, label: t(`scoutProfile.tabs.${tabId}`) }))}
            active={tab}
            onChange={(tid) => setTab(tid as TabId)}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* -------- Visão Geral -------- */}
            {tab === 'overview' && (
              <div className="grid gap-6 py-10 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                  <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                    <h2 className="font-display text-xl font-bold text-ink-950">{t('scoutProfile.overview.specialties')}</h2>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {scout.specialties.map((s) => (
                        <span key={s} className="rounded-full bg-ink-950 px-3 py-1 text-[12px] font-semibold text-white">
                          {t(`sports.${s}`)}
                        </span>
                      ))}
                      {[...extras.specialtiesExtra, ...extras.scopeChips].map((s) => (
                        <span key={s} className="rounded-full border border-line bg-white px-3 py-1 text-[12px] font-semibold text-ink-600">{s}</span>
                      ))}
                    </div>
                    <h3 className="mt-6 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-600">{t('scoutProfile.overview.about')}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-600">
                      {locale === 'en' ? extras.aboutEn : extras.aboutPt}
                    </p>
                  </section>

                  <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                    <h2 className="font-display text-lg font-bold text-ink-950">{t('scoutProfile.overview.activityTitle')}</h2>
                    <div className="mt-4 h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={extras.monthlyActivity} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                          <CartesianGrid stroke="#E6E6E9" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#3F4248' }} axisLine={false} tickLine={false} />
                          <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #E6E6E9', fontSize: 12 }} />
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#0A0A0B"
                            strokeWidth={2}
                            fill="#0A0A0B"
                            fillOpacity={0.06}
                            dot={{ r: 3, fill: '#0A0A0B' }}
                            activeDot={{ r: 5, fill: '#F97316' }}
                            animationDuration={900}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                    <h2 className="font-display text-lg font-bold text-ink-950">{t('scoutProfile.overview.recentRecs')}</h2>
                    <ul className="mt-3 divide-y divide-line">
                      {extras.recommendedAthleteIds.map((aid) => {
                        const a = getAthlete(aid);
                        if (!a) return null;
                        return (
                          <li key={aid}>
                            <Link to={`/athletes/${a.id}`} className="flex items-center gap-3 py-3 transition-colors hover:bg-paper-50">
                              <MonogramAvatar name={a.name} size={36} />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[14px] font-semibold text-ink-950">{a.name}</p>
                                <p className="text-[12px] text-ink-600">{t(`sports.${a.sport}`)} · {a.position}</p>
                              </div>
                              <OvrSquare value={a.ovr.value} size={32} />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>

                  <section className="rounded-xl bg-ink-gradient p-5 text-white">
                    <h2 className="font-display text-lg font-bold">{t('scoutProfile.overview.trustTitle')}</h2>
                    <ul className="mt-4 space-y-3 text-[13px]">
                      <li className="flex items-center gap-2 text-white/80">
                        <BadgeCheck size={15} className="text-brand-500" aria-hidden />
                        {t('scoutProfile.overview.verifiedSince', { date: formatDate(extras.trust.verifiedSince) })}
                      </li>
                      <li className="flex items-center justify-between border-t border-ink-700 pt-3">
                        <span className="text-white/60">{t('scoutProfile.overview.acceptedByClubs')}</span>
                        <span className="font-display text-lg font-extrabold tnum">{extras.trust.acceptedByClubs}</span>
                      </li>
                      <li className="flex items-center justify-between border-t border-ink-700 pt-3">
                        <span className="text-white/60">{t('scoutProfile.overview.followUpRate')}</span>
                        <span className="font-display text-lg font-extrabold text-brand-500 tnum">{extras.trust.followUpRate}%</span>
                      </li>
                    </ul>
                  </section>
                </div>
              </div>
            )}

            {/* -------- Avaliações -------- */}
            {tab === 'evaluations' && (
              <div className="py-10">
                <div className="flex flex-wrap gap-2">
                  {(['all', 'game', 'training'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setContextFilter(f)}
                      className={cn(
                        'h-9 rounded-full border px-3.5 text-[12px] font-semibold transition-colors cursor-pointer',
                        contextFilter === f ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white text-ink-600 hover:border-ink-950',
                      )}
                    >
                      {f === 'all' ? t('scoutProfile.evaluations.filterAll') : f === 'game' ? t('scoutProfile.evaluations.contextGame') : t('scoutProfile.evaluations.contextTraining')}
                    </button>
                  ))}
                </div>

                <div className="mt-5 overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-[13px]">
                      <thead>
                        <tr className="bg-paper-50 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                          <th className="px-5 py-3">{t('scoutProfile.evaluations.athlete')}</th>
                          <th className="px-3 py-3">{t('scoutProfile.evaluations.date')}</th>
                          <th className="px-3 py-3">{t('scoutProfile.evaluations.context')}</th>
                          <th className="px-3 py-3">{t('scoutProfile.evaluations.scores')}</th>
                          <th className="px-5 py-3">{t('scoutProfile.evaluations.recommendation')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluations.map((e, i) => {
                          const a = getAthlete(e.athleteId);
                          return (
                            <motion.tr
                              key={`${e.athleteId}-${e.date}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, delay: i * 0.04 }}
                              onClick={() => setDrawerEval(e)}
                              className="cursor-pointer border-t border-line transition-colors hover:bg-paper-50"
                            >
                              <td className="px-5 py-3">
                                <span className="flex items-center gap-3">
                                  {a && <MonogramAvatar name={a.name} size={30} />}
                                  <span className="font-semibold text-ink-950">{a?.name ?? e.athleteId}</span>
                                </span>
                              </td>
                              <td className="px-3 py-3 text-ink-600 tnum">{formatDate(e.date, { day: 'numeric', month: 'short' })}</td>
                              <td className="px-3 py-3 text-ink-600">
                                <span className="mr-1.5 rounded-full bg-paper-100 px-2 py-0.5 text-[10px] font-bold uppercase text-ink-600">
                                  {e.context === 'game' ? t('scoutProfile.evaluations.contextGame') : t('scoutProfile.evaluations.contextTraining')}
                                </span>
                                {e.contextLabel}
                              </td>
                              <td className="px-3 py-3 tnum text-ink-950">
                                Téc. {e.technical.toFixed(1)} · Dec. {e.decision.toFixed(1)} · Atl. {e.athleticism.toFixed(1)} · Pot. {e.potential.toFixed(1)}
                              </td>
                              <td className="px-5 py-3"><RecommendationChip recommendation={e.recommendation} /></td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------- Relatórios -------- */}
            {tab === 'reports' && (
              <div className="py-10">
                {reports.length === 0 ? (
                  <EmptyState
                    icon={ClipboardCheck}
                    title={t('scoutProfile.tabs.reports')}
                    body={t('common.demoData')}
                  />
                ) : (
                  <div className="grid gap-5 lg:grid-cols-2">
                    {reports.map((r, i) => (
                      <ScoutReportCard key={r.id} report={r} pinned={i === 0} defaultExpanded={i === 0} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* -------- Atletas acompanhados -------- */}
            {tab === 'followed' && (
              <div className="grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
                {extras.followed.map((f) => {
                  const a = getAthlete(f.athleteId);
                  if (!a) return null;
                  return (
                    <motion.div
                      key={f.athleteId}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.4, ease }}
                    >
                      <Link
                        to={`/athletes/${a.id}`}
                        className="block rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(10,10,11,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]"
                      >
                        <div className="flex items-center gap-3">
                          <MonogramAvatar name={a.name} size={44} />
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-semibold text-ink-950">{a.name}</p>
                            <p className="text-[11px] font-medium text-ink-600">{t('scoutProfile.followed.since', { months: f.months })}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                          <div className="flex h-8 items-end gap-[3px]" aria-hidden>
                            {[f.ovrFrom, Math.round((f.ovrFrom + f.ovrTo) / 2), f.ovrTo].map((v, i) => (
                              <span
                                key={i}
                                className={cn('w-2 rounded-sm', i === 2 ? 'bg-brand-500' : 'bg-paper-100')}
                                style={{ height: `${Math.max(20, ((v - 50) / 40) * 100)}%` }}
                              />
                            ))}
                          </div>
                          <span className="text-[12px] font-bold text-ink-950 tnum">
                            {t('scoutProfile.followed.ovrEvolution', { from: f.ovrFrom, to: f.ovrTo })}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* -------- Jogos observados -------- */}
            {tab === 'matches' && (
              <div className="py-10">
                <div className="space-y-3">
                  {liveObserved && (
                    <Link
                      to={`/match-scouting/${matches.find((m) => m.status === 'live')?.id ?? 'demo-match'}`}
                      className="flex flex-wrap items-center gap-4 rounded-xl border border-danger/30 bg-ink-950 p-4 text-white"
                    >
                      <StatusBadge variant="live" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold">{liveObserved.match}</p>
                        <p className="text-[11px] text-white/50">{liveObserved.competition}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-[13px] font-semibold">
                        <Radio size={14} aria-hidden />
                        {t('scoutProfile.matches.openLive')}
                      </span>
                    </Link>
                  )}
                  {extras.matchesObserved.filter((m) => !m.live).map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(10,10,11,.05)]"
                    >
                      <span className="text-[12px] text-ink-600 tnum">{formatDate(m.date, { day: 'numeric', month: 'short' })}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-ink-950">{m.match}</p>
                        <p className="text-[11px] text-ink-600">{m.competition}</p>
                      </div>
                      <span className="text-[12px] text-ink-600 tnum">{t('scoutProfile.matches.events', { count: m.events })}</span>
                      <span className="text-[12px] text-ink-600 tnum">{t('scoutProfile.matches.clips', { count: m.clips })}</span>
                      {m.report && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] text-success">
                          <ClipboardCheck size={13} aria-hidden />
                          {t('scoutProfile.matches.reportGenerated')}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Evaluation report drawer */}
      <Sheet open={drawerEval != null} onOpenChange={(o) => !o && setDrawerEval(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[420px]">
          {drawerEval && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">{t('scoutProfile.evaluations.openReport')}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-5 px-4 pb-6">
                {(() => {
                  const a = getAthlete(drawerEval.athleteId);
                  return (
                    <div className="flex items-center gap-3">
                      {a && <MonogramAvatar name={a.name} size={44} />}
                      <div>
                        <p className="text-[15px] font-bold text-ink-950">{a?.name}</p>
                        <p className="text-[12px] text-ink-600 tnum">
                          {formatDate(drawerEval.date)} · {drawerEval.contextLabel}
                        </p>
                      </div>
                    </div>
                  );
                })()}
                <EvaluationBars
                  scores={{
                    technical: drawerEval.technical,
                    decision: drawerEval.decision,
                    athleticism: drawerEval.athleticism,
                    potential: drawerEval.potential,
                  }}
                />
                <RecommendationChip recommendation={drawerEval.recommendation} />
                <p className="rounded-lg bg-paper-50 px-3.5 py-2.5 text-[12px] text-ink-600">
                  {t('athleteProfile.reports.visibilityNote')}
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Contact modal */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{t('scoutProfile.contact.title')}</DialogTitle>
            <DialogDescription>{t('scoutProfile.contact.body')}</DialogDescription>
          </DialogHeader>
          <button
            type="button"
            onClick={() => {
              setContactOpen(false);
              show(t('scoutProfile.contact.sent'));
            }}
            className="h-11 w-full rounded-lg bg-brand-500 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600 cursor-pointer"
          >
            {t('scoutProfile.contact.cta')}
          </button>
        </DialogContent>
      </Dialog>

      {toast}
    </motion.div>
  );
}
