/** Fictional demo videos (thumbnails generated per asset manifest). */
import type { Video } from './types';

export const videos: Video[] = [
  {
    id: 'v1', title: 'Erick Semedo — contra-ataque e afundanço (Inter Liceu)',
    athleteId: 'erick-semedo', competitionId: 'inter-liceu-2027', sport: 'basketball',
    kind: 'highlight', thumb: '/video-thumb-1.jpg', durationSec: 94, visibility: 'public',
    views: 1284, date: '2027-01-24',
  },
  {
    id: 'v2', title: 'Mário Anoceto — golo ao cair do pano (Liga Juvenil)',
    athleteId: 'mario-anoceto', competitionId: 'liga-juvenil-santiago-sul', sport: 'football',
    kind: 'highlight', thumb: '/video-thumb-2.jpg', durationSec: 41, visibility: 'public',
    views: 862, date: '2027-01-18',
  },
  {
    id: 'v3', title: 'Anisa Monteiro — série de 100m (Meeting Praia)',
    athleteId: 'anisa-monteiro', competitionId: 'meeting-atletismo-praia-2027', sport: 'athletics',
    kind: 'fullGame', thumb: '/video-thumb-3.jpg', durationSec: 183, visibility: 'public',
    views: 655, date: '2027-01-10',
  },
  {
    id: 'v4', title: 'Kelvin Delgado — clip de scout: defesa e transição',
    athleteId: 'kelvin-delgado', sport: 'basketball',
    kind: 'scoutClip', thumb: '/video-thumb-4.jpg', durationSec: 36, visibility: 'private',
    views: 58, date: '2027-01-24',
  },
  {
    id: 'v5', title: 'INTER LICEU 2027 — jogo completo: Atlético Achada × Estrela do Sul',
    competitionId: 'inter-liceu-2027', sport: 'basketball',
    kind: 'fullGame', thumb: '/video-thumb-5.jpg', durationSec: 4620, visibility: 'public',
    views: 2107, date: '2027-01-22',
  },
  {
    id: 'v6', title: 'Elton Burgo — 110m barreiras, treino de ritmo',
    athleteId: 'elton-burgo', sport: 'athletics',
    kind: 'highlight', thumb: '/video-thumb-6.jpg', durationSec: 52, visibility: 'public',
    views: 311, date: '2027-01-15',
  },
];

export const formatDuration = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
