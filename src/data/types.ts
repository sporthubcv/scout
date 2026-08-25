/**
 * SportHub Scout — domain types (design.md sec. 10).
 * All demo data is FICTIONAL. No real people, clubs, federations or sponsors.
 * Structured like real entities so the mock layer can later be swapped for an API.
 */

export type Sport = 'basketball' | 'football' | 'athletics';

export type Role =
  | 'athlete'
  | 'guardian'
  | 'club'
  | 'scout'
  | 'coach'
  | 'organizer'
  | 'federation'
  | 'intlClub'
  | 'sponsor'
  | 'admin';

export type VerificationStatus = 'verified' | 'selfReported' | 'pending' | 'rejected';
export type Confidence = 'high' | 'medium' | 'low';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  createdAt: string; // ISO date
}

export interface OverallSnapshot {
  value: number; // 0-99
  date: string; // ISO date
  algorithmVersion: string; // e.g. 'OVR-v0.3-demo'
  inputs: string[]; // e.g. ['verifiedMatches','evidence','scoutReports']
  confidence: Confidence;
}

export interface AthleteProfile {
  id: string;
  name: string;
  sport: Sport;
  position: string; // localized at render time where possible
  clubId: string | null;
  birthYear: number;
  island: string; // Cape Verdean island, e.g. 'Santiago'
  city: string;
  heightCm?: number;
  ovr: OverallSnapshot;
  pot: number; // potential 0-99
  verification: VerificationStatus;
  statsVerified: boolean;
  boostActive: boolean;
  keyStat: { label: string; value: string }; // e.g. { label: 'PPG', value: '18.4' }
  guardianLinked?: boolean; // minors protection
}

export interface Club {
  id: string;
  name: string;
  sports: Sport[];
  island: string;
  city: string;
  founded: number;
  verified: boolean;
  athleteIds: string[];
}

export interface ScoutProfile {
  id: string;
  name: string;
  organization: string; // fictional
  specialties: Sport[];
  island: string;
  verified: boolean;
  reportsCount: number;
  athletesWatched: number;
}

export interface CompetitionTeam {
  id: string;
  name: string; // school/club name (fictional)
  group: string; // 'A' | 'B' | 'C'
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface Competition {
  id: string;
  name: string;
  sport: Sport;
  season: string;
  island: string;
  organizer: string; // fictional organizer name
  status: 'live' | 'upcoming' | 'finished';
  teamsCount: number;
  groupsCount: number;
  startDate: string;
  endDate: string;
  teams?: CompetitionTeam[];
}

export type MatchStatus = 'live' | 'scheduled' | 'finished';

export interface Match {
  id: string;
  competitionId: string;
  sport: Sport;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  venue: string;
  date: string; // ISO
  quarter?: string; // e.g. 'Q3'
  clock?: string; // e.g. '06:32'
  group?: string;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  clock: string; // '06:32'
  quarter: string;
  playerLabel: string; // '#7 Erick S.'
  type: string; // '3PT' | 'STL' | 'AST' | ...
  descriptionPt: string;
  descriptionEn: string;
  clipMarked?: boolean;
}

export interface StatisticEvidence {
  id: string;
  kind: 'video' | 'document' | 'matchSheet';
  label: string;
  url?: string;
}

export interface AthleteStatistic {
  id: string;
  athleteId: string;
  season: string;
  label: string; // e.g. 'PPG', 'Golos', '100m'
  value: string;
  verification: VerificationStatus;
  evidence: StatisticEvidence[];
}

export interface ScoutReport {
  id: string;
  scoutId: string;
  athleteId: string;
  matchId: string;
  date: string;
  grade: 'A' | 'B' | 'C' | 'D';
  summaryPt: string;
  summaryEn: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'follow' | 'shortlist' | 'sign' | 'monitor';
}

export interface RankingEntry {
  rank: number;
  athleteId: string;
  ovr: number;
  delta: number; // positions up/down vs previous week
}

export interface Ranking {
  id: string;
  sport: Sport;
  category: string; // e.g. 'Sub-18'
  season: string;
  entries: RankingEntry[];
}

export interface Video {
  id: string;
  title: string;
  athleteId?: string;
  competitionId?: string;
  sport: Sport;
  kind: 'highlight' | 'fullGame' | 'scoutClip';
  thumb: string; // /video-thumb-N.jpg
  durationSec: number;
  visibility: 'public' | 'private';
  views: number;
  date: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string; // fictional
  sport: Sport;
  type: 'trial' | 'scholarship' | 'academy' | 'contract';
  location: string;
  deadline: string;
  ageGroup: string;
  descriptionPt: string;
  descriptionEn: string;
}

export interface Sponsor {
  id: string;
  placeholderName: string; // 'Marca Parceira A' — text placeholder only, no logos
  property: string; // 'Talent of the Week', 'Rankings', ...
  reach: number;
  impressions: number;
}

export interface Plan {
  id: string;
  name: string;
  audience: Role;
  priceCveMonthly: number; // 0 = free
  features: string[]; // i18n keys or literal demo strings
  highlighted?: boolean;
}

export interface Verification {
  id: string;
  targetType: 'profile' | 'statistic';
  targetId: string;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

export const OVR_ALGORITHM_VERSION = 'OVR-v0.3-demo';
