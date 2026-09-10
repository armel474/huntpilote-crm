import type { Metadata } from 'next';
import { ConcurrenceView } from '@/app/local/[etab]/concurrence/ConcurrenceView';
import { ESTABS, findEstab } from '@/lib/data/local';

type Params = Promise<{ etab: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { etab } = await params;
  return { title: `Concurrence locale · ${findEstab(etab).name} — HuntPilote` };
}

export function generateStaticParams() {
  return ESTABS.map((e) => ({ etab: e.id }));
}

export default async function ConcurrencePage({ params }: { params: Params }) {
  const { etab } = await params;
  return <ConcurrenceView etabId={etab} />;
}
