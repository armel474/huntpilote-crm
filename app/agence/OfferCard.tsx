'use client';

/**
 * La carte d'une offre — un seul rendu, celui de la liste des offres et celui
 * de l'aperçu du constructeur. Elle lit un brouillon (`OfferDraft`) : la liste
 * convertit chaque offre de la base, le constructeur passe ce qu'on édite.
 */
import { Badge } from '@/components/ui/Atoms';
import { IcoCheck } from '@/components/ui/Icons';
import { BILLING_LABEL, money } from '@/lib/format';
import { offerValue, type OfferDraft } from '@/lib/data/offres';
import type { CatalogueItem, Offer } from '@/lib/queries/agence';

export function Switch({
  on,
  onToggle,
  disabled,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`ag-switch${on ? ' on' : ''}`}
      disabled={disabled}
      onClick={onToggle}
    />
  );
}

export type OfferLookups = {
  items: CatalogueItem[];
  offers: Offer[];
};

/** Ce qu'il faut savoir des articles et des autres offres pour rendre une carte. */
export function lookups({ items, offers }: OfferLookups) {
  const itemById = new Map(items.map((i) => [i.id, i]));
  const offerById = new Map(offers.map((o) => [o.id, o]));
  return {
    itemById,
    offerById,
    value: (draft: OfferDraft) =>
      offerValue(draft, {
        priceOf: (id) => itemById.get(id)?.priceCents,
        offerById: (id) => offerById.get(id),
      }),
  };
}

const plural = (n: number, s: string) => `${n} ${s}${n > 1 ? 's' : ''}`;

