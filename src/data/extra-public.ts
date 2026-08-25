/**
 * Extra demo data for the public browse pages (Discover / Rankings /
 * Competitions / Competition Detail). Owned by the public-browse page agent —
 * do NOT edit the core data files; import from here instead.
 * All data is fictional (design.md sec. 10). Demo season = 2026/27, "today" = 2027-01-24.
 */
import type { AthleteProfile, Competition, Match, Sport } from './types';
import { OVR_ALGORITHM_VERSION } from './types';
import { athletes } from './athletes';
import { competitions } from './competitions';
import { matches } from './matches';

/* ------------------------------------------------------------------ */
/* Extra athletes (14) — extend the pool so filters feel alive         */
/* ------------------------------------------------------------------ */

const snap = (value: number, confidence: 'high' | 'medium' | 'low') => ({
  value,
  date: '2027-01-12',
  algorithmVersion: OVR_ALGORITHM_VERSION,
  inputs: ['verifiedMatches', 'evidence', 'scoutReports'],
  confidence,
});

export const extraAthletes: AthleteProfile[] = [
  { id: 'bruno-cardoso', name: 'Bruno Cardoso', sport: 'basketball', position: 'Ala / Power Forward', clubId: 'academico-mindelo', birthYear: 2011, island: 'São Vicente', city: 'Mindelo', heightCm: 196, ovr: snap(64, 'medium'), pot: 81, verification: 'pending', statsVerified: false, boostActive: false, keyStat: { label: 'PPG', value: '14.2' }, guardianLinked: true },
  { id: 'luciana-brito', name: 'Luciana Brito', sport: 'athletics', position: 'Salto / Long Jump', clubId: 'estrela-do-sul', birthYear: 2010, island: 'Santiago', city: 'Praia', heightCm: 172, ovr: snap(63, 'low'), pot: 78, verification: 'selfReported', statsVerified: false, boostActive: false, keyStat: { label: 'Salto', value: '5.62m' }, guardianLinked: true },
  { id: 'fabio-lima', name: 'Fábio Lima', sport: 'football', position: 'Médio / Midfielder', clubId: 'desportivo-da-baia', birthYear: 2005, island: 'São Vicente', city: 'Mindelo', heightCm: 178, ovr: snap(71, 'high'), pot: 74, verification: 'verified', statsVerified: true, boostActive: false, keyStat: { label: 'Assist.', value: '11' } },
  { id: 'dana-veiga', name: 'Dana Veiga', sport: 'basketball', position: 'Base / Point Guard', clubId: 'estrela-do-sul', birthYear: 2012, island: 'Santiago', city: 'Praia', heightCm: 166, ovr: snap(60, 'low'), pot: 83, verification: 'selfReported', statsVerified: false, boostActive: false, keyStat: { label: 'AST', value: '5.4' }, guardianLinked: true },
  { id: 'orlando-furtado', name: 'Orlando Furtado', sport: 'athletics', position: 'Meio-fundo / 1500m', clubId: 'academico-mindelo', birthYear: 2004, island: 'São Vicente', city: 'Mindelo', heightCm: 180, ovr: snap(68, 'medium'), pot: 72, verification: 'verified', statsVerified: true, boostActive: false, keyStat: { label: '1500m', value: '3:52.1' } },
  { id: 'melissa-cruz', name: 'Melissa Cruz', sport: 'football', position: 'Defesa / Centre-back', clubId: 'clube-farol-sv', birthYear: 2009, island: 'Santo Antão', city: 'Ribeira Grande', heightCm: 170, ovr: snap(62, 'low'), pot: 76, verification: 'pending', statsVerified: false, boostActive: false, keyStat: { label: 'Desarmes', value: '3.9' }, guardianLinked: true },
  { id: 'telmo-andrade', name: 'Telmo Andrade', sport: 'basketball', position: 'Poste / Center', clubId: 'atletico-achada', birthYear: 2006, island: 'Santiago', city: 'Praia', heightCm: 206, ovr: snap(70, 'medium'), pot: 75, verification: 'verified', statsVerified: true, boostActive: false, keyStat: { label: 'RPG', value: '9.8' } },
  { id: 'sabrina-gomes', name: 'Sabrina Gomes', sport: 'athletics', position: 'Velocista / 400m', clubId: 'uniao-tira-chapeu', birthYear: 2008, island: 'Fogo', city: 'São Filipe', heightCm: 168, ovr: snap(65, 'medium'), pot: 77, verification: 'pending', statsVerified: false, boostActive: false, keyStat: { label: '400m', value: '55.8s' } },
  { id: 'ricardo-evora', name: 'Ricardo Évora', sport: 'football', position: 'Guarda-redes / Goalkeeper', clubId: 'desportivo-da-baia', birthYear: 2003, island: 'Brava', city: 'Vila Nova Sintra', heightCm: 188, ovr: snap(69, 'medium'), pot: 71, verification: 'verified', statsVerified: true, boostActive: false, keyStat: { label: 'Defesas/jogo', value: '5.2' } },
  { id: 'ines-delgado', name: 'Inês Delgado', sport: 'basketball', position: 'Extremo / Shooting Guard', clubId: 'uniao-tira-chapeu', birthYear: 2010, island: 'Santiago', city: 'Praia', heightCm: 174, ovr: snap(61, 'low'), pot: 79, verification: 'selfReported', statsVerified: false, boostActive: false, keyStat: { label: '3P%', value: '36%' }, guardianLinked: true },
  { id: 'joel-martins', name: 'Joel Martins', sport: 'athletics', position: 'Salto / High Jump', clubId: 'academico-mindelo', birthYear: 2009, island: 'Sal', city: 'Santa Maria', heightCm: 192, ovr: snap(58, 'low'), pot: 74, verification: 'selfReported', statsVerified: false, boostActive: false, keyStat: { label: 'Altura', value: '1.98m' }, guardianLinked: true },
  { id: 'vania-pires', name: 'Vânia Pires', sport: 'football', position: 'Avançado / Striker', clubId: 'clube-farol-sv', birthYear: 2011, island: 'São Vicente', city: 'Mindelo', heightCm: 165, ovr: snap(59, 'low'), pot: 80, verification: 'selfReported', statsVerified: false, boostActive: false, keyStat: { label: 'Golos', value: '9' }, guardianLinked: true },
  { id: 'adilson-rosa', name: 'Adilson Rosa', sport: 'basketball', position: 'Ala / Small Forward', clubId: 'estrela-do-sul', birthYear: 2007, island: 'Santiago', city: 'Praia', heightCm: 194, ovr: snap(67, 'medium'), pot: 73, verification: 'verified', statsVerified: false, boostActive: false, keyStat: { label: 'STL', value: '2.1' } },
  { id: 'carla-mendes', name: 'Carla Mendes', sport: 'athletics', position: 'Lançamento / Shot Put', clubId: 'estrela-do-sul', birthYear: 2005, island: 'Fogo', city: 'São Filipe', heightCm: 176, ovr: snap(63, 'medium'), pot: 68, verification: 'verified', statsVerified: true, boostActive: false, keyStat: { label: 'Peso', value: '13.4m' } },
];

