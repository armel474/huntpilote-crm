import type { Metadata } from 'next';
import { DomainOverviewView } from '@/app/outils/domain-overview/DomainOverviewView';

export const metadata: Metadata = { title: 'Domain Overview — HuntPilote' };

export default function DomainOverviewPage() {
  return <DomainOverviewView />;
}
