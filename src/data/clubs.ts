/**
 * Fictional demo clubs (design.md sec. 10). No real clubs or logos.
 * Crests render as generated monogram shields — see shared/MonogramAvatar.
 */
import type { Club } from './types';

export const clubs: Club[] = [
  {
    id: 'atletico-achada',
    name: 'Atlético Achada',
    sports: ['basketball', 'football'],
    island: 'Santiago',
    city: 'Praia',
    founded: 1994,
    verified: true,
    athleteIds: ['erick-semedo', 'ivanilson-tavares'],
  },
  {
    id: 'estrela-do-sul',
    name: 'Estrela do Sul',
    sports: ['basketball', 'athletics'],
    island: 'Santiago',
    city: 'Praia',
    founded: 2001,
    verified: true,
    athleteIds: ['nadia-fortes', 'anisa-monteiro'],
  },
  {
    id: 'desportivo-da-baia',
    name: 'Desportivo da Baía',
    sports: ['football'],
    island: 'São Vicente',
    city: 'Mindelo',
    founded: 1988,
    verified: true,
    athleteIds: ['mario-anoceto', 'silvano-ramos'],
  },
  {
    id: 'clube-farol-sv',
    name: 'Clube Farol de São Vicente',
    sports: ['football'],
    island: 'São Vicente',
    city: 'Mindelo',
    founded: 2005,
    verified: false,
    athleteIds: ['dario-corrreia', 'helio-varela'],
  },
  {
    id: 'uniao-tira-chapeu',
    name: 'União Tira Chapéu',
    sports: ['basketball', 'athletics'],
    island: 'Santiago',
    city: 'Praia',
    founded: 2010,
    verified: false,
    athleteIds: ['kelvin-delgado', 'yara-andrade'],
  },
  {
    id: 'academico-mindelo',
    name: 'Académico do Mindelo',
    sports: ['basketball', 'athletics'],
    island: 'São Vicente',
    city: 'Mindelo',
    founded: 1979,
    verified: true,
    athleteIds: ['tatiana-lopes', 'elton-burgo'],
  },
];

export const getClub = (id: string) => clubs.find((c) => c.id === id);
