'use client';

/**
 * Les modèles de documents — session 9.3 : la liste par sorte, dans l'ordre
 * du cycle de vente, et le geste « Nouveau modèle » (vierge ou copie).
 * L'éditeur d'un modèle est `ModelEditor`.
 */
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { ActionState } from '@/app/agence/action-base';
import { Dialog, Field, Notice, SectionHead } from '@/app/agence/bits';
import { ModelEditor } from '@/app/agence/ModelEditor';
import { createTemplate, setDefaultTemplate } from '@/app/agence/modeles-actions';
import { Badge } from '@/components/ui/Atoms';
import { IcoLock, IcoPlus, IcoWarn } from '@/components/ui/Icons';
import { analyzeTemplate, isComplete } from '@/lib/documents/balises';
import { DOC_KINDS, nextRef, type DocKind, type DocTemplate, type ModelesData } from '@/lib/queries/modeles';

export const NEW_TEMPLATE = 'nouveau';

const fmtDate = (iso: string) => new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

/** Ce que la liste dit d'un modèle : sans corps, incomplet, ou prêt. */
export function templateStatus(t: DocTemplate): { label: string; tone: 'yellow' | 'red' } | null {
  if (!t.bodyHtml) return { label: 'Sans corps', tone: 'red' };
  const a = analyzeTemplate(t.bodyHtml, t.sections.map((s) => s.key));
  return isComplete(a) ? null : { label: 'Incomplet', tone: 'yellow' };
}

