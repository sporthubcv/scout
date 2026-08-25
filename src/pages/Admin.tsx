/**
 * Admin (/admin) — full platform control: verification queue (the heart),
 * moderation, users, subscriptions, payments, analytics, settings, audit logs.
 * Verification decisions persist to localStorage (shs-verification-decisions)
 * and append audit entries (shs-audit-extra) — closing the trust loop started
 * in the athlete dashboard. All data fictional (design: admin-dashboard.md).
 */
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileWarning,
  Flag,
  Handshake,
  LayoutDashboard,
  ListOrdered,
  Play,
  Receipt,
  Settings,
  Shield,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardShell, { type ShellMenuSection } from '@/components/DashboardShell';
import StatTile from '@/components/shared/StatTile';
import StatusBadge from '@/components/shared/StatusBadge';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import OvrSquare from '@/components/shared/OvrSquare';
import { useI18n, useT } from '@/i18n';
import {
  athletes,
  clubs,
  competitions,
  matches,
  scouts,
  scoutReports,
  sponsors,
  statistics,
  videos,
} from '@/data';
import {
  LS_AUDIT_EXTRA,
  LS_VERIFICATIONS,
  adminActivityStrip,
  adminAuditSeed,
  adminFunnel,
  adminKpis,
  adminPayments,
  adminRetention,
  adminSignupsWeekly,
  adminSubscriptions,
  adminUsers,
  adminVerificationsWeekly,
  moderationQueueSeed,
  readJson,
  resetDemoStorage,
  verificationQueueSeed,
  writeJson,
  sponsorAudience,
  type ModerationItem,
  type VerificationQueueItem,
} from '@/data/extra-dash-b';
import { cn } from '@/lib/utils';
import {
  DashCard,
  DashDrawer,
  DashModal,
  DashSectionHeader,
  DashTable,
  DashToggle,
  Field,
  GhostButton,
  OutlineButton,
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

interface AuditEntry {
  id: string;
  actor: string;
  actionKey: string;
  target: string;
  at: string;
  ip: string;
}

type Decision = { status: 'approved' | 'rejected'; reason?: string; at: string };

export default function Admin() {
  return (
    <ToastProvider>
      <AdminInner />
    </ToastProvider>
  );
}

function AdminInner() {
  const t = useT();
  const location = useLocation();
  const section = location.hash.replace('#', '') || 'overview';

  const [decisions, setDecisions] = useState<Record<string, Decision>>(() => readJson(LS_VERIFICATIONS, {}));
  const [auditExtra, setAuditExtra] = useState<AuditEntry[]>(() => readJson(LS_AUDIT_EXTRA, []));
  const [moderationDone, setModerationDone] = useState<string[]>([]);
  const [suspended, setSuspended] = useState<string[]>([]);

  const queue = verificationQueueSeed.filter((v) => !decisions[v.id]);
  const openReports = moderationQueueSeed.filter((m) => !moderationDone.includes(m.id));

  const appendAudit = (actionKey: string, target: string) => {
    const entry: AuditEntry = {
      id: `alx-${Date.now()}`,
      actor: 'Admin SportHubCV',
      actionKey,
      target,
      at: new Date().toISOString(),
      ip: '10.24.0.12',
    };
    const next = [entry, ...auditExtra];
    setAuditExtra(next);
    writeJson(LS_AUDIT_EXTRA, next);
  };

  const decide = (item: VerificationQueueItem, status: 'approved' | 'rejected', reason?: string) => {
    const next = { ...decisions, [item.id]: { status, reason, at: new Date().toISOString() } };
    setDecisions(next);
    writeJson(LS_VERIFICATIONS, next);
    appendAudit(status === 'approved' ? 'auditActVerifyOk' : 'auditActVerifyNo', `${item.entity} — ${item.detail}`);
  };

  const sections: ShellMenuSection[] = [
    {
      label: t('admin.groups.main'),
      items: [
        { to: '#overview', label: t('admin.menu.overview'), icon: LayoutDashboard, end: true },
        { to: '#analytics', label: t('admin.menu.analytics'), icon: BarChart3 },
      ],
    },
    {
      label: t('admin.groups.people'),
      items: [
        { to: '#users', label: t('admin.menu.users'), icon: Users },
        { to: '#athletes', label: t('admin.menu.athletes'), icon: Activity },
        { to: '#clubs', label: t('admin.menu.clubs'), icon: Shield },
        { to: '#scouts', label: t('admin.menu.scouts'), icon: ClipboardList },
      ],
    },
    {
      label: t('admin.groups.sport'),
      items: [
        { to: '#competitions', label: t('admin.menu.competitions'), icon: Trophy },
        { to: '#matches', label: t('admin.menu.matches'), icon: CalendarDays },
        { to: '#statistics', label: t('admin.menu.statistics'), icon: ListOrdered },
        { to: '#videos', label: t('admin.menu.videos'), icon: Play },
        { to: '#reports', label: t('admin.menu.reports'), icon: FileWarning },
      ],
    },
    {
      label: t('admin.groups.trust'),
      items: [
        { to: '#verification', label: t('admin.menu.verification'), icon: ShieldCheck, badge: queue.length },
        { to: '#moderation', label: t('admin.menu.moderation'), icon: Flag, badge: openReports.length },
      ],
    },
    {
      label: t('admin.groups.business'),
      items: [
        { to: '#sponsors', label: t('admin.menu.sponsors'), icon: Handshake },
        { to: '#subscriptions', label: t('admin.menu.subscriptions'), icon: Wallet },
        { to: '#payments', label: t('admin.menu.payments'), icon: Receipt },
      ],
    },
    {
      label: t('admin.groups.system'),
      items: [
        { to: '#settings', label: t('admin.menu.settings'), icon: Settings },
        { to: '#audit', label: t('admin.menu.audit'), icon: ClipboardList },
      ],
    },
  ];

  const auditAll: AuditEntry[] = useMemo(
    () => [...auditExtra, ...adminAuditSeed].sort((a, b) => b.at.localeCompare(a.at)),
    [auditExtra],
  );

  return (
    <DashboardShell
      title={t('admin.title')}
      sections={sections}
      plan={{ name: t('admin.planCard.name'), usageLabel: t('admin.planCard.usage'), usagePct: 100 }}
    >
      {section === 'overview' && <OverviewSection pendingCount={queue.length} reportsCount={openReports.length} />}
      {section === 'analytics' && <AnalyticsSection />}
      {section === 'users' && (
        <UsersSection
          suspended={suspended}
          onSuspend={(id, name) => {
            setSuspended((s) => [...s, id]);
            appendAudit('auditActSuspend', name);
          }}
        />
      )}
      {section === 'athletes' && <AthletesSection />}
      {section === 'clubs' && <ClubsSection />}
      {section === 'scouts' && <ScoutsSection />}
      {section === 'competitions' && <CompetitionsSection onFeature={(name) => appendAudit('auditActFeature', name)} />}
      {section === 'matches' && <MatchesSection />}
      {section === 'statistics' && <StatisticsSection />}
      {section === 'videos' && <VideosSection />}
      {section === 'reports' && <ReportsAdminSection />}
      {section === 'verification' && <VerificationSection queue={queue} decisions={decisions} onDecide={decide} />}
      {section === 'moderation' && (
        <ModerationSection
          openItems={openReports}
          onResolve={(item, actionKey) => {
            setModerationDone((d) => [...d, item.id]);
            appendAudit(actionKey, item.videoTitle);
          }}
        />
      )}
      {section === 'sponsors' && <SponsorsAdminSection />}
      {section === 'subscriptions' && <SubscriptionsSection />}
      {section === 'payments' && <PaymentsSection />}
      {section === 'settings' && <SettingsSection />}
      {section === 'audit' && <AuditSection entries={auditAll} />}
    </DashboardShell>
  );
}

/* ============================ Overview ==================================== */

function OverviewSection({ pendingCount, reportsCount }: { pendingCount: number; reportsCount: number }) {
  const t = useT();
  const { formatNumber } = useI18n();
  const loading = useDemoLoading();

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[92px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          <StatTile label={t('admin.kpis.users')} value={formatNumber(adminKpis.users)} delta={6.9} />
          <StatTile label={t('admin.kpis.athletes')} value={adminKpis.athletes} delta={4.1} />
          <StatTile label={t('admin.kpis.clubs')} value={adminKpis.clubs} delta={1.2} />
          <StatTile label={t('admin.kpis.competitions')} value={adminKpis.competitions} delta={2} />
          <div className="rounded-xl border border-warning/40 bg-amber-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-warning">{t('admin.kpis.pendingVerifications')}</p>
            <p className="mt-1.5 font-display text-[32px] font-extrabold leading-none text-ink-950 tnum">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-danger/40 bg-red-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-danger">{t('admin.kpis.openReports')}</p>
            <p className="mt-1.5 font-display text-[32px] font-extrabold leading-none text-ink-950 tnum">{reportsCount}</p>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <DashCard title={t('admin.overview.signups')}>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={adminSignupsWeekly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E9" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#3F4248' }} tickLine={false} axisLine={{ stroke: '#E6E6E9' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#3F4248' }} tickLine={false} axisLine={false} width={36} />
                  <Tooltip contentStyle={{ border: '1px solid #E6E6E9', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="signups" stroke="#F97316" strokeWidth={2.5} fill="#FFF7F0" isAnimationActive animationDuration={900} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashCard>

          <DashCard title={t('admin.overview.verifications')}>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adminVerificationsWeekly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E9" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#3F4248' }} tickLine={false} axisLine={{ stroke: '#E6E6E9' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#3F4248' }} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ border: '1px solid #E6E6E9', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="processed" fill="#0A0A0B" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashCard>

          <DashCard title={t('admin.overview.activity')}>
            <div className="flex h-16 items-end gap-1" aria-hidden>
              {adminActivityStrip.map((v, i) => (
                <motion.div
                  key={i}
                  className={cn('flex-1 rounded-sm', i === adminActivityStrip.length - 1 ? 'bg-brand-500' : 'bg-ink-950/80')}
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / Math.max(...adminActivityStrip)) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.02 }}
                />
              ))}
            </div>
          </DashCard>
        </div>

        <div className="space-y-5">
          <DashCard title={t('admin.overview.systemTitle')}>
            <ul className="space-y-2.5">
              {(['api', 'storage', 'cdn'] as const).map((k) => (
                <li key={k} className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-ink-950">{t(`admin.overview.system.${k}`)}</span>
                  <span className="flex items-center gap-1.5 font-semibold text-success">
                    <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
                    {t('admin.overview.ok')}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-line pt-2 text-[11px] text-ink-600">{t('admin.overview.systemNote')}</p>
          </DashCard>

          <DashCard title={t('admin.overview.quickActions')}>
            <div className="space-y-2">
              <a href="#verification" className="flex h-10 items-center justify-between rounded-lg border border-line px-3 text-[13px] font-semibold text-ink-950 transition-colors hover:border-ink-950">
                {t('admin.overview.qaVerification')}
                <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white tnum">{pendingCount}</span>
              </a>
              <a href="#moderation" className="flex h-10 items-center justify-between rounded-lg border border-line px-3 text-[13px] font-semibold text-ink-950 transition-colors hover:border-ink-950">
                {t('admin.overview.qaModeration')}
                <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white tnum">{reportsCount}</span>
              </a>
              <a href="#audit" className="flex h-10 items-center rounded-lg border border-line px-3 text-[13px] font-semibold text-ink-950 transition-colors hover:border-ink-950">
                {t('admin.overview.qaAudit')}
              </a>
            </div>
          </DashCard>
        </div>
      </div>
    </>
  );
}

/* ============================ Verification (the heart) ==================== */

function VerificationSection({
  queue,
  decisions,
  onDecide,
}: {
  queue: VerificationQueueItem[];
  decisions: Record<string, Decision>;
  onDecide: (item: VerificationQueueItem, status: 'approved' | 'rejected', reason?: string) => void;
}) {
  const t = useT();
  const { formatDate } = useI18n();
  const toast = useToast();
  const [tab, setTab] = useState<'queue' | 'approved' | 'rejected'>('queue');
  const [target, setTarget] = useState<VerificationQueueItem | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');
  const [checked, setChecked] = useState<string[]>([]);

  const decidedItems = verificationQueueSeed.filter((v) => decisions[v.id]);
  const approved = decidedItems.filter((v) => decisions[v.id].status === 'approved');
  const rejected = decidedItems.filter((v) => decisions[v.id].status === 'rejected');

  const openReview = (item: VerificationQueueItem) => {
    setTarget(item);
    setRejectMode(false);
    setReason('');
    setChecked([]);
  };

  const tabs = [
    { id: 'queue' as const, label: `${t('admin.verification.tabs.queue')} (${queue.length})` },
    { id: 'approved' as const, label: `${t('admin.verification.tabs.approved')} (${approved.length})` },
    { id: 'rejected' as const, label: `${t('admin.verification.tabs.rejected')} (${rejected.length})` },
  ];

  return (
    <>
      <DashSectionHeader title={t('admin.verification.heading')} sub={t('admin.verification.ruleNote')} />

      <div className="mb-4 flex gap-2">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setTab(tb.id)}
            className={cn(
              'h-9 rounded-full border px-3.5 text-[13px] font-semibold transition-colors cursor-pointer tnum',
              tab === tb.id ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white text-ink-600 hover:border-ink-950',
            )}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <DashCard pad={false}>
        {tab === 'queue' && (
          <DashTable>
            <THead>
              <Th>{t('admin.verification.cols.type')}</Th>
              <Th>{t('admin.verification.cols.entity')}</Th>
              <Th>{t('admin.verification.cols.submitted')}</Th>
              <Th>{t('admin.verification.cols.priority')}</Th>
              <Th />
            </THead>
            <tbody>
              {queue.map((item) => (
                <TRow key={item.id} onClick={() => openReview(item)}>
                  <Td>
                    <span className="inline-flex rounded-full bg-paper-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                      {t(`admin.verification.kinds.${item.kind}`)}
                    </span>
                  </Td>
                  <Td>
                    <p className="font-semibold">{item.entity}</p>
                    <p className="text-[11px] text-ink-600">{item.detail}</p>
                  </Td>
                  <Td className="tnum text-ink-600">
                    {item.submittedDaysAgo === 1
                      ? t('admin.verification.dayAgo')
                      : t('admin.verification.daysAgo', { n: item.submittedDaysAgo })}
                  </Td>
                  <Td>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]',
                        item.priority === 'high' ? 'bg-brand-100 text-brand-600' : 'bg-paper-100 text-ink-600',
                      )}
                    >
                      {t(`admin.verification.priority.${item.priority}`)}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <GhostButton>{t('admin.tables.view')}</GhostButton>
                  </Td>
                </TRow>
              ))}
              {queue.length === 0 && (
                <TRow>
                  <Td colSpan={5} className="py-10 text-center text-ink-600">
                    {t('admin.verification.emptyQueue')}
                  </Td>
                </TRow>
              )}
            </tbody>
          </DashTable>
        )}

        {tab !== 'queue' && (
          <DashTable>
            <THead>
              <Th>{t('admin.verification.cols.type')}</Th>
              <Th>{t('admin.verification.cols.entity')}</Th>
              <Th>{t('admin.verification.decidedOn', { date: '' }).replace(/:.*/, '')}</Th>
              {tab === 'rejected' && <Th>{t('admin.verification.reason')}</Th>}
            </THead>
            <tbody>
              {(tab === 'approved' ? approved : rejected).map((item) => {
                const d = decisions[item.id];
                return (
                  <TRow key={item.id}>
                    <Td>
                      <StatusBadge variant={tab === 'approved' ? 'verifiedStats' : 'rejected'} />
                    </Td>
                    <Td>
                      <p className="font-semibold">{item.entity}</p>
                      <p className="text-[11px] text-ink-600">{item.detail}</p>
                    </Td>
                    <Td className="tnum text-ink-600">{formatDate(d.at)}</Td>
                    {tab === 'rejected' && <Td className="text-danger">{d.reason}</Td>}
                  </TRow>
                );
              })}
              {(tab === 'approved' ? approved : rejected).length === 0 && (
                <TRow>
                  <Td colSpan={4} className="py-10 text-center text-ink-600">
                    {t('admin.tables.empty')}
                  </Td>
                </TRow>
              )}
            </tbody>
          </DashTable>
        )}
      </DashCard>

      {/* Review drawer */}
      <DashDrawer open={target !== null} onClose={() => setTarget(null)} title={t('admin.verification.drawerTitle')}>
        {target && (
          <div className="space-y-5">
            <div>
              <p className="font-display text-[16px] font-bold text-ink-950">{target.entity}</p>
              <p className="text-[12px] text-ink-600">{target.detail}</p>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-600">
                {t('admin.verification.evidenceViewer')}
              </p>
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-paper-50">
                <FileWarning size={26} className="text-ink-600/40" aria-hidden />
                <p className="text-[12px] font-medium text-ink-600">{t('admin.verification.evidencePlaceholder')}</p>
                <p className="text-[11px] text-ink-600/70">{t(`admin.verification.evidenceLabels.${target.evidenceLabel}`)}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-600">
                {t('admin.verification.claimed')}
              </p>
              <dl className="space-y-1.5 rounded-xl border border-line p-3">
                {target.claimed.map((c) => (
                  <div key={c.label} className="flex items-center justify-between text-[13px]">
                    <dt className="text-ink-600">{c.label}</dt>
                    <dd className="tnum font-display text-[15px] font-extrabold text-ink-950">{c.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-600">
                {t('admin.verification.history')}
              </p>
              <p className="text-[13px] text-ink-600">{t(`admin.verification.histories.${target.history}`)}</p>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-600">
                {t('admin.verification.checklist')}
              </p>
              <ul className="space-y-1.5">
                {(['c1', 'c2', 'c3'] as const).map((ck) => (
                  <li key={ck}>
                    <button
                      type="button"
                      onClick={() => setChecked((prev) => (prev.includes(ck) ? prev.filter((x) => x !== ck) : [...prev, ck]))}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-paper-50 cursor-pointer"
                    >
                      <span
                        className={cn(
                          'flex h-[18px] w-[18px] items-center justify-center rounded border',
                          checked.includes(ck) ? 'border-success bg-success text-white' : 'border-line bg-white',
                        )}
                        aria-hidden
                      >
                        {checked.includes(ck) && <BadgeCheck size={12} />}
                      </span>
                      <span className="text-[13px] text-ink-950">{t(`admin.verification.checklistItems.${ck}`)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <p className="rounded-lg border border-info/30 bg-blue-50 px-3 py-2 text-[11px] font-medium text-info">
              {t('admin.verification.ruleNote')}
            </p>

            {rejectMode ? (
              <div className="space-y-3">
                <Field label={t('admin.verification.rejectReason')}>
                  <textarea
                    className={textareaCls}
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t('admin.verification.rejectReasonPlaceholder')}
                  />
                </Field>
                <div className="flex gap-2">
                  <GhostButton onClick={() => setRejectMode(false)} className="flex-1">
                    {t('common.back')}
                  </GhostButton>
                  <button
                    type="button"
                    disabled={reason.trim() === ''}
                    onClick={() => {
                      onDecide(target, 'rejected', reason.trim());
                      setTarget(null);
                      toast(t('admin.verification.rejectedToast'));
                    }}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-danger px-5 text-[14px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle size={16} aria-hidden />
                    {t('admin.verification.rejectConfirm')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectMode(true)}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-danger/40 bg-red-50 px-5 text-[14px] font-semibold text-danger transition-colors hover:bg-red-100 cursor-pointer"
                >
                  <XCircle size={16} aria-hidden />
                  {t('admin.verification.reject')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDecide(target, 'approved');
                    setTarget(null);
                    toast(t('admin.verification.approvedToast'));
                  }}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-success px-5 text-[14px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] cursor-pointer"
                >
                  <BadgeCheck size={16} aria-hidden />
                  {t('admin.verification.approve')}
                </button>
              </div>
            )}
          </div>
        )}
      </DashDrawer>
    </>
  );
}

/* ============================ Moderation ================================== */

function ModerationSection({
  openItems,
  onResolve,
}: {
  openItems: ModerationItem[];
  onResolve: (item: ModerationItem, actionKey: string) => void;
}) {
  const t = useT();
  const toast = useToast();

  const act = (item: ModerationItem) => {
    onResolve(item, 'auditActModeration');
    toast(t('admin.moderation.actionToast'));
  };

  return (
    <>
      <DashSectionHeader title={t('admin.moderation.heading')} />
      <div className="mb-5 rounded-xl border border-warning/40 bg-amber-50 px-4 py-3 text-[13px] font-medium text-warning">
        {t('admin.moderation.minorNote')}
      </div>
      {openItems.length === 0 ? (
        <DashCard>
          <p className="py-6 text-center text-[14px] text-ink-600">{t('admin.moderation.emptyQueue')}</p>
        </DashCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {openItems.map((item) => (
            <DashCard key={item.id} pad={false}>
              <img src={item.thumb} alt="" className="aspect-video w-full rounded-t-xl object-cover" loading="lazy" />
              <div className="p-4">
                <p className="text-[13px] font-semibold text-ink-950">{item.videoTitle}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em]',
                      item.reasonKey === 'minor' ? 'border border-warning/40 bg-amber-50 text-warning' : 'bg-paper-100 text-ink-600',
                    )}
                  >
                    {t(`admin.moderation.reasons.${item.reasonKey}`)}
                  </span>
                  <span className="text-[11px] text-ink-600 tnum">
                    {item.reporterCount === 1
                      ? t('admin.moderation.reportCount', { n: item.reporterCount })
                      : t('admin.moderation.reportsCount', { n: item.reporterCount })}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-ink-600">{t('admin.moderation.notifyNote')}</p>
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  <OutlineButton className="h-9 px-0 text-[12px]" onClick={() => act(item)}>
                    {t('admin.moderation.keep')}
                  </OutlineButton>
                  <OutlineButton className="h-9 px-0 text-[12px]" onClick={() => act(item)}>
                    {t('admin.moderation.restrict')}
                  </OutlineButton>
                  <button
                    type="button"
                    onClick={() => act(item)}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-danger px-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
                  >
                    {t('admin.moderation.remove')}
                  </button>
                </div>
              </div>
            </DashCard>
          ))}
        </div>
      )}
    </>
  );
}

/* ============================ Users ======================================= */

function UsersSection({ suspended, onSuspend }: { suspended: string[]; onSuspend: (id: string, name: string) => void }) {
  const t = useT();
  const { formatDate } = useI18n();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  const roles = Array.from(new Set(adminUsers.map((u) => u.role)));
  const rows = adminUsers.filter(
    (u) =>
      (roleFilter === 'all' || u.role === roleFilter) &&
      u.name.toLowerCase().includes(query.toLowerCase()),
  );

  const statusOf = (id: string, base: string) => (suspended.includes(id) ? 'suspended' : base);
  const detailUser = adminUsers.find((u) => u.id === detail) ?? null;

  return (
    <>
      <DashSectionHeader title={t('admin.menu.users')} />
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className={cn(inputCls, 'max-w-[240px]')}
          placeholder={t('admin.tables.search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t('admin.tables.search')}
        />
        <select className={cn(inputCls, 'max-w-[200px]')} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label={t('admin.tables.cols.role')}>
          <option value="all">{t('admin.tables.allRoles')}</option>
          {roles.map((r) => (
            <option key={r} value={r}>{t(`roles.${r}`)}</option>
          ))}
        </select>
      </div>
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('admin.tables.cols.name')}</Th>
            <Th>{t('admin.tables.cols.role')}</Th>
            <Th>{t('admin.tables.cols.status')}</Th>
            <Th>{t('admin.tables.cols.verification')}</Th>
            <Th>{t('admin.tables.cols.joined')}</Th>
            <Th />
          </THead>
          <tbody>
            {rows.map((u) => {
              const status = statusOf(u.id, u.status);
              return (
                <TRow key={u.id} onClick={() => setDetail(u.id)}>
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <MonogramAvatar name={u.name} size={28} />
                      <span className="font-semibold">{u.name}</span>
                    </span>
                  </Td>
                  <Td className="text-ink-600">{t(`roles.${u.role}`)}</Td>
                  <Td>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]',
                        status === 'active' && 'bg-ink-950 text-white',
                        status === 'pending' && 'border border-info/40 bg-blue-50 text-info',
                        status === 'suspended' && 'border border-danger/40 bg-red-50 text-danger',
                      )}
                    >
                      {t(`admin.tables.status.${status}`)}
                    </span>
                  </Td>
                  <Td>{u.verified ? <StatusBadge variant="verifiedProfile" /> : <span className="text-ink-600">—</span>}</Td>
                  <Td className="tnum text-ink-600">{formatDate(u.joined)}</Td>
                  <Td className="text-right">
                    {status !== 'suspended' && (
                      <OutlineButton
                        onClick={() => setConfirmTarget({ id: u.id, name: u.name })}
                      >
                        {t('admin.tables.suspend')}
                      </OutlineButton>
                    )}
                  </Td>
                </TRow>
              );
            })}
            {rows.length === 0 && (
              <TRow>
                <Td colSpan={6} className="py-10 text-center text-ink-600">{t('admin.tables.empty')}</Td>
              </TRow>
            )}
          </tbody>
        </DashTable>
      </DashCard>

      {/* Suspend confirm */}
      <DashModal open={confirmTarget !== null} onClose={() => setConfirmTarget(null)} title={t('admin.tables.suspendTitle')}>
        <p className="text-[14px] text-ink-600">{t('admin.tables.suspendBody')}</p>
        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={() => setConfirmTarget(null)}>{t('common.back')}</GhostButton>
          <button
            type="button"
            onClick={() => {
              if (confirmTarget) onSuspend(confirmTarget.id, confirmTarget.name);
              setConfirmTarget(null);
              toast(t('admin.tables.suspendedToast'));
            }}
            className="inline-flex h-10 items-center rounded-lg bg-danger px-4 text-[13px] font-semibold text-white hover:opacity-90 cursor-pointer"
          >
            {t('admin.tables.suspendConfirm')}
          </button>
        </div>
      </DashModal>

      {/* Detail drawer with activity timeline */}
      <DashDrawer open={detail !== null} onClose={() => setDetail(null)} title={t('admin.tables.detailTitle')}>
        {detailUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <MonogramAvatar name={detailUser.name} size={48} />
              <div>
                <p className="font-display text-[16px] font-bold text-ink-950">{detailUser.name}</p>
                <p className="text-[12px] text-ink-600">
                  {t(`roles.${detailUser.role}`)} · {t(`admin.tables.status.${statusOf(detailUser.id, detailUser.status)}`)}
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-600">{t('admin.tables.timeline')}</p>
              <ol className="relative space-y-4 border-l border-line pl-5">
                {(['t1', 't2', 't3', 't4'] as const).map((k, i) => (
                  <li key={k} className="relative">
                    <span
                      className={cn(
                        'absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full',
                        i === 3 && detailUser.verified ? 'bg-success' : i === 3 ? 'bg-paper-100 border border-line' : 'bg-brand-500',
                      )}
                      aria-hidden
                    />
                    <p className="text-[13px] font-medium text-ink-950">{t(`admin.tables.timelineItems.${k}`)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </DashDrawer>
    </>
  );
}

/* ============================ Athletes / Clubs / Scouts =================== */

function AthletesSection() {
  const t = useT();
  const [query, setQuery] = useState('');
  const rows = athletes.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <DashSectionHeader title={t('admin.menu.athletes')} />
      <div className="mb-4">
        <input className={cn(inputCls, 'max-w-[240px]')} placeholder={t('admin.tables.search')} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('admin.tables.search')} />
      </div>
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('admin.tables.cols.name')}</Th>
            <Th>{t('admin.tables.cols.sport')}</Th>
            <Th>{t('common.island')}</Th>
            <Th>{t('common.ovr')}</Th>
            <Th>{t('admin.tables.cols.verification')}</Th>
          </THead>
          <tbody>
            {rows.map((a) => (
              <TRow key={a.id}>
                <Td>
                  <span className="flex items-center gap-2.5">
                    <MonogramAvatar name={a.name} size={28} />
                    <span className="font-semibold">{a.name}</span>
                  </span>
                </Td>
                <Td>{t(`sports.${a.sport}`)}</Td>
                <Td className="text-ink-600">{a.island}</Td>
                <Td><OvrSquare value={a.ovr.value} size={28} /></Td>
                <Td>
                  <StatusBadge
                    variant={
                      a.verification === 'verified'
                        ? 'verifiedProfile'
                        : a.verification === 'pending'
                          ? 'pending'
                          : a.verification === 'rejected'
                            ? 'rejected'
                            : 'selfReported'
                    }
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

function ClubsSection() {
  const t = useT();
  return (
    <>
      <DashSectionHeader title={t('admin.menu.clubs')} />
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('admin.tables.cols.name')}</Th>
            <Th>{t('common.island')}</Th>
            <Th>{t('admin.tables.cols.athletes')}</Th>
            <Th>{t('admin.tables.cols.verification')}</Th>
          </THead>
          <tbody>
            {clubs.map((c) => (
              <TRow key={c.id}>
                <Td>
                  <span className="flex items-center gap-2.5">
                    <MonogramAvatar name={c.name} size={28} />
                    <span className="font-semibold">{c.name}</span>
                  </span>
                </Td>
                <Td className="text-ink-600">{c.island}</Td>
                <Td className="tnum">{c.athleteIds.length * 9}</Td>
                <Td>{c.verified ? <StatusBadge variant="verifiedProfile" /> : <StatusBadge variant="pending" />}</Td>
              </TRow>
            ))}
          </tbody>
        </DashTable>
      </DashCard>
    </>
  );
}

function ScoutsSection() {
  const t = useT();
  return (
    <>
      <DashSectionHeader title={t('admin.menu.scouts')} />
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('admin.tables.cols.name')}</Th>
            <Th>{t('admin.tables.cols.organization')}</Th>
            <Th>{t('admin.tables.cols.reports')}</Th>
            <Th>{t('admin.tables.cols.verification')}</Th>
          </THead>
          <tbody>
            {scouts.map((s) => (
              <TRow key={s.id}>
                <Td>
                  <span className="flex items-center gap-2.5">
                    <MonogramAvatar name={s.name} size={28} />
                    <span className="font-semibold">{s.name}</span>
                  </span>
                </Td>
                <Td className="text-ink-600">{s.organization}</Td>
                <Td className="tnum">{s.reportsCount}</Td>
                <Td>{s.verified ? <StatusBadge variant="verifiedProfile" /> : <StatusBadge variant="pending" />}</Td>
              </TRow>
            ))}
          </tbody>
        </DashTable>
      </DashCard>
    </>
  );
}

/* ============================ Sport modules =============================== */

function CompetitionsSection({ onFeature }: { onFeature: (name: string) => void }) {
  const t = useT();
  const toast = useToast();
  const [featured, setFeatured] = useState<string[]>(['inter-liceu-2027']);
  return (
    <>
      <DashSectionHeader title={t('admin.menu.competitions')} />
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('admin.tables.cols.name')}</Th>
            <Th>{t('admin.tables.cols.sport')}</Th>
            <Th>{t('admin.tables.cols.season')}</Th>
            <Th>{t('admin.tables.cols.teams')}</Th>
            <Th>{t('admin.tables.cols.status')}</Th>
            <Th />
          </THead>
          <tbody>
            {competitions.map((c) => (
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
                <Td className="text-right">
                  <OutlineButton
                    disabled={featured.includes(c.id)}
                    onClick={() => {
                      setFeatured((f) => [...f, c.id]);
                      onFeature(c.name);
                      toast(t('admin.tables.featuredToast'));
                    }}
                  >
                    {t('admin.tables.feature')}
                  </OutlineButton>
                </Td>
              </TRow>
            ))}
          </tbody>
        </DashTable>
      </DashCard>
    </>
  );
}

function MatchesSection() {
  const t = useT();
  const { formatDate } = useI18n();
  return (
    <>
      <DashSectionHeader title={t('admin.menu.matches')} />
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('admin.tables.cols.date')}</Th>
            <Th>{t('organizerDash.menu.games')}</Th>
            <Th className="text-right">{t('admin.tables.cols.score')}</Th>
            <Th>{t('admin.tables.cols.status')}</Th>
          </THead>
          <tbody>
            {matches.map((m) => (
              <TRow key={m.id}>
                <Td className="tnum text-ink-600">{formatDate(m.date, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Td>
                <Td className="font-semibold">
                  {m.homeTeam} <span className="font-normal text-ink-600">{t('organizerDash.games.vs')}</span> {m.awayTeam}
                </Td>
                <Td className="text-right tnum font-display font-extrabold">
                  {m.status === 'scheduled' ? '—' : `${m.homeScore} — ${m.awayScore}`}
                </Td>
                <Td>
                  {m.status === 'live' ? (
                    <StatusBadge variant="live" />
                  ) : (
                    <span className="inline-flex rounded-full bg-paper-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                      {t(`organizerDash.status.${m.status === 'finished' ? 'finished' : 'upcoming'}`)}
                    </span>
                  )}
                </Td>
              </TRow>
            ))}
          </tbody>
        </DashTable>
      </DashCard>
    </>
  );
}

function StatisticsSection() {
  const t = useT();
  const toast = useToast();
  const [locked, setLocked] = useState<string[]>([]);
  const athleteName = (id: string) => athletes.find((a) => a.id === id)?.name ?? id;
  return (
    <>
      <DashSectionHeader title={t('admin.menu.statistics')} />
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('admin.tables.cols.athlete')}</Th>
            <Th>{t('admin.tables.cols.label')}</Th>
            <Th className="text-right">{t('admin.tables.cols.value')}</Th>
            <Th>{t('admin.tables.cols.verification')}</Th>
            <Th />
          </THead>
          <tbody>
            {statistics.map((s) => (
              <TRow key={s.id}>
                <Td className="font-semibold">{athleteName(s.athleteId)}</Td>
                <Td className="text-ink-600">{s.label}</Td>
                <Td className="text-right tnum font-display font-extrabold">{s.value}</Td>
                <Td>
                  <StatusBadge
                    variant={
                      s.verification === 'verified'
                        ? 'verifiedStats'
                        : s.verification === 'pending'
                          ? 'pending'
                          : s.verification === 'rejected'
                            ? 'rejected'
                            : 'selfReported'
                    }
                  />
                </Td>
                <Td className="text-right">
                  <OutlineButton
                    disabled={locked.includes(s.id)}
                    onClick={() => {
                      setLocked((l) => [...l, s.id]);
                      toast(t('admin.tables.lockedToast'));
                    }}
                  >
                    {t('admin.tables.lockStat')}
                  </OutlineButton>
                </Td>
              </TRow>
            ))}
          </tbody>
        </DashTable>
      </DashCard>
    </>
  );
}

function VideosSection() {
  const t = useT();
  const toast = useToast();
  const [unpublished, setUnpublished] = useState<string[]>([]);
  return (
    <>
      <DashSectionHeader title={t('admin.menu.videos')} />
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('admin.tables.cols.name')}</Th>
            <Th>{t('admin.tables.cols.views')}</Th>
            <Th>{t('admin.tables.cols.visibility')}</Th>
            <Th />
          </THead>
          <tbody>
            {videos.map((v) => (
              <TRow key={v.id}>
                <Td>
                  <span className="flex items-center gap-3">
                    <img src={v.thumb} alt="" className="h-9 w-16 rounded-md object-cover" loading="lazy" />
                    <span className="max-w-[320px] truncate font-semibold">{v.title}</span>
                  </span>
                </Td>
                <Td className="tnum">{<Num value={v.views} />}</Td>
                <Td>
                  <span className="inline-flex rounded-full bg-paper-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                    {t(`admin.tables.visibilityValues.${v.visibility}`)}
                  </span>
                </Td>
                <Td className="text-right">
                  <OutlineButton
                    disabled={unpublished.includes(v.id)}
                    onClick={() => {
                      setUnpublished((u) => [...u, v.id]);
                      toast(t('admin.tables.unpublishedToast'));
                    }}
                  >
                    {t('admin.tables.unpublish')}
                  </OutlineButton>
                </Td>
              </TRow>
            ))}
          </tbody>
        </DashTable>
      </DashCard>
    </>
  );
}

function ReportsAdminSection() {
  const t = useT();
  const { formatDate } = useI18n();
  const scoutName = (id: string) => scouts.find((s) => s.id === id)?.name ?? id;
  const athleteName = (id: string) => athletes.find((a) => a.id === id)?.name ?? id;
  return (
    <>
      <DashSectionHeader title={t('admin.menu.reports')} />
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('admin.tables.cols.author')}</Th>
            <Th>{t('admin.tables.cols.athlete')}</Th>
            <Th>{t('admin.tables.cols.date')}</Th>
            <Th>{t('admin.tables.cols.grade')}</Th>
          </THead>
          <tbody>
            {scoutReports.map((r) => (
              <TRow key={r.id}>
                <Td className="font-semibold">{scoutName(r.scoutId)}</Td>
                <Td>{athleteName(r.athleteId)}</Td>
                <Td className="tnum text-ink-600">{formatDate(r.date)}</Td>
                <Td>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ink-950 font-display text-[13px] font-extrabold text-brand-500">
                    {r.grade}
                  </span>
                </Td>
              </TRow>
            ))}
          </tbody>
        </DashTable>
      </DashCard>
    </>
  );
}

/* ============================ Business ==================================== */

function SponsorsAdminSection() {
  const t = useT();
  return (
    <>
      <DashSectionHeader title={t('admin.menu.sponsors')} />
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('admin.tables.cols.sponsor')}</Th>
            <Th>{t('admin.tables.cols.property')}</Th>
            <Th className="text-right">{t('admin.tables.cols.reach')}</Th>
            <Th className="text-right">{t('admin.tables.cols.impressions')}</Th>
          </THead>
          <tbody>
            {sponsors.map((s) => (
              <TRow key={s.id}>
                <Td>
                  <span className="flex items-center gap-2.5">
                    <span className="font-semibold">{s.placeholderName}</span>
                    <StatusBadge variant="demo" />
                  </span>
                </Td>
                <Td className="text-ink-600">{s.property}</Td>
                <Td className="text-right tnum">{<Num value={s.reach} />}</Td>
                <Td className="text-right tnum">{<Num value={s.impressions} />}</Td>
              </TRow>
            ))}
          </tbody>
        </DashTable>
      </DashCard>
    </>
  );
}

function SubscriptionsSection() {
  const t = useT();
  const { formatDate } = useI18n();
  return (
    <>
      <DashSectionHeader title={t('admin.menu.subscriptions')} />
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('admin.tables.cols.plan')}</Th>
            <Th>{t('admin.tables.cols.entity')}</Th>
            <Th>{t('admin.tables.cols.status')}</Th>
            <Th>{t('admin.tables.cols.renewal')}</Th>
            <Th className="text-right">{t('admin.tables.cols.price')}</Th>
          </THead>
          <tbody>
            {adminSubscriptions.map((s) => (
              <TRow key={s.id}>
                <Td className="font-semibold">{s.plan}</Td>
                <Td>{s.entity}</Td>
                <Td>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]',
                      s.status === 'active' ? 'bg-ink-950 text-white' : 'border border-warning/40 bg-amber-50 text-warning',
                    )}
                  >
                    {t(`admin.tables.status.${s.status}`)}
                  </span>
                </Td>
                <Td className="tnum text-ink-600">{formatDate(s.renewal)}</Td>
                <Td className="text-right tnum font-semibold">esc {<Num value={s.cveMonthly} />}</Td>
              </TRow>
            ))}
          </tbody>
        </DashTable>
      </DashCard>
    </>
  );
}

