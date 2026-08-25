/**
 * Extra demo data for the dashboards-b scope (organizer / sponsor / admin).
 * All data is FICTIONAL (design.md sec. 10). Values marked demo throughout.
 * Persistence keys used by these pages (cleared by "Repor dados de demonstração"):
 *  - shs-verification-decisions : Record<queueItemId, { status, reason?, at }>
 *  - shs-audit-extra            : AuditLog[] appended by admin actions
 *  - shs-org-published          : string[] of published game ids (organizer)
 *  - shs-org-competitions       : organizer-created draft competitions
 */
import type { Sport } from './types';

/* ------------------------------------------------------------------ */
/* Organizer — INTER LICEU 2027 management                             */
/* ------------------------------------------------------------------ */

export interface OrgTask {
  id: string;
  /** i18n key under organizerDash.overview.tasks */
  labelKey: string;
  done: boolean;
}

export const orgTasks: OrgTask[] = [
  { id: 'task-1', labelKey: 't1', done: false },
  { id: 'task-2', labelKey: 't2', done: false },
  { id: 'task-3', labelKey: 't3', done: false },
];

export interface OrgGame {
  id: string;
  round: number; // jornada
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string; // ISO
  venue: string;
  status: 'finished' | 'live' | 'scheduled';
  group: string;
  published: boolean;
}

const V = 'Pavilhão da Várzea, Praia';

export const orgGames: OrgGame[] = [
  // Jornada 6 (terminada — resultados por publicar em 2 jogos)
  { id: 'g61', round: 6, home: 'Liceu Achada Grande', away: 'Estrela do Sul', homeScore: 71, awayScore: 58, date: '2027-01-20T16:00:00', venue: V, status: 'finished', group: 'A', published: true },
  { id: 'g62', round: 6, home: 'Atlético Achada', away: 'Escola Tira Chapéu', homeScore: 64, awayScore: 60, date: '2027-01-20T18:00:00', venue: V, status: 'finished', group: 'B', published: false },
  { id: 'g63', round: 6, home: 'União Tira Chapéu', away: 'Liceu de Palmarejo', homeScore: 69, awayScore: 55, date: '2027-01-21T17:00:00', venue: V, status: 'finished', group: 'C', published: false },
  // Jornada 7 (hoje — 1 live + 2 agendados)
  { id: 'g71', round: 7, home: 'Atlético Achada', away: 'Estrela do Sul', homeScore: 54, awayScore: 49, date: '2027-01-24T17:30:00', venue: V, status: 'live', group: 'A', published: false },
  { id: 'g72', round: 7, home: 'Escola Tira Chapéu', away: 'Liceu Domingos Ramos', homeScore: null, awayScore: null, date: '2027-01-24T19:00:00', venue: V, status: 'scheduled', group: 'B', published: false },
  { id: 'g73', round: 7, home: 'Escola do Plateau', away: 'Escola da Várzea', homeScore: null, awayScore: null, date: '2027-01-24T19:30:00', venue: 'Pavilhão do Plateau, Praia', status: 'scheduled', group: 'C', published: false },
  // Jornada 8 (agendada)
  { id: 'g81', round: 8, home: 'Liceu Achada Grande', away: 'Atlético Achada', homeScore: null, awayScore: null, date: '2027-01-28T17:00:00', venue: V, status: 'scheduled', group: 'A', published: false },
  { id: 'g82', round: 8, home: 'União Tira Chapéu', away: 'Escola do Plateau', homeScore: null, awayScore: null, date: '2027-01-28T19:00:00', venue: V, status: 'scheduled', group: 'C', published: false },
];

export interface OrgPlayer {
  id: string;
  name: string;
  team: string;
  group: string;
  age: number;
  ovr: number;
  ppg: string;
  verification: 'verified' | 'pending' | 'selfReported';
}

