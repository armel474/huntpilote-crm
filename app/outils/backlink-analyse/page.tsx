import type { Metadata } from 'next';
import { BacklinkAnalyseView } from '@/app/outils/backlink-analyse/BacklinkAnalyseView';

export const metadata: Metadata = { title: 'Backlink Analyse — HuntPilote' };

export default function BacklinkAnalysePage() {
  return <BacklinkAnalyseView />;
}
