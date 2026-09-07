import type { Metadata } from 'next';
import { ComingSoon } from '@/components/shell/ComingSoon';

export const metadata: Metadata = { title: 'Outils SEO — HuntPilote' };

export default function OutilsPage() {
  return (
    <ComingSoon
      title="Outils SEO"
      subtitle="Keyword Hunter, Domain Overview, Site Audit…"
      description="Les sept outils listés dans la barre latérale (Keyword Hunter, Domain Overview, Organic Research, Keyword Gap, Position Tracking, Site Audit, Backlink Analyse) n'ont pas encore d'écran. Ce sont eux qui consommeront l'API DataForSEO — à cadrer lors de la prochaine session de design."
    />
  );
}
