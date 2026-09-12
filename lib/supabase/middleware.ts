/**
 * Rafraîchit la session à chaque requête et la réécrit dans les cookies.
 *
 * Sans ce passage, un jeton expiré resterait expiré : les composants serveur
 * ne peuvent pas écrire de cookies, seul le middleware le peut.
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // `getUser()` et non `getSession()` : le premier revalide le jeton auprès
  // du serveur d'authentification, le second se fie au cookie. Pour décider
  // d'un accès, on ne se fie pas au cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
