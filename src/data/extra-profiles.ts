/**
 * Extra fictional demo data for the profile / opportunities / videos pages.
 * Complements the core mock layer (@/data) — this file is owned by the
 * profiles page agent and imported directly (`@/data/extra-profiles`).
 * All names, clubs, venues and numbers are FICTIONAL (design.md sec. 10).
 */
import type {
  AthleteProfile,
  Club,
  Opportunity,
  ScoutProfile,
  ScoutReport,
  Sport,
  VerificationStatus,
  Video,
} from './types';
import { OVR_ALGORITHM_VERSION } from './types';
import { opportunities } from './opportunities';
import { videos } from './videos';

/** Demo "today" — the whole simulation lives in season 2026/27 (época demo = 2027). */
export const DEMO_TODAY = new Date('2027-02-08T12:00:00');
export const DEMO_SEASON_LABEL = '2026/27';

export const demoAge = (a: AthleteProfile) => 2027 - a.birthYear;
/** Minors protection trigger: athletes with a linked guardian (design: <18 profiles). */
export const hasGuardianProtection = (a: AthleteProfile) => Boolean(a.guardianLinked);

/* ------------------------------------------------------------------ */
/* Athletes                                                            */
/* ------------------------------------------------------------------ */

export interface AttributeRow {
  /** i18n key suffix under athleteProfile.attr.* */
  key: string;
  value: number;
  prev: number;
}

export interface EvolutionPoint {
  date: string;
  value: number;
  projected?: boolean;
}

export interface GameLogRow {
  id: string;
  date: string;
  opponent: string;
  competition: string;
  result: 'W' | 'L' | null;
  score?: string;
  /** dynamic stat columns, keyed by statColumns entries */
  stats: Record<string, string>;
  verification: VerificationStatus;
  evidenceLabel: string;
}

export interface AthleteExtras {
  attributes: AttributeRow[];
  evolution: EvolutionPoint[];
  statColumns: string[];
  gameLog: GameLogRow[];
  seasonSummary: { label: string; value: string; delta?: number }[];
  birthDate: string;
  weightKg?: number;
  dominantHand: 'right' | 'left';
  previousClubs: string;
  titles: number;
  award: string;
  scoutEval: { technical: number; decision: number; defense: number; athleticism: number; potential: number };
  perfSeries: { label: string; value: number; verified: boolean }[];
  splits: { label: string; athlete: number; average: number }[];
  rankHistory: { label: string; rank: number }[];
  career: { date: string; textPt: string; textEn: string }[];
}

const BB_COLUMNS = ['min', 'pts', 'ast', 'reb', 'stl', 'blk', 'tov', 'pf', 'fg', 'tp', 'ft', 'efic'];

