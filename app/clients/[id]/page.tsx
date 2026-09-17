import type { Metadata } from 'next';
import { FicheClientView, type FicheGenerator } from '@/app/clients/[id]/FicheClientView';
import { CLIENTS } from '@/lib/data/clients';
import { loadDocumentsList } from '@/lib/queries/documents';
import { supabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

// La fiche lit le compte réel quand la base est branchée : elle ne peut pas être prérendue.
export const dynamic = 'force-dynamic';

/** Le compte réel derrière un slug, et ses documents — null hors ligne ou si le slug est celui d'une fiche de démonstration. */
async function loadGenerator(slug: string): Promise<{ name: string; generator: FicheGenerator } | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const client = await supabase.from('client').select('id, name').eq('slug', slug).maybeSingle();
  if (!client.data) return null;
  const docs = await loadDocumentsList(supabase);
  return { name: client.data.name, generator: { clientId: client.data.id, clientName: client.data.name, documents: docs.rows.filter((r) => r.clientId === client.data!.id) } };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const real = await loadGenerator(id);
  const client = CLIENTS.find((c) => c.id === id);
  return { title: `${real?.name ?? client?.name ?? 'Fiche client'} — HuntPilote` };
}

export default async function FicheClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const real = await loadGenerator(id);
  return <FicheClientView clientId={id} generator={real?.generator} />;
}
