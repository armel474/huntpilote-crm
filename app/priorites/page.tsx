import type { Metadata } from 'next';
import { PrioritesView } from '@/app/priorites/PrioritesView';

export const metadata: Metadata = { title: 'Priorités transversales — HuntPilote' };

export default function PrioritesPage() {
  return <PrioritesView />;
}