export function OfferCard({
  draft,
  data,
  activeSubscriptions = 0,
  interactive,
  onToggleActive,
  onEdit,
  onOpenArticle,
}: {
  draft: OfferDraft;
  data: OfferLookups;
  activeSubscriptions?: number;
  /** Dans la liste : l'interrupteur actif et le geste « Modifier ». */
  interactive?: boolean;
  onToggleActive?: () => void;
  onEdit?: () => void;
  /** Depuis « valeur incalculable » : ouvrir l'article sans prix. */
  onOpenArticle?: (id: string) => void;
}) {
  const { itemById, offerById, value } = lookups(data);
  const { totalCents, missing } = value(draft);
  const recurring = draft.billing !== 'ponctuel';
  const discount = draft.priceCents === null ? null : Math.max(totalCents - draft.priceCents, 0);
  const sequel = draft.recommendedOfferId ? offerById.get(draft.recommendedOfferId) : undefined;
  const taskCount = draft.tasks.length;

  return (
    <div className={`off-card${draft.active ? '' : ' inactive'}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <div style={{ fontSize: '1.0625rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {draft.name || 'Offre sans nom'}
            </div>
            {draft.isPopular && <Badge label="Populaire" tone="green" />}
            {!draft.active && <Badge label="Inactive" tone="neutral" />}
          </div>
          {draft.tagline && (
            <div style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginTop: 2, fontStyle: 'italic' }}>{draft.tagline}</div>
          )}
        </div>
        {interactive && onToggleActive && (
          <Switch on={draft.active} onToggle={onToggleActive} label={draft.active ? 'Retirer de la vente' : 'Remettre en vente'} />
        )}
      </div>

      <div>
        <div className="off-price">
          {draft.priceIsFrom && 'À partir de '}
          {money(draft.priceCents)}
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg3)', marginLeft: 4 }}>{BILLING_LABEL[draft.billing]}</span>
        </div>
        {draft.introPriceCents !== null && draft.introPeriods !== null && (
          <div className="off-sub">
            {money(draft.introPriceCents)} {draft.introPeriods > 1 ? `les ${draft.introPeriods} premières périodes` : 'la première période'}, puis{' '}
            {money(draft.priceCents)} {BILLING_LABEL[draft.billing]}
          </div>
        )}
        {recurring && draft.introPriceCents === null && (
          <div className="off-sub" style={{ color: 'var(--yellow-fg)' }}>Tarif d’entrée non renseigné</div>
        )}
        {!recurring && draft.deliveryWeeksMin !== null && (
          <div className="off-sub">
            Livré en{' '}
            {draft.deliveryWeeksMax !== null && draft.deliveryWeeksMax !== draft.deliveryWeeksMin
              ? `${draft.deliveryWeeksMin} à ${draft.deliveryWeeksMax}`
              : draft.deliveryWeeksMin}{' '}
            semaine{(draft.deliveryWeeksMax ?? draft.deliveryWeeksMin) > 1 ? 's' : ''}
          </div>
        )}
        {draft.freeConsultMinutes !== null && draft.freeConsultMinutes > 0 && (
          <div className="off-sub">Consultation gratuite de {draft.freeConsultMinutes} min incluse</div>
        )}
        {recurring && draft.overageHourlyRateCents !== null && (
          <div className="off-sub">Au-delà des heures incluses : {money(draft.overageHourlyRateCents)} / h</div>
        )}
        {recurring && activeSubscriptions > 0 && (
          <div className="off-sub">{plural(activeSubscriptions, 'abonnement')} actif{activeSubscriptions > 1 ? 's' : ''}</div>
        )}
      </div>

      {draft.segments.length > 0 && (
        <div className="ag-chips">
          {draft.segments.map((s) => (
            <span key={s} className="ag-chip">{s}</span>
          ))}
        </div>
      )}

      {draft.lines.length > 0 && (
        <div className="off-lines">
          {draft.lines.map((l) => {
            if (l.kind === 'article') {
              const item = itemById.get(l.catalogItemId);
              return (
                <div key={l.key} className="off-line-item">
                  {l.quantity !== 1 && <span>{l.quantity} ×</span>}
                  <b>{l.label || item?.name || 'Article inconnu'}</b>
                  {item && item.priceCents === null && <Badge label="sans prix" tone="yellow" />}
                </div>
              );
            }
            if (l.kind === 'offre') {
              const included = offerById.get(l.includedOfferId);
              return (
                <div key={l.key} className="off-line-item" style={{ fontStyle: 'italic' }}>
                  Tout ce qui est dans <b>{included?.name ?? '—'}</b>
                </div>
              );
            }
            return (
              <div key={l.key}>
                <div className="off-line-item">
                  {l.group || 'Au choix'} <span style={{ color: 'var(--fg4)', fontWeight: 500 }}>— au choix du client</span>
                </div>
                {l.options.map((o, i) => {
                  const item = itemById.get(o.catalogItemId);
                  return (
                    <div key={o.key} className="off-line-opt">
                      {i === 0 ? '● ' : '○ '}
                      {o.quantity !== 1 && `${o.quantity} × `}
                      {o.label || item?.name || 'Article inconnu'}
                      {i < l.options.length - 1 ? ' — ou —' : ''}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {draft.benefits.length > 0 && (
        <div className="off-benefits">
          {draft.benefits.map((b, i) => (
            <div key={`${i}-${b}`} className="off-benefit">
              <span><IcoCheck size={11} /></span>
              {b}
            </div>
          ))}
        </div>
      )}

      <div className="off-foot">
        <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', lineHeight: 1.6 }}>
          {plural(taskCount, 'tâche')} {recurring ? 'par période' : 'à la vente'} · {plural(draft.deliverables.length, 'livrable')}
          <br />
          {missing.length > 0 ? (
            <span style={{ color: 'var(--yellow-fg)', fontWeight: 600 }}>
              Valeur incalculable : {plural(missing.length, 'article')} sans prix
              {onOpenArticle && (
                <>
                  {' — '}
                  {missing.slice(0, 3).map((id, i) => (
                    <span key={id}>
                      {i > 0 && ', '}
                      <button
                        type="button"
                        onClick={() => onOpenArticle(id)}
                        style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
                      >
                        {itemById.get(id)?.name ?? id}
                      </button>
                    </span>
                  ))}
                  {missing.length > 3 && ` et ${missing.length - 3} autre${missing.length - 3 > 1 ? 's' : ''}`}
                </>
              )}
            </span>
          ) : totalCents > 0 ? (
            <span>
              Valeur catalogue <b style={{ color: 'var(--fg1)' }}>{money(totalCents)}</b>
              {discount !== null && discount > 0 && <> · remise <b style={{ color: 'var(--fg1)' }}>{money(discount)}</b></>}
            </span>
          ) : (
            <span>Valeur catalogue non calculée : aucun article tarifé.</span>
          )}
        </div>
        {interactive && onEdit && (
          <button type="button" className="btn-out" onClick={onEdit}>
            Modifier
          </button>
        )}
      </div>
      {sequel && (
        <div className="off-next">
          Idéal avec : <b>{sequel.name}</b>
        </div>
      )}
    </div>
  );
}
