/**
 * Pricing (/pricing) — design: pricing.md.
 * Athlete Free/Premium cards + comparison, Profile Boost with mandatory
 * integrity banner, Club plans with usage meters, competition price calculator
 * (transparent formula, CVE + ≈€ helper), Marketplace COMING LATER, FAQ.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion';
import { BadgeCheck, Check, Minus, ShieldCheck, ShoppingBag, X, Zap } from 'lucide-react';
import { useT } from '@/i18n';
import { cveToEur } from '@/data';
import { calculateCompetitionPrice, clubPlanUsage, type CalculatorInput } from '@/data/extra-scouting';
import SectionHeading from '@/components/shared/SectionHeading';
import StatusBadge from '@/components/shared/StatusBadge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fmtCve = (n: number) => `esc ${new Intl.NumberFormat('pt-PT').format(Math.round(n))}`;

/* --------------------------------- pieces --------------------------------- */

function UsageMeter({ label, used, max, unit }: { label: string; used: number; max: number; unit?: string }) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="font-semibold text-ink-600">{label}</span>
        <span className="tnum text-ink-950">
          {used}/{max}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-paper-100">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className={cn('h-full rounded-full', pct > 85 ? 'bg-danger' : 'bg-brand-500')}
        />
      </div>
    </div>
  );
}

