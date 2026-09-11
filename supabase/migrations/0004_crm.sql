-- =============================================================================
-- 0004 — CRM : pipeline, devis, factures, communications
-- =============================================================================
-- La boucle commerciale et la boucle relationnelle. Trois corrections de fond
-- par rapport au code actuel :
--
--   · un deal pointe vers un compte prospect. ⚠ Aujourd'hui `pipeline.ts` et
--     `clients.ts` sont deux univers parallèles : aucune des treize
--     entreprises du Kanban n'existe dans le portefeuille, et aucun des cinq
--     prospects du Client Hub n'a de deal. Or « Marquer gagné » est censé
--     créer le client. Voir docs/reconciliation-donnees.md, point 2.
--   · une facture appartient à un compte. ⚠ `INVOICES` n'a pas de `clientId`.
--   · le fil du portail et celui du cockpit sont la même table, pas deux jeux
--     fusionnés à l'affichage (session 7.2).
-- =============================================================================


-- Les taux de taxe sont des réglages, pas des constantes : ils changent, et
-- une agence qui facturerait hors Québec en aurait d'autres. ⚠ `devis.ts` les
-- fige en `QT_TPS`/`QT_TVQ`.
alter table public.agency_settings
  add column tps_rate numeric(6,5) not null default 0.05000,
  add column tvq_rate numeric(6,5) not null default 0.09975;


-- =============================================================================
-- Le pipeline
-- =============================================================================

create type public.deal_stage as enum (
  'prospect', 'qualifie', 'proposition', 'negociation', 'gagne', 'perdu'
);

create table public.deal (
  id             uuid primary key default gen_random_uuid(),
  agency_id      uuid not null references public.agency(id) on delete cascade,

  -- Un deal porte toujours sur un compte. Gagner le deal fait passer ce compte
  -- de `prospect` à `client` (décision 4 du plan : « Marquer gagné » enclenche
  -- la création du client et l'onboarding).
  client_id      uuid not null references public.client(id) on delete cascade,

  stage          public.deal_stage not null default 'prospect',
  mrr_cents      integer not null default 0,
  probability    smallint,
  owner_id       uuid references public.agency_member(id) on delete set null,

  next_action    text,
  next_action_on date,

  -- L'entrée dans l'étape courante, pour calculer les jours qui y sont passés.
  -- ⚠ `Deal.days` est un nombre figé qui ne vieillit jamais.
  stage_since    date not null default current_date,

  won_at         timestamptz,
  lost_at        timestamptz,
  lost_reason    text,
  lost_note      text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint deal_probability_range check (
    probability is null or probability between 0 and 100
  ),
  constraint deal_mrr_positive check (mrr_cents >= 0),
  constraint deal_won_pairing  check ((stage = 'gagne') = (won_at is not null)),
  -- Marquer perdu demande un motif : c'est lui qui déclenche la purge de
  -- l'instantané du prospect (règle 3).
  constraint deal_lost_pairing check (
    (stage = 'perdu') = (lost_at is not null)
    and (lost_at is null or lost_reason is not null)
  )
);

create index deal_agency_stage_idx on public.deal (agency_id, stage);
create index deal_client_idx       on public.deal (client_id);

create trigger deal_touch
  before update on public.deal
  for each row execute function app.touch_updated_at();

comment on column public.deal.stage_since is
  'Date d''entrée dans l''étape courante. Les « jours dans l''étape » se calculent, ne se stockent pas.';


-- Un instantané SEO de prospect. Règle 3 : « les prospects n'ont droit qu'à un
-- instantané, purgé si le deal est perdu ». La cascade rend la purge
-- automatique à la suppression du deal ; la purge à la perte est une tâche
-- planifiée, au-delà du délai réglé dans agency_settings.
create table public.deal_seo_snapshot (
  deal_id       uuid primary key references public.deal(id) on delete cascade,
  captured_at   timestamptz not null default now(),
  domain        text not null,
  authority     smallint,
  keywords      integer,
  monthly_visits integer,
  top10         integer,
  raw           jsonb
);

comment on table public.deal_seo_snapshot is
  'Instantané, jamais historisé (règle 3). Un prospect n''a pas droit à une courbe.';


create table public.deal_document (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references public.deal(id) on delete cascade,
  name        text not null,
  kind        text not null,
  -- Produit par l'agent plutôt que déposé à la main (ex. l'audit de prospect
  -- généré depuis Organic Research).
  generated   boolean not null default false,
  created_at  timestamptz not null default now(),

  constraint deal_document_kind_known check (
    kind in ('proposition', 'devis', 'contrat', 'audit_prospect', 'autre')
  )
);

