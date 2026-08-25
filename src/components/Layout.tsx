/**
 * Layout — public layout: DemoBanner + Navbar + <Outlet/> + Footer + RoleSwitcher.
 * Uses the NESTED-ROUTE pattern: App.tsx must mount pages as child <Route>s
 * under <Route element={<Layout/>}> (react-dev.md "Layout + routing contract").
 * Navbar is sticky top-0 z-50 in normal flow — pages must NOT add nav offsets.
 */
import { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Play, Search, Trophy, User } from 'lucide-react';
import Lenis from 'lenis';
import DemoBanner from './DemoBanner';
import Navbar from './Navbar';
import Footer from './Footer';
import RoleSwitcher from './RoleSwitcher';
import { useT } from '@/i18n';
import { roleDashboardPath, useDemoSession } from '@/data/demoSession';
import { cn } from '@/lib/utils';

/** Mobile bottom nav (design.md 7.6) — app pages only, hidden on desktop. */
function MobileBottomNav() {
  const t = useT();
  const { pathname } = useLocation();
  const { role, isLoggedIn } = useDemoSession();

  const tabs = [
    { to: '/discover', label: t('nav.discover'), icon: Search },
    { to: '/rankings', label: t('nav.rankings'), icon: Trophy },
    { to: '/', label: 'Home', icon: Home },
    { to: '/videos', label: t('nav.videos'), icon: Play },
    {
      to: isLoggedIn && role ? roleDashboardPath(role) : '/auth',
      label: isLoggedIn ? t('nav.dashboard') : t('nav.signIn'),
      icon: User,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-white md:hidden"
      aria-label="bottom"
    >
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const active = tab.to === '/' ? pathname === '/' : pathname.startsWith(tab.to);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center gap-0.5 py-2"
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={20} className={active ? 'text-brand-500' : 'text-ink-600'} aria-hidden />
              <span className={cn('text-[10px] font-semibold', active ? 'text-ink-950' : 'text-ink-600')}>
                {tab.label}
              </span>
              <span className={cn('h-1 w-1 rounded-full', active ? 'bg-brand-500' : 'bg-transparent')} aria-hidden />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function Layout() {
  // Lenis smooth scroll on public pages only (design.md sec. 5). Disabled for reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper">
      <DemoBanner />
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <RoleSwitcher />
    </div>
  );
}
