/**
 * Opportunities (/opportunities) — global opportunities board + club search
 * builder demo. Design spec: /mnt/agents/output/design/opportunities.md
 * All opportunities/organizations are fictional demo content.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  Check,
  FileText,
  GraduationCap,
  Plane,
  ShieldCheck,
  Trophy,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useT } from '@/i18n';
import { athletes } from '@/data';
import type { Opportunity, Sport } from '@/data/types';
import {
  allOpportunities,
  allVideos,
  daysUntil,
  demoAge,
  opportunityExtras,
} from '@/data/extra-profiles';
import type { OpportunityExtras } from '@/data/extra-profiles';
import AthleteCard from '@/components/shared/AthleteCard';
import EmptyState from '@/components/shared/EmptyState';
import SectionHeading from '@/components/shared/SectionHeading';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useDemoToast } from '@/components/profiles/DemoToast';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const TYPE_ICONS: Record<OpportunityExtras['icon'], LucideIcon> = {
  trial: Trophy,
  scholarship: GraduationCap,
  international: Plane,
  academy: Building2,
  contract: FileText,
};

const PUBLISHER_KEYS: Record<OpportunityExtras['publisherKey'], string> = {
  intlClub: 'publisherIntlClub',
  program: 'publisherProgram',
  federation: 'publisherFederation',
  club: 'publisherClub',
};

/** Demo applicant profile used for the honest eligibility checklist (OVR 74). */
const DEMO_APPLICANT = { ovr: 74, verified: true, hasVideos: true, guardianOk: true };

/* ------------------------------------------------------------------ */
/* Opportunity card + apply modal                                      */
/* ------------------------------------------------------------------ */

