'use client';

/**
 * Bandeaux d'état des outils — un seul à la fois, le plus bloquant d'abord.
 */
import Link from 'next/link';
import {
  IcoArrowR,
  IcoCoin,
  IcoInfo,
  IcoPlug,
  IcoSnap,
  IcoSpin,
  IcoWarn,
} from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import type { Quota } from '@/lib/data/outils';

export type BannerKind = 'nonconnecte' | 'erreur' | 'quota' | 'prospect' | 'nosel';

export function Banner({
  kind,
  quota,
  onRetry,
  onFocusAcct,
}: {
  kind: BannerKind;
  quota?: Quota;
  onRetry?: () => void;
  onFocusAcct?: () => void;
}) {
  const q = quota ?? { used: 0, max: 1 };
  const pct = Math.round((q.used / q.max) * 100);

  switch (kind) {
    case 'nonconnecte':
      return (
        <div className="banner" data-tone="yellow">
          <span className="banner-ico">
            <IcoPlug />
          </span>
          <div style={{ flex: 1, minWidth: '14rem' }}>
            <b>Intégration au fournisseur de données non connectée.</b> Cet outil ne peut rien
            interroger avant que la clé d’API soit ajoutée aux paramètres de l’agence.
          </div>
          <div className="banner-act">
            <Link href={routes.parametres()} className="btn-out" style={{ textDecoration: 'none' }}>
              <IcoPlug />
              Connecter l’intégration
            </Link>
          </div>
        </div>
      );
    case 'erreur':
      return (
        <div className="banner" data-tone="red">
          <span className="banner-ico">
            <IcoWarn size={12} />
          </span>
          <div style={{ flex: 1, minWidth: '14rem' }}>
            <b>Le fournisseur n’a pas répondu (502).</b> Aucun crédit n’a été facturé pour cette
            requête.
          </div>
          <div className="banner-act">
            <button type="button" className="btn-out" onClick={onRetry}>
              <IcoSpin />
              Réessayer
            </button>
          </div>
        </div>
      );
    case 'quota':
      return (
        <div className="banner" data-tone="yellow">
          <span className="banner-ico">
            <IcoCoin />
          </span>
          <div style={{ flex: 1, minWidth: '14rem' }}>
            <b>
              Quota mensuel bientôt atteint — {q.used.toLocaleString('fr-CA')} /{' '}
              {q.max.toLocaleString('fr-CA')} crédits ({pct} %).
            </b>{' '}
            Les requêtes lourdes seront refusées à partir de la limite.
          </div>
          <div className="banner-act">
            <Link href={routes.parametres()} className="btn-out" style={{ textDecoration: 'none' }}>
              Voir la consommation
            </Link>
          </div>
        </div>
      );
    case 'prospect':
      return (
        <div className="banner" data-tone="yellow">
          <span className="banner-ico">
            <IcoSnap />
          </span>
          <div style={{ flex: 1, minWidth: '14rem' }}>
            <b>Instantané — non historisé.</b> Un prospect n’a pas d’historique : ce résultat sert
            au démarchage et n’est pas conservé après 30 jours.
          </div>
          <div className="banner-act">
            <Link href={routes.pipeline()} className="btn-out" style={{ textDecoration: 'none' }}>
              Convertir en client
              <IcoArrowR />
            </Link>
          </div>
        </div>
      );
    case 'nosel':
      return (
        <div className="banner" data-tone="blue">
          <span className="banner-ico">
            <IcoInfo />
          </span>
          <div style={{ flex: 1, minWidth: '14rem' }}>
            <b>Aucun compte sélectionné.</b> Les outils s’exécutent toujours pour un compte :
            c’est lui qui pré-remplit le domaine et reçoit les résultats enregistrés.
          </div>
          <div className="banner-act">
            <button type="button" className="btn-out" onClick={onFocusAcct}>
              Choisir un compte
            </button>
          </div>
        </div>
      );
    default:
      return null;
  }
}
