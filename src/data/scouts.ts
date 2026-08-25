/** Fictional demo scouts. No real people. */
import type { ScoutProfile } from './types';

export const scouts: ScoutProfile[] = [
  {
    id: 'scout-carlos-moniz',
    name: 'Carlos Moniz',
    organization: 'Horizonte Scouting (fictício)',
    specialties: ['basketball'],
    island: 'Santiago',
    verified: true,
    reportsCount: 48,
    athletesWatched: 132,
  },
  {
    id: 'scout-sandra-pires',
    name: 'Sandra Pires',
    organization: 'Atlântico Talent ID (fictício)',
    specialties: ['football'],
    island: 'São Vicente',
    verified: true,
    reportsCount: 35,
    athletesWatched: 97,
  },
  {
    id: 'scout-bruno-livramento',
    name: 'Bruno Livramento',
    organization: 'Independente (fictício)',
    specialties: ['athletics'],
    island: 'Santiago',
    verified: false,
    reportsCount: 19,
    athletesWatched: 54,
  },
  {
    id: 'scout-ines-barbosa',
    name: 'Inês Barbosa',
    organization: 'Horizonte Scouting (fictício)',
    specialties: ['basketball', 'football'],
    island: 'Sal',
    verified: true,
    reportsCount: 27,
    athletesWatched: 76,
  },
];

export const getScout = (id: string) => scouts.find((s) => s.id === id);
