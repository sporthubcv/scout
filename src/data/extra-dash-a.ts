/**
 * Extra demo data for the role dashboards built by agent "dashboards-a"
 * (athlete / scout / club). All fictional (design.md sec. 10).
 * Demo season = 2027. Persisted demo CRUD lives under `shs-*` localStorage keys.
 */
import type { VerificationStatus } from './types';

/* ----------------------------- Athlete (Erick Semedo) ----------------------------- */

export interface AthleteRecentMatch {
  id: string;
  date: string; // ISO
  competition: string;
  opponent: string;
  result: string; // e.g. 'V 78–70'
  pts: number;
  ast: number;
  reb: number;
  verification: VerificationStatus;
}

export const athleteRecentMatches: AthleteRecentMatch[] = [
  { id: 'am1', date: '2027-01-24', competition: 'INTER LICEU 2027', opponent: 'Estrela do Sul', result: 'V 78–70', pts: 24, ast: 7, reb: 5, verification: 'verified' },
  { id: 'am2', date: '2027-01-18', competition: 'INTER LICEU 2027', opponent: 'Liceu Domingos Ramos', result: 'V 66–61', pts: 19, ast: 6, reb: 4, verification: 'verified' },
  { id: 'am3', date: '2027-01-11', competition: 'INTER LICEU 2027', opponent: 'União Tira Chapéu', result: 'D 58–63', pts: 21, ast: 4, reb: 6, verification: 'pending' },
  { id: 'am4', date: '2026-12-14', competition: 'Torneio Abertura Praia', opponent: 'Académico do Mindelo', result: 'V 72–55', pts: 16, ast: 8, reb: 3, verification: 'verified' },
  { id: 'am5', date: '2026-12-06', competition: 'Torneio Abertura Praia', opponent: 'Escola Tira Chapéu', result: 'V 81–49', pts: 14, ast: 9, reb: 2, verification: 'selfReported' },
];

/** OVR evolution 2026 → 2027 (design: 72→77→82 line, season 2026/27). */
export const athleteOvrEvolution = [
  { month: 'Set', ovr: 72 },
  { month: 'Out', ovr: 73 },
  { month: 'Nov', ovr: 75 },
  { month: 'Dez', ovr: 77 },
  { month: 'Jan', ovr: 78 },
  { month: 'Fev', ovr: 80 },
];

/** Ranking positions sparkline (last 5 weeks, #5 → #2). */
export const athleteRankingHistory = [5, 4, 3, 3, 2];

export interface AthleteEvidenceRow {
  id: string;
  file: string;
  stat: string;
  submitted: string;
  status: VerificationStatus;
  note?: string;
}

export const athleteEvidenceRows: AthleteEvidenceRow[] = [
  { id: 'ev-a1', file: 'folha-jogo-j3.jpg', stat: '21 PTS vs União Tira Chapéu', submitted: '2027-01-12', status: 'pending' },
  { id: 'ev-a2', file: 'compilacao-3pt.mp4', stat: '3P% 38% · 2026/27', submitted: '2027-01-09', status: 'pending' },
  { id: 'ev-a3', file: 'folha-jogo-torneio.pdf', stat: '16 PTS vs Académico', submitted: '2026-12-15', status: 'verified', note: 'Ficha oficial validada.' },
];

/* ------------------------------ Scout (demo persona) ------------------------------ */

export interface ScoutWatchEntry {
  athleteId: string;
  lastEval: number; // /10
  trend: number; // +/- vs previous eval
  spark: number[];
}

export const scoutWatchlist: ScoutWatchEntry[] = [
  { athleteId: 'erick-semedo', lastEval: 8.7, trend: 0.4, spark: [7.9, 8.1, 8.3, 8.7] },
  { athleteId: 'kelvin-delgado', lastEval: 7.6, trend: 0.2, spark: [7.1, 7.2, 7.4, 7.6] },
  { athleteId: 'nadia-fortes', lastEval: 8.1, trend: -0.1, spark: [8.0, 8.2, 8.2, 8.1] },
  { athleteId: 'ivanilson-tavares', lastEval: 7.2, trend: 0.5, spark: [6.6, 6.8, 6.7, 7.2] },
  { athleteId: 'tatiana-lopes', lastEval: 6.9, trend: 0.1, spark: [6.7, 6.8, 6.8, 6.9] },
];