export const publicAthletes: AthleteProfile[] = [...athletes, ...extraAthletes];
export const getPublicAthlete = (id: string) => publicAthletes.find((a) => a.id === id);

/** Sex demo map (types have no sex field; rankings filter needs it). */
export const athleteSex: Record<string, 'm' | 'f'> = {
  'nadia-fortes': 'f', 'tatiana-lopes': 'f', 'anisa-monteiro': 'f', 'yara-andrade': 'f',
  'luciana-brito': 'f', 'dana-veiga': 'f', 'melissa-cruz': 'f', 'sabrina-gomes': 'f',
  'ines-delgado': 'f', 'vania-pires': 'f', 'carla-mendes': 'f',
  'erick-semedo': 'm', 'ivanilson-tavares': 'm', 'kelvin-delgado': 'm', 'mario-anoceto': 'm',
  'dario-corrreia': 'm', 'silvano-ramos': 'm', 'elton-burgo': 'm', 'helio-varela': 'm',
  'bruno-cardoso': 'm', 'fabio-lima': 'm', 'orlando-furtado': 'm', 'telmo-andrade': 'm',
  'ricardo-evora': 'm', 'joel-martins': 'm', 'adilson-rosa': 'm',
};

/* ------------------------------------------------------------------ */
/* Per-athlete demo season stats (feed rankings + tables)              */
/* ------------------------------------------------------------------ */

export interface AthleteDemoStats {
  games: number;
  /** scoring output per game (PPG / goals / points) */
  scoring: number;
  scoringLabel: string;
  playmaking: number;
  playmakingLabel: string;
  defense: number;
  defenseLabel: string;
  /** OVR gained this season (Most Improved) */
  improvement: number;
  /** weekly OVR trend (sparkline) */
  trend: number[];
}

const S = (games: number, scoring: number, scoringLabel: string, playmaking: number, playmakingLabel: string, defense: number, defenseLabel: string, improvement: number, trend: number[]): AthleteDemoStats =>
  ({ games, scoring, scoringLabel, playmaking, playmakingLabel, defense, defenseLabel, improvement, trend });