export const orgPlayers: OrgPlayer[] = [
  { id: 'p1', name: 'Erick Semedo', team: 'Atlético Achada', group: 'A', age: 17, ovr: 78, ppg: '18.4', verification: 'verified' },
  { id: 'p2', name: 'Nádia Fortes', team: 'Estrela do Sul', group: 'A', age: 18, ovr: 74, ppg: '16.1', verification: 'verified' },
  { id: 'p3', name: 'Kelvin Delgado', team: 'União Tira Chapéu', group: 'C', age: 17, ovr: 72, ppg: '14.8', verification: 'pending' },
  { id: 'p4', name: 'Ivanilson Tavares', team: 'Atlético Achada', group: 'A', age: 19, ovr: 71, ppg: '12.6', verification: 'pending' },
  { id: 'p5', name: 'Tatiana Lopes', team: 'Liceu Achada Grande', group: 'A', age: 16, ovr: 69, ppg: '13.9', verification: 'verified' },
  { id: 'p6', name: 'Dário Correia', team: 'Escola Tira Chapéu', group: 'B', age: 17, ovr: 66, ppg: '11.3', verification: 'selfReported' },
  { id: 'p7', name: 'Hélio Varela', team: 'Escola do Plateau', group: 'C', age: 18, ovr: 64, ppg: '10.7', verification: 'selfReported' },
  { id: 'p8', name: 'Silvano Ramos', team: 'Liceu Domingos Ramos', group: 'B', age: 17, ovr: 63, ppg: '9.8', verification: 'pending' },
];

export interface OrgSponsorSlot {
  id: string;
  /** i18n key under organizerDash.sponsors.slots */
  nameKey: string;
  occupiedBy: string | null; // placeholder name or null = available
  revenueCve: number;
}

export const orgSponsorSlots: OrgSponsorSlot[] = [
  { id: 'slot-naming', nameKey: 'naming', occupiedBy: 'Marca Parceira A', revenueCve: 25000 },
  { id: 'slot-mvp', nameKey: 'mvp', occupiedBy: 'Parceiro Oficial — espaço demo', revenueCve: 12000 },
  { id: 'slot-talent', nameKey: 'talent', occupiedBy: 'Marca Parceira B', revenueCve: 9000 },
  { id: 'slot-broadcast', nameKey: 'broadcast', occupiedBy: null, revenueCve: 0 },
];

export const orgRevenue = {
  grossCve: 74500,
  platformCostCve: 11900,
  byMonth: [
    { month: 'Nov', inscricoes: 22000, patrocinios: 0 },
    { month: 'Dez', inscricoes: 13500, patrocinios: 25000 },
    { month: 'Jan', inscricoes: 0, patrocinios: 21000 },
  ] as { month: string; inscricoes: number; patrocinios: number }[],
  invoices: [
    { id: 'FAT-2027-014', conceptKey: 'inv1', cve: 25000, status: 'paid' as const, date: '2026-12-18' },
    { id: 'FAT-2027-019', conceptKey: 'inv2', cve: 12000, status: 'paid' as const, date: '2027-01-09' },
    { id: 'FAT-2027-023', conceptKey: 'inv3', cve: 9000, status: 'pending' as const, date: '2027-01-21' },
  ],
};

export interface OrgScoutAssignment {
  id: string;
  name: string;
  gamesCovered: number;
  reports: number;
  clips: number;
}

export const orgScouts: OrgScoutAssignment[] = [
  { id: 'os1', name: 'Carlos Moniz', gamesCovered: 9, reports: 14, clips: 61 },
  { id: 'os2', name: 'Sandra Pires', gamesCovered: 6, reports: 8, clips: 34 },
  { id: 'os3', name: 'Nuno Évora', gamesCovered: 3, reports: 4, clips: 17 },
];

export const orgCoverage = { gamesWithScouting: 18, gamesTotal: 24 };

/** Creation wizard pricing engine (demo) — mirrors the pricing calculator logic. */
export const wizardPricing = {
  baseCve: 15000, // per competition
  perTeamCve: 2500,
  perGroupCve: 1500,
  extras: {
    matchScouting: 9000,
    video: 6000,
    advancedStats: 4500,
  },
  perScoutCve: 1800,
};

