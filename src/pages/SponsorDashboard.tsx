/**
 * SponsorDashboard (/dashboard/sponsor) — Sponsor Performance for the demo
 * sponsor "Marca Parceira A" (text placeholder, no real brands).
 * All metrics are simulated and clearly marked as demo (design: sponsor-dashboard.md).
 */
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  FileText,
  Globe,
  GraduationCap,
  LayoutDashboard,
  ListOrdered,
  Medal,
  Pause,
  Play,
  Radar,
  Receipt,
  Settings,
  Shirt,
  Star,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardShell, { type ShellMenuSection } from '@/components/DashboardShell';
import StatusBadge from '@/components/shared/StatusBadge';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import { useI18n, useT } from '@/i18n';
import {
  sponsorAudience,
  sponsorCampaigns,
  sponsorContent,
  sponsorInvoices,
  sponsorKpis,
  sponsorProperties,
  sponsorReports,
  sponsorWeekly,
  type SponsorCampaign,
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
  Field,
  PctBar,
  PrimaryButton,
  Num,
  Skeleton,
  THead,
  TRow,
  ToastProvider,
  Td,
  Th,
  inputCls,
  useDemoLoading,
  useToast,
} from '@/components/dash-b/kit';

const SECTION_IDS = ['overview', 'campaigns', 'properties', 'audience', 'content', 'reports', 'billing', 'settings'] as const;
type SectionId = (typeof SECTION_IDS)[number];

const propertyIcons: Record<string, LucideIcon> = {
  platform: Globe,
  rankings: ListOrdered,
  mvp: Trophy,
  talent: Star,
  tournaments: Medal,
  events: CalendarDays,
  scouting: Radar,
  opportunities: Briefcase,
  scholarships: GraduationCap,
  equipment: Shirt,
};

export default function SponsorDashboard() {
  return (
    <ToastProvider>
      <SponsorInner />
    </ToastProvider>
  );
}

function SponsorInner() {
  const t = useT();
  const location = useLocation();
  const section = (location.hash.replace('#', '') || 'overview') as SectionId;
  const [campaignWizard, setCampaignWizard] = useState<{ open: boolean; property: string }>({ open: false, property: 'talent' });

  const sections: ShellMenuSection[] = [
    {
      items: [
        { to: '#overview', label: t('sponsorDash.menu.overview'), icon: LayoutDashboard, end: true },
        { to: '#campaigns', label: t('sponsorDash.menu.campaigns'), icon: TrendingUp },
        { to: '#properties', label: t('sponsorDash.menu.properties'), icon: Trophy },
        { to: '#audience', label: t('sponsorDash.menu.audience'), icon: BarChart3 },
        { to: '#content', label: t('sponsorDash.menu.content'), icon: Play },
        { to: '#reports', label: t('sponsorDash.menu.reports'), icon: FileText },
        { to: '#billing', label: t('sponsorDash.menu.billing'), icon: Receipt },
        { to: '#settings', label: t('sponsorDash.menu.settings'), icon: Settings },
      ],
    },
  ];

  return (
    <DashboardShell
      title={t('sponsorDash.title')}
      sections={sections}
      plan={{ name: t('sponsorDash.planCard.name'), usageLabel: t('sponsorDash.planCard.usage'), usagePct: 60 }}
    >
      {section === 'overview' && <OverviewSection />}
      {section === 'campaigns' && <CampaignsSection onNew={() => setCampaignWizard({ open: true, property: 'talent' })} />}
      {section === 'properties' && <PropertiesSection onActivate={(p) => setCampaignWizard({ open: true, property: p })} />}
      {section === 'audience' && <AudienceSection />}
      {section === 'content' && <ContentSection />}
      {section === 'reports' && <ReportsSection />}
      {section === 'billing' && <BillingSection />}
      {section === 'settings' && (
        <DashCard title={t('sponsorDash.settings.heading')}>
          <p className="text-[14px] text-ink-600">{t('sponsorDash.settings.body')}</p>
        </DashCard>
      )}

      <CampaignWizard
        open={campaignWizard.open}
        property={campaignWizard.property}
        onClose={() => setCampaignWizard((s) => ({ ...s, open: false }))}
      />

      {/* honesty footer strip */}
      <p className="mt-8 rounded-lg border border-line bg-white px-4 py-3 text-center text-[11px] font-medium text-ink-600">
        {t('sponsorDash.honesty')}
      </p>
    </DashboardShell>
  );
}

/* ============================ Visão Geral ================================= */

