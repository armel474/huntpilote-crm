/**
 * Le pipeline lu dans la base — les opportunités ouvertes ou gagnées de
 * l'agence, mises à la forme que le Kanban et le panneau de détail
 * attendent déjà (`Deal`, `DealDetail`).
 *
 * Ce que le fichier de démonstration figeait se calcule ici : les jours
 * passés dans l'étape, la probabilité par défaut, le responsable et sa
 * couleur. Les deals perdus ne sont pas chargés : ils restent au journal,
 * pas sur le tableau.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { routes } from '@/lib/routes';
import {
  type DealDoc,
  NO_OWNER,
  OWNER_COLORS,
  STAGE_PROBABILITY,
  type Deal,
  type DealDetail,
  type Exchange,
  type ExchangeChannel,
  type Owners,
  type StageId,
} from '@/lib/data/pipeline';

type Db = SupabaseClient<Database>;

export type PipelineData = {
  deals: Deal[];
  owners: Owners;
  details: Record<string, DealDetail>;
};

const fmtLong = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtShort = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'short' });
const fmtTime = new Intl.DateTimeFormat('fr-CA', { hour: '2-digit', minute: '2-digit', hour12: false });

const dateOf = (d: string) => new Date(d.includes('T') ? d : `${d}T00:00:00`);

/** « 8 sept., 14 h 00 » — la forme du fil d'échanges. */
function whenLabel(iso: string): string {
  const d = new Date(iso);
  return `${fmtShort.format(d)}, ${fmtTime.format(d).replace(':', ' h ')}`;
}

function daysSince(dateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - dateOf(dateIso).getTime()) / 86_400_000));
}

const DEAL_CHANNELS: ExchangeChannel[] = ['appel', 'courriel', 'reunion', 'note'];

const QUOTE_STATUS_LABEL: Record<string, string> = { brouillon: 'Brouillon', envoye: 'Envoyé', accepte: 'Accepté', refuse: 'Refusé', expire: 'Expiré' };

const DOC_KIND_LABEL: Record<string, string> = {
  proposition: 'Proposition',
  devis: 'Devis',
  contrat: 'Contrat',
  audit_prospect: 'Audit de prospect',
  autre: 'Document',
};

