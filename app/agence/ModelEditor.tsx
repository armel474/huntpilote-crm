'use client';

/**
 * L'éditeur d'un modèle de document — session 9.3. Trois zones : les
 * réglages et les sections (colonne étroite), le corps HTML avec ce que son
 * analyse a trouvé (colonne principale), l'aperçu rempli avec des données
 * réelles (colonne large, dépliable).
 *
 * Pas un éditeur visuel : l'agence produit son HTML ailleurs et le colle
 * ici. Une balise inconnue n'empêche pas d'enregistrer, mais le modèle est
 * marqué incomplet. Enregistrer ne change aucun document déjà produit.
 */
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { Field, Notice, SectionHead } from '@/app/agence/bits';
import { Switch } from '@/app/agence/OfferCard';
import { saveTemplate } from '@/app/agence/modeles-actions';
import { Badge } from '@/components/ui/Atoms';
import { IcoArrowL, IcoCheck, IcoChevD, IcoDown, IcoLock, IcoPlus, IcoUp, IcoX } from '@/components/ui/Icons';
import { previewDocument } from '@/lib/documents/apercu';
import {
  BLOCKS,
  CONDITION_GROUPS,
  ITEM_META,
  TAG_GROUPS,
  analyzeTemplate,
  convertLegacy,
  isComplete,
  type DocData,
} from '@/lib/documents/balises';
import { DOC_KINDS, nextRef, type DocTemplate, type SampleDoc, type TemplateSection } from '@/lib/queries/modeles';

type Draft = {
  name: string;
  prefix: string;
  includeYear: boolean;
  numberPadding: number;
  paymentTermsDays: number;
  isDefault: boolean;
  intro: string;
  legalMentions: string;
  footer: string;
  paymentInstructions: string;
  bodyHtml: string;
  sections: (TemplateSection & { clientKey: string })[];
};

let counter = 0;
const uid = () => `s${++counter}-${Math.random().toString(36).slice(2, 7)}`;

function toDraft(t: DocTemplate): Draft {
  return {
    name: t.name,
    prefix: t.prefix ?? '',
    includeYear: t.includeYear,
    numberPadding: t.numberPadding,
    paymentTermsDays: t.paymentTermsDays,
    isDefault: t.isDefault,
    intro: t.intro ?? '',
    legalMentions: t.legalMentions ?? '',
    footer: t.footer ?? '',
    paymentInstructions: t.paymentInstructions ?? '',
    bodyHtml: t.bodyHtml ?? '',
    sections: t.sections.map((s) => ({ ...s, clientKey: uid() })),
  };
}

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