const erickExtras: AthleteExtras = {
  attributes: [
    { key: 'shooting', value: 82, prev: 76 },
    { key: 'passing', value: 79, prev: 74 },
    { key: 'defense', value: 74, prev: 71 },
    { key: 'athleticism', value: 81, prev: 77 },
    { key: 'decision', value: 77, prev: 70 },
    { key: 'technique', value: 80, prev: 75 },
  ],
  evolution: [
    { date: '2026-01', value: 72 },
    { date: '2026-06', value: 74 },
    { date: '2026-11', value: 77 },
    { date: '2027-02', value: 78 },
    { date: '2028-01', value: 82, projected: true },
  ],
  statColumns: BB_COLUMNS,
  gameLog: [
    {
      id: 'g1', date: '2027-01-24', opponent: 'Estrela do Sul', competition: 'INTER LICEU 2027',
      result: 'W', score: '54–49',
      stats: { min: '34', pts: '24', ast: '8', reb: '6', stl: '3', blk: '0', tov: '2', pf: '2', fg: '52%', tp: '40%', ft: '83%', efic: '26' },
      verification: 'verified', evidenceLabel: 'Ficha de jogo oficial + Match Scouting',
    },
    {
      id: 'g2', date: '2027-01-17', opponent: 'União Tira Chapéu', competition: 'INTER LICEU 2027',
      result: 'W', score: '61–55',
      stats: { min: '32', pts: '19', ast: '6', reb: '4', stl: '2', blk: '1', tov: '3', pf: '1', fg: '47%', tp: '36%', ft: '80%', efic: '21' },
      verification: 'verified', evidenceLabel: 'Ficha de jogo oficial',
    },
    {
      id: 'g3', date: '2027-01-10', opponent: 'Liceu Achada Grande', competition: 'INTER LICEU 2027',
      result: 'L', score: '58–63',
      stats: { min: '35', pts: '21', ast: '9', reb: '7', stl: '1', blk: '0', tov: '4', pf: '3', fg: '44%', tp: '33%', ft: '75%', efic: '22' },
      verification: 'verified', evidenceLabel: 'Ficha de jogo oficial',
    },
    {
      id: 'g4', date: '2026-12-13', opponent: 'Torneio amigável — Plateau', competition: 'Jogo de preparação',
      result: 'W', score: '70–62',
      stats: { min: '28', pts: '17', ast: '5', reb: '5', stl: '4', blk: '0', tov: '2', pf: '2', fg: '49%', tp: '38%', ft: '78%', efic: '20' },
      verification: 'selfReported', evidenceLabel: 'Fotografia da folha de jogo (demo)',
    },
    {
      id: 'g5', date: '2026-12-06', opponent: 'Treino conjunto — Seleção Sub-18', competition: 'Treino',
      result: null,
      stats: { min: '30', pts: '15', ast: '7', reb: '3', stl: '2', blk: '0', tov: '1', pf: '0', fg: '—', tp: '—', ft: '—', efic: '18' },
      verification: 'pending', evidenceLabel: 'Vídeo de treino (demo)',
    },
  ],
  seasonSummary: [
    { label: 'J', value: '24', delta: 4 },
    { label: 'MIN', value: '31.2', delta: 2.1 },
    { label: 'PTS', value: '18.4', delta: 3.2 },
    { label: 'AST', value: '7.1', delta: 1.4 },
    { label: 'REB', value: '5.8', delta: 0.6 },
    { label: 'EFIC', value: '21.3', delta: 2.8 },
  ],
  birthDate: '2009-04-12',
  weightKg: 78,
  dominantHand: 'right',
  previousClubs: 'Estrela do Sul (sub-16)',
  titles: 2,
  award: 'MVP Inter Liceu 2026',
  scoutEval: { technical: 8.4, decision: 8.1, defense: 7.8, athleticism: 8.7, potential: 9.1 },
  perfSeries: [
    { label: 'J1', value: 14, verified: true },
    { label: 'J2', value: 17, verified: true },
    { label: 'J3', value: 22, verified: true },
    { label: 'J4', value: 15, verified: false },
    { label: 'J5', value: 19, verified: true },
    { label: 'J6', value: 24, verified: true },
    { label: 'J7', value: 21, verified: true },
    { label: 'J8', value: 18, verified: false },
  ],
  splits: [
    { label: 'FG%', athlete: 48, average: 43 },
    { label: '3P%', athlete: 38, average: 31 },
    { label: 'LL%', athlete: 80, average: 68 },
  ],
  rankHistory: [
    { label: '2026', rank: 4 },
    { label: '2026/27', rank: 2 },
    { label: '2027', rank: 1 },
  ],
  career: [
    { date: '2023', textPt: 'Junta-se ao Estrela do Sul (sub-16).', textEn: 'Joins Estrela do Sul (U-16).' },
    { date: '2025', textPt: 'Estreia na equipa principal do Atlético Achada.', textEn: 'First-team debut for Atlético Achada.' },
    { date: '2026-03-12', textPt: 'Perfil verificado na plataforma.', textEn: 'Profile verified on the platform.' },
    { date: '2026', textPt: 'MVP do Inter Liceu 2026.', textEn: 'Inter Liceu 2026 MVP.' },
    { date: '2027-01', textPt: 'Primeiro relatório de scout com recomendação máxima.', textEn: 'First scout report with top recommendation.' },
  ],
};

