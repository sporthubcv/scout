/**
 * Discover (/discover) — global search + advanced filters across athletes,
 * clubs, scouts, competitions and opportunities. Filter state lives in the
 * URL query params (shareable). Design spec: design/discover.md.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  BookmarkCheck,
  BookmarkPlus,
  ChevronDown,
  Clock,
  Info,
  Search,
  X,
} from 'lucide-react';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils';
import type { AthleteProfile, Club, Competition, Opportunity, ScoutProfile, Sport } from '@/data';
import { clubs, getClub, opportunities, scouts, videos } from '@/data';
import {
  ISLANDS,
  OPEN_TO_TRANSFER,
  POSITION_OPTIONS,
  VERIFIED_COMPETITIONS,
  ageGroupOf,
  demoAge,
  featuredSearches,
  publicAthletes,
  publicCompetitions,
} from '@/data/extra-public';
import AthleteCard from '@/components/shared/AthleteCard';
import EmptyState from '@/components/shared/EmptyState';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import OvrSquare from '@/components/shared/OvrSquare';
import SponsorSlot from '@/components/shared/SponsorSlot';
import StatusBadge from '@/components/shared/StatusBadge';
import { useDemoToast } from '@/components/shared/DemoToast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const SPORTS: Sport[] = ['basketball', 'football', 'athletics'];
const AGE_GROUPS = ['u14', 'u16', 'u18', 'u21', 'senior'] as const;
const VERIF_OPTIONS = ['verified', 'statsVerified', 'withVideos', 'openToTransfer'] as const;
const SEASONS = ['2026/27', '2025/26'];
const TABS = ['all', 'athletes', 'clubs', 'scouts', 'competitions', 'opportunities'] as const;
type TabId = (typeof TABS)[number];

const RECENT_KEY = 'shs-recent-searches';
const SAVED_KEY = 'shs-saved-searches';
const FOLLOW_KEY = 'shs-following';

function readLS(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
function writeLS(key: string, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const csv = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);

/* ------------------------- filter primitives ------------------------ */

function FilterButton({ label, count }: { label: string; count?: number }) {
  return (
    <span
      className={cn(
        'inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors',
        count
          ? 'border-ink-950 bg-ink-950 text-white'
          : 'border-line bg-white text-ink-950 hover:border-ink-950/40',
      )}
    >
      {label}
      {count ? (
        <span className="rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white tnum">{count}</span>
      ) : (
        <ChevronDown size={14} className="text-ink-600" aria-hidden />
      )}
    </span>
  );
}

function MultiFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button">
          <FilterButton label={label} count={selected.length} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-medium text-ink-950 hover:bg-paper-50"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) =>
                    onChange(c ? [...selected, opt.value] : selected.filter((v) => v !== opt.value))
                  }
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SliderFilter({
  label,
  min,
  max,
  value,
  unit,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number | null;
  unit?: string;
  onChange: (v: number | null) => void;
}) {
  const [local, setLocal] = useState(value ?? min);
  useEffect(() => setLocal(value ?? min), [value, min]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button">
          <FilterButton label={value != null ? `${label}: ${value}${unit ?? ''}` : label} count={value != null ? 1 : 0} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-4">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-600">
          {label}: <span className="text-ink-950 tnum">{local}{unit ?? ''}</span>
        </p>
        <Slider
          min={min}
          max={max}
          step={1}
          value={[local]}
          onValueChange={([v]) => setLocal(v)}
          onValueCommit={([v]) => onChange(v <= min ? null : v)}
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={label}
          className="mt-3 inline-flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-ink-600 hover:text-ink-950"
        >
          <X size={12} aria-hidden />
        </button>
      </PopoverContent>
    </Popover>
  );
}

/* ----------------------------- entity cards ------------------------- */

function ClubCard({ club }: { club: Club }) {
  const t = useT();
  return (
    <Link
      to={`/clubs/${club.id}`}
      className="group block rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <MonogramAvatar name={club.name} size={52} />
        {club.verified && <StatusBadge variant="verifiedProfile" />}
      </div>
      <h3 className="mt-3 font-display text-lg font-bold text-ink-950">{club.name}</h3>
      <p className="mt-0.5 text-[13px] text-ink-600">
        {club.city}, {club.island}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {club.sports.map((s) => (
          <span key={s} className="rounded-full bg-paper-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
            {t(`sports.${s}`)}
          </span>
        ))}
      </div>
      <p className="mt-3 border-t border-line pt-3 text-[12px] font-medium text-ink-600 tnum">
        {t('discover.clubMeta', { count: club.athleteIds.length })}
      </p>
    </Link>
  );
}