function PlanFeature({ children, included = true }: { children: React.ReactNode; included?: boolean }) {
  return (
    <li className="flex items-start gap-2 text-[13px]">
      {included ? (
        <Check size={15} className="mt-0.5 shrink-0 text-success" aria-hidden />
      ) : (
        <X size={15} className="mt-0.5 shrink-0 text-ink-600/40" aria-hidden />
      )}
      <span className={included ? '' : 'text-ink-600/60'}>{children}</span>
    </li>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function Pricing() {
  const t = useT();
  const [annual, setAnnual] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [boostOn, setBoostOn] = useState(false);

  const premiumMonthly = 890;
  const premiumAnnual = 8900;
  const premiumPrice = annual ? premiumAnnual : premiumMonthly;

  const [calc, setCalc] = useState<CalculatorInput>({
    teams: 10,
    players: 120,
    games: 45,
    scoutingRequired: true,
    scouts: 2,
    storageGb: 100,
    matchScouting: true,
    advancedStats: true,
    videoModule: true,
    customPage: false,
    duration: 'season',
  });

  const breakdown = useMemo(() => calculateCompetitionPrice(calc), [calc]);
  const spring = useSpring(breakdown.total, { stiffness: 160, damping: 26 });
  useEffect(() => {
    spring.set(breakdown.total);
  }, [spring, breakdown.total]);
  const displayTotal = useTransform(spring, (v) => fmtCve(v));

  const clubPlans = [
    {
      id: 'base' as const,
      price: 4900,
      highlighted: false,
      limits: ['athletes', 'games', 'scouts', 'reports', 'storage'] as const,
      limitValues: [20, 8, 1, 20, 50],
    },
    {
      id: 'pro' as const,
      price: 9900,
      highlighted: true,
      limits: ['athletes', 'games', 'scouts', 'reports', 'storage'] as const,
      limitValues: [50, 20, 3, 100, 500],
    },
    {
      id: 'elite' as const,
      price: 19900,
      highlighted: false,
      limits: ['scouts'] as const,
      limitValues: [10],
    },
  ];

  const sliderRow = (
    key: 'teams' | 'players' | 'games' | 'storageGb',
    min: number,
    max: number,
    unit?: string,
  ) => (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13px]">
        <label htmlFor={`calc-${key}`} className="font-semibold text-white/80">
          {t(`pricingPage.calc.${key === 'storageGb' ? 'storage' : key}`)}
        </label>
        <span className="tnum rounded-md bg-ink-800 px-2 py-0.5 font-display text-[13px] font-extrabold text-brand-500">
          {calc[key]}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <input
        id={`calc-${key}`}
        type="range"
        min={min}
        max={max}
        value={calc[key]}
        onChange={(e) => setCalc((c) => ({ ...c, [key]: Number(e.target.value) }))}
        className="h-9 w-full accent-brand-500"
      />
    </div>
  );

  const breakdownRows: [string, number][] = [
    [t('pricingPage.calc.bBase'), breakdown.base],
    [t('pricingPage.calc.bTeams'), breakdown.teams],
    [t('pricingPage.calc.bPlayers'), breakdown.players],
    [t('pricingPage.calc.bGames'), breakdown.games],
    [t('pricingPage.calc.bScouts'), breakdown.scouts],
    [t('pricingPage.calc.bStorage'), breakdown.storage],
    [t('pricingPage.calc.bExtras'), Math.round(breakdown.extras)],
  ];

  return (
    <div className="bg-paper">
      {/* Section 1 — header */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="mb-3 flex items-center justify-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-600">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
          {t('pricingPage.eyebrow')}
        </p>
        <h1 className="font-display text-[32px] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink-950 lg:text-[44px]">
          {t('pricingPage.title')}
        </h1>
        <p className="mt-3 text-[17px] text-ink-600">{t('pricingPage.sub')}</p>
        <div className="mt-6 inline-flex rounded-full bg-paper-100 p-0.5" role="group" aria-label="billing">
          {([false, true] as const).map((isAnnual) => (
            <button
              key={String(isAnnual)}
              type="button"
              onClick={() => setAnnual(isAnnual)}
              className={cn(
                'relative h-9 rounded-full px-4 text-[13px] font-semibold transition-colors',
                annual === isAnnual ? 'text-white' : 'text-ink-600',
              )}
            >
              {annual === isAnnual && (
                <motion.span layoutId="billing-pill" className="absolute inset-0 rounded-full bg-ink-950" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
              )}
              <span className="relative">
                {isAnnual ? `${t('pricingPage.annual')} ${t('pricingPage.annualOff')}` : t('pricingPage.monthly')}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Section 2 — athlete plans */}
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* FREE */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="rounded-xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(10,10,11,.05)]"
          >
            <h2 className="font-display text-[18px] font-extrabold text-ink-950">
              {t('pricingPage.athletePlans')} · FREE
            </h2>
            <p className="mt-3 font-display text-[32px] font-extrabold text-ink-950">{t('pricingPage.freePrice')}</p>
            <ul className="mt-4 space-y-2">
              {(['f1', 'f2', 'f3', 'f4', 'f5'] as const).map((k) => (
                <PlanFeature key={k}>{t(`pricingPage.free.${k}`)}</PlanFeature>
              ))}
            </ul>
            <Link
              to="/auth?mode=signup"
              className="mt-6 flex h-11 items-center justify-center rounded-lg border border-ink-950/15 text-[14px] font-semibold text-ink-950 transition-colors hover:border-ink-950"
            >
              {t('pricingPage.freeCta')}
            </Link>
          </motion.div>

          {/* PREMIUM */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
            className="relative overflow-hidden rounded-xl bg-ink-950 p-6 text-white"
          >
            <span className="absolute right-4 top-4 rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white">
              {t('pricingPage.recommended')}
            </span>
            <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-brand-500/50 animate-glow-breathe" aria-hidden />
            <h2 className="font-display text-[18px] font-extrabold">PREMIUM</h2>
            <p className="mt-3">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={premiumPrice}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="tnum font-display text-[32px] font-extrabold text-brand-500"
                >
                  {fmtCve(premiumPrice)}
                </motion.span>
              </AnimatePresence>
              <span className="text-[13px] text-white/50">{annual ? t('pricingPage.perYear') : t('pricingPage.perMonth')}</span>
              <span className="ml-2 text-[12px] text-white/40">
                ({t('pricingPage.eurHint', { eur: cveToEur(premiumPrice) })})
              </span>
            </p>
            <ul className="mt-4 space-y-2 text-white/85">
              {(['f1', 'f2', 'f3', 'f4', 'f5', 'f6'] as const).map((k) => (
                <PlanFeature key={k}>{t(`pricingPage.premium.${k}`)}</PlanFeature>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setCheckoutDone(false);
                setCheckoutOpen(true);
              }}
              className="mt-6 h-11 w-full rounded-lg bg-brand-500 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600"
            >
              {t('pricingPage.premiumCta')}
            </button>
          </motion.div>
        </div>

        {/* comparison table */}
        <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[480px] text-[13px]">
            <caption className="px-5 pt-4 text-left font-display text-[15px] font-extrabold text-ink-950">
              {t('pricingPage.compare.title')}
            </caption>
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
                <th className="px-5 py-3 text-left font-bold">{t('pricingPage.compare.feature')}</th>
                <th className="px-5 py-3 text-center">FREE</th>
                <th className="px-5 py-3 text-center text-brand-600">PREMIUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                [t('pricingPage.compare.r1'), true, true] as const,
                [t('pricingPage.compare.r2'), true, true] as const,
                [t('pricingPage.compare.r3'), t('pricingPage.compare.r3Free'), t('pricingPage.compare.r3Premium')] as const,
                [t('pricingPage.compare.r4'), false, true] as const,
                [t('pricingPage.compare.r5'), false, true] as const,
                [t('pricingPage.compare.r6'), false, true] as const,
              ].map(([label, free, premium], i) => (
                <tr key={i} className="hover:bg-paper-50">
                  <td className="px-5 py-3 text-ink-950">{label}</td>
                  {[free, premium].map((v, j) => (
                    <td key={j} className="px-5 py-3 text-center">
                      {typeof v === 'string' ? (
                        <span className="font-semibold">{v}</span>
                      ) : v ? (
                        <Check size={16} className="mx-auto text-success" aria-hidden />
                      ) : (
                        <Minus size={16} className="mx-auto text-ink-600/30" aria-hidden />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Boost block — mandatory integrity banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-8 rounded-xl border border-brand-500/30 bg-brand-50 p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="flex items-center gap-2 font-display text-[16px] font-extrabold text-ink-950">
                <Zap size={18} className="text-brand-500" aria-hidden />
                {t('pricingPage.boost.title')} — <span className="tnum">{t('pricingPage.boost.price')}</span>
              </h3>
              <p className="mt-3 text-[14px] font-bold text-ink-950">{t('pricingPage.boost.integrity')}</p>
              <p className="mt-1 text-[13px] text-ink-600">{t('pricingPage.boost.body')}</p>
              <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-warning">
                <ShieldCheck size={14} aria-hidden />
                {t('pricingPage.boost.eligibility')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBoostOn(true)}
              disabled={boostOn}
              className="h-11 shrink-0 rounded-lg border border-ink-950/15 bg-white px-5 text-[14px] font-semibold text-ink-950 transition-colors hover:border-ink-950 disabled:opacity-60"
            >
              {boostOn ? '✓' : t('pricingPage.boost.cta')}
            </button>
          </div>
          {boostOn && (
            <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-success">
              <BadgeCheck size={15} aria-hidden />
              {t('pricingPage.boost.activated')}
            </p>
          )}
        </motion.div>
      </section>

      {/* Section 3 — club plans */}
      <section className="bg-paper-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={t('nav.clubs')} title={t('pricingPage.club.title')} sub={t('pricingPage.club.sub')} />
          <div className="grid gap-5 lg:grid-cols-3">
            {clubPlans.map((plan, i) => {
              const usage = clubPlanUsage[plan.id];
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                  className={cn(
                    'rounded-xl border p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]',
                    plan.highlighted ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-[17px] font-extrabold">{t(`pricingPage.club.plans.${plan.id}`)}</h3>
                    {plan.highlighted && <StatusBadge variant="demo" />}
                  </div>
                  <p className="mt-3">
                    <span className={cn('tnum font-display text-[30px] font-extrabold', plan.highlighted ? 'text-brand-500' : 'text-ink-950')}>
                      {fmtCve(plan.price)}
                    </span>
                    <span className={cn('text-[13px]', plan.highlighted ? 'text-white/50' : 'text-ink-600')}>
                      {t('pricingPage.perMonth')} · {t('pricingPage.eurHint', { eur: cveToEur(plan.price) })}
                    </span>
                  </p>
                  <ul className={cn('mt-4 space-y-2', plan.highlighted && 'text-white/85')}>
                    {plan.id === 'elite' ? (
                      <>
                        <PlanFeature>{t('pricingPage.club.limits.unlimited')}</PlanFeature>
                        <PlanFeature>{t('pricingPage.club.limits.scouts', { n: 10 })}</PlanFeature>
                        <PlanFeature>2 TB</PlanFeature>
                        <PlanFeature>{t('pricingPage.club.limits.api')}</PlanFeature>
                      </>
                    ) : (
                      plan.limits.map((k, j) => (
                        <PlanFeature key={k}>{t(`pricingPage.club.limits.${k}`, { n: plan.limitValues[j] })}</PlanFeature>
                      ))
                    )}
                  </ul>
                  {/* usage meters (demo example) */}
                  <div className={cn('mt-5 rounded-lg p-3', plan.highlighted ? 'bg-ink-800' : 'bg-paper-50')}>
                    <p className={cn('mb-2 text-[10px] font-bold uppercase tracking-[0.08em]', plan.highlighted ? 'text-white/45' : 'text-ink-600')}>
                      {t('pricingPage.club.usageTitle')}
                    </p>
                    <div className="space-y-2.5">
                      <UsageMeter label={t('pricingPage.club.usage.athletes')} used={usage.athletes[0]} max={usage.athletes[1]} />
                      <UsageMeter label={t('pricingPage.club.usage.games')} used={usage.games[0]} max={usage.games[1]} />
                      <UsageMeter label={t('pricingPage.club.usage.reports')} used={usage.reports[0]} max={usage.reports[1]} />
                      <UsageMeter label={t('pricingPage.club.usage.storage')} used={usage.storageGb[0]} max={usage.storageGb[1]} unit="GB" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutDone(false);
                      setCheckoutOpen(true);
                    }}
                    className={cn(
                      'mt-5 h-11 w-full rounded-lg text-[14px] font-semibold transition-colors',
                      plan.highlighted
                        ? 'bg-brand-500 text-white hover:bg-brand-600'
                        : 'border border-ink-950/15 text-ink-950 hover:border-ink-950',
                    )}
                  >
                    {plan.id === 'pro' ? t('pricingPage.club.current') : t('pricingPage.club.cta')}
                  </button>
                </motion.div>
              );
            })}
          </div>
          <p className="mt-6 text-center text-[12px] text-ink-600">{t('pricingPage.club.footnote')}</p>
        </div>
      </section>

      {/* Section 4 — competition price calculator */}
      <section className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8" id="calculator">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="rounded-2xl bg-ink-950 p-6 text-white sm:p-10"
        >
          <SectionHeading dark eyebrow={t('nav.competitions')} title={t('pricingPage.calc.title')} sub={t('pricingPage.calc.sub')} />
          <div className="grid gap-10 lg:grid-cols-2">
            {/* form */}
            <div className="space-y-5">
              {sliderRow('teams', 2, 32)}
              {sliderRow('players', 20, 500)}
              {sliderRow('games', 4, 200)}
              <div>
                <div className="mb-1 flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-white/80">{t('pricingPage.calc.scouting')}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={calc.scoutingRequired}
                    onClick={() => setCalc((c) => ({ ...c, scoutingRequired: !c.scoutingRequired }))}
                    className={cn('relative h-6 w-11 rounded-full transition-colors', calc.scoutingRequired ? 'bg-brand-500' : 'bg-ink-700')}
                  >
                    <span className={cn('absolute top-0.5 rounded-full bg-white transition-all', calc.scoutingRequired ? 'left-[22px]' : 'left-0.5')} style={{ height: 18, width: 18 }} />
                  </button>
                </div>
                {calc.scoutingRequired && (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[12px] text-white/50">{t('pricingPage.calc.scouts')}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label="−" onClick={() => setCalc((c) => ({ ...c, scouts: Math.max(0, c.scouts - 1) }))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 text-white/70">
                        <Minus size={14} aria-hidden />
                      </button>
                      <span className="tnum w-8 text-center font-display text-[16px] font-extrabold text-brand-500">{calc.scouts}</span>
                      <button type="button" aria-label="+" onClick={() => setCalc((c) => ({ ...c, scouts: Math.min(10, c.scouts + 1) }))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 text-white/70">
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {sliderRow('storageGb', 0, 1000, t('pricingPage.calc.gb'))}
              <div>
                <p className="mb-2 text-[13px] font-semibold text-white/80">{t('pricingPage.calc.features')}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(
                    [
                      ['matchScouting', 'fMs'],
                      ['advancedStats', 'fStats'],
                      ['videoModule', 'fVideo'],
                      ['customPage', 'fPage'],
                    ] as const
                  ).map(([key, labelKey]) => (
                    <label key={key} className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-ink-700 px-3 text-[13px] text-white/80">
                      <input
                        type="checkbox"
                        checked={calc[key]}
                        onChange={(e) => setCalc((c) => ({ ...c, [key]: e.target.checked }))}
                        className="h-4 w-4 accent-brand-500"
                      />
                      {t(`pricingPage.calc.${labelKey}`)}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="calc-duration" className="mb-2 block text-[13px] font-semibold text-white/80">
                  {t('pricingPage.calc.duration')}
                </label>
                <select
                  id="calc-duration"
                  value={calc.duration}
                  onChange={(e) => setCalc((c) => ({ ...c, duration: e.target.value as CalculatorInput['duration'] }))}
                  className="h-11 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="tournament">{t('pricingPage.calc.tournament')}</option>
                  <option value="season">{t('pricingPage.calc.season')}</option>
                </select>
              </div>
              <p className="text-[11px] leading-relaxed text-white/40">{t('pricingPage.calc.formula')}</p>
            </div>

            {/* estimate */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-ink-700 bg-ink-900 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">{t('pricingPage.calc.estimate')}</p>
                <motion.p className="tnum mt-2 font-display text-[40px] font-extrabold leading-none text-brand-500">
                  {displayTotal}
                </motion.p>
                <p className="mt-1 text-[13px] text-white/50">{t('pricingPage.eurHint', { eur: cveToEur(breakdown.total) })}</p>
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="breakdown" className="border-ink-700">
                    <AccordionTrigger className="text-[13px] font-semibold text-white/80 hover:no-underline">
                      {t('pricingPage.calc.breakdown')}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1.5">
                        {breakdownRows.map(([label, value]) => (
                          <li key={label} className="tnum flex items-center justify-between rounded px-2 py-1 text-[12px] text-white/70 odd:bg-brand-50/5">
                            <span>{label}</span>
                            <span className="font-semibold text-white">{fmtCve(value)}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Link
                  to="/auth?mode=signup"
                  className="mt-5 flex h-12 items-center justify-center rounded-lg bg-brand-500 text-[14px] font-bold text-white transition-colors hover:bg-brand-600"
                >
                  {t('pricingPage.calc.cta')}
                </Link>
                <p className="mt-3 text-center text-[11px] text-white/40">{t('pricingPage.calc.disclaimer')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 5 — marketplace teaser + FAQ */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-dashed border-line bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 font-display text-[18px] font-extrabold text-ink-950">
              <ShoppingBag size={18} className="text-ink-600" aria-hidden />
              {t('pricingPage.market.title')}
            </h2>
            <StatusBadge variant="comingLater" />
          </div>
          <p className="mt-2 text-[13px] text-ink-600">{t('pricingPage.market.body')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['c1', 'c2', 'c3', 'c4'] as const).map((k) => (
              <span key={k} className="rounded-full border border-dashed border-line px-3.5 py-1.5 text-[12px] font-semibold text-ink-600">
                {t(`pricingPage.market.${k}`)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <SectionHeading title={t('pricingPage.faq.title')} />
          <Accordion type="single" collapsible>
            {[1, 2, 3, 4, 5].map((n) => (
              <AccordionItem key={n} value={`faq-${n}`}>
                <AccordionTrigger className="text-left text-[14px] font-semibold text-ink-950">
                  {t(`pricingPage.faq.q${n}`)}
                </AccordionTrigger>
                <AccordionContent className="text-[13px] text-ink-600">{t(`pricingPage.faq.a${n}`)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* simulated checkout modal */}
      <AnimatePresence>
        {checkoutOpen && (
          <>
            <motion.div
              key="co-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-ink-950/60 backdrop-blur-sm"
              onClick={() => setCheckoutOpen(false)}
            />
            <motion.div
              key="co-modal"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-label={t('pricingPage.checkout.title')}
              className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6"
            >
              {checkoutDone ? (
                <div className="text-center">
                  <motion.svg className="mx-auto" width="56" height="56" viewBox="0 0 72 72" fill="none" aria-hidden>
                    <motion.circle cx="36" cy="36" r="33" stroke="#F97316" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                    <motion.path d="M22 37 L32 47 L51 27" stroke="#F97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />
                  </motion.svg>
                  <p className="mt-4 font-display text-[18px] font-extrabold text-ink-950">{t('pricingPage.checkout.success')}</p>
                  <button type="button" onClick={() => setCheckoutOpen(false)} className="mt-5 h-11 w-full rounded-lg bg-ink-950 text-[14px] font-semibold text-white">
                    {t('common.close')}
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-[18px] font-extrabold text-ink-950">{t('pricingPage.checkout.title')}</h2>
                  <p className="mt-2 text-[13px] text-ink-600">{t('pricingPage.checkout.body')}</p>
                  <button
                    type="button"
                    onClick={() => setCheckoutDone(true)}
                    className="mt-5 h-11 w-full rounded-lg bg-brand-500 text-[14px] font-semibold text-white hover:bg-brand-600"
                  >
                    {t('pricingPage.checkout.confirm')}
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