export interface WizardState {
  name: string;
  sport: Sport;
  season: string;
  island: string;
  rules: string;
  teams: number;
  format: 'league' | 'cup';
  matchScouting: boolean;
  video: boolean;
  advancedStats: boolean;
  scouts: number;
}

export const wizardDefaults: WizardState = {
  name: '',
  sport: 'basketball',
  season: '2027/28',
  island: 'Santiago',
  rules: '',
  teams: 10,
  format: 'league',
  matchScouting: true,
  video: false,
  advancedStats: true,
  scouts: 4,
};

export function estimateWizardPrice(w: WizardState): number {
  const groups = w.teams > 8 ? 3 : w.teams > 4 ? 2 : 1;
  let total = wizardPricing.baseCve + w.teams * wizardPricing.perTeamCve + groups * wizardPricing.perGroupCve;
  if (w.matchScouting) total += wizardPricing.extras.matchScouting;
  if (w.video) total += wizardPricing.extras.video;
  if (w.advancedStats) total += wizardPricing.extras.advancedStats;
  total += w.scouts * wizardPricing.perScoutCve;
  return total;
}

export function wizardGroups(teams: number): string[] {
  const count = teams > 8 ? 3 : teams > 4 ? 2 : 1;
  return ['A', 'B', 'C'].slice(0, count);
}

/* ------------------------------------------------------------------ */
/* Sponsor — "Marca Parceira A" performance (all metrics simulated)    */
/* ------------------------------------------------------------------ */

export const sponsorKpis = {
  reach: 128400,
  impressions: 412700,
  contentViews: 96200,
  clicks: 3412,
  athletesReached: 1284,
  gamesSponsored: 31,
  deltas: { reach: 12.4, impressions: 9.1, contentViews: 15.8, clicks: 6.3, athletesReached: 4.2, gamesSponsored: 10.7 },
};

/** 12 weeks of campaign performance (W1..W12). */
export const sponsorWeekly = [
  { week: 'S1', reach: 7200, impressions: 24100, clicks: 188 },
  { week: 'S2', reach: 7800, impressions: 26300, clicks: 204 },
  { week: 'S3', reach: 8400, impressions: 28900, clicks: 231 },
  { week: 'S4', reach: 9100, impressions: 30400, clicks: 246 },
  { week: 'S5', reach: 8900, impressions: 31200, clicks: 239 },
  { week: 'S6', reach: 9800, impressions: 33600, clicks: 262 },
  { week: 'S7', reach: 10600, impressions: 36100, clicks: 291 },
  { week: 'S8', reach: 11200, impressions: 38400, clicks: 305 },
  { week: 'S9', reach: 12100, impressions: 41200, clicks: 332 },
  { week: 'S10', reach: 11900, impressions: 40800, clicks: 324 },
  { week: 'S11', reach: 12700, impressions: 43100, clicks: 349 },
  { week: 'S12', reach: 14700, impressions: 38500, clicks: 441 },
];

export interface SponsorCampaign {
  id: string;
  /** i18n key under sponsorDash.campaigns.items */
  nameKey: string;
  propertyKey: string; // i18n key under sponsorDash.properties.catalog
  period: string;
  reach: number;
  ctr: number; // %
  budgetSpentCve: number;
  budgetTotalCve: number;
  status: 'active' | 'paused' | 'ended';
  spark: number[];
}

export const sponsorCampaigns: SponsorCampaign[] = [
  { id: 'c1', nameKey: 'camp1', propertyKey: 'talent', period: 'Jan – Mar 2027', reach: 48200, ctr: 3.4, budgetSpentCve: 18200, budgetTotalCve: 27000, status: 'active', spark: [8, 9, 10, 12, 11, 14] },
  { id: 'c2', nameKey: 'camp2', propertyKey: 'mvp', period: 'Jan – Mar 2027', reach: 31500, ctr: 2.8, budgetSpentCve: 9800, budgetTotalCve: 18000, status: 'active', spark: [5, 6, 6, 8, 9, 10] },
  { id: 'c3', nameKey: 'camp3', propertyKey: 'rankings', period: 'Dez 2026', reach: 18900, ctr: 2.1, budgetSpentCve: 12000, budgetTotalCve: 12000, status: 'ended', spark: [6, 7, 8, 8, 9, 9] },
  { id: 'c4', nameKey: 'camp4', propertyKey: 'tournaments', period: 'Fev 2027', reach: 12400, ctr: 1.9, budgetSpentCve: 2400, budgetTotalCve: 15000, status: 'paused', spark: [3, 4, 4, 5, 4, 5] },
];