export interface ScoutGame {
  id: string;
  competition: string;
  home: string;
  away: string;
  venue: string;
  date: string; // ISO
  live?: boolean;
}

export const scoutUpcomingGames: ScoutGame[] = [
  { id: 'demo-match', competition: 'INTER LICEU 2027 · Grupo A', home: 'Atlético Achada', away: 'Estrela do Sul', venue: 'Pavilhão da Várzea, Praia', date: '2027-01-24T17:30:00', live: true },
  { id: 'g2', competition: 'INTER LICEU 2027 · Grupo B', home: 'Escola Tira Chapéu', away: 'Liceu Domingos Ramos', venue: 'Pavilhão da Várzea, Praia', date: '2027-01-28T17:00:00' },
  { id: 'g3', competition: 'Liga Juvenil Santiago Sul', home: 'Desportivo da Baía Sub-17', away: 'Clube Farol de São Vicente Sub-17', venue: 'Campo da Baía, Mindelo', date: '2027-02-01T15:00:00' },
];

export interface ScoutClip {
  id: string;
  thumb: string;
  athlete: string;
  event: string;
  clock: string;
  game: string;
}

export const scoutClips: ScoutClip[] = [
  { id: 'c1', thumb: '/video-thumb-1.jpg', athlete: 'Erick Semedo', event: '3PT', clock: '06:32 · Q3', game: 'Atlético × Estrela' },
  { id: 'c2', thumb: '/video-thumb-4.jpg', athlete: 'Kelvin Delgado', event: 'STL', clock: '06:41 · Q3', game: 'Atlético × Estrela' },
  { id: 'c3', thumb: '/video-thumb-1.jpg', athlete: 'Erick Semedo', event: 'DUNK', clock: '07:29 · Q3', game: 'Atlético × Estrela' },
  { id: 'c4', thumb: '/video-thumb-5.jpg', athlete: 'Nádia Fortes', event: 'AST', clock: '06:11 · Q3', game: 'Atlético × Estrela' },
  { id: 'c5', thumb: '/video-thumb-2.jpg', athlete: 'Mário Anoceto', event: 'Golo', clock: "88'", game: 'Baía × Farol' },
  { id: 'c6', thumb: '/video-thumb-3.jpg', athlete: 'Anisa Monteiro', event: '100m', clock: 'Final A', game: 'Meeting Praia' },
];

/** Events registered per scouted game (activity area chart). */
export const scoutActivityByGame = [
  { game: 'J1', events: 18 },
  { game: 'J2', events: 26 },
  { game: 'J3', events: 22 },
  { game: 'J4', events: 34 },
  { game: 'J5', events: 29 },
  { game: 'J6', events: 41 },
  { game: 'J7', events: 38 },
];

export interface ScoutDraft {
  id: string;
  athleteId: string;
  updatedAt: string;
  progress: number; // %
}

export const scoutDrafts: ScoutDraft[] = [
  { id: 'd1', athleteId: 'erick-semedo', updatedAt: '2027-01-24', progress: 70 },
  { id: 'd2', athleteId: 'kelvin-delgado', updatedAt: '2027-01-22', progress: 35 },
];

export interface ScoutMatchHistoryRow {
  id: string;
  match: string;
  date: string;
  events: number;
  clips: number;
  hasReport: boolean;
}

export const scoutMatchHistory: ScoutMatchHistoryRow[] = [
  { id: 'h1', match: 'Liceu Achada Grande × União Tira Chapéu', date: '2027-01-22', events: 38, clips: 9, hasReport: true },
  { id: 'h2', match: 'Desportivo da Baía Sub-17 × Farol SV Sub-17', date: '2027-01-18', events: 27, clips: 6, hasReport: true },
  { id: 'h3', match: 'Atlético Achada × Académico do Mindelo', date: '2026-12-14', events: 31, clips: 7, hasReport: false },
];

