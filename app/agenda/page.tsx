import type { Metadata } from 'next';
import { AgendaView } from '@/app/agenda/AgendaView';

export const metadata: Metadata = { title: 'Agenda — HuntPilote' };

export default function AgendaPage() {
  return <AgendaView />;
}
