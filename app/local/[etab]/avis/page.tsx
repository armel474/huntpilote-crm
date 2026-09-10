import type { Metadata } from 'next';
import { AvisView } from '@/app/local/[etab]/avis/AvisView';
import { ESTABS, findEstab } from '@/lib/data/local';

type Params = Promise<{ etab: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { etab } = await params;
  return { title: `Avis · ${findEstab(etab).name} — HuntPilote` };
}

export function generateStaticParams() {
  return ESTABS.map((e) => ({ etab: e.id }));
}

export default async function AvisPage({ params }: { params: Params }) {
  const { etab } = await params;
  return <AvisView etabId={etab} />;
}
