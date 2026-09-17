'use client';

/**
 * Le panneau « Nouveau document » — session 9.4. S'ouvre en `slide-over`
 * depuis une fiche client ou une opportunité du pipeline, le compte déjà
 * connu. Quatre étapes : la sorte et son modèle ; le contenu (une offre du
 * catalogue, un document existant, ou des lignes libres) avec les totaux
 * toujours visibles ; les particularités (objet, contact, dates) ; l'aperçu
 * rendu par le serveur, balises vides signalées. Le geste final crée un
 * brouillon : rien n'est envoyé ici.
 *
 * Contrat, annexe et avenant se créent depuis une proposition acceptée
 * (« Créer la suite », étape suivante) : ils sont grisés et le disent.
 */
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { createDocument, getGeneratorOptions, previewNewDocument, type CreateInput, type LineInput } from '@/app/documents/actions';
import { Notice } from '@/app/agence/bits';
import { Badge } from '@/components/ui/Atoms';
import { IcoCheck, IcoChevD, IcoLock, IcoPlus, IcoWarn, IcoX } from '@/components/ui/Icons';
import { BILLING_SUFFIX, LINE_KIND_LABEL, computeTotals, type Billing, type LineKind } from '@/lib/documents/donnees';
import { money } from '@/lib/format';
import { GEN_KIND_LABEL, STATUS_META, type GenKind, type GeneratorOptions } from '@/lib/queries/documents';
import { routes } from '@/lib/routes';

export type NewDocContext = {
  clientId: string;
  clientName: string;
  dealId?: string | null;
  defaultKind?: GenKind;
  /** Le document dont celui-ci part — présélectionne « Depuis un document ». */
  sourceQuoteId?: string | null;
  subject?: string;
};

type Mode = 'offre' | 'source' | 'libre';
type FreeLine = { description: string; quantity: string; unitPrice: string; kind: LineKind; billing: Billing; catalogItemId: string | null };

const KINDS: { id: GenKind | 'contrat' | 'annexe' | 'avenant'; label: string; later?: boolean }[] = [
  { id: 'proposition', label: 'Proposition' },
  { id: 'devis', label: 'Devis' },
  { id: 'facture', label: 'Facture' },
  { id: 'contrat', label: 'Contrat', later: true },
  { id: 'annexe', label: 'Annexe', later: true },
  { id: 'avenant', label: 'Avenant', later: true },
];

const LINE_KINDS: LineKind[] = ['facturable', 'offert', 'remise', 'informatif'];
const BILLINGS: Billing[] = ['ponctuel', 'mensuel', 'trimestriel', 'annuel'];

const plusDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const toCents = (v: string) => Math.round(Number(String(v).replace(/\s/g, '').replace(',', '.')) * 100);
const fromCents = (c: number) => (c / 100).toFixed(2);

function Step({ n, title, sub, open, onToggle, children }: { n: number; title: string; sub?: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="cat-sec" style={{ marginBottom: 10 }}>
      <button type="button" className="cat-sec-h" onClick={onToggle} aria-expanded={open}>
        <span className="cat-sec-t">
          {n}. {title}
          {sub && <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--fg3)', fontWeight: 500, marginTop: 2 }}>{sub}</span>}
        </span>
        <span className={`cat-sec-chev${open ? ' open' : ''}`}><IcoChevD size={14} /></span>
      </button>
      {open && <div className="cat-sec-b">{children}</div>}
    </div>
  );
}

const emptyLine = (): FreeLine => ({ description: '', quantity: '1', unitPrice: '0', kind: 'facturable', billing: 'ponctuel', catalogItemId: null });

