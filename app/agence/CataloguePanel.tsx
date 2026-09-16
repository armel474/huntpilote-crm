'use client';

/**
 * Le catalogue de l'agence — session 9.2 : les articles, à éditer en place.
 *
 * Deux tableaux (services, produits) réordonnables au glissement, et un
 * panneau latéral pour créer ou modifier un article sans quitter la liste.
 * Sans le droit « Gérer le catalogue », tout se lit, rien ne s'écrit : le
 * panneau s'ouvre figé et les boutons disent pourquoi.
 */
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { reorderCatalogItems, saveCatalogItem } from '@/app/agence/catalogue-actions';
import type { ActionState } from '@/app/agence/action-base';
import { Field, Notice, SectionHead } from '@/app/agence/bits';
import { Badge } from '@/components/ui/Atoms';
import { IcoLock, IcoPlus, IcoX } from '@/components/ui/Icons';
import { slugify } from '@/lib/data/offres';
import { money } from '@/lib/format';
import type { CatalogueItem, Offer } from '@/lib/queries/agence';

const REC_LABEL: Record<CatalogueItem['billing'], string> = {
  ponctuel: 'Ponctuel',
  mensuel: 'Mensuel',
  trimestriel: 'Trimestriel',
  annuel: 'Annuel',
};

export function Grip() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="5" r="1.6" /><circle cx="16" cy="5" r="1.6" /><circle cx="8" cy="12" r="1.6" />
      <circle cx="16" cy="12" r="1.6" /><circle cx="8" cy="19" r="1.6" /><circle cx="16" cy="19" r="1.6" />
    </svg>
  );
}

/** Les offres qui incluent un article, directement ou dans un groupe d'options. */
export function offersUsing(itemId: string, offers: Offer[]): Offer[] {
  return offers.filter((o) => o.lines.some((l) => l.catalogItemId === itemId));
}

/* ── Le tableau ── */

function ArticleTable({
  title,
  items,
  canManage,
  onOpen,
  onReorder,
}: {
  title: string;
  items: CatalogueItem[];
  canManage: boolean;
  onOpen: (item: CatalogueItem) => void;
  onReorder: (ids: string[]) => void;
}) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const drop = (to: number) => {
    if (dragging === null || dragging === to) return;
    const arr = [...items];
    const [moved] = arr.splice(dragging, 1);
    arr.splice(to, 0, moved);
    onReorder(arr.map((i) => i.id));
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 8 }}>
        {title} <span style={{ color: 'var(--fg4)', fontWeight: 500 }}>· {items.length}</span>
      </div>
      <div
        className="card ctb"
        style={{ padding: '0.4rem 0.75rem 0.5rem', ['--ctb-cols' as string]: '22px 150px 2.1fr 100px 90px 100px 90px' }}
      >
        <div className="ctb-head">
          {['', 'Code', 'Nom', 'Récurrence', 'Unité', 'Prix', 'Statut'].map((h, i) => (
            <div key={i} className="lbl">{h}</div>
          ))}
        </div>
        {items.length === 0 && (
          <div style={{ padding: '14px 10px', fontSize: '0.75rem', color: 'var(--fg4)' }}>Aucun article de cette sorte.</div>
        )}
        {items.map((a, i) => (
          <div
            key={a.id}
            role="button"
            tabIndex={0}
            className={`ctb-row${a.active ? '' : ' archived'}${dragging === i ? ' dragging' : ''}${over === i && dragging !== null ? ' over' : ''}`}
            onClick={() => onOpen(a)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen(a);
              }
            }}
            draggable={canManage}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              setDragging(i);
            }}
            onDragEnd={() => {
              setDragging(null);
              setOver(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (over !== i) setOver(i);
            }}
            onDrop={(e) => {
              e.preventDefault();
              drop(i);
              setDragging(null);
              setOver(null);
            }}
          >
            <span className="ctb-drag" onClick={(e) => e.stopPropagation()} aria-hidden="true">
              {canManage && <Grip />}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--fg3)', fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>{a.code}</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{a.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>{REC_LABEL[a.billing]}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>{a.unit ?? '—'}</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: a.priceCents === null ? 'var(--yellow-fg)' : 'var(--fg1)' }}>
              {a.priceCents === null ? 'Sans prix' : money(a.priceCents)}
            </span>
            <span>{!a.active && <Badge label="Archivé" tone="neutral" />}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Le panneau latéral ── */