function ScoutCard({ scout }: { scout: ScoutProfile }) {
  const t = useT();
  return (
    <Link
      to={`/scouts/${scout.id}`}
      className="group block rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <MonogramAvatar name={scout.name} size={52} />
        {scout.verified && <StatusBadge variant="verifiedProfile" />}
      </div>
      <h3 className="mt-3 font-display text-lg font-bold text-ink-950">{scout.name}</h3>
      <p className="mt-0.5 text-[13px] text-ink-600">{scout.organization}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {scout.specialties.map((s) => (
          <span key={s} className="rounded-full bg-paper-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
            {t(`sports.${s}`)}
          </span>
        ))}
      </div>
      <p className="mt-3 border-t border-line pt-3 text-[12px] font-medium text-ink-600 tnum">
        {t('discover.scoutMeta', { count: scout.athletesWatched })} · {scout.island}
      </p>
    </Link>
  );
}

function CompetitionMiniCard({ comp }: { comp: Competition }) {
  const t = useT();
  return (
    <Link
      to={`/competitions/${comp.id}`}
      className="group block rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-paper-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
          {t(`sports.${comp.sport}`)}
        </span>
        {comp.status === 'live' ? (
          <StatusBadge variant="live" />
        ) : (
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
            {t(`competitionsPage.status.${comp.status}`)}
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink-950">{comp.name}</h3>
      <p className="mt-0.5 text-[13px] text-ink-600">
        {comp.season} · {comp.island}
      </p>
      <p className="mt-3 border-t border-line pt-3 text-[12px] font-medium text-ink-600 tnum">
        {t('competitionsPage.card.teams', { count: comp.teamsCount })}
        {VERIFIED_COMPETITIONS.has(comp.id) && (
          <span className="ml-2 inline-flex items-center gap-1 text-success">
            <BadgeCheck size={12} aria-hidden />
            {t('competitionsPage.verifiedBadge')}
          </span>
        )}
      </p>
    </Link>
  );
}

function OpportunityCard({ op }: { op: Opportunity }) {
  const t = useT();
  return (
    <Link
      to="/opportunities"
      className="group block rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,10,11,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[0_8px_24px_rgba(10,10,11,.08)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-brand-600">
          {t(`discover.opportunityTypes.${op.type}`)}
        </span>
        <span className="rounded-full bg-paper-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600">
          {t(`sports.${op.sport}`)}
        </span>
      </div>
      <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink-950">{op.title}</h3>
      <p className="mt-0.5 text-[13px] text-ink-600">{op.organization}</p>
      <p className="mt-3 border-t border-line pt-3 text-[12px] font-medium text-ink-600 tnum">
        {op.ageGroup} · {op.location} · {t('discover.opportunityMeta.deadline')}: {op.deadline}
      </p>
    </Link>
  );
}

/* -------------------------------- page ------------------------------ */

export default function Discover() {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast, toastNode } = useDemoToast();

  const q = searchParams.get('q') ?? '';
  const tab = (searchParams.get('tab') ?? 'all') as TabId;
  const fSports = csv(searchParams.get('sports')) as Sport[];
  const fAges = csv(searchParams.get('ages'));
  const fPos = csv(searchParams.get('pos'));
  const fIslands = csv(searchParams.get('islands'));
  const fVerif = csv(searchParams.get('verif'));
  const fSeason = searchParams.get('season') ?? '';
  const fOvr = searchParams.get('ovr') ? Number(searchParams.get('ovr')) : null;
  const fPot = searchParams.get('pot') ? Number(searchParams.get('pot')) : null;
  const fHeight = searchParams.get('h') ? Number(searchParams.get('h')) : null;
  const fMinStat = searchParams.get('minstat') ? Number(searchParams.get('minstat')) : null;
  const sort = searchParams.get('sort') ?? 'relevance';
  const view = searchParams.get('view') ?? 'grid';

  const updateParams = useCallback(
    (updates: Record<string, string | null>, replace = false) => {
      const next = new URLSearchParams(searchParams);
      for (const [k, v] of Object.entries(updates)) {
        if (v == null || v === '') next.delete(k);
        else next.set(k, v);
      }
      setSearchParams(next, { replace });
    },
    [searchParams, setSearchParams],
  );

  /* search input with debounce + ⌘K */
  const [query, setQuery] = useState(q);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setQuery(q), [q]);
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (query !== q) updateParams({ q: query || null }, true);
    }, 250);
    return () => window.clearTimeout(id);
  }, [query, q, updateParams]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const [recent, setRecent] = useState<string[]>(() => readLS(RECENT_KEY));
  const commitSearch = () => {
    const value = query.trim();
    if (!value) return;
    const next = [value, ...recent.filter((r) => r !== value)].slice(0, 5);
    setRecent(next);
    writeLS(RECENT_KEY, next);
    updateParams({ q: value });
  };

  /* follow athlete (demo) */
  const [following, setFollowing] = useState<string[]>(() => readLS(FOLLOW_KEY));
  const toggleFollow = (a: AthleteProfile) => {
    const isFollowing = following.includes(a.id);
    const next = isFollowing ? following.filter((id) => id !== a.id) : [...following, a.id];
    setFollowing(next);
    writeLS(FOLLOW_KEY, next);
    toast(t(isFollowing ? 'discover.unfollowToast' : 'discover.followToast', { name: a.name }));
  };

  /* simulated fetch on filter commit */
  const paramsKey = searchParams.toString();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), 400);
    return () => window.clearTimeout(id);
  }, [paramsKey]);

  /* ------------------------- filtering ----------------------------- */
  const queryLc = q.trim().toLowerCase();
  const matchesQ = (parts: (string | undefined)[]) =>
    !queryLc || parts.some((p) => p?.toLowerCase().includes(queryLc));

  const results = useMemo(() => {
    const athleteHits = publicAthletes.filter((a) => {
      const club = a.clubId ? getClub(a.clubId) : undefined;
      if (!matchesQ([a.name, club?.name, a.city, a.island, a.position])) return false;
      if (fSports.length && !fSports.includes(a.sport)) return false;
      if (fAges.length && !fAges.includes(ageGroupOf(a))) return false;
      if (fPos.length && !fPos.some((p) => a.position.toLowerCase().includes(p.toLowerCase()))) return false;
      if (fIslands.length && !fIslands.includes(a.island)) return false;
      if (fOvr != null && a.ovr.value < fOvr) return false;
      if (fPot != null && a.pot < fPot) return false;
      if (fHeight != null && (a.heightCm ?? 0) < fHeight) return false;
      if (fMinStat != null) {
        const n = parseFloat(a.keyStat.value);
        if (Number.isNaN(n) || n < fMinStat) return false;
      }
      if (fVerif.length) {
        const ok = fVerif.some((v) => {
          if (v === 'verified') return a.verification === 'verified';
          if (v === 'statsVerified') return a.statsVerified;
          if (v === 'withVideos') return videos.some((vid) => vid.athleteId === a.id);
          if (v === 'openToTransfer') return OPEN_TO_TRANSFER.has(a.id);
          return false;
        });
        if (!ok) return false;
      }
      return true;
    });

    const sorters: Record<string, (a: AthleteProfile, b: AthleteProfile) => number> = {
      relevance: (a, b) => b.ovr.value - a.ovr.value,
      ovrDesc: (a, b) => b.ovr.value - a.ovr.value,
      potDesc: (a, b) => b.pot - a.pot,
      recent: (a, b) => b.ovr.date.localeCompare(a.ovr.date) || b.id.localeCompare(a.id),
    };
    athleteHits.sort(sorters[sort] ?? sorters.relevance);

    const clubHits = clubs.filter((c) => {
      if (!matchesQ([c.name, c.city, c.island])) return false;
      if (fSports.length && !c.sports.some((s) => fSports.includes(s))) return false;
      if (fIslands.length && !fIslands.includes(c.island)) return false;
      if (fVerif.length && fVerif.includes('verified') && !c.verified) return false;
      return true;
    });

    const scoutHits = scouts.filter((s) => {
      if (!matchesQ([s.name, s.organization, s.island])) return false;
      if (fSports.length && !s.specialties.some((sp) => fSports.includes(sp))) return false;
      if (fIslands.length && !fIslands.includes(s.island)) return false;
      if (fVerif.length && fVerif.includes('verified') && !s.verified) return false;
      return true;
    });

    const compHits = publicCompetitions.filter((c) => {
      if (!matchesQ([c.name, c.island, c.organizer])) return false;
      if (fSports.length && !fSports.includes(c.sport)) return false;
      if (fIslands.length && !fIslands.includes(c.island)) return false;
      if (fSeason && c.season !== fSeason) return false;
      if (fVerif.length && fVerif.includes('verified') && !VERIFIED_COMPETITIONS.has(c.id)) return false;
      return true;
    });

    const opHits = opportunities.filter((o) => {
      if (!matchesQ([o.title, o.organization, o.location])) return false;
      if (fSports.length && !fSports.includes(o.sport)) return false;
      return true;
    });

    return {
      athletes: athleteHits,
      clubs: clubHits,
      scouts: scoutHits,
      competitions: compHits,
      opportunities: opHits,
      total: athleteHits.length + clubHits.length + scoutHits.length + compHits.length + opHits.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, sort]);

  /* active filter chips */
  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  fSports.forEach((s) =>
    activeChips.push({ key: `s-${s}`, label: t(`sports.${s}`), clear: () => updateParams({ sports: fSports.filter((x) => x !== s).join(',') || null }) }),
  );
  fAges.forEach((a) =>
    activeChips.push({ key: `a-${a}`, label: t(`discover.ageGroups.${a}`), clear: () => updateParams({ ages: fAges.filter((x) => x !== a).join(',') || null }) }),
  );
  fPos.forEach((p) =>
    activeChips.push({ key: `p-${p}`, label: p, clear: () => updateParams({ pos: fPos.filter((x) => x !== p).join(',') || null }) }),
  );
  fIslands.forEach((i) =>
    activeChips.push({ key: `i-${i}`, label: i, clear: () => updateParams({ islands: fIslands.filter((x) => x !== i).join(',') || null }) }),
  );
  fVerif.forEach((v) =>
    activeChips.push({ key: `v-${v}`, label: t(`discover.verificationOptions.${v}`), clear: () => updateParams({ verif: fVerif.filter((x) => x !== v).join(',') || null }) }),
  );
  if (fSeason) activeChips.push({ key: 'season', label: fSeason, clear: () => updateParams({ season: null }) });
  if (fOvr != null) activeChips.push({ key: 'ovr', label: `OVR ≥ ${fOvr}`, clear: () => updateParams({ ovr: null }) });
  if (fPot != null) activeChips.push({ key: 'pot', label: `POT ≥ ${fPot}`, clear: () => updateParams({ pot: null }) });
  if (fHeight != null) activeChips.push({ key: 'h', label: `≥ ${fHeight} cm`, clear: () => updateParams({ h: null }) });
  if (fMinStat != null) activeChips.push({ key: 'minstat', label: `${t('discover.filterMinStat', { label: 'stat' })} ${fMinStat}`, clear: () => updateParams({ minstat: null }) });

  const clearAll = () => {
    setQuery('');
    setSearchParams(new URLSearchParams(tab !== 'all' ? { tab } : {}));
  };

  const saveSearch = () => {
    const saved = readLS(SAVED_KEY);
    const name = query.trim() || `#${saved.length + 1}`;
    writeLS(SAVED_KEY, [...saved, `${name}::${paramsKey}`].slice(-10));
    toast(t('discover.searchSaved'));
  };

  /* position options depend on selected sports (default: all sports) */
  const posOptions = (fSports.length ? fSports : SPORTS).flatMap((s) => POSITION_OPTIONS[s]).filter((v, i, arr) => arr.indexOf(v) === i);

  const filtersControls = (
    <>
      <MultiFilter
        label={t('common.sport')}
        options={SPORTS.map((s) => ({ value: s, label: t(`sports.${s}`) }))}
        selected={fSports}
        onChange={(v) => updateParams({ sports: v.join(',') || null })}
      />
      <MultiFilter
        label={t('discover.filterAge')}
        options={AGE_GROUPS.map((a) => ({ value: a, label: t(`discover.ageGroups.${a}`) }))}
        selected={fAges}
        onChange={(v) => updateParams({ ages: v.join(',') || null })}
      />
      <MultiFilter
        label={t('discover.filterPosition')}
        options={posOptions.map((p) => ({ value: p, label: p }))}
        selected={fPos}
        onChange={(v) => updateParams({ pos: v.join(',') || null })}
      />
      <MultiFilter
        label={t('discover.filterIsland')}
        options={ISLANDS.map((i) => ({ value: i, label: i }))}
        selected={fIslands}
        onChange={(v) => updateParams({ islands: v.join(',') || null })}
      />
      <SliderFilter label={t('discover.filterOvr')} min={40} max={99} value={fOvr} onChange={(v) => updateParams({ ovr: v == null ? null : String(v) })} />
      <SliderFilter label={t('discover.filterPot')} min={40} max={99} value={fPot} onChange={(v) => updateParams({ pot: v == null ? null : String(v) })} />
      <SliderFilter label={t('discover.filterHeight')} min={150} max={210} value={fHeight} unit=" cm" onChange={(v) => updateParams({ h: v == null ? null : String(v) })} />
      <SliderFilter label={t('discover.filterMinStat', { label: 'min' })} min={0} max={25} value={fMinStat} onChange={(v) => updateParams({ minstat: v == null ? null : String(v) })} />
      <MultiFilter
        label={t('discover.filterVerification')}
        options={VERIF_OPTIONS.map((v) => ({ value: v, label: t(`discover.verificationOptions.${v}`) }))}
        selected={fVerif}
        onChange={(v) => updateParams({ verif: v.join(',') || null })}
      />
      <MultiFilter
        label={t('common.season')}
        options={SEASONS.map((s) => ({ value: s, label: s }))}
        selected={fSeason ? [fSeason] : []}
        onChange={(v) => updateParams({ season: v[v.length - 1] ?? null })}
      />
    </>
  );

  const counts: Record<TabId, number> = {
    all: results.total,
    athletes: results.athletes.length,
    clubs: results.clubs.length,
    scouts: results.scouts.length,
    competitions: results.competitions.length,
    opportunities: results.opportunities.length,
  };

  const tabLabel = (id: TabId) =>
    id === 'all' ? t('discover.tabAll') : t(`discover.sections.${id}`);

  const athleteListRow = (a: AthleteProfile) => {
    const club = a.clubId ? getClub(a.clubId) : undefined;
    return (
      <motion.div key={a.id} layout="position" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
        <Link
          to={`/athletes/${a.id}`}
          className="flex h-14 items-center gap-3 border-b border-line px-3 transition-colors hover:bg-paper-50 active:bg-brand-50"
        >
          <span className="w-8 shrink-0 font-display text-[15px] font-extrabold text-ink-950 tnum">
            <OvrSquare value={a.ovr.value} size={30} />
          </span>
          <MonogramAvatar name={a.name} size={36} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-[14px] font-semibold text-ink-950">
              {a.name}
              {a.verification === 'verified' && <BadgeCheck size={13} className="shrink-0 text-brand-500" aria-hidden />}
            </p>
            <p className="truncate text-[12px] text-ink-600">
              {t(`sports.${a.sport}`)} · {a.position} · {club?.name ?? '—'}
            </p>
          </div>
          <span className="hidden text-[12px] text-ink-600 sm:block tnum">
            {demoAge(a)} · {a.island}
          </span>
          <span className="font-display text-[14px] font-extrabold text-ink-950 tnum">
            {a.keyStat.value} <span className="text-[10px] font-bold uppercase text-ink-600">{a.keyStat.label}</span>
          </span>
        </Link>
      </motion.div>
    );
  };

  const athleteGrid = (list: AthleteProfile[]) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {list.map((a, i) => (
          <motion.div
            key={a.id}
            layout="position"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
            className="relative"
          >
            <AthleteCard athlete={a} />
            <button
              type="button"
              onClick={() => toggleFollow(a)}
              aria-label={t('discover.follow')}
              className={cn(
                'absolute left-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow transition-colors hover:bg-white',
                following.includes(a.id) ? 'text-brand-500' : 'text-ink-600',
              )}
            >
              {following.includes(a.id) ? <BookmarkCheck size={17} aria-hidden /> : <BookmarkPlus size={17} aria-hidden />}
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  const skeletonGrid = (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-line">
          <div className="aspect-[4/5] animate-shimmer bg-paper-100" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-shimmer rounded bg-paper-100" />
            <div className="h-3 w-1/2 animate-shimmer rounded bg-paper-100" />
          </div>
        </div>
      ))}
    </div>
  );

  const sectionHeader = (id: TabId, count: number) => (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display text-[20px] font-bold text-ink-950">
        {tabLabel(id)} <span className="ml-1 text-[14px] font-semibold text-ink-600 tnum">{count}</span>
      </h2>
      {tab === 'all' && (
        <button
          type="button"
          onClick={() => updateParams({ tab: id })}
          className="cursor-pointer text-[13px] font-semibold text-brand-600 hover:text-brand-500"
        >
          {t('common.viewAll')} →
        </button>
      )}
    </div>
  );

  const showSection = (id: TabId) => tab === 'all' || tab === id;

  return (
    <div>
      {/* Section 1 — search header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="border-b border-line bg-paper-50 py-10"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-600">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
            {t('discover.eyebrow')}
          </p>
          <h1 className="font-display text-[32px] font-extrabold tracking-[-0.02em] text-ink-950 lg:text-[44px]">
            {t('discover.title')}
          </h1>

          <div className="mt-6 flex h-14 items-center gap-3 rounded-xl border border-line bg-white px-4 shadow-[0_1px_2px_rgba(10,10,11,.05)] focus-within:border-ink-950">
            <Search size={20} className="shrink-0 text-ink-600" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commitSearch()}
              placeholder={t('discover.searchPlaceholder')}
              className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink-950 outline-none placeholder:text-ink-600/60"
              aria-label={t('common.search')}
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); updateParams({ q: null }); }} aria-label={t('common.close')} className="cursor-pointer text-ink-600 hover:text-ink-950">
                <X size={16} aria-hidden />
              </button>
            )}
            <kbd className="hidden shrink-0 rounded-md border border-line bg-paper-50 px-2 py-1 text-[11px] font-bold text-ink-600 sm:block">⌘K</kbd>
          </div>

          {!query && recent.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold text-ink-600">{t('discover.recentSearches')}:</span>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setQuery(r); updateParams({ q: r }); }}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[12px] font-medium text-ink-950 hover:border-ink-950"
                >
                  <Clock size={12} className="text-ink-600" aria-hidden />
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* entity tabs */}
          <div className="mt-6 flex gap-6 overflow-x-auto border-b border-line">
            {TABS.map((id) => {
              const isActive = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => updateParams({ tab: id === 'all' ? null : id })}
                  className={cn(
                    'relative cursor-pointer whitespace-nowrap pb-3 text-[14px] font-semibold transition-colors',
                    isActive ? 'text-ink-950' : 'text-ink-600 hover:text-ink-950',
                  )}
                >
                  {tabLabel(id)} <span className="tnum text-[12px] text-ink-600">{counts[id]}</span>
                  {isActive && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-brand-500" aria-hidden />}
                </button>
              );
            })}
          </div>
        </div>
      </motion.header>

      {/* Section 2 — sticky filter bar */}
      <div className="sticky top-16 z-30 border-b border-line bg-white py-3">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden items-center gap-2 md:flex">{filtersControls}</div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button type="button">
                  <FilterButton label={t('discover.filters')} count={activeChips.length} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{t('discover.filters')}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col items-start gap-3 p-4">{filtersControls}</div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-3 pl-2">
            <button type="button" onClick={saveSearch} className="hidden cursor-pointer text-[13px] font-semibold text-ink-600 hover:text-ink-950 sm:block">
              {t('discover.saveSearch')}
            </button>
            <button type="button" onClick={clearAll} className="cursor-pointer text-[13px] font-semibold text-brand-600 hover:text-brand-500">
              {t('common.clearFilters')}
            </button>
          </div>
        </div>
        {activeChips.length > 0 && (
          <div className="mx-auto mt-2 flex max-w-[1440px] flex-wrap items-center gap-2 px-4 sm:px-6 lg:px-8">
            <AnimatePresence>
              {activeChips.map((chip) => (
                <motion.button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-brand-100 px-3 text-[12px] font-semibold text-brand-600"
                >
                  {chip.label}
                  <X size={12} aria-hidden />
                </motion.button>
              ))}
            </AnimatePresence>
            <span className="text-[12px] font-semibold text-ink-600 tnum">{t('discover.results', { count: results.total })}</span>
          </div>
        )}
      </div>

      {/* Section 3 — results */}
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <div className="min-w-0 flex-1">
            {/* toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[14px] font-semibold text-ink-950 tnum">{t('discover.results', { count: results.total })}</p>
              <div className="flex items-center gap-2">
                <label className="text-[12px] font-semibold text-ink-600">{t('discover.sortLabel')}</label>
                <select
                  value={sort}
                  onChange={(e) => updateParams({ sort: e.target.value === 'relevance' ? null : e.target.value })}
                  className="h-9 cursor-pointer rounded-lg border border-line bg-white px-2 text-[13px] font-medium text-ink-950"
                >
                  {(['relevance', 'ovrDesc', 'potDesc', 'recent'] as const).map((s) => (
                    <option key={s} value={s}>{t(`discover.sort.${s}`)}</option>
                  ))}
                </select>
                <div className="flex rounded-lg border border-line p-0.5">
                  {(['grid', 'list'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => updateParams({ view: v === 'grid' ? null : v })}
                      className={cn(
                        'h-8 cursor-pointer rounded-md px-3 text-[12px] font-semibold',
                        view === v ? 'bg-ink-950 text-white' : 'text-ink-600 hover:text-ink-950',
                      )}
                    >
                      {t(`discover.view.${v}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              skeletonGrid
            ) : results.total === 0 ? (
              <EmptyState
                useIllustration
                title={t('discover.empty.title')}
                body={t('discover.empty.body')}
                ctaLabel={t('common.clearFilters')}
                onCta={clearAll}
              />
            ) : (
              <div className="space-y-12">
                {showSection('athletes') && results.athletes.length > 0 && (
                  <section>
                    {sectionHeader('athletes', counts.athletes)}
                    {view === 'list' ? (
                      <div className="overflow-hidden rounded-xl border border-line bg-white">
                        <AnimatePresence mode="popLayout">{results.athletes.map(athleteListRow)}</AnimatePresence>
                      </div>
                    ) : (
                      athleteGrid(tab === 'all' ? results.athletes.slice(0, 4) : results.athletes)
                    )}
                  </section>
                )}
                {showSection('clubs') && results.clubs.length > 0 && (
                  <section>
                    {sectionHeader('clubs', counts.clubs)}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {(tab === 'all' ? results.clubs.slice(0, 3) : results.clubs).map((c) => (
                        <ClubCard key={c.id} club={c} />
                      ))}
                    </div>
                  </section>
                )}
                {showSection('scouts') && results.scouts.length > 0 && (
                  <section>
                    {sectionHeader('scouts', counts.scouts)}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      {(tab === 'all' ? results.scouts.slice(0, 4) : results.scouts).map((s) => (
                        <ScoutCard key={s.id} scout={s} />
                      ))}
                    </div>
                  </section>
                )}
                {showSection('competitions') && results.competitions.length > 0 && (
                  <section>
                    {sectionHeader('competitions', counts.competitions)}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {(tab === 'all' ? results.competitions.slice(0, 3) : results.competitions).map((c) => (
                        <CompetitionMiniCard key={c.id} comp={c} />
                      ))}
                    </div>
                  </section>
                )}
                {showSection('opportunities') && results.opportunities.length > 0 && (
                  <section>
                    {sectionHeader('opportunities', counts.opportunities)}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {(tab === 'all' ? results.opportunities.slice(0, 3) : results.opportunities).map((o) => (
                        <OpportunityCard key={o.id} op={o} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>

          {/* Section 4 — side rail (xl only) */}
          <aside className="hidden w-[300px] shrink-0 space-y-5 xl:block">
            <div className="rounded-xl border border-line bg-white p-5">
              <h3 className="font-display text-[16px] font-bold text-ink-950">{t('discover.side.featured')}</h3>
              <div className="mt-3 space-y-2">
                {featuredSearches.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSearchParams(new URLSearchParams(f.params));
                    }}
                    className="block w-full cursor-pointer rounded-lg border border-line px-3 py-2.5 text-left text-[13px] font-semibold text-ink-950 transition-colors hover:border-brand-500 hover:bg-brand-50"
                  >
                    {t(`discover.featuredSearches.${f.key}`)}
                  </button>
                ))}
              </div>
            </div>
            <SponsorSlot label={t('discover.side.sponsoredBy')} placeholder="MARCA PARCEIRA — espaço de demonstração" />
            <div className="rounded-xl border border-line bg-paper-50 p-4">
              <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-600">
                <Info size={13} aria-hidden />
                {t('discover.side.demoNoteTitle')}
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-600">{t('discover.side.demoNote')}</p>
            </div>
          </aside>
        </div>
      </div>
      {toastNode}
    </div>
  );
}