create index deal_document_deal_idx on public.deal_document (deal_id);


-- =============================================================================
-- Les devis
-- =============================================================================
-- Session 7.3. Un devis envoyé ne se modifie plus : une correction crée une
-- nouvelle version, comme pour le rapport client.

create type public.quote_status as enum (
  'brouillon', 'envoye', 'accepte', 'refuse', 'expire'
);

create table public.quote (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid not null references public.agency(id) on delete cascade,
  client_id     uuid not null references public.client(id) on delete cascade,
  contact_id    uuid references public.contact(id) on delete set null,

  ref           text not null,
  subject       text not null,
  status        public.quote_status not null default 'brouillon',

  issued_on     date,
  expires_on    date,
  conditions    text,

  -- Un devis accepté doit se lier à ce qu'il produit — une ligne ajoutée au
  -- contrat, ou un avenant daté (session 7.3). ⚠ `contratRef` est du texte
  -- libre dans le code actuel.
  accepted_on   date,
  refused_on    date,
  refusal_note  text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint quote_ref_unique unique (agency_id, ref),
  constraint quote_sent_has_date check (status = 'brouillon' or issued_on is not null),
  constraint quote_expiry_after_issue check (
    expires_on is null or issued_on is null or expires_on >= issued_on
  )
);

create index quote_client_idx on public.quote (client_id, status);
create index quote_pending_idx on public.quote (agency_id) where status = 'envoye';

create trigger quote_touch
  before update on public.quote
  for each row execute function app.touch_updated_at();


create table public.quote_line (
  id             uuid primary key default gen_random_uuid(),
  quote_id       uuid not null references public.quote(id) on delete cascade,
  position       smallint not null,
  description    text not null,
  quantity       numeric(8,2) not null default 1,
  unit_price_cents integer not null,

  constraint quote_line_position_unique unique (quote_id, position),
  constraint quote_line_amounts_positive check (quantity > 0 and unit_price_cents >= 0)
);


create table public.quote_version (
  id          uuid primary key default gen_random_uuid(),
  quote_id    uuid not null references public.quote(id) on delete cascade,
  version     smallint not null,
  created_at  timestamptz not null default now(),
  created_by  uuid references public.agency_member(id) on delete set null,
  note        text,
  content     jsonb not null,

  constraint quote_version_unique unique (quote_id, version)
);

comment on table public.quote_version is
  'Un devis envoyé est verrouillé : une correction crée une version, l''ancienne reste consultable (session 7.3).';


-- Le sous-total, les taxes et le total se calculent — ils ne se stockent pas.
create view public.quote_total as
  select
    q.id as quote_id,
    q.agency_id,
    coalesce(sum(l.quantity * l.unit_price_cents), 0)::bigint as subtotal_cents,
    round(coalesce(sum(l.quantity * l.unit_price_cents), 0) * s.tps_rate)::bigint as tps_cents,
    round(coalesce(sum(l.quantity * l.unit_price_cents), 0) * s.tvq_rate)::bigint as tvq_cents,
    -- Le total additionne les parties arrondies plutôt que d'arrondir le
    -- produit : sur un devis, la somme des lignes affichées doit faire le
    -- total affiché, au cent près.
    (coalesce(sum(l.quantity * l.unit_price_cents), 0)
     + round(coalesce(sum(l.quantity * l.unit_price_cents), 0) * s.tps_rate)
     + round(coalesce(sum(l.quantity * l.unit_price_cents), 0) * s.tvq_rate))::bigint as total_cents
  from public.quote q
  join public.agency_settings s on s.agency_id = q.agency_id
  left join public.quote_line l on l.quote_id = q.id
  group by q.id, q.agency_id, s.tps_rate, s.tvq_rate;


