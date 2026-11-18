import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocumentView } from '@/app/documents/[id]/DocumentView';
import { getSession } from '@/lib/auth';
import { loadDocumentDetail, loadMyPermissions, renderDocument } from '@/lib/queries/documents';
import { supabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

// Un document se lit à chaque requête, avec les droits de la personne connectée.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!supabaseConfigured()) return { title: 'Document — HuntPilote' };
  const supabase = await createClient();
  const d = await loadDocumentDetail(supabase, id);
  return { title: `${d ? `${d.ref} · ${d.client.name}` : 'Document'} — HuntPilote` };
}

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!supabaseConfigured()) notFound();
  const [session, supabase] = await Promise.all([getSession(), createClient()]);
  const doc = await loadDocumentDetail(supabase, id);
  if (!doc) notFound();
  const [rendered, permissions] = await Promise.all([
    doc.status === 'brouillon' || !doc.renderedHtml ? renderDocument(supabase, doc, { highlightUnfilled: true }) : Promise.resolve(null),
    loadMyPermissions(supabase, session?.memberId ?? null),
  ]);
  return <DocumentView doc={doc} rendered={rendered} permissions={permissions} signedIn={session?.kind === 'membre'} />;
}
