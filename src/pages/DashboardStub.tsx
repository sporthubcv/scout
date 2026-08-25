/**
 * DashboardStub — placeholder for role dashboards owned by page agents.
 * Demonstrates the DashboardShell contract (sections via props).
 * Replace the owning page file entirely; keep the route path stable.
 */
import { LayoutDashboard } from 'lucide-react';
import DashboardShell, { type ShellMenuSection } from '@/components/DashboardShell';
import { useT } from '@/i18n';
import EmptyState from '@/components/shared/EmptyState';
import StatTile from '@/components/shared/StatTile';

export default function DashboardStub({ title }: { title: string }) {
  const t = useT();
  const sections: ShellMenuSection[] = [
    { items: [{ to: '#', label: title, icon: LayoutDashboard, end: true }] },
  ];
  return (
    <DashboardShell
      title={title}
      sections={sections}
      plan={{ name: 'Demo', usageLabel: '18/20', usagePct: 90 }}
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="OVR" value={78} delta={2} />
        <StatTile label="Ranking" value="#1" delta={0} />
        <StatTile label="PTS" value="18.4" spark={[10, 14, 12, 16, 18]} />
        <StatTile label="Clips" value={12} />
      </div>
      <EmptyState className="mt-6" useIllustration title={t('stub.title')} body={t('stub.body')} />
    </DashboardShell>
  );
}
