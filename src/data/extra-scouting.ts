/**
 * Extra demo data owned by the scouting-flow pages (Match Scouting / Pricing / Auth).
 * Fictional only (design.md sec. 10). Does not modify the shared mock layer.
 */

/** Player in a match roster for the Match Scouting field mode. */
export interface RosterPlayer {
  id: string;
  number: number;
  name: string;
  /** Short feed label, e.g. '#7 Erick S.' */
  label: string;
  position: string;
  /** Link to the shared athletes mock layer when the player exists there. */
  athleteId?: string;
}

export interface MatchRoster {
  home: RosterPlayer[];
  away: RosterPlayer[];
}

/** Rosters for the LIVE demo match 'demo-match' (INTER LICEU 2027, Group A). */
export const demoMatchRosters: Record<string, MatchRoster> = {
  'demo-match': {
    home: [
      { id: 'p-erick', number: 7, name: 'Erick Semedo', label: '#7 Erick S.', position: 'PG', athleteId: 'erick-semedo' },
      { id: 'p-ivanilson', number: 23, name: 'Ivanilson Tavares', label: '#23 Ivanilson T.', position: 'C', athleteId: 'ivanilson-tavares' },
      { id: 'p-tatiana', number: 4, name: 'Tatiana Lopes', label: '#4 Tatiana L.', position: 'SG', athleteId: 'tatiana-lopes' },
      { id: 'p-kelvin', number: 11, name: 'Kelvin Delgado', label: '#11 Kelvin D.', position: 'SF', athleteId: 'kelvin-delgado' },
      { id: 'p-mario', number: 5, name: 'Mário Anoceto', label: '#5 Mário A.', position: 'PF', athleteId: 'mario-anoceto' },
      { id: 'p-dario', number: 9, name: 'Dário Correia', label: '#9 Dário C.', position: 'G', athleteId: 'dario-corrreia' },
    ],
    away: [
      { id: 'p-nadia', number: 9, name: 'Nádia Fortes', label: '#9 Nádia F.', position: 'SG', athleteId: 'nadia-fortes' },
      { id: 'p-silvano', number: 6, name: 'Silvano Ramos', label: '#6 Silvano R.', position: 'PG', athleteId: 'silvano-ramos' },
      { id: 'p-anisa', number: 12, name: 'Anisa Monteiro', label: '#12 Anisa M.', position: 'C', athleteId: 'anisa-monteiro' },
      { id: 'p-elton', number: 8, name: 'Elton Burgo', label: '#8 Elton B.', position: 'PF', athleteId: 'elton-burgo' },
      { id: 'p-yara', number: 14, name: 'Yara Andrade', label: '#14 Yara A.', position: 'SF', athleteId: 'yara-andrade' },
      { id: 'p-helio', number: 3, name: 'Hélio Varela', label: '#3 Hélio V.', position: 'G', athleteId: 'helio-varela' },
    ],
  },
};

/** Scout operating the field mode in the demo (matches demoPersonas.scout). */
export const demoMatchScout = { name: 'Carlos Moniz', short: 'Carlos M.' };

/** Pricing — club plan usage example meters (demo). */
export interface PlanUsage {
  athletes: [number, number];
  games: [number, number];
  scouts: [number, number];
  reports: [number, number];
  storageGb: [number, number];
}

export const clubPlanUsage: Record<'base' | 'pro' | 'elite', PlanUsage> = {
  base: { athletes: [14, 20], games: [6, 8], scouts: [1, 1], reports: [12, 20], storageGb: [22, 50] },
  pro: { athletes: [32, 50], games: [18, 20], scouts: [2, 3], reports: [64, 100], storageGb: [310, 500] },
  elite: { athletes: [96, 200], games: [41, 60], scouts: [6, 10], reports: [210, 400], storageGb: [1240, 2048] },
};

/** Competition price calculator — transparent demo formula (pricing.md sec. 4). */
export const calculatorConfig = {
  baseSeason: 15000,
  baseTournament: 8000,
  perTeam: 1500,
  perPlayer: 40,
  perGame: 300,
  perScout: 2500,
  perGb: 10,
  videoModulePct: 0.15,
  advancedStatsPct: 0.1,
  ranges: {
    teams: [2, 32],
    players: [20, 500],
    games: [4, 200],
    scouts: [0, 10],
    storageGb: [0, 1000],
  },
} as const;

export interface CalculatorInput {
  teams: number;
  players: number;
  games: number;
  scoutingRequired: boolean;
  scouts: number;
  storageGb: number;
  matchScouting: boolean;
  advancedStats: boolean;
  videoModule: boolean;
  customPage: boolean;
  duration: 'tournament' | 'season';
}

export interface CalculatorBreakdown {
  base: number;
  teams: number;
  players: number;
  games: number;
  scouts: number;
  storage: number;
  extras: number;
  total: number;
}

export function calculateCompetitionPrice(i: CalculatorInput): CalculatorBreakdown {
  const base = i.duration === 'season' ? calculatorConfig.baseSeason : calculatorConfig.baseTournament;
  const teams = i.teams * calculatorConfig.perTeam;
  const players = i.players * calculatorConfig.perPlayer;
  const games = i.games * calculatorConfig.perGame;
  const scouts = i.scoutingRequired ? i.scouts * calculatorConfig.perScout : 0;
  const storage = i.storageGb * calculatorConfig.perGb;
  const subtotal = base + teams + players + games + scouts + storage;
  let extras = 0;
  if (i.videoModule) extras += subtotal * calculatorConfig.videoModulePct;
  if (i.advancedStats) extras += subtotal * calculatorConfig.advancedStatsPct;
  return { base, teams, players, games, scouts, storage, extras, total: Math.round(subtotal + extras) };
}

/** Club search results for the onboarding step 7 (fictional, from shared clubs). */
export const onboardingClubResults = [
  { id: 'atletico-achada', name: 'Atlético Achada', city: 'Praia' },
  { id: 'estrela-do-sul', name: 'Estrela do Sul', city: 'Praia' },
  { id: 'uniao-tira-chapeu', name: 'União Tira Chapéu', city: 'Praia' },
  { id: 'academico-mindelo', name: 'Académico do Mindelo', city: 'Mindelo' },
  { id: 'desportivo-da-baia', name: 'Desportivo da Baía', city: 'Mindelo' },
  { id: 'clube-farol-sv', name: 'Clube Farol de São Vicente', city: 'Mindelo' },
];

/** Basketball positions + athletics events used by onboarding step 6. */
export const onboardingOptions = {
  basketballPositions: ['PG', 'SG', 'SF', 'PF', 'C'],
  footballPositions: ['GR', 'DEF', 'MED', 'EXT', 'AV'],
  athleticsEvents: ['100m', '200m', '400m', '800m', 'salto', 'barreiras'],
} as const;
