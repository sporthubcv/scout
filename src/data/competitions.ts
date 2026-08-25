/**
 * Fictional demo competitions (design.md sec. 10.4).
 * INTER LICEU 2027 is the flagship demo competition: basketball, 10 teams, 3 groups.
 */
import type { Competition } from './types';

export const competitions: Competition[] = [
  {
    id: 'inter-liceu-2027',
    name: 'INTER LICEU 2027',
    sport: 'basketball',
    season: '2026/27',
    island: 'Santiago',
    organizer: 'Associação Desportiva Escolar da Praia (fictícia)',
    status: 'live',
    teamsCount: 10,
    groupsCount: 3,
    startDate: '2027-01-08',
    endDate: '2027-03-22',
    teams: [
      { id: 't1', name: 'Liceu Achada Grande', group: 'A', played: 4, won: 4, lost: 0, pointsFor: 268, pointsAgainst: 201 },
      { id: 't2', name: 'Atlético Achada', group: 'A', played: 4, won: 3, lost: 1, pointsFor: 254, pointsAgainst: 219 },
      { id: 't3', name: 'Estrela do Sul', group: 'A', played: 4, won: 2, lost: 2, pointsFor: 231, pointsAgainst: 228 },
      { id: 't4', name: 'Escola Tira Chapéu', group: 'B', played: 4, won: 3, lost: 1, pointsFor: 245, pointsAgainst: 217 },
      { id: 't5', name: 'Liceu Domingos Ramos', group: 'B', played: 4, won: 2, lost: 2, pointsFor: 229, pointsAgainst: 230 },
      { id: 't6', name: 'Colégio São José (fictício)', group: 'B', played: 4, won: 1, lost: 3, pointsFor: 208, pointsAgainst: 241 },
      { id: 't7', name: 'União Tira Chapéu', group: 'C', played: 4, won: 3, lost: 1, pointsFor: 251, pointsAgainst: 224 },
      { id: 't8', name: 'Escola do Plateau', group: 'C', played: 4, won: 2, lost: 2, pointsFor: 226, pointsAgainst: 232 },
      { id: 't9', name: 'Liceu de Palmarejo', group: 'C', played: 4, won: 1, lost: 3, pointsFor: 214, pointsAgainst: 239 },
      { id: 't10', name: 'Escola da Várzea', group: 'C', played: 4, won: 0, lost: 4, pointsFor: 196, pointsAgainst: 260 },
    ],
  },
  {
    id: 'liga-juvenil-santiago-sul',
    name: 'Liga Juvenil Santiago Sul 2026/27',
    sport: 'football',
    season: '2026/27',
    island: 'Santiago',
    organizer: 'Liga Regional de Futebol Juvenil (fictícia)',
    status: 'upcoming',
    teamsCount: 8,
    groupsCount: 1,
    startDate: '2027-02-01',
    endDate: '2027-05-30',
  },
  {
    id: 'meeting-atletismo-praia-2027',
    name: 'Meeting Nacional de Atletismo — Praia 2027',
    sport: 'athletics',
    season: '2027',
    island: 'Santiago',
    organizer: 'Federação Atlética Insular (fictícia)',
    status: 'upcoming',
    teamsCount: 12,
    groupsCount: 0,
    startDate: '2027-04-18',
    endDate: '2027-04-19',
  },
];

export const getCompetition = (id: string) => competitions.find((c) => c.id === id);
