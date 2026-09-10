import type { Metadata } from 'next';
import { PositionsView } from '@/app/local/[etab]/positions/PositionsView';
import { ESTABS, findEstab } from '@/lib/data/local';

type Params = Promise<{ etab: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { etab } = await params;
  return { title: `Positions locales · ${findEstab(etab).name} — HuntPilote` };
}

export function generateStaticParams() {
  return ESTABS.map((e) => ({ etab: e.id }));
}

export default async function PositionsPage({ params }: { params: Params }) {
  const { etab } = await params;
  return <PositionsView etabId={etab} />;
}