export interface SponsorProperty {
  id: string;
  /** i18n key under sponsorDash.properties.catalog.<id> */
  key: string;
  fromCveMonthly: number;
  occupiedBy: string | null; // null = available
}

export const sponsorProperties: SponsorProperty[] = [
  { id: 'platform', key: 'platform', fromCveMonthly: 40000, occupiedBy: null },
  { id: 'rankings', key: 'rankings', fromCveMonthly: 12000, occupiedBy: 'Marca Parceira A' },
  { id: 'mvp', key: 'mvp', fromCveMonthly: 9000, occupiedBy: 'Marca Parceira A' },
  { id: 'talent', key: 'talent', fromCveMonthly: 11000, occupiedBy: 'Marca Parceira A' },
  { id: 'tournaments', key: 'tournaments', fromCveMonthly: 25000, occupiedBy: null },
  { id: 'events', key: 'events', fromCveMonthly: 8000, occupiedBy: null },
  { id: 'scouting', key: 'scouting', fromCveMonthly: 6500, occupiedBy: 'Marca Parceira B' },
  { id: 'opportunities', key: 'opportunities', fromCveMonthly: 5000, occupiedBy: null },
  { id: 'scholarships', key: 'scholarships', fromCveMonthly: 15000, occupiedBy: null },
  { id: 'equipment', key: 'equipment', fromCveMonthly: 10000, occupiedBy: 'Marca Parceira B' },
];

export const sponsorAudience = {
  islands: [
    { name: 'Santiago', pct: 54 },
    { name: 'São Vicente', pct: 21 },
    { name: 'Sal', pct: 9 },
    { name: 'Fogo', pct: 7 },
    { name: 'Santo Antão', pct: 5 },
    { name: 'Outras', pct: 4 },
  ],
  ages: [
    { name: '14–17', pct: 38 },
    { name: '18–21', pct: 31 },
    { name: '22–29', pct: 19 },
    { name: '30+', pct: 12 },
  ],
  sports: [
    { name: 'basketball', pct: 46 },
    { name: 'football', pct: 37 },
    { name: 'athletics', pct: 17 },
  ],
  ageGroups: [
    { group: 'Sub-16', male: 62, female: 38 },
    { group: 'Sub-18', male: 58, female: 42 },
    { group: 'Sub-21', male: 64, female: 36 },
    { group: 'Sénior', male: 71, female: 29 },
  ],
  devices: [
    { name: 'mobile', pct: 71 },
    { name: 'desktop', pct: 24 },
    { name: 'tablet', pct: 5 },
  ],
};

export const sponsorContent = [
  { id: 'ct1', key: 'preRoll', views: 41200, clicks: 1380 },
  { id: 'ct2', key: 'bannerRankings', views: 33600, clicks: 940 },
  { id: 'ct3', key: 'talentCard', views: 21400, clicks: 1092 },
] as const;

export const sponsorInvoices = [
  { id: 'FAT-SP-031', month: 'Nov 2026', cve: 21000, status: 'paid' as const },
  { id: 'FAT-SP-038', month: 'Dez 2026', cve: 27000, status: 'paid' as const },
  { id: 'FAT-SP-044', month: 'Jan 2027', cve: 27000, status: 'pending' as const },
];

