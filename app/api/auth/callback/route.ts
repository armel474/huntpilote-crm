/**
 * Retour d'authentification — lien magique, Google, lien de réinitialisation.
 *
 * Supabase renvoie ici avec un `code` ; on l'échange contre une session, on
 * rattache la personne à son invitation si une invitation porte son courriel,
 * puis on la renvoie là où elle voulait aller.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // `suite` : le chemin demandé avant la redirection vers /connexion. Jamais
  // une URL absolue — on ne renvoie pas vers un autre domaine.
  const suite = searchParams.get('suite');
  const destination = suite && suite.startsWith('/') && !suite.startsWith('//') ? suite : '/dashboard';

  if (!code) {
    return NextResponse.redirect(`${origin}/connexion?erreur=lien`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/connexion?erreur=lien`);
  }

  // Idempotent : ne fait rien si la personne est déjà rattachée.
  await supabase.rpc('accept_my_invitation');

  return NextResponse.redirect(`${origin}${destination}`);
}