export async function loadPipeline(db: Db): Promise<PipelineData> {
  const [deals, members, contacts, comms, docs, snaps, quotes] = await Promise.all([
    db
      .from('deal')
      .select(
        'id, stage, mrr_cents, probability, owner_id, next_action, next_action_on, stage_since, won_at, created_at, client:client_id(id, slug, name, sector, domain, plan)',
      )
      .neq('stage', 'perdu')
      .order('created_at'),
    db.from('agency_member').select('id, initials, full_name').order('created_at'),
    db
      .from('contact')
      .select('client_id, full_name, role, email, phone, is_primary')
      .is('archived_at', null)
      .order('is_primary', { ascending: false }),
    db
      .from('communication')
      .select('client_id, channel, direction, body, occurred_at, author:author_id(full_name)')
      .in('channel', DEAL_CHANNELS)
      .order('occurred_at', { ascending: false }),
    db.from('deal_document').select('deal_id, name, kind, generated, created_at').order('created_at', { ascending: false }),
    db.from('deal_seo_snapshot').select('*'),
    db.from('quote').select('id, deal_id, kind, ref, subject, status, expires_on, created_at').not('deal_id', 'is', null).order('created_at', { ascending: false }),
  ]);

  const owners: Owners = {};
  const initialsById = new Map<string, string>();
  (members.data ?? []).forEach((m, i) => {
    owners[m.initials] = { name: m.full_name ?? m.initials, color: OWNER_COLORS[i % OWNER_COLORS.length] };
    initialsById.set(m.id, m.initials);
  });
  owners[NO_OWNER] = { name: 'Sans responsable', color: 'var(--fg4)' };

  const contactBy = new Map<string, NonNullable<typeof contacts.data>[number]>();
  for (const c of contacts.data ?? []) if (!contactBy.has(c.client_id)) contactBy.set(c.client_id, c);

  const commsBy = new Map<string, Exchange[]>();
  for (const c of comms.data ?? []) {
    const who = c.direction === 'in' ? 'Client' : (c.author?.full_name ?? 'Agence');
    commsBy.set(c.client_id, [
      ...(commsBy.get(c.client_id) ?? []),
      { ch: c.channel as ExchangeChannel, at: whenLabel(c.occurred_at), who, text: c.body },
    ]);
  }
  const docsBy = new Map<string, NonNullable<typeof docs.data>>();
  for (const d of docs.data ?? []) docsBy.set(d.deal_id, [...(docsBy.get(d.deal_id) ?? []), d]);
  // Les documents du générateur (9.4) rattachés à l'opportunité : proposition ou devis, avec leur page.
  const genBy = new Map<string, DealDoc[]>();
  const todayIso = new Date().toISOString().slice(0, 10);
  for (const q of quotes.data ?? []) {
    if (!q.deal_id) continue;
    const status = q.status === 'envoye' && q.expires_on && q.expires_on < todayIso ? 'expire' : q.status;
    genBy.set(q.deal_id, [
      ...(genBy.get(q.deal_id) ?? []),
      { name: `${q.ref} — ${q.subject}`, kind: q.kind === 'proposition' ? 'Proposition' : 'Devis', at: fmtLong.format(new Date(q.created_at)), href: routes.document(q.id), status: QUOTE_STATUS_LABEL[status] ?? status },
    ]);
  }
  const snapBy = new Map((snaps.data ?? []).map((s) => [s.deal_id, s]));

  const out: Deal[] = [];
  const details: Record<string, DealDetail> = {};

  for (const d of deals.data ?? []) {
    if (!d.client) continue;
    const stage = d.stage as StageId;
    const owner = (d.owner_id && initialsById.get(d.owner_id)) || NO_OWNER;
    out.push({
      id: d.id,
      company: d.client.name,
      clientId: d.client.id,
      sector: d.client.sector ?? '',
      mrr: Math.round(d.mrr_cents / 100),
      services: d.client.plan ? [d.client.plan] : [],
      owner,
      days: daysSince(d.stage_since),
      prob: d.probability ?? STAGE_PROBABILITY[stage] ?? 0,
      stage,
      next: d.next_action ?? (stage === 'gagne' ? 'Onboarding lancé' : 'À planifier'),
    });

    const contact = contactBy.get(d.client.id);
    const snap = snapBy.get(d.id);
    const history = commsBy.get(d.client.id) ?? [];
    details[d.id] = {
      contact: contact?.full_name ?? 'Contact à renseigner',
      role: contact?.role ?? null,
      email: contact?.email ?? null,
      phone: contact?.phone ?? null,
      site: d.client.domain ?? '—',
      createdAt: fmtLong.format(new Date(d.created_at)),
      nextAt: d.next_action_on ? fmtLong.format(dateOf(d.next_action_on)) : 'à planifier',
      history:
        history.length > 0
          ? history
          : [{ ch: 'note', at: 'à la création', who: 'HuntPilote', text: 'Aucun échange consigné pour l’instant.' }],
      docs: [
        ...(genBy.get(d.id) ?? []),
        ...(docsBy.get(d.id) ?? []).map((doc) => ({
          name: doc.name,
          kind: DOC_KIND_LABEL[doc.kind] ?? doc.kind,
          at: fmtLong.format(new Date(doc.created_at)),
          ...(doc.generated ? { auto: true } : {}),
        })),
      ],
      seo: snap
        ? {
            done: true,
            at: fmtLong.format(new Date(snap.captured_at)),
            domain: snap.domain,
            authority: snap.authority ?? 0,
            keywords: snap.keywords ?? 0,
            traffic: (snap.monthly_visits ?? 0).toLocaleString('fr-CA'),
            top10: snap.top10 ?? 0,
          }
        : { done: false },
      ...(d.won_at ? { wonAt: fmtLong.format(new Date(d.won_at)) } : {}),
    };
  }

  return { deals: out, owners, details };
}
