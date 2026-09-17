import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LienView } from '@/app/d/[token]/LienView';
import { supabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import './lien.css';

/**
 * Le lien remis au client — session 9.4 : le document rendu, figé à
 * l'envoi, et le geste d'acceptation (nom tapé, date et adresse IP
 * consignés — une signature simple, pas certifiée). Aucun compte : le
 * jeton opaque suffit, et la base ne rend que ce qui a été envoyé.
 */
export const dynamic = 'force-dynamic';

async function load(token: string) {
  if (!supabaseConfigured() || !/^[0-9a-f]{24,}$/i.test(token)) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc('document_by_token', { p_token: token });
  return data?.[0] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const d = await load(token);
  return {
    title: d ? `${d.ref} — ${d.agency_name}` : 'Document introuvable',
    description: d ? d.subject ?? d.ref : undefined,
    // Un document client n'a rien à faire dans un index de moteur de recherche.
    robots: { index: false, follow: false },
  };
}

export default async function LienPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const d = await load(token);
  if (!d) notFound();
  return (
    <LienView
      token={token}
      doc={{
        kind: d.kind,
        ref: d.ref,
        status: d.status,
        subject: d.subject,
        clientName: d.client_name,
        contactName: d.contact_name,
        agencyName: d.agency_name,
        renderedHtml: d.rendered_html,
        expiresOn: d.expires_on,
        dueOn: d.due_on,
        decidedOn: d.decided_on,
        totalCents: d.total_cents,
        canDecide: d.can_decide,
      }}
    />
  );
}
