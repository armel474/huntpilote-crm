import Link from 'next/link';
import { Notice } from '@/app/parametres/bits';
import type { Session } from '@/lib/auth';

export function AgencyAccess({ configured, session }: { configured: boolean; session: Session | null }) {
  if (!configured) return <Notice tone="warn">La connexion aux données n’est pas configurée. Le profil, l’équipe et le catalogue sont indisponibles.</Notice>;
  if (session?.kind !== 'membre') return <Notice tone="warn">Un compte membre de l’agence est nécessaire. <Link href="/connexion?suite=/agence">Se connecter</Link></Notice>;
  return null;
}
