import { type NextRequest, NextResponse } from 'next/server';
import { supabaseConfigured } from '@/lib/supabase/config';
import { updateSession } from '@/lib/supabase/middleware';

/** Les chemins accessibles sans session : la connexion et ce qu'un client reçoit par lien. */
const PUBLIC_PREFIXES = ['/connexion', '/r/', '/audit-prospect/', '/portail', '/api/auth'];

export async function middleware(request: NextRequest) {
  // Sans variables d'environnement, il n'y a ni session à rafraîchir ni
  // accès à garder : l'application se comporte comme avant la base.
  if (!supabaseConfigured()) return NextResponse.next({ request });

  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Tant que l'authentification n'est pas configurée sur la plateforme
  // (fournisseurs, URL de redirection), rediriger vers /connexion enfermerait
  // tout le monde dehors — personne ne pourrait encore se connecter. La
  // garde s'active par `AUTH_REQUIRED=on` côté Vercel, une fois prête.
  const authRequired = process.env.AUTH_REQUIRED === 'on';
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
  if (authRequired && !user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    url.searchParams.set('suite', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Tout sauf les fichiers statiques et les images optimisées.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