export const sponsorReports = [
  { id: 'rep-nov', month: 'Nov 2026', reach: 89400, impressions: 301000 },
  { id: 'rep-dez', month: 'Dez 2026', reach: 102300, impressions: 348000 },
  { id: 'rep-jan', month: 'Jan 2027', reach: 128400, impressions: 412700 },
];

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export const adminKpis = {
  users: 1284,
  athletes: 312,
  clubs: 86,
  competitions: 24,
};

export const adminSignupsWeekly = [
  { week: 'S1', signups: 34 }, { week: 'S2', signups: 41 }, { week: 'S3', signups: 38 },
  { week: 'S4', signups: 52 }, { week: 'S5', signups: 47 }, { week: 'S6', signups: 61 },
  { week: 'S7', signups: 58 }, { week: 'S8', signups: 66 }, { week: 'S9', signups: 72 },
  { week: 'S10', signups: 69 }, { week: 'S11', signups: 81 }, { week: 'S12', signups: 88 },
];

export const adminVerificationsWeekly = [
  { week: 'S1', processed: 12 }, { week: 'S2', processed: 15 }, { week: 'S3', processed: 9 },
  { week: 'S4', processed: 18 }, { week: 'S5', processed: 14 }, { week: 'S6', processed: 21 },
  { week: 'S7', processed: 17 }, { week: 'S8', processed: 19 }, { week: 'S9', processed: 24 },
  { week: 'S10', processed: 20 }, { week: 'S11', processed: 26 }, { week: 'S12', processed: 23 },
];

export const adminActivityStrip = [3, 5, 4, 7, 6, 9, 8, 10, 7, 11, 12, 9, 13, 14, 10, 15, 12, 16, 14, 17, 18, 13, 19, 20, 16, 21, 18, 22];

export type VerificationKind = 'profile' | 'statistic' | 'evidence' | 'club' | 'scout' | 'competition';

export interface VerificationQueueItem {
  id: string;
  kind: VerificationKind;
  entity: string; // fictional name
  detail: string; // e.g. 'PPG 18.4 · Inter Liceu 2027'
  submittedDaysAgo: number;
  priority: 'high' | 'normal';
  claimed: { label: string; value: string }[];
  evidenceLabel: string;
  history: string; // short demo history note (proper-noun free)
}

export const verificationQueueSeed: VerificationQueueItem[] = [
  {
    id: 'vq1', kind: 'statistic', entity: 'Erick Semedo', detail: '3P% 38% · Inter Liceu 2027',
    submittedDaysAgo: 1, priority: 'high',
    claimed: [{ label: '3P%', value: '38%' }, { label: '3PM/3PA', value: '19/50' }],
    evidenceLabel: 'evVideo', history: 'hist1',
  },
  {
    id: 'vq2', kind: 'statistic', entity: 'Ivanilson Tavares', detail: 'RPG 11.2 · Inter Liceu 2027',
    submittedDaysAgo: 2, priority: 'normal',
    claimed: [{ label: 'RPG', value: '11.2' }, { label: 'Jogos', value: '4' }],
    evidenceLabel: 'evMatchSheet', history: 'hist2',
  },
  {
    id: 'vq3', kind: 'profile', entity: 'Kelvin Delgado', detail: 'Perfil de atleta · Sub-18',
    submittedDaysAgo: 2, priority: 'high',
    claimed: [{ label: 'Ano de nascimento', value: '2009' }, { label: 'Altura', value: '191 cm' }],
    evidenceLabel: 'evDocument', history: 'hist3',
  },
  {
    id: 'vq4', kind: 'evidence', entity: 'Yara Andrade', detail: '800m 2:14.3 · Meeting Praia',
    submittedDaysAgo: 3, priority: 'normal',
    claimed: [{ label: '800m', value: '2:14.3' }],
    evidenceLabel: 'evVideo', history: 'hist4',
  },
  {
    id: 'vq5', kind: 'club', entity: 'União Tira Chapéu', detail: 'Registo de clube · Santiago',
    submittedDaysAgo: 4, priority: 'normal',
    claimed: [{ label: 'Fundado', value: '2010' }, { label: 'Modalidades', value: '2' }],
    evidenceLabel: 'evDocument', history: 'hist5',
  },
  {
    id: 'vq6', kind: 'scout', entity: 'Nuno Évora', detail: 'Perfil de scout · Basquetebol',
    submittedDaysAgo: 5, priority: 'normal',
    claimed: [{ label: 'Organização', value: 'Independente (demo)' }],
    evidenceLabel: 'evDocument', history: 'hist6',
  },
  {
    id: 'vq7', kind: 'competition', entity: 'Torneio 3x3 Sal Rei', detail: 'Nova competição · Sal',
    submittedDaysAgo: 6, priority: 'normal',
    claimed: [{ label: 'Equipas', value: '8' }, { label: 'Formato', value: '3x3' }],
    evidenceLabel: 'evDocument', history: 'hist7',
  },
];

