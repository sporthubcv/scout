/** Fictional demo statistics, evidence and scout reports. */
import type { AthleteStatistic, ScoutReport } from './types';

export const statistics: AthleteStatistic[] = [
  {
    id: 'st1', athleteId: 'erick-semedo', season: '2026/27', label: 'PPG', value: '18.4',
    verification: 'verified',
    evidence: [{ id: 'e1', kind: 'matchSheet', label: 'Fichas de jogo Inter Liceu (4 jogos)' }],
  },
  {
    id: 'st2', athleteId: 'erick-semedo', season: '2026/27', label: 'AST', value: '5.8',
    verification: 'verified',
    evidence: [{ id: 'e2', kind: 'matchSheet', label: 'Fichas de jogo Inter Liceu (4 jogos)' }],
  },
  {
    id: 'st3', athleteId: 'erick-semedo', season: '2026/27', label: '3P%', value: '38%',
    verification: 'pending',
    evidence: [{ id: 'e3', kind: 'video', label: 'Compilação de lançamentos (demo)' }],
  },
  {
    id: 'st4', athleteId: 'anisa-monteiro', season: '2026', label: '100m', value: '11.84s',
    verification: 'verified',
    evidence: [{ id: 'e4', kind: 'document', label: 'Ata oficial Meeting Praia 2026' }],
  },
  {
    id: 'st5', athleteId: 'mario-anoceto', season: '2026/27', label: 'Golos', value: '14',
    verification: 'verified',
    evidence: [{ id: 'e5', kind: 'matchSheet', label: 'Relatórios oficiais da liga' }],
  },
  {
    id: 'st6', athleteId: 'yara-andrade', season: '2026', label: '800m', value: '2:14.3',
    verification: 'selfReported',
    evidence: [{ id: 'e6', kind: 'video', label: 'Vídeo caseiro de treino (demo)' }],
  },
];

export const scoutReports: ScoutReport[] = [
  {
    id: 'rep1',
    scoutId: 'scout-carlos-moniz',
    athleteId: 'erick-semedo',
    matchId: 'demo-match',
    date: '2027-01-24',
    grade: 'A',
    summaryPt: 'Base com leitura de jogo muito acima da média etária. Controlo de ritmo, decisão rápida no pick-and-roll e lançamento exterior fiável.',
    summaryEn: 'Point guard with game reading well above his age group. Pace control, quick pick-and-roll decisions and a reliable outside shot.',
    strengths: ['Visão de jogo', 'Lançamento de 3PT', 'Liderança'],
    weaknesses: ['Defesa 1v1 contra extremos físicos', 'Finalização com a mão esquerda'],
    recommendation: 'sign',
  },
  {
    id: 'rep2',
    scoutId: 'scout-sandra-pires',
    athleteId: 'mario-anoceto',
    matchId: 'm-lj-001',
    date: '2027-01-18',
    grade: 'A',
    summaryPt: 'Avançado completo: forte no jogo aéreo, boa proteção de bola e instinto de finalizador dentro da área.',
    summaryEn: 'Complete striker: strong aerial game, good ball shielding and a finisher’s instinct inside the box.',
    strengths: ['Jogo aéreo', 'Finalização', 'Pressão alta'],
    weaknesses: ['Disciplina tática sem bola'],
    recommendation: 'shortlist',
  },
  {
    id: 'rep3',
    scoutId: 'scout-bruno-livramento',
    athleteId: 'anisa-monteiro',
    matchId: 'meeting-atletismo-praia-2027',
    date: '2027-01-10',
    grade: 'A',
    summaryPt: 'Velocista com partida explosiva e excelente manutenção de velocidade. Tempos verificados em meeting oficial.',
    summaryEn: 'Sprinter with an explosive start and excellent speed maintenance. Times verified at an official meeting.',
    strengths: ['Partida de blocos', 'Velocidade máxima'],
    weaknesses: ['Técnica de passagem de testemunho'],
    recommendation: 'sign',
  },
  {
    id: 'rep4',
    scoutId: 'scout-ines-barbosa',
    athleteId: 'kelvin-delgado',
    matchId: 'demo-match',
    date: '2027-01-24',
    grade: 'B',
    summaryPt: 'Extremo com grande teto defensivo. Ativo nas linhas de passe; precisa de consistência no tiro exterior.',
    summaryEn: 'Forward with a huge defensive ceiling. Active in passing lanes; needs consistency on the outside shot.',
    strengths: ['Roubos de bola', 'Atletismo'],
    weaknesses: ['Consistência de lançamento'],
    recommendation: 'follow',
  },
];

export const getAthleteStats = (athleteId: string) => statistics.filter((s) => s.athleteId === athleteId);
export const getAthleteReports = (athleteId: string) => scoutReports.filter((r) => r.athleteId === athleteId);
