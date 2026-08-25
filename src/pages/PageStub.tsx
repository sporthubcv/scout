/**
 * PageStub — placeholder for pages owned by page agents.
 * Replace the whole file for your page; keep the route path stable.
 */
import { useT } from '@/i18n';
import EmptyState from '@/components/shared/EmptyState';

export default function PageStub({ title }: { title: string }) {
  const t = useT();
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-[32px] font-extrabold tracking-[-0.015em] text-ink-950">{title}</h1>
      <EmptyState
        className="mt-8"
        useIllustration
        title={t('stub.title')}
        body={t('stub.body')}
      />
    </div>
  );
}