function KpiDarkCard({ label, value, delta }: { label: string; value: number; delta: number }) {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-ink-700 bg-ink-950 p-4"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-white/50">{label}</p>
      <p className="mt-1.5 font-display text-[28px] font-extrabold leading-none text-white">
        <CountUp value={value} />
      </p>
      <p className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-success tnum">
        <TrendingUp size={13} aria-hidden />
        +{delta}%
        <span className="font-medium text-white/40">{t('sponsorDash.kpis.vsPrevious')}</span>
      </p>
    </motion.div>
  );
}

function OverviewSection() {
  const t = useT();
  const loading = useDemoLoading();
  const [period, setPeriod] = useState<'d7' | 'd30' | 'season'>('d30');

  const kpiDefs = [
    { key: 'reach', value: sponsorKpis.reach, delta: sponsorKpis.deltas.reach },
    { key: 'impressions', value: sponsorKpis.impressions, delta: sponsorKpis.deltas.impressions },
    { key: 'contentViews', value: sponsorKpis.contentViews, delta: sponsorKpis.deltas.contentViews },
    { key: 'clicks', value: sponsorKpis.clicks, delta: sponsorKpis.deltas.clicks },
    { key: 'athletesReached', value: sponsorKpis.athletesReached, delta: sponsorKpis.deltas.athletesReached },
    { key: 'gamesSponsored', value: sponsorKpis.gamesSponsored, delta: sponsorKpis.deltas.gamesSponsored },
  ];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <StatusBadge variant="demo" className="normal-case tracking-normal" />
        <div className="flex gap-1 rounded-full bg-paper-100 p-0.5">
          {(['d7', 'd30', 'season'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'h-7 rounded-full px-3 text-[12px] font-semibold transition-colors cursor-pointer',
                period === p ? 'bg-ink-950 text-white' : 'text-ink-600 hover:text-ink-950',
              )}
            >
              {t(`sponsorDash.period.${p}`)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[118px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {kpiDefs.map((k) => (
            <KpiDarkCard key={k.key} label={t(`sponsorDash.kpis.${k.key}`)} value={k.value} delta={k.delta} />
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <DashCard title={t('sponsorDash.overview.chartTitle')}>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sponsorWeekly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E9" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#3F4248' }} tickLine={false} axisLine={{ stroke: '#E6E6E9' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#3F4248' }} tickLine={false} axisLine={false} width={48} />
                  <Tooltip contentStyle={{ border: '1px solid #E6E6E9', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="impressions" name={t('sponsorDash.overview.impressions')} stroke="#9CA3AF" strokeWidth={2} dot={false} isAnimationActive animationDuration={1000} />
                  <Line type="monotone" dataKey="reach" name={t('sponsorDash.overview.reach')} stroke="#0A0A0B" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={1000} />
                  <Line type="monotone" dataKey="clicks" name={t('sponsorDash.overview.clicks')} stroke="#F97316" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={1000} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DashCard>

          <CampaignsTable />
        </div>

        <div className="space-y-5">
          <DashCard title={t('sponsorDash.overview.activeProperties')}>
            <ul className="space-y-4">
              {sponsorProperties
                .filter((p) => p.occupiedBy === 'Marca Parceira A')
                .map((p) => {
                  const Icon = propertyIcons[p.id] ?? Star;
                  const pct = Math.min(100, Math.round((sponsorKpis.reach / 200000) * 100) - 10 + p.fromCveMonthly / 1000);
                  return (
                    <li key={p.id}>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-950">
                          <Icon size={15} className="text-brand-500" aria-hidden />
                          {t(`sponsorDash.properties.catalog.${p.id}.name`)}
                        </span>
                        <span className="rounded-full bg-ink-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                          {t('sponsorDash.properties.activeChip')}
                        </span>
                      </div>
                      <PctBar pct={Math.round(pct)} />
                    </li>
                  );
                })}
            </ul>
          </DashCard>

          {/* Public placement preview — Talent of the Week */}
          <DashCard title={t('sponsorDash.overview.previewTitle')}>
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="bg-ink-gradient p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-500">
                  {t('sponsorDash.overview.talentOfWeek')}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <MonogramAvatar name="Erick Semedo" size={48} />
                  <div>
                    <p className="font-display text-[16px] font-extrabold text-white">Erick Semedo</p>
                    <p className="text-[11px] text-white/60">Atlético Achada · {t('sports.basketball')}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 border-t border-line bg-white px-3 py-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-600/70">
                  {t('sponsorDash.overview.poweredBy', { name: 'MARCA PARCEIRA A' })}
                </span>
                <StatusBadge variant="demo" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-ink-600">{t('sponsorDash.overview.previewNote')}</p>
          </DashCard>
        </div>
      </div>
    </>
  );
}

function CampaignsTable() {
  const t = useT();
  return (
    <DashCard title={t('sponsorDash.overview.tableTitle')} pad={false}>
      <DashTable>
        <THead>
          <Th>{t('sponsorDash.campaigns.cols.name')}</Th>
          <Th>{t('sponsorDash.campaigns.cols.period')}</Th>
          <Th className="text-right">{t('sponsorDash.campaigns.cols.reach')}</Th>
          <Th className="text-right">{t('sponsorDash.campaigns.cols.ctr')}</Th>
          <Th>{t('sponsorDash.campaigns.cols.status')}</Th>
        </THead>
        <tbody>
          {sponsorCampaigns.map((c) => (
            <TRow key={c.id}>
              <Td>
                <p className="font-semibold">{t(`sponsorDash.campaigns.items.${c.nameKey}`)}</p>
                <p className="text-[11px] text-ink-600">{t(`sponsorDash.properties.catalog.${c.propertyKey}.name`)}</p>
              </Td>
              <Td className="text-ink-600">{c.period}</Td>
              <Td className="text-right tnum font-semibold">{<Num value={c.reach} />}</Td>
              <Td className="text-right tnum">{c.ctr}%</Td>
              <Td>
                <span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]',
                    c.status === 'active' && 'bg-brand-100 text-brand-600',
                    c.status === 'paused' && 'border border-warning/40 bg-amber-50 text-warning',
                    c.status === 'ended' && 'bg-paper-100 text-ink-600',
                  )}
                >
                  {t(`sponsorDash.campaigns.status.${c.status}`)}
                </span>
              </Td>
            </TRow>
          ))}
        </tbody>
      </DashTable>
    </DashCard>
  );
}

/* ============================ Campanhas =================================== */

function CampaignsSection({ onNew }: { onNew: () => void }) {
  const t = useT();
  const { formatNumber } = useI18n();
  const toast = useToast();
  const [paused, setPaused] = useState<string[]>([]);
  const [confirmPause, setConfirmPause] = useState<SponsorCampaign | null>(null);
  const [reportTarget, setReportTarget] = useState<SponsorCampaign | null>(null);

  const isPaused = (c: SponsorCampaign) => paused.includes(c.id) || c.status === 'paused';

  return (
    <>
      <DashSectionHeader
        title={t('sponsorDash.campaigns.heading')}
        actions={
          <PrimaryButton onClick={onNew}>{t('sponsorDash.campaigns.newCampaign')}</PrimaryButton>
        }
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {sponsorCampaigns.map((c) => {
          const pausedNow = isPaused(c);
          const status = pausedNow ? 'paused' : c.status;
          return (
            <DashCard key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[16px] font-bold text-ink-950">{t(`sponsorDash.campaigns.items.${c.nameKey}`)}</p>
                  <p className="text-[12px] text-ink-600">
                    {t(`sponsorDash.properties.catalog.${c.propertyKey}.name`)} · {c.period}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em]',
                    status === 'active' && 'bg-brand-100 text-brand-600',
                    status === 'paused' && 'border border-warning/40 bg-amber-50 text-warning',
                    status === 'ended' && 'bg-paper-100 text-ink-600',
                  )}
                >
                  {t(`sponsorDash.campaigns.status.${status}`)}
                </span>
              </div>

              <div className="mt-4 h-[72px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={c.spark.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                    <Area type="monotone" dataKey="v" stroke="#F97316" strokeWidth={2} fill="#FFF7F0" isAnimationActive animationDuration={800} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3">
                <div className="mb-1.5 flex justify-between text-[12px]">
                  <span className="text-ink-600">{t('sponsorDash.campaigns.budget')}</span>
                  <span className="tnum font-semibold text-ink-950">
                    esc {formatNumber(c.budgetSpentCve)} / esc {formatNumber(c.budgetTotalCve)}{' '}
                    <span className="font-medium text-ink-600">{t('sponsorDash.campaigns.spent')}</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-paper-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${(c.budgetSpentCve / c.budgetTotalCve) * 100}%` }} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[12px] text-ink-600">
                  CTR <span className="tnum font-bold text-ink-950">{c.ctr}%</span>
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReportTarget(c)}
                    className="inline-flex h-8 items-center rounded-lg px-3 text-[12px] font-semibold text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-950 cursor-pointer"
                  >
                    {t('sponsorDash.campaigns.report')}
                  </button>
                  {status !== 'ended' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (pausedNow) {
                          setPaused((p) => p.filter((id) => id !== c.id));
                          toast(t('sponsorDash.campaigns.resumeToast'));
                        } else {
                          setConfirmPause(c);
                        }
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-950/15 px-3 text-[12px] font-semibold text-ink-950 transition-colors hover:border-ink-950 cursor-pointer"
                    >
                      {pausedNow ? <Play size={12} aria-hidden /> : <Pause size={12} aria-hidden />}
                      {pausedNow ? t('sponsorDash.campaigns.status.active') : t('sponsorDash.campaigns.pauseConfirm')}
                    </button>
                  )}
                </div>
              </div>
            </DashCard>
          );
        })}
      </div>

      {/* Pause confirm */}
      <DashModal open={confirmPause !== null} onClose={() => setConfirmPause(null)} title={t('sponsorDash.campaigns.pauseTitle')}>
        <p className="text-[14px] text-ink-600">{t('sponsorDash.campaigns.pauseBody')}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmPause(null)}
            className="inline-flex h-10 items-center rounded-lg px-4 text-[13px] font-semibold text-ink-600 hover:bg-paper-100 cursor-pointer"
          >
            {t('common.back')}
          </button>
          <PrimaryButton
            onClick={() => {
              if (confirmPause) setPaused((p) => [...p, confirmPause.id]);
              setConfirmPause(null);
              toast(t('sponsorDash.campaigns.pausedToast'));
            }}
          >
            {t('sponsorDash.campaigns.pauseConfirm')}
          </PrimaryButton>
        </div>
      </DashModal>

      {/* Report drawer */}
      <DashDrawer open={reportTarget !== null} onClose={() => setReportTarget(null)} title={t('sponsorDash.campaigns.reportTitle')}>
        {reportTarget && (
          <div className="space-y-4">
            <p className="font-display text-[15px] font-bold text-ink-950">{t(`sponsorDash.campaigns.items.${reportTarget.nameKey}`)}</p>
            <DashTable>
              <THead>
                <Th>{t('sponsorDash.campaigns.cols.period')}</Th>
                <Th className="text-right">{t('sponsorDash.campaigns.cols.reach')}</Th>
                <Th className="text-right">{t('sponsorDash.campaigns.cols.ctr')}</Th>
              </THead>
              <tbody>
                {sponsorWeekly.slice(-6).map((w) => (
                  <TRow key={w.week}>
                    <Td className="tnum text-ink-600">{w.week}</Td>
                    <Td className="text-right tnum">{<Num value={w.reach} />}</Td>
                    <Td className="text-right tnum">{((w.clicks / w.impressions) * 100).toFixed(2)}%</Td>
                  </TRow>
                ))}
              </tbody>
            </DashTable>
            <PrimaryButton className="w-full" onClick={() => toast(t('sponsorDash.campaigns.exportCsv'))}>
              {t('sponsorDash.campaigns.exportCsv')}
            </PrimaryButton>
          </div>
        )}
      </DashDrawer>
    </>
  );
}

/* ============================ Campaign wizard ============================= */

function CampaignWizard({ open, property, onClose }: { open: boolean; property: string; onClose: () => void }) {
  const t = useT();
  const { formatNumber } = useI18n();
  const toast = useToast();
  const [prop, setProp] = useState(property);
  const [budget, setBudget] = useState(15000);
  const [period, setPeriod] = useState('30');

  // keep internal state in sync when opened for a specific property
  if (open && prop !== property && sponsorProperties.some((p) => p.id === property)) {
    setProp(property);
  }

  const available = sponsorProperties.filter((p) => !p.occupiedBy || p.occupiedBy === 'Marca Parceira A');

  return (
    <DashModal open={open} onClose={onClose} title={t('sponsorDash.campaigns.wizard.title')}>
      <div className="space-y-4">
        <Field label={t('sponsorDash.campaigns.wizard.property')}>
          <select className={inputCls} value={prop} onChange={(e) => setProp(e.target.value)}>
            {available.map((p) => (
              <option key={p.id} value={p.id}>
                {t(`sponsorDash.properties.catalog.${p.id}.name`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('sponsorDash.campaigns.wizard.period')}>
          <select className={inputCls} value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="7">{t('sponsorDash.period.d7')}</option>
            <option value="30">{t('sponsorDash.period.d30')}</option>
            <option value="season">{t('sponsorDash.period.season')}</option>
          </select>
        </Field>
        <Field label={`${t('sponsorDash.campaigns.wizard.budget')}: esc ${formatNumber(budget)}`}>
          <input
            type="range"
            min={5000}
            max={60000}
            step={1000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-brand-500"
            aria-label={t('sponsorDash.campaigns.wizard.budget')}
          />
        </Field>

        <div>
          <p className="mb-2 text-[12px] font-semibold text-ink-950">{t('sponsorDash.campaigns.wizard.preview')}</p>
          <div className="flex items-center justify-center gap-2 rounded-lg border border-line bg-paper-50 px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-600/70">
              {t(`sponsorDash.properties.catalog.${prop}.name`)}
            </span>
            <span className="text-[12px] font-semibold text-ink-600">
              {t('sponsorDash.overview.poweredBy', { name: 'MARCA PARCEIRA A' })}
            </span>
            <StatusBadge variant="demo" />
          </div>
        </div>

        <PrimaryButton
          className="w-full"
          onClick={() => {
            onClose();
            toast(t('sponsorDash.campaigns.wizard.successToast'));
          }}
        >
          {t('sponsorDash.campaigns.wizard.confirm')}
        </PrimaryButton>
      </div>
    </DashModal>
  );
}

/* ============================ Propriedades ================================ */

function PropertiesSection({ onActivate }: { onActivate: (propertyId: string) => void }) {
  const t = useT();
  const { formatNumber } = useI18n();
  return (
    <>
      <DashSectionHeader title={t('sponsorDash.properties.heading')} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sponsorProperties.map((p) => {
          const Icon = propertyIcons[p.id] ?? Star;
          const mine = p.occupiedBy === 'Marca Parceira A';
          const occupied = p.occupiedBy !== null;
          return (
            <DashCard key={p.id} className="transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-950 text-brand-500">
                  <Icon size={18} strokeWidth={1.75} aria-hidden />
                </span>
                {mine ? (
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-brand-600">
                    {t('sponsorDash.properties.activeChip')}
                  </span>
                ) : occupied ? (
                  <span className="rounded-full bg-paper-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-600">
                    {t('sponsorDash.properties.occupied', { name: p.occupiedBy ?? '' })}
                  </span>
                ) : (
                  <span className="rounded-full border border-dashed border-line px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-600">
                    {t('sponsorDash.properties.available')}
                  </span>
                )}
              </div>
              <p className="mt-3 font-display text-[16px] font-bold text-ink-950">{t(`sponsorDash.properties.catalog.${p.id}.name`)}</p>
              <p className="mt-1 min-h-[36px] text-[12px] text-ink-600">{t(`sponsorDash.properties.catalog.${p.id}.desc`)}</p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[12px] text-ink-600 tnum">
                  {t('sponsorDash.properties.from', { price: formatNumber(p.fromCveMonthly) })}
                </span>
                {!occupied && (
                  <button
                    type="button"
                    onClick={() => onActivate(p.id)}
                    className="inline-flex h-8 items-center rounded-lg bg-brand-500 px-3.5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-600 active:scale-[0.97] cursor-pointer"
                  >
                    {t('sponsorDash.properties.activate')}
                  </button>
                )}
              </div>
            </DashCard>
          );
        })}
      </div>
    </>
  );
}

/* ============================ Audiência =================================== */

function AudienceSection() {
  const t = useT();
  const deviceColors = ['#0A0A0B', '#F97316', '#9CA3AF'];
  return (
    <>
      <DashSectionHeader title={t('sponsorDash.audience.heading')} />
      <div className="grid gap-5 lg:grid-cols-2">
        <DashCard title={t('sponsorDash.audience.byIsland')}>
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

        <DashCard title={t('sponsorDash.audience.byAge')}>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sponsorAudience.ages} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#3F4248' }} tickLine={false} axisLine={{ stroke: '#E6E6E9' }} />
                <YAxis tick={{ fontSize: 11, fill: '#3F4248' }} tickLine={false} axisLine={false} unit="%" width={40} />
                <Tooltip contentStyle={{ border: '1px solid #E6E6E9', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`]} />
                <Bar dataKey="pct" fill="#F97316" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashCard>

        <DashCard title={t('sponsorDash.audience.byGroup')}>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sponsorAudience.ageGroups} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E9" vertical={false} />
                <XAxis dataKey="group" tick={{ fontSize: 12, fill: '#3F4248' }} tickLine={false} axisLine={{ stroke: '#E6E6E9' }} />
                <YAxis tick={{ fontSize: 11, fill: '#3F4248' }} tickLine={false} axisLine={false} unit="%" width={40} />
                <Tooltip contentStyle={{ border: '1px solid #E6E6E9', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="male" name={t('sponsorDash.audience.male')} stackId="a" fill="#0A0A0B" isAnimationActive animationDuration={600} />
                <Bar dataKey="female" name={t('sponsorDash.audience.female')} stackId="a" fill="#F97316" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashCard>

        <DashCard title={t('sponsorDash.audience.byDevice')}>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sponsorAudience.devices.map((d) => ({ ...d, label: t(`sponsorDash.audience.devices.${d.name}`) }))}
                  dataKey="pct"
                  nameKey="label"
                  innerRadius={56}
                  outerRadius={86}
                  paddingAngle={2}
                  isAnimationActive
                  animationDuration={800}
                >
                  {sponsorAudience.devices.map((d, i) => (
                    <Cell key={d.name} fill={deviceColors[i % deviceColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ border: '1px solid #E6E6E9', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashCard>
      </div>
    </>
  );
}

/* ============================ Conteúdo / Relatórios / Faturação =========== */

function ContentSection() {
  const t = useT();
  return (
    <>
      <DashSectionHeader title={t('sponsorDash.content.heading')} />
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('sponsorDash.content.heading')}</Th>
            <Th className="text-right">{t('sponsorDash.content.views')}</Th>
            <Th className="text-right">{t('sponsorDash.content.clicks')}</Th>
          </THead>
          <tbody>
            {sponsorContent.map((c) => (
              <TRow key={c.id}>
                <Td className="font-semibold">{t(`sponsorDash.content.items.${c.key}`)}</Td>
                <Td className="text-right tnum">{<Num value={c.views} />}</Td>
                <Td className="text-right tnum font-semibold">{<Num value={c.clicks} />}</Td>
              </TRow>
            ))}
          </tbody>
        </DashTable>
      </DashCard>
    </>
  );
}

function ReportsSection() {
  const t = useT();
  const toast = useToast();
  return (
    <>
      <DashSectionHeader title={t('sponsorDash.reports.heading')} />
      <div className="grid gap-4 sm:grid-cols-3">
        {sponsorReports.map((r) => (
          <DashCard key={r.id}>
            <p className="font-display text-[16px] font-bold text-ink-950 tnum">{r.month}</p>
            <p className="text-[11px] text-ink-600">{t('sponsorDash.reports.auto')}</p>
            <dl className="mt-3 space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-ink-600">{t('sponsorDash.reports.reach')}</dt>
                <dd className="tnum font-semibold text-ink-950">{<Num value={r.reach} />}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-600">{t('sponsorDash.reports.impressions')}</dt>
                <dd className="tnum font-semibold text-ink-950">{<Num value={r.impressions} />}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => toast(t('sponsorDash.reports.pdf'))}
              className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg border border-ink-950/15 text-[13px] font-semibold text-ink-950 transition-colors hover:border-ink-950 cursor-pointer"
            >
              {t('sponsorDash.reports.pdf')}
            </button>
          </DashCard>
        ))}
      </div>
    </>
  );
}

function BillingSection() {
  const t = useT();
  return (
    <>
      <DashSectionHeader title={t('sponsorDash.billing.heading')} />
      <DashCard pad={false}>
        <DashTable>
          <THead>
            <Th>{t('sponsorDash.billing.cols.id')}</Th>
            <Th>{t('sponsorDash.billing.cols.month')}</Th>
            <Th className="text-right">{t('sponsorDash.billing.cols.amount')}</Th>
            <Th>{t('sponsorDash.billing.cols.status')}</Th>
          </THead>
          <tbody>
            {sponsorInvoices.map((inv) => (
              <TRow key={inv.id}>
                <Td className="tnum font-semibold">{inv.id}</Td>
                <Td className="text-ink-600">{inv.month}</Td>
                <Td className="text-right">
                  <CveValue cve={inv.cve} className="font-semibold" />
                </Td>
                <Td>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]',
                      inv.status === 'paid' ? 'bg-ink-950 text-white' : 'border border-warning/40 bg-amber-50 text-warning',
                    )}
                  >
                    {t(`sponsorDash.billing.${inv.status}`)}
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