export interface ModerationItem {
  id: string;
  videoTitle: string;
  reasonKey: 'rights' | 'inappropriate' | 'minor';
  reporterCount: number;
  thumb: string;
  date: string;
}

export const moderationQueueSeed: ModerationItem[] = [
  { id: 'mod1', videoTitle: 'Kelvin Delgado — clip de scout: defesa e transição', reasonKey: 'minor', reporterCount: 2, thumb: '/video-thumb-4.jpg', date: '2027-01-23' },
  { id: 'mod2', videoTitle: 'INTER LICEU 2027 — jogo completo: Atlético Achada × Estrela do Sul', reasonKey: 'rights', reporterCount: 1, thumb: '/video-thumb-5.jpg', date: '2027-01-22' },
  { id: 'mod3', videoTitle: 'Elton Burgo — 110m barreiras, treino de ritmo', reasonKey: 'inappropriate', reporterCount: 1, thumb: '/video-thumb-6.jpg', date: '2027-01-21' },
];

export interface AdminUserRow {
  id: string;
  name: string;
  role: string; // Role
  status: 'active' | 'pending' | 'suspended';
  verified: boolean;
  joined: string;
}

export const adminUsers: AdminUserRow[] = [
  { id: 'u1', name: 'Erick Semedo', role: 'athlete', status: 'active', verified: true, joined: '2026-11-02' },
  { id: 'u2', name: 'Nádia Fortes', role: 'athlete', status: 'active', verified: true, joined: '2026-11-09' },
  { id: 'u3', name: 'Ivanilson Tavares', role: 'athlete', status: 'pending', verified: false, joined: '2027-01-05' },
  { id: 'u4', name: 'Carlos Moniz', role: 'scout', status: 'active', verified: true, joined: '2026-10-21' },
  { id: 'u5', name: 'Atlético Achada', role: 'club', status: 'active', verified: true, joined: '2026-09-30' },
  { id: 'u6', name: 'Sandra Pires', role: 'scout', status: 'active', verified: true, joined: '2026-12-11' },
  { id: 'u7', name: 'Lúcia Semedo', role: 'guardian', status: 'active', verified: true, joined: '2026-11-02' },
  { id: 'u8', name: 'Hélio Varela', role: 'athlete', status: 'suspended', verified: false, joined: '2026-12-28' },
  { id: 'u9', name: 'ADEP — Inter Liceu', role: 'organizer', status: 'active', verified: true, joined: '2026-09-12' },
  { id: 'u10', name: 'Marca Parceira A', role: 'sponsor', status: 'active', verified: false, joined: '2026-12-01' },
];

export const adminSubscriptions = [
  { id: 'sub1', plan: 'Clube Pro', entity: 'Atlético Achada', status: 'active' as const, renewal: '2027-02-01', cveMonthly: 4900 },
  { id: 'sub2', plan: 'Organizador', entity: 'ADEP — Inter Liceu', status: 'active' as const, renewal: '2027-02-12', cveMonthly: 7900 },
  { id: 'sub3', plan: 'Atleta Premium', entity: 'Nádia Fortes', status: 'active' as const, renewal: '2027-02-09', cveMonthly: 990 },
  { id: 'sub4', plan: 'Boost de Visibilidade', entity: 'Nádia Fortes', status: 'active' as const, renewal: '2027-01-31', cveMonthly: 1500 },
  { id: 'sub5', plan: 'Clube Pro', entity: 'Desportivo da Baía', status: 'pastDue' as const, renewal: '2027-01-18', cveMonthly: 4900 },
];

