import type { Metadata } from 'next';
import { DashboardView } from '@/app/dashboard/DashboardView';

export const metadata: Metadata = { title: 'Dashboard — HuntPilote' };

export default function DashboardPage() {
  return <DashboardView />;
}