function PaymentsSection() {
  const t = useT();
  const { formatDate } = useI18n();
  return (
    <>
      <DashSectionHeader title={t('admin.menu.payments')} />
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>ID</Th>
            <Th>{t('admin.tables.cols.entity')}</Th>
            <Th>{t('admin.tables.cols.concept')}</Th>
            <Th>{t('admin.tables.cols.date')}</Th>
            <Th className="text-right">{t('admin.tables.cols.amount')}</Th>
            <Th>{t('admin.tables.cols.status')}</Th>
          </THead>
          <tbody>
            {adminPayments.map((p) => (
              <TRow key={p.id}>
                <Td className="tnum font-semibold">{p.id}</Td>
                <Td>{p.entity}</Td>
                <Td className="text-ink-600">{p.concept}</Td>
                <Td className="tnum text-ink-600">{formatDate(p.date)}</Td>
                <Td className="text-right tnum font-semibold">esc {<Num value={p.cve} />}</Td>
                <Td>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]',
                      p.status === 'paid' ? 'bg-ink-950 text-white' : 'border border-danger/40 bg-red-50 text-danger',
                    )}
                  >
                    {t(`admin.tables.status.${p.status}`)}
                  </span>
                </Td>
              </TRow>
            ))}
          </tbody>
        </DashTable>
      </DashCard>
    </>
  );
}