function ArticleSheet({
  item,
  offers,
  canManage,
  nextPosition,
  onClose,
  onSaved,
  onOpenOffer,
}: {
  item: CatalogueItem | null;
  offers: Offer[];
  canManage: boolean;
  nextPosition: number;
  onClose: () => void;
  onSaved: () => void;
  onOpenOffer: (id: string) => void;
}) {
  const [state, action, pending] = useActionState(saveCatalogItem, null);
  const [name, setName] = useState(item?.name ?? '');
  const [code, setCode] = useState(item?.code ?? '');
  const [codeTouched, setCodeTouched] = useState(!!item);
  const [kind, setKind] = useState<CatalogueItem['kind']>(item?.kind ?? 'service');
  const [billing, setBilling] = useState<CatalogueItem['billing']>(item?.billing ?? 'mensuel');
  const [price, setPrice] = useState(item?.priceCents === null || item?.priceCents === undefined ? '' : String(item.priceCents / 100));
  const [active, setActive] = useState(item?.active ?? true);
  const ro = !canManage;
  const usedIn = item ? offersUsing(item.id, offers) : [];
  const usedInActive = usedIn.filter((o) => o.active);
  const willArchive = !!item && item.active && !active;

  useEffect(() => {
    if (state?.ok) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.at]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pickKind = (k: CatalogueItem['kind']) => {
    setKind(k);
    // Un produit est forcément ponctuel ; un service se reconduit.
    if (k === 'produit') setBilling('ponctuel');
    else if (billing === 'ponctuel') setBilling('mensuel');
  };

  return (
    <div className="dl-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dl-sheet" role="dialog" aria-modal="true" aria-label={item ? item.name : 'Nouvel article'}>
        <form action={action} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {item && <input type="hidden" name="item_id" value={item.id} />}
          {!item && <input type="hidden" name="position" value={nextPosition} />}
          <input type="hidden" name="active" value={active ? '1' : '0'} />
          <div className="dl-head">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800 }}>{item ? name || item.name : 'Nouvel article'}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', fontFamily: 'ui-monospace, monospace' }}>{code || '—'}</div>
            </div>
            <button className="btn-icon" type="button" onClick={onClose} aria-label="Fermer">
              <IcoX size={13} />
            </button>
          </div>
          <div className="dl-body">
            <Notice state={state} />
            {ro && (
              <Notice tone="warn">
                Lecture seule — le droit « Gérer le catalogue » est requis pour modifier cet article.
              </Notice>
            )}
            {willArchive && usedInActive.length > 0 && (
              <div className="dl-banner yellow">
                <span>!</span>
                <span>
                  Cet article est utilisé par <b>{usedInActive.length} offre{usedInActive.length > 1 ? 's' : ''} active{usedInActive.length > 1 ? 's' : ''}</b>.
                  Il y restera tel quel — seul le catalogue le marquera comme archivé.
                </span>
              </div>
            )}
            <div className="st-grid2" style={{ gap: 12, marginBottom: 14 }}>
              <Field label="Nom" htmlFor="ci-name" span>
                <input
                  id="ci-name"
                  name="name"
                  className="fld"
                  value={name}
                  autoFocus={!item}
                  disabled={ro}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!codeTouched) setCode(slugify(e.target.value));
                  }}
                />
              </Field>
              <Field label="Code" htmlFor="ci-code" hint="Généré depuis le nom, modifiable. Lettres, chiffres et tirets.">
                <input
                  id="ci-code"
                  name="code"
                  className="fld"
                  value={code}
                  disabled={ro}
                  onChange={(e) => {
                    setCodeTouched(true);
                    setCode(e.target.value);
                  }}
                  onBlur={() => setCode((c) => slugify(c))}
                />
              </Field>
              <Field label="Sorte" htmlFor="ci-kind">
                <select id="ci-kind" name="kind" className="sel" value={kind} disabled={ro} onChange={(e) => pickKind(e.target.value as CatalogueItem['kind'])} style={{ fontSize: '0.8125rem' }}>
                  <option value="service">Service — se reconduit</option>
                  <option value="produit">Produit — vendu une fois</option>
                </select>
              </Field>
              <Field label="Récurrence" htmlFor="ci-billing" hint={kind === 'produit' ? 'Un produit est forcément ponctuel.' : 'Un service se reconduit.'}>
                <select
                  id="ci-billing"
                  name="billing"
                  className="sel"
                  value={billing}
                  disabled={ro || kind === 'produit'}
                  onChange={(e) => setBilling(e.target.value as CatalogueItem['billing'])}
                  style={{ fontSize: '0.8125rem' }}
                >
                  {kind === 'produit' ? (
                    <option value="ponctuel">Ponctuel</option>
                  ) : (
                    <>
                      <option value="mensuel">Mensuel</option>
                      <option value="trimestriel">Trimestriel</option>
                      <option value="annuel">Annuel</option>
                    </>
                  )}
                </select>
                {kind === 'produit' && <input type="hidden" name="billing" value="ponctuel" />}
              </Field>
              <Field label="Unité" htmlFor="ci-unit">
                <input id="ci-unit" name="unit" className="fld" placeholder="page, mois, heure…" defaultValue={item?.unit ?? ''} disabled={ro} />
              </Field>
              <Field
                label="Prix unitaire ($)"
                htmlFor="ci-price"
                hint={price.trim() === '' ? 'Sans prix : la valeur catalogue des offres qui l’incluent devient incalculable.' : undefined}
              >
                <input id="ci-price" name="price" className="fld" inputMode="decimal" placeholder="Non défini" value={price} disabled={ro} onChange={(e) => setPrice(e.target.value)} />
              </Field>
              <Field label="Description" htmlFor="ci-desc" span>
                <textarea id="ci-desc" name="description" className="fld" rows={3} style={{ resize: 'vertical', fontFamily: 'var(--font)' }} defaultValue={item?.description ?? ''} disabled={ro} />
              </Field>
              <Field label="Actif" span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
                  <input type="checkbox" checked={active} disabled={ro} onChange={(e) => setActive(e.target.checked)} />
                  {active ? 'Au catalogue' : 'Archivé — ne se propose plus dans une nouvelle offre'}
                </label>
              </Field>
            </div>
            {item && (
              <div className="dl-sec">
                <div className="dl-sec-h" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Où cet article est utilisé</div>
                {usedIn.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--fg4)' }}>Cet article n’apparaît dans aucune offre.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {usedIn.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => onOpenOffer(o.id)}
                        style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg1)', fontFamily: 'var(--font)' }}
                      >
                        {o.name} <span style={{ color: 'var(--fg4)', fontWeight: 500 }}>· {o.code}{!o.active ? ' · inactive' : ''}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="dl-foot" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn-out" type="button" onClick={onClose}>
              {ro ? 'Fermer' : 'Annuler'}
            </button>
            {!ro && (
              <button className="btn-pri" type="submit" disabled={pending || !name.trim()}>
                {pending ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── L'écran ── */

export function CataloguePanel({
  items,
  offers,
  canManage,
  openArticleId,
  onOpenOffer,
}: {
  items: CatalogueItem[];
  offers: Offer[];
  canManage: boolean;
  /** Un article à ouvrir dès l'arrivée — depuis « valeur incalculable » d'une offre. */
  openArticleId: string | null;
  onOpenOffer: (id: string) => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<CatalogueItem | 'new' | null>(null);
  const [ordered, setOrdered] = useState(items);
  const [notice, setNotice] = useState<ActionState>(null);

  // La liste suit la base à chaque rechargement ; le glissement la devance.
  useEffect(() => setOrdered(items), [items]);
  useEffect(() => {
    if (openArticleId) {
      const found = items.find((i) => i.id === openArticleId);
      if (found) setEditing(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openArticleId]);

  const services = ordered.filter((i) => i.kind === 'service');
  const products = ordered.filter((i) => i.kind === 'produit');
  const sansPrix = items.filter((i) => i.active && i.priceCents === null).length;

  const reorder = (kind: CatalogueItem['kind']) => (ids: string[]) => {
    const before = ordered;
    const byId = new Map(ordered.map((i) => [i.id, i]));
    const moved = ids.map((id) => byId.get(id)).filter((i): i is CatalogueItem => !!i);
    // Les deux tableaux se filtrent par sorte : seul l'ordre au sein d'une sorte compte.
    setOrdered([...ordered.filter((i) => i.kind !== kind), ...moved]);
    startTransition(async () => {
      const result = await reorderCatalogItems(ids);
      if (!result?.ok) {
        setOrdered(before);
        setNotice(result);
      } else {
        setNotice(null);
        router.refresh();
      }
    });
  };

  if (items.length === 0) {
    return (
      <div>
        <SectionHead title="Catalogue" sub="Produits et services — les briques de ce que l'agence vend." />
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--fg3)', fontSize: '0.8125rem' }}>
          Rien à afficher. Connectez-vous avec un compte rattaché à l&apos;agence pour voir son catalogue.
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHead
        title="Catalogue"
        sub={`${items.length} articles · ${sansPrix} sans prix unitaire. Un article est une brique ; une offre les assemble.`}
        action={
          <button
            className={canManage ? 'btn-pri' : 'btn-out'}
            type="button"
            disabled={!canManage}
            title={canManage ? undefined : 'Verrouillé — droit « Gérer le catalogue » requis'}
            onClick={() => setEditing('new')}
          >
            {canManage ? <IcoPlus size={12} /> : <IcoLock size={12} />}
            Nouvel article
          </button>
        }
      />
      {!canManage && (
        <Notice tone="warn">
          Vous consultez le catalogue en lecture seule. Le droit « Gérer le catalogue » est requis pour le modifier.
        </Notice>
      )}
      <Notice state={notice} />
      {canManage && (
        <p style={{ fontSize: '0.75rem', color: 'var(--fg4)', marginBottom: 12 }}>
          Glissez une ligne pour changer l&apos;ordre d&apos;affichage. Cliquez-la pour la modifier.
        </p>
      )}
      <ArticleTable title="Services — reconduits" items={services} canManage={canManage} onOpen={setEditing} onReorder={reorder('service')} />
      <ArticleTable title="Produits — vendus et livrés une fois" items={products} canManage={canManage} onOpen={setEditing} onReorder={reorder('produit')} />
      <p style={{ fontSize: '0.75rem', color: 'var(--fg4)' }}>
        Les prix unitaires sont facultatifs : l&apos;agence vend des forfaits. Les renseigner fait apparaître la valeur
        catalogue et la remise d&apos;une offre.
      </p>

      {editing && (
        <ArticleSheet
          key={editing === 'new' ? 'new' : editing.id}
          item={editing === 'new' ? null : editing}
          offers={offers}
          canManage={canManage}
          nextPosition={items.length + 1}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
          onOpenOffer={(id) => {
            setEditing(null);
            onOpenOffer(id);
          }}
        />
      )}
    </div>
  );
}