export type RecoColumn = 'follow' | 'recommended' | 'accepted';

export const scoutRecoBoard: Record<RecoColumn, string[]> = {
  follow: ['tatiana-lopes', 'ivanilson-tavares'],
  recommended: ['kelvin-delgado', 'nadia-fortes'],
  accepted: ['erick-semedo'],
};

/** Rating categories for the scout report form (i18n labels in scoutDash.form.rating.*). */
export const scoutRatingCategories = ['technique', 'tactical', 'physical', 'mental', 'potential'] as const;
export type ScoutRatingCategory = (typeof scoutRatingCategories)[number];

/* ------------------------------ Club (Atlético Achada) ------------------------------ */

export interface ClubUpcomingMatch {
  id: string;
  competition: string;
  opponent: string;
  venue: string;
  date: string;
  home: boolean;
}

export const clubUpcomingMatches: ClubUpcomingMatch[] = [
  { id: 'cm1', competition: 'INTER LICEU 2027', opponent: 'Estrela do Sul', venue: 'Pavilhão da Várzea, Praia', date: '2027-01-24T17:30:00', home: true },
  { id: 'cm2', competition: 'INTER LICEU 2027', opponent: 'Liceu Domingos Ramos', venue: 'Pavilhão Achada Santo António', date: '2027-01-31T16:00:00', home: false },
  { id: 'cm3', competition: 'Torneio Abertura Praia', opponent: 'União Tira Chapéu', venue: 'Pavilhão da Várzea, Praia', date: '2027-02-07T17:00:00', home: true },
];

/** Team performance, last 10 games: bars = PTS, line = efficiency %. */
export const clubPerformanceSeries = [
  { game: 'J1', pts: 58, eff: 44 },
  { game: 'J2', pts: 64, eff: 48 },
  { game: 'J3', pts: 49, eff: 39 },
  { game: 'J4', pts: 71, eff: 52 },
  { game: 'J5', pts: 66, eff: 50 },
  { game: 'J6', pts: 78, eff: 55 },
  { game: 'J7', pts: 60, eff: 46 },
  { game: 'J8', pts: 74, eff: 53 },
  { game: 'J9', pts: 81, eff: 58 },
  { game: 'J10', pts: 77, eff: 56 },
];

export interface ClubDevHighlight {
  athleteId: string;
  delta: number;
  note: string;
}

export const clubDevHighlights: ClubDevHighlight[] = [
  { athleteId: 'erick-semedo', delta: 6, note: '72 → 78 OVR' },
  { athleteId: 'ivanilson-tavares', delta: 4, note: '67 → 71 OVR' },
  { athleteId: 'kelvin-delgado', delta: 3, note: '69 → 72 OVR' },
];

export const clubUsageMeters = {
  games: { used: 18, total: 20 },
  athletes: { used: 42, total: 50 },
  scouts: { used: 2, total: 3 },
  reports: { used: 61, total: 100 },
  videoGb: { used: 312, total: 500 },
};

export interface ClubStaffMember {
  id: string;
  name: string;
  role: 'coach' | 'assistant' | 'physio' | 'manager';
}

export const clubStaff: ClubStaffMember[] = [
  { id: 'st1', name: 'Paulo Andrade', role: 'coach' },
  { id: 'st2', name: 'Rui Fonseca', role: 'assistant' },
  { id: 'st3', name: 'Dina Costa', role: 'physio' },
  { id: 'st4', name: 'Adilson Rocha', role: 'manager' },
];

export interface ClubMatchRow {
  id: string;
  date: string;
  competition: string;
  opponent: string;
  result: string | null; // null = scheduled
  scoutingAssigned: boolean;
  statsVerifiedByClub: boolean;
}