export const athleteDemoStats: Record<string, AthleteDemoStats> = {
  'erick-semedo': S(14, 18.4, 'PPG', 5.8, 'APG', 2.4, 'SPG', 6, [72, 73, 75, 76, 77, 78]),
  'nadia-fortes': S(14, 15.1, 'PPG', 4.2, 'APG', 1.9, 'SPG', 5, [70, 71, 72, 73, 73, 74]),
  'ivanilson-tavares': S(12, 12.8, 'PPG', 1.4, 'APG', 1.2, 'BPG', 4, [68, 68, 69, 70, 71, 71]),
  'kelvin-delgado': S(13, 13.6, 'PPG', 2.8, 'APG', 2.6, 'SPG', 7, [66, 67, 69, 70, 71, 72]),
  'tatiana-lopes': S(11, 9.4, 'PPG', 6.1, 'APG', 1.5, 'SPG', 3, [67, 67, 68, 68, 69, 69]),
  'mario-anoceto': S(16, 0.9, 'Golos/j', 0.4, 'Assist./j', 1.1, 'Desarmes', 5, [71, 72, 73, 74, 74, 75]),
  'dario-corrreia': S(15, 0.3, 'Golos/j', 0.6, 'Assist./j', 2.2, 'Desarmes', 4, [67, 68, 68, 69, 70, 70]),
  'silvano-ramos': S(16, 0.1, 'Golos/j', 0.1, 'Assist./j', 4.3, 'Desarmes', 2, [66, 66, 67, 67, 68, 68]),
  'anisa-monteiro': S(8, 11.84, '100m (s)', 0, '—', 0, '—', 6, [71, 72, 73, 75, 75, 76]),
  'elton-burgo': S(7, 14.62, '110mH (s)', 0, '—', 0, '—', 3, [68, 68, 69, 69, 70, 70]),
  'yara-andrade': S(6, 134.3, '800m (s)', 0, '—', 0, '—', 5, [62, 63, 64, 65, 66, 66]),
  'helio-varela': S(15, 0, 'Golos/j', 0, 'Assist./j', 4.8, 'Defesas/j', 3, [65, 65, 66, 66, 67, 67]),
  'bruno-cardoso': S(10, 14.2, 'PPG', 2.1, 'APG', 1.1, 'SPG', 8, [58, 59, 61, 62, 63, 64]),
  'luciana-brito': S(5, 5.62, 'Salto (m)', 0, '—', 0, '—', 4, [60, 60, 61, 62, 63, 63]),
  'fabio-lima': S(18, 0.3, 'Golos/j', 0.6, 'Assist./j', 2.8, 'Desarmes', 1, [70, 70, 71, 71, 71, 71]),
  'dana-veiga': S(9, 8.8, 'PPG', 5.4, 'APG', 1.8, 'SPG', 9, [53, 55, 56, 58, 59, 60]),
  'orlando-furtado': S(7, 232.1, '1500m (s)', 0, '—', 0, '—', 2, [66, 66, 67, 67, 68, 68]),
  'melissa-cruz': S(12, 0, 'Golos/j', 0.1, 'Assist./j', 3.9, 'Desarmes', 6, [57, 58, 60, 60, 61, 62]),
  'telmo-andrade': S(13, 10.4, 'PPG', 0.9, 'APG', 1.6, 'BPG', 2, [68, 69, 69, 70, 70, 70]),
  'sabrina-gomes': S(6, 55.8, '400m (s)', 0, '—', 0, '—', 4, [62, 62, 63, 64, 65, 65]),
  'ricardo-evora': S(17, 0, 'Golos/j', 0, 'Assist./j', 5.2, 'Defesas/j', 1, [68, 68, 69, 69, 69, 69]),
  'ines-delgado': S(8, 11.2, 'PPG', 1.9, 'APG', 1.3, 'SPG', 7, [55, 56, 58, 59, 60, 61]),
  'joel-martins': S(5, 1.98, 'Altura (m)', 0, '—', 0, '—', 3, [56, 56, 57, 58, 58, 58]),
  'vania-pires': S(11, 0.8, 'Golos/j', 0.2, 'Assist./j', 0.9, 'Desarmes', 8, [52, 54, 55, 57, 58, 59]),
  'adilson-rosa': S(12, 9.6, 'PPG', 1.6, 'APG', 2.1, 'SPG', 3, [65, 65, 66, 66, 67, 67]),
  'carla-mendes': S(6, 13.4, 'Peso (m)', 0, '—', 0, '—', 1, [62, 62, 63, 63, 63, 63]),
};

/* ------------------------------------------------------------------ */
/* Age group helpers (demo year = 2027)                                */
/* ------------------------------------------------------------------ */

export const demoAge = (a: AthleteProfile) => 2027 - a.birthYear;

export type AgeGroup = 'u14' | 'u16' | 'u18' | 'u21' | 'senior';

export function ageGroupOf(a: AthleteProfile): AgeGroup {
  const age = demoAge(a);
  if (age <= 14) return 'u14';
  if (age <= 16) return 'u16';
  if (age <= 18) return 'u18';
  if (age <= 21) return 'u21';
  return 'senior';
}

export const ISLANDS = ['Santiago', 'São Vicente', 'Sal', 'Santo Antão', 'Fogo', 'Brava', 'Diáspora'];

/** Demo flag: athletes open to transfer (Discover verification filter). */
export const OPEN_TO_TRANSFER = new Set([
  'mario-anoceto',
  'kelvin-delgado',
  'tatiana-lopes',
  'bruno-cardoso',
  'vania-pires',
  'ines-delgado',
]);

export const POSITION_OPTIONS: Record<Sport, string[]> = {
  basketball: ['Base', 'Extremo', 'Ala', 'Poste'],
  football: ['Guarda-redes', 'Defesa', 'Médio', 'Avançado'],
  athletics: ['Velocista', 'Barreiras', 'Meio-fundo', 'Salto', 'Lançamento'],
};

/* ------------------------------------------------------------------ */
/* Extra competitions (3) — total 6 in the directory                   */
/* ------------------------------------------------------------------ */

