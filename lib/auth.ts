/**
 * Ce que l'application sait de la personne connectée.
 *
 * Un seul aller-retour (`whoami`), depuis un composant serveur. `null` quand
 * personne n'est connecté, ou quand le compte n'est rattaché à rien — une
 * personne qui s'est connectée sans invitation ne voit aucune agence.
 */
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export type Session = {
  kind: 'membre' | 'contact';
  memberId: string | null;
  agencyId: string;
  agencyName: string;
  role: 'admin' | 'chef_projet' | 'specialiste_seo' | 'redacteur' | null;
  fullName: string;
  initials: string;
  contactId: string | null;
  clientId: string | null;
  email: string | null;
};

export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.rpc('whoami').maybeSingle();
  if (!data || !data.agency_id) return null;

  return {
    kind: data.kind === 'contact' ? 'contact' : 'membre',
    memberId: data.member_id,
    agencyId: data.agency_id,
    agencyName: data.agency_name ?? '',
    role: data.role,
    fullName: data.full_name ?? '',
    initials: data.initials ?? '',
    contactId: data.contact_id,
    clientId: data.client_id,
    email: user.email ?? null,
  };
});