function OpportunityCard({
  opportunity,
  onApply,
}: {
  opportunity: Opportunity;
  onApply: (op: Opportunity) => void;
}) {
  const t = useT();
  const [saved, setSaved] = useState(false);
  const extras = opportunityExtras[opportunity.id];
  const days = daysUntil(opportunity.deadline);
  const Icon = TYPE_ICONS[extras?.icon ?? 'trial'];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease }}
      className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]"
    >
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink-950 text-brand-500">
          <Icon size={22} strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold leading-snug text-ink-950">{opportunity.title}</h3>
          <p className="mt-0.5 text-[12px] font-medium text-ink-600">
            {t(`opportunitiesPage.card.${PUBLISHER_KEYS[extras?.publisherKey ?? 'club']}`)}{' '}
            <Check size={11} className="mb-0.5 inline text-success" aria-hidden />
            {extras?.publisherKey === 'intlClub' && ` · ${t('opportunitiesPage.card.identityNote')}`}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(extras?.reqChips ?? []).map((chip) => (
              <span key={chip} className="rounded-full bg-paper-100 px-2.5 py-0.5 text-[11px] font-semibold text-ink-600 tnum">
                {chip}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-medium text-ink-600/70">
            {t('opportunitiesPage.card.compatible', { count: extras?.compatible ?? 0 })}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-bold tnum',
              days === 0
                ? 'bg-paper-100 text-ink-600'
                : days < 3
                  ? 'animate-pulse bg-red-50 text-danger'
                  : days < 7
                    ? 'bg-amber-50 text-warning'
                    : 'bg-paper-100 text-ink-600',
            )}
          >
            {days === 0
              ? t('opportunitiesPage.card.closed')
              : days === 1
                ? t('opportunitiesPage.card.lastDay')
                : t('opportunitiesPage.card.daysLeft', { days })}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSaved((s) => !s)}
              aria-label={t('opportunitiesPage.card.save')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-600 transition-colors hover:border-ink-950 cursor-pointer"
            >
              {saved ? <BookmarkCheck size={16} className="text-brand-500" aria-hidden /> : <Bookmark size={16} aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => onApply(opportunity)}
              className="inline-flex h-10 items-center rounded-lg bg-brand-500 px-4 text-[13px] font-semibold text-white transition-all hover:bg-brand-600 active:scale-[0.97] cursor-pointer"
            >
              {t('opportunitiesPage.card.apply')}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ApplyModal({
  opportunity,
  onClose,
  onSubmit,
}: {
  opportunity: Opportunity | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const t = useT();
  const extras = opportunity ? opportunityExtras[opportunity.id] : undefined;

  const checks = opportunity && extras
    ? [
        { label: t('opportunitiesPage.apply.reqVerified'), met: DEMO_APPLICANT.verified },
        ...(extras.needsVideos ? [{ label: t('opportunitiesPage.apply.reqVideos'), met: DEMO_APPLICANT.hasVideos }] : []),
        ...(extras.minOvr > 0
          ? [{ label: t('opportunitiesPage.apply.reqOvr', { min: extras.minOvr }), met: DEMO_APPLICANT.ovr >= extras.minOvr }]
          : []),
        ...(extras.needsGuardian ? [{ label: t('opportunitiesPage.apply.reqGuardian'), met: DEMO_APPLICANT.guardianOk }] : []),
      ]
    : [];
  const eligible = checks.every((c) => c.met);

  return (
    <Dialog open={opportunity != null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{t('opportunitiesPage.apply.title')}</DialogTitle>
          <DialogDescription>{opportunity?.title}</DialogDescription>
        </DialogHeader>
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-600">
          {t('opportunitiesPage.apply.eligibility')}
        </p>
        <ul className="mt-2 space-y-2">
          {checks.map((c, i) => (
            <motion.li
              key={c.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.12, ease }}
              className="flex items-center gap-2.5 text-[13px] font-medium text-ink-950"
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full',
                  c.met ? 'bg-success text-white' : 'bg-danger text-white',
                )}
              >
                {c.met ? <Check size={12} aria-hidden /> : <X size={12} aria-hidden />}
              </span>
              {c.label}
              <span className={cn('ml-auto text-[11px] font-bold uppercase', c.met ? 'text-success' : 'text-danger')}>
                {c.met ? t('opportunitiesPage.apply.met') : t('opportunitiesPage.apply.notMet')}
              </span>
            </motion.li>
          ))}
        </ul>
        {eligible ? (
          <button
            type="button"
            onClick={onSubmit}
            className="mt-2 h-11 w-full rounded-lg bg-brand-500 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600 cursor-pointer"
          >
            {t('opportunitiesPage.apply.submit')}
          </button>
        ) : (
          <div className="mt-2 rounded-lg border border-warning/40 bg-amber-50 p-3.5">
            <Link to="/pricing" onClick={onClose} className="text-[13px] font-semibold text-warning underline underline-offset-2">
              {t('opportunitiesPage.apply.improve')} →
            </Link>
            <p className="mt-1.5 text-[12px] text-ink-600">{t('opportunitiesPage.apply.improveNote')}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Search builder (club view demo)                                     */
/* ------------------------------------------------------------------ */

interface BuilderState {
  sport: Sport;
  age: [number, number];
  position: string; // 'any' or position string
  country: 'cv' | 'diaspora';
  level: 'development' | 'competitive' | 'elite';
  heightMin: number;
  ovrMin: number;
  potMin: number;
  hasVideos: boolean;
  verifiedOnly: boolean;
  available: boolean;
}

function SearchBuilder() {
  const t = useT();
  const [state, setState] = useState<BuilderState>({
    sport: 'basketball',
    age: [17, 21],
    position: 'any',
    country: 'cv',
    level: 'competitive',
    heightMin: 150,
    ovrMin: 0,
    potMin: 0,
    hasVideos: false,
    verifiedOnly: false,
    available: false,
  });

  const positions = useMemo(
    () => Array.from(new Set(athletes.filter((a) => a.sport === state.sport).map((a) => a.position))),
    [state.sport],
  );

  const results = useMemo(
    () =>
      athletes.filter((a) => {
        if (state.country !== 'cv') return false; // demo pool is Cape Verde only
        if (a.sport !== state.sport) return false;
        const age = demoAge(a);
        if (age < state.age[0] || age > state.age[1]) return false;
        if (state.position !== 'any' && a.position !== state.position) return false;
        if ((a.heightCm ?? 0) < state.heightMin) return false;
        if (a.ovr.value < state.ovrMin) return false;
        if (a.pot < state.potMin) return false;
        if (state.level === 'elite' && a.ovr.value < 74) return false;
        if (state.level === 'competitive' && a.ovr.value < 60) return false;
        if (state.hasVideos && !allVideos.some((v) => v.athleteId === a.id)) return false;
        if (state.verifiedOnly && a.verification !== 'verified') return false;
        if (state.available && a.clubId == null) return false;
        return true;
      }),
    [state],
  );

  const set = <K extends keyof BuilderState>(key: K, value: BuilderState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const selectCls = 'h-10 w-full rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink-950';
  const labelCls = 'block text-[12px] font-semibold text-ink-950';

  return (
    <section id="search-builder" className="bg-paper-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('opportunitiesPage.builder.title')}
          sub={t('opportunitiesPage.builder.sub')}
        />
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
            <div className="grid grid-cols-2 gap-4">
              <label className={labelCls}>
                {t('opportunitiesPage.builder.sport')}
                <select
                  className={cn(selectCls, 'mt-1.5')}
                  value={state.sport}
                  onChange={(e) => set('sport', e.target.value as Sport)}
                >
                  {(['basketball', 'football', 'athletics'] as Sport[]).map((s) => (
                    <option key={s} value={s}>{t(`sports.${s}`)}</option>
                  ))}
                </select>
              </label>
              <label className={labelCls}>
                {t('opportunitiesPage.builder.position')}
                <select
                  className={cn(selectCls, 'mt-1.5')}
                  value={state.position}
                  onChange={(e) => set('position', e.target.value)}
                >
                  <option value="any">{t('opportunitiesPage.builder.anyPosition')}</option>
                  {positions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label className={labelCls}>
                {t('opportunitiesPage.builder.country')}
                <select
                  className={cn(selectCls, 'mt-1.5')}
                  value={state.country}
                  onChange={(e) => set('country', e.target.value as BuilderState['country'])}
                >
                  <option value="cv">{t('opportunitiesPage.builder.countryCv')}</option>
                  <option value="diaspora">{t('opportunitiesPage.builder.countryDiaspora')}</option>
                </select>
              </label>
              <label className={labelCls}>
                {t('opportunitiesPage.builder.level')}
                <select
                  className={cn(selectCls, 'mt-1.5')}
                  value={state.level}
                  onChange={(e) => set('level', e.target.value as BuilderState['level'])}
                >
                  <option value="development">{t('opportunitiesPage.builder.levelDevelopment')}</option>
                  <option value="competitive">{t('opportunitiesPage.builder.levelCompetitive')}</option>
                  <option value="elite">{t('opportunitiesPage.builder.levelElite')}</option>
                </select>
              </label>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <p className={labelCls}>{t('opportunitiesPage.builder.ageRange', { min: state.age[0], max: state.age[1] })}</p>
                <Slider
                  className="mt-3"
                  min={13}
                  max={25}
                  step={1}
                  value={state.age}
                  onValueChange={(v) => set('age', [v[0], v[1]])}
                />
              </div>
              <div>
                <p className={labelCls}>{t('opportunitiesPage.builder.heightMin', { cm: state.heightMin })}</p>
                <Slider className="mt-3" min={150} max={210} step={1} value={[state.heightMin]} onValueChange={(v) => set('heightMin', v[0])} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={labelCls}>{t('opportunitiesPage.builder.ovrMin', { value: state.ovrMin })}</p>
                  <Slider className="mt-3" min={0} max={90} step={1} value={[state.ovrMin]} onValueChange={(v) => set('ovrMin', v[0])} />
                </div>
                <div>
                  <p className={labelCls}>{t('opportunitiesPage.builder.potMin', { value: state.potMin })}</p>
                  <Slider className="mt-3" min={0} max={95} step={1} value={[state.potMin]} onValueChange={(v) => set('potMin', v[0])} />
                </div>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-4">
                {(
                  [
                    ['hasVideos', t('opportunitiesPage.builder.hasVideos')],
                    ['verifiedOnly', t('opportunitiesPage.builder.verifiedOnly')],
                    ['available', t('opportunitiesPage.builder.available')],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-[13px] font-medium text-ink-950">
                    <Switch checked={state[key]} onCheckedChange={(v) => set(key, v)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Live results */}
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <motion.p
                key={results.length}
                initial={{ opacity: 0.4, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="font-display text-[26px] font-extrabold text-ink-950"
              >
                {t('opportunitiesPage.builder.compatibleCount', { count: results.length })}
              </motion.p>
              <Link to="/discover" className="text-[13px] font-semibold text-brand-600 hover:text-brand-500">
                {t('opportunitiesPage.builder.viewAll')} →
              </Link>
            </div>
            <div className="mt-4">
              {results.length === 0 ? (
                <EmptyState title={t('opportunitiesPage.builder.empty')} useIllustration />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {results.slice(0, 3).map((a) => (
                      <motion.div
                        key={a.id}
                        layout="position"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease }}
                      >
                        <AthleteCard athlete={a} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
            <p className="mt-4 text-[12px] font-medium text-ink-600">{t('opportunitiesPage.builder.note')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type TypeFilter = 'all' | Opportunity['type'];
type SportFilter = 'all' | Sport;
type RegionFilter = 'all' | 'cv' | 'pt' | 'europe' | 'usa' | 'diaspora';
type VerifFilter = 'all' | 'required' | 'open';

const REGION_MATCH: Record<Exclude<RegionFilter, 'all'>, RegExp> = {
  cv: /Praia|Mindelo|Cabo Verde|Santiago|São Vicente/i,
  pt: /Lisboa|Portugal/i,
  europe: /Europa/i,
  usa: /EUA|USA/i,
  diaspora: /Diáspora/i,
};

export default function Opportunities() {
  const t = useT();
  const { toast, show } = useDemoToast();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('all');
  const [verifFilter, setVerifFilter] = useState<VerifFilter>('all');
  const [applying, setApplying] = useState<Opportunity | null>(null);

  const filtered = allOpportunities.filter((op) => {
    if (typeFilter !== 'all' && op.type !== typeFilter) return false;
    if (sportFilter !== 'all' && op.sport !== sportFilter) return false;
    if (regionFilter !== 'all' && !REGION_MATCH[regionFilter].test(op.location)) return false;
    if (verifFilter === 'required' && !opportunityExtras[op.id]?.needsVerified) return false;
    if (verifFilter === 'open' && opportunityExtras[op.id]?.needsVerified) return false;
    return true;
  });

  const Chip = <T extends string>({
    value,
    current,
    onChange,
    label,
  }: {
    value: T;
    current: T;
    onChange: (v: T) => void;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        'h-9 shrink-0 rounded-full border px-3.5 text-[12px] font-semibold transition-colors cursor-pointer',
        current === value ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white text-ink-600 hover:border-ink-950',
      )}
    >
      {label}
    </button>
  );

  const typeLabels: Record<Opportunity['type'], string> = {
    trial: t('opportunitiesPage.filters.typeTrial'),
    scholarship: t('opportunitiesPage.filters.typeScholarship'),
    academy: t('opportunitiesPage.filters.typeAcademy'),
    contract: t('opportunitiesPage.filters.typeContract'),
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
      {/* Header */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <img
          src="/feature-training.jpg"
          alt=""
          aria-hidden
          className="absolute inset-y-0 right-0 h-full w-1/2 object-cover opacity-30 [mask-image:linear-gradient(to_left,black,transparent)]"
        />
        <div className="absolute inset-0 bg-glow-orange" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-brand-500">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
            {t('opportunitiesPage.header.eyebrow')}
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="mt-3 font-display text-[36px] font-extrabold leading-[1.05] tracking-[-0.025em] lg:text-[48px]"
          >
            {t('opportunitiesPage.header.title')}
          </motion.h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/70">
            {t('opportunitiesPage.header.sub')}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => show(t('opportunitiesPage.header.publishToast'))}
              className="inline-flex h-11 items-center rounded-lg bg-brand-500 px-5 text-[14px] font-semibold text-white transition-all hover:bg-brand-600 active:scale-[0.97] cursor-pointer"
            >
              {t('opportunitiesPage.header.publish')}
            </button>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center rounded-lg border border-ink-700 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-ink-800"
            >
              {t('opportunitiesPage.header.howItWorks')}
            </a>
          </div>
        </div>
      </section>

      {/* Board */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filter bar */}
          <div className="sticky top-16 z-20 -mx-4 flex gap-2 overflow-x-auto bg-paper px-4 py-3 sm:mx-0 sm:px-0">
            <Chip value="all" current={typeFilter} onChange={setTypeFilter} label={`${t('opportunitiesPage.filters.type')}: ${t('opportunitiesPage.filters.all')}`} />
            {(Object.keys(typeLabels) as Opportunity['type'][]).map((tp) => (
              <Chip key={tp} value={tp} current={typeFilter} onChange={setTypeFilter} label={typeLabels[tp]} />
            ))}
            <span className="my-1 w-px shrink-0 bg-line" aria-hidden />
            <Chip value="all" current={sportFilter} onChange={setSportFilter} label={`${t('common.sport')}: ${t('opportunitiesPage.filters.all')}`} />
            {(['basketball', 'football', 'athletics'] as Sport[]).map((s) => (
              <Chip key={s} value={s} current={sportFilter} onChange={setSportFilter} label={t(`sports.${s}`)} />
            ))}
            <span className="my-1 w-px shrink-0 bg-line" aria-hidden />
            <Chip value="all" current={regionFilter} onChange={setRegionFilter} label={`${t('opportunitiesPage.filters.region')}: ${t('opportunitiesPage.filters.all')}`} />
            {(['cv', 'pt', 'europe', 'usa', 'diaspora'] as const).map((r) => (
              <Chip key={r} value={r} current={regionFilter} onChange={setRegionFilter} label={t(`opportunitiesPage.filters.region_${r}`)} />
            ))}
            <span className="my-1 w-px shrink-0 bg-line" aria-hidden />
            <Chip value="all" current={verifFilter} onChange={setVerifFilter} label={t('opportunitiesPage.filters.verification')} />
            <Chip value="required" current={verifFilter} onChange={setVerifFilter} label={t('badges.verifiedProfile')} />
          </div>

          <div className="mt-6 space-y-4">
            {filtered.length === 0 ? (
              <EmptyState title={t('videosPage.empty.title')} body={t('videosPage.empty.body')} />
            ) : (
              filtered.map((op) => (
                <OpportunityCard key={op.id} opportunity={op} onApply={setApplying} />
              ))
            )}
          </div>
        </div>
      </section>

      <SearchBuilder />

      {/* How it works + safety */}
      <section id="how-it-works" className="scroll-mt-24 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title={t('opportunitiesPage.how.title')} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950 font-display text-[15px] font-extrabold text-white tnum">
                  {n}
                </span>
                <h3 className="mt-4 font-display text-[17px] font-bold text-ink-950">
                  {t(`opportunitiesPage.how.step${n}`)}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
                  {t(`opportunitiesPage.how.step${n}Body`)}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease }}
            className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-warning/40 bg-amber-50 p-5"
          >
            <ShieldCheck size={28} strokeWidth={1.75} className="shrink-0 text-warning" aria-hidden />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[17px] font-bold text-ink-950">{t('opportunitiesPage.safety.title')}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{t('opportunitiesPage.safety.body')}</p>
            </div>
            <Link to="/#privacy" className="text-[13px] font-semibold text-brand-600 hover:text-brand-500">
              {t('opportunitiesPage.safety.link')} →
            </Link>
          </motion.div>
        </div>
      </section>

      <ApplyModal
        opportunity={applying}
        onClose={() => setApplying(null)}
        onSubmit={() => {
          setApplying(null);
          show(t('opportunitiesPage.apply.submitted'));
        }}
      />
      {toast}
    </motion.div>
  );
}