export const extraCompetitions: Competition[] = [
  {
    id: 'taca-sao-vicente-sub16',
    name: 'Taça São Vicente Sub-16',
    sport: 'football',
    season: '2026/27',
    island: 'São Vicente',
    organizer: 'Associação Juvenil do Mindelo (fictícia)',
    status: 'finished',
    teamsCount: 8,
    groupsCount: 2,
    startDate: '2026-10-03',
    endDate: '2026-12-19',
  },
  {
    id: 'torneio-3x3-sal-rei',
    name: 'Torneio 3x3 Sal Rei',
    sport: 'basketball',
    season: '2027',
    island: 'Sal',
    organizer: 'Coletivo Basquete Sal (fictício)',
    status: 'upcoming',
    teamsCount: 12,
    groupsCount: 4,
    startDate: '2027-02-14',
    endDate: '2027-02-15',
  },
  {
    id: 'liga-basket-santiago-norte',
    name: 'Liga Regional de Basquetebol — Santiago Norte',
    sport: 'basketball',
    season: '2026/27',
    island: 'Santiago',
    organizer: 'Associação Regional de Basquetebol (fictícia)',
    status: 'live',
    teamsCount: 6,
    groupsCount: 1,
    startDate: '2026-11-08',
    endDate: '2027-04-26',
  },
];

export const publicCompetitions: Competition[] = [...competitions, ...extraCompetitions];
export const getPublicCompetition = (id: string) => publicCompetitions.find((c) => c.id === id);

/** Verified competitions (demo): everything except the 3x3 beach tournament. */
export const VERIFIED_COMPETITIONS = new Set([
  'inter-liceu-2027',
  'liga-juvenil-santiago-sul',
  'meeting-atletismo-praia-2027',
  'taca-sao-vicente-sub16',
  'liga-basket-santiago-norte',
]);

/* ------------------------------------------------------------------ */
/* INTER LICEU 2027 — fixtures, box scores, leaders, MVP               */
/* ------------------------------------------------------------------ */

export interface Fixture extends Match {
  round: number;
}

const IL_VENUES = ['Pavilhão da Várzea, Praia', 'Pavilhão Achada, Praia', 'Pavilhão do Plateau, Praia'];

const ilTeams = competitions.find((c) => c.id === 'inter-liceu-2027')?.teams ?? [];
const strength = new Map(ilTeams.map((t) => [t.name, t.won - t.lost]));

const groups: Record<string, string[]> = { A: [], B: [], C: [] };
for (const t of ilTeams) groups[t.group]?.push(t.name);

function jitter(seed: number) {
  // deterministic pseudo-random in [-4, 4]
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 9) - 4;
}

function generateGroupFixtures(): Fixture[] {
  const out: Fixture[] = [];
  let seq = 0;
  for (const g of ['A', 'B', 'C']) {
    const teams = groups[g] ?? [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        for (let leg = 0; leg < 2; leg++) {
          seq += 1;
          const home = leg === 0 ? teams[i] : teams[j];
          const away = leg === 0 ? teams[j] : teams[i];
          const round = leg === 0 ? (seq % 3) + 1 : (seq % 3) + 4;
          const diff = (strength.get(home) ?? 0) - (strength.get(away) ?? 0);
          const base = 58 + diff * 3;
          const homeScore = Math.min(96, Math.max(42, base + jitter(seq * 3 + 1)));
          const awayScore = Math.min(96, Math.max(40, 58 - diff * 3 + jitter(seq * 3 + 2)));
          const day = 8 + (round - 1) * 3 + (seq % 3);
          out.push({
            id: `il-fx-${seq}`,
            competitionId: 'inter-liceu-2027',
            sport: 'basketball',
            homeTeam: home,
            awayTeam: away,
            homeScore,
            awayScore,
            status: 'finished',
            venue: IL_VENUES[seq % IL_VENUES.length],
            date: `2027-01-${String(Math.min(day, 23)).padStart(2, '0')}T${seq % 2 === 0 ? '16:00' : '17:30'}:00`,
            group: g,
            round,
          });
        }
      }
    }
  }
  return out;
}

const playoffFixtures: Fixture[] = [
  { id: 'il-po-1', competitionId: 'inter-liceu-2027', sport: 'basketball', homeTeam: 'Liceu Domingos Ramos', awayTeam: 'Escola do Plateau', homeScore: 0, awayScore: 0, status: 'scheduled', venue: 'Pavilhão da Várzea, Praia', date: '2027-01-26T17:30:00', group: 'B', round: 7 },
  { id: 'il-po-2', competitionId: 'inter-liceu-2027', sport: 'basketball', homeTeam: 'Escola Tira Chapéu', awayTeam: 'União Tira Chapéu', homeScore: 0, awayScore: 0, status: 'scheduled', venue: 'Pavilhão Achada, Praia', date: '2027-01-27T17:30:00', group: 'C', round: 7 },
  { id: 'il-po-3', competitionId: 'inter-liceu-2027', sport: 'basketball', homeTeam: 'Liceu Achada Grande', awayTeam: 'Colégio São José (fictício)', homeScore: 0, awayScore: 0, status: 'scheduled', venue: 'Pavilhão do Plateau, Praia', date: '2027-01-29T16:00:00', group: 'A', round: 8 },
];

