'use client';

/**
 * Le catalogue de l'agence : ce qu'elle vend, tel que la base le décrit.
 *
 * Lecture seule pour l'instant — les données viennent du serveur en props.
 * L'édition arrivera avec les actions serveur ; d'ici là, l'écran montre
 * déjà ce que le moteur sait faire : la valeur catalogue d'une offre en
 * cascade, le chemin site → accompagnement, le travail que chaque offre
 * engage.
 */
import { Badge } from '@/components/ui/Atoms';
import { IcoCheck, IcoWarn } from '@/components/ui/Icons';
import { BILLING_LABEL, money } from '@/lib/format';
import type { CatalogueItem, Offer } from '@/lib/queries/agence';

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>{title}</h2>
      <p style={{ fontSize: '0.8125rem', color: 'var(--fg3)', marginTop: 3 }}>{sub}</p>
    </div>
  );
}

function OfferCard({ offer, all }: { offer: Offer; all: Offer[] }) {
  const sequel = all.find((o) => o.id === offer.recommendedOfferId);
  const optionGroups = new Map<string, OfferLineGroup>();
  const plainLines: Offer['lines'] = [];
  for (const l of offer.lines) {
    if (l.optionGroup) {
      const g = optionGroups.get(l.optionGroup) ?? { group: l.optionGroup, lines: [] };
      g.lines.push(l);
      optionGroups.set(l.optionGroup, g);
    } else plainLines.push(l);
  }
  const missingIntro = offer.billing !== 'ponctuel' && offer.introPriceCents === null;

  return (
    <div className="card" style={{ padding: '1.125rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{offer.name}</div>
            {offer.isPopular && <Badge tone="violet" label="Le plus populaire" />}
            {!offer.active && <Badge tone="neutral" label="Inactive" />}
          </div>
          {offer.tagline && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--fg3)', marginTop: 4 }}>{offer.tagline}</p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {offer.priceIsFrom ? 'À partir de' : 'Prix'}
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            {money(offer.priceCents)}
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--fg3)', marginLeft: 4 }}>
              {BILLING_LABEL[offer.billing]}
            </span>
          </div>
          {offer.introPriceCents !== null && (
            <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>
              {money(offer.introPriceCents)} les {offer.introPeriods} premiers mois
            </div>
          )}
          {offer.deliveryWeeksMin !== null && (
            <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>
              Livraison en{' '}
              {offer.deliveryWeeksMax && offer.deliveryWeeksMax !== offer.deliveryWeeksMin
                ? `${offer.deliveryWeeksMin}–${offer.deliveryWeeksMax}`
                : offer.deliveryWeeksMin}{' '}
              semaines
            </div>
          )}
        </div>
      </div>

      {missingIntro && (
        <div className="cn-err" style={{ margin: 0 }}>
          <span style={{ display: 'flex', flexShrink: 0, marginTop: 2 }}>
            <IcoWarn size={14} />
          </span>
          <span>Le tarif préférentiel des premiers mois n&apos;est pas encore saisi.</span>
        </div>
      )}

      <div>
        <div className="lbl" style={{ marginBottom: 6 }}>Services inclus</div>
        <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
          {plainLines.map((l) => (
            <li key={l.id} style={{ display: 'flex', gap: 8, fontSize: '0.8125rem', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--green)', display: 'flex', marginTop: 3, flexShrink: 0 }}>
                <IcoCheck size={12} />
              </span>
              <span style={l.includedOffer ? { fontWeight: 600 } : undefined}>
                {l.label}
                {l.quantity !== 1 && <span style={{ color: 'var(--fg4)' }}> × {l.quantity}</span>}
              </span>
            </li>
          ))}
          {[...optionGroups.values()].map((g) => (
            <li key={g.group} style={{ display: 'flex', gap: 8, fontSize: '0.8125rem', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--green)', display: 'flex', marginTop: 3, flexShrink: 0 }}>
                <IcoCheck size={12} />
              </span>
              <span>
                {g.lines.map((l, i) => (
                  <span key={l.id}>
                    {i > 0 && <em style={{ color: 'var(--fg3)' }}> ou </em>}
                    {l.label}
                  </span>
                ))}
                <span style={{ color: 'var(--fg4)' }}> — au choix du client</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {offer.benefits.length > 0 && (
        <div>
          <div className="lbl" style={{ marginBottom: 6 }}>Ce que le client y gagne</div>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 3 }}>
            {offer.benefits.map((b) => (
              <li key={b} style={{ fontSize: '0.8125rem', color: 'var(--fg2)' }}>→ {b}</li>
            ))}
          </ul>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          paddingTop: 10,
          borderTop: '1px solid var(--bd)',
          fontSize: '0.75rem',
          color: 'var(--fg3)',
        }}
      >
        <span>
          <b style={{ color: 'var(--fg1)' }}>{offer.taskTemplates}</b> tâche{offer.taskTemplates > 1 ? 's' : ''} engagée
          {offer.taskTemplates > 1 ? 's' : ''} par cette offre
        </span>
        {offer.catalogValueCents > 0 && (
          <span>
            Valeur catalogue <b style={{ color: 'var(--fg1)' }}>{money(offer.catalogValueCents)}</b>
            {offer.discountCents > 0 && <> · remise {money(offer.discountCents)}</>}
          </span>
        )}
        {sequel && (
          <span>
            Idéal avec <b style={{ color: 'var(--fg1)' }}>{sequel.name}</b>
          </span>
        )}
        {offer.segments.length > 0 && <span>Pour : {offer.segments.join(', ')}</span>}
      </div>
    </div>
  );
}

type OfferLineGroup = { group: string; lines: Offer['lines'] };

function ItemsTable({ items, title }: { items: CatalogueItem[]; title: string }) {
  if (items.length === 0) return null;
  const cell: React.CSSProperties = { padding: '9px 0', borderBottom: '1px solid var(--bd)', fontSize: '0.8125rem' };
  return (
    <div className="card" style={{ padding: '0.5rem 1.125rem 0.75rem', overflowX: 'auto' }}>
      <div style={{ fontSize: '0.8125rem', fontWeight: 700, padding: '8px 0 4px' }}>{title}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
        <thead>
          <tr>
            {['Code', 'Nom', 'Unité', 'Prix'].map((h, i) => (
              <th
                key={h}
                className="lbl"
                style={{ padding: '8px 0', borderBottom: '1px solid var(--bd-solid)', textAlign: i === 3 ? 'right' : 'left' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} style={!i.active ? { opacity: 0.55 } : undefined}>
              <td style={{ ...cell, fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', color: 'var(--fg3)' }}>{i.code}</td>
              <td style={cell}>{i.name}</td>
              <td style={{ ...cell, color: 'var(--fg3)' }}>{i.unit ?? '—'}</td>
              <td style={{ ...cell, textAlign: 'right' }}>
                {i.priceCents === null ? <span style={{ color: 'var(--fg4)' }}>—</span> : money(i.priceCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CataloguePanel({ items, offers }: { items: CatalogueItem[]; offers: Offer[] }) {
  const web = offers.filter((o) => o.billing === 'ponctuel');
  const monthly = offers.filter((o) => o.billing !== 'ponctuel');

  if (offers.length === 0 && items.length === 0) {
    return (
      <div>
        <SectionHead title="Catalogue" sub="Produits, services et offres — ce que l'agence vend." />
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--fg3)', fontSize: '0.8125rem' }}>
          Rien à afficher. Connectez-vous avec un compte rattaché à l&apos;agence pour voir son catalogue.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHead
        title="Catalogue"
        sub={`${offers.length} offres · ${items.length} articles. Une offre décrit le travail qu'elle engage : souscrire crée ses tâches.`}
      />

      {web.length > 0 && (
        <section style={{ display: 'grid', gap: 14 }}>
          <div className="lbl">Forfaits web — paiement unique</div>
          {web.map((o) => <OfferCard key={o.id} offer={o} all={offers} />)}
        </section>
      )}

      {monthly.length > 0 && (
        <section style={{ display: 'grid', gap: 14 }}>
          <div className="lbl">Packs SEO — mensuels</div>
          {monthly.map((o) => <OfferCard key={o.id} offer={o} all={offers} />)}
        </section>
      )}

      <section style={{ display: 'grid', gap: 14 }}>
        <div className="lbl">Articles du catalogue</div>
        <ItemsTable title="Produits — vendus et livrés une fois" items={items.filter((i) => i.kind === 'produit')} />
        <ItemsTable title="Services — reconduits" items={items.filter((i) => i.kind === 'service')} />
        <p style={{ fontSize: '0.75rem', color: 'var(--fg4)' }}>
          Les prix unitaires sont facultatifs : l&apos;agence vend des forfaits. Les renseigner ne sert qu&apos;à faire
          apparaître la remise d&apos;une offre.
        </p>
      </section>
    </div>
  );
}