export const clubMatchRows: ClubMatchRow[] = [
  { id: 'gm1', date: '2027-01-24T17:30:00', competition: 'INTER LICEU 2027', opponent: 'Estrela do Sul', result: null, scoutingAssigned: true, statsVerifiedByClub: false },
  { id: 'gm2', date: '2027-01-18T16:00:00', competition: 'INTER LICEU 2027', opponent: 'Liceu Domingos Ramos', result: 'V 66–61', scoutingAssigned: true, statsVerifiedByClub: true },
  { id: 'gm3', date: '2027-01-11T17:00:00', competition: 'INTER LICEU 2027', opponent: 'União Tira Chapéu', result: 'D 58–63', scoutingAssigned: false, statsVerifiedByClub: true },
  { id: 'gm4', date: '2026-12-14T15:30:00', competition: 'Torneio Abertura Praia', opponent: 'Académico do Mindelo', result: 'V 72–55', scoutingAssigned: false, statsVerifiedByClub: false },
];

/** Per-player season averages (roster table + stats tab). */
export interface ClubPlayerRow {
  athleteId: string;
  games: number;
  ppg: number;
  apg: number;
  rpg: number;
}

export const clubPlayerStats: ClubPlayerRow[] = [
  { athleteId: 'erick-semedo', games: 24, ppg: 18.4, apg: 5.8, rpg: 4.1 },
  { athleteId: 'ivanilson-tavares', games: 22, ppg: 11.6, apg: 1.2, rpg: 11.2 },
  { athleteId: 'kelvin-delgado', games: 21, ppg: 13.9, apg: 2.4, rpg: 5.6 },
  { athleteId: 'nadia-fortes', games: 20, ppg: 14.2, apg: 3.1, rpg: 3.8 },
  { athleteId: 'tatiana-lopes', games: 18, ppg: 8.7, apg: 6.1, rpg: 2.9 },
];

export interface ClubScoutedMatch {
  id: string;
  match: string;
  date: string;
  events: number;
  clips: number;
  report: boolean;
}

export const clubScoutedMatches: ClubScoutedMatch[] = [
  { id: 's1', match: 'Atlético Achada × Estrela do Sul', date: '2027-01-24', events: 41, clips: 12, report: true },
  { id: 's2', match: 'Liceu Achada Grande × União Tira Chapéu', date: '2027-01-22', events: 38, clips: 9, report: true },
  { id: 's3', match: 'Atlético Achada × Liceu Domingos Ramos', date: '2027-01-18', events: 29, clips: 7, report: false },
];

export type ShortlistColumn = 'observe' | 'contact' | 'sign';

export const clubShortlistBoard: Record<ShortlistColumn, string[]> = {
  observe: ['tatiana-lopes', 'helio-varela'],
  contact: ['nadia-fortes', 'dario-corrreia'],
  sign: ['kelvin-delgado'],
};

export interface ClubInvoice {
  id: string;
  period: string;
  amountCve: number;
  paid: boolean;
}

export const clubInvoices: ClubInvoice[] = [
  { id: 'inv-2027-01', period: '2027-01', amountCve: 4900, paid: true },
  { id: 'inv-2026-12', period: '2026-12', amountCve: 4900, paid: true },
  { id: 'inv-2026-11', period: '2026-11', amountCve: 4900, paid: true },
  { id: 'inv-2026-10', period: '2026-10', amountCve: 2900, paid: true },
];

/** Club athletes in public rankings (category chips). */
export interface ClubRankingRow {
  athleteId: string;
  category: string;
  rank: number;
  delta: number;
}

export const clubRankingRows: ClubRankingRow[] = [
  { athleteId: 'erick-semedo', category: 'Sub-21 · Santiago', rank: 2, delta: 1 },
  { athleteId: 'ivanilson-tavares', category: 'Sub-21 · Santiago', rank: 9, delta: 2 },
  { athleteId: 'kelvin-delgado', category: 'Sub-18 · Nacional', rank: 6, delta: -1 },
];