-- =============================================================================
-- Les factures
-- =============================================================================

create type public.invoice_status as enum ('payee', 'en_attente', 'en_retard', 'annulee');

create table public.invoice (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid not null references public.agency(id) on delete cascade,
  -- ⚠ Ajouté : `INVOICES` n'a aujourd'hui aucun rattachement à un compte.
  client_id     uuid not null references public.client(id) on delete restrict,

  ref           text not null,
  period_month  date not null,
  issued_on     date not null,
  due_on        date,
  paid_on       date,
  amount_cents  integer not null,
  status        public.invoice_status not null default 'en_attente',

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint invoice_ref_unique unique (agency_id, ref),
  constraint invoice_amount_positive check (amount_cents >= 0),
  constraint invoice_period_is_month check (extract(day from period_month) = 1),
  constraint invoice_paid_pairing check ((status = 'payee') = (paid_on is not null))
);

create index invoice_client_idx on public.invoice (client_id, period_month desc);
create index invoice_late_idx   on public.invoice (agency_id) where status = 'en_retard';

create trigger invoice_touch
  before update on public.invoice
  for each row execute function app.touch_updated_at();


-- =============================================================================
-- Les communications
-- =============================================================================
-- Session 7.2 : un seul fil chronologique, tous canaux confondus. Le fil du
-- portail n'est pas une source séparée fusionnée à l'affichage — ce sont les
-- lignes dont le canal vaut 'portail'. Une seule source de vérité, vue des
-- deux côtés.

create table public.communication (
  id              uuid primary key default gen_random_uuid(),
  agency_id       uuid not null references public.agency(id) on delete cascade,
  client_id       uuid not null references public.client(id) on delete cascade,
  contact_id      uuid references public.contact(id) on delete set null,

  channel         public.communication_channel not null,
  direction       text not null,
  body            text not null,
  occurred_at     timestamptz not null default now(),

  -- Qui a écrit, côté agence. NULL pour un message entrant du client.
  author_id       uuid references public.agency_member(id) on delete set null,

  -- Ce que le client voit dans son portail. Calculé, jamais saisi : c'est
  -- exactement la distinction visible/interne que la session 7.2 exige de
  -- rendre non ambiguë, et une colonne dérivée ne peut pas se tromper.
  client_visible  boolean generated always as (channel = 'portail') stored,

  read_at         timestamptz,

  -- Rattacher un message à un élément précis — « c'est quoi ce chiffre ? »
  -- sans référence est le problème que la session 5.2 avait identifié.
  -- Quatre clés étrangères nullables plutôt qu'un lien polymorphe : une seule
  -- peut être posée, et chacune est une vraie contrainte.
  context_priority_id uuid references public.priority(id) on delete set null,
  context_report_id   uuid references public.report(id)   on delete set null,
  context_invoice_id  uuid references public.invoice(id)  on delete set null,
  context_contact_id  uuid references public.contact(id)  on delete set null,

  created_at      timestamptz not null default now(),

  constraint communication_direction_known check (direction in ('in', 'out')),
  constraint communication_single_context check (
    (case when context_priority_id is not null then 1 else 0 end)
  + (case when context_report_id   is not null then 1 else 0 end)
  + (case when context_invoice_id  is not null then 1 else 0 end)
  + (case when context_contact_id  is not null then 1 else 0 end) <= 1
  ),
  -- Un message entrant vient du client, pas d'un membre de l'agence.
  constraint communication_author_direction check (
    direction = 'out' or author_id is null
  )
);

