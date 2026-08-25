/**
 * Video components shared by AthleteProfile / ClubProfile / Videos pages:
 * VisibilityChip, VideoThumbCard and a simulated PlayerModal (poster + ken-burns,
 * "demo video" note — no real streams, per design.md videos.md).
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Lock, Pause, Play, X } from 'lucide-react';
import { useI18n, useT } from '@/i18n';
import { formatDuration, getAthlete } from '@/data';
import type { DemoVideo } from '@/data/extra-profiles';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export function VisibilityChip({ visibility, className }: { visibility: DemoVideo['visibility']; className?: string }) {
  const t = useT();
  const styles: Record<DemoVideo['visibility'], string> = {
    public: 'bg-emerald-50 text-success border border-success/30',
    private: 'bg-paper-100 text-ink-600 border border-line',
    scoutsOnly: 'bg-brand-50 text-brand-600 border border-brand-500/30',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]',
        styles[visibility],
        className,
      )}
    >
      {visibility !== 'public' && <Lock size={10} aria-hidden />}
      {t(`videosPage.visibility.${visibility}`)}
    </span>
  );
}

export function VideoThumbCard({
  video,
  onPlay,
  onReport,
  className,
}: {
  video: DemoVideo;
  onPlay: (v: DemoVideo) => void;
  onReport?: (v: DemoVideo) => void;
  className?: string;
}) {
  const t = useT();
  const { formatNumber, formatDate } = useI18n();
  const athlete = video.athleteId ? getAthlete(video.athleteId) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(10,10,11,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onPlay(video)}
        aria-label={`${t('videosPage.card.watch')}: ${video.title}`}
        className="relative block aspect-video w-full overflow-hidden cursor-pointer"
      >
        <img
          src={video.thumb}
          alt={video.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" aria-hidden />
        <span
          className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-950 transition-all duration-200 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white"
          aria-hidden
        >
          <Play size={20} className="ml-0.5" />
        </span>
        <span className="absolute bottom-2 right-2 rounded-md bg-ink-950/70 px-1.5 py-0.5 text-[11px] font-bold text-white tnum" aria-hidden>
          {formatDuration(video.durationSec)}
        </span>
        <span className="absolute left-2 top-2">
          <VisibilityChip visibility={video.visibility} />
        </span>
      </button>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-semibold leading-snug text-ink-950">{video.title}</h3>
          {onReport && (
            <button
              type="button"
              onClick={() => onReport(video)}
              aria-label={t('videosPage.card.report')}
              className="rounded-md p-1 text-ink-600/50 transition-colors hover:bg-paper-100 hover:text-danger cursor-pointer"
            >
              <Flag size={14} aria-hidden />
            </button>
          )}
        </div>
        <p className="mt-1 text-[12px] font-medium text-ink-600">
          {athlete?.name ?? t(`sports.${video.sport}`)}
          {video.kind === 'scoutClip' && video.scoutName
            ? ` · ${t('videosPage.card.byScout', { name: video.scoutName })}`
            : ''}
        </p>
        {video.eventTag && (
          <p className="mt-1 text-[11px] font-semibold text-brand-600 tnum">{video.eventTag}</p>
        )}
        <p className="mt-2 text-[11px] text-ink-600/70 tnum">
          {t('videosPage.card.views', { count: formatNumber(video.views) })} · {formatDate(video.date)}
        </p>
      </div>
    </motion.div>
  );
}

export function PlayerModal({
  video,
  onClose,
  onSelect,
  related,
}: {
  video: DemoVideo | null;
  onClose: () => void;
  onSelect: (v: DemoVideo) => void;
  related: DemoVideo[];
}) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const athlete = video?.athleteId ? getAthlete(video.athleteId) : undefined;

  return (
    <Dialog
      open={video != null}
      onOpenChange={(open) => {
        if (!open) {
          setPlaying(false);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-3xl border-ink-700 bg-ink-950 p-0 text-white sm:rounded-2xl">
        {video && (
          <div>
            <div className="relative aspect-video w-full overflow-hidden bg-ink-900 sm:rounded-t-2xl">
              <motion.img
                src={video.thumb}
                alt={video.title}
                animate={playing ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={playing ? { duration: 16, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
                className="h-full w-full object-cover opacity-80"
              />
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? t('videosPage.player.paused') : t('videosPage.player.playing')}
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-ink-950 transition-colors hover:bg-brand-500 hover:text-white">
                  {playing ? <Pause size={22} aria-hidden /> : <Play size={22} className="ml-0.5" aria-hidden />}
                </span>
              </button>
              <span className="absolute left-3 top-3 rounded-full bg-ink-950/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/80">
                {t('videosPage.player.demoNote')}
              </span>
              <span className="absolute bottom-3 right-3 rounded-md bg-ink-950/70 px-1.5 py-0.5 text-[11px] font-bold text-white tnum">
                {formatDuration(video.durationSec)}
              </span>
            </div>
            <div className="p-5">
              <DialogTitle className="font-display text-lg font-bold text-white">{video.title}</DialogTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <VisibilityChip visibility={video.visibility} />
                <span className="text-[12px] text-white/60 tnum">
                  {t('videosPage.card.views', { count: video.views })}
                </span>
              </div>
              {video.kind === 'scoutClip' && (
                <div className="mt-4 rounded-xl border border-ink-700 bg-ink-900 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/50">
                    {t('videosPage.player.eventInfo')}
                  </p>
                  <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-3">
                    {video.eventTag && (
                      <div>
                        <dt className="text-white/40">{t('videosPage.player.timestamp')}</dt>
                        <dd className="font-semibold text-white tnum">{video.eventTag}</dd>
                      </div>
                    )}
                    {athlete && (
                      <div>
                        <dt className="text-white/40">{t('videosPage.player.athlete')}</dt>
                        <dd className="font-semibold text-white">{athlete.name}</dd>
                      </div>
                    )}
                    {video.scoutName && (
                      <div>
                        <dt className="text-white/40">{t('videosPage.player.scout')}</dt>
                        <dd className="font-semibold text-white">{video.scoutName}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
              {related.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/50">
                    {t('videosPage.player.related')}
                  </p>
                  <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
                    {related.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setPlaying(false);
                          onSelect(r);
                        }}
                        className="w-36 shrink-0 cursor-pointer text-left"
                      >
                        <img src={r.thumb} alt="" loading="lazy" className="aspect-video w-full rounded-lg object-cover" />
                        <span className="mt-1 line-clamp-2 block text-[11px] font-medium text-white/70">{r.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common.close')}
              className="absolute right-3 top-3 rounded-full bg-ink-950/70 p-1.5 text-white/80 transition-colors hover:text-white cursor-pointer"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Convenience wrapper: grid + modal state for a list of videos. */
export function VideoGallery({
  items,
  onReport,
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}: {
  items: DemoVideo[];
  onReport?: (v: DemoVideo) => void;
  columns?: string;
}) {
  const [current, setCurrent] = useState<DemoVideo | null>(null);
  return (
    <>
      <div className={cn('grid gap-5', columns)}>
        {items.map((v) => (
          <VideoThumbCard key={v.id} video={v} onPlay={setCurrent} onReport={onReport} />
        ))}
      </div>
      <PlayerModal
        video={current}
        onClose={() => setCurrent(null)}
        onSelect={setCurrent}
        related={current ? items.filter((v) => v.id !== current.id).slice(0, 4) : []}
      />
    </>
  );
}
