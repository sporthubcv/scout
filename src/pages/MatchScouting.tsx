/**
 * Match Scouting — FIELD MODE (/match-scouting/:matchId). Design: match-scouting.md.
 * Dark high-contrast one-handed live-event capture console. No public chrome,
 * no Lenis, locked 100dvh, min 64px touch targets (pad buttons 80px+),
 * simulated offline queue with localStorage persistence + auto-sync,
 * clip marking, live feed (aria-live) and GENERATE SCOUT REPORT flow.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Clock,
  Download,
  FileText,
  Minus,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Undo2,
  Wifi,
  WifiOff,
  X,
  Zap,
} from 'lucide-react';
import { useI18n, useT } from '@/i18n';
import { getMatch, getMatchEvents } from '@/data';
import { demoMatchRosters, demoMatchScout, type RosterPlayer } from '@/data/extra-scouting';
import MonogramAvatar from '@/components/shared/MonogramAvatar';
import StatusBadge from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

/* ---------------------------------- types --------------------------------- */

interface LoggedEvent {
  id: string;
  clock: string;
  quarter: string;
  playerId: string;
  playerLabel: string;
  team: 'home' | 'away';
  descKey: string; // '' for seeded events (use descPt/descEn)
  descVars?: Record<string, string | number>;
  descPt?: string;
  descEn?: string;
  points: number;
  synced: boolean;
  seed?: boolean;
}

interface MarkedClip {
  id: string;
  clock: string;
  quarter: string;
  playerLabel: string;
  typeKey: 'assist' | 'defense' | 'three' | 'dunk' | 'hustle' | 'other';
  comment: string;
}

interface Toast {
  id: number;
  text: string;
  kind: 'success' | 'info' | 'warning';
}

interface EvalForm {
  technical: number;
  decision: number;
  defense: number;
  athleticism: number;
  potential: number;
  strengths: string;
  dev: string;
  rec: 'high' | 'follow' | 'monitor' | 'notNow';
}

const DEFAULT_EVAL: EvalForm = {
  technical: 5,
  decision: 5,
  defense: 5,
  athleticism: 5,
  potential: 5,
  strengths: '',
  dev: '',
  rec: 'follow',
};

const CLIP_TYPES = ['assist', 'defense', 'three', 'dunk', 'hustle', 'other'] as const;
const STRENGTH_CHIPS = ['s1', 's2', 's3', 's4'] as const;
const DEV_CHIPS = ['d1', 'd2', 'd3', 'd4'] as const;

/* --------------------------------- helpers -------------------------------- */

let uidCounter = 0;
const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(uidCounter++).toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const fmtClock = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

const parseClock = (c?: string) => {
  if (!c) return 600;
  const [m, s] = c.split(':').map(Number);
  return (m || 0) * 60 + (s || 0);
};

function buzz(ms = 12) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(ms);
  } catch {
    /* haptics unavailable */
  }
}

const padMotion = { whileTap: { scale: 0.94 }, transition: { duration: 0.15 } };

/* ------------------------------ subcomponents ----------------------------- */

