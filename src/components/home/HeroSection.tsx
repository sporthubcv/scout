/**
 * Home hero (design home.md sec. 1) — dark full-viewport hero with GSAP
 * word-level entrance, image parallax + counter-parallax OVR card, pin 120vh.
 * GSAP is isolated in this component (react-dev.md library isolation).
 */
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useI18n } from '@/i18n';
import { flagshipAthlete } from '@/data/athletes';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import OvrSquare, { PotChip } from '@/components/shared/OvrSquare';
import StatusBadge from '@/components/shared/StatusBadge';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TRUST: { value: string; key: string }[] = [
  { value: '1.284', key: 'home.hero.trust.athletes' },
  { value: '86', key: 'home.hero.trust.clubs' },
  { value: '312', key: 'home.hero.trust.scouts' },
  { value: '24', key: 'home.hero.trust.competitions' },
];

export default function HeroSection() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(
        '.hero-word',
        { y: 60, opacity: 0, rotate: 2 },
        { y: 0, opacity: 1, rotate: 0, duration: 0.7, stagger: 0.12, ease: 'expo.out' },
      ).fromTo(
        '.hero-fade',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'expo.out' },
        '-=0.2',
      );

      gsap.fromTo('.hero-img', { scale: 1.08 }, { scale: 1, duration: 1.4, ease: 'power2.out' });

      // Pin + counter-parallax (design: hero pins for 120vh then unpins)
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=120%',
            pin: true,
            scrub: 0.6,
          },
        })
        .to('.hero-img', { y: -40, ease: 'none' }, 0)
        .to('.hero-ovr-card', { y: 24, ease: 'none' }, 0);
    },
    { scope: root },
  );

  const words = [t('home.hero.word1'), t('home.hero.word2'), t('home.hero.word3')];

  return (
    <section ref={root} className="bg-ink-gradient relative min-h-[92svh] overflow-hidden">
      {/* breathing orange glow */}
      <div className="bg-glow-orange animate-glow-breathe pointer-events-none absolute inset-0" aria-hidden />
      {/* decorative arcs right edge */}
      <img
        src="/pattern-arc.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/2 hidden w-[560px] -translate-y-1/2 opacity-40 lg:block"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-8 lg:py-0 lg:min-h-[92svh]">
        {/* Left */}
        <div>
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
            {t('home.hero.eyebrow')}
          </p>
          <h1 className="mt-6 font-display text-[44px] font-extrabold leading-[1.02] tracking-[-0.03em] text-white md:text-[72px]">
            {words.map((w, i) => (
              <span key={i} className="block overflow-hidden">
                <span className="hero-word inline-block">
                  {w.endsWith('.') ? (
                    <>
                      {w.slice(0, -1)}
                      <span className="text-brand-500">.</span>
                    </>
                  ) : (
                    w
                  )}
                </span>
              </span>
            ))}
          </h1>
          <p className="hero-fade mt-6 max-w-md text-[17px] leading-[1.6] text-white/70 md:text-lg">
            {t('home.hero.sub')}
          </p>
          <div className="hero-fade mt-8 flex flex-wrap gap-3">
            <Link
              to="/discover?type=athletes"
              className="inline-flex h-11 items-center rounded-lg bg-brand-500 px-5 font-semibold text-white transition-all hover:bg-brand-600 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
            >
              {t('home.hero.ctaPrimary')}
            </Link>
            <Link
              to="/auth"
              className="inline-flex h-11 items-center rounded-lg border border-ink-700 px-5 font-semibold text-white transition-colors hover:bg-ink-800 active:scale-[0.97]"
            >
              {t('home.hero.ctaGhost')}
            </Link>
          </div>
          {/* Trust strip */}
          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-ink-700 pt-6 sm:grid-cols-4">
            {TRUST.map((s) => (
              <div key={s.key} title={t('common.demoTooltip')}>
                <p className="font-display text-2xl font-extrabold text-white tnum">{s.value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white/50">
                  {t(s.key)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — hero image + floating OVR card */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-ink-700">
            <img
              src="/hero-court.jpg"
              alt={t('home.hero.eyebrow')}
              className="hero-img aspect-[4/5] w-full object-cover"
              loading="eager"
            />
          </div>
          <div className="hero-ovr-card absolute -bottom-6 -left-3 max-w-[300px] rounded-xl border border-ink-700 bg-ink-900/80 p-4 backdrop-blur sm:-left-8">
            <div className="flex items-center gap-3">
              <MonogramAvatar name={flagshipAthlete.name} size={44} />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-white">{t('home.hero.ovrCard.name')}</p>
                <p className="truncate text-[12px] text-white/50">{t('home.hero.ovrCard.role')}</p>
              </div>
              <OvrSquare value={flagshipAthlete.ovr.value} size={52} className="ml-auto" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PotChip value={flagshipAthlete.pot} />
              <StatusBadge variant="verifiedProfile" />
            </div>
            <p className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
              {t('common.demoData')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
