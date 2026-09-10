import type { Metadata } from 'next';
import { RapportsAProduireView } from '@/app/rapports/RapportsAProduireView';

export const metadata: Metadata = { title: 'Rapports à produire — HuntPilote' };

export default function RapportsAProduirePage() {
  return <RapportsAProduireView />;
}
