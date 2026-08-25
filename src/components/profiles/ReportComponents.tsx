/**
 * Scout report components shared by AthleteProfile and ScoutProfile:
 * RecommendationChip, EvaluationBars (x/10) and ScoutReportCard.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, Check, ChevronDown } from 'lucide-react';
import { useI18n, useT } from '@/i18n';
import type { ScoutReport } from '@/data/types';
import { getScout } from '@/data';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import { cn } from '@/lib/utils';

export function RecommendationChip({
  recommendation,
  className,
}: {
  recommendation: ScoutReport['recommendation'];
  className?: string;
}) {
  const t = useT();
  const map: Record<ScoutReport['recommendation'], { key: string; cls: string }> = {
    sign: { key: 'highPotential', cls: 'bg-brand-500 text-white' },
    shortlist: { key: 'shortlist', cls: 'bg-ink-950 text-white' },
    follow: { key: 'follow', cls: 'border border-info/40 bg-blue-50 text-info' },
    monitor: { key: 'monitor', cls: 'border border-line bg-paper-100 text-ink-600' },
  };
  const { key, cls } = map[recommendation];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]',
        cls,
        className,
      )}
    >
      {t(`athleteProfile.recommendation.${key}`)}
    </span>
  );
}

export interface EvalScores {
  technical: number;
  decision: number;
  defense?: number;
  athleticism: number;
  potential: number;
}

/** x/10 evaluation bars; dark variant for the dark scout card on profiles. */
export function EvaluationBars({ scores, dark = false }: { scores: EvalScores; dark?: boolean }) {
  const t = useT();
  const rows: { label: string; value: number }[] = [
    { label: t('athleteProfile.attr.technique'), value: scores.technical },
    { label: t('athleteProfile.attr.decision'), value: scores.decision },
    ...(scores.defense != null ? [{ label: t('athleteProfile.attr.defense'), value: scores.defense }] : []),
    { label: t('athleteProfile.attr.athleticism'), value: scores.athleticism },
    { label: t('athleteProfile.attr.potential'), value: scores.potential },
  ];
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className={cn('w-32 shrink-0 text-[12px] font-medium', dark ? 'text-white/60' : 'text-ink-600')}>
            {r.label}
          </span>
          <span className={cn('h-1.5 flex-1 overflow-hidden rounded-full', dark ? 'bg-ink-700' : 'bg-paper-100')}>
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: `${r.value * 10}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className={cn('block h-full rounded-full', i === rows.length - 1 ? 'bg-brand-500' : dark ? 'bg-white' : 'bg-ink-950')}
            />
          </span>
          <span className={cn('w-8 text-right font-display text-[13px] font-extrabold tnum', dark ? 'text-white' : 'text-ink-950')}>
            {r.value.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ScoutReportCard({
  report,
  pinned = false,
  defaultExpanded = false,
}: {
  report: ScoutReport;
  pinned?: boolean;
  defaultExpanded?: boolean;
}) {
  const t = useT();
  const { locale, formatDate } = useI18n();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const scout = getScout(report.scoutId);
  const summary = locale === 'en' ? report.summaryEn : report.summaryPt;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-xl border bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]',
        pinned ? 'border-brand-500/50' : 'border-line',
      )}
    >
      {pinned && (
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-600">
          {t('scoutProfile.reports.pinned')}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MonogramAvatar name={scout?.name ?? '?'} size={40} />
          <div>
            <p className="flex items-center gap-1.5 text-[14px] font-semibold text-ink-950">
              {scout?.name}
              {scout?.verified && <BadgeCheck size={14} className="text-brand-500" aria-label={t('athleteProfile.reports.verifiedScout')} />}
            </p>
            <p className="text-[12px] text-ink-600 tnum">
              {formatDate(report.date)} · {t('athleteProfile.reports.matchContext')}: {report.matchId === 'demo-match' ? 'Inter Liceu 2027 · J6' : report.matchId}
            </p>
          </div>
        </div>
        <RecommendationChip recommendation={report.recommendation} />
      </div>

      <p className="mt-4 text-[14px] leading-relaxed text-ink-600">{summary}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-600">
            {t('athleteProfile.reports.strengths')}
          </p>
          <ul className="mt-2 space-y-1.5">
            {report.strengths.map((s) => (
              <li key={s} className="flex items-center gap-2 text-[13px] text-ink-950">
                <Check size={14} className="text-success" aria-hidden /> {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-600">
            {t('athleteProfile.reports.devAreas')}
          </p>
          <ul className="mt-2 space-y-1.5">
            {report.weaknesses.map((w) => (
              <li key={w} className="flex items-center gap-2 text-[13px] text-ink-950">
                <ArrowUpRight size={14} className="text-brand-500" aria-hidden /> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-500 cursor-pointer"
      >
        {expanded ? t('athleteProfile.reports.readLess') : t('athleteProfile.reports.readMore')}
        <ChevronDown size={14} className={cn('transition-transform', expanded && 'rotate-180')} aria-hidden />
      </button>
      {expanded && (
        <p className="mt-2 border-t border-line pt-3 text-[13px] leading-relaxed text-ink-600">
          {summary} — Grade {report.grade}. {t('athleteProfile.reports.visibilityNote')}
        </p>
      )}
    </motion.article>
  );
}
