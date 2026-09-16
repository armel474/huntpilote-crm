'use client';

/**
 * Le constructeur d'offre — session 9.2. Une page par offre : à gauche
 * l'édition en sections repliables, à droite l'aperçu de la carte telle que
 * l'agence la verra partout ailleurs, qui suit chaque frappe.
 *
 * Tout ce qu'on édite tient dans un brouillon (`OfferDraft`) ; « Enregistrer
 * l'offre » l'envoie entier à l'action serveur, qui le relit et l'écrit sous
 * RLS. Rien ne part tant que rien n'a changé.
 */
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { saveOffer } from '@/app/agence/catalogue-actions';
import { Field, Notice, SectionHead } from '@/app/agence/bits';
import { Grip } from '@/app/agence/CataloguePanel';
import { OfferCard, Switch, lookups } from '@/app/agence/OfferCard';
import { Badge } from '@/components/ui/Atoms';
import { IcoArrowL, IcoCheck, IcoChevD, IcoDown, IcoLock, IcoPlus, IcoUp, IcoX } from '@/components/ui/Icons';
import {
  BILLINGS,
  CADENCES,
  CADENCE_LABEL,
  TASK_ROLES,
  dueLabel,
  emptyDraft,
  includableOffers,
  slugify,
  toDraft,
  uid,
  type DraftDeliverable,
  type DraftLine,
  type DraftTask,
  type OfferDraft,
} from '@/lib/data/offres';
import { BILLING_LABEL, ROLE_LABEL, money } from '@/lib/format';
import type { CatalogueItem, Offer } from '@/lib/queries/agence';

const BILLING_NAME: Record<OfferDraft['billing'], string> = {
  ponctuel: 'Ponctuel — paiement unique',
  mensuel: 'Mensuel',
  trimestriel: 'Trimestriel',
  annuel: 'Annuel',
};

/* ── Petites pièces ── */

function Section({ title, sub, open, onToggle, children }: { title: string; sub?: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="cat-sec">
      <button type="button" className="cat-sec-h" onClick={onToggle} aria-expanded={open}>
        <span className="cat-sec-t">
          {title}
          {sub && <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--fg3)', fontWeight: 500, marginTop: 2 }}>{sub}</span>}
        </span>
        <span className={`cat-sec-chev${open ? ' open' : ''}`}><IcoChevD size={14} /></span>
      </button>
      {open && <div className="cat-sec-b">{children}</div>}
    </div>
  );
}

function Tools({ onUp, onDown, onRemove, canManage }: { onUp?: () => void; onDown?: () => void; onRemove: () => void; canManage: boolean }) {
  if (!canManage) return null;
  return (
    <div className="cat-tools">
      {onUp && <button type="button" className="btn-icon" onClick={onUp} aria-label="Monter"><IcoUp size={11} /></button>}
      {onDown && <button type="button" className="btn-icon" onClick={onDown} aria-label="Descendre"><IcoDown size={11} /></button>}
      <button type="button" className="btn-icon" onClick={onRemove} aria-label="Retirer"><IcoX size={11} /></button>
    </div>
  );
}

/** Un montant en dollars saisi à l'écran ↔ des cents dans le brouillon. */
function MoneyInput({ id, cents, onChange, disabled, placeholder, width }: { id?: string; cents: number | null; onChange: (c: number | null) => void; disabled?: boolean; placeholder?: string; width?: number | string }) {
  const [raw, setRaw] = useState(cents === null ? '' : String(cents / 100));
  useEffect(() => {
    // Une valeur venue d'ailleurs (le rechargement après enregistrement) reprend le champ.
    setRaw((r) => (cents === null ? (r.trim() === '' ? r : '') : Math.round(Number(r.replace(',', '.')) * 100) === cents ? r : String(cents / 100)));
  }, [cents]);
  return (
    <input
      id={id}
      className="fld"
      inputMode="decimal"
      placeholder={placeholder}
      value={raw}
      disabled={disabled}
      style={width ? { width } : undefined}
      onChange={(e) => {
        setRaw(e.target.value);
        const t = e.target.value.trim().replace(',', '.');
        if (t === '') return onChange(null);
        const n = Math.round(Number(t) * 100);
        if (Number.isFinite(n) && n >= 0) onChange(n);
      }}
    />
  );
}

