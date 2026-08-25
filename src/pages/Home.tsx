/**
 * Home (landing) — `/` (design home.md). Composes the 11 designed sections.
 * GSAP lives only inside HeroSection and JourneySection; the rest uses Framer Motion.
 */
import HeroSection from '@/components/home/HeroSection';
import LivePulseSection from '@/components/home/LivePulseSection';
import JourneySection from '@/components/home/JourneySection';
import {
  FeatureTrio,
  SportsStrip,
  RankingsTeaser,
  CompetitionsTeaser,
  RolesGrid,
  SponsorsSection,
  RoadmapSection,
  FinalCta,
} from '@/components/home/HomeSections';

export default function Home() {
  return (
    <>
      <HeroSection />
      <LivePulseSection />
      <JourneySection />
      <FeatureTrio />
      <SportsStrip />
      <RankingsTeaser />
      <CompetitionsTeaser />
      <RolesGrid />
      <SponsorsSection />
      <RoadmapSection />
      <FinalCta />
    </>
  );
}
