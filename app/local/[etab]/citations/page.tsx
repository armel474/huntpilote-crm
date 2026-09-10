import type { Metadata } from 'next';
import { CitationsView } from '@/app/local/[etab]/citations/CitationsView';
import { ESTABS, findEstab } from '@/lib/data/local';

type Params = Promise<{ etab: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { etab } = await params;
  return { title: `Citations · ${findEstab(etab).name} — HuntPilote` };
}

export function generateStaticParams() {
  return ESTABS.map((e) => ({ etab: e.id }));
}

export default async function CitationsPage({ params }: { params: Params }) {
  const { etab } = await params;
  return <CitationsView etabId={etab} />;
}