/** All Inter Liceu fixtures: generated group stage + core matches + playoffs. */
export const interLiceuFixtures: Fixture[] = [
  ...matches
    .filter((m) => m.competitionId === 'inter-liceu-2027')
    .map((m) => ({ ...m, round: m.id === 'demo-match' ? 7 : m.id === 'm-il-003' ? 7 : 6 })),
  ...generateGroupFixtures(),
  ...playoffFixtures,
].sort((a, b) => b.date.localeCompare(a.date));

export const IL_TOTAL_GAMES = 45;
export const IL_PLAYED_GAMES = 24;
export const IL_PLAYERS_COUNT = 186;

/* ------------------------- box scores ------------------------------ */

export interface BoxScoreRow {
  name: string;
  athleteId?: string;
  pts: number;
  reb: number;
  ast: number;
}

/** Fictional player pool per Inter Liceu team (athlete pool linked where possible). */
export const IL_TEAM_PLAYERS: Record<string, { name: string; athleteId?: string }[]> = {
  'Atlético Achada': [
    { name: 'Erick Semedo', athleteId: 'erick-semedo' },
    { name: 'Ivanilson Tavares', athleteId: 'ivanilson-tavares' },
    { name: 'Telmo Andrade', athleteId: 'telmo-andrade' },
    { name: 'Nuno Barros' },
    { name: 'César Monteiro' },
  ],
  'Estrela do Sul': [
    { name: 'Nádia Fortes', athleteId: 'nadia-fortes' },
    { name: 'Dana Veiga', athleteId: 'dana-veiga' },
    { name: 'Adilson Rosa', athleteId: 'adilson-rosa' },
    { name: 'Eliza Fonseca' },
    { name: 'Mara Fortes' },
  ],
  'União Tira Chapéu': [
    { name: 'Kelvin Delgado', athleteId: 'kelvin-delgado' },
    { name: 'Inês Delgado', athleteId: 'ines-delgado' },
    { name: 'Rui Varela' },
    { name: 'Yuri Santos' },
    { name: 'Ivo Almeida' },
  ],
  'Liceu Achada Grande': [
    { name: 'Débora Lopes' },
    { name: 'Ailton Pina' },
    { name: 'Kevin Spencer' },
    { name: 'Lara Duarte' },
    { name: 'Osvaldo Reis' },
  ],
  'Escola Tira Chapéu': [
    { name: 'Tatiana Lopes', athleteId: 'tatiana-lopes' },
    { name: 'Milton Soares' },
    { name: 'Indira Semedo' },
    { name: 'Paulo Neves' },
    { name: 'Stela Gomes' },
  ],
  'Liceu Domingos Ramos': [
    { name: 'Bruno Cardoso', athleteId: 'bruno-cardoso' },
    { name: 'Hugo Almeida' },
    { name: 'Tânia Rocha' },
    { name: 'Edson Lima' },
    { name: 'Vera Cardoso' },
  ],
  'Colégio São José (fictício)': [
    { name: 'Fábio Neves' },
    { name: 'Gilda Ramos' },
    { name: 'Marco Pires' },
    { name: 'Sónia Tavares' },
    { name: 'Luis Andrade' },
  ],
  'Escola do Plateau': [
    { name: 'Dany Fortes' },
    { name: 'Olívia Cruz' },
    { name: 'Renato Silva' },
    { name: 'Bia Monteiro' },
    { name: 'Kiko Delgado' },
  ],
  'Liceu de Palmarejo': [
    { name: 'Zé Manuel Rocha' },
    { name: 'Ana Vera Lopes' },
    { name: 'Dario Gomes' },
    { name: 'Tucha Almeida' },
    { name: 'Elsa Pires' },
  ],
  'Escola da Várzea': [
    { name: 'Walter Semedo' },
    { name: 'Cidália Fonseca' },
    { name: 'Nilson Brito' },
    { name: 'Ary Veiga' },
    { name: 'Tomás Évora' },
  ],
};

/** Deterministic demo box score for a finished fixture. */
export function boxScoreFor(match: Match): { home: BoxScoreRow[]; away: BoxScoreRow[] } {
  const build = (team: string, teamScore: number, salt: number): BoxScoreRow[] => {
    const pool = IL_TEAM_PLAYERS[team] ?? [];
    const weights = [0.28, 0.22, 0.18, 0.17, 0.15];
    return pool.map((p, i) => {
      const pts = Math.max(0, Math.round(teamScore * (weights[i] ?? 0.1)) + jitter(salt + i * 7));
      return {
        name: p.name,
        athleteId: p.athleteId,
        pts,
        reb: Math.max(0, 3 + jitter(salt + i * 11 + 2)),
        ast: Math.max(0, 2 + jitter(salt + i * 13 + 4)),
      };
    });
  };
  const seed = match.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return { home: build(match.homeTeam, match.homeScore, seed), away: build(match.awayTeam, match.awayScore, seed + 31) };
}

/* ------------------------- competition leaders ---------------------- */

export interface LeaderRow {
  id: string;
  name: string;
  team: string;
  athleteId?: string;
  games: number;
  pts: number;
  ast: number;
  reb: number;
  stl: number;
  blk: number;
  efic: number;
}