function PadButton({
  label,
  sub,
  onPress,
  tone = 'default',
  keyHint,
  className,
  ariaLabel,
}: {
  label: string;
  sub?: string;
  onPress: () => void;
  tone?: 'default' | 'danger' | 'orange' | 'armed';
  keyHint?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <motion.button
      type="button"
      {...padMotion}
      onClick={() => {
        buzz();
        onPress();
      }}
      aria-label={ariaLabel ?? label}
      className={cn(
        'group relative flex min-h-20 flex-col items-center justify-center gap-0.5 rounded-xl border font-display text-[16px] font-extrabold text-white lg:h-24',
        tone === 'default' && 'border-ink-700 bg-ink-900 active:bg-brand-500/30',
        tone === 'danger' && 'border-danger/50 bg-ink-900 text-danger active:bg-danger/30 active:text-white',
        tone === 'armed' && 'border-danger bg-danger text-white',
        tone === 'orange' && 'border-brand-500 bg-brand-500 text-white active:bg-brand-600',
        className,
      )}
    >
      {keyHint && (
        <kbd className="absolute right-1.5 top-1.5 hidden rounded border border-ink-700 px-1 text-[10px] font-normal text-white/40 lg:block lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
          {keyHint}
        </kbd>
      )}
      <span>{label}</span>
      {sub && <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-white/40">{sub}</span>}
    </motion.button>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="flex h-12 max-w-full items-center gap-2 rounded-lg bg-ink-900 px-4 text-[13px] font-semibold text-white shadow-lg ring-1 ring-ink-700"
          >
            {toast.kind === 'success' && <Check size={16} className="shrink-0 text-brand-500" aria-hidden />}
            {toast.kind === 'info' && <RefreshCw size={16} className="shrink-0 text-info" aria-hidden />}
            {toast.kind === 'warning' && <WifiOff size={16} className="shrink-0 text-warning" aria-hidden />}
            <span className="truncate">{toast.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------- main page ------------------------------ */

export default function MatchScouting() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const { locale, formatDate } = useI18n();

  const match = getMatch(matchId ?? 'demo-match');
  const id = match?.id ?? 'demo-match';
  const roster = demoMatchRosters[id] ?? demoMatchRosters['demo-match'];
  const eventsKey = `shs-match-events-${id}`;
  const clipsKey = `shs-match-clips-${id}`;

  const [phase, setPhase] = useState<'pre' | 'live' | 'finished'>(() =>
    match?.status === 'scheduled' ? 'pre' : match?.status === 'finished' ? 'finished' : 'live',
  );
  const [quarter, setQuarter] = useState(() => Number(match?.quarter?.replace('Q', '')) || 1);
  const [clockSec, setClockSec] = useState(() => parseClock(match?.clock));
  const [homeScore, setHomeScore] = useState(match?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(match?.awayScore ?? 0);
  const [selectedId, setSelectedId] = useState(roster.home[0]?.id ?? '');

  const [events, setEvents] = useState<LoggedEvent[]>(() => {
    try {
      const raw = window.localStorage.getItem(eventsKey);
      if (raw) return JSON.parse(raw) as LoggedEvent[];
    } catch {
      /* ignore */
    }
    return getMatchEvents(id).map((e) => ({
      id: `seed-${e.id}`,
      clock: e.clock,
      quarter: e.quarter,
      playerId: '',
      playerLabel: e.playerLabel,
      team: 'home' as const,
      descKey: '',
      descPt: e.descriptionPt,
      descEn: e.descriptionEn,
      points: 0,
      synced: true,
      seed: true,
    }));
  });

  const [clips, setClips] = useState<MarkedClip[]>(() => {
    try {
      const raw = window.localStorage.getItem(clipsKey);
      if (raw) return JSON.parse(raw) as MarkedClip[];
    } catch {
      /* ignore */
    }
    return [];
  });

  const [offline, setOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<'home' | 'away'>('home');
  const [pickerQuery, setPickerQuery] = useState('');
  const [clipOpen, setClipOpen] = useState(false);
  const [clipType, setClipType] = useState<(typeof CLIP_TYPES)[number]>('assist');
  const [clipComment, setClipComment] = useState('');
  const [logOpen, setLogOpen] = useState(false);
  const [logFilter, setLogFilter] = useState('all');
  const [reportOpen, setReportOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [expanded, setExpanded] = useState<'pts' | 'shot' | 'custom' | null>(null);
  const [armed, setArmed] = useState<'foul' | 'to' | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [flashId, setFlashId] = useState<string | null>(null);
  const [reportState, setReportState] = useState<'form' | 'compiling' | 'done'>('form');
  const [compileStep, setCompileStep] = useState(0);
  const [reportTab, setReportTab] = useState<string>('');
  const [evals, setEvals] = useState<Record<string, EvalForm>>({});

  const armedTimer = useRef<number | null>(null);
  const conflictShown = useRef(false);

  const allPlayers = useMemo(() => [...roster.home, ...roster.away], [roster]);
  const selected: RosterPlayer = allPlayers.find((p) => p.id === selectedId) ?? roster.home[0];
  const selectedTeam: 'home' | 'away' = roster.home.some((p) => p.id === selected.id) ? 'home' : 'away';
  const queueCount = events.filter((e) => !e.synced).length;

  /* ------------------------------- persistence ------------------------------ */
  useEffect(() => {
    try {
      window.localStorage.setItem(eventsKey, JSON.stringify(events));
    } catch {
      /* ignore */
    }
  }, [events, eventsKey]);
  useEffect(() => {
    try {
      window.localStorage.setItem(clipsKey, JSON.stringify(clips));
    } catch {
      /* ignore */
    }
  }, [clips, clipsKey]);

  /* ---------------------------------- clock --------------------------------- */
  useEffect(() => {
    if (phase !== 'live') return;
    const iv = window.setInterval(() => {
      setClockSec((s) => {
        if (s > 0) return s - 1;
        setQuarter((q) => {
          if (q < 4) {
            setClockSec(600);
            return q + 1;
          }
          setPhase('finished');
          return q;
        });
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(iv);
  }, [phase]);

  /* ---------------------------------- toasts -------------------------------- */
  const pushToast = useCallback((text: string, kind: Toast['kind'] = 'success') => {
    const idn = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-3), { id: idn, text, kind }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== idn)), 4000);
  }, []);

  /* ------------------------------- offline sync ----------------------------- */
  useEffect(() => {
    if (offline || syncing) return;
    const queuedNow = events.filter((e) => !e.synced).length;
    if (queuedNow === 0) return;
    setSyncing(true);
    const tm = window.setTimeout(() => {
      setEvents((cur) => cur.map((e) => ({ ...e, synced: true })));
      setSyncing(false);
      pushToast(t('matchScouting.syncDone', { n: queuedNow }), 'success');
      if (!conflictShown.current) {
        conflictShown.current = true;
        window.setTimeout(() => pushToast(t('matchScouting.syncConflict'), 'info'), 900);
      }
    }, 1500);
    return () => window.clearTimeout(tm);
  }, [offline, events, syncing, pushToast, t]);

  /* ------------------------------- event logging ---------------------------- */
  const describe = useCallback(
    (e: LoggedEvent) =>
      e.descKey ? t(`matchScouting.desc.${e.descKey}`, e.descVars) : locale === 'en' ? e.descEn ?? '' : e.descPt ?? '',
    [t, locale],
  );

  const logEvent = useCallback(
    (descKey: string, points = 0, descVars?: Record<string, string | number>) => {
      if (phase !== 'live') return;
      const evt: LoggedEvent = {
        id: uid('evt'),
        clock: fmtClock(clockSec),
        quarter: `Q${quarter}`,
        playerId: selected.id,
        playerLabel: selected.label,
        team: selectedTeam,
        descKey,
        descVars,
        points,
        synced: !offline,
      };
      setEvents((prev) => [...prev, evt]);
      if (points > 0) {
        if (selectedTeam === 'home') setHomeScore((s) => s + points);
        else setAwayScore((s) => s + points);
      }
      setFlashId(evt.id);
      window.setTimeout(() => setFlashId((f) => (f === evt.id ? null : f)), 1200);
    },
    [phase, clockSec, quarter, selected, selectedTeam, offline],
  );

  const armOrLog = useCallback(
    (kind: 'foul' | 'to') => {
      if (armed === kind) {
        setArmed(null);
        if (armedTimer.current) window.clearTimeout(armedTimer.current);
        logEvent(kind);
      } else {
        setArmed(kind);
        if (armedTimer.current) window.clearTimeout(armedTimer.current);
        armedTimer.current = window.setTimeout(() => setArmed(null), 2000);
      }
    },
    [armed, logEvent],
  );

  const undo = useCallback(() => {
    const last = [...events].reverse().find((e) => !e.seed);
    if (!last) {
      pushToast(t('matchScouting.nothingToUndo'), 'info');
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== last.id));
    if (last.points > 0) {
      if (last.team === 'home') setHomeScore((s) => Math.max(0, s - last.points));
      else setAwayScore((s) => Math.max(0, s - last.points));
    }
    pushToast(t('matchScouting.undone'), 'info');
  }, [events, pushToast, t]);

  /* ------------------------------ keyboard (desktop) ------------------------ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'live' || pickerOpen || clipOpen || logOpen || reportOpen || exitOpen) return;
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      const map: Record<string, () => void> = {
        '1': () => logEvent('pts2', 2),
        '2': () => logEvent('ast'),
        '3': () => logEvent('reb'),
        '4': () => logEvent('stl'),
        '5': () => logEvent('blk'),
        '6': () => armOrLog('foul'),
        '7': () => armOrLog('to'),
        '8': () => logEvent('def'),
        '9': () => setClipOpen(true),
      };
      map[e.key]?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, pickerOpen, clipOpen, logOpen, reportOpen, exitOpen, logEvent, armOrLog]);

  /* ------------------------------- derived data ----------------------------- */
  const liveFeed = events.slice(-4).reverse();
  const playerLine = useMemo(() => {
    const mine = events.filter((e) => e.playerLabel === selected.label);
    const pts = mine.reduce((a, e) => a + e.points, 0);
    const ast = mine.filter((e) => e.descKey === 'ast').length;
    return { pts, ast };
  }, [events, selected]);

  const boxScore = useMemo(() => {
    const rows = new Map<string, { label: string; pts: number; ast: number; reb: number; stl: number; blk: number; to: number; fouls: number; missed: number }>();
    for (const e of events) {
      const key = e.playerLabel;
      if (!key) continue;
      const r = rows.get(key) ?? { label: key, pts: 0, ast: 0, reb: 0, stl: 0, blk: 0, to: 0, fouls: 0, missed: 0 };
      r.pts += e.points;
      if (e.descKey === 'ast') r.ast++;
      if (e.descKey === 'reb') r.reb++;
      if (e.descKey === 'stl') r.stl++;
      if (e.descKey === 'blk') r.blk++;
      if (e.descKey === 'to') r.to++;
      if (e.descKey === 'foul') r.fouls++;
      if (e.descKey === 'shotMissed') r.missed++;
      rows.set(key, r);
    }
    return [...rows.values()]
      .map((r) => ({ ...r, eff: r.pts + r.ast + r.reb + r.stl + r.blk - r.to - r.missed }))
      .sort((a, b) => b.eff - a.eff);
  }, [events]);

  const trackedLabels = useMemo(() => boxScore.map((r) => r.label), [boxScore]);
  const activeReportTab = reportTab || trackedLabels[0] || selected.label;
  const activeEval = evals[activeReportTab] ?? DEFAULT_EVAL;
  const setActiveEval = (patch: Partial<EvalForm>) =>
    setEvals((prev) => ({ ...prev, [activeReportTab]: { ...DEFAULT_EVAL, ...prev[activeReportTab], ...patch } }));

  /* ------------------------------- report submit ---------------------------- */
  const submitReport = () => {
    setReportState('compiling');
    setCompileStep(1);
    window.setTimeout(() => setCompileStep(2), 700);
    window.setTimeout(() => setCompileStep(3), 1400);
    window.setTimeout(() => setReportState('done'), 2100);
  };

  if (!match) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-ink-950 px-6 text-center text-white">
        <p className="font-display text-[24px] font-extrabold">404</p>
        <Link to="/" className="mt-4 text-[14px] font-semibold text-brand-500">
          ← {t('common.back')}
        </Link>
      </div>
    );
  }

  /* ------------------------------ shared chrome JSX ------------------------- */

  const syncPill = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={offline}
        aria-label={t('matchScouting.simulateOffline')}
        onClick={() => {
          buzz();
          setOffline((o) => !o);
        }}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
          offline ? 'border-warning bg-warning/30' : 'border-ink-700 bg-ink-800',
        )}
        title={t('matchScouting.simulateOffline')}
      >
        <span
          className={cn(
            'absolute top-0.5 rounded-full bg-white transition-all',
            offline ? 'left-[22px]' : 'left-0.5',
          )}
          style={{ height: 18, width: 18 }}
        />
      </button>
      <span
        className={cn(
          'flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.06em]',
          syncing
            ? 'bg-ink-800 text-info'
            : offline
              ? 'bg-warning/15 text-warning'
              : 'bg-ink-800 text-success',
        )}
        title={offline ? t('matchScouting.offlineInfo') : undefined}
      >
        {syncing ? (
          <>
            <RefreshCw size={12} className="animate-spin" aria-hidden />
            {t('matchScouting.syncing')}
          </>
        ) : offline ? (
          <>
            <WifiOff size={12} aria-hidden />
            {t('matchScouting.offline')} · {t('matchScouting.queued', { n: queueCount })}
          </>
        ) : (
          <>
            <Wifi size={12} aria-hidden />
            {t('matchScouting.online')}
          </>
        )}
      </span>
    </div>
  );

  const topBar = (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-700 bg-ink-950 px-4">
      <button
        type="button"
        onClick={() => (queueCount > 0 ? setExitOpen(true) : navigate('/'))}
        className="flex h-11 min-w-16 items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-white/70 transition-colors hover:bg-ink-800 hover:text-white"
      >
        <ArrowLeft size={16} aria-hidden />
        {t('matchScouting.exit')}
      </button>
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
          INTER LICEU 2027 — {t('matchScouting.group', { g: match.group ?? 'A' })}
        </p>
        <p className="text-[10px] text-white/35">{t('matchScouting.scoutLabel', { name: demoMatchScout.short })}</p>
      </div>
      {syncPill}
    </header>
  );

  const adjustScore = (team: 'home' | 'away', delta: number) => {
    buzz();
    if (team === 'home') setHomeScore((s) => Math.max(0, s + delta));
    else setAwayScore((s) => Math.max(0, s + delta));
  };

  const scoreboard = (
    <section aria-label="Scoreboard" className="rounded-xl border border-ink-700 bg-ink-900 px-4 py-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div>
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.08em] text-white/60">{match.homeTeam}</p>
          <div className="flex items-center gap-2">
            <span className="tnum font-display text-[36px] font-extrabold leading-none text-white">{homeScore}</span>
            <span className="flex flex-col gap-1">
              <button type="button" aria-label="+" onClick={() => adjustScore('home', 1)} className="flex h-6 w-6 items-center justify-center rounded border border-ink-700 text-white/60 hover:bg-ink-800">
                <Plus size={12} aria-hidden />
              </button>
              <button type="button" aria-label="−" onClick={() => adjustScore('home', -1)} className="flex h-6 w-6 items-center justify-center rounded border border-ink-700 text-white/60 hover:bg-ink-800">
                <Minus size={12} aria-hidden />
              </button>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => {
              buzz();
              setQuarter((q) => (q % 4) + 1);
            }}
            className="rounded-full bg-brand-500 px-3 py-1 font-display text-[13px] font-extrabold text-white"
            aria-label={t('matchScouting.quarterShort', { q: quarter })}
          >
            {t('matchScouting.quarterShort', { q: quarter })}
          </button>
          <span className="tnum font-display text-[28px] font-extrabold leading-none text-white">
            {fmtClock(clockSec)}
          </span>
          <StatusBadge variant="live" />
        </div>
        <div className="text-right">
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.08em] text-white/60">{match.awayTeam}</p>
          <div className="flex items-center justify-end gap-2">
            <span className="flex flex-col gap-1">
              <button type="button" aria-label="+" onClick={() => adjustScore('away', 1)} className="flex h-6 w-6 items-center justify-center rounded border border-ink-700 text-white/60 hover:bg-ink-800">
                <Plus size={12} aria-hidden />
              </button>
              <button type="button" aria-label="−" onClick={() => adjustScore('away', -1)} className="flex h-6 w-6 items-center justify-center rounded border border-ink-700 text-white/60 hover:bg-ink-800">
                <Minus size={12} aria-hidden />
              </button>
            </span>
            <span className="tnum font-display text-[36px] font-extrabold leading-none text-white">{awayScore}</span>
          </div>
        </div>
      </div>
    </section>
  );

  const playerStrip = (
    <button
      type="button"
      onClick={() => {
        buzz();
        setPickerOpen(true);
      }}
      className="flex min-h-[72px] w-full items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3 text-left transition-colors hover:border-ink-600"
    >
      <MonogramAvatar name={selected.name} size={48} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[16px] font-bold text-white">{selected.label}</span>
        <span className="tnum block text-[12px] text-white/50">
          {selected.position} · {selectedTeam === 'home' ? match.homeTeam : match.awayTeam} · {playerLine.pts} PTS · {playerLine.ast} AST
        </span>
      </span>
      <span className="rounded-lg border border-ink-700 px-3 py-2 text-[12px] font-semibold text-white/80">
        {t('matchScouting.changePlayer')}
      </span>
    </button>
  );

  const flashEvent = flashId ? events.find((e) => e.id === flashId) : null;

  const expandedPanel = (
    <AnimatePresence>
      {expanded && (
        <motion.div
          key={expanded}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          {expanded === 'pts' && (
            <div className="grid grid-cols-3 gap-3 pb-1">
              {([['pts1', 1], ['pts2', 2], ['pts3', 3]] as const).map(([key, pts]) => (
                <PadButton
                  key={key}
                  label={t(`matchScouting.sub.${key}`)}
                  tone="orange"
                  onPress={() => {
                    logEvent(key, pts);
                    setExpanded(null);
                  }}
                />
              ))}
            </div>
          )}
          {expanded === 'shot' && (
            <div className="grid grid-cols-3 gap-3 pb-1">
              {(['shot2', 'shot3', 'shotFt'] as const).map((shot) => (
                <PadButton
                  key={`${shot}-made`}
                  label={`${t(`matchScouting.sub.${shot}`)} ✓`}
                  sub={t('matchScouting.sub.made')}
                  onPress={() => {
                    logEvent('shotMade', shot === 'shot3' ? 3 : shot === 'shot2' ? 2 : 1, { shot: t(`matchScouting.sub.${shot}`) });
                    setExpanded(null);
                  }}
                />
              ))}
              {(['shot2', 'shot3', 'shotFt'] as const).map((shot) => (
                <PadButton
                  key={`${shot}-missed`}
                  label={`${t(`matchScouting.sub.${shot}`)} ✗`}
                  sub={t('matchScouting.sub.missed')}
                  onPress={() => {
                    logEvent('shotMissed', 0, { shot: t(`matchScouting.sub.${shot}`) });
                    setExpanded(null);
                  }}
                />
              ))}
            </div>
          )}
          {expanded === 'custom' && (
            <div className="flex gap-2 pb-1">
              <input
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder={t('matchScouting.customNotePh')}
                aria-label={t('matchScouting.customNoteTitle')}
                className="h-16 min-w-0 flex-1 rounded-xl border border-ink-700 bg-ink-900 px-4 text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (!customNote.trim()) return;
                  logEvent('custom', 0, { note: customNote.trim() });
                  setCustomNote('');
                  setExpanded(null);
                }}
                className="h-16 rounded-xl bg-brand-500 px-5 font-display text-[15px] font-extrabold text-white"
              >
                {t('matchScouting.customSave')}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const eventPad = (
    <div className="flex flex-col gap-3">
      {/* toast-lite above the pad */}
      <div aria-live="polite" className="flex h-7 items-center">
        <AnimatePresence>
          {flashEvent && (
            <motion.p
              key={flashEvent.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="tnum truncate text-[12px] font-semibold text-success"
            >
              ✓ {describe(flashEvent)} — {flashEvent.playerLabel} — {flashEvent.clock}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      {expandedPanel}
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-5">
        <PadButton label={t('matchScouting.events.pts')} keyHint="1" onPress={() => setExpanded((x) => (x === 'pts' ? null : 'pts'))} />
        <PadButton label={t('matchScouting.events.ast')} keyHint="2" onPress={() => logEvent('ast')} />
        <PadButton label={t('matchScouting.events.reb')} keyHint="3" onPress={() => logEvent('reb')} />
        <PadButton label={t('matchScouting.events.stl')} keyHint="4" onPress={() => logEvent('stl')} />
        <PadButton label={t('matchScouting.events.blk')} keyHint="5" onPress={() => logEvent('blk')} />
        <PadButton
          label={armed === 'foul' ? t('matchScouting.confirmFoul') : t('matchScouting.events.foul')}
          keyHint="6"
          tone={armed === 'foul' ? 'armed' : 'danger'}
          onPress={() => armOrLog('foul')}
        />
        <PadButton
          label={armed === 'to' ? t('matchScouting.confirmTo') : t('matchScouting.events.to')}
          keyHint="7"
          tone={armed === 'to' ? 'armed' : 'danger'}
          onPress={() => armOrLog('to')}
        />
        <PadButton label={t('matchScouting.events.shot')} onPress={() => setExpanded((x) => (x === 'shot' ? null : 'shot'))} />
        <PadButton label={t('matchScouting.events.def')} keyHint="8" onPress={() => logEvent('def')} />
        <PadButton label={t('matchScouting.events.custom')} onPress={() => setExpanded((x) => (x === 'custom' ? null : 'custom'))} />
        <PadButton
          label={t('matchScouting.events.clip')}
          keyHint="9"
          tone="orange"
          className="col-span-3 lg:col-span-5"
          onPress={() => setClipOpen(true)}
        />
      </div>
    </div>
  );

  const feed = (
    <section aria-label={t('matchScouting.feedTitle')}>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">{t('matchScouting.feedTitle')}</h2>
        <button
          type="button"
          onClick={() => setLogOpen(true)}
          className="min-h-11 px-2 text-[12px] font-semibold text-brand-500"
        >
          {t('matchScouting.viewAll')}
        </button>
      </div>
      <ul aria-live="polite" role="status" className="divide-y divide-ink-700/60 overflow-hidden rounded-xl border border-ink-700 bg-ink-900">
        {liveFeed.map((e) => (
          <motion.li
            key={e.id}
            initial={{ y: -12, opacity: 0, backgroundColor: 'rgba(249,115,22,0.3)' }}
            animate={{ y: 0, opacity: 1, backgroundColor: 'rgba(249,115,22,0)' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 px-3 py-1.5"
          >
            <span className="tnum shrink-0 text-[12px] font-semibold text-white/50">
              {e.quarter} {e.clock}
            </span>
            <span className="tnum min-w-0 flex-1 truncate text-[13px] text-white">
              {e.playerLabel} · {describe(e)}
            </span>
            {!e.synced && <WifiOff size={12} className="shrink-0 text-warning" aria-label={t('matchScouting.offline')} />}
            <span className="hidden shrink-0 text-[10px] text-white/35 sm:block">
              {t('matchScouting.scoutLabel', { name: demoMatchScout.short })}
            </span>
          </motion.li>
        ))}
      </ul>
    </section>
  );

  const bottomBar = (
    <footer className="flex h-16 shrink-0 items-stretch gap-3 border-t border-ink-700 bg-ink-950 px-4 py-2">
      <motion.button
        type="button"
        {...padMotion}
        onClick={() => {
          buzz();
          undo();
        }}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-ink-700 text-[13px] font-bold text-white/80"
      >
        <Undo2 size={16} aria-hidden />
        {t('matchScouting.undo')}
      </motion.button>
      <motion.button
        type="button"
        {...padMotion}
        onClick={() => {
          buzz();
          setClipOpen(true);
        }}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 text-[13px] font-extrabold text-white"
      >
        <Zap size={16} aria-hidden />
        {t('matchScouting.clip')}
      </motion.button>
      <motion.button
        type="button"
        {...padMotion}
        onClick={() => {
          buzz();
          setReportState('form');
          setReportOpen(true);
        }}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-ink-800 text-[13px] font-bold text-white ring-1 ring-ink-700"
      >
        <FileText size={16} aria-hidden />
        {t('matchScouting.report')}
      </motion.button>
    </footer>
  );

  const rosterPanel = (
    <section aria-label={t('matchScouting.pickPlayer')} className="rounded-xl border border-ink-700 bg-ink-900 p-3">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">{t('matchScouting.pickPlayer')}</h2>
      {(['home', 'away'] as const).map((side) => (
        <div key={side} className="mb-3 last:mb-0">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/35">
            {side === 'home' ? match.homeTeam : match.awayTeam}
          </p>
          <ul className="space-y-1">
            {roster[side].map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    'flex min-h-12 w-full items-center gap-2 rounded-lg px-2 text-left transition-colors',
                    p.id === selected.id ? 'bg-ink-800 ring-2 ring-brand-500' : 'hover:bg-ink-800',
                  )}
                >
                  <MonogramAvatar name={p.name} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-white">{p.label}</span>
                    <span className="block text-[10px] text-white/40">{p.position}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );

  const clipsPanel = (
    <section aria-label={t('matchScouting.clipSheet.title')} className="rounded-xl border border-ink-700 bg-ink-900 p-3">
      <h2 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
        <Zap size={12} className="text-brand-500" aria-hidden />
        {t('matchScouting.clipSheet.title')} ({clips.length})
      </h2>
      {clips.length === 0 ? (
        <p className="text-[12px] text-white/35">{t('matchScouting.reportFlow.noClips')}</p>
      ) : (
        <ul className="space-y-1.5">
          {[...clips].reverse().map((c) => (
            <li key={c.id} className="rounded-lg bg-ink-800 px-2.5 py-2">
              <p className="tnum text-[12px] font-semibold text-white">
                {c.quarter} {c.clock} · {c.playerLabel}
              </p>
              <p className="text-[11px] text-white/50">
                {t(`matchScouting.clipSheet.types.${c.typeKey}`)}
                {c.comment ? ` — ${c.comment}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  /* ------------------------------ phase screens ----------------------------- */

  const preScreen = (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-10">
      <StatusBadge variant="demo" />
      <div className="w-full max-w-md rounded-2xl border border-ink-700 bg-ink-900 p-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-500">{t('matchScouting.pre.scheduled')}</p>
        <h1 className="mt-2 font-display text-[24px] font-extrabold text-white">{t('matchScouting.pre.title')}</h1>
        <p className="mt-3 font-display text-[18px] font-bold text-white">
          {match.homeTeam} <span className="text-white/40">vs</span> {match.awayTeam}
        </p>
        <p className="mt-1 text-[12px] text-white/50">
          {match.venue} · {formatDate(match.date)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 text-left">
          {(['home', 'away'] as const).map((side) => (
            <div key={side}>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/40">
                {side === 'home' ? match.homeTeam : match.awayTeam}
              </p>
              <ul className="space-y-1">
                {roster[side].map((p) => (
                  <li key={p.id} className="flex items-center gap-1.5 text-[12px] text-white/75">
                    <Check size={12} className="shrink-0 text-success" aria-hidden />
                    {p.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.08em] text-white/50">
          {t('matchScouting.pre.roster')} ✓
        </p>
        <p className="mt-2 inline-flex rounded-full border border-ink-700 px-3 py-1 text-[11px] text-white/60">
          {t('matchScouting.pre.assignScout', { name: demoMatchScout.name })}
        </p>
      </div>
      <motion.button
        type="button"
        {...padMotion}
        onClick={() => {
          buzz(20);
          setPhase('live');
        }}
        className="flex h-16 w-full max-w-md items-center justify-center gap-2 rounded-xl bg-brand-500 font-display text-[18px] font-extrabold text-white"
      >
        <Play size={20} aria-hidden />
        {t('matchScouting.pre.start')}
      </motion.button>
    </div>
  );

  const postScreen = (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-ink-700 bg-ink-900 p-6 text-center">
        <h1 className="font-display text-[24px] font-extrabold text-white">{t('matchScouting.post.title')}</h1>
        <p className="tnum mt-4 font-display text-[40px] font-extrabold text-white">
          {homeScore} <span className="text-white/40">—</span> {awayScore}
        </p>
        <p className="mt-1 text-[13px] text-white/60">
          {match.homeTeam} vs {match.awayTeam}
        </p>
        <p className="mt-4 flex items-center justify-center gap-2 text-[13px] font-semibold">
          {queueCount === 0 ? (
            <span className="flex items-center gap-1.5 text-success">
              <Check size={14} aria-hidden />
              {t('matchScouting.post.allSynced')}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-warning">
              <WifiOff size={14} aria-hidden />
              {t('matchScouting.post.pendingSync', { n: queueCount })}
            </span>
          )}
        </p>
        <p className="mt-2 text-[12px] text-white/40">
          {t('matchScouting.post.body')} · {events.length} {t('matchScouting.feedTitle').toLowerCase()} · {clips.length} clips
        </p>
      </div>
      <div className="flex w-full max-w-md flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            setReportState('form');
            setReportOpen(true);
          }}
          className="flex h-14 items-center justify-center gap-2 rounded-xl bg-brand-500 font-display text-[16px] font-extrabold text-white"
        >
          <FileText size={18} aria-hidden />
          {t('matchScouting.report')}
        </button>
        <button
          type="button"
          onClick={() => (queueCount > 0 ? setExitOpen(true) : navigate('/'))}
          className="flex h-14 items-center justify-center gap-2 rounded-xl border border-ink-700 font-semibold text-white/80"
        >
          {t('matchScouting.post.exit')}
        </button>
      </div>
    </div>
  );

  /* --------------------------------- overlays ------------------------------- */

  const pickerSheet = (
    <AnimatePresence>
      {pickerOpen && (
        <>
          <motion.div
            key="picker-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink-950/60 backdrop-blur-sm"
            onClick={() => setPickerOpen(false)}
          />
          <motion.div
            key="picker-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
            role="dialog"
            aria-label={t('matchScouting.pickPlayer')}
            className="fixed inset-x-0 bottom-0 z-[61] max-h-[80dvh] rounded-t-2xl border-t border-ink-700 bg-ink-900 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[18px] font-extrabold text-white">{t('matchScouting.pickPlayer')}</h2>
              <button type="button" aria-label={t('common.close')} onClick={() => setPickerOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-lg text-white/60 hover:bg-ink-800">
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" aria-hidden />
              <input
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder={t('matchScouting.searchPlayer')}
                className="h-12 w-full rounded-lg border border-ink-700 bg-ink-950 pl-9 pr-3 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {(['home', 'away'] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => setPickerTab(side)}
                  className={cn(
                    'h-11 rounded-lg text-[13px] font-bold',
                    pickerTab === side ? 'bg-brand-500 text-white' : 'border border-ink-700 text-white/60',
                  )}
                >
                  {side === 'home' ? match.homeTeam : match.awayTeam}
                </button>
              ))}
            </div>
            <ul className="max-h-[40dvh] space-y-1 overflow-y-auto">
              {roster[pickerTab]
                .filter((p) => p.label.toLowerCase().includes(pickerQuery.toLowerCase()))
                .map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        buzz();
                        setSelectedId(p.id);
                        setPickerOpen(false);
                      }}
                      className={cn(
                        'flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-left',
                        p.id === selected.id ? 'bg-ink-800 ring-2 ring-brand-500' : 'hover:bg-ink-800',
                      )}
                    >
                      <MonogramAvatar name={p.name} size={40} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-[15px] font-bold text-white">{p.label}</span>
                        <span className="block text-[11px] text-white/40">{p.position}</span>
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const clipSheet = (
    <AnimatePresence>
      {clipOpen && (
        <>
          <motion.div
            key="clip-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink-950/60 backdrop-blur-sm"
            onClick={() => setClipOpen(false)}
          />
          <motion.div
            key="clip-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
            role="dialog"
            aria-label={t('matchScouting.clipSheet.title')}
            className="fixed inset-x-0 bottom-0 z-[61] max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-ink-700 bg-ink-900 p-4"
          >
            <div className="mb-1 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-[18px] font-extrabold text-white">
                <Zap size={18} className="text-brand-500" aria-hidden />
                {t('matchScouting.clipSheet.title')}
              </h2>
              <button type="button" aria-label={t('common.close')} onClick={() => setClipOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-lg text-white/60 hover:bg-ink-800">
                <X size={18} aria-hidden />
              </button>
            </div>
            <p className="tnum mb-3 flex items-center gap-1.5 text-[12px] text-white/50">
              <Clock size={12} aria-hidden />
              {t('matchScouting.clipSheet.auto')}: {t('matchScouting.quarterShort', { q: quarter })} {fmtClock(clockSec)} · {selected.label}
            </p>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/40">
              {t('matchScouting.clipSheet.typeLabel')}
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {CLIP_TYPES.map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => setClipType(ct)}
                  className={cn(
                    'min-h-11 rounded-full border px-3.5 text-[12px] font-semibold',
                    clipType === ct ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-700 text-white/60',
                  )}
                >
                  {t(`matchScouting.clipSheet.types.${ct}`)}
                </button>
              ))}
            </div>
            <input
              value={clipComment}
              onChange={(e) => setClipComment(e.target.value)}
              placeholder={t('matchScouting.clipSheet.commentPh')}
              aria-label={t('matchScouting.clipSheet.comment')}
              className="mb-3 h-12 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => {
                buzz(20);
                const clip: MarkedClip = {
                  id: uid('clip'),
                  clock: fmtClock(clockSec),
                  quarter: `Q${quarter}`,
                  playerLabel: selected.label,
                  typeKey: clipType,
                  comment: clipComment.trim(),
                };
                setClips((prev) => [...prev, clip]);
                pushToast(t('matchScouting.clipSheet.saved', { clock: `${clip.quarter} ${clip.clock}` }), 'success');
                setClipComment('');
                setClipOpen(false);
              }}
              className="h-14 w-full rounded-xl bg-brand-500 font-display text-[16px] font-extrabold text-white"
            >
              {t('matchScouting.clipSheet.save')}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const exportCsv = () => {
    const header = 'id;quarter;clock;player;event;synced';
    const rows = events.map((e) => `${e.id};${e.quarter};${e.clock};${e.playerLabel};${describe(e)};${e.synced ? 'yes' : 'queued'}`);
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sporthub-scout-${id}-events.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logPlayers = [...new Set(events.map((e) => e.playerLabel).filter(Boolean))];
  const logDrawer = (
    <AnimatePresence>
      {logOpen && (
        <motion.div
          key="log-drawer"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-label={t('matchScouting.logTitle')}
          className="fixed inset-0 z-[62] flex flex-col bg-ink-950"
        >
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-700 px-4">
            <h2 className="flex-1 font-display text-[16px] font-extrabold text-white">{t('matchScouting.logTitle')}</h2>
            <button
              type="button"
              onClick={exportCsv}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-ink-700 px-3 text-[12px] font-semibold text-white/70"
              title={t('common.demoTooltip')}
            >
              <Download size={14} aria-hidden />
              {t('matchScouting.exportCsv')}
            </button>
            <button type="button" aria-label={t('common.close')} onClick={() => setLogOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-lg text-white/60 hover:bg-ink-800">
              <X size={18} aria-hidden />
            </button>
          </div>
          <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-ink-700 px-4 py-2">
            <button
              type="button"
              onClick={() => setLogFilter('all')}
              className={cn('h-9 shrink-0 rounded-full border px-3.5 text-[12px] font-semibold', logFilter === 'all' ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-700 text-white/60')}
            >
              {t('matchScouting.filterAll')}
            </button>
            {logPlayers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setLogFilter(p)}
                className={cn('h-9 shrink-0 rounded-full border px-3.5 text-[12px] font-semibold', logFilter === p ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-700 text-white/60')}
              >
                {p}
              </button>
            ))}
          </div>
          <ul className="min-h-0 flex-1 divide-y divide-ink-700/60 overflow-y-auto" aria-live="polite">
            {[...events]
              .reverse()
              .filter((e) => logFilter === 'all' || e.playerLabel === logFilter)
              .map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="tnum w-20 shrink-0 text-[12px] font-semibold text-white/50">
                    {e.quarter} {e.clock}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] text-white">
                    <span className="font-semibold">{e.playerLabel}</span> · {describe(e)}
                  </span>
                  {!e.synced && <WifiOff size={12} className="shrink-0 text-warning" aria-hidden />}
                </li>
              ))}
            {events.filter((e) => logFilter === 'all' || e.playerLabel === logFilter).length === 0 && (
              <li className="px-4 py-8 text-center text-[13px] text-white/40">{t('matchScouting.noEvents')}</li>
            )}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const reportAthlete = allPlayers.find((p) => p.label === activeReportTab);
  const reportAthletePath = `/athletes/${reportAthlete?.athleteId ?? 'erick-semedo'}`;
  const evalSliders = ['technical', 'decision', 'defense', 'athleticism', 'potential'] as const;

  const reportOverlay = (
    <AnimatePresence>
      {reportOpen && (
        <motion.div
          key="report"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 36 }}
          role="dialog"
          aria-label={t('matchScouting.reportFlow.title')}
          className="fixed inset-0 z-[63] flex flex-col bg-ink-950"
        >
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-700 px-4">
            <h2 className="flex-1 font-display text-[16px] font-extrabold uppercase tracking-wide text-white">
              {t('matchScouting.reportFlow.title')}
            </h2>
            <button type="button" aria-label={t('common.close')} onClick={() => setReportOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-lg text-white/60 hover:bg-ink-800">
              <X size={18} aria-hidden />
            </button>
          </div>

          {reportState === 'compiling' && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
              <RefreshCw size={32} className="animate-spin text-brand-500" aria-hidden />
              <p className="text-[14px] font-semibold text-white/80">
                {compileStep === 1 && t('matchScouting.reportFlow.compiling1')}
                {compileStep === 2 && t('matchScouting.reportFlow.compiling2')}
                {compileStep >= 3 && t('matchScouting.reportFlow.compiling3')}
              </p>
            </div>
          )}

          {reportState === 'done' && (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-8">
              <motion.svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
                <motion.circle cx="36" cy="36" r="33" stroke="#F97316" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                <motion.path d="M22 37 L32 47 L51 27" stroke="#F97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />
              </motion.svg>
              <h3 className="font-display text-[22px] font-extrabold text-white">{t('matchScouting.reportFlow.createdTitle')} ✓</h3>
              <p className="text-center text-[13px] text-white/60">{t('matchScouting.reportFlow.createdBody')}</p>
              <div className="w-full max-w-sm rounded-xl border border-ink-700 bg-ink-900 p-4">
                <div className="flex items-center gap-3">
                  <MonogramAvatar name={reportAthlete?.name ?? activeReportTab} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[15px] font-bold text-white">{activeReportTab}</p>
                    <p className="text-[11px] text-white/45">
                      {match.homeTeam} vs {match.awayTeam} · {formatDate(match.date)}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                    {t(`matchScouting.reportFlow.rec.${activeEval.rec}`)}
                  </span>
                </div>
                <p className="tnum mt-3 text-[12px] text-white/60">
                  {t('matchScouting.reportFlow.technical')} {activeEval.technical.toFixed(1)} · {t('matchScouting.reportFlow.potential')} {activeEval.potential.toFixed(1)}
                </p>
                {activeEval.strengths && <p className="mt-1 text-[12px] text-white/60">+ {activeEval.strengths}</p>}
              </div>
              <div className="flex w-full max-w-sm flex-col gap-3">
                <Link
                  to={reportAthletePath}
                  className="flex h-14 items-center justify-center rounded-xl bg-brand-500 font-display text-[15px] font-extrabold text-white"
                >
                  {t('matchScouting.reportFlow.viewAthlete')}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setReportOpen(false);
                    setPhase('finished');
                  }}
                  className="flex h-14 items-center justify-center rounded-xl border border-ink-700 font-semibold text-white/80"
                >
                  {t('matchScouting.reportFlow.finish')}
                </button>
              </div>
            </div>
          )}

          {reportState === 'form' && (
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
              <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-8">
                {/* 1. auto summary */}
                <section className="rounded-xl border border-ink-700 bg-ink-900 p-4">
                  <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-500">
                    {t('matchScouting.reportFlow.summaryTitle')}
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                    <dt className="text-white/45">{t('matchScouting.reportFlow.match')}</dt>
                    <dd className="tnum font-semibold text-white">
                      {match.homeTeam} {homeScore}—{awayScore} {match.awayTeam}
                    </dd>
                    <dt className="text-white/45">{t('matchScouting.reportFlow.date')}</dt>
                    <dd className="text-white">{formatDate(match.date)}</dd>
                    <dt className="text-white/45">{t('matchScouting.reportFlow.scout')}</dt>
                    <dd className="text-white">{demoMatchScout.name}</dd>
                    <dt className="text-white/45">{t('matchScouting.reportFlow.observed')}</dt>
                    <dd className="text-white">{trackedLabels.length}</dd>
                  </dl>
                </section>

                {/* box score */}
                <section className="rounded-xl border border-ink-700 bg-ink-900 p-4">
                  <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-500">
                    {t('matchScouting.reportFlow.boxScore')}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="tnum w-full min-w-[560px] text-[12px]">
                      <thead>
                        <tr className="text-left text-[10px] font-bold uppercase tracking-[0.06em] text-white/40">
                          <th className="py-1.5 pr-2">{t('matchScouting.reportFlow.table.player')}</th>
                          {(['pts', 'ast', 'reb', 'stl', 'blk', 'to', 'fouls', 'eff'] as const).map((k) => (
                            <th key={k} className="py-1.5 pr-2 text-right">
                              {t(`matchScouting.reportFlow.table.${k}`)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-700/60">
                        {boxScore.map((r) => (
                          <tr key={r.label} className="text-white/80">
                            <td className="py-1.5 pr-2 font-semibold text-white">{r.label}</td>
                            <td className="py-1.5 pr-2 text-right font-bold text-brand-500">{r.pts}</td>
                            <td className="py-1.5 pr-2 text-right">{r.ast}</td>
                            <td className="py-1.5 pr-2 text-right">{r.reb}</td>
                            <td className="py-1.5 pr-2 text-right">{r.stl}</td>
                            <td className="py-1.5 pr-2 text-right">{r.blk}</td>
                            <td className="py-1.5 pr-2 text-right">{r.to}</td>
                            <td className="py-1.5 pr-2 text-right">{r.fouls}</td>
                            <td className="py-1.5 pr-2 text-right font-bold">{r.eff}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* clips */}
                <section className="rounded-xl border border-ink-700 bg-ink-900 p-4">
                  <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-500">
                    {t('matchScouting.reportFlow.clipsAttached')} ({clips.length})
                  </h3>
                  {clips.length === 0 ? (
                    <p className="text-[13px] text-white/40">{t('matchScouting.reportFlow.noClips')}</p>
                  ) : (
                    <ul className="space-y-2">
                      {clips.map((c) => (
                        <li key={c.id} className="flex items-start gap-2 rounded-lg bg-ink-800 px-3 py-2">
                          <Zap size={14} className="mt-0.5 shrink-0 text-brand-500" aria-hidden />
                          <div>
                            <p className="tnum text-[12px] font-semibold text-white">
                              {c.quarter} {c.clock} · {c.playerLabel} · {t(`matchScouting.clipSheet.types.${c.typeKey}`)}
                            </p>
                            {c.comment && <p className="text-[12px] text-white/50">{c.comment}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* evaluation */}
                <section className="rounded-xl border border-ink-700 bg-ink-900 p-4">
                  <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-500">
                    {t('matchScouting.reportFlow.evalTitle')}
                  </h3>
                  {trackedLabels.length > 1 && (
                    <div className="mb-4 flex gap-2 overflow-x-auto">
                      {trackedLabels.map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setReportTab(label)}
                          className={cn(
                            'h-9 shrink-0 rounded-full border px-3.5 text-[12px] font-semibold',
                            label === activeReportTab ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-700 text-white/60',
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="space-y-4">
                    {evalSliders.map((k) => (
                      <div key={k}>
                        <div className="mb-1 flex items-center justify-between text-[13px]">
                          <label htmlFor={`eval-${k}`} className="font-semibold text-white/80">
                            {t(`matchScouting.reportFlow.${k}`)}
                          </label>
                          <span className="tnum rounded-md bg-ink-800 px-2 py-0.5 font-display text-[13px] font-extrabold text-brand-500">
                            {activeEval[k].toFixed(1)}
                          </span>
                        </div>
                        <input
                          id={`eval-${k}`}
                          type="range"
                          min={0}
                          max={10}
                          step={0.1}
                          value={activeEval[k]}
                          onChange={(e) => setActiveEval({ [k]: Number(e.target.value) })}
                          className="h-11 w-full accent-brand-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    <p className="text-[13px] font-semibold text-white/80">{t('matchScouting.reportFlow.strengths')}</p>
                    <p className="mb-2 text-[11px] text-white/40">{t('matchScouting.reportFlow.chipsHint')}</p>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {STRENGTH_CHIPS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            setActiveEval({ strengths: activeEval.strengths ? `${activeEval.strengths}, ${t(`matchScouting.reportFlow.chips.${c}`)}` : t(`matchScouting.reportFlow.chips.${c}`) })
                          }
                          className="min-h-9 rounded-full border border-ink-700 px-3 text-[12px] text-white/60 hover:border-brand-500 hover:text-white"
                        >
                          {t(`matchScouting.reportFlow.chips.${c}`)}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={activeEval.strengths}
                      onChange={(e) => setActiveEval({ strengths: e.target.value })}
                      placeholder={t('matchScouting.reportFlow.strengthsPh')}
                      rows={2}
                      className="w-full rounded-lg border border-ink-700 bg-ink-950 p-3 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-[13px] font-semibold text-white/80">{t('matchScouting.reportFlow.devAreas')}</p>
                    <div className="mb-2 mt-1 flex flex-wrap gap-2">
                      {DEV_CHIPS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            setActiveEval({ dev: activeEval.dev ? `${activeEval.dev}, ${t(`matchScouting.reportFlow.chips.${c}`)}` : t(`matchScouting.reportFlow.chips.${c}`) })
                          }
                          className="min-h-9 rounded-full border border-ink-700 px-3 text-[12px] text-white/60 hover:border-brand-500 hover:text-white"
                        >
                          {t(`matchScouting.reportFlow.chips.${c}`)}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={activeEval.dev}
                      onChange={(e) => setActiveEval({ dev: e.target.value })}
                      placeholder={t('matchScouting.reportFlow.devPh')}
                      rows={2}
                      className="w-full rounded-lg border border-ink-700 bg-ink-950 p-3 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-[13px] font-semibold text-white/80">{t('matchScouting.reportFlow.recommendation')}</p>
                    <div className="flex flex-wrap gap-2">
                      {(['high', 'follow', 'monitor', 'notNow'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setActiveEval({ rec: r })}
                          className={cn(
                            'min-h-11 rounded-full border px-4 text-[12px] font-bold',
                            activeEval.rec === r ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-700 text-white/60',
                          )}
                        >
                          {t(`matchScouting.reportFlow.rec.${r}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    {...padMotion}
                    onClick={() => {
                      buzz(20);
                      submitReport();
                    }}
                    className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 font-display text-[16px] font-extrabold text-white"
                  >
                    <FileText size={18} aria-hidden />
                    {t('matchScouting.reportFlow.submit')}
                  </motion.button>
                </section>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const exitDialog = (
    <AnimatePresence>
      {exitOpen && (
        <>
          <motion.div
            key="exit-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-ink-950/60 backdrop-blur-sm"
            onClick={() => setExitOpen(false)}
          />
          <motion.div
            key="exit-modal"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            role="alertdialog"
            aria-label={t('matchScouting.exitTitle')}
            className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-ink-700 bg-ink-900 p-6"
          >
            <div className="mb-2 flex items-center gap-2">
              <ShieldAlert size={20} className="text-warning" aria-hidden />
              <h2 className="font-display text-[18px] font-extrabold text-white">{t('matchScouting.exitTitle')}</h2>
            </div>
            <p className="text-[14px] text-white/60">
              {queueCount > 0 ? t('matchScouting.exitUnsynced', { n: queueCount }) : t('matchScouting.exitSynced')}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setExitOpen(false)}
                className="h-12 rounded-lg bg-brand-500 px-5 text-[14px] font-bold text-white"
              >
                {t('matchScouting.exitStay')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="h-12 rounded-lg border border-ink-700 px-5 text-[14px] font-semibold text-white/70"
              >
                {t('matchScouting.exitLeave')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  /* --------------------------------- render --------------------------------- */

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-ink-950 text-white" style={{ overscrollBehavior: 'none' }}>
      {phase !== 'pre' && topBar}

      {phase === 'pre' && preScreen}
      {phase === 'finished' && postScreen}

      {phase === 'live' && (
        <>
          {/* mobile portrait (design.md sec. 11 — field mode) */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 py-3 md:hidden">
            <div className="px-4">{scoreboard}</div>
            <div className="px-4">{playerStrip}</div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-1">{eventPad}</div>
            <div className="shrink-0 px-4">{feed}</div>
          </div>
          {/* tablet 2-col / desktop 3-col */}
          <div className="hidden min-h-0 flex-1 gap-4 p-4 md:grid md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_0.9fr]">
            <div className="min-h-0 overflow-y-auto pr-1">{eventPad}</div>
            <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
              {scoreboard}
              {playerStrip}
              {feed}
            </div>
            <div className="flex min-h-0 flex-col gap-4 overflow-y-auto md:col-span-2 lg:col-span-1">
              {rosterPanel}
              {clipsPanel}
            </div>
          </div>
          {bottomBar}
        </>
      )}

      {pickerSheet}
      {clipSheet}
      {logDrawer}
      {reportOverlay}
      {exitDialog}
      <ToastStack toasts={toasts} />
    </div>
  );
}
