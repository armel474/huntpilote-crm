import type { Metadata } from 'next';
import { KeywordGapView } from '@/app/outils/keyword-gap/KeywordGapView';

export const metadata: Metadata = { title: 'Keyword Gap — HuntPilote' };

export default function KeywordGapPage() {
  return <KeywordGapView />;
}
