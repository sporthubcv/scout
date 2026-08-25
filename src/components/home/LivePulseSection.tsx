/**
 * Live Platform Pulse (home.md sec. 2) — simulated live match card with ticking
 * clock + auto-appending scripted event feed, plus auto-updating stat tiles.
 * Framer Motion only (no GSAP in this tree).
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useT } from '@/i18n';
import { demoPersonas } from '@/data/demoSession';
import SectionHeading from '@/components/shared/SectionHeading';
import StatusBadge from '@/components/shared/StatusBadge';
import MonogramAvatar from '@/components/shared/MonogramAvatar';

const EVENT_KEYS = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'];
const EVENT_CLOCKS = ['06:32', '06:41', '06:55', '07:08', '07:21', '07:36', '07:50', '08:04'];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface FeedEvent {
  id: number;
  clock: string;
  text: string;
}

export default function LivePulseSection() {
  const t = useT();
  const [seconds, setSeconds] = useState(6 * 60 + 32);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const nextEvent = useRef(0);

  // Clock ticks every second (simulated Q3)
  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Scripted event appended every 4s, looping
  useEffect(() => {
    const push = () => {
      const i = nextEvent.current % EVENT_KEYS.length;
      setFeed((f) =>
        [
          { id: nextEvent.current, clock: EVENT_CLOCKS[i], text: t(`home.pulse.events.${EVENT_KEYS[i]}`) },
          ...f,
        ].slice(0, 6),
      );
      nextEvent.current += 1;
    };
    push();
    const id = window.setInterval(push, 4000);
    return () => window.clearInterval(id);
  }, [t]);

  const clock = `${String(Math.floor((seconds % 600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  const tiles = [
    { label: t('home.pulse.stats.pts'), value: 21 + (feed.length % 3), spark: [4, 7, 9, 12, 15, 18, 21] },
    { label: t('home.pulse.stats.reb'), value: 9 + (feed.length % 2), spark: [2, 3, 4, 5, 7, 8, 9] },
    { label: t('home.pulse.stats.eff'), value: 24 + (feed.length % 4), spark: [6, 9, 11, 14, 16, 20, 24] },
  ];

  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease }}
        >
          <SectionHeading eyebrow={t('home.pulse.eyebrow')} title={t('home.pulse.title')} />
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Live match card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease, delay: 0.07 }}
            className="rounded-xl bg-ink-950 p-5 text-white"
          >
            <div className="flex items-center justify-between">
              <StatusBadge variant="live" />
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">
                {t('home.pulse.competition')}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-bold">Atlético Achada</p>
                <p className="font-display text-4xl font-extrabold tnum">54</p>
              </div>
              <div className="text-center">
                <p className="rounded-lg bg-ink-800 px-3 py-1.5 font-display text-xl font-extrabold text-brand-500 tnum">
                  {clock}
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-white/50">
                  {t('home.pulse.quarter', { q: 3 })}
                </p>
              </div>
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate font-display text-lg font-bold">Estrela do Sul</p>
                <p className="font-display text-4xl font-extrabold text-white/70 tnum">49</p>
              </div>
            </div>
            {/* Event feed */}
            <div className="mt-6 border-t border-ink-700 pt-4" aria-live="polite">
              <AnimatePresence initial={false}>
                {feed.map((e) => (
                  <motion.p
                    key={e.id}
                    initial={{ opacity: 0, y: -12, backgroundColor: 'rgba(255,247,240,0.14)' }}
                    animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(255,247,240,0)' }}
                    transition={{ duration: 0.5, ease }}
                    className="flex items-baseline gap-3 rounded px-2 py-1.5 text-[13px]"
                  >
                    <span className="font-mono text-[12px] text-brand-500 tnum">{e.clock}</span>
                    <span className="text-white/80">{e.text}</span>
                  </motion.p>
                ))}
              </AnimatePresence>
            </div>
            <Link
              to="/match-scouting/demo-match"
              className="mt-4 inline-block text-[14px] font-semibold text-brand-500 transition-colors hover:text-brand-600"
            >
              {t('home.pulse.cta')} →
            </Link>
          </motion.div>

          {/* Right column: stat tiles + scout card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease, delay: 0.14 }}
            className="flex flex-col gap-5"
          >
            <div className="grid grid-cols-3 gap-3">
              {tiles.map((tile) => (
                <div key={tile.label} className="rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-600">{tile.label}</p>
                  <p className="mt-1 font-display text-[28px] font-extrabold text-ink-950 tnum">{tile.value}</p>
                  <div className="mt-2 flex h-6 items-end gap-[3px]" aria-hidden>
                    {tile.spark.map((v, i) => (
                      <motion.span
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${(v / Math.max(...tile.spark)) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.04, ease }}
                        className={i === tile.spark.length - 1 ? 'w-full rounded-sm bg-brand-500' : 'w-full rounded-sm bg-paper-100'}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(10,10,11,.05)]">
              <MonogramAvatar name={demoPersonas.scout.name} size={44} />
              <div>
                <p className="text-[13px] font-semibold text-ink-950">
                  {t('home.pulse.scoutCard.title')} — {demoPersonas.scout.name}
                </p>
                <p className="text-[12px] text-ink-600">{t('home.pulse.scoutCard.clips')}</p>
              </div>
              <StatusBadge variant="demo" className="ml-auto" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
