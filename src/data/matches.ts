/** Fictional demo matches + match events (design.md sec. 10). */
import type { Match, MatchEvent } from './types';

export const matches: Match[] = [
  {
    id: 'demo-match',
    competitionId: 'inter-liceu-2027',
    sport: 'basketball',
    homeTeam: 'Atlético Achada',
    awayTeam: 'Estrela do Sul',
    homeScore: 54,
    awayScore: 49,
    status: 'live',
    venue: 'Pavilhão da Várzea, Praia',
    date: '2027-01-24T17:30:00',
    quarter: 'Q3',
    clock: '06:32',
    group: 'A',
  },
  {
    id: 'm-il-002',
    competitionId: 'inter-liceu-2027',
    sport: 'basketball',
    homeTeam: 'Liceu Achada Grande',
    awayTeam: 'União Tira Chapéu',
    homeScore: 62,
    awayScore: 58,
    status: 'finished',
    venue: 'Pavilhão da Várzea, Praia',
    date: '2027-01-22T16:00:00',
    group: 'A',
  },
  {
    id: 'm-il-003',
    competitionId: 'inter-liceu-2027',
    sport: 'basketball',
    homeTeam: 'Escola Tira Chapéu',
    awayTeam: 'Liceu Domingos Ramos',
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled',
    venue: 'Pavilhão da Várzea, Praia',
    date: '2027-01-28T17:00:00',
    group: 'B',
  },
  {
    id: 'm-lj-001',
    competitionId: 'liga-juvenil-santiago-sul',
    sport: 'football',
    homeTeam: 'Desportivo da Baía Sub-17',
    awayTeam: 'Clube Farol de São Vicente Sub-17',
    homeScore: 2,
    awayScore: 1,
    status: 'finished',
    venue: 'Campo da Baía, Mindelo',
    date: '2027-01-18T15:00:00',
  },
];

export const matchEvents: MatchEvent[] = [
  { id: 'ev1', matchId: 'demo-match', clock: '05:58', quarter: 'Q3', playerLabel: '#23 I. Tavares', type: 'OREB', descriptionPt: '#23 I. Tavares — Ressalto ofensivo', descriptionEn: '#23 I. Tavares — Offensive rebound' },
  { id: 'ev2', matchId: 'demo-match', clock: '06:11', quarter: 'Q3', playerLabel: '#9 N. Fortes', type: 'AST', descriptionPt: '#9 N. Fortes — Assistência', descriptionEn: '#9 N. Fortes — Assist', clipMarked: true },
  { id: 'ev3', matchId: 'demo-match', clock: '06:32', quarter: 'Q3', playerLabel: '#7 Erick S.', type: '3PT', descriptionPt: '#7 Erick S. — 3PT convertido', descriptionEn: '#7 Erick S. — 3PT made', clipMarked: true },
  { id: 'ev4', matchId: 'demo-match', clock: '06:41', quarter: 'Q3', playerLabel: '#11 K. Delgado', type: 'STL', descriptionPt: '#11 K. Delgado — Roubo de bola', descriptionEn: '#11 K. Delgado — Steal' },
  { id: 'ev5', matchId: 'demo-match', clock: '07:05', quarter: 'Q3', playerLabel: '#4 T. Lopes', type: '2PT', descriptionPt: '#4 T. Lopes — 2PT convertido', descriptionEn: '#4 T. Lopes — 2PT made' },
  { id: 'ev6', matchId: 'demo-match', clock: '07:29', quarter: 'Q3', playerLabel: '#7 Erick S.', type: 'DUNK', descriptionPt: '#7 Erick S. — Afundanço', descriptionEn: '#7 Erick S. — Dunk', clipMarked: true },
];

export const getMatch = (id: string) => matches.find((m) => m.id === id);
export const getMatchEvents = (matchId: string) => matchEvents.filter((e) => e.matchId === matchId);
