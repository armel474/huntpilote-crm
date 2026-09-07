import type { Metadata } from 'next';
import { ParametresView } from '@/app/parametres/ParametresView';

export const metadata: Metadata = { title: 'Paramètres — HuntPilote' };

export default function ParametresPage() {
  return <ParametresView />;
}
