/**
 * Journey stepper (home.md sec. 3) — 7 steps with a GSAP-scrubbed orange
 * progress line; each step pops when the line reaches it. GSAP isolated here.
 */
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useI18n } from '@/i18n';
import SectionHeading from '@/components/shared/SectionHeading';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEP_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

export default function JourneySection() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // Orange line draws left->right on scroll (scrub)
      gsap.fromTo(
        '.journey-line-fill',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.journey-track', start: 'top 75%', end: 'bottom 45%', scrub: 0.5 },
        },
      );
      // Steps pop when the line approaches
      gsap.utils.toArray<HTMLElement>('.journey-step').forEach((step, i) => {
        gsap.fromTo(
          step,
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'expo.out',
            scrollTrigger: { trigger: '.journey-track', start: `top ${72 - i * 4}%`, once: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-paper-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('home.journey.title')} sub={t('home.journey.sub')} />
        <div className="journey-track relative">
          {/* hairline + orange progress (desktop) */}
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-line lg:block" aria-hidden />
          <div
            className="journey-line-fill absolute left-0 right-0 top-5 hidden h-px origin-left bg-brand-500 lg:block"
            aria-hidden
          />
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-7 lg:gap-4">
            {STEP_KEYS.map((key, i) => (
              <li key={key} className="journey-step relative">
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 font-display text-[15px] font-extrabold text-white tnum">
                  {i + 1}
                </span>
                <p className="mt-4 font-display text-[15px] font-bold text-ink-950">
                  {t(`home.journey.steps.${key}.title`)}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-ink-600">
                  {t(`home.journey.steps.${key}.desc`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
