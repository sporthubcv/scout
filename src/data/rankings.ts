/** Fictional demo rankings (per sport, sub-18, season 2026/27). */
import type { Ranking } from './types';

export const rankings: Ranking[] = [
  {
    id: 'rk-basketball-u18',
    sport: 'basketball',
    category: 'Sub-18',
    season: '2026/27',
    entries: [
      { rank: 1, athleteId: 'erick-semedo', ovr: 78, delta: 0 },
      { rank: 2, athleteId: 'nadia-fortes', ovr: 74, delta: 1 },
      { rank: 3, athleteId: 'kelvin-delgado', ovr: 72, delta: 2 },
      { rank: 4, athleteId: 'ivanilson-tavares', ovr: 71, delta: -1 },
      { rank: 5, athleteId: 'tatiana-lopes', ovr: 69, delta: 0 },
    ],
  },
  {
    id: 'rk-football-u18',
    sport: 'football',
    category: 'Sub-18',
    season: '2026/27',
    entries: [
      { rank: 1, athleteId: 'mario-anoceto', ovr: 75, delta: 1 },
      { rank: 2, athleteId: 'dario-corrreia', ovr: 70, delta: 0 },
      { rank: 3, athleteId: 'silvano-ramos', ovr: 68, delta: -1 },
      { rank: 4, athleteId: 'helio-varela', ovr: 67, delta: 2 },
    ],
  },
  {
    id: 'rk-athletics-u18',
    sport: 'athletics',
    category: 'Sub-18',
    season: '2026/27',
    entries: [
      { rank: 1, athleteId: 'anisa-monteiro', ovr: 76, delta: 0 },
      { rank: 2, athleteId: 'elton-burgo', ovr: 70, delta: 1 },
      { rank: 3, athleteId: 'yara-andrade', ovr: 66, delta: -1 },
    ],
  },
];

/** Talent of the Week (demo): flagship athlete. */
export const talentOfWeekId = 'erick-semedo';
