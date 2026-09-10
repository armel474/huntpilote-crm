import type { Metadata } from 'next';
import { LocalOverviewView } from '@/app/local/LocalOverviewView';

export const metadata: Metadata = { title: 'SEO local — HuntPilote' };

export default function LocalPage() {
  return <LocalOverviewView />;
}
