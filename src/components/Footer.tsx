/**
 * Footer (design.md 7.3) — black, 4 columns, orange 2px top hairline.
 */
import { Link } from 'react-router-dom';
import { useT } from '@/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Footer() {
  const t = useT();

  const platform = [
    { to: '/discover', label: t('nav.discover') },
    { to: '/rankings', label: t('nav.rankings') },
    { to: '/competitions', label: t('nav.competitions') },
    { to: '/opportunities', label: t('nav.opportunities') },
    { to: '/videos', label: t('nav.videos') },
  ];
  const forYou = [
    { to: '/auth?role=athlete', label: t('footer.athletesFor') },
    { to: '/auth?role=club', label: t('footer.clubsFor') },
    { to: '/auth?role=scout', label: t('footer.scoutsFor') },
    { to: '/auth?role=organizer', label: t('footer.organizersFor') },
    { to: '/auth?role=sponsor', label: t('footer.sponsorsFor') },
  ];
  const company = [
    { to: '/#about', label: t('footer.about') },
    { to: '/pricing', label: t('footer.plans') },
    { to: '/#contact', label: t('footer.contact') },
    { to: '/#privacy', label: t('footer.privacy') },
  ];

  const colTitle = 'text-[11px] font-bold uppercase tracking-[0.14em] text-white/40';
  const colLink = 'text-[14px] text-white/60 transition-colors hover:text-white';

  return (
    <footer className="border-t-2 border-brand-500 bg-ink-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="SportHub Scout" className="h-9 w-9 rounded-full" />
              <span className="font-display text-[15px] font-extrabold tracking-tight">
                {t('brand.wordmarkA')} <span className="text-brand-500">{t('brand.wordmarkB')}</span>
              </span>
            </div>
            <p className="mt-4 text-[13px] font-semibold text-white/70">{t('brand.tagline')}</p>
            <p className="mt-1 text-[12px] text-white/40">{t('brand.location')}</p>
            <div className="mt-5">
              <LanguageSwitcher dark />
            </div>
          </div>
          <nav aria-label={t('footer.platform')}>
            <p className={colTitle}>{t('footer.platform')}</p>
            <ul className="mt-4 space-y-2.5">
              {platform.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={colLink}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t('footer.forYou')}>
            <p className={colTitle}>{t('footer.forYou')}</p>
            <ul className="mt-4 space-y-2.5">
              {forYou.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className={colLink}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t('footer.company')}>
            <p className={colTitle}>{t('footer.company')}</p>
            <ul className="mt-4 space-y-2.5">
              {company.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className={colLink}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink-700 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-[12px] text-white/40">{t('footer.copyright')}</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
            {t('brand.tagline')} · {t('brand.subline')}
          </p>
        </div>
      </div>
    </footer>
  );
}
