/**
 * Auth & Onboarding (/auth) — design: auth-onboarding.md.
 * Fully SIMULATED auth: any credentials work, optional MFA simulation,
 * demo quick-access per role (useDemoSession + roleDashboardPath), and an
 * 8-step onboarding wizard incl. the minors/guardian consent branch.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Binoculars,
  Building2,
  Check,
  ClipboardList,
  Globe,
  Handshake,
  Landmark,
  Mail,
  Play,
  ShieldAlert,
  ShieldCheck,
  Target,
  Timer,
  Trophy,
  UserRound,
} from 'lucide-react';
import { useT } from '@/i18n';
import { roleDashboardPath, useDemoSession, type Role } from '@/data';
import { onboardingClubResults, onboardingOptions } from '@/data/extra-scouting';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const DEMO_YEAR = 2027;

const QUICK_ROLES: { role: Role; icon: typeof UserRound }[] = [
  { role: 'athlete', icon: UserRound },
  { role: 'scout', icon: Binoculars },
  { role: 'club', icon: Building2 },
  { role: 'organizer', icon: Trophy },
  { role: 'sponsor', icon: Handshake },
  { role: 'coach', icon: ClipboardList },
  { role: 'guardian', icon: ShieldCheck },
  { role: 'admin', icon: ShieldAlert },
];

const SIGNUP_ROLES: { role: Role; icon: typeof UserRound; needsVerify?: boolean }[] = [
  { role: 'athlete', icon: UserRound },
  { role: 'guardian', icon: ShieldCheck },
  { role: 'club', icon: Building2 },
  { role: 'scout', icon: Binoculars, needsVerify: true },
  { role: 'coach', icon: ClipboardList },
  { role: 'organizer', icon: Trophy, needsVerify: true },
  { role: 'federation', icon: Landmark, needsVerify: true },
  { role: 'intlClub', icon: Globe },
  { role: 'sponsor', icon: Handshake },
];

const ISLANDS = ['Santiago', 'São Vicente', 'Santo Antão', 'Fogo', 'Sal', 'Boa Vista', 'Maio', 'Brava', 'São Nicolau'];

const TOTAL_STEPS = 8;

const inputCls =
  'h-12 w-full rounded-lg border border-line bg-white px-3.5 text-[14px] text-ink-950 placeholder:text-ink-600/40 focus:outline-none focus:ring-2 focus:ring-brand-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-950">{label}</span>
      {children}
    </label>
  );
}

export default function Auth() {
  const t = useT();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { setRole } = useDemoSession();

  const [view, setView] = useState<'login' | 'mfa' | 'signup' | 'done'>(
    params.get('mode') === 'signup' ? 'signup' : 'login',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaWanted, setMfaWanted] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [checking, setChecking] = useState(false);

  /* wizard state */
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resendIn, setResendIn] = useState(30);
  const [role, setRoleSel] = useState<Role>('athlete');
  const [dob, setDob] = useState('');
  const [island, setIsland] = useState(ISLANDS[0]);
  const [city, setCity] = useState('');
  const [guardian, setGuardian] = useState({ name: '', email: '', phone: '' });
  const [consents, setConsents] = useState([false, false, false]);
  const [minorState, setMinorState] = useState<'form' | 'pending' | 'activated'>('form');
  const [sport, setSport] = useState<'basketball' | 'football' | 'athletics'>('basketball');
  const [position, setPosition] = useState('');
  const [heightCm, setHeightCm] = useState(180);
  const [weightKg, setWeightKg] = useState(72);
  const [dominant, setDominant] = useState<'right' | 'left' | 'both'>('right');
  const [athEvent, setAthEvent] = useState('100m');
  const [bestMark, setBestMark] = useState('');
  const [clubQuery, setClubQuery] = useState('');
  const [clubChoice, setClubChoice] = useState<string | 'independent' | null>(null);
  const [avatarVariant, setAvatarVariant] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');

  const isMinor = useMemo(() => {
    if (!dob) return false;
    const year = new Date(dob).getFullYear();
    return Number.isFinite(year) && DEMO_YEAR - year < 18;
  }, [dob]);

  const strength = useMemo(() => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 10) return 2;
    return 3;
  }, [password]);

  useEffect(() => {
    if (view !== 'signup' || step !== 2) return;
    setResendIn(30);
    const iv = window.setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(iv);
  }, [view, step]);

  const quickAccess = (r: Role) => {
    setRole(r);
    navigate(roleDashboardPath(r));
  };

  const submitLogin = () => {
    setChecking(true);
    window.setTimeout(() => {
      setChecking(false);
      if (mfaWanted) {
        setView('mfa');
      } else {
        setRole('athlete');
        navigate(roleDashboardPath('athlete'));
      }
    }, 900);
  };

  const finishSignup = () => {
    setView('done');
  };

  const stepValid = (s: number): boolean => {
    switch (s) {
      case 1:
        return name.trim().length > 1 && email.includes('@') && password.length >= 6;
      case 2:
        return otp.trim().length >= 4;
      case 4:
        if (isMinor) return minorState === 'activated';
        return true;
      default:
        return true;
    }
  };

  const stepTitles = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'] as const;

  /* ------------------------------ left panel ------------------------------ */
  const sidePanel = (
    <aside className="relative flex flex-col justify-between overflow-hidden bg-ink-950 p-6 text-white lg:min-h-[calc(100dvh-9rem)] lg:p-10">
      <img src="/pattern-arc.svg" alt="" aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 opacity-40" />
      <div className="relative flex items-center gap-3">
        <img src="/logo.png" alt="SportHub Scout" className="h-9 w-9 rounded-full" />
        <div>
          <p className="font-display text-[15px] font-extrabold tracking-tight">
            SPORTHUB <span className="text-brand-500">SCOUT</span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">by SportHubCV</p>
        </div>
      </div>
      <div className="relative mt-8 hidden lg:block">
        <p className="font-display text-[28px] font-extrabold leading-tight">{t('brand.tagline')}</p>
        <p className="mt-1 text-[13px] text-white/50">{t('brand.subline')}</p>
        <ul className="mt-8 space-y-3">
          {(['t1', 't2', 't3'] as const).map((k) => (
            <li key={k} className="flex items-center gap-2.5 text-[14px] text-white/80">
              <Check size={16} className="shrink-0 text-brand-500" aria-hidden />
              {t(`authPage.trust.${k}`)}
            </li>
          ))}
        </ul>
      </div>
      <p className="relative mt-6 hidden text-[11px] uppercase tracking-[0.14em] text-white/35 lg:block">
        {t('brand.location')}
      </p>
    </aside>
  );

  /* ------------------------------ login view ------------------------------ */
  const loginView = (
    <div className="mx-auto w-full max-w-md py-10 lg:py-16">
      <h1 className="font-display text-[28px] font-extrabold tracking-[-0.015em] text-ink-950">{t('authPage.signIn.title')}</h1>
      <p className="mt-1 text-[14px] text-ink-600">{t('authPage.signIn.sub')}</p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submitLogin();
        }}
      >
        <Field label={t('authPage.signIn.email')}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="nome@exemplo.cv" autoComplete="email" />
        </Field>
        <Field label={t('authPage.signIn.password')}>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" autoComplete="current-password" />
        </Field>
        <div className="flex items-center justify-between">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[13px] font-medium text-ink-600">
            <input type="checkbox" checked={mfaWanted} onChange={(e) => setMfaWanted(e.target.checked)} className="h-4 w-4 accent-brand-500" />
            {t('authPage.signIn.mfa')}
          </label>
          <span className="cursor-pointer text-[13px] font-semibold text-brand-600">{t('authPage.signIn.forgot')}</span>
        </div>
        <button
          type="submit"
          disabled={checking}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-brand-500 text-[15px] font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-70"
        >
          {checking ? t('authPage.signIn.checking') : t('authPage.signIn.submit')}
        </button>
        {checking && <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-100"><div className="h-full w-1/2 animate-shimmer rounded-full bg-brand-500" /></div>}
      </form>

      <div className="my-6 flex items-center gap-3 text-[12px] uppercase tracking-[0.08em] text-ink-600/60">
        <span className="h-px flex-1 bg-line" />
        {t('authPage.signIn.or')}
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {['Google', 'Apple'].map((p) => (
          <button
            key={p}
            type="button"
            disabled
            title={t('authPage.signIn.socialSoon')}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-line text-[13px] font-semibold text-ink-600/50"
          >
            {p}
          </button>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-ink-600/70">{t('authPage.mfaNote')}</p>

      <p className="mt-8 text-center text-[14px] text-ink-600">
        {t('authPage.signIn.newHere')}{' '}
        <button
          type="button"
          onClick={() => {
            setParams({ mode: 'signup' });
            setView('signup');
          }}
          className="font-semibold text-brand-600"
        >
          {t('authPage.signIn.create')} →
        </button>
      </p>

      {/* State B — demo quick access */}
      <div className="mt-10 rounded-xl border border-brand-500/40 bg-brand-50 p-5">
        <h2 className="flex items-center gap-2 font-display text-[16px] font-extrabold text-ink-950">
          <Play size={16} className="text-brand-500" aria-hidden />
          {t('authPage.demo.title')}
        </h2>
        <p className="mt-1 text-[13px] text-ink-600">{t('authPage.demo.body')}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUICK_ROLES.map(({ role: r, icon: Icon }) => (
            <button
              key={r}
              type="button"
              onClick={() => quickAccess(r)}
              className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border border-line bg-white px-2 text-[12px] font-semibold text-ink-950 transition-all hover:border-brand-500 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]"
            >
              <Icon size={18} className="text-brand-500" aria-hidden />
              {t(`roles.${r}`)}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-ink-600/70">{t('authPage.demo.note')}</p>
      </div>
    </div>
  );

  /* ------------------------------- mfa view ------------------------------- */
  const mfaView = (
    <div className="mx-auto w-full max-w-md py-10 lg:py-16">
      <h1 className="font-display text-[24px] font-extrabold text-ink-950">{t('authPage.signIn.mfaTitle')}</h1>
      <p className="mt-1 text-[13px] text-ink-600">{t('authPage.signIn.mfaHint')}</p>
      <input
        value={mfaCode}
        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric"
        placeholder="000000"
        aria-label={t('authPage.signIn.mfaTitle')}
        className="tnum mt-6 h-14 w-full rounded-lg border border-line text-center font-display text-[24px] font-extrabold tracking-[0.5em] text-ink-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <button
        type="button"
        onClick={() => {
          setRole('athlete');
          navigate(roleDashboardPath('athlete'));
        }}
        className="mt-4 h-12 w-full rounded-lg bg-brand-500 text-[15px] font-semibold text-white hover:bg-brand-600"
      >
        {t('authPage.signIn.mfaSubmit')}
      </button>
    </div>
  );

  /* ------------------------------ wizard steps ------------------------------ */

  const stepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Field label={t('authPage.signup.s1.name')}>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Erick Semedo" autoComplete="name" />
            </Field>
            <Field label={t('authPage.signup.s1.email')}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="nome@exemplo.cv" autoComplete="email" />
            </Field>
            <Field label={t('authPage.signup.s1.phone')}>
              <div className="flex">
                <span className="tnum flex h-12 items-center rounded-l-lg border border-r-0 border-line bg-paper-50 px-3 text-[14px] font-semibold text-ink-600">+238</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className={cn(inputCls, 'rounded-l-none')} placeholder="9XX XX XX" />
              </div>
            </Field>
            <Field label={t('authPage.signup.s1.password')}>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} autoComplete="new-password" />
            </Field>
            <div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={cn('h-1.5 flex-1 rounded-full', strength >= n ? (strength === 1 ? 'bg-danger' : strength === 2 ? 'bg-warning' : 'bg-success') : 'bg-paper-100')} />
                ))}
              </div>
              {strength > 0 && (
                <p className="mt-1 text-[12px] font-semibold text-ink-600">
                  {strength === 1 ? t('authPage.signup.s1.weak') : strength === 2 ? t('authPage.signup.s1.mid') : t('authPage.signup.s1.strong')}
                </p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <p className="flex items-start gap-2 text-[13px] text-ink-600">
              <Mail size={16} className="mt-0.5 shrink-0 text-brand-500" aria-hidden />
              {t('authPage.signup.s2.body')}
            </p>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder="000000"
              aria-label="OTP"
              className="tnum h-14 w-full rounded-lg border border-line text-center font-display text-[24px] font-extrabold tracking-[0.5em] text-ink-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[12px] text-ink-600/70">{t('authPage.signup.s2.hint')}</p>
            <button
              type="button"
              disabled={resendIn > 0}
              onClick={() => setResendIn(30)}
              className="min-h-11 text-[13px] font-semibold text-brand-600 disabled:text-ink-600/50"
            >
              {resendIn > 0 ? t('authPage.signup.s2.resendIn', { s: resendIn }) : t('authPage.signup.s2.resend')}
            </button>
          </div>
        );
      case 3:
        return (
          <div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {SIGNUP_ROLES.map(({ role: r, icon: Icon }) => (
                <motion.button
                  key={r}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setRoleSel(r)}
                  className={cn(
                    'flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-[12px] font-semibold transition-colors',
                    role === r ? 'border-brand-500 bg-brand-50 text-ink-950 ring-2 ring-brand-500' : 'border-line bg-white text-ink-600 hover:border-ink-950/30',
                  )}
                >
                  <Icon size={20} className={role === r ? 'text-brand-500' : 'text-ink-600'} aria-hidden />
                  {t(`roles.${r}`)}
                </motion.button>
              ))}
            </div>
            {SIGNUP_ROLES.find((r) => r.role === role)?.needsVerify && (
              <p className="mt-4 flex items-start gap-2 rounded-lg border border-info/40 bg-blue-50 p-3 text-[12px] font-semibold text-info">
                <ShieldAlert size={15} className="mt-0.5 shrink-0" aria-hidden />
                {t('authPage.signup.s3.verifyNote')}
              </p>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('authPage.signup.s4.dob')}>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} max="2027-12-31" />
              </Field>
              <Field label={t('authPage.signup.s4.island')}>
                <select value={island} onChange={(e) => setIsland(e.target.value)} className={inputCls}>
                  {ISLANDS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label={t('authPage.signup.s4.city')}>
              <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} placeholder="Praia" />
            </Field>

            {isMinor && (
              <div className="rounded-xl border border-warning/40 bg-amber-50 p-4">
                <h3 className="flex items-center gap-2 text-[14px] font-bold text-warning">
                  <ShieldAlert size={16} aria-hidden />
                  {t('authPage.signup.s4.minorTitle')}
                </h3>
                <p className="mt-1 text-[12px] text-ink-600">{t('authPage.signup.s4.minorBody')}</p>

                {minorState === 'form' && (
                  <div className="mt-4 space-y-3">
                    <input value={guardian.name} onChange={(e) => setGuardian({ ...guardian, name: e.target.value })} placeholder={t('authPage.signup.s4.gName')} aria-label={t('authPage.signup.s4.gName')} className={inputCls} />
                    <input type="email" value={guardian.email} onChange={(e) => setGuardian({ ...guardian, email: e.target.value })} placeholder={t('authPage.signup.s4.gEmail')} aria-label={t('authPage.signup.s4.gEmail')} className={inputCls} />
                    <input value={guardian.phone} onChange={(e) => setGuardian({ ...guardian, phone: e.target.value })} placeholder={t('authPage.signup.s4.gPhone')} aria-label={t('authPage.signup.s4.gPhone')} className={inputCls} />
                    {(['c1', 'c2', 'c3'] as const).map((c, i) => (
                      <label key={c} className="flex min-h-11 cursor-pointer items-center gap-2 text-[13px] font-medium text-ink-950">
                        <input
                          type="checkbox"
                          checked={consents[i]}
                          onChange={(e) => setConsents((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))}
                          className="h-4 w-4 accent-brand-500"
                        />
                        {t(`authPage.signup.s4.${c}`)}
                      </label>
                    ))}
                    <button
                      type="button"
                      disabled={!guardian.name || !guardian.email.includes('@') || consents.some((c) => !c)}
                      onClick={() => setMinorState('pending')}
                      className="h-12 w-full rounded-lg bg-ink-950 text-[14px] font-semibold text-white disabled:opacity-40"
                    >
                      {t('authPage.signup.s4.send')}
                    </button>
                  </div>
                )}

                {minorState === 'pending' && (
                  <div className="mt-4 rounded-lg border border-info/40 bg-blue-50 p-4 text-center">
                    <p className="flex items-center justify-center gap-2 text-[14px] font-bold text-info">
                      <Check size={16} aria-hidden />
                      {t('authPage.signup.s4.pending')}
                    </p>
                    <p className="mt-1 text-[12px] text-ink-600">{t('authPage.signup.s4.pendingBody')}</p>
                    <button
                      type="button"
                      onClick={() => setMinorState('activated')}
                      className="mt-3 h-11 w-full rounded-lg bg-brand-500 text-[13px] font-bold text-white"
                    >
                      {t('authPage.signup.s4.simulate')}
                    </button>
                  </div>
                )}

                {minorState === 'activated' && (
                  <div className="mt-4">
                    <p className="flex items-center gap-2 text-[14px] font-bold text-success">
                      <ShieldCheck size={16} aria-hidden />
                      {t('authPage.signup.s4.activated')}
                    </p>
                    <p className="mt-2 inline-flex rounded-full border border-warning/40 bg-white px-3 py-1.5 text-[11px] font-semibold text-warning">
                      {t('authPage.signup.s4.restricted')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  ['basketball', Target],
                  ['football', Activity],
                  ['athletics', Timer],
                ] as const
              ).map(([s, Icon]) => (
                <motion.button
                  key={s}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSport(s)}
                  className={cn(
                    'flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border p-4 font-display text-[15px] font-bold transition-colors',
                    sport === s ? 'border-brand-500 bg-brand-50 text-ink-950 ring-2 ring-brand-500' : 'border-line bg-white text-ink-600 hover:border-ink-950/30',
                  )}
                >
                  <Icon size={24} className={sport === s ? 'text-brand-500' : 'text-ink-600'} aria-hidden />
                  {t(`sports.${s}`)}
                </motion.button>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-ink-600/70">{t('authPage.signup.s5.modular')}</p>
          </div>
        );
      case 6: {
        const positions = sport === 'basketball' ? onboardingOptions.basketballPositions : sport === 'football' ? onboardingOptions.footballPositions : [];
        return (
          <div className="space-y-5">
            <p className="text-[12px] font-semibold text-ink-600">{t('authPage.signup.s6.optional')}</p>
            {sport !== 'athletics' ? (
              <>
                <div>
                  <p className="mb-2 text-[13px] font-semibold text-ink-950">{t('authPage.signup.s6.position')}</p>
                  <div className="flex flex-wrap gap-2">
                    {positions.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPosition(p)}
                        className={cn('min-h-11 rounded-full border px-4 text-[13px] font-semibold', position === p ? 'border-ink-950 bg-ink-950 text-white' : 'border-line text-ink-600')}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-1 flex justify-between text-[13px]">
                      <span className="font-semibold text-ink-950">{t('authPage.signup.s6.height')}</span>
                      <span className="tnum font-bold text-brand-600">{heightCm} cm</span>
                    </div>
                    <input type="range" min={140} max={220} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} aria-label={t('authPage.signup.s6.height')} className="h-9 w-full accent-brand-500" />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-[13px]">
                      <span className="font-semibold text-ink-950">{t('authPage.signup.s6.weight')}</span>
                      <span className="tnum font-bold text-brand-600">{weightKg} kg</span>
                    </div>
                    <input type="range" min={40} max={130} value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} aria-label={t('authPage.signup.s6.weight')} className="h-9 w-full accent-brand-500" />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[13px] font-semibold text-ink-950">
                    {sport === 'football' ? t('authPage.signup.s6.foot') : t('authPage.signup.s6.hand')}
                  </p>
                  <div className="flex gap-2">
                    {(['right', 'left', 'both'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDominant(d)}
                        className={cn('min-h-11 flex-1 rounded-lg border text-[13px] font-semibold', dominant === d ? 'border-ink-950 bg-ink-950 text-white' : 'border-line text-ink-600')}
                      >
                        {t(`authPage.signup.s6.${d}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="mb-2 text-[13px] font-semibold text-ink-950">{t('authPage.signup.s6.event')}</p>
                  <div className="flex flex-wrap gap-2">
                    {onboardingOptions.athleticsEvents.map((ev) => (
                      <button
                        key={ev}
                        type="button"
                        onClick={() => setAthEvent(ev)}
                        className={cn('min-h-11 rounded-full border px-4 text-[13px] font-semibold', athEvent === ev ? 'border-ink-950 bg-ink-950 text-white' : 'border-line text-ink-600')}
                      >
                        {ev}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label={t('authPage.signup.s6.bestMark')}>
                  <input value={bestMark} onChange={(e) => setBestMark(e.target.value)} className={inputCls} placeholder="11.42s" />
                </Field>
              </>
            )}
          </div>
        );
      }
      case 7: {
        const results = onboardingClubResults.filter((c) => c.name.toLowerCase().includes(clubQuery.toLowerCase()));
        return (
          <div className="space-y-4">
            <input value={clubQuery} onChange={(e) => setClubQuery(e.target.value)} placeholder={t('authPage.signup.s7.search')} aria-label={t('authPage.signup.s7.search')} className={inputCls} />
            <ul className="space-y-2">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setClubChoice(c.id)}
                    className={cn(
                      'flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 text-left transition-colors',
                      clubChoice === c.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500' : 'border-line bg-white hover:border-ink-950/30',
                    )}
                  >
                    <Building2 size={18} className="shrink-0 text-ink-600" aria-hidden />
                    <span className="flex-1">
                      <span className="block text-[14px] font-semibold text-ink-950">{c.name}</span>
                      <span className="block text-[12px] text-ink-600">{c.city}</span>
                    </span>
                  </button>
                </li>
              ))}
              {results.length === 0 && <li className="py-2 text-[13px] text-ink-600">{t('authPage.signup.s7.noResults')}</li>}
            </ul>
            <button
              type="button"
              onClick={() => setClubChoice('independent')}
              className={cn(
                'flex min-h-14 w-full items-start gap-3 rounded-xl border border-dashed p-4 text-left transition-colors',
                clubChoice === 'independent' ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500' : 'border-line bg-white hover:border-ink-950/30',
              )}
            >
              <UserRound size={18} className="mt-0.5 shrink-0 text-brand-500" aria-hidden />
              <span>
                <span className="block text-[14px] font-bold text-ink-950">{t('authPage.signup.s7.independent')}</span>
                <span className="block text-[12px] text-ink-600">{t('authPage.signup.s7.independentBody')}</span>
              </span>
            </button>
          </div>
        );
      }
      case 8:
        return (
          <div className="space-y-5">
            <div>
              <p className="mb-1 text-[13px] font-semibold text-ink-950">{t('authPage.signup.s8.avatar')}</p>
              <p className="mb-3 text-[12px] text-ink-600/70">{t('authPage.signup.s8.avatarDemo')}</p>
              <div className="flex gap-3">
                {[0, 1, 2].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAvatarVariant(v)}
                    aria-label={`avatar ${v + 1}`}
                    className={cn('rounded-lg', avatarVariant === v && 'ring-2 ring-brand-500 ring-offset-2')}
                  >
                    <MonogramAvatar name={v === avatarVariant ? name || 'AA' : `${name || 'AA'} ${'xyz'[v]}`} size={64} />
                  </button>
                ))}
              </div>
            </div>
            <Field label={t('authPage.signup.s8.videoUrl')}>
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={inputCls} placeholder="https://…" inputMode="url" />
            </Field>
          </div>
        );
      default:
        return null;
    }
  };

  /* ------------------------------ wizard view ------------------------------- */
  const wizardView = (
    <div className="mx-auto w-full max-w-lg py-10 lg:py-14">
      <h1 className="font-display text-[26px] font-extrabold tracking-[-0.015em] text-ink-950">{t('authPage.signup.title')}</h1>
      {/* progress */}
      <div className="mt-5">
        <div className="flex gap-1.5" aria-hidden>
          {stepTitles.map((s, i) => (
            <span key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-100">
              <motion.span
                className="block h-full rounded-full bg-brand-500"
                initial={false}
                animate={{ width: step > i ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: EASE }}
              />
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-600">
          {t('authPage.signup.stepLabel', { n: step, total: TOTAL_STEPS })} · {t(`authPage.signup.steps.s${step}`)}
        </p>
      </div>

      <h2 className="mt-6 font-display text-[20px] font-extrabold text-ink-950">{t(`authPage.signup.s${step}.title`)}</h2>

      <div className="mt-5 min-h-[280px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {stepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center gap-3">
        {step > 1 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="h-12 rounded-lg border border-line px-5 text-[14px] font-semibold text-ink-950 hover:border-ink-950">
            {t('authPage.signup.back')}
          </button>
        )}
        <button
          type="button"
          disabled={!stepValid(step)}
          onClick={() => (step < TOTAL_STEPS ? setStep((s) => s + 1) : finishSignup())}
          className="h-12 flex-1 rounded-lg bg-brand-500 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-40"
        >
          {step === TOTAL_STEPS ? t('authPage.signup.s8.finish') : t('authPage.signup.next')}
        </button>
      </div>
      {step >= 3 && step < TOTAL_STEPS && (
        <button type="button" onClick={finishSignup} className="mt-3 min-h-11 w-full text-center text-[13px] font-semibold text-ink-600 hover:text-ink-950">
          {t('authPage.signup.skip')}
        </button>
      )}
      <p className="mt-6 text-center text-[13px] text-ink-600">
        {t('authPage.signIn.haveAccount')}{' '}
        <button
          type="button"
          onClick={() => {
            setParams({});
            setView('login');
          }}
          className="font-semibold text-brand-600"
        >
          {t('authPage.signIn.title')}
        </button>
      </p>
    </div>
  );

  /* -------------------------------- done view ------------------------------- */
  const doneView = (
    <div className="mx-auto flex w-full max-w-md flex-col items-center py-14 text-center">
      <motion.svg width="80" height="80" viewBox="0 0 72 72" fill="none" aria-hidden>
        <motion.circle cx="36" cy="36" r="33" stroke="#F97316" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
        <motion.path d="M22 37 L32 47 L51 27" stroke="#F97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />
      </motion.svg>
      <h1 className="mt-5 font-display text-[26px] font-extrabold text-ink-950">{t('authPage.signup.done.title')} ✓</h1>
      <p className="mt-2 text-[14px] text-ink-600">{t('authPage.signup.done.body')}</p>
      <div className="mt-6 w-full rounded-xl border border-line bg-white p-5 text-left">
        <div className="flex items-center gap-3">
          <MonogramAvatar name={name || 'Atleta Demo'} size={52} />
          <div className="min-w-0">
            <p className="truncate font-display text-[16px] font-extrabold text-ink-950">{name || 'Atleta Demo'}</p>
            <p className="text-[12px] text-ink-600">
              {t(`roles.${role}`)} · {t(`sports.${sport}`)} · {island}
            </p>
            {isMinor && (
              <p className="mt-1 inline-flex rounded-full border border-warning/40 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-warning">
                {t('authPage.signup.s4.restricted')}
              </p>
            )}
          </div>
        </div>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-600">{t('authPage.signup.done.next')}</p>
        <ul className="mt-2 space-y-1.5">
          {(['n1', 'n2', 'n3'] as const).map((k) => (
            <li key={k} className="flex items-center gap-2 text-[13px] text-ink-950">
              <Check size={14} className="text-brand-500" aria-hidden />
              {t(`authPage.signup.done.${k}`)}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => {
          setRole(role);
          navigate(roleDashboardPath(role));
        }}
        className="mt-6 h-12 w-full rounded-lg bg-brand-500 text-[15px] font-semibold text-white hover:bg-brand-600"
      >
        {t('authPage.signup.done.cta')}
      </button>
    </div>
  );

  /* --------------------------------- render --------------------------------- */
  return (
    <div className="grid bg-paper-50 lg:grid-cols-[2fr_3fr]">
      {sidePanel}
      <main className="px-4 sm:px-8 lg:px-12">
        {view === 'login' && loginView}
        {view === 'mfa' && mfaView}
        {view === 'signup' && wizardView}
        {view === 'done' && doneView}
      </main>
    </div>
  );
}