export const interLiceuLeaders: LeaderRow[] = [
  { id: 'l1', name: 'Erick Semedo', team: 'Atlético Achada', athleteId: 'erick-semedo', games: 14, pts: 18.4, ast: 5.8, reb: 4.1, stl: 2.4, blk: 0.2, efic: 24.8 },
  { id: 'l2', name: 'Nuno Barros', team: 'Liceu Achada Grande', games: 14, pts: 22.4, ast: 3.1, reb: 5.6, stl: 1.4, blk: 0.4, efic: 23.9 },
  { id: 'l3', name: 'Kelvin Delgado', team: 'União Tira Chapéu', athleteId: 'kelvin-delgado', games: 13, pts: 13.6, ast: 2.8, reb: 6.2, stl: 2.6, blk: 0.8, efic: 19.7 },
  { id: 'l4', name: 'Nádia Fortes', team: 'Estrela do Sul', athleteId: 'nadia-fortes', games: 14, pts: 15.1, ast: 4.2, reb: 3.8, stl: 1.9, blk: 0.1, efic: 18.6 },
  { id: 'l5', name: 'Ivanilson Tavares', team: 'Atlético Achada', athleteId: 'ivanilson-tavares', games: 12, pts: 12.8, ast: 1.4, reb: 11.2, stl: 0.9, blk: 1.6, efic: 21.3 },
  { id: 'l6', name: 'Tatiana Lopes', team: 'Escola Tira Chapéu', athleteId: 'tatiana-lopes', games: 11, pts: 9.4, ast: 8.1, reb: 3.2, stl: 1.5, blk: 0.0, efic: 16.4 },
  { id: 'l7', name: 'Ailton Pina', team: 'Liceu Achada Grande', games: 14, pts: 14.8, ast: 2.2, reb: 7.4, stl: 1.1, blk: 1.1, efic: 18.1 },
  { id: 'l8', name: 'Dana Veiga', team: 'Estrela do Sul', athleteId: 'dana-veiga', games: 9, pts: 8.8, ast: 5.4, reb: 2.6, stl: 1.8, blk: 0.0, efic: 13.2 },
  { id: 'l9', name: 'Bruno Cardoso', team: 'Liceu Domingos Ramos', athleteId: 'bruno-cardoso', games: 10, pts: 14.2, ast: 2.1, reb: 6.8, stl: 1.1, blk: 0.9, efic: 17.5 },
  { id: 'l10', name: 'Telmo Andrade', team: 'Atlético Achada', athleteId: 'telmo-andrade', games: 13, pts: 10.4, ast: 0.9, reb: 9.8, stl: 0.7, blk: 2.2, efic: 17.9 },
  { id: 'l11', name: 'Milton Soares', team: 'Escola Tira Chapéu', games: 12, pts: 11.9, ast: 1.8, reb: 5.1, stl: 1.6, blk: 0.3, efic: 13.8 },
  { id: 'l12', name: 'Dany Fortes', team: 'Escola do Plateau', games: 12, pts: 12.6, ast: 2.9, reb: 4.4, stl: 1.2, blk: 0.2, efic: 14.6 },
  { id: 'l13', name: 'Adilson Rosa', team: 'Estrela do Sul', athleteId: 'adilson-rosa', games: 12, pts: 9.6, ast: 1.6, reb: 5.9, stl: 2.1, blk: 0.6, efic: 13.9 },
  { id: 'l14', name: 'Zé Manuel Rocha', team: 'Liceu de Palmarejo', games: 11, pts: 13.3, ast: 1.2, reb: 4.8, stl: 0.8, blk: 0.4, efic: 13.1 },
];

export type LeaderCategory = 'pts' | 'ast' | 'reb' | 'stl' | 'blk' | 'efic';
export const LEADER_CATEGORIES: LeaderCategory[] = ['pts', 'ast', 'reb', 'stl', 'blk', 'efic'];

/* ------------------------------ MVP race ---------------------------- */

export interface MvpCandidate {
  athleteId?: string;
  name: string;
  team: string;
  index: number;
  statLine: string;
  trend: number[];
}

export const mvpRace: MvpCandidate[] = [
  { athleteId: 'erick-semedo', name: 'Erick Semedo', team: 'Atlético Achada', index: 92, statLine: '18.4 PTS · 5.8 AST · 24.8 EFIC', trend: [78, 82, 85, 88, 92] },
  { name: 'Nuno Barros', team: 'Liceu Achada Grande', index: 88, statLine: '22.4 PTS · 5.6 REB · 23.9 EFIC', trend: [74, 79, 84, 85, 88] },
  { athleteId: 'ivanilson-tavares', name: 'Ivanilson Tavares', team: 'Atlético Achada', index: 81, statLine: '12.8 PTS · 11.2 REB · 21.3 EFIC', trend: [70, 74, 77, 79, 81] },
  { athleteId: 'kelvin-delgado', name: 'Kelvin Delgado', team: 'União Tira Chapéu', index: 79, statLine: '13.6 PTS · 2.6 STL · 19.7 EFIC', trend: [66, 71, 74, 77, 79] },
  { athleteId: 'nadia-fortes', name: 'Nádia Fortes', team: 'Estrela do Sul', index: 76, statLine: '15.1 PTS · 4.2 AST · 18.6 EFIC', trend: [68, 70, 72, 74, 76] },
];

/* ---------------------- scouting clips + reports -------------------- */

