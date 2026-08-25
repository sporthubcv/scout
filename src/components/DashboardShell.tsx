/**
 * DashboardShell (design.md sec. 8) — shell for all role dashboards + admin.
 * Fixed left sidebar (264px, ink-950, collapsible to 72px) + white top bar (h-16)
 * + content area (bg-paper-50). Menu items passed via props (per-role config).
 * Mobile: sidebar becomes an overlay drawer.
 * This layout replaces the public chrome — no public Navbar/Footer inside.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, Search, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useT } from '@/i18n';
import { useDemoSession } from '@/data/demoSession';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';
import MonogramAvatar from './shared/MonogramAvatar';
import StatusBadge from './shared/StatusBadge';

export interface ShellMenuSection {
  /** micro caps group label (i18n'd by caller) */
  label?: string;
  items: ShellMenuItem[];
}

export interface ShellMenuItem {
  /** route path, or '#section-id' for in-page section navigation within one dashboard route */
  to: string;
  label: string;
  icon: LucideIcon;
  /** match exactly instead of prefix (for index items); for hash items: active when no hash set */
  end?: boolean;
  /** optional count badge rendered right-aligned (e.g. queue size) */
  badge?: number;
}

export default function DashboardShell({
  title,
  sections,
  plan,
  actions,
  children,
}: {
  /** Page title shown in the top bar (i18n'd by caller) */
  title: string;
  sections: ShellMenuSection[];
  /** Sidebar footer plan/usage card */
  plan?: { name: string; usageLabel: string; usagePct: number };
  actions?: ReactNode;
  children: ReactNode;
}) {
  const t = useT();
  const { persona } = useDemoSession();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // In-page hash sections: when the hash changes, return to the top of the content.
  useEffect(() => {
    if (location.hash) window.scrollTo({ top: 0 });
  }, [location.hash]);

  const sidebar = (
    <div className="flex h-full flex-col bg-ink-950 text-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-ink-700 px-4">
        <img src="/logo.png" alt="" className="h-8 w-8 shrink-0 rounded-full" />
        {!collapsed && (
          <span className="font-display text-[14px] font-extrabold tracking-tight">
            {t('brand.wordmarkA')} <span className="text-brand-500">{t('brand.wordmarkB')}</span>
          </span>
        )}
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="dashboard">
        {sections.map((section, si) => (
          <div key={si}>
            {section.label && !collapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isHashItem = item.to.startsWith('#');
                // Hash items share the dashboard pathname, so NavLink's isActive
                // (pathname-based) cannot distinguish them — compare the hash.
                const hashActive =
                  isHashItem && (location.hash ? location.hash === item.to : !!item.end);
                return (
                  <li key={item.to + item.label}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors',
                          (isHashItem ? hashActive : isActive)
                            ? 'bg-ink-800 text-white before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-full before:bg-brand-500'
                            : 'text-white/70 hover:bg-ink-800 hover:text-white',
                          collapsed && 'justify-center px-0',
                        )
                      }
                    >
                      <Icon size={18} strokeWidth={1.75} aria-hidden />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white tnum">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-ink-700 p-3">
        {plan && !collapsed && (
          <div className="rounded-lg bg-ink-900 p-3">
            <p className="text-[12px] font-semibold">
              {t('dashboard.plan')} {plan.name}
            </p>
            <p className="mt-0.5 text-[11px] text-white/50 tnum">{plan.usageLabel}</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-700">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, plan.usagePct)}%` }} />
            </div>
            <div className="mt-2.5">
              <StatusBadge variant="demo" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-paper-50">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 md:block',
          collapsed ? 'w-[72px]' : 'w-[264px]',
        )}
      >
        {sidebar}
      </aside>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-[264px]">{sidebar}</aside>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label={t('nav.closeMenu')}
            className="absolute right-4 top-4 rounded-lg bg-ink-950 p-2 text-white cursor-pointer"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
      )}

      <div className={cn('transition-[margin] duration-200', collapsed ? 'md:ml-[72px]' : 'md:ml-[264px]')}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t('nav.openMenu')}
              className="rounded-lg p-2 text-ink-950 hover:bg-paper-100 md:hidden cursor-pointer"
            >
              <Menu size={20} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label="toggle sidebar"
              className="hidden rounded-lg p-2 text-ink-600 hover:bg-paper-100 md:block cursor-pointer"
            >
              <Menu size={18} aria-hidden />
            </button>
            <h1 className="truncate font-display text-[18px] font-extrabold text-ink-950">{title}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {actions}
            <span className="hidden items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-[12px] text-ink-600 lg:flex">
              <Search size={14} aria-hidden />
              {t('dashboard.search')}
              <kbd className="rounded bg-paper-100 px-1 text-[10px] font-bold">⌘K</kbd>
            </span>
            <LanguageSwitcher />
            <Link to="/" className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-ink-600 hover:bg-paper-100 sm:flex">
              <ArrowLeft size={14} aria-hidden />
              {t('common.back')}
            </Link>
            {persona && <MonogramAvatar name={persona.name} size={32} />}
          </div>
        </header>
        {/* Content */}
        <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-600/60">
            {t('dashboard.demoBadge')}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