create index communication_client_idx  on public.communication (client_id, occurred_at desc);
create index communication_contact_idx on public.communication (contact_id);
create index communication_unread_idx  on public.communication (agency_id)
  where direction = 'in' and read_at is null;

comment on column public.communication.client_visible is
  'Dérivée du canal. Un message interne ne peut pas devenir visible du client par erreur de saisie (session 7.2).';


create table public.communication_file (
  id                uuid primary key default gen_random_uuid(),
  communication_id  uuid not null references public.communication(id) on delete cascade,
  name              text not null,
  size_bytes        bigint,
  storage_path      text,
  created_at        timestamptz not null default now()
);

create index communication_file_comm_idx on public.communication_file (communication_id);


-- =============================================================================
-- Politiques
-- =============================================================================

alter table public.deal               enable row level security;
alter table public.deal_seo_snapshot  enable row level security;
alter table public.deal_document      enable row level security;
alter table public.quote              enable row level security;
alter table public.quote_line         enable row level security;
alter table public.quote_version      enable row level security;
alter table public.invoice            enable row level security;
alter table public.communication      enable row level security;
alter table public.communication_file enable row level security;

create policy deal_agency_all on public.deal
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy quote_agency_all on public.quote
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy invoice_agency_all on public.invoice
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy communication_agency_all on public.communication
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

-- Le portail : uniquement les messages de son compte passés par le portail.
-- Une note interne, un message Slack ou un appel consigné restent invisibles,
-- quoi qu'il arrive.
create policy communication_portal_read on public.communication
  for select to authenticated
  using (client_id = app.current_client_id() and client_visible);

-- Le contact du portail peut répondre — sur le canal portail, dans son fil, et
-- comme message entrant côté agence.
create policy communication_portal_write on public.communication
  for insert to authenticated
  with check (
    client_id = app.current_client_id()
    and channel = 'portail'
    and direction = 'in'
    and author_id is null
  );

create policy deal_seo_snapshot_agency_all on public.deal_seo_snapshot
  for all to authenticated
  using (exists (select 1 from public.deal d
                 where d.id = public.deal_seo_snapshot.deal_id
                   and d.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.deal d
                      where d.id = public.deal_seo_snapshot.deal_id
                        and d.agency_id = app.current_agency_id()));

create policy deal_document_agency_all on public.deal_document
  for all to authenticated
  using (exists (select 1 from public.deal d
                 where d.id = public.deal_document.deal_id
                   and d.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.deal d
                      where d.id = public.deal_document.deal_id
                        and d.agency_id = app.current_agency_id()));

create policy quote_line_agency_all on public.quote_line
  for all to authenticated
  using (exists (select 1 from public.quote q
                 where q.id = public.quote_line.quote_id
                   and q.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.quote q
                      where q.id = public.quote_line.quote_id
                        and q.agency_id = app.current_agency_id()));

create policy quote_version_agency_all on public.quote_version
  for all to authenticated
  using (exists (select 1 from public.quote q
                 where q.id = public.quote_version.quote_id
                   and q.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.quote q
                      where q.id = public.quote_version.quote_id
                        and q.agency_id = app.current_agency_id()));

create policy communication_file_agency_all on public.communication_file
  for all to authenticated
  using (exists (select 1 from public.communication c
                 where c.id = public.communication_file.communication_id
                   and c.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.communication c
                      where c.id = public.communication_file.communication_id
                        and c.agency_id = app.current_agency_id()));

create policy communication_file_portal_read on public.communication_file
  for select to authenticated
  using (exists (select 1 from public.communication c
                 where c.id = public.communication_file.communication_id
                   and c.client_id = app.current_client_id()
                   and c.client_visible));