export const adminPayments = [
  { id: 'pay-1042', entity: 'ADEP — Inter Liceu', concept: 'Pacote Época — Inter Liceu 2027', cve: 74500, status: 'paid' as const, date: '2026-12-15' },
  { id: 'pay-1051', entity: 'Atlético Achada', concept: 'Clube Pro · Jan 2027', cve: 4900, status: 'paid' as const, date: '2027-01-02' },
  { id: 'pay-1058', entity: 'Nádia Fortes', concept: 'Atleta Premium · Jan 2027', cve: 990, status: 'paid' as const, date: '2027-01-09' },
  { id: 'pay-1063', entity: 'Desportivo da Baía', concept: 'Clube Pro · Jan 2027', cve: 4900, status: 'failed' as const, date: '2027-01-18' },
  { id: 'pay-1067', entity: 'Marca Parceira A', concept: 'Propriedade: Talento da Semana', cve: 11000, status: 'paid' as const, date: '2027-01-20' },
];

export const adminAuditSeed = [
  { id: 'al1', actor: 'Admin SportHubCV', actionKey: 'auditActVerifyOk', target: 'Estatística #4821 — PPG 18.4', at: '2027-01-23T14:12:00', ip: '10.24.0.12' },
  { id: 'al2', actor: 'Admin SportHubCV', actionKey: 'auditActVerifyNo', target: 'Estatística #4819 — 800m (folha ilegível)', at: '2027-01-23T11:40:00', ip: '10.24.0.12' },
  { id: 'al3', actor: 'ADEP — Inter Liceu', actionKey: 'auditActResult', target: 'Jogo #IL-061 — 71×58', at: '2027-01-22T20:04:00', ip: '10.24.1.8' },
  { id: 'al4', actor: 'Admin SportHubCV', actionKey: 'auditActSuspend', target: 'Utilizador #u8', at: '2027-01-21T16:33:00', ip: '10.24.0.12' },
  { id: 'al5', actor: 'Carlos Moniz', actionKey: 'auditActReport', target: 'Relatório #rep1 — Erick Semedo', at: '2027-01-20T22:15:00', ip: '10.24.2.31' },
  { id: 'al6', actor: 'Admin SportHubCV', actionKey: 'auditActFeature', target: 'Competição INTER LICEU 2027', at: '2027-01-19T09:02:00', ip: '10.24.0.12' },
];

export const adminFunnel = [
  { key: 'signups', value: 1284 },
  { key: 'completeProfiles', value: 942 },
  { key: 'verified', value: 611 },
  { key: 'withStats', value: 438 },
  { key: 'withVideos', value: 287 },
];

export const adminRetention = [
  { week: 'S1', pct: 62 }, { week: 'S2', pct: 64 }, { week: 'S3', pct: 63 },
  { week: 'S4', pct: 67 }, { week: 'S5', pct: 69 }, { week: 'S6', pct: 68 },
  { week: 'S7', pct: 71 }, { week: 'S8', pct: 73 }, { week: 'S9', pct: 72 },
  { week: 'S10', pct: 75 }, { week: 'S11', pct: 76 }, { week: 'S12', pct: 78 },
];

/* ------------------------------------------------------------------ */
/* localStorage helpers (demo persistence — cleared by reset)          */
/* ------------------------------------------------------------------ */

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const LS_VERIFICATIONS = 'shs-verification-decisions';
export const LS_AUDIT_EXTRA = 'shs-audit-extra';
export const LS_ORG_PUBLISHED = 'shs-org-published';
export const LS_ORG_COMPETITIONS = 'shs-org-competitions';

export function resetDemoStorage(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith('shs-')) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
