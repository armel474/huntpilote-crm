import type { Metadata } from 'next';
import { KeywordHunterView } from '@/app/outils/keyword-hunter/KeywordHunterView';

export const metadata: Metadata = { title: 'Keyword Hunter — HuntPilote' };

export default function KeywordHunterPage() {
  return <KeywordHunterView />;
}
