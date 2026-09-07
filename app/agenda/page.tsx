import type { Metadata } from 'next';
import { ComingSoon } from '@/components/shell/ComingSoon';

export const metadata: Metadata = { title: 'Agenda — HuntPilote' };

export default function AgendaPage() {
  return (
    <ComingSoon
      title="Agenda"
      subtitle="Planification de l'équipe"
      description="L'agenda figure dans la navigation depuis la revue du Dashboard, mais aucun écran n'a encore été maquetté. À cadrer lors de la prochaine session de design : vue calendrier des échéances de tâches, envois de rapports programmés et rendez-vous clients."
    />
  );
}