export interface ScoutClip {
  id: string;
  thumb: string;
  athleteName: string;
  athleteId?: string;
  tagPt: string;
  tagEn: string;
  timestamp: string;
  durationSec: number;
}

export const interLiceuClips: ScoutClip[] = [
  { id: 'c1', thumb: '/video-thumb-1.jpg', athleteName: 'Erick Semedo', athleteId: 'erick-semedo', tagPt: 'Q3 06:32 — 3PT convertido', tagEn: 'Q3 06:32 — 3PT made', timestamp: '2027-01-24', durationSec: 18 },
  { id: 'c2', thumb: '/video-thumb-4.jpg', athleteName: 'Kelvin Delgado', athleteId: 'kelvin-delgado', tagPt: 'Q3 06:41 — Roubo de bola', tagEn: 'Q3 06:41 — Steal', timestamp: '2027-01-24', durationSec: 12 },
  { id: 'c3', thumb: '/video-thumb-1.jpg', athleteName: 'Nádia Fortes', athleteId: 'nadia-fortes', tagPt: 'Q3 06:11 — Excelente assistência', tagEn: 'Q3 06:11 — Great assist', timestamp: '2027-01-24', durationSec: 15 },
  { id: 'c4', thumb: '/video-thumb-5.jpg', athleteName: 'Ivanilson Tavares', athleteId: 'ivanilson-tavares', tagPt: 'Q2 03:48 — Ressalto ofensivo + putback', tagEn: 'Q2 03:48 — Offensive rebound + putback', timestamp: '2027-01-22', durationSec: 21 },
  { id: 'c5', thumb: '/video-thumb-4.jpg', athleteName: 'Nuno Barros', tagPt: 'Q4 01:12 — Contra-ataque finalizado', tagEn: 'Q4 01:12 — Fast-break finish', timestamp: '2027-01-21', durationSec: 14 },
  { id: 'c6', thumb: '/video-thumb-5.jpg', athleteName: 'Tatiana Lopes', athleteId: 'tatiana-lopes', tagPt: 'Q1 08:05 — Passe picado no pick-and-roll', tagEn: 'Q1 08:05 — Pick-and-roll bounce pass', timestamp: '2027-01-19', durationSec: 16 },
];

export interface CompetitionReport {
  id: string;
  scoutName: string;
  scoutId: string;
  athleteName: string;
  athleteId?: string;
  date: string;
  recommendation: 'follow' | 'shortlist' | 'sign' | 'monitor';
}

export const interLiceuReports: CompetitionReport[] = [
  { id: 'r1', scoutName: 'Carlos Moniz', scoutId: 'scout-carlos-moniz', athleteName: 'Erick Semedo', athleteId: 'erick-semedo', date: '2027-01-24', recommendation: 'sign' },
  { id: 'r2', scoutName: 'Inês Barbosa', scoutId: 'scout-ines-barbosa', athleteName: 'Kelvin Delgado', athleteId: 'kelvin-delgado', date: '2027-01-24', recommendation: 'follow' },
  { id: 'r3', scoutName: 'Carlos Moniz', scoutId: 'scout-carlos-moniz', athleteName: 'Nuno Barros', date: '2027-01-22', recommendation: 'shortlist' },
  { id: 'r4', scoutName: 'Inês Barbosa', scoutId: 'scout-ines-barbosa', athleteName: 'Nádia Fortes', athleteId: 'nadia-fortes', date: '2027-01-22', recommendation: 'sign' },
  { id: 'r5', scoutName: 'Bruno Livramento', scoutId: 'scout-bruno-livramento', athleteName: 'Ivanilson Tavares', athleteId: 'ivanilson-tavares', date: '2027-01-21', recommendation: 'monitor' },
  { id: 'r6', scoutName: 'Sandra Pires', scoutId: 'scout-sandra-pires', athleteName: 'Dana Veiga', athleteId: 'dana-veiga', date: '2027-01-21', recommendation: 'follow' },
  { id: 'r7', scoutName: 'Carlos Moniz', scoutId: 'scout-carlos-moniz', athleteName: 'Tatiana Lopes', athleteId: 'tatiana-lopes', date: '2027-01-19', recommendation: 'shortlist' },
  { id: 'r8', scoutName: 'Inês Barbosa', scoutId: 'scout-ines-barbosa', athleteName: 'Bruno Cardoso', athleteId: 'bruno-cardoso', date: '2027-01-19', recommendation: 'follow' },
  { id: 'r9', scoutName: 'Sandra Pires', scoutId: 'scout-sandra-pires', athleteName: 'Ailton Pina', date: '2027-01-18', recommendation: 'monitor' },
  { id: 'r10', scoutName: 'Bruno Livramento', scoutId: 'scout-bruno-livramento', athleteName: 'Inês Delgado', athleteId: 'ines-delgado', date: '2027-01-17', recommendation: 'follow' },
  { id: 'r11', scoutName: 'Carlos Moniz', scoutId: 'scout-carlos-moniz', athleteName: 'Telmo Andrade', athleteId: 'telmo-andrade', date: '2027-01-15', recommendation: 'monitor' },
  { id: 'r12', scoutName: 'Inês Barbosa', scoutId: 'scout-ines-barbosa', athleteName: 'Adilson Rosa', athleteId: 'adilson-rosa', date: '2027-01-15', recommendation: 'shortlist' },
];

