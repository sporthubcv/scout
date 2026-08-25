/**
 * Sponsor placeholders + pricing plans (CVE). No real brands (design.md 7.16).
 * Helper converts CVE to a € hint (1€ ≈ 110 CVE).
 */
import type { Plan, Sponsor } from './types';

export const sponsors: Sponsor[] = [
  { id: 'sp1', placeholderName: 'Marca Parceira A', property: 'Talento da Semana', reach: 48200, impressions: 214000 },
  { id: 'sp2', placeholderName: 'Marca Parceira B', property: 'Rankings', reach: 31500, impressions: 141000 },
  { id: 'sp3', placeholderName: 'Parceiro Oficial — espaço demo', property: 'MVP Inter Liceu', reach: 18900, impressions: 88000 },
];

export const cveToEur = (cve: number) => Math.round(cve / 110);

export const plans: Plan[] = [
  {
    id: 'athlete-free',
    name: 'Atleta Free',
    audience: 'athlete',
    priceCveMonthly: 0,
    features: ['Perfil público', 'Estatísticas autodeclaradas com evidências', '1 vídeo de destaque'],
  },
  {
    id: 'athlete-premium',
    name: 'Atleta Premium',
    audience: 'athlete',
    priceCveMonthly: 990,
    features: ['Tudo do Free', 'Vídeos ilimitados', 'Evolução e comparadores', 'Prioridade em oportunidades'],
    highlighted: true,
  },
  {
    id: 'boost',
    name: 'Boost de Visibilidade',
    audience: 'athlete',
    priceCveMonthly: 1500,
    features: ['Mais visibilidade em pesquisas e rankings (nunca altera OVR/Ranking/stats)'],
  },
  {
    id: 'club-pro',
    name: 'Clube Pro',
    audience: 'club',
    priceCveMonthly: 4900,
    features: ['Gestão de plantel', 'Match Scouting (20 jogos/mês)', 'Relatórios ilimitados'],
  },
  {
    id: 'organizer',
    name: 'Organizador',
    audience: 'organizer',
    priceCveMonthly: 7900,
    features: ['Gestão de competição completa', 'Calculadora de preço por equipa/jogo', 'Página pública da prova'],
  },
];