/* ============================ Analytics =================================== */

function AnalyticsSection() {
  const t = useT();
  const maxFunnel = Math.max(...adminFunnel.map((f) => f.value));
  return (
    <>
      <DashSectionHeader title={t('admin.analytics.heading')} />
      <div className="grid gap-5 lg:grid-cols-2">
        <DashCard title={t('admin.analytics.funnelTitle')}>
          <ul className="space-y-3">
            {adminFunnel.map((f, i) => (
              <li key={f.key}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="font-medium text-ink-950">{t(`admin.analytics.funnel.${f.key}`)}</span>
                  <span className="tnum font-bold text-ink-950">{<Num value={f.value} />}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-paper-100">
                  <motion.div
                    className={cn('h-full rounded-full', i === 0 ? 'bg-ink-950' : 'bg-brand-500')}
                    initial={{ width: 0 }}
                    animate={{ width: `${(f.value / maxFunnel) * 100}%` }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </DashCard>

        <DashCard title={t('admin.analytics.retention')}>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adminRetention} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E9" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#3F4248' }} tickLine={false} axisLine={{ stroke: '#E6E6E9' }} />
                <YAxis tick={{ fontSize: 11, fill: '#3F4248' }} tickLine={false} axisLine={false} unit="%" width={40} domain={[50, 90]} />
                <Tooltip contentStyle={{ border: '1px solid #E6E6E9', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`]} />
                <Line type="monotone" dataKey="pct" stroke="#F97316" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={900} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DashCard>

        <DashCard title={t('admin.analytics.topIslands')} className="lg:col-span-2">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sponsorAudience.islands} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#3F4248' }} tickLine={false} axisLine={false} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#0A0A0B' }} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={{ border: '1px solid #E6E6E9', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`]} />
                <Bar dataKey="pct" fill="#0A0A0B" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashCard>
      </div>
    </>
  );
}

/* ============================ Settings ==================================== */

function SettingsSection() {
  const t = useT();
  const { locale, setLocale } = useI18n();
  const [traffic, setTraffic] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <>
      <DashSectionHeader title={t('admin.settings.heading')} />
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Demo controls — highlighted */}
        <DashCard title={t('admin.settings.demoCardTitle')} className="border-brand-500">
          <p className="mb-4 text-[13px] text-ink-600">{t('admin.settings.demoCardBody')}</p>
          <div className="space-y-4">
            <div className="rounded-lg border border-line p-3">
              <DashToggle checked={traffic} onChange={setTraffic} label={t('admin.settings.traffic')} />
            </div>
            <Field label={t('admin.settings.localeDefault')}>
              <select className={inputCls} value={locale} onChange={(e) => setLocale(e.target.value as 'pt-PT' | 'en')}>
                <option value="pt-PT">Português (PT)</option>
                <option value="en">English (EN)</option>
              </select>
            </Field>
            <div>
              <p className="mb-2 text-[12px] font-semibold text-ink-950">{t('admin.settings.flags')}</p>
              <div className="flex items-center justify-between rounded-lg border border-dashed border-line px-3 py-2.5">
                <span className="text-[13px] font-medium text-ink-950">{t('admin.settings.marketplace')}</span>
                <StatusBadge variant="comingLater" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-danger px-5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
            >
              {t('admin.settings.reset')}
            </button>
          </div>
        </DashCard>

        {/* Security posture (read-only demo representation) */}
        <DashCard title={t('admin.settings.securityTitle')}>
          <ul className="space-y-3">
            {(['rbac', 'mfa', 'rate', 'backups', 'audit'] as const).map((k) => (
              <li key={k} className="flex items-center gap-2.5 text-[13px] font-medium text-ink-950">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10">
                  <BadgeCheck size={13} className="text-success" aria-hidden />
                </span>
                {t(`admin.settings.security.${k}`)}
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-line pt-3 text-[11px] text-ink-600">{t('common.demoTooltip')}</p>
        </DashCard>
      </div>

      <DashModal open={confirmReset} onClose={() => setConfirmReset(false)} title={t('admin.settings.resetConfirmTitle')}>
        <p className="text-[14px] text-ink-600">{t('admin.settings.resetConfirmBody')}</p>
        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={() => setConfirmReset(false)}>{t('common.back')}</GhostButton>
          <button
            type="button"
            onClick={() => {
              resetDemoStorage();
              window.location.reload();
            }}
            className="inline-flex h-10 items-center rounded-lg bg-danger px-4 text-[13px] font-semibold text-white hover:opacity-90 cursor-pointer"
          >
            {t('admin.settings.resetConfirm')}
          </button>
        </div>
      </DashModal>
    </>
  );
}

/* ============================ Audit Logs ================================== */

function AuditSection({ entries }: { entries: AuditEntry[] }) {
  const t = useT();
  const { locale } = useI18n();
  const [actorFilter, setActorFilter] = useState('all');
  const actors = useMemo(() => Array.from(new Set(entries.map((e) => e.actor))), [entries]);
  const rows = actorFilter === 'all' ? entries : entries.filter((e) => e.actor === actorFilter);

  return (
    <>
      <DashSectionHeader title={t('admin.audit.heading')} sub={t('admin.audit.note')} />
      <div className="mb-4">
        <select className={cn(inputCls, 'max-w-[240px]')} value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} aria-label={t('admin.audit.filterActor')}>
          <option value="all">{t('admin.audit.filterActor')}</option>
          {actors.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('admin.audit.cols.at')}</Th>
            <Th>{t('admin.audit.cols.actor')}</Th>
            <Th>{t('admin.audit.cols.action')}</Th>
            <Th>{t('admin.audit.cols.target')}</Th>
            <Th>{t('admin.audit.cols.ip')}</Th>
          </THead>
          <tbody>
            {rows.map((e, i) => (
              <motion.tr
                key={e.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i, 10) * 0.02 }}
                className="h-14 border-t border-line text-[13px] text-ink-950"
              >
                <Td className="tnum whitespace-nowrap text-ink-600">
                  {new Date(e.at).toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </Td>
                <Td className="font-semibold">{e.actor}</Td>
                <Td>{t(`admin.audit.actions.${e.actionKey}`)}</Td>
                <Td className="text-ink-600">{e.target}</Td>
                <Td className="tnum text-ink-600">{e.ip}</Td>
              </motion.tr>
            ))}
          </tbody>
        </DashTable>
      </DashCard>
    </>
  );
}