/* ------------------- featured searches (Discover rail) --------------- */

export interface FeaturedSearch {
  key: 'f1' | 'f2' | 'f3' | 'f4';
  params: Record<string, string>;
}

export const featuredSearches: FeaturedSearch[] = [
  { key: 'f1', params: { tab: 'athletes', sports: 'basketball', pos: 'Base', ages: 'u18', islands: 'Santiago' } },
  { key: 'f2', params: { tab: 'athletes', sports: 'football', pos: 'Avançado', verif: 'statsVerified' } },
  { key: 'f3', params: { tab: 'athletes', sports: 'athletics', pos: 'Velocista', ages: 'u21' } },
  { key: 'f4', params: { tab: 'scouts', sports: 'basketball', verif: 'verified' } },
];

/* ------------------------------------------------------------------ */
/* Rankings engine (demo) — categories with weekly deltas              */
/* ------------------------------------------------------------------ */

export type RankingCategoryId =
  | 'topAthletes'
  | 'topU18'
  | 'topSeniors'
  | 'topScorers'
  | 'topAssists'
  | 'bestDefenders'
  | 'mostImproved';

export const RANKING_CATEGORY_IDS: RankingCategoryId[] = [
  'topAthletes',
  'topU18',
  'topSeniors',
  'topScorers',
  'topAssists',
  'bestDefenders',
  'mostImproved',
];

export interface RankingRow {
  athleteId: string;
  rank: number;
  delta: number;
  ovr: number;
  statValue: string;
  statLabel: string;
  games: number;
}

/** Deterministic weekly delta per athlete/category. */
function deltaFor(id: string, salt: number): number {
  const seed = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), salt);
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 6) - 3;
}

function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals).replace(/\.0$/, '');
}

export function rankingFor(category: RankingCategoryId): RankingRow[] {
  let pool = publicAthletes.map((a) => ({ a, s: athleteDemoStats[a.id] })).filter((x) => x.s);
  let key: (x: { a: AthleteProfile; s: AthleteDemoStats }) => number;
  let statOf: (x: { a: AthleteProfile; s: AthleteDemoStats }) => { value: string; label: string };

  switch (category) {
    case 'topAthletes':
      key = (x) => x.a.ovr.value;
      statOf = (x) => ({ value: x.a.keyStat.value, label: x.a.keyStat.label });
      break;
    case 'topU18':
      pool = pool.filter((x) => demoAge(x.a) <= 18);
      key = (x) => x.a.ovr.value;
      statOf = (x) => ({ value: x.a.keyStat.value, label: x.a.keyStat.label });
      break;
    case 'topSeniors':
      pool = pool.filter((x) => demoAge(x.a) >= 21);
      key = (x) => x.a.ovr.value;
      statOf = (x) => ({ value: x.a.keyStat.value, label: x.a.keyStat.label });
      break;
    case 'topScorers':
      pool = pool.filter((x) => x.a.sport !== 'athletics');
      key = (x) => x.s.scoring;
      statOf = (x) => ({ value: fmt(x.s.scoring), label: x.s.scoringLabel });
      break;
    case 'topAssists':
      pool = pool.filter((x) => x.a.sport !== 'athletics');
      key = (x) => x.s.playmaking;
      statOf = (x) => ({ value: fmt(x.s.playmaking), label: x.s.playmakingLabel });
      break;
    case 'bestDefenders':
      pool = pool.filter((x) => x.s.defense > 0);
      key = (x) => x.s.defense;
      statOf = (x) => ({ value: fmt(x.s.defense), label: x.s.defenseLabel });
      break;
    case 'mostImproved':
      key = (x) => x.s.improvement;
      statOf = (x) => ({ value: `+${x.s.improvement}`, label: 'OVR' });
      break;
  }

  return pool
    .slice()
    .sort((p, q) => key(q) - key(p) || q.a.pot - p.a.pot)
    .map((x, i) => ({
      athleteId: x.a.id,
      rank: i + 1,
      delta: deltaFor(x.a.id, category.length),
      ovr: x.a.ovr.value,
      statValue: statOf(x).value,
      statLabel: statOf(x).label,
      games: x.s.games,
    }));
}

/** Talent of the Week (demo): verified U-18 sprint record. */
export const TALENT_OF_WEEK_ID = 'anisa-monteiro';

/* ------------------- team comparison (radar) ------------------------ */

export interface TeamRadarRow {
  team: string;
  attack: number;
  defense: number;
  pace: number;
  discipline: number;
  form: number;
}

export const interLiceuTeamRadar: TeamRadarRow[] = [
  { team: 'Liceu Achada Grande', attack: 88, defense: 84, pace: 76, discipline: 82, form: 96 },
  { team: 'Atlético Achada', attack: 84, defense: 78, pace: 82, discipline: 80, form: 78 },
  { team: 'União Tira Chapéu', attack: 80, defense: 74, pace: 86, discipline: 72, form: 76 },
  { team: 'Escola Tira Chapéu', attack: 76, defense: 72, pace: 74, discipline: 78, form: 72 },
];