function IntInput({ value, onChange, disabled, placeholder, min = 0, max, width, ariaLabel }: { value: number | null; onChange: (v: number | null) => void; disabled?: boolean; placeholder?: string; min?: number; max?: number; width?: number | string; ariaLabel?: string }) {
  return (
    <input
      className="fld"
      type="number"
      min={min}
      max={max}
      step={1}
      placeholder={placeholder}
      aria-label={ariaLabel}
      value={value === null ? '' : value}
      disabled={disabled}
      style={width ? { width } : undefined}
      onChange={(e) => {
        if (e.target.value === '') return onChange(null);
        const n = Number(e.target.value);
        if (Number.isFinite(n)) onChange(n);
      }}
    />
  );
}

function ItemSelect({ value, items, onChange, disabled, ariaLabel }: { value: string; items: CatalogueItem[]; onChange: (id: string) => void; disabled?: boolean; ariaLabel: string }) {
  const visible = items.filter((i) => i.active || i.id === value);
  const group = (kind: CatalogueItem['kind'], label: string) => {
    const list = visible.filter((i) => i.kind === kind);
    if (!list.length) return null;
    return (
      <optgroup label={label}>
        {list.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}{!i.active ? ' (archivé)' : ''}{i.priceCents === null ? ' — sans prix' : ''}
          </option>
        ))}
      </optgroup>
    );
  };
  return (
    <select className="sel" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} aria-label={ariaLabel} style={{ fontSize: '0.8125rem', flex: '2 1 180px', minWidth: 0 }}>
      {group('service', 'Services')}
      {group('produit', 'Produits')}
    </select>
  );
}

