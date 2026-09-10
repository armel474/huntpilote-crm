import type { Metadata } from 'next';
import { TravailView } from '@/app/travail/TravailView';

export const metadata: Metadata = { title: 'Mon plan de travail — HuntPilote' };

export default function TravailPage() {
  return <TravailView />;
}
