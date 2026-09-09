import type { Metadata } from 'next';
import { OrganicResearchView } from '@/app/outils/organic-research/OrganicResearchView';

export const metadata: Metadata = { title: 'Organic Research — HuntPilote' };

export default function OrganicResearchPage() {
  return <OrganicResearchView />;
}