function CodeEditor({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const lines = (value.match(/\n/g) || []).length + 1;
  const sync = () => {
    if (gutterRef.current && taRef.current) gutterRef.current.scrollTop = taRef.current.scrollTop;
  };
  return (
    <div className="code-wrap">
      <div className="code-gutter" ref={gutterRef} aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => i + 1).join('\n')}
      </div>
      <textarea
        ref={taRef}
        className="code-ta"
        name="body_html"
        spellCheck={false}
        value={value}
        disabled={disabled}
        aria-label="Corps HTML du modèle"
        placeholder="Collez ici le HTML du modèle. Les balises s'écrivent {{groupe.champ}}, les blocs {{#bloc}} … {{/bloc}}."
        onScroll={sync}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TagDictionary({ sections, onClose }: { sections: TemplateSection[]; onClose: () => void }) {
  const [copied, setCopied] = useState('');
  const copy = (t: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(t).catch(() => {});
    setCopied(t);
    setTimeout(() => setCopied(''), 1200);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const chip = (tag: string, example: string) => (
    <button key={tag} type="button" className="tag-chip" onClick={() => copy(tag)} title="Copier">
      <span>{tag}</span>
      <small>{copied === tag ? 'Copié' : example}</small>
    </button>
  );
  return (
    <div className="dl-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dl-sheet" role="dialog" aria-modal="true" aria-label="Dictionnaire des balises">
        <div className="dl-head">
          <div style={{ flex: 1, fontSize: '0.9375rem', fontWeight: 800 }}>Dictionnaire des balises</div>
          <button className="btn-icon" type="button" onClick={onClose} aria-label="Fermer"><IcoX size={13} /></button>
        </div>
        <div className="dl-body">
          <p style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginBottom: 12, lineHeight: 1.5 }}>
            Une valeur s&apos;écrit <code>{'{{groupe.champ}}'}</code>. Un bloc <code>{'{{#bloc}} … {{/bloc}}'}</code> se répète sur une
            liste, se rend une fois sur une valeur pleine, disparaît sur une valeur vide ; <code>{'{{^bloc}} … {{/bloc}}'}</code> fait
            l&apos;inverse. Cliquez une balise pour la copier.
          </p>
          {sections.length > 0 && (
            <div className="tag-group">
              <div className="tag-group-h">Sections de ce modèle</div>
              {sections.map((s) => chip(`{{section.${s.key}}}`, s.title))}
            </div>
          )}
          {TAG_GROUPS.map((g) => (
            <div key={g.id} className="tag-group">
              <div className="tag-group-h">{g.label}</div>
              {CONDITION_GROUPS.includes(g.id) && chip(`{{#${g.id}}} … {{/${g.id}}}`, 'condition')}
              {g.tags.map(([t, ex]) => chip(`{{${t}}}`, ex))}
            </div>
          ))}
          {Object.entries(BLOCKS).map(([name, b]) => (
            <div key={name} className="tag-group">
              <div className="tag-group-h">Bloc {name} — {b.label}</div>
              {chip(`{{#${name}}} … {{/${name}}}`, 'répété')}
              {b.fields.map(([t, ex]) => chip(`{{${t}}}`, ex))}
              {Object.entries(b.nested ?? {}).map(([sub, n]) => (
                <div key={sub} style={{ paddingLeft: 10 }}>
                  {chip(`{{#${b.item}.${sub}}} … {{/${b.item}.${sub}}}`, n.label)}
                  {n.fields.map(([t, ex]) => chip(`{{${t}}}`, ex))}
                </div>
              ))}
            </div>
          ))}
          <div className="tag-group">
            <div className="tag-group-h">Dans un bloc répété</div>
            {ITEM_META.map(([t, ex]) => chip(t === 'index' ? '{{index}}' : `{{#${t}}} … {{/${t}}}`, ex))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── L'éditeur ── */

export function ModelEditor({
  template,
  samples,
  canManage,
  onBack,
}: {
  template: DocTemplate;
  samples: SampleDoc[];
  canManage: boolean;
  onBack: () => void;
}) {
  const router = useRouter();
  const initial = useMemo(() => toDraft(template), [template]);
  const [d, setD] = useState<Draft>(initial);
  const [baseline, setBaseline] = useState(initial);
  const [open, setOpen] = useState<Record<string, boolean>>({ reglages: true, textes: false, sections: true });
  const [sampleId, setSampleId] = useState(samples[0]?.id ?? '');
  const [dictOpen, setDictOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [state, action, pending] = useActionState(saveTemplate, null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ro = !canManage;
  const dirty = JSON.stringify(d) !== JSON.stringify(baseline);
  const kind = DOC_KINDS.find((k) => k.id === template.kind);
  const year = new Date().getFullYear();

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
      setBaseline(d);
      router.refresh();
    } else if (state.message.startsWith('Le modèle est enregistré, mais')) {
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.at]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));
  const back = () => {
    if (dirty && !window.confirm('Des modifications ne sont pas enregistrées. Quitter sans enregistrer ?')) return;
    onBack();
  };

  const analysis = useMemo(() => analyzeTemplate(d.bodyHtml, d.sections.map((s) => s.key)), [d.bodyHtml, d.sections]);
  const complete = d.bodyHtml.trim() !== '' && isComplete(analysis);
  const sample = samples.find((s) => s.id === sampleId) ?? samples[0];
  const previewData = useMemo<DocData>(() => {
    const base = sample?.data ?? {};
    const doc = (base.document ?? {}) as DocData;
    return {
      ...base,
      document: {
        ...doc,
        reference: nextRef({ prefix: d.prefix, includeYear: d.includeYear, numberPadding: d.numberPadding, documentsCount: template.documentsCount }, year),
        introduction: d.intro,
        mentions: d.legalMentions,
        pied: d.footer,
        paiement: d.paymentInstructions,
      },
      section: Object.fromEntries(d.sections.map((s) => [s.key, s.defaultBody])),
    };
  }, [sample, d, template.documentsCount, year]);
  const preview = useMemo(() => previewDocument(d.bodyHtml, previewData, { fit: true, title: d.name || 'Aperçu' }), [d.bodyHtml, d.name, previewData]);

  const printIt = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(previewDocument(d.bodyHtml, previewData, { highlightUnfilled: false, title: d.name || 'Aperçu impression' }));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  const pasteFile = (file: File | undefined) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const html = String(r.result ?? '');
      // Un fichier complet : on ne garde que ce qui va dans le corps.
      const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1];
      const styles = html.match(/<style[\s\S]*?<\/style>/gi)?.join('\n') ?? '';
      set('bodyHtml', body ? `${styles}\n${body}`.trim() : html);
    };
    r.readAsText(file);
  };

  const updSection = (key: string, patch: Partial<TemplateSection>) =>
    set('sections', d.sections.map((s) => (s.clientKey === key ? { ...s, ...patch, ...(patch.lockedByAgency ? { aiAssist: false } : {}) } : s)));
  const moveSection = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= d.sections.length) return;
    const next = [...d.sections];
    [next[i], next[j]] = [next[j], next[i]];
    set('sections', next);
  };
  const addSection = () =>
    set('sections', [
      ...d.sections,
      { clientKey: uid(), id: null, key: `section_${d.sections.length + 1}`, title: 'Nouvelle section', position: d.sections.length + 1, defaultBody: '', optional: false, aiAssist: true, lockedByAgency: false, maxChars: null },
    ]);

  const usedNote = template.documentsCount > 0
    ? `Déjà utilisé pour ${template.documentsCount} document${template.documentsCount > 1 ? 's' : ''} — enregistrer ne change pas ceux déjà produits.`
    : undefined;

  return (
    <form action={action}>
      <input type="hidden" name="template_id" value={template.id} />
      <input type="hidden" name="sections" value={JSON.stringify(d.sections.map(({ clientKey: _k, ...s }) => s))} />
      <input type="hidden" name="include_year" value={d.includeYear ? '1' : '0'} />
      <input type="hidden" name="is_default" value={d.isDefault ? '1' : '0'} />
      <button type="button" className="btn-out" style={{ marginBottom: 14 }} onClick={back}>
        <IcoArrowL size={12} />
        Retour aux modèles
      </button>
      <SectionHead
        title={d.name || 'Modèle'}
        sub={dirty ? 'Modifications non enregistrées' : (usedNote ?? `${kind?.label ?? template.kind} · ${nextRef({ ...d, documentsCount: template.documentsCount }, year)} sera le prochain numéro`)}
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn-out" onClick={() => setDictOpen(true)}>Dictionnaire des balises</button>
            {ro ? (
              <button type="button" className="btn-out" disabled title="Verrouillé — droit « Gérer le catalogue » requis">
                <IcoLock size={12} />
                Enregistrer le modèle
              </button>
            ) : (
              <button type="submit" className="btn-pri" disabled={!dirty || pending}>
                {pending ? 'Enregistrement…' : <><IcoCheck size={12} />Enregistrer le modèle</>}
              </button>
            )}
          </div>
        }
      />
      {ro && (
        <Notice tone="warn">
          Vous consultez ce modèle en lecture seule — l&apos;aperçu et le dictionnaire restent utiles. Le droit « Gérer le catalogue » est requis pour le modifier.
        </Notice>
      )}
      {dirty && usedNote && <Notice tone="warn">{usedNote}</Notice>}
      <Notice state={state} />

      <div className={`tpl-cols${fullscreen ? ' fs-preview' : ''}`}>
        <div>
          <Section title="Réglages" open={open.reglages} onToggle={() => toggle('reglages')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Field label="Nom" htmlFor="tp-name">
                <input id="tp-name" name="name" className="fld" value={d.name} disabled={ro} onChange={(e) => set('name', e.target.value)} />
              </Field>
              <Field label="Sorte" hint="Figée après création.">
                <div className="fld" style={{ background: 'var(--bg-muted)', color: 'var(--fg3)' }}>{kind?.label ?? template.kind}</div>
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label="Préfixe" htmlFor="tp-prefix">
                  <input id="tp-prefix" name="prefix" className="fld" value={d.prefix} disabled={ro} onChange={(e) => set('prefix', e.target.value.toUpperCase())} />
                </Field>
                <Field label="Largeur du numéro" htmlFor="tp-pad">
                  <input id="tp-pad" name="number_padding" className="fld" type="number" min={1} max={8} value={d.numberPadding} disabled={ro} onChange={(e) => set('numberPadding', Number(e.target.value) || 1)} />
                </Field>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                <Switch on={d.includeYear} disabled={ro} label="Inclure l’année" onToggle={() => set('includeYear', !d.includeYear)} />
                Inclure l&apos;année dans le numéro
              </label>
              <div style={{ fontSize: '0.6875rem', color: 'var(--fg4)', padding: '8px 10px', background: 'var(--bg-muted)', borderRadius: 8 }}>
                {nextRef({ ...d, documentsCount: template.documentsCount }, year)} sera le prochain numéro.
              </div>
              <Field label="Délai de paiement (jours)" htmlFor="tp-terms" hint="Pose l’échéance d’une facture, donc ce qui la déclare en retard.">
                <input id="tp-terms" name="payment_terms_days" className="fld" type="number" min={0} value={d.paymentTermsDays} disabled={ro} onChange={(e) => set('paymentTermsDays', Math.max(0, Number(e.target.value) || 0))} />
              </Field>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                <Switch on={d.isDefault} disabled={ro || template.isDefault} label="Modèle par défaut" onToggle={() => set('isDefault', !d.isDefault)} />
                Modèle par défaut pour « {kind?.label ?? template.kind} »
              </label>
            </div>
          </Section>

          <Section title="Textes du modèle" sub="Des balises comme les autres — leur valeur vit dans le modèle" open={open.textes} onToggle={() => toggle('textes')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {([
                ['intro', 'Introduction — {{document.introduction}}', 'intro'],
                ['legalMentions', 'Mentions légales — {{document.mentions}}', 'legal_mentions'],
                ['footer', 'Pied de page — {{document.pied}}', 'footer'],
                ['paymentInstructions', 'Instructions de paiement — {{document.paiement}}', 'payment_instructions'],
              ] as const).map(([k, label, name]) => (
                <Field key={k} label={label} htmlFor={`tp-${name}`}>
                  <textarea id={`tp-${name}`} name={name} className="fld" rows={3} style={{ resize: 'vertical', fontFamily: 'var(--font)' }} value={d[k]} disabled={ro} onChange={(e) => set(k, e.target.value)} />
                </Field>
              ))}
            </div>
          </Section>

          <Section
            title="Sections du modèle"
            sub={d.sections.length ? `${d.sections.length} section${d.sections.length > 1 ? 's' : ''} rédigée${d.sections.length > 1 ? 's' : ''} par client` : 'Ce qui se rédige par client'}
            open={open.sections}
            onToggle={() => toggle('sections')}
          >
            <p style={{ fontSize: '0.6875rem', color: 'var(--fg4)', marginBottom: 10, lineHeight: 1.5 }}>
              Une section se place dans le corps avec <code>{'{{section.cle}}'}</code>. Son guide de rédaction est copié dans chaque document ;
              une section optionnelle disparaît quand elle reste vide.
            </p>
            {d.sections.map((s, i) => {
              const placed = analysis.sectionsUsed.includes(s.key);
              return (
                <div key={s.clientKey} className="tpl-section">
                  <div className="tpl-section-h">
                    <code title={placed ? 'Placée dans le corps' : 'Absente du corps'}>{`{{section.${s.key}}}`}</code>
                    {!placed && <Badge label="non placée" tone="yellow" />}
                    {!ro && (
                      <div className="cat-tools">
                        {i > 0 && <button type="button" className="btn-icon" onClick={() => moveSection(i, -1)} aria-label="Monter"><IcoUp size={11} /></button>}
                        {i < d.sections.length - 1 && <button type="button" className="btn-icon" onClick={() => moveSection(i, 1)} aria-label="Descendre"><IcoDown size={11} /></button>}
                        <button type="button" className="btn-icon" onClick={() => set('sections', d.sections.filter((x) => x.clientKey !== s.clientKey))} aria-label="Retirer"><IcoX size={11} /></button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <input className="fld" value={s.key} disabled={ro} aria-label="Clé" onChange={(e) => updSection(s.clientKey, { key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })} />
                    <input className="fld" value={s.title} disabled={ro} aria-label="Titre" onChange={(e) => updSection(s.clientKey, { title: e.target.value })} />
                  </div>
                  <textarea className="fld" rows={3} style={{ resize: 'vertical', fontFamily: 'ui-monospace, monospace', fontSize: '0.6875rem' }} placeholder="Guide de rédaction (HTML) copié dans chaque document" value={s.defaultBody} disabled={ro} aria-label="Guide de rédaction" onChange={(e) => updSection(s.clientKey, { defaultBody: e.target.value })} />
                  <div className="tpl-flags">
                    <label><input type="checkbox" checked={s.optional} disabled={ro} onChange={(e) => updSection(s.clientKey, { optional: e.target.checked })} />Optionnelle</label>
                    <label><input type="checkbox" checked={s.aiAssist} disabled={ro || s.lockedByAgency} onChange={(e) => updSection(s.clientKey, { aiAssist: e.target.checked })} />IA peut proposer</label>
                    <label><input type="checkbox" checked={s.lockedByAgency} disabled={ro} onChange={(e) => updSection(s.clientKey, { lockedByAgency: e.target.checked })} />Verrouillée</label>
                    <label>
                      <input className="fld" type="number" min={1} style={{ width: 70, padding: '2px 6px' }} placeholder="max." value={s.maxChars ?? ''} disabled={ro} onChange={(e) => updSection(s.clientKey, { maxChars: e.target.value === '' ? null : Number(e.target.value) })} />
                      caractères
                    </label>
                  </div>
                </div>
              );
            })}
            {!ro && (
              <button type="button" className="cat-add-btn" onClick={addSection}><IcoPlus size={11} />Section</button>
            )}
          </Section>
        </div>

        <div>
          <div className="analysis-bar" aria-live="polite">
            {d.bodyHtml.trim() === '' ? (
              <span className="err">Aucun corps : ce modèle ne peut pas servir au générateur.</span>
            ) : (
              <>
                <span className="ok">{analysis.known.length} balise{analysis.known.length > 1 ? 's' : ''} reconnue{analysis.known.length > 1 ? 's' : ''}</span>
                {analysis.blocks.length > 0 && <span>{analysis.blocks.length} bloc{analysis.blocks.length > 1 ? 's' : ''} : {analysis.blocks.slice(0, 6).map((b) => `{{#${b}}}`).join(', ')}{analysis.blocks.length > 6 ? '…' : ''}</span>}
                {analysis.unknown.length > 0 && (
                  <div className="analysis-unk">
                    <span className="warn">{analysis.unknown.length} balise{analysis.unknown.length > 1 ? 's' : ''} inconnue{analysis.unknown.length > 1 ? 's' : ''} :</span>
                    {analysis.unknown.map((u) => (
                      <button key={u.tag} type="button" onClick={() => setDictOpen(true)} title={u.suggestion ? `Vouliez-vous dire {{${u.suggestion}}} ?` : 'Aucune suggestion — voir le dictionnaire'}>
                        {`{{${u.tag}}}`}{u.suggestion ? ` → {{${u.suggestion}}}` : ''}
                      </button>
                    ))}
                  </div>
                )}
                {analysis.legacy.length > 0 && (
                  <div className="analysis-unk">
                    <span className="warn">{analysis.legacy.length} balise{analysis.legacy.length > 1 ? 's' : ''} d’ancienne forme :</span>
                    {analysis.legacy.slice(0, 5).map((l) => (
                      <button key={l.raw} type="button" title={l.canonical ? `Devient {{${l.canonical}}}` : 'Sans équivalent connu'}>{l.raw}</button>
                    ))}
                    {analysis.legacy.length > 5 && <span>…</span>}
                    {!ro && (
                      <button type="button" className="btn-out" style={{ padding: '0.25rem 0.6rem', fontSize: '0.6875rem' }} onClick={() => set('bodyHtml', convertLegacy(d.bodyHtml))}>
                        Convertir en balises canoniques
                      </button>
                    )}
                  </div>
                )}
                {analysis.sectionsMissing.length > 0 && (
                  <span className="warn">Sections désignées sans être déclarées : {analysis.sectionsMissing.map((k) => `{{section.${k}}}`).join(', ')}</span>
                )}
                {analysis.unbalanced.length > 0 && <span className="err">Bloc mal fermé : {analysis.unbalanced.join(', ')}</span>}
                {complete && <Badge label="Complet — prêt pour le générateur" tone="green" />}
                {!complete && <Badge label="Incomplet — le générateur le refusera" tone="yellow" />}
              </>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
            <input ref={fileRef} type="file" accept=".html,text/html" style={{ display: 'none' }} onChange={(e) => { pasteFile(e.target.files?.[0]); e.target.value = ''; }} />
            {!ro && (
              <button type="button" className="btn-out" onClick={() => fileRef.current?.click()}>Coller un fichier HTML</button>
            )}
          </div>
          <CodeEditor value={d.bodyHtml} onChange={(v) => set('bodyHtml', v)} disabled={ro} />
        </div>

        <div className="tpl-preview-col">
          <div className="tpl-print-bar">
            <select className="sel" value={sample?.id ?? ''} onChange={(e) => setSampleId(e.target.value)} aria-label="Client d’exemple" style={{ fontSize: '0.75rem', maxWidth: 320 }}>
              {samples.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="btn-out" style={{ padding: '0.3rem 0.7rem', fontSize: '0.6875rem' }} onClick={() => setFullscreen((f) => !f)}>
                {fullscreen ? 'Réduire' : 'Plein écran'}
              </button>
              <button type="button" className="btn-out" style={{ padding: '0.3rem 0.7rem', fontSize: '0.6875rem' }} onClick={printIt} disabled={!d.bodyHtml.trim()}>
                Aperçu impression
              </button>
            </div>
          </div>
          <div className="client-doc" style={{ padding: 0, overflow: 'hidden' }}>
            {d.bodyHtml.trim() ? (
              <iframe className="tpl-frame" title="Aperçu du modèle rempli" srcDoc={preview} sandbox="allow-same-origin allow-scripts" />
            ) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#71717A', fontSize: '0.8125rem' }}>
                L&apos;aperçu apparaît dès que le modèle a un corps.
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--fg4)', marginTop: 8 }}>
            Rempli avec des données réelles de la base. Une balise surlignée est restée sans valeur : soit la donnée manque, soit la balise est
            inconnue.
          </p>
        </div>
      </div>
      {dictOpen && <TagDictionary sections={d.sections} onClose={() => setDictOpen(false)} />}
    </form>
  );
}