/** Deterministic pseudo-random generator for non-flagship athletes. */
function hashId(id: string): number {
  let h = 7;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const pick = <T,>(arr: T[], h: number, offset = 0): T => arr[(h + offset) % arr.length];

const ATTR_KEYS: Record<Sport, string[]> = {
  basketball: ['shooting', 'passing', 'defense', 'athleticism', 'decision', 'technique'],
  football: ['finishing', 'passing', 'marking', 'athleticism', 'decision', 'technique'],
  athletics: ['start', 'speed', 'endurance', 'power', 'technique', 'consistency'],
};

const OPPONENTS = [
  'Estrela do Sul', 'União Tira Chapéu', 'Académico do Mindelo', 'Desportivo da Baía',
  'Clube Farol de São Vicente', 'Liceu Achada Grande',
];
const COMPS = ['INTER LICEU 2027', 'Liga Juvenil Santiago Sul 2026/27', 'Meeting Nacional — Praia 2027', 'Jogo de preparação'];
const VERIF: VerificationStatus[] = ['verified', 'verified', 'selfReported', 'pending'];
const EVID = [
  'Ficha de jogo oficial',
  'Ficha de jogo oficial + vídeo',
  'Fotografia da folha de jogo (demo)',
  'Vídeo de treino (demo)',
];

export function getAthleteExtras(a: AthleteProfile): AthleteExtras {
  if (a.id === 'erick-semedo') return erickExtras;
  const h = hashId(a.id);
  const attrKeys = ATTR_KEYS[a.sport];
  const base = Math.max(52, a.ovr.value - 14);
  return {
    attributes: attrKeys.map((key, i) => {
      const value = Math.min(94, base + ((h >> (i * 2)) % 18));
      return { key, value, prev: Math.max(40, value - 3 - (h % 5)) };
    }),
    evolution: [
      { date: '2026-01', value: Math.max(45, a.ovr.value - 7) },
      { date: '2026-09', value: Math.max(46, a.ovr.value - 3) },
      { date: '2027-02', value: a.ovr.value },
      { date: '2028-01', value: Math.min(96, a.pot - 3), projected: true },
    ],
    statColumns: ['min', 'pts', 'ast', 'reb', 'fg', 'efic'],
    gameLog: Array.from({ length: 5 }, (_, i) => {
      const v = VERIF[(h + i) % VERIF.length];
      return {
        id: `${a.id}-g${i}`,
        date: `2027-01-${String(24 - i * 6).padStart(2, '0')}`,
        opponent: pick(OPPONENTS, h, i),
        competition: pick(COMPS, h, i),
        result: (h + i) % 3 === 0 ? 'L' : 'W',
        score: `${58 + ((h + i) % 20)}–${52 + ((h + i * 3) % 18)}`,
        stats: {
          min: String(24 + ((h + i) % 12)),
          pts: String(8 + ((h + i * 5) % 16)),
          ast: String(2 + ((h + i) % 7)),
          reb: String(3 + ((h + i * 2) % 8)),
          fg: `${38 + ((h + i) % 18)}%`,
          efic: String(9 + ((h + i * 4) % 18)),
        },
        verification: v,
        evidenceLabel: pick(EVID, h, i),
      };
    }),
    seasonSummary: [
      { label: 'J', value: String(12 + (h % 10)), delta: 2 },
      { label: 'MIN', value: `${24 + (h % 9)}.${h % 10}` },
      { label: a.keyStat.label, value: a.keyStat.value, delta: 1 },
      { label: 'EFIC', value: `${10 + (h % 12)}.${h % 10}`, delta: 1 },
    ],
    birthDate: `${a.birthYear}-0${1 + (h % 9)}-1${h % 9}`,
    weightKg: a.sport === 'athletics' ? 55 + (h % 20) : 62 + (h % 28),
    dominantHand: h % 2 === 0 ? 'right' : 'left',
    previousClubs: '—',
    titles: h % 3,
    award: h % 2 === 0 ? 'Convocatória regional (demo)' : '—',
    scoutEval: {
      technical: 6.4 + (h % 24) / 10,
      decision: 6.2 + ((h >> 2) % 24) / 10,
      defense: 6.0 + ((h >> 3) % 24) / 10,
      athleticism: 6.8 + ((h >> 4) % 24) / 10,
      potential: 7.0 + ((h >> 5) % 24) / 10,
    },
    perfSeries: Array.from({ length: 8 }, (_, i) => ({
      label: `J${i + 1}`,
      value: 8 + ((h + i * 7) % 18),
      verified: (h + i) % 4 !== 3,
    })),
    splits: [
      { label: 'FG%', athlete: 40 + (h % 12), average: 43 },
      { label: '3P%', athlete: 28 + (h % 14), average: 31 },
      { label: 'LL%', athlete: 62 + (h % 20), average: 68 },
    ],
    rankHistory: [
      { label: '2026', rank: 3 + (h % 4) },
      { label: '2027', rank: 1 + (h % 3) },
    ],
    career: [
      { date: String(a.birthYear + 14), textPt: 'Iniciação na formação local (demo).', textEn: 'Starts in local youth development (demo).' },
      { date: '2026-05-20', textPt: 'Perfil criado na plataforma.', textEn: 'Profile created on the platform.' },
      ...(a.verification === 'verified'
        ? [{ date: '2026-11-04', textPt: 'Perfil verificado na plataforma.', textEn: 'Profile verified on the platform.' }]
        : []),
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Clubs                                                               */
/* ------------------------------------------------------------------ */

export interface ClubExtras {
  venue: string;
  colors: string;
  divisions: string;
  rosterSize: number;
  gamesSeason: number;
  titles: number;
  coach: string;
  staff: { role: 'coach' | 'fitness' | 'director'; name: string }[];
  descriptionPt: string;
  descriptionEn: string;
  rosterExtra: { name: string; shirt: number; ageGroup: 'sub18' | 'senior'; heightCm: number; ovr: number; position: string }[];
  upcoming: { date: string; competition: string; opponent: string; venue: string; scouting: boolean }[];
  results: { date: string; competition: string; opponent: string; score: string; win: boolean; topPerformer: string }[];
  teamStats: { labelKey: 'ppg' | 'rpg' | 'apg' | 'tp' | 'eff'; value: string; rank: string }[];
  pointsSeries: number[];
  radar: { label: string; team: number; league: number }[];
  scouting: { reports: number; observed: number; matchScoutingGames: number };
  scoutingActivity: { date: string; textPt: string; textEn: string }[];
  planUsage: { plan: string; games: [number, number]; athletes: [number, number]; scouts: [number, number] };
}

const ROSTER_NAMES = [
  'Adilson Rocha', 'Benvindo Pina', 'Celso Varela', 'Danilson Évora', 'Edson Semedo',
  'Fábio Lopes', 'Gilson Andrade', 'Hernâni Duarte', 'Ildo Fernandes', 'Jovino Ramos',
  'Kléber Santos', 'Luidy Moreira', 'Mailson Cruz', 'Nélson Brito', 'Osvaldo Lima', 'Paulino Veiga',
];
const ROSTER_POS = ['Base', 'Extremo', 'Poste'];

const atleticoExtras: ClubExtras = {
  venue: 'Pavilhão Achada (fictício)',
  colors: 'Preto / Laranja',
  divisions: 'Sub-16 · Sub-18 · Séniores',
  rosterSize: 42,
  gamesSeason: 18,
  titles: 5,
  coach: 'Mário Anoceto (fictício)',
  staff: [
    { role: 'coach', name: 'Mário Anoceto' },
    { role: 'fitness', name: 'Paulo Andrade' },
    { role: 'director', name: 'Dina Fortes' },
  ],
  descriptionPt:
    'Clube de bairro fundado na Achada, na Praia, com formação em basquetebol e futebol. Projeto fictício de demonstração: aposta em dados verificados, vídeo e acompanhamento de jovens atletas.',
  descriptionEn:
    'Neighbourhood club founded in Achada, Praia, with basketball and football academies. Fictional demo project: focused on verified data, video and youth athlete development.',
  rosterExtra: ROSTER_NAMES.slice(0, 10).map((name, i) => ({
    name: `${name} (demo)`,
    shirt: 4 + i,
    ageGroup: i % 3 === 0 ? 'senior' : 'sub18',
    heightCm: 172 + ((i * 37) % 30),
    ovr: 58 + ((i * 13) % 19),
    position: ROSTER_POS[i % 3],
  })),
  upcoming: [
    { date: '2027-02-12T17:30:00', competition: 'INTER LICEU 2027', opponent: 'Escola do Plateau', venue: 'Pavilhão da Várzea, Praia', scouting: true },
    { date: '2027-02-19T16:00:00', competition: 'INTER LICEU 2027', opponent: 'Liceu de Palmarejo', venue: 'Pavilhão Achada (fictício)', scouting: false },
  ],
  results: [
    { date: '2027-01-24', competition: 'INTER LICEU 2027', opponent: 'Estrela do Sul', score: '54–49', win: true, topPerformer: 'Erick Semedo · 24 PTS' },
    { date: '2027-01-17', competition: 'INTER LICEU 2027', opponent: 'União Tira Chapéu', score: '61–55', win: true, topPerformer: 'Ivanilson Tavares · 14 REB' },
    { date: '2027-01-10', competition: 'INTER LICEU 2027', opponent: 'Liceu Achada Grande', score: '58–63', win: false, topPerformer: 'Erick Semedo · 9 AST' },
  ],
  teamStats: [
    { labelKey: 'ppg', value: '78.4', rank: '2.º' },
    { labelKey: 'rpg', value: '41.2', rank: '1.º' },
    { labelKey: 'apg', value: '19.8', rank: '3.º' },
    { labelKey: 'tp', value: '34.1%', rank: '2.º' },
    { labelKey: 'eff', value: '88.3', rank: '2.º' },
  ],
  pointsSeries: [72, 81, 68, 77, 84, 79, 74, 88, 82, 90],
  radar: [
    { label: 'PTS', team: 78, league: 71 },
    { label: 'REB', team: 82, league: 70 },
    { label: 'AST', team: 74, league: 68 },
    { label: '3P%', team: 70, league: 66 },
    { label: 'DEF', team: 76, league: 69 },
    { label: 'RITMO', team: 80, league: 72 },
  ],
  scouting: { reports: 34, observed: 57, matchScoutingGames: 12 },
  scoutingActivity: [
    { date: '2027-01-24', textPt: 'Relatório criado — Inter Liceu, Jornada 6', textEn: 'Report created — Inter Liceu, Round 6' },
    { date: '2027-01-22', textPt: '12 clips marcados em Match Scouting', textEn: '12 clips marked in Match Scouting' },
    { date: '2027-01-15', textPt: 'Atleta adicionado à lista de observação', textEn: 'Athlete added to watchlist' },
  ],
  planUsage: { plan: 'Clube Pro', games: [18, 20], athletes: [42, 50], scouts: [2, 3] },
};

export function getClubExtras(c: Club): ClubExtras {
  if (c.id === 'atletico-achada') return atleticoExtras;
  const h = hashId(c.id);
  return {
    ...atleticoExtras,
    venue: `Pavilhão ${c.city} (fictício)`,
    rosterSize: 24 + (h % 22),
    gamesSeason: 10 + (h % 12),
    titles: h % 6,
    coach: `${pick(ROSTER_NAMES, h)} (fictício)`,
    staff: [
      { role: 'coach', name: pick(ROSTER_NAMES, h) },
      { role: 'fitness', name: pick(ROSTER_NAMES, h, 3) },
      { role: 'director', name: pick(ROSTER_NAMES, h, 7) },
    ],
    rosterExtra: ROSTER_NAMES.slice(0, 6 + (h % 6)).map((name, i) => ({
      name: `${name} (demo)`,
      shirt: 4 + i,
      ageGroup: (h + i) % 3 === 0 ? 'senior' : 'sub18',
      heightCm: 170 + (((h + i) * 37) % 32),
      ovr: 54 + (((h + i) * 13) % 22),
      position: ROSTER_POS[(h + i) % 3],
    })),
    pointsSeries: Array.from({ length: 10 }, (_, i) => 62 + ((h + i * 11) % 26)),
    planUsage: { plan: 'Clube Pro', games: [6 + (h % 10), 20], athletes: [20 + (h % 20), 50], scouts: [1, 3] },
  };
}

/* ------------------------------------------------------------------ */
/* Scouts                                                              */
/* ------------------------------------------------------------------ */

export interface ScoutEvaluationRow {
  athleteId: string;
  date: string;
  context: 'game' | 'training';
  contextLabel: string;
  technical: number;
  decision: number;
  athleticism: number;
  potential: number;
  recommendation: ScoutReport['recommendation'];
}

export interface ScoutExtras {
  metrics: { evaluated: number; reports: number; recommended: number };
  aboutPt: string;
  aboutEn: string;
  specialtiesExtra: string[];
  scopeChips: string[];
  monthlyActivity: { month: string; count: number }[];
  recommendedAthleteIds: string[];
  trust: { verifiedSince: string; acceptedByClubs: number; followUpRate: number };
  evaluations: ScoutEvaluationRow[];
  followed: { athleteId: string; months: number; ovrFrom: number; ovrTo: number }[];
  matchesObserved: { id: string; date: string; competition: string; match: string; events: number; clips: number; report: boolean; live?: boolean }[];
}

const carlosExtras: ScoutExtras = {
  metrics: { evaluated: 47, reports: 18, recommended: 12 },
  aboutPt:
    'Scout independente focado em basquetebol de formação na Praia. Cobertura regular do Inter Liceu e dos torneios de Santiago, com relatórios estruturados para clubes nacionais e da diáspora.',
  aboutEn:
    'Independent scout focused on youth basketball in Praia. Regular coverage of Inter Liceu and Santiago tournaments, with structured reports for national and diaspora clubs.',
  specialtiesExtra: ['Sub-16', 'Sub-18'],
  scopeChips: ['Santiago', 'Diáspora'],
  monthlyActivity: [
    { month: 'Set', count: 3 }, { month: 'Out', count: 5 }, { month: 'Nov', count: 4 },
    { month: 'Dez', count: 6 }, { month: 'Jan', count: 9 }, { month: 'Fev', count: 7 },
  ],
  recommendedAthleteIds: ['erick-semedo', 'nadia-fortes', 'kelvin-delgado'],
  trust: { verifiedSince: '2026-09-02', acceptedByClubs: 9, followUpRate: 67 },
  evaluations: [
    { athleteId: 'erick-semedo', date: '2027-01-24', context: 'game', contextLabel: 'Inter Liceu 2027 · J6', technical: 8.4, decision: 8.1, athleticism: 8.7, potential: 9.1, recommendation: 'sign' },
    { athleteId: 'nadia-fortes', date: '2027-01-17', context: 'game', contextLabel: 'Inter Liceu 2027 · J5', technical: 7.9, decision: 7.4, athleticism: 7.6, potential: 8.4, recommendation: 'shortlist' },
    { athleteId: 'kelvin-delgado', date: '2027-01-10', context: 'training', contextLabel: 'Treino aberto — Tira Chapéu', technical: 6.8, decision: 6.5, athleticism: 8.2, potential: 8.6, recommendation: 'follow' },
    { athleteId: 'ivanilson-tavares', date: '2026-12-13', context: 'game', contextLabel: 'Inter Liceu 2027 · J3', technical: 7.1, decision: 6.9, athleticism: 7.8, potential: 8.0, recommendation: 'monitor' },
  ],
  followed: [
    { athleteId: 'erick-semedo', months: 8, ovrFrom: 72, ovrTo: 78 },
    { athleteId: 'nadia-fortes', months: 6, ovrFrom: 70, ovrTo: 74 },
    { athleteId: 'kelvin-delgado', months: 5, ovrFrom: 68, ovrTo: 72 },
    { athleteId: 'ivanilson-tavares', months: 3, ovrFrom: 69, ovrTo: 71 },
  ],
  matchesObserved: [
    { id: 'so-live', date: '2027-02-08', competition: 'INTER LICEU 2027', match: 'Atlético Achada × Estrela do Sul', events: 142, clips: 12, report: false, live: true },
    { id: 'so1', date: '2027-01-24', competition: 'INTER LICEU 2027', match: 'Atlético Achada × Estrela do Sul', events: 142, clips: 12, report: true },
    { id: 'so2', date: '2027-01-17', competition: 'INTER LICEU 2027', match: 'Atlético Achada × União Tira Chapéu', events: 118, clips: 8, report: true },
    { id: 'so3', date: '2027-01-10', competition: 'INTER LICEU 2027', match: 'Liceu Achada Grande × Atlético Achada', events: 126, clips: 9, report: true },
  ],
};

export function getScoutExtras(s: ScoutProfile): ScoutExtras {
  if (s.id === 'scout-carlos-moniz') return carlosExtras;
  const h = hashId(s.id);
  const ids = ['erick-semedo', 'mario-anoceto', 'anisa-monteiro', 'nadia-fortes', 'dario-corrreia'];
  return {
    ...carlosExtras,
    metrics: {
      evaluated: 20 + (h % 40),
      reports: s.reportsCount,
      recommended: 4 + (h % 10),
    },
    trust: { verifiedSince: '2026-10-15', acceptedByClubs: 3 + (h % 8), followUpRate: 45 + (h % 35) },
    recommendedAthleteIds: ids.slice(h % 2, (h % 2) + 3),
    evaluations: carlosExtras.evaluations.map((e, i) => ({
      ...e,
      athleteId: ids[(h + i) % ids.length],
      technical: Math.round((6 + ((h + i) % 28) / 10) * 10) / 10,
      decision: Math.round((6 + ((h + i * 2) % 28) / 10) * 10) / 10,
      athleticism: Math.round((6.4 + ((h + i * 3) % 26) / 10) * 10) / 10,
      potential: Math.round((6.8 + ((h + i * 5) % 26) / 10) * 10) / 10,
    })),
    followed: carlosExtras.followed.map((f, i) => ({
      athleteId: ids[(h + i) % ids.length],
      months: 2 + ((h + i) % 9),
      ovrFrom: 62 + ((h + i) % 8),
      ovrTo: Math.max(f.ovrTo, 68 + ((h + i) % 10)),
    })),
    matchesObserved: carlosExtras.matchesObserved.slice(1),
  };
}

/* ------------------------------------------------------------------ */
/* Opportunities                                                       */
/* ------------------------------------------------------------------ */

export interface OpportunityExtras {
  icon: 'trial' | 'scholarship' | 'international' | 'academy' | 'contract';
  reqChips: string[];
  compatible: number;
  minOvr: number;
  needsVideos: boolean;
  needsVerified: boolean;
  needsGuardian: boolean;
  publisherKey: 'intlClub' | 'program' | 'federation' | 'club';
}

export const opportunityExtras: Record<string, OpportunityExtras> = {
  op1: {
    icon: 'trial',
    reqChips: ['Futebol', '15–17', 'Médio / Avançado', 'Nível competitivo', 'OVR ≥ 70', 'Vídeos obrigatórios', 'Perfil verificado'],
    compatible: 3,
    minOvr: 70, needsVideos: true, needsVerified: true, needsGuardian: true,
    publisherKey: 'club',
  },
  op2: {
    icon: 'scholarship',
    reqChips: ['Atletismo', '16–19', 'Velocidade', 'Marcas verificadas', 'OVR ≥ 72'],
    compatible: 2,
    minOvr: 72, needsVideos: false, needsVerified: true, needsGuardian: false,
    publisherKey: 'program',
  },
  op3: {
    icon: 'academy',
    reqChips: ['Basquetebol', '13–15', 'Todos os níveis', 'Consentimento do responsável'],
    compatible: 5,
    minOvr: 0, needsVideos: false, needsVerified: false, needsGuardian: true,
    publisherKey: 'federation',
  },
  op4: {
    icon: 'international',
    reqChips: ['Futebol', '16–18', 'Defesa-central', 'OVR ≥ 75', 'Vídeos obrigatórios', 'Perfil verificado'],
    compatible: 1,
    minOvr: 75, needsVideos: true, needsVerified: true, needsGuardian: true,
    publisherKey: 'intlClub',
  },
  op5: {
    icon: 'international',
    reqChips: ['Basquetebol', '17–21', 'Base', 'Nível competitivo', 'OVR ≥ 75', 'Vídeos obrigatórios', 'Perfil verificado'],
    compatible: 3,
    minOvr: 75, needsVideos: true, needsVerified: true, needsGuardian: false,
    publisherKey: 'intlClub',
  },
  op6: {
    icon: 'trial',
    reqChips: ['Atletismo', '15–19', 'Barreiras / Velocidade', 'Marcas verificadas'],
    compatible: 4,
    minOvr: 0, needsVideos: false, needsVerified: true, needsGuardian: true,
    publisherKey: 'program',
  },
};

/** Two extra opportunities to reach the 6-item demo board (design: opportunities.md). */
export const extraOpportunities: Opportunity[] = [
  {
    id: 'op5',
    title: 'Trial — Academia de basquetebol, sub-18 (fictício)',
    organization: 'Clube internacional verificado (fictício)',
    sport: 'basketball',
    type: 'trial',
    location: 'Lisboa, Portugal',
    deadline: '2027-02-20',
    ageGroup: 'Sub-21',
    descriptionPt: 'Academia internacional procura bases sub-21 com perfil verificado e vídeos. Identidade do clube revelada após candidatura.',
    descriptionEn: 'International academy looking for U-21 point guards with verified profiles and video. Club identity revealed after application.',
  },
  {
    id: 'op6',
    title: 'Programa de desenvolvimento — velocidade (fictício)',
    organization: 'Programa Atlântico de Sprint (fictício)',
    sport: 'athletics',
    type: 'academy',
    location: 'Praia, Santiago',
    deadline: '2027-02-12',
    ageGroup: 'Sub-20',
    descriptionPt: 'Estágio de 8 semanas para velocistas e barreiristas com marcas verificadas em meetings oficiais.',
    descriptionEn: '8-week camp for sprinters and hurdlers with verified marks at official meetings.',
  },
];

export const allOpportunities: Opportunity[] = [...opportunities, ...extraOpportunities];

export const daysUntil = (iso: string) =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - DEMO_TODAY.getTime()) / 86400000));

/* ------------------------------------------------------------------ */
/* Videos                                                              */
/* ------------------------------------------------------------------ */

export type VideoVisibility = 'public' | 'private' | 'scoutsOnly';

export interface DemoVideo extends Omit<Video, 'visibility'> {
  visibility: VideoVisibility;
  scoutName?: string;
  eventTag?: string;
  featured?: boolean;
}

/** 12 extra entries so the hub reaches 18 videos across the 3 kinds. */
export const extraVideos: DemoVideo[] = [
  { id: 'v7', title: 'Erick Semedo — leitura de pick-and-roll (clip)', athleteId: 'erick-semedo', competitionId: 'inter-liceu-2027', sport: 'basketball', kind: 'scoutClip', thumb: '/video-thumb-4.jpg', durationSec: 47, visibility: 'scoutsOnly', views: 96, date: '2027-01-24', scoutName: 'Carlos Moniz', eventTag: 'Q2 12:34 — Excelente assistência', featured: true },
  { id: 'v8', title: 'Nádia Fortes — 5 triplos consecutivos', athleteId: 'nadia-fortes', competitionId: 'inter-liceu-2027', sport: 'basketball', kind: 'highlight', thumb: '/video-thumb-1.jpg', durationSec: 62, visibility: 'public', views: 940, date: '2027-01-20', featured: true },
  { id: 'v9', title: 'Dário Correia — passe decisivo no contra-ataque', athleteId: 'dario-corrreia', competitionId: 'liga-juvenil-santiago-sul', sport: 'football', kind: 'highlight', thumb: '/video-thumb-2.jpg', durationSec: 33, visibility: 'public', views: 412, date: '2027-01-19' },
  { id: 'v10', title: 'Mário Anoceto — clip de scout: jogo aéreo', athleteId: 'mario-anoceto', sport: 'football', kind: 'scoutClip', thumb: '/video-thumb-2.jpg', durationSec: 28, visibility: 'private', views: 34, date: '2027-01-18', scoutName: 'Sandra Pires', eventTag: '2.ª parte 67:10 — Domínio aéreo' },
  { id: 'v11', title: 'Anisa Monteiro — partida de blocos (análise)', athleteId: 'anisa-monteiro', competitionId: 'meeting-atletismo-praia-2027', sport: 'athletics', kind: 'scoutClip', thumb: '/video-thumb-3.jpg', durationSec: 41, visibility: 'scoutsOnly', views: 77, date: '2027-01-10', scoutName: 'Bruno Livramento', eventTag: 'Série 2 — Reação 0.142s', featured: true },
  { id: 'v12', title: 'INTER LICEU 2027 — Liceu Achada Grande × União Tira Chapéu', competitionId: 'inter-liceu-2027', sport: 'basketball', kind: 'fullGame', thumb: '/video-thumb-5.jpg', durationSec: 4380, visibility: 'public', views: 1318, date: '2027-01-22', featured: true },
  { id: 'v13', title: 'Elton Burgo — final 110mH (Meeting Praia)', athleteId: 'elton-burgo', competitionId: 'meeting-atletismo-praia-2027', sport: 'athletics', kind: 'fullGame', thumb: '/video-thumb-6.jpg', durationSec: 210, visibility: 'public', views: 502, date: '2027-01-10', featured: true },
  { id: 'v14', title: 'Kelvin Delgado — highlights defensivos', athleteId: 'kelvin-delgado', competitionId: 'inter-liceu-2027', sport: 'basketball', kind: 'highlight', thumb: '/video-thumb-4.jpg', durationSec: 58, visibility: 'public', views: 623, date: '2027-01-21', featured: true },
  { id: 'v15', title: 'Yara Andrade — 800m treino de ritmo', athleteId: 'yara-andrade', sport: 'athletics', kind: 'highlight', thumb: '/video-thumb-3.jpg', durationSec: 74, visibility: 'private', views: 21, date: '2027-01-12' },
  { id: 'v16', title: 'Hélio Varela — clip de scout: defesas de reflexo', athleteId: 'helio-varela', sport: 'football', kind: 'scoutClip', thumb: '/video-thumb-2.jpg', durationSec: 39, visibility: 'scoutsOnly', views: 45, date: '2027-01-16', scoutName: 'Sandra Pires', eventTag: '1.ª parte 22:05 — Dupla defesa' },
  { id: 'v17', title: 'Tatiana Lopes — assistências (compilação)', athleteId: 'tatiana-lopes', competitionId: 'inter-liceu-2027', sport: 'basketball', kind: 'highlight', thumb: '/video-thumb-1.jpg', durationSec: 66, visibility: 'public', views: 388, date: '2027-01-14' },
  { id: 'v18', title: 'Meeting Nacional de Atletismo — resumo do dia 1', competitionId: 'meeting-atletismo-praia-2027', sport: 'athletics', kind: 'fullGame', thumb: '/video-thumb-6.jpg', durationSec: 1140, visibility: 'public', views: 764, date: '2027-01-10' },
];

export const allVideos: DemoVideo[] = [...videos, ...extraVideos];
export const getAthleteVideos = (athleteId: string) => allVideos.filter((v) => v.athleteId === athleteId);
export { OVR_ALGORITHM_VERSION };