function NewModelDialog({
  templates,
  onClose,
  onCreated,
}: {
  templates: DocTemplate[];
  onClose: () => void;
  onCreated: (id: string, message: string) => void;
}) {
  const [kind, setKind] = useState<DocKind>('proposition');
  const [base, setBase] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const siblings = templates.filter((t) => t.kind === kind);

  const create = () =>
    startTransition(async () => {
      const r = await createTemplate(kind, base || null);
      if (r.ok) onCreated(r.id, r.message);
      else setError(r.message);
    });

  return (
    <Dialog title="Nouveau modèle" onClose={onClose}>
      {error && <Notice tone="err">{error}</Notice>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Sorte de document" htmlFor="nm-kind">
          <select
            id="nm-kind"
            className="sel"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as DocKind);
              setBase('');
            }}
            style={{ fontSize: '0.8125rem' }}
          >
            {DOC_KINDS.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Partir de" htmlFor="nm-base" hint="Une copie reprend le corps, les textes et les sections du modèle choisi.">
          <select id="nm-base" className="sel" value={base} onChange={(e) => setBase(e.target.value)} style={{ fontSize: '0.8125rem' }}>
            <option value="">Page vierge</option>
            {siblings.map((t) => (
              <option key={t.id} value={t.id}>Copie de « {t.name} »</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="st-dlg-actions">
        <button className="btn-out" type="button" onClick={onClose}>Annuler</button>
        <button className="btn-pri" type="button" disabled={pending} onClick={create}>
          <IcoPlus size={12} />
          {pending ? 'Création…' : 'Créer le modèle'}
        </button>
      </div>
    </Dialog>
  );
}

export function ModelesPanel({
  data,
  canManage,
  openId,
  onOpen,
}: {
  data: ModelesData;
  canManage: boolean;
  /** Le modèle ouvert dans l'éditeur, ou null pour la liste. */
  openId: string | null;
  onOpen: (id: string | null) => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<ActionState>(null);
  const year = new Date().getFullYear();

  const opened = openId ? data.templates.find((t) => t.id === openId) : null;
  if (opened) {
    return (
      <ModelEditor
        key={opened.id}
        template={opened}
        samples={data.samples}
        canManage={canManage}
        onBack={() => onOpen(null)}
      />
    );
  }

  const makeDefault = (id: string) =>
    startTransition(async () => {
      const r = await setDefaultTemplate(id);
      setNotice(r);
      if (r?.ok) router.refresh();
    });

  if (data.templates.length === 0) {
    return (
      <div>
        <SectionHead title="Modèles de documents" sub="Le HTML de chaque sorte de document, ses balises, son aperçu." />
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--fg3)', fontSize: '0.8125rem' }}>
          Rien à afficher. Connectez-vous avec un compte rattaché à l&apos;agence pour voir ses modèles.
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHead
        title="Modèles de documents"
        sub="Propositions, devis, contrats, annexes, avenants, factures — le contenu que le générateur remplit. Un modèle vit ici, pas dans le code."
        action={
          <button
            className={canManage ? 'btn-pri' : 'btn-out'}
            type="button"
            disabled={!canManage}
            title={canManage ? undefined : 'Verrouillé — droit « Gérer le catalogue » requis'}
            onClick={() => setCreating(true)}
          >
            {canManage ? <IcoPlus size={12} /> : <IcoLock size={12} />}
            Nouveau modèle
          </button>
        }
      />
      {!canManage && (
        <Notice tone="warn">
          Vous consultez les modèles en lecture seule. Le droit « Gérer le catalogue » est requis pour les modifier.
        </Notice>
      )}
      <Notice state={notice} />
      {DOC_KINDS.map((k) => {
        const items = data.templates.filter((t) => t.kind === k.id);
        return (
          <div key={k.id} className="tpl-list-group">
            <div className="tpl-list-h">
              <b>{k.label}</b>
              <span>{items.length} modèle{items.length !== 1 ? 's' : ''}</span>
            </div>
            {items.length === 0 ? (
              <div className="card" style={{ padding: '1rem 1.125rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--yellow-fg)', flexShrink: 0, display: 'flex' }}><IcoWarn size={14} /></span>
                <div style={{ flex: 1, minWidth: 200, fontSize: '0.8125rem', color: 'var(--fg2)' }}>
                  Aucun modèle de {k.label.toLowerCase()}. Les {k.plural} ne pourront pas être générés.
                </div>
                {canManage && (
                  <button className="btn-out" type="button" onClick={() => setCreating(true)}>Créer un modèle</button>
                )}
              </div>
            ) : (
              <div className="card" style={{ padding: '0 1.125rem' }}>
                {items.map((t) => {
                  const status = templateStatus(t);
                  return (
                    <div key={t.id} className="tpl-row">
                      <button type="button" className="tpl-row-main" onClick={() => onOpen(t.id)}>
                        <div className="tpl-row-name">
                          {t.name}
                          {t.isDefault && <Badge label="Par défaut" tone="green" />}
                          {status && <Badge label={status.label} tone={status.tone} />}
                        </div>
                        <div className="tpl-row-meta">
                          <span>{nextRef(t, year)} sera le prochain</span>
                          <span>Délai de paiement : {t.paymentTermsDays ? `${t.paymentTermsDays} j` : '—'}</span>
                          <span>{t.documentsCount} document{t.documentsCount > 1 ? 's' : ''} produit{t.documentsCount > 1 ? 's' : ''}</span>
                          {t.sections.length > 0 && <span>{t.sections.length} section{t.sections.length > 1 ? 's' : ''}</span>}
                          <span>Modifié le {fmtDate(t.updatedAt)}</span>
                        </div>
                      </button>
                      {canManage && !t.isDefault && items.length > 1 && (
                        <button className="btn-out" type="button" style={{ padding: '0.3rem 0.7rem', fontSize: '0.6875rem' }} onClick={() => makeDefault(t.id)}>
                          Rendre par défaut
                        </button>
                      )}
                      <button className="btn-out" type="button" style={{ padding: '0.3rem 0.7rem', fontSize: '0.6875rem' }} onClick={() => onOpen(t.id)}>
                        {canManage ? 'Modifier' : 'Consulter'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {creating && (
        <NewModelDialog
          templates={data.templates}
          onClose={() => setCreating(false)}
          onCreated={(id, message) => {
            setCreating(false);
            setNotice({ ok: true, message, at: Date.now() });
            router.refresh();
            onOpen(id);
          }}
        />
      )}
    </div>
  );
}
