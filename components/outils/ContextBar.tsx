'use client';

/**
 * Barre de contexte des outils — session 2.1, le cadre commun.
 *
 * Sélecteur de compte en tête (pré-remplit le domaine, mémorise le dernier
 * compte consulté), filtre clients/prospects, domaine éditable ponctuellement,
 * période, coût de la requête, et l'unique action principale de l'écran :
 * « Enregistrer dans la fiche ». Le geste de ligne — « créer la priorité » —
 * n'est jamais ici, il vit sur chaque résultat.
 */
import Link from 'next/link';
import { Pill } from '@/components/ui/Atoms';
import { IcoCheck, IcoCoin, IcoGlobe, IcoSave, IcoSnap } from '@/components/ui/Icons';
import {
  TOOL_ACCOUNTS,
  type AccountFilter,
  type ToolAccount,
} from '@/lib/data/outils';

export type CostInfo = { credits: number; dollars: string; weight: string };

export function ContextBar({
  acct,
  onAcct,
  filter,
  onFilter,
  domain,
  onDomain,
  period,
  onPeriod,
  periods = ['30 derniers jours', '3 derniers mois', '12 derniers mois'],
  periodLabel = 'Période',
  cost,
  costText,
  costTitle,
  saved,
  onSave,
  canSave,
  saveHint,
  action,
  fichenHref,
  selRef,
}: {
  acct: ToolAccount | null;
  onAcct: (id: string) => void;
  filter: AccountFilter;
  onFilter: (f: AccountFilter) => void;
  domain: string;
  onDomain: (v: string) => void;
  period: string;
  onPeriod: (v: string) => void;
  periods?: readonly string[];
  periodLabel?: string;
  cost: CostInfo;
  /** Remplace le crédit/dollars par un texte libre — ex. un coût au palier plutôt qu'à la requête. */
  costText?: string;
  costTitle?: string;
  saved: boolean;
  onSave: () => void;
  canSave: boolean;
  saveHint?: string;
  /** Remplace entièrement le bouton « Enregistrer dans la fiche » par un geste contextuel. */
  action?: React.ReactNode;
  /** Lien vers la fiche du compte, affiché une fois le résultat enregistré. */
  fichenHref?: string;
  selRef?: React.RefObject<HTMLSelectElement | null>;
}) {
  const list = TOOL_ACCOUNTS.filter(
    (a) => filter === 'tous' || (filter === 'clients' ? a.type === 'client' : a.type === 'prospect'),
  );
  const clients = list.filter((a) => a.type === 'client');
  const prospects = list.filter((a) => a.type === 'prospect');

  return (
    <div className="subbar">
      <div className="ctx-g">
        <span className="lbl" style={{ marginBottom: 0 }}>
          Compte
        </span>
        <select
          ref={selRef}
          className="acct-sel"
          value={acct ? acct.id : ''}
          onChange={(e) => onAcct(e.target.value)}
          aria-label="Compte analysé"
        >
          <option value="">Choisir un compte…</option>
          {clients.length > 0 && (
            <optgroup label="Clients">
              {clients.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </optgroup>
          )}
          {prospects.length > 0 && (
            <optgroup label="Prospects · instantané seulement">
              {prospects.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        {acct && (
          <Pill
            label={acct.type === 'client' ? 'Client' : 'Prospect'}
            tone={acct.type === 'client' ? 'green' : 'yellow'}
            sm
            icon={acct.type === 'client' ? <IcoCheck /> : <IcoSnap />}
          />
        )}
      </div>

      <div className="seg" role="group" aria-label="Filtrer la liste des comptes">
        {(
          [
            ['clients', 'Clients'],
            ['prospects', 'Prospects'],
            ['tous', 'Tous'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            data-on={filter === id}
            aria-pressed={filter === id}
            onClick={() => onFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="ctx-sep" aria-hidden="true" />

      <div className="ctx-g">
        <span className="lbl" style={{ marginBottom: 0 }}>
          Domaine
        </span>
        <div className="dom-field" data-edited={!!acct && domain !== acct.domain}>
          <span style={{ color: 'var(--fg3)', display: 'flex' }}>
            <IcoGlobe />
          </span>
          <input
            value={domain}
            onChange={(e) => onDomain(e.target.value)}
            placeholder="domaine.ca"
            aria-label="Domaine analysé"
            spellCheck={false}
          />
        </div>
        {acct && domain !== acct.domain && <Pill label="Concurrent · hors fiche" tone="blue" sm />}
      </div>

      <select
        className="date-sel"
        value={period}
        onChange={(e) => onPeriod(e.target.value)}
        aria-label={periodLabel}
      >
        {periods.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
        {costText ? (
          <span className="cost-chip" title={costTitle || 'Coût de ce compte pour cet outil'}>
            <IcoCoin />
            {costText}
          </span>
        ) : (
          <span
            className="cost-chip"
            title="Coût facturé par le fournisseur de données pour cette requête"
          >
            <IcoCoin />
            {cost.credits} crédits · {cost.dollars}
          </span>
        )}
        {action ? (
          action
        ) : saved ? (
          <Link href={fichenHref ?? '#'} style={{ textDecoration: 'none' }}>
            <span className="btn-out">
              <IcoCheck />
              Enregistré · voir la fiche
            </span>
          </Link>
        ) : (
          <button
            type="button"
            className="btn-go"
            onClick={onSave}
            disabled={!canSave}
            title={canSave ? 'Verse ce résultat à l’historique du client' : saveHint || 'Un résultat exploitable est requis'}
          >
            <IcoSave />
            Enregistrer dans la fiche
          </button>
        )}
      </div>
    </div>
  );
}
