/**
 * App routes (design.md sec. 13).
 * CONTRACT: Layout renders <Outlet/>, so all public pages are NESTED routes
 * under <Route element={<Layout/>}> (react-dev.md "Layout + routing contract").
 * Match Scouting (field mode) and dashboards/admin use their own layouts and
 * live OUTSIDE the public Layout.
 */
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Discover from '@/pages/Discover';
import AthleteProfile from '@/pages/AthleteProfile';
import ClubProfile from '@/pages/ClubProfile';
import ScoutProfile from '@/pages/ScoutProfile';
import Rankings from '@/pages/Rankings';
import Competitions from '@/pages/Competitions';
import CompetitionDetail from '@/pages/CompetitionDetail';
import Opportunities from '@/pages/Opportunities';
import Videos from '@/pages/Videos';
import Pricing from '@/pages/Pricing';
import Auth from '@/pages/Auth';
import MatchScouting from '@/pages/MatchScouting';
import AthleteDashboard from '@/pages/AthleteDashboard';
import ScoutDashboard from '@/pages/ScoutDashboard';
import ClubDashboard from '@/pages/ClubDashboard';
import OrganizerDashboard from '@/pages/OrganizerDashboard';
import SponsorDashboard from '@/pages/SponsorDashboard';
import Admin from '@/pages/Admin';

export default function App() {
  return (
    <Routes>
      {/* Public chrome: DemoBanner + Navbar + Footer (nested-route pattern) */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="discover" element={<Discover />} />
        <Route path="athletes/:id" element={<AthleteProfile />} />
        <Route path="clubs/:id" element={<ClubProfile />} />
        <Route path="scouts/:id" element={<ScoutProfile />} />
        <Route path="rankings" element={<Rankings />} />
        <Route path="competitions" element={<Competitions />} />
        <Route path="competitions/:id" element={<CompetitionDetail />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="videos" element={<Videos />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="auth" element={<Auth />} />
        <Route path="*" element={<Home />} />
      </Route>

      {/* Field mode — own dark layout, no public chrome, no Lenis */}
      <Route path="match-scouting/:matchId" element={<MatchScouting />} />

      {/* Role dashboards + admin — DashboardShell layout */}
      <Route path="dashboard/athlete" element={<AthleteDashboard />} />
      <Route path="dashboard/scout" element={<ScoutDashboard />} />
      <Route path="dashboard/club" element={<ClubDashboard />} />
      <Route path="dashboard/organizer" element={<OrganizerDashboard />} />
      <Route path="dashboard/sponsor" element={<SponsorDashboard />} />
      <Route path="admin" element={<Admin />} />
    </Routes>
  );
}