const move = <T,>(arr: T[], i: number, dir: -1 | 1): T[] => {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

/* ── La page ── */

export function OfferBuilder({
  offer,
  offers,
  items,
  canManage,
  nextPosition,
  onBack,
  onSaved,
  onOpenArticle,
}: {
  /** L'offre à modifier, ou null pour en créer une. */
  offer: Offer | null;
  offers: Offer[];
  items: CatalogueItem[];
  canManage: boolean;
  nextPosition: number;
  onBack: () => void;
  onSaved: (message: string, created: boolean) => void;
  onOpenArticle: (id: string) => void;
}) {
  const router = useRouter();
  const initial = useMemo(() => (offer ? toDraft(offer) : emptyDraft('')), [offer]);
  const [d, setD] = useState<OfferDraft>(initial);
  const [baseline, setBaseline] = useState(initial);
  const [codeTouched, setCodeTouched] = useState(!!offer);
  const [open, setOpen] = useState<Record<string, boolean>>({ identite: true, prix: true, contenu: true, benefices: true, engendre: true, ensuite: false });
  const [segInput, setSegInput] = useState('');
  const [benInput, setBenInput] = useState('');
  const [state, action, pending] = useActionState(saveOffer, null);
  const ro = !canManage;
  const dirty = JSON.stringify(d) !== JSON.stringify(baseline);
  const recurring = d.billing !== 'ponctuel';
  const data = useMemo(() => ({ items, offers }), [items, offers]);
  const { itemById, value } = lookups(data);
  const { totalCents, missing } = value(d);
  const includable = includableOffers(offers, d);
  const groups = d.lines.filter((l): l is DraftLine & { kind: 'groupe' } => l.kind === 'groupe');
  const activeItems = items.filter((i) => i.active);

  // Après un enregistrement réussi, la page recharge l'offre depuis la base :
  // le brouillon repart de là, avec les identifiants des lignes créées.
  useEffect(() => {
    if (initial !== baseline && !dirty) {
      setD(initial);
      setBaseline(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      if (!offer) onSaved(state.message, true);
      else {
        setBaseline(d);
        onSaved(state.message, false);
        router.refresh();
      }
    } else if (state.message.startsWith('L’offre est enregistrée, mais')) {
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.at]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const back = () => {
    if (dirty && !window.confirm('Des modifications ne sont pas enregistrées. Quitter sans enregistrer ?')) return;
    onBack();
  };
  const set = <K extends keyof OfferDraft>(k: K, v: OfferDraft[K]) => setD((p) => ({ ...p, [k]: v }));
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  /* Contenu */
  const setLines = (fn: (lines: DraftLine[]) => DraftLine[]) => setD((p) => ({ ...p, lines: fn(p.lines) }));
  const updLine = (key: string, patch: Partial<DraftLine>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? ({ ...l, ...patch } as DraftLine) : l)));
  const firstItem = activeItems[0]?.id ?? items[0]?.id ?? '';
  const addArticle = () => firstItem && setLines((ls) => [...ls, { key: uid(), kind: 'article', id: null, catalogItemId: firstItem, quantity: 1, label: '' }]);
  const addIncluded = () => includable[0] && setLines((ls) => [...ls, { key: uid(), kind: 'offre', id: null, includedOfferId: includable[0].id }]);
  const optionKeyFor = (line: DraftLine & { kind: 'groupe' }, itemId: string, label: string) => {
    const base = slugify(label || itemById.get(itemId)?.code || 'option') || 'option';
    let key = base;
    let n = 2;
    while (line.options.some((o) => o.optionKey === key)) key = `${base}-${n++}`;
    return key;
  };
  const addGroup = () => {
    if (activeItems.length < 2) return;
    const [a, b] = activeItems;
    const line: DraftLine & { kind: 'groupe' } = { key: uid(), kind: 'groupe', group: 'Au choix', options: [] };
    line.options.push({ key: uid(), id: null, catalogItemId: a.id, quantity: 1, label: '', optionKey: optionKeyFor(line, a.id, '') });
    line.options.push({ key: uid(), id: null, catalogItemId: b.id, quantity: 1, label: '', optionKey: optionKeyFor(line, b.id, '') });
    setLines((ls) => [...ls, line]);
  };

  /* Tâches et livrables */
  const setTasks = (fn: (t: DraftTask[]) => DraftTask[]) => setD((p) => ({ ...p, tasks: fn(p.tasks) }));
  const updTask = (key: string, patch: Partial<DraftTask>) => setTasks((ts) => ts.map((t) => (t.key === key ? { ...t, ...patch } : t)));
  const addTask = () =>
    setTasks((ts) => [...ts, { key: uid(), id: null, title: '', kind: 'technique', cadence: recurring ? 'mensuel' : 'signature', dueDay: null, defaultRole: 'chef_projet', estimateHours: null, optionGroup: null, optionKey: null }]);
  const setDeliverables = (fn: (x: DraftDeliverable[]) => DraftDeliverable[]) => setD((p) => ({ ...p, deliverables: fn(p.deliverables) }));
  const updDeliv = (key: string, patch: Partial<DraftDeliverable>) => setDeliverables((ds) => ds.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const addDeliv = () =>
    setDeliverables((ds) => [...ds, { key: uid(), id: null, code: `L-${String(ds.length + 1).padStart(2, '0')}`, title: '', description: '', includedRounds: 1 }]);

  const taskCountLabel = `${d.tasks.length} tâche${d.tasks.length > 1 ? 's' : ''} ${recurring ? 'par période' : 'à la vente'}`;
  const [dragKey, setDragKey] = useState<string | null>(null);

  return (
    <form action={action}>
      <input type="hidden" name="payload" value={JSON.stringify(d)} />
      {!offer && <input type="hidden" name="position" value={nextPosition} />}
      <button type="button" className="btn-out" style={{ marginBottom: 14 }} onClick={back}>
        <IcoArrowL size={12} />
        Retour aux offres
      </button>
      <SectionHead
        title={offer ? d.name || offer.name : 'Nouvelle offre'}
        sub={dirty ? 'Modifications non enregistrées' : offer ? `${offer.code} · ${BILLING_LABEL[offer.billing]}` : 'Nom, prix, contenu, bénéfices, puis ce que la vente engendre.'}
        action={
          ro ? (
            <button type="button" className="btn-out" disabled title="Verrouillé — droit « Gérer le catalogue » requis">
              <IcoLock size={12} />
              Enregistrer l’offre
            </button>
          ) : (
            <button type="submit" className="btn-pri" disabled={!dirty || pending}>
              {pending ? 'Enregistrement…' : <><IcoCheck size={12} />Enregistrer l’offre</>}
            </button>
          )
        }
      />
      {ro && (
        <Notice tone="warn">
          Vous consultez cette offre en lecture seule — utile pour vendre. Le droit « Gérer le catalogue » est requis pour la modifier.
        </Notice>
      )}
      {state && !state.ok && <Notice state={state} />}

      <div className="off-edit">
        <div>
          <Section title="Identité" open={open.identite} onToggle={() => toggle('identite')}>
            <div className="st-grid2" style={{ gap: 12, marginBottom: 12 }}>
              <Field label="Nom" htmlFor="of-name">
                <input
                  id="of-name"
                  className="fld"
                  value={d.name}
                  disabled={ro}
                  autoFocus={!offer}
                  onChange={(e) => {
                    set('name', e.target.value);
                    if (!codeTouched) set('code', slugify(e.target.value));
                  }}
                />
              </Field>
              <Field label="Code" htmlFor="of-code" hint="Sert de référence dans les documents. Lettres, chiffres et tirets.">
                <input
                  id="of-code"
                  className="fld"
                  value={d.code}
                  disabled={ro}
                  onChange={(e) => {
                    setCodeTouched(true);
                    set('code', e.target.value);
                  }}
                  onBlur={() => set('code', slugify(d.code))}
                />
              </Field>
              <Field label="Accroche" htmlFor="of-tag" span>
                <input id="of-tag" className="fld" value={d.tagline} disabled={ro} placeholder="Une phrase sous le nom" onChange={(e) => set('tagline', e.target.value)} />
              </Field>
            </div>
            <Field label="Segments — « Idéal pour »" span>
              <div className="ag-chips" style={{ marginBottom: d.segments.length ? 8 : 0 }}>
                {d.segments.map((s) => (
                  <span key={s} className="ag-chip">
                    {s}
                    {!ro && (
                      <button type="button" aria-label={`Retirer ${s}`} onClick={() => set('segments', d.segments.filter((x) => x !== s))}>
                        <IcoX size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {!ro && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    className="fld"
                    placeholder="PME de services, artisans…"
                    value={segInput}
                    onChange={(e) => setSegInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const s = segInput.trim();
                        if (s && !d.segments.includes(s)) set('segments', [...d.segments, s]);
                        setSegInput('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-out"
                    onClick={() => {
                      const s = segInput.trim();
                      if (s && !d.segments.includes(s)) set('segments', [...d.segments, s]);
                      setSegInput('');
                    }}
                  >
                    Ajouter
                  </button>
                </div>
              )}
            </Field>
            <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                <Switch on={d.isPopular} disabled={ro} onToggle={() => set('isPopular', !d.isPopular)} label="Populaire" />
                Populaire — mise en avant
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                <Switch on={d.active} disabled={ro} onToggle={() => set('active', !d.active)} label="Active" />
                {d.active ? 'Active — se propose à la vente' : 'Inactive — reste visible, ne se propose plus'}
              </label>
            </div>
          </Section>

          <Section title="Prix" open={open.prix} onToggle={() => toggle('prix')}>
            {offer && offer.activeSubscriptions > 0 && (
              <div className="dl-banner yellow">
                <span>!</span>
                <span>
                  <b>{offer.activeSubscriptions} abonnement{offer.activeSubscriptions > 1 ? 's' : ''} actif{offer.activeSubscriptions > 1 ? 's' : ''}</b> à {money(offer.priceCents)}.
                  Modifier le prix ici ne change rien pour les clients déjà signés : ils gardent leur prix.
                </span>
              </div>
            )}
            <div className="st-grid2" style={{ gap: 12 }}>
              <Field label="Récurrence" htmlFor="of-billing">
                <select id="of-billing" className="sel" value={d.billing} disabled={ro} onChange={(e) => set('billing', e.target.value as OfferDraft['billing'])} style={{ fontSize: '0.8125rem' }}>
                  {BILLINGS.map((b) => (
                    <option key={b} value={b}>{BILLING_NAME[b]}</option>
                  ))}
                </select>
              </Field>
              <Field label="Prix ($)" htmlFor="of-price">
                <MoneyInput id="of-price" cents={d.priceCents} disabled={ro} placeholder="Sur devis" onChange={(c) => set('priceCents', c)} />
              </Field>
              <Field label="Type de prix" htmlFor="of-from">
                <select id="of-from" className="sel" value={d.priceIsFrom ? 'from' : 'fixed'} disabled={ro} onChange={(e) => set('priceIsFrom', e.target.value === 'from')} style={{ fontSize: '0.8125rem' }}>
                  <option value="fixed">Fixe</option>
                  <option value="from">À partir de — un plancher</option>
                </select>
              </Field>
              <Field label="Consultation gratuite (min)">
                <IntInput value={d.freeConsultMinutes} disabled={ro} placeholder="Aucune" onChange={(v) => set('freeConsultMinutes', v)} ariaLabel="Consultation gratuite en minutes" />
              </Field>
              {!recurring && (
                <>
                  <Field label="Délai de livraison — min (semaines)">
                    <IntInput value={d.deliveryWeeksMin} disabled={ro} min={1} onChange={(v) => set('deliveryWeeksMin', v)} ariaLabel="Délai minimal en semaines" />
                  </Field>
                  <Field label="Délai de livraison — max (semaines)">
                    <IntInput value={d.deliveryWeeksMax} disabled={ro} min={1} onChange={(v) => set('deliveryWeeksMax', v)} ariaLabel="Délai maximal en semaines" />
                  </Field>
                </>
              )}
              {recurring && (
                <>
                  <Field label="Tarif d’entrée" span hint="Le prix des premières périodes, puis le prix courant. Le revenu récurrent en tient compte.">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: d.introPriceCents !== null ? 8 : 0 }}>
                      <Switch
                        on={d.introPriceCents !== null}
                        disabled={ro}
                        label="Tarif d’entrée"
                        onToggle={() =>
                          d.introPriceCents !== null
                            ? setD((p) => ({ ...p, introPriceCents: null, introPeriods: null }))
                            : setD((p) => ({ ...p, introPriceCents: p.priceCents ?? 0, introPeriods: 3 }))
                        }
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>{d.introPriceCents !== null ? 'Activé' : 'Aucun tarif d’entrée'}</span>
                    </div>
                    {d.introPriceCents !== null && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <MoneyInput cents={d.introPriceCents} disabled={ro} placeholder="Montant" width={120} onChange={(c) => set('introPriceCents', c ?? 0)} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>pendant</span>
                        <IntInput value={d.introPeriods} disabled={ro} min={1} width={80} onChange={(v) => set('introPeriods', v ?? 1)} ariaLabel="Nombre de périodes" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>période{(d.introPeriods ?? 1) > 1 ? 's' : ''}, puis {money(d.priceCents)}</span>
                      </div>
                    )}
                  </Field>
                  <Field label="Taux au-delà des heures incluses ($ / h)" htmlFor="of-overage" hint="Pour un pack qui inclut des heures : ce que coûte l’heure de plus. Vide s’il n’y a pas de dépassement prévu.">
                    <MoneyInput id="of-overage" cents={d.overageHourlyRateCents} disabled={ro} placeholder="Aucun" onChange={(c) => set('overageHourlyRateCents', c)} />
                  </Field>
                </>
              )}
            </div>
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-muted)', fontSize: '0.8125rem' }}>
              {missing.length > 0 ? (
                <span style={{ color: 'var(--yellow-fg)', fontWeight: 700 }}>
                  Valeur incalculable : {missing.length} article{missing.length > 1 ? 's' : ''} sans prix —{' '}
                  {missing.map((id, i) => (
                    <span key={id}>
                      {i > 0 && ', '}
                      <button type="button" onClick={() => onOpenArticle(id)} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>
                        {itemById.get(id)?.name ?? id}
                      </button>
                    </span>
                  ))}
                </span>
              ) : d.lines.length === 0 ? (
                <span style={{ color: 'var(--fg3)' }}>Ajoutez du contenu pour voir la valeur catalogue et la remise.</span>
              ) : (
                <span>
                  Valeur catalogue <b>{money(totalCents)}</b>
                  {d.priceCents !== null && <> · remise <b>{money(Math.max(totalCents - d.priceCents, 0))}</b></>}
                </span>
              )}
            </div>
          </Section>

          <Section title="Contenu" sub="Ce que l’offre inclut — articles, offres incluses, options au choix du client" open={open.contenu} onToggle={() => toggle('contenu')}>
            {d.lines.length === 0 && <div style={{ fontSize: '0.75rem', color: 'var(--fg4)', padding: '6px 0' }}>Aucune ligne pour l’instant.</div>}
            {d.lines.map((l, i) => (
              <div
                key={l.key}
                className={`cat-line${dragKey === l.key ? ' dragging' : ''}`}
                draggable={!ro}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  setDragKey(l.key);
                }}
                onDragEnd={() => setDragKey(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!dragKey || dragKey === l.key) return;
                  setLines((ls) => {
                    const from = ls.findIndex((x) => x.key === dragKey);
                    const to = ls.findIndex((x) => x.key === l.key);
                    if (from < 0 || to < 0) return ls;
                    const next = [...ls];
                    const [m] = next.splice(from, 1);
                    next.splice(to, 0, m);
                    return next;
                  });
                  setDragKey(null);
                }}
              >
                <span className="cat-line-drag" aria-hidden="true">{!ro && <Grip />}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {l.kind === 'article' && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <ItemSelect value={l.catalogItemId} items={items} disabled={ro} ariaLabel="Article" onChange={(id) => updLine(l.key, { catalogItemId: id })} />
                      <IntInput value={l.quantity} disabled={ro} min={1} width={66} ariaLabel="Quantité" onChange={(v) => updLine(l.key, { quantity: v ?? 1 })} />
                      <input className="fld" style={{ flex: '1 1 140px' }} placeholder="Libellé personnalisé (facultatif)" value={l.label} disabled={ro} onChange={(e) => updLine(l.key, { label: e.target.value })} />
                    </div>
                  )}
                  {l.kind === 'offre' && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: '0.8125rem', fontStyle: 'italic', padding: '4px 0' }}>
                      Tout ce qui est dans
                      <select className="sel" value={l.includedOfferId} disabled={ro} aria-label="Offre incluse" onChange={(e) => updLine(l.key, { includedOfferId: e.target.value })} style={{ fontSize: '0.8125rem', fontStyle: 'normal' }}>
                        {[...includable, ...offers.filter((o) => o.id === l.includedOfferId && !includable.includes(o))].map((o) => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {l.kind === 'offre' && (() => {
                    const inc = offers.find((o) => o.id === l.includedOfferId);
                    return inc && inc.lines.length > 0 ? (
                      <div style={{ paddingLeft: 12, marginTop: 4, fontSize: '0.6875rem', color: 'var(--fg4)', lineHeight: 1.6 }}>
                        {inc.lines.map((x) => x.label).join(' · ')}
                      </div>
                    ) : null;
                  })()}
                  {l.kind === 'groupe' && (
                    <div>
                      <input className="fld" style={{ marginBottom: 6, fontWeight: 700 }} value={l.group} disabled={ro} placeholder="Nom du groupe — ex. Hébergement" aria-label="Nom du groupe" onChange={(e) => updLine(l.key, { group: e.target.value })} />
                      {l.options.map((o, oi) => (
                        <div key={o.key} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5, paddingLeft: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.625rem', color: oi === 0 ? 'var(--green-fg)' : 'var(--fg4)', fontWeight: 700, width: 64, flexShrink: 0 }}>
                            {oi === 0 ? 'Par défaut' : 'ou'}
                          </span>
                          <ItemSelect
                            value={o.catalogItemId}
                            items={items}
                            disabled={ro}
                            ariaLabel="Article de l’option"
                            onChange={(id) => updLine(l.key, { options: l.options.map((x) => (x.key === o.key ? { ...x, catalogItemId: id } : x)) })}
                          />
                          <IntInput value={o.quantity} disabled={ro} min={1} width={66} ariaLabel="Quantité" onChange={(v) => updLine(l.key, { options: l.options.map((x) => (x.key === o.key ? { ...x, quantity: v ?? 1 } : x)) })} />
                          <input className="fld" style={{ flex: '1 1 120px' }} placeholder="Libellé" value={o.label} disabled={ro} onChange={(e) => updLine(l.key, { options: l.options.map((x) => (x.key === o.key ? { ...x, label: e.target.value } : x)) })} />
                          {!ro && (
                            <div className="cat-tools">
                              {oi > 0 && (
                                <button type="button" className="btn-icon" aria-label="Mettre par défaut" title="Mettre par défaut" onClick={() => updLine(l.key, { options: [o, ...l.options.filter((x) => x.key !== o.key)] })}>
                                  <IcoUp size={11} />
                                </button>
                              )}
                              {l.options.length > 2 && (
                                <button type="button" className="btn-icon" aria-label="Retirer l’option" onClick={() => updLine(l.key, { options: l.options.filter((x) => x.key !== o.key) })}>
                                  <IcoX size={11} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {!ro && (
                        <button
                          type="button"
                          className="cat-add-btn"
                          onClick={() => {
                            const item = activeItems.find((x) => !l.options.some((o) => o.catalogItemId === x.id)) ?? activeItems[0];
                            if (!item) return;
                            updLine(l.key, { options: [...l.options, { key: uid(), id: null, catalogItemId: item.id, quantity: 1, label: '', optionKey: optionKeyFor(l, item.id, '') }] });
                          }}
                        >
                          <IcoPlus size={11} />
                          Option
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <Tools canManage={!ro} onUp={i > 0 ? () => setLines((ls) => move(ls, i, -1)) : undefined} onDown={i < d.lines.length - 1 ? () => setLines((ls) => move(ls, i, 1)) : undefined} onRemove={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} />
              </div>
            ))}
            {!ro && (
              <div className="cat-add-row">
                <button type="button" className="cat-add-btn" onClick={addArticle} disabled={!firstItem}><IcoPlus size={11} />Article</button>
                <button type="button" className="cat-add-btn" onClick={addIncluded} disabled={!includable.length} title={!includable.length ? 'Aucune offre à inclure sans créer de boucle' : undefined}><IcoPlus size={11} />Offre incluse</button>
                <button type="button" className="cat-add-btn" onClick={addGroup} disabled={activeItems.length < 2}><IcoPlus size={11} />Groupe d’options</button>
              </div>
            )}
          </Section>

          <Section title="Bénéfices" sub="Ce que le client y gagne — une ligne par bénéfice" open={open.benefices} onToggle={() => toggle('benefices')}>
            {d.benefits.map((b, i) => (
              <div key={i} className="cat-line" style={{ alignItems: 'center' }}>
                <span style={{ color: 'var(--green-fg)', display: 'flex', flexShrink: 0 }}><IcoCheck size={11} /></span>
                {ro ? (
                  <span style={{ fontSize: '0.8125rem', flex: 1 }}>{b}</span>
                ) : (
                  <input className="fld" value={b} aria-label={`Bénéfice ${i + 1}`} onChange={(e) => set('benefits', d.benefits.map((x, idx) => (idx === i ? e.target.value : x)))} />
                )}
                <Tools canManage={!ro} onUp={i > 0 ? () => set('benefits', move(d.benefits, i, -1)) : undefined} onDown={i < d.benefits.length - 1 ? () => set('benefits', move(d.benefits, i, 1)) : undefined} onRemove={() => set('benefits', d.benefits.filter((_, idx) => idx !== i))} />
              </div>
            ))}
            {!ro && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <input
                  className="fld"
                  placeholder="Nouveau bénéfice"
                  value={benInput}
                  onChange={(e) => setBenInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (benInput.trim()) set('benefits', [...d.benefits, benInput.trim()]);
                      setBenInput('');
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-out"
                  onClick={() => {
                    if (benInput.trim()) set('benefits', [...d.benefits, benInput.trim()]);
                    setBenInput('');
                  }}
                >
                  Ajouter
                </button>
              </div>
            )}
          </Section>

          <Section title="Ce que la vente engendre" sub={`${taskCountLabel} · ${d.deliverables.length} livrable${d.deliverables.length > 1 ? 's' : ''}`} open={open.engendre} onToggle={() => toggle('engendre')}>
            <p style={{ fontSize: '0.75rem', color: 'var(--fg4)', marginBottom: 12, lineHeight: 1.5 }}>
              Une tâche est le travail interne, créée automatiquement quand l’offre est vendue. Un livrable est ce que le client
              approuve, avec ses rondes de révision incluses.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <div className="lbl" style={{ marginBottom: 8 }}>Tâches</div>
                {d.tasks.map((t, i) => (
                  <div key={t.key} className="cat-line" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
                    {ro ? (
                      <>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{t.title}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>
                          {t.defaultRole ? ROLE_LABEL[t.defaultRole] : 'Rôle à décider'} · {dueLabel(t)}
                          {t.estimateHours ? ` · ${t.estimateHours} h` : ''}
                          {t.optionGroup ? ` · si « ${t.optionKey} »` : ''}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input className="fld" placeholder="Titre de la tâche" value={t.title} aria-label="Titre de la tâche" onChange={(e) => updTask(t.key, { title: e.target.value })} />
                          <Tools canManage onUp={i > 0 ? () => setTasks((ts) => move(ts, i, -1)) : undefined} onDown={i < d.tasks.length - 1 ? () => setTasks((ts) => move(ts, i, 1)) : undefined} onRemove={() => setTasks((ts) => ts.filter((x) => x.key !== t.key))} />
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <select className="sel" value={t.defaultRole ?? ''} aria-label="Rôle par défaut" onChange={(e) => updTask(t.key, { defaultRole: (e.target.value || null) as DraftTask['defaultRole'] })} style={{ fontSize: '0.75rem', flex: '1 1 120px' }}>
                            <option value="">Rôle à décider</option>
                            {TASK_ROLES.map((r) => (
                              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                            ))}
                          </select>
                          <select className="sel" value={t.cadence} aria-label="Cadence" onChange={(e) => updTask(t.key, { cadence: e.target.value as DraftTask['cadence'] })} style={{ fontSize: '0.75rem', flex: '1 1 120px' }}>
                            {CADENCES.map((c) => (
                              <option key={c} value={c}>{CADENCE_LABEL[c]}</option>
                            ))}
                          </select>
                          <IntInput value={t.dueDay} min={1} max={28} width={70} placeholder="Jour" ariaLabel="Jour d’échéance (1 à 28)" onChange={(v) => updTask(t.key, { dueDay: v })} />
                          <input className="fld" inputMode="decimal" placeholder="h" title="Estimation en heures" aria-label="Estimation en heures" style={{ width: 56 }} value={t.estimateHours ?? ''} onChange={(e) => { const n = Number(e.target.value.replace(',', '.')); updTask(t.key, { estimateHours: e.target.value === '' || !Number.isFinite(n) ? null : n }); }} />
                          <select className="sel" value={t.kind} aria-label="Sorte de tâche" onChange={(e) => updTask(t.key, { kind: e.target.value as DraftTask['kind'] })} style={{ fontSize: '0.75rem', flex: '1 1 100px' }}>
                            <option value="technique">Technique</option>
                            <option value="contenu">Contenu</option>
                          </select>
                          {groups.length > 0 && (
                            <select
                              className="sel"
                              value={t.optionGroup ? `${t.optionGroup} ${t.optionKey}` : ''}
                              aria-label="Option qui déclenche la tâche"
                              onChange={(e) => {
                                const [g, k] = e.target.value.split(' ');
                                updTask(t.key, { optionGroup: g || null, optionKey: g ? k : null });
                              }}
                              style={{ fontSize: '0.75rem', flex: '1 1 160px' }}
                            >
                              <option value="">Toujours</option>
                              {groups.flatMap((g) =>
                                g.options.map((o) => (
                                  <option key={`${g.key}-${o.key}`} value={`${g.group} ${o.optionKey}`}>
                                    Si « {o.label || itemById.get(o.catalogItemId)?.name || o.optionKey} »
                                  </option>
                                )),
                              )}
                            </select>
                          )}
                        </div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--fg4)' }}>{dueLabel(t)}</div>
                      </>
                    )}
                  </div>
                ))}
                {!ro && (
                  <button type="button" className="cat-add-btn" style={{ marginTop: 8 }} onClick={addTask}><IcoPlus size={11} />Tâche</button>
                )}
              </div>
              <div>
                <div className="lbl" style={{ marginBottom: 8 }}>Livrables</div>
                {d.deliverables.map((x, i) => (
                  <div key={x.key} className="cat-line" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
                    {ro ? (
                      <>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{x.code} — {x.title}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>
                          {x.includedRounds === null ? 'Sans ronde de révision' : `${x.includedRounds} ronde${x.includedRounds > 1 ? 's' : ''} de révision incluse${x.includedRounds > 1 ? 's' : ''}`}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input className="fld" style={{ width: 66 }} value={x.code} aria-label="Code du livrable" onChange={(e) => updDeliv(x.key, { code: e.target.value })} />
                          <input className="fld" placeholder="Titre du livrable" value={x.title} aria-label="Titre du livrable" onChange={(e) => updDeliv(x.key, { title: e.target.value })} />
                          <Tools canManage onUp={i > 0 ? () => setDeliverables((ds) => move(ds, i, -1)) : undefined} onDown={i < d.deliverables.length - 1 ? () => setDeliverables((ds) => move(ds, i, 1)) : undefined} onRemove={() => setDeliverables((ds) => ds.filter((y) => y.key !== x.key))} />
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <IntInput value={x.includedRounds} min={0} width={66} placeholder="—" ariaLabel="Rondes de révision incluses" onChange={(v) => updDeliv(x.key, { includedRounds: v })} />
                          <span style={{ fontSize: '0.625rem', color: 'var(--fg4)' }}>rondes de révision incluses (vide : sans objet)</span>
                        </div>
                        <input className="fld" placeholder="Description (facultatif)" value={x.description} aria-label="Description du livrable" onChange={(e) => updDeliv(x.key, { description: e.target.value })} />
                      </>
                    )}
                  </div>
                ))}
                {!ro && (
                  <button type="button" className="cat-add-btn" style={{ marginTop: 8 }} onClick={addDeliv}><IcoPlus size={11} />Livrable</button>
                )}
              </div>
            </div>
          </Section>

          <Section title="Ensuite" sub="L’offre recommandée après celle-ci — « Idéal avec »" open={open.ensuite} onToggle={() => toggle('ensuite')}>
            <Field label="Offre recommandée ensuite" htmlFor="of-next">
              <select id="of-next" className="sel" value={d.recommendedOfferId ?? ''} disabled={ro} onChange={(e) => set('recommendedOfferId', e.target.value || null)} style={{ fontSize: '0.8125rem' }}>
                <option value="">Aucune</option>
                {offers.filter((o) => o.id !== d.id).map((o) => (
                  <option key={o.id} value={o.id}>{o.name}{!o.active ? ' (inactive)' : ''}</option>
                ))}
              </select>
            </Field>
          </Section>
        </div>

        <div style={{ position: 'sticky', top: 0 }}>
          <div className="lbl" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            Aperçu — tel qu’affiché ailleurs
            {dirty && <Badge label="non enregistré" tone="yellow" />}
          </div>
          <OfferCard draft={d} data={data} activeSubscriptions={offer?.activeSubscriptions ?? 0} onOpenArticle={onOpenArticle} />
        </div>
      </div>
    </form>
  );
}
