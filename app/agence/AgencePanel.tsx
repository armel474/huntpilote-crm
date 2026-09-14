'use client';

import { useActionState } from 'react';
import { saveAgencyProfile } from '@/app/agence/actions';
import { Field, Notice, SectionHead } from '@/app/agence/bits';
import { IcoCheck, IcoLock } from '@/components/ui/Icons';
import { UploadZone } from '@/components/ui/UploadZone';
import type { AgencyProfile } from '@/lib/queries/agence';

export function AgencePanel({ agency, canEdit }: { agency: AgencyProfile | null; canEdit: boolean }) {
  const [state, action, pending] = useActionState(saveAgencyProfile, null);
  const v = (x: string | null | undefined) => x ?? '';
  const missingTax = agency && (!agency.gstNumber || !agency.qstNumber);
  const ro = !canEdit;

  return (
    <form action={action} key={agency?.id ?? 'none'}>
      <SectionHead
        title="Profil de l'agence"
        sub="Ces informations apparaissent sur les propositions, devis, contrats et factures envoyés aux clients."
        action={
          <button
            className={ro ? 'btn-out' : 'btn-pri'}
            type="submit"
            disabled={!agency || ro || pending}
            title={ro ? 'Verrouillé — droit « Gérer l’agence » requis' : undefined}
          >
            {ro ? <IcoLock size={12} /> : <IcoCheck size={12} />}
            {pending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        }
      />
      {!agency && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--fg3)', fontSize: '0.8125rem', marginBottom: 14 }}>
          Rien à afficher. Connectez-vous avec un compte rattaché à l&apos;agence pour voir son profil.
        </div>
      )}
      <Notice state={state} />
      {missingTax && (
        <Notice tone="warn">
          Les numéros d&apos;inscription à la TPS et à la TVQ ne sont pas saisis. Une facture qui réclame les
          taxes doit les afficher, sinon le client ne peut pas récupérer ses crédits.
        </Notice>
      )}
      {agency && ro && (
        <Notice tone="warn">
          Vous pouvez consulter le profil, mais seule une personne qui gère l&apos;agence peut le modifier.
        </Notice>
      )}
      <div className="card" style={{ padding: '1.25rem', marginBottom: 14 }}>
        <div style={{ paddingBottom: 18, borderBottom: '1px solid var(--bd)', marginBottom: 18 }}>
          <UploadZone
            name="logo_url"
            kind="logo"
            value={agency?.logoUrl ?? null}
            folder={agency?.id ?? 'sans-agence'}
            disabled={ro || !agency}
            requireSquare
          />
          <p style={{ fontSize: '0.6875rem', color: 'var(--fg4)', marginTop: 8 }}>
            Le logo apparaît sur les propositions, devis, contrats et factures — c&apos;est ce qui motive à le fournir.
            Il s&apos;enregistre avec le reste du profil.
          </p>
        </div>

        <div className="st-grid2">
          <Field label="Nom de l'agence" htmlFor="st-name">
            <input id="st-name" name="name" className="fld" defaultValue={v(agency?.name)} readOnly={ro} required />
          </Field>
          <Field label="Raison sociale" htmlFor="st-legal">
            <input id="st-legal" name="legal_name" className="fld" defaultValue={v(agency?.legalName)} readOnly={ro} />
          </Field>
          <Field label="Site web" htmlFor="st-web">
            <input id="st-web" name="website" className="fld" defaultValue={v(agency?.website)} readOnly={ro} />
          </Field>
          <Field label="Courriel de contact" htmlFor="st-mail">
            <input id="st-mail" name="email" type="email" className="fld" defaultValue={v(agency?.email)} readOnly={ro} />
          </Field>
          <Field label="Téléphone" htmlFor="st-tel">
            <input id="st-tel" name="phone" className="fld" defaultValue={v(agency?.phone)} readOnly={ro} />
          </Field>
          <Field label="Adresse" htmlFor="st-adr">
            <input id="st-adr" name="address" className="fld" defaultValue={v(agency?.address)} readOnly={ro} />
          </Field>
          <Field label="Ville" htmlFor="st-city">
            <input id="st-city" name="city" className="fld" defaultValue={v(agency?.city)} readOnly={ro} />
          </Field>
          <div className="st-grid2">
            <Field label="Province" htmlFor="st-prov">
              <input id="st-prov" name="province" className="fld" defaultValue={v(agency?.province)} readOnly={ro} />
            </Field>
            <Field label="Code postal" htmlFor="st-pc">
              <input id="st-pc" name="postal_code" className="fld" defaultValue={v(agency?.postalCode)} readOnly={ro} />
            </Field>
          </div>
          <Field label="Numéro de TPS" htmlFor="st-gst" hint="Format : 123456789 RT0001">
            <input id="st-gst" name="gst_number" className="fld" defaultValue={v(agency?.gstNumber)} placeholder="À saisir" readOnly={ro} />
          </Field>
          <Field label="Numéro de TVQ" htmlFor="st-qst" hint="Format : 1234567890 TQ0001">
            <input id="st-qst" name="qst_number" className="fld" defaultValue={v(agency?.qstNumber)} placeholder="À saisir" readOnly={ro} />
          </Field>
          <Field label="NEQ" htmlFor="st-neq" hint="Numéro d’entreprise du Québec — dix chiffres, affiché au contrat">
            <input id="st-neq" name="neq" className="fld" defaultValue={v(agency?.neq)} placeholder="1234567890" inputMode="numeric" pattern="[0-9]{10}" readOnly={ro} />
          </Field>
          <Field label="District judiciaire" htmlFor="st-district" hint="Clause de juridiction du contrat">
            <input id="st-district" name="judicial_district" className="fld" defaultValue={v(agency?.judicialDistrict)} placeholder="Ex. Rimouski" readOnly={ro} />
          </Field>
          <Field label="Représentant" htmlFor="st-rep" hint="Qui signe pour l’agence">
            <input id="st-rep" name="representative_name" className="fld" defaultValue={v(agency?.representativeName)} readOnly={ro} />
          </Field>
          <Field label="Titre du représentant" htmlFor="st-rep-title">
            <input id="st-rep-title" name="representative_title" className="fld" defaultValue={v(agency?.representativeTitle)} placeholder="Ex. Propriétaire" readOnly={ro} />
          </Field>
          <Field label="Instructions de paiement par défaut" htmlFor="st-pay" span hint="Reprises par les modèles de documents ; un modèle peut les surcharger.">
            <textarea id="st-pay" name="payment_instructions" className="fld" rows={3} style={{ resize: 'vertical', fontFamily: 'var(--font)' }} defaultValue={v(agency?.paymentInstructions)} readOnly={ro} />
          </Field>
        </div>
      </div>
    </form>
  );
}