export function NewDocumentSheet({ context, onClose, onCreated }: { context: NewDocContext; onClose: () => void; onCreated?: (id: string) => void }) {
  const router = useRouter();
  const [options, setOptions] = useState<GeneratorOptions | null>(null);
  const [loadError, setLoadError] = useState('');
  const [kind, setKind] = useState<GenKind>(context.defaultKind ?? 'proposition');
  const [templateId, setTemplateId] = useState('');
  const [mode, setMode] = useState<Mode>(context.sourceQuoteId ? 'source' : 'offre');
  const [offerId, setOfferId] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [sourceId, setSourceId] = useState(context.sourceQuoteId ?? '');
  const [invoiceScope, setInvoiceScope] = useState<'total' | 'acompte'>('total');
  const [freeLines, setFreeLines] = useState<FreeLine[]>([emptyLine()]);
  const [addItemId, setAddItemId] = useState('');
  const [subject, setSubject] = useState(context.subject ?? '');
  const [contactId, setContactId] = useState('');
  const [expiresOn, setExpiresOn] = useState(plusDays(30));
  const [paymentTermsDays, setPaymentTermsDays] = useState('30');
  const [open, setOpen] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: false, 4: false });
  const [preview, setPreview] = useState<{ page: string; unfilled: string[] } | null>(null);
  const [previewError, setPreviewError] = useState('');
  const [previewing, startPreview] = useTransition();
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let alive = true;
    getGeneratorOptions(context.clientId).then((o) => {
      if (!alive) return;
      if (!o) {
        setLoadError('Impossible de lire ce compte : connectez-vous avec un compte de l’agence.');
        return;
      }
      setOptions(o);
      setOfferId(o.offers[0]?.id ?? '');
      setOfferPrice(o.offers[0]?.priceCents != null ? fromCents(o.offers[0].priceCents) : '');
      setAddItemId(o.items[0]?.id ?? '');
      setContactId(o.contacts.find((c) => c.isPrimary)?.id ?? o.contacts[0]?.id ?? '');
    });
    return () => {
      alive = false;
    };
  }, [context.clientId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const templatesOfKind = useMemo(() => (options?.templates ?? []).filter((t) => t.kind === kind), [options, kind]);
  useEffect(() => {
    const def = templatesOfKind.find((t) => t.isDefault) ?? templatesOfKind[0];
    setTemplateId(def?.id ?? '');
    if (def && kind === 'facture') setPaymentTermsDays(String(def.paymentTermsDays));
  }, [templatesOfKind, kind]);

  const offer = options?.offers.find((o) => o.id === offerId) ?? null;
  useEffect(() => {
    if (offer) {
      setOfferPrice(offer.priceCents != null ? fromCents(offer.priceCents) : '');
      setChoices({});
    }
  }, [offer]);

  const sources = useMemo(() => {
    const all = options?.sources ?? [];
    if (kind === 'facture') return all.filter((s) => s.status === 'accepte');
    return all;
  }, [options, kind, context.sourceQuoteId]);
  const source = sources.find((s) => s.id === sourceId) ?? null;
  // Un seul document source possible : il est choisi d'office.
  useEffect(() => {
    if (mode === 'source' && !source && sources.length > 0) setSourceId(sources[0].id);
  }, [mode, source, sources]);

  /** Les lignes que le document recevra, selon la façon de le remplir. */
  const lines = useMemo<LineInput[]>(() => {
    if (mode === 'offre') {
      if (!offer) return [];
      const price = toCents(offerPrice);
      const out: LineInput[] = [
        { description: offer.name, quantity: 1, unitPriceCents: Number.isFinite(price) ? price : 0, kind: 'facturable', billing: offer.billing, offerId: offer.id, catalogItemId: null },
      ];
      for (const g of offer.groups) {
        const chosen = g.options.find((o) => o.key === (choices[g.group] ?? g.options[0]?.key));
        if (chosen) out.push({ description: `${g.group} : ${chosen.label}`, quantity: 1, unitPriceCents: 0, kind: 'informatif', billing: 'ponctuel', offerId: offer.id, catalogItemId: null });
      }
      return out;
    }
    if (mode === 'source') {
      if (!source) return [];
      if (kind === 'facture' && invoiceScope === 'acompte') {
        const ponctuel = computeTotals(source.lines).ponctuel;
        return [{ description: `Acompte de 50 % — ${source.ref}`, quantity: 1, unitPriceCents: Math.round(ponctuel / 2), kind: 'facturable', billing: 'ponctuel', offerId: null, catalogItemId: null }];
      }
      return source.lines
        .filter((l) => (kind === 'facture' ? l.kind === 'facturable' || l.kind === 'remise' : true))
        .map((l) => ({ description: l.description, quantity: l.quantity, unitPriceCents: l.unitPriceCents, kind: l.kind, billing: l.billing, offerId: l.offerId, catalogItemId: l.catalogItemId }));
    }
    return freeLines
      .filter((l) => l.description.trim())
      .map((l) => ({ description: l.description.trim(), quantity: Number(l.quantity), unitPriceCents: toCents(l.unitPrice) || 0, kind: l.kind, billing: l.billing, catalogItemId: l.catalogItemId, offerId: null }));
  }, [mode, offer, offerPrice, choices, source, kind, invoiceScope, freeLines]);

  const totals = useMemo(() => computeTotals(lines), [lines]);
  const template = templatesOfKind.find((t) => t.id === templateId);
  const valid = !!template && template.hasBody && subject.trim().length > 0 && lines.length > 0;

  const input = useCallback(
    (): CreateInput => ({
      kind,
      templateId,
      clientId: context.clientId,
      contactId: contactId || null,
      dealId: context.dealId ?? null,
      subject: subject.trim(),
      expiresOn: kind === 'facture' ? null : expiresOn || null,
      paymentTermsDays: kind === 'facture' ? Number(paymentTermsDays) || null : null,
      lines,
      sourceQuoteId: mode === 'source' ? sourceId || null : (context.sourceQuoteId ?? null),
    }),
    [kind, templateId, context, contactId, subject, expiresOn, paymentTermsDays, lines, mode, sourceId],
  );

  const refreshPreview = useCallback(() => {
    if (!templateId) return;
    startPreview(async () => {
      const r = await previewNewDocument(input());
      if (r.ok) {
        setPreview({ page: r.page, unfilled: r.unfilled });
        setPreviewError('');
      } else {
        setPreview(null);
        setPreviewError(r.message);
      }
    });
  }, [input, templateId]);

  // L'aperçu se rafraîchit quand l'étape est ouverte et qu'une entrée change — sans rafale.
  useEffect(() => {
    if (!open[4] || !templateId) return undefined;
    const t = window.setTimeout(refreshPreview, 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open[4], templateId, kind, subject, contactId, expiresOn, paymentTermsDays, lines]);

  const create = () =>
    startTransition(async () => {
      const r = await createDocument(input());
      if (!r.ok) {
        setError(r.message);
        return;
      }
      if (onCreated) onCreated(r.id);
      else router.push(routes.document(r.id));
    });

  const toggle = (n: number) => setOpen((o) => ({ ...o, [n]: !o[n] }));
  const setFree = (i: number, patch: Partial<FreeLine>) => setFreeLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  return (
    <div className="dl-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="dl-sheet dl-wide" role="dialog" aria-modal="true" aria-label="Nouveau document">
        <div className="dl-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800 }}>Nouveau document</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', marginTop: 2 }}>Pour {context.clientName} — rien n&apos;est envoyé à cette étape.</div>
          </div>
          <button className="btn-icon" type="button" onClick={onClose} aria-label="Fermer le panneau"><IcoX size={13} /></button>
        </div>
        <div className="dl-body">
          {loadError && <Notice tone="err">{loadError}</Notice>}
          {options?.taxNumbersMissing && (
            <div className="dl-banner yellow" style={{ marginBottom: 12 }}>
              <span><IcoWarn size={13} /></span>
              <span>
                Les numéros de TPS et de TVQ de l&apos;agence ne sont pas renseignés : le brouillon se crée, mais il ne pourra pas être envoyé avant que{' '}
                <a href={routes.agence('profil')}>le profil de l&apos;agence</a> soit complété.
              </span>
            </div>
          )}
          {!options && !loadError && <div style={{ fontSize: '0.75rem', color: 'var(--fg4)', padding: '1rem 0' }}>Lecture du compte…</div>}

          {options && (
            <>
              <Step n={1} title="La sorte" sub={template ? `Modèle : ${template.name}` : undefined} open={open[1]} onToggle={() => toggle(1)}>
                <div className="ndp-kind-grid">
                  {KINDS.map((k) => {
                    const has = !k.later && options.templates.some((t) => t.kind === k.id);
                    const disabled = k.later || !has;
                    return (
                      <button
                        key={k.id}
                        type="button"
                        className={`ndp-kind-btn${kind === k.id ? ' on' : ''}`}
                        disabled={disabled}
                        onClick={() => !disabled && setKind(k.id as GenKind)}
                        title={k.later ? 'Se crée depuis une proposition acceptée — « Créer la suite », étape suivante.' : !has ? 'Aucun modèle de cette sorte.' : undefined}
                      >
                        {k.label}
                        {k.later && <small>Depuis une proposition acceptée — étape suivante</small>}
                        {!k.later && !has && <small>Sans modèle</small>}
                      </button>
                    );
                  })}
                </div>
                {templatesOfKind.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--yellow-fg)', marginTop: 8 }}>
                    Aucun modèle de {GEN_KIND_LABEL[kind].toLowerCase()} : <a href={routes.agence('modeles')}>créez-en un dans Modèles de documents</a>.
                  </p>
                ) : (
                  <>
                    {templatesOfKind.length > 1 && (
                      <select className="sel" style={{ marginTop: 8, fontSize: '0.8125rem' }} value={templateId} onChange={(e) => setTemplateId(e.target.value)} aria-label="Modèle">
                        {templatesOfKind.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}{t.isDefault ? ' — par défaut' : ''}{t.hasBody ? '' : ' — sans corps'}</option>
                        ))}
                      </select>
                    )}
                    {template && !template.hasBody && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--yellow-fg)', marginTop: 8 }}>
                        Ce modèle n&apos;a pas de corps : <a href={routes.modele(template.id)}>complétez-le</a> avant de générer.
                      </p>
                    )}
                  </>
                )}
              </Step>

              <Step n={2} title="Le contenu" sub={`${lines.length} ligne${lines.length > 1 ? 's' : ''} · ${money(totals.ttc, { exact: true })} toutes taxes`} open={open[2]} onToggle={() => toggle(2)}>
                <div className="ndp-tabs" role="tablist">
                  <button type="button" role="tab" aria-selected={mode === 'offre'} className={`ndp-tab${mode === 'offre' ? ' on' : ''}`} disabled={options.offers.length === 0} onClick={() => setMode('offre')}>Depuis une offre</button>
                  <button type="button" role="tab" aria-selected={mode === 'source'} className={`ndp-tab${mode === 'source' ? ' on' : ''}`} disabled={sources.length === 0} onClick={() => setMode('source')}>Depuis un document</button>
                  <button type="button" role="tab" aria-selected={mode === 'libre'} className={`ndp-tab${mode === 'libre' ? ' on' : ''}`} onClick={() => setMode('libre')}>Lignes libres</button>
                </div>

                {mode === 'offre' && (
                  <div>
                    <select className="sel" style={{ fontSize: '0.8125rem' }} value={offerId} onChange={(e) => setOfferId(e.target.value)} aria-label="Offre">
                      {options.offers.map((o) => (
                        <option key={o.id} value={o.id}>{o.name} · {o.priceCents != null ? `${o.priceIsFrom ? 'à partir de ' : ''}${money(o.priceCents)} ${BILLING_SUFFIX[o.billing]}` : 'sans prix'}</option>
                      ))}
                    </select>
                    {offer && (
                      <>
                        {offer.contents.length > 0 && (
                          <div className="ndp-contents">
                            <b style={{ fontSize: '0.6875rem' }}>Ce que l&apos;offre contient</b>
                            <ul>{offer.contents.map((c, i) => <li key={i}>{c}</li>)}</ul>
                          </div>
                        )}
                        {offer.groups.map((g) => (
                          <div key={g.group} className="ndp-group">
                            <div className="lbl" style={{ marginBottom: 3 }}>{g.group} — au choix</div>
                            {g.options.map((o) => (
                              <label key={o.key}>
                                <input type="radio" name={`g-${g.group}`} checked={(choices[g.group] ?? g.options[0]?.key) === o.key} onChange={() => setChoices((c) => ({ ...c, [g.group]: o.key }))} />
                                {o.label}
                              </label>
                            ))}
                          </div>
                        ))}
                        <div style={{ marginTop: 10 }}>
                          <label className="lbl" htmlFor="ndp-price" style={{ display: 'block', marginBottom: 4 }}>
                            Prix facturé ($ {BILLING_SUFFIX[offer.billing]}){offer.priceIsFrom ? '' : ' — fixe'}
                          </label>
                          <input id="ndp-price" className="fld" inputMode="decimal" value={offerPrice} disabled={!offer.priceIsFrom && offer.priceCents != null} onChange={(e) => setOfferPrice(e.target.value)} />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {mode === 'source' && (
                  <div className="ndp-sources">
                    {sources.map((s) => (
                      <button key={s.id} type="button" className={`ndp-source${sourceId === s.id ? ' on' : ''}`} onClick={() => setSourceId(s.id)}>
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>{s.ref}</span>
                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--fg3)' }}>{s.subject}</span>
                        <Badge label={STATUS_META[s.status].label} tone={STATUS_META[s.status].tone} />
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>{money(s.totalCents, { exact: true })}</span>
                      </button>
                    ))}
                    {kind === 'facture' && source && (
                      <div className="ndp-group">
                        <div className="lbl" style={{ marginBottom: 3 }}>Ce que la facture couvre</div>
                        <label><input type="radio" name="scope" checked={invoiceScope === 'total'} onChange={() => setInvoiceScope('total')} />La totalité des lignes facturables</label>
                        <label><input type="radio" name="scope" checked={invoiceScope === 'acompte'} onChange={() => setInvoiceScope('acompte')} />Un acompte de 50 % du ponctuel</label>
                      </div>
                    )}
                    {kind === 'facture' && sources.length === 0 && <div className="empty" style={{ fontSize: '0.75rem' }}>Aucun devis ni proposition acceptés pour ce compte.</div>}
                  </div>
                )}

                {mode === 'libre' && (
                  <div>
                    {freeLines.map((l, i) => (
                      <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid var(--bd)' }}>
                        <div className="ndp-line">
                          <input className="fld" placeholder="Description" aria-label="Description" value={l.description} onChange={(e) => setFree(i, { description: e.target.value })} />
                          <input className="fld" inputMode="decimal" aria-label="Quantité" value={l.quantity} onChange={(e) => setFree(i, { quantity: e.target.value })} />
                          <input className="fld" inputMode="decimal" aria-label="Prix unitaire" value={l.unitPrice} onChange={(e) => setFree(i, { unitPrice: e.target.value })} />
                          <button className="btn-icon" type="button" aria-label="Retirer la ligne" onClick={() => setFreeLines((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : [emptyLine()]))}><IcoX size={11} /></button>
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <select className="sel" style={{ fontSize: '0.6875rem', padding: '0.3rem 0.5rem' }} aria-label="Nature" value={l.kind} onChange={(e) => setFree(i, { kind: e.target.value as LineKind, unitPrice: e.target.value === 'offert' || e.target.value === 'informatif' ? '0' : l.unitPrice })}>
                            {LINE_KINDS.map((k) => <option key={k} value={k}>{LINE_KIND_LABEL[k]}</option>)}
                          </select>
                          <select className="sel" style={{ fontSize: '0.6875rem', padding: '0.3rem 0.5rem' }} aria-label="Récurrence" value={l.billing} onChange={(e) => setFree(i, { billing: e.target.value as Billing })}>
                            {BILLINGS.map((b) => <option key={b} value={b}>{b === 'ponctuel' ? 'Ponctuel' : BILLING_SUFFIX[b]}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      <button className="btn-out" type="button" onClick={() => setFreeLines((ls) => [...ls, emptyLine()])}><IcoPlus size={11} />Ligne libre</button>
                      {options.items.length > 0 && (
                        <>
                          <select className="sel" style={{ flex: 1, minWidth: 140, fontSize: '0.75rem' }} value={addItemId} onChange={(e) => setAddItemId(e.target.value)} aria-label="Article du catalogue">
                            {options.items.map((a) => <option key={a.id} value={a.id}>{a.name}{a.priceCents != null ? ` · ${money(a.priceCents)}` : ''}</option>)}
                          </select>
                          <button
                            className="btn-out"
                            type="button"
                            onClick={() => {
                              const a = options.items.find((x) => x.id === addItemId);
                              if (!a) return;
                              const line: FreeLine = { description: a.name, quantity: '1', unitPrice: fromCents(a.priceCents ?? 0), kind: 'facturable', billing: a.billing, catalogItemId: a.id };
                              setFreeLines((ls) => (ls.length === 1 && !ls[0].description.trim() ? [line] : [...ls, line]));
                            }}
                          >
                            <IcoPlus size={11} />Article
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="ndp-tot">
                  {totals.recurrent > 0 && <div className="ndp-tot-row muted"><span>Dont récurrent (hors taxes)</span><span>{money(totals.recurrent, { exact: true })}</span></div>}
                  {totals.remise > 0 && <div className="ndp-tot-row muted"><span>Remises</span><span>− {money(totals.remise, { exact: true })}</span></div>}
                  <div className="ndp-tot-row"><span>Sous-total</span><span>{money(totals.ht, { exact: true })}</span></div>
                  <div className="ndp-tot-row"><span>TPS (5 %)</span><span>{money(totals.tps, { exact: true })}</span></div>
                  <div className="ndp-tot-row"><span>TVQ (9,975 %)</span><span>{money(totals.tvq, { exact: true })}</span></div>
                  <div className="ndp-tot-row ttc"><span>Total</span><span>{money(totals.ttc, { exact: true })}</span></div>
                </div>
              </Step>

              <Step n={3} title="Les particularités" sub={subject.trim() ? subject.trim() : 'Objet à renseigner'} open={open[3]} onToggle={() => toggle(3)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label className="lbl" htmlFor="ndp-subject" style={{ display: 'block', marginBottom: 4 }}>Objet</label>
                    <input id="ndp-subject" className="fld" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex. Refonte du site web et visibilité locale" />
                  </div>
                  <div>
                    <label className="lbl" htmlFor="ndp-contact" style={{ display: 'block', marginBottom: 4 }}>Contact destinataire</label>
                    <select id="ndp-contact" className="sel" style={{ fontSize: '0.8125rem' }} value={contactId} onChange={(e) => setContactId(e.target.value)}>
                      <option value="">— Aucun —</option>
                      {options.contacts.map((c) => <option key={c.id} value={c.id}>{c.name}{c.role ? ` · ${c.role}` : ''}{c.email ? ` · ${c.email}` : ''}</option>)}
                    </select>
                    {options.contacts.length === 0 && <p style={{ fontSize: '0.6875rem', color: 'var(--yellow-fg)', marginTop: 4 }}>Ce compte n&apos;a aucun contact : ajoutez-en un avant d&apos;envoyer.</p>}
                  </div>
                  {kind !== 'facture' ? (
                    <div>
                      <label className="lbl" htmlFor="ndp-expires" style={{ display: 'block', marginBottom: 4 }}>Date d&apos;expiration</label>
                      <input id="ndp-expires" className="fld" type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
                    </div>
                  ) : (
                    <div>
                      <label className="lbl" htmlFor="ndp-terms" style={{ display: 'block', marginBottom: 4 }}>Délai de paiement (jours)</label>
                      <input id="ndp-terms" className="fld" inputMode="numeric" value={paymentTermsDays} onChange={(e) => setPaymentTermsDays(e.target.value)} />
                    </div>
                  )}
                </div>
              </Step>

              <Step n={4} title="Aperçu" sub={preview ? (preview.unfilled.length ? `${preview.unfilled.length} balise${preview.unfilled.length > 1 ? 's' : ''} sans valeur` : 'Toutes les balises sont remplies') : undefined} open={open[4]} onToggle={() => toggle(4)}>
                {previewError && <Notice tone="err">{previewError}</Notice>}
                {preview && preview.unfilled.length > 0 && (
                  <div className="dl-banner yellow" style={{ marginBottom: 10 }}>
                    <span><IcoWarn size={13} /></span>
                    <span>
                      {preview.unfilled.map((t) => `{{${t}}}`).join(', ')} : ajoutez l&apos;information manquante (contact, profil, compléments du brouillon) ou retirez la balise du modèle. Le document ne partira pas tant qu&apos;une balise reste vide.
                    </span>
                  </div>
                )}
                {previewing && !preview && <div style={{ fontSize: '0.75rem', color: 'var(--fg4)' }}>Rendu en cours…</div>}
                {preview && (
                  <div className="client-doc" style={{ padding: 0, overflow: 'hidden', opacity: previewing ? 0.6 : 1 }}>
                    <iframe className="ndp-preview" title="Aperçu du document" srcDoc={preview.page} sandbox="allow-same-origin allow-scripts" />
                  </div>
                )}
                {!preview && !previewing && !previewError && <div style={{ fontSize: '0.75rem', color: 'var(--fg4)' }}>L&apos;aperçu se rend dès que le modèle a un corps.</div>}
              </Step>
            </>
          )}
        </div>
        <div className="dl-foot" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {error && <Notice tone="err">{error}</Notice>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
            {!valid && options && (
              <span style={{ fontSize: '0.6875rem', color: 'var(--fg4)', flex: 1 }}>
                {!template ? 'Choisissez un modèle.' : !template.hasBody ? 'Le modèle n’a pas de corps.' : lines.length === 0 ? 'Ajoutez au moins une ligne.' : 'Renseignez l’objet (étape 3).'}
              </span>
            )}
            <button className="btn-out" type="button" onClick={onClose}>Annuler</button>
            <button className="btn-pri" type="button" disabled={!valid || pending} onClick={create}>
              {valid ? <IcoCheck size={12} /> : <IcoLock size={12} />}
              {pending ? 'Création…' : 'Créer le brouillon'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
