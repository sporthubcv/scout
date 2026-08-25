/**
 * Videos (/videos) — video hub: Highlights / Full Games / Scout Clips with
 * visibility states, simulated player, rights & moderation surface.
 * Design spec: /mnt/agents/output/design/videos.md
 */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Baby, CloudUpload, Eye, Play, Scale, ShieldCheck } from 'lucide-react';
import { useI18n, useT } from '@/i18n';
import { formatDuration, getAthlete } from '@/data';
import type { Sport } from '@/data/types';
import { allVideos } from '@/data/extra-profiles';
import type { DemoVideo, VideoVisibility } from '@/data/extra-profiles';
import TabsUnderline from '@/components/shared/TabsUnderline';
import EmptyState from '@/components/shared/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDemoToast } from '@/components/profiles/DemoToast';
import { VideoGallery, VisibilityChip } from '@/components/profiles/VideoComponents';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const TAB_IDS = ['highlights', 'fullGames', 'scoutClips'] as const;
type TabId = (typeof TAB_IDS)[number];
const KIND_BY_TAB: Record<TabId, DemoVideo['kind']> = {
  highlights: 'highlight',
  fullGames: 'fullGame',
  scoutClips: 'scoutClip',
};

export default function Videos() {
  const t = useT();
  const { formatDate, formatNumber } = useI18n();
  const { toast, show } = useDemoToast();

  const [tab, setTab] = useState<TabId>('highlights');
  const [sport, setSport] = useState<'all' | Sport>('all');
  const [visibility, setVisibility] = useState<'all' | VideoVisibility>('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reporting, setReporting] = useState<DemoVideo | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const featured = useMemo(() => allVideos.filter((v) => v.featured).slice(0, 6), []);
  const items = useMemo(
    () =>
      allVideos.filter((v) => {
        if (v.kind !== KIND_BY_TAB[tab]) return false;
        if (sport !== 'all' && v.sport !== sport) return false;
        if (visibility !== 'all' && v.visibility !== visibility) return false;
        return true;
      }),
    [tab, sport, visibility],
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
      {/* Header */}
      <section className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h1 className="font-display text-[32px] font-extrabold tracking-[-0.015em] text-ink-950 lg:text-[40px]">
            {t('videosPage.header.title')}
          </h1>
          <p className="mt-2 max-w-xl text-[15px] text-ink-600">{t('videosPage.header.sub')}</p>
        </div>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-[14px] font-semibold text-white transition-all hover:bg-brand-600 active:scale-[0.97] cursor-pointer"
        >
          <CloudUpload size={16} aria-hidden />
          {t('videosPage.header.upload')}
        </button>
      </section>

      {/* Featured reel (dark band) */}
      <section className="bg-ink-950 py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl font-bold">{t('videosPage.featured.title')}</h2>
          <div className="relative mt-5">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
              {featured.map((v) => (
                <motion.button
                  key={v.id}
                  type="button"
                  onClick={() => setPlaying(v.id)}
                  initial={{ opacity: 0.85, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, ease }}
                  className="group relative w-[300px] shrink-0 snap-center overflow-hidden rounded-xl border border-ink-700 text-left sm:w-[420px] cursor-pointer"
                >
                  <span className="relative block aspect-video">
                    <img src={v.thumb} alt={v.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" aria-hidden />
                    <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-950 transition-all duration-200 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white" aria-hidden>
                      <Play size={18} className="ml-0.5" />
                    </span>
                    <span className="absolute bottom-2 right-2 rounded-md bg-ink-950/70 px-1.5 py-0.5 text-[11px] font-bold text-white tnum">
                      {formatDuration(v.durationSec)}
                    </span>
                  </span>
                  <span className="block p-3.5">
                    <span className="block truncate text-[13px] font-semibold text-white">
                      {v.athleteId ? getAthlete(v.athleteId)?.name ?? v.title : v.title}
                    </span>
                    {v.eventTag && <span className="mt-0.5 block text-[11px] font-semibold text-brand-500 tnum">{v.eventTag}</span>}
                    <span className="mt-1 flex items-center gap-1.5 text-[11px] text-white/50 tnum">
                      <Eye size={11} aria-hidden />
                      {formatNumber(v.views)} · {formatDate(v.date, { day: 'numeric', month: 'short' })}
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>
            <span className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-ink-950 to-transparent" aria-hidden />
            <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-ink-950 to-transparent" aria-hidden />
          </div>
        </div>
      </section>

      {/* Tabs + filters + grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <TabsUnderline
          id="videos"
          tabs={TAB_IDS.map((tabId) => ({ id: tabId, label: t(`videosPage.tabs.${tabId}`) }))}
          active={tab}
          onChange={(tid) => setTab(tid as TabId)}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {(['all', 'basketball', 'football', 'athletics'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSport(s)}
              className={cn(
                'h-9 rounded-full border px-3.5 text-[12px] font-semibold transition-colors cursor-pointer',
                sport === s ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white text-ink-600 hover:border-ink-950',
              )}
            >
              {s === 'all' ? t('videosPage.filters.all') : t(`sports.${s}`)}
            </button>
          ))}
          <span className="my-1 w-px bg-line" aria-hidden />
          {(['all', 'public', 'private', 'scoutsOnly'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVisibility(v)}
              className={cn(
                'h-9 rounded-full border px-3.5 text-[12px] font-semibold transition-colors cursor-pointer',
                visibility === v ? 'border-ink-950 bg-ink-950 text-white' : 'border-line bg-white text-ink-600 hover:border-ink-950',
              )}
            >
              {v === 'all' ? t('videosPage.filters.visibility') : t(`videosPage.visibility.${v}`)}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div key={`${tab}-${sport}-${visibility}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {items.length === 0 ? (
                <EmptyState useIllustration title={t('videosPage.empty.title')} body={t('videosPage.empty.body')} />
              ) : (
                <VideoGallery items={items} onReport={setReporting} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Rights & moderation */}
      <section className="bg-paper-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 font-display text-[26px] font-extrabold tracking-[-0.015em] text-ink-950">
            {t('videosPage.rights.title')}
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {(
              [
                { icon: Scale, title: t('videosPage.rights.card1Title'), body: t('videosPage.rights.card1Body') },
                { icon: ShieldCheck, title: t('videosPage.rights.card2Title'), body: t('videosPage.rights.card2Body') },
                { icon: Baby, title: t('videosPage.rights.card3Title'), body: t('videosPage.rights.card3Body') },
              ] as const
            ).map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)]"
              >
                <c.icon size={26} strokeWidth={1.75} className="text-brand-500" aria-hidden />
                <h3 className="mt-3 font-display text-[17px] font-bold text-ink-950">{c.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload modal */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{t('videosPage.upload.title')}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setUploadOpen(false);
              show(t('videosPage.upload.submitted'));
            }}
          >
            <div className="flex h-28 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-paper-50 text-ink-600">
              <CloudUpload size={22} strokeWidth={1.5} aria-hidden />
              <span className="text-[12px]">{t('videosPage.upload.dropzone')}</span>
            </div>
            <label className="block text-[12px] font-semibold text-ink-950">
              {t('videosPage.upload.fieldTitle')}
              <input required className="mt-1 h-10 w-full rounded-lg border border-line px-3 text-[13px] font-normal" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-[12px] font-semibold text-ink-950">
                {t('videosPage.upload.fieldType')}
                <select className="mt-1 h-10 w-full rounded-lg border border-line bg-white px-2 text-[13px] font-normal">
                  <option>{t('videosPage.tabs.highlights')}</option>
                  <option>{t('videosPage.tabs.fullGames')}</option>
                  <option>{t('videosPage.tabs.scoutClips')}</option>
                </select>
              </label>
              <label className="block text-[12px] font-semibold text-ink-950">
                {t('videosPage.upload.fieldVisibility')}
                <select className="mt-1 h-10 w-full rounded-lg border border-line bg-white px-2 text-[13px] font-normal">
                  <option>{t('videosPage.visibility.public')}</option>
                  <option>{t('videosPage.visibility.private')}</option>
                  <option>{t('videosPage.visibility.scoutsOnly')}</option>
                </select>
              </label>
            </div>
            <label className="flex items-center gap-2 text-[13px] font-medium text-ink-950">
              <input type="checkbox" className="h-4 w-4 accent-brand-500" />
              {t('videosPage.upload.guardianConsent')}
            </label>
            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-brand-500 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600 cursor-pointer"
            >
              {t('videosPage.upload.submit')}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Report modal */}
      <Dialog open={reporting != null} onOpenChange={(o) => !o && setReporting(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{t('videosPage.report.title')}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setReporting(null);
              show(t('videosPage.report.submitted'));
            }}
          >
            <p className="text-[13px] text-ink-600">{reporting?.title}</p>
            <label className="block text-[12px] font-semibold text-ink-950">
              {t('videosPage.report.reason')}
              <select required className="mt-1 h-10 w-full rounded-lg border border-line bg-white px-2 text-[13px] font-normal">
                <option value="inappropriate">{t('videosPage.report.reasons.inappropriate')}</option>
                <option value="rights">{t('videosPage.report.reasons.rights')}</option>
                <option value="privacy">{t('videosPage.report.reasons.privacy')}</option>
                <option value="other">{t('videosPage.report.reasons.other')}</option>
              </select>
            </label>
            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-danger text-[14px] font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
            >
              {t('videosPage.report.submit')}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Featured reel quick player (reuses the poster dialog via grid components for tab videos;
          featured reel opens a lightweight poster overlay) */}
      <Dialog open={playing != null} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-3xl border-ink-700 bg-ink-950 p-0 text-white sm:rounded-2xl">
          {playing &&
            (() => {
              const v = allVideos.find((x) => x.id === playing);
              if (!v) return null;
              return (
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-ink-900 sm:rounded-t-2xl">
                    <img src={v.thumb} alt={v.title} className="h-full w-full object-cover opacity-80" />
                    <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-950" aria-hidden>
                      <Play size={22} className="ml-0.5" />
                    </span>
                    <span className="absolute left-3 top-3 rounded-full bg-ink-950/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/80">
                      {t('videosPage.player.demoNote')}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="font-display text-lg font-bold text-white">{v.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <VisibilityChip visibility={v.visibility} />
                      {v.eventTag && <span className="text-[12px] font-semibold text-brand-500 tnum">{v.eventTag}</span>}
                    </div>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>

      {toast}
    </motion.div>
  );
}
