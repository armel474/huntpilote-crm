-- =============================================================================
-- 0015b — Le contrat, ses livrables et son échéancier
-- =============================================================================
-- Tiré des documents réels du mandat SHGM : le contrat de services n° 2026-007
-- et son Annexe A. Rien ici n'est supposé — chaque table correspond à une
-- clause qu'un client signé peut opposer à l'agence.
--
-- Six notions que le schéma ne savait pas dire :
--
-- 1. **La chaîne documentaire et son rang.** Un mandat, c'est trois documents
--    liés et hiérarchisés : le corps du contrat, l'Annexe A, la proposition
--    acceptée. L'article 1.2 précise qu'en cas de conflit, cet ordre prévaut.
--    Le rang fait donc partie du lien, sinon il se perd.
--
-- 2. **Le livrable, distinct de la tâche.** `L-01` à `L-11` sont soumis à
--    approbation et portent un nombre de rondes de révision incluses. Au-delà,
--    c'est facturé 100 $/h. Une règle facturable se compte : elle ne se
--    retient pas de mémoire.
--
-- 3. **Le jalon à date relative.** « Dans les 7 jours suivant J-03 ». Un
--    retard du Client reporte les jalons suivants « sans pénalité pour le
--    Prestataire » : une date d'échéancier ne se saisit pas, elle se recalcule.
--
-- 4. **L'acceptation tacite.** « En l'absence de retour dans les 5 jours
--    ouvrables, le livrable est réputé accepté. » En contrepartie, le
--    Prestataire s'engage à envoyer un rappel avant l'échéance.
--
-- 5. **Le contenu attendu du Client**, avec sa date butoir à 60 jours au-delà
--    de laquelle le mandat peut être suspendu. Un mandat bloqué faute de
--    contenu est la première cause de dérive d'un projet web.
--
-- 6. **Les exclusions.** « Fera l'objet d'une offre de service distincte » :
--    une exclusion n'est pas une note de bas de page, c'est la prochaine vente
--    écrite dans le contrat signé.
-- =============================================================================


-- =============================================================================
-- Vocabulaires
-- =============================================================================

-- Les valeurs `proposition`, `contrat`, `annexe` et `avenant` de
-- `document_kind` sont ajoutées par 0015a : PostgreSQL n'autorise pas à les
-- utiliser dans la transaction qui les crée.

create type public.contract_status as enum (
  'brouillon', 'envoye', 'signe', 'en_cours', 'suspendu', 'termine', 'resilie'
);

-- À qui incombe un jalon. Les trois valeurs viennent telles quelles de
-- l'échéancier de l'Annexe A.
create type public.milestone_owner as enum ('client', 'prestataire', 'les_deux');

create type public.deliverable_state as enum (
  'a_produire',
  'soumis',              -- remis au client, en attente de retour
  'en_revision',         -- commentaires reçus, corrections en cours
  'accepte',             -- approuvé explicitement
  'accepte_tacitement'   -- silence au-delà du délai d'acceptation
);

create type public.payment_trigger as enum (
  'signature', 'jalon', 'livraison_finale', 'date'
);


-- =============================================================================
-- Le contrat
-- =============================================================================

create table public.contract (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid not null references public.agency(id) on delete cascade,
  client_id     uuid not null references public.client(id) on delete restrict,
  -- Le deal qui l'a produit, quand il y en a un.
  deal_id       uuid references public.deal(id) on delete set null,

  ref           text not null,          -- « 2026-007 »
  title         text not null,
  status        public.contract_status not null default 'brouillon',

  -- Les honoraires hors taxes. Les taxes se calculent, elles ne se stockent
  -- pas — même convention que les devis et les factures.
  fee_cents     integer,
  -- Le taux horaire hors portée (« 100 $/h CAD + taxes »).
  hourly_rate_cents integer,

  -- Les délais que le contrat fixe, en jours. Ce sont des clauses, pas des
  -- constantes d'interface : ils changent d'un contrat à l'autre.
  acceptance_business_days integer not null default 5,
  content_deadline_days    integer not null default 60,
  warranty_days            integer not null default 30,

  sent_on       date,
  signed_on     date,
  started_on    date,
  ended_on      date,

  -- Qui a signé de chaque côté.
  signed_by_contact_id uuid references public.contact(id) on delete set null,
  signed_by_member_id  uuid references public.agency_member(id) on delete set null,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint contract_ref_unique unique (agency_id, ref),
  constraint contract_fee_positive check (fee_cents is null or fee_cents >= 0),
  constraint contract_rate_positive check (hourly_rate_cents is null or hourly_rate_cents >= 0),
  constraint contract_delays_positive check (
    acceptance_business_days > 0 and content_deadline_days > 0 and warranty_days >= 0
  ),
  -- Un contrat signé porte forcément sa date et son signataire côté client.
  constraint contract_signed_has_date check (
    status in ('brouillon', 'envoye') or signed_on is not null
  ),
  constraint contract_dates_ordered check (ended_on is null or started_on is null or ended_on >= started_on)
);

create index contract_client_idx on public.contract (client_id, signed_on desc);
create index contract_agency_idx on public.contract (agency_id);
create index contract_deal_idx on public.contract (deal_id);
create index contract_contact_idx on public.contract (signed_by_contact_id);
create index contract_member_idx on public.contract (signed_by_member_id);

create trigger contract_touch
  before update on public.contract
  for each row execute function app.touch_updated_at();


-- La chaîne documentaire : le corps du contrat, l'annexe, la proposition —
-- avec leur ordre de priorité en cas de conflit (article 1.2).
create table public.contract_document (
  id           uuid primary key default gen_random_uuid(),
  contract_id  uuid not null references public.contract(id) on delete cascade,

  kind         public.document_kind not null,
  name         text not null,
  ref          text,
  -- 1 = prévaut sur tous les autres. L'ordre est explicite parce que c'est
  -- exactement ce qui tranche un désaccord.
  precedence   smallint not null,
  file_url     text,
  issued_on    date,

  created_at   timestamptz not null default now(),

  constraint contract_document_precedence_unique unique (contract_id, precedence),
  constraint contract_document_precedence_positive check (precedence > 0)
);

create index contract_document_contract_idx on public.contract_document (contract_id, precedence);


-- =============================================================================
-- Les livrables
-- =============================================================================

create table public.deliverable (
  id               uuid primary key default gen_random_uuid(),
  contract_id      uuid not null references public.contract(id) on delete cascade,

  code             text not null,          -- « L-01 »
  title            text not null,
  description      text,

  -- Le nombre de rondes de révision comprises. Null = sans objet (une
  -- formation ne se révise pas).
  included_rounds  smallint,

  state            public.deliverable_state not null default 'a_produire',
  submitted_on     date,
  accepted_on      date,

  position         smallint not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint deliverable_code_unique unique (contract_id, code),
  constraint deliverable_rounds_positive check (included_rounds is null or included_rounds >= 0),
  -- Un livrable accepté porte sa date ; un livrable pas encore soumis n'en a
  -- pas. L'état et les dates ne peuvent pas se contredire.
  constraint deliverable_accepted_has_date check (
    (state in ('accepte', 'accepte_tacitement')) = (accepted_on is not null)
  ),
  constraint deliverable_submitted_before_accepted check (
    accepted_on is null or submitted_on is null or accepted_on >= submitted_on
  ),
  constraint deliverable_state_needs_submission check (
    state in ('a_produire') or submitted_on is not null
  )
);

create index deliverable_contract_idx on public.deliverable (contract_id, position);

create trigger deliverable_touch
  before update on public.deliverable
  for each row execute function app.touch_updated_at();


-- « L-09 — Adaptation responsive : inclus dans L-03 / L-04 ». Un livrable peut
-- être couvert par un ou plusieurs autres : il ne se facture pas à part et ne
-- se planifie pas seul.
create table public.deliverable_inclusion (
  deliverable_id  uuid not null references public.deliverable(id) on delete cascade,
  included_in_id  uuid not null references public.deliverable(id) on delete cascade,
  primary key (deliverable_id, included_in_id),
  constraint deliverable_inclusion_not_itself check (deliverable_id <> included_in_id)
);

create index deliverable_inclusion_parent_idx on public.deliverable_inclusion (included_in_id);


-- Une ronde de révision : « un ensemble de commentaires consolidés transmis en
-- une seule fois ». Les commentaires fragmentés après clôture comptent pour
-- une nouvelle ronde — d'où la date de clôture.
create table public.revision_round (
  id              uuid primary key default gen_random_uuid(),
  deliverable_id  uuid not null references public.deliverable(id) on delete cascade,
  number          smallint not null,
  opened_on       date not null default current_date,
  closed_on       date,
  notes           text,
  -- Les heures passées sur une ronde facturable, et le devis qui l'a couverte.
  hours           numeric(5,1),
  quote_id        uuid references public.quote(id) on delete set null,

  created_at      timestamptz not null default now(),

  constraint revision_round_unique unique (deliverable_id, number),
  constraint revision_round_number_positive check (number > 0),
  constraint revision_round_dates_ordered check (closed_on is null or closed_on >= opened_on),
  constraint revision_round_hours_positive check (hours is null or hours > 0)
);

create index revision_round_deliverable_idx on public.revision_round (deliverable_id, number);
create index revision_round_quote_idx on public.revision_round (quote_id);


-- =============================================================================
-- Les jalons
-- =============================================================================
-- « Dans les 7 jours suivant J-03 » : un jalon dépend d'un autre et d'un
-- décalage. La date prévue se calcule en remontant la chaîne, ce qui fait
-- qu'un retard du Client reporte tout ce qui suit, sans qu'on recopie rien.

create table public.milestone (
  id            uuid primary key default gen_random_uuid(),
  contract_id   uuid not null references public.contract(id) on delete cascade,

  code          text not null,          -- « J-03 »
  description   text not null,
  owner         public.milestone_owner not null,

  -- Soit une date fixe (le point de départ), soit un décalage après un autre
  -- jalon. Jamais les deux, jamais aucun des deux.
  fixed_on      date,
  depends_on_id uuid references public.milestone(id) on delete restrict,
  offset_days   smallint,

  reached_on    date,
  position      smallint not null default 0,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint milestone_code_unique unique (contract_id, code),
  constraint milestone_one_anchor check (
    (fixed_on is not null and depends_on_id is null and offset_days is null)
    or (fixed_on is null and depends_on_id is not null and offset_days is not null)
  ),
  constraint milestone_offset_positive check (offset_days is null or offset_days >= 0),
  constraint milestone_not_itself check (depends_on_id <> id)
);

create index milestone_contract_idx on public.milestone (contract_id, position);
create index milestone_depends_idx on public.milestone (depends_on_id);

create trigger milestone_touch
  before update on public.milestone
  for each row execute function app.touch_updated_at();


-- Un échéancier circulaire n'a pas de date de départ : il boucle.
create or replace function app.milestone_depends_on(p_start uuid, p_target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with recursive chaine as (
    select m.depends_on_id as id from public.milestone m where m.id = p_start
    union
    select m.depends_on_id from public.milestone m join chaine c on c.id = m.id
  )
  select exists (select 1 from chaine where id = p_target);
$$;

create or replace function app.check_milestone_cycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.depends_on_id is null then return new; end if;
  if app.milestone_depends_on(new.depends_on_id, new.id) then
    raise exception
      'Ce jalon dépendrait de lui-même : l''échéancier n''aurait plus de point de départ.';
  end if;
  return new;
end;
$$;

create trigger milestone_no_cycle
  before insert or update on public.milestone
  for each row execute function app.check_milestone_cycle();


-- La date prévue d'un jalon. Atteint : sa date réelle. Sinon : celle du jalon
-- dont il dépend, plus le décalage — et celle-là se calcule de la même façon.
-- C'est ce qui fait glisser tout l'échéancier d'un coup quand le client tarde.
create or replace function app.milestone_planned_on(p_milestone uuid)
returns date
language plpgsql
stable
security definer
set search_path = ''
as $$
declare m record; base date;
begin
  select * into m from public.milestone where id = p_milestone;
  if not found then return null; end if;

  if m.reached_on is not null then return m.reached_on; end if;
  if m.depends_on_id is null then return m.fixed_on; end if;

  base := app.milestone_planned_on(m.depends_on_id);
  if base is null then return null; end if;
  return base + m.offset_days;
end;
$$;


-- =============================================================================
-- Ce que le client doit fournir
-- =============================================================================

create table public.client_input_item (
  id               uuid primary key default gen_random_uuid(),
  contract_id      uuid not null references public.contract(id) on delete cascade,

  label            text not null,
  expected_format  text,
  note             text,
  -- Le jalon auquel l'élément est dû (J-03 dans le mandat SHGM).
  due_milestone_id uuid references public.milestone(id) on delete set null,

  received_on      date,
  position         smallint not null default 0,

  constraint client_input_item_unique unique (contract_id, label)
);

create index client_input_item_contract_idx on public.client_input_item (contract_id, position);
create index client_input_item_milestone_idx on public.client_input_item (due_milestone_id);


-- =============================================================================
-- Les exclusions — c'est-à-dire la prochaine vente
-- =============================================================================

create table public.contract_exclusion (
  id           uuid primary key default gen_random_uuid(),
  contract_id  uuid not null references public.contract(id) on delete cascade,

  label        text not null,
  detail       text,
  -- L'offre du catalogue qui couvrirait ce besoin, quand il y en a une.
  offer_id     uuid references public.offer(id) on delete set null,
  -- Le devis qui l'a transformée en vente. Une exclusion suivie est une
  -- exclusion qui rapporte.
  quote_id     uuid references public.quote(id) on delete set null,

  position     smallint not null default 0,

  constraint contract_exclusion_unique unique (contract_id, label)
);

create index contract_exclusion_contract_idx on public.contract_exclusion (contract_id, position);
create index contract_exclusion_offer_idx on public.contract_exclusion (offer_id);
create index contract_exclusion_quote_idx on public.contract_exclusion (quote_id);


-- =============================================================================
-- L'échéancier de paiement
-- =============================================================================
-- « 50 % à la signature, 50 % à la livraison finale » : une facture ne suit pas
-- un calendrier mensuel, elle suit des jalons.

create table public.payment_milestone (
  id            uuid primary key default gen_random_uuid(),
  contract_id   uuid not null references public.contract(id) on delete cascade,

  label         text not null,
  -- Un pourcentage des honoraires, ou un montant ferme. Jamais les deux.
  percentage    numeric(5,2),
  amount_cents  integer,

  trigger       public.payment_trigger not null,
  milestone_id  uuid references public.milestone(id) on delete set null,
  due_on        date,
  -- Le délai de paiement propre à ce versement (« payable dans les 15 jours »).
  terms_days    integer,

  invoice_id    uuid references public.invoice(id) on delete set null,
  position      smallint not null default 0,

  constraint payment_milestone_unique unique (contract_id, label),
  constraint payment_milestone_one_amount check (
    (percentage is not null) <> (amount_cents is not null)
  ),
  constraint payment_milestone_percentage_range check (
    percentage is null or (percentage > 0 and percentage <= 100)
  ),
  constraint payment_milestone_amount_positive check (amount_cents is null or amount_cents >= 0),
  -- Un versement déclenché par un jalon doit dire lequel ; un versement à date
  -- fixe doit dire laquelle.
  constraint payment_milestone_trigger_target check (
    case trigger
      when 'jalon' then milestone_id is not null
      when 'date'  then due_on is not null
      else true
    end
  ),
  constraint payment_milestone_terms_positive check (terms_days is null or terms_days >= 0)
);

create index payment_milestone_contract_idx on public.payment_milestone (contract_id, position);
create index payment_milestone_milestone_idx on public.payment_milestone (milestone_id);
create index payment_milestone_invoice_idx on public.payment_milestone (invoice_id);


-- =============================================================================
-- La banque d'heures d'accompagnement
-- =============================================================================
-- « 4 à 6 h par mois pendant 3 mois, non cumulables, non reportables. » Ni un
-- abonnement ni une tâche : un crédit d'heures qui se remet à zéro chaque
-- mois, et les correctifs sous garantie ne s'en déduisent pas.

create table public.support_period (
  id                 uuid primary key default gen_random_uuid(),
  contract_id        uuid not null references public.contract(id) on delete cascade,

  starts_on          date not null,
  months             smallint not null,
  hours_min          numeric(5,1),
  hours_max          numeric(5,1) not null,
  -- Le taux au-delà du forfait mensuel.
  overage_rate_cents integer,

  created_at         timestamptz not null default now(),

  constraint support_period_months_positive check (months > 0),
  constraint support_period_hours_ordered check (hours_min is null or hours_min <= hours_max),
  constraint support_period_hours_positive check (hours_max > 0)
);

create index support_period_contract_idx on public.support_period (contract_id);

create table public.support_month (
  period_id     uuid not null references public.support_period(id) on delete cascade,
  month         date not null,
  hours_used    numeric(5,1) not null default 0,
  -- Les heures de garantie, comptées à part : elles ne consomment pas le
  -- forfait (article 10 du contrat).
  warranty_hours numeric(5,1) not null default 0,

  primary key (period_id, month),
  constraint support_month_is_a_month check (extract(day from month) = 1),
  constraint support_month_hours_positive check (hours_used >= 0 and warranty_hours >= 0)
);


-- =============================================================================
-- Ce qui se déduit
-- =============================================================================

-- L'état des rondes d'un livrable : combien sont comprises, combien ont été
-- consommées, et combien sont facturables. Le contrat facture au-delà du
-- nombre inclus — ce compte ne se tient pas de mémoire.
create view public.deliverable_revision_status as
select
  d.id as deliverable_id,
  d.contract_id,
  d.code,
  d.title,
  d.included_rounds,
  count(r.id)                                                   as rounds_used,
  greatest(count(r.id) - coalesce(d.included_rounds, 0), 0)      as rounds_billable,
  coalesce(sum(r.hours) filter (
    where r.number > coalesce(d.included_rounds, 0)), 0)         as billable_hours
from public.deliverable d
left join public.revision_round r on r.deliverable_id = d.id
group by d.id, d.contract_id, d.code, d.title, d.included_rounds;

alter view public.deliverable_revision_status set (security_invoker = on);


-- L'échéancier, recalculé. Une date prévue n'est jamais saisie : elle descend
-- du jalon dont elle dépend.
create view public.contract_schedule as
select
  m.id as milestone_id,
  m.contract_id,
  m.code,
  m.description,
  m.owner,
  m.position,
  m.reached_on,
  app.milestone_planned_on(m.id)                                as planned_on,
  (m.reached_on is null
   and app.milestone_planned_on(m.id) is not null
   and app.milestone_planned_on(m.id) < current_date)           as late
from public.milestone m;

alter view public.contract_schedule set (security_invoker = on);


-- Le point financier d'un mandat : ce qui est engagé, ce qui est facturé, ce
-- qui reste à facturer.
create view public.contract_financials as
select
  c.id as contract_id,
  c.agency_id,
  c.client_id,
  c.ref,
  c.fee_cents,
  coalesce(sum(
    case when p.percentage is not null
         then round(c.fee_cents * p.percentage / 100)
         else p.amount_cents end
  ), 0)::bigint                                                  as scheduled_cents,
  coalesce(sum(
    case when p.invoice_id is not null then
      case when p.percentage is not null
           then round(c.fee_cents * p.percentage / 100)
           else p.amount_cents end
    else 0 end
  ), 0)::bigint                                                  as invoiced_cents
from public.contract c
left join public.payment_milestone p on p.contract_id = c.id
group by c.id, c.agency_id, c.client_id, c.ref, c.fee_cents;

alter view public.contract_financials set (security_invoker = on);


-- Ce que le client n'a pas encore fourni, et depuis quand le compte tourne.
-- Passé la date butoir du contrat, le mandat peut être suspendu.
create view public.contract_pending_input as
select
  i.contract_id,
  c.client_id,
  c.agency_id,
  count(*)                                                      as items_pending,
  min(app.milestone_planned_on(i.due_milestone_id))             as due_on,
  (c.signed_on + c.content_deadline_days)                       as suspension_possible_from
from public.client_input_item i
join public.contract c on c.id = i.contract_id
where i.received_on is null
group by i.contract_id, c.client_id, c.agency_id, c.signed_on, c.content_deadline_days;

alter view public.contract_pending_input set (security_invoker = on);


-- =============================================================================
-- Cloisonnement
-- =============================================================================

alter table public.contract              enable row level security;
alter table public.contract_document     enable row level security;
alter table public.deliverable           enable row level security;
alter table public.deliverable_inclusion enable row level security;
alter table public.revision_round        enable row level security;
alter table public.milestone             enable row level security;
alter table public.client_input_item     enable row level security;
alter table public.contract_exclusion    enable row level security;
alter table public.payment_milestone     enable row level security;
alter table public.support_period        enable row level security;
alter table public.support_month         enable row level security;

create policy contract_agency_all on public.contract
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

-- Le client voit son contrat une fois signé — il l'a signé.
create policy contract_portal_read on public.contract
  for select to authenticated
  using (client_id = app.current_client_id() and signed_on is not null);

-- Les tables filles suivent le contrat. Une seule fonction d'appartenance,
-- pour que la règle soit écrite une fois.
create or replace function app.contract_in_my_agency(p_contract uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.contract c
     where c.id = p_contract and c.agency_id = app.current_agency_id());
$$;

create or replace function app.contract_is_mine_as_client(p_contract uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.contract c
     where c.id = p_contract
       and c.client_id = app.current_client_id()
       and c.signed_on is not null);
$$;

create policy contract_document_agency_all on public.contract_document
  for all to authenticated
  using (app.contract_in_my_agency(contract_id))
  with check (app.contract_in_my_agency(contract_id));

create policy deliverable_agency_all on public.deliverable
  for all to authenticated
  using (app.contract_in_my_agency(contract_id))
  with check (app.contract_in_my_agency(contract_id));

create policy milestone_agency_all on public.milestone
  for all to authenticated
  using (app.contract_in_my_agency(contract_id))
  with check (app.contract_in_my_agency(contract_id));

create policy client_input_item_agency_all on public.client_input_item
  for all to authenticated
  using (app.contract_in_my_agency(contract_id))
  with check (app.contract_in_my_agency(contract_id));

create policy contract_exclusion_agency_all on public.contract_exclusion
  for all to authenticated
  using (app.contract_in_my_agency(contract_id))
  with check (app.contract_in_my_agency(contract_id));

create policy payment_milestone_agency_all on public.payment_milestone
  for all to authenticated
  using (app.contract_in_my_agency(contract_id))
  with check (app.contract_in_my_agency(contract_id));

create policy support_period_agency_all on public.support_period
  for all to authenticated
  using (app.contract_in_my_agency(contract_id))
  with check (app.contract_in_my_agency(contract_id));

create policy revision_round_agency_all on public.revision_round
  for all to authenticated
  using (exists (select 1 from public.deliverable d
                  where d.id = public.revision_round.deliverable_id
                    and app.contract_in_my_agency(d.contract_id)))
  with check (exists (select 1 from public.deliverable d
                  where d.id = public.revision_round.deliverable_id
                    and app.contract_in_my_agency(d.contract_id)));

create policy deliverable_inclusion_agency_all on public.deliverable_inclusion
  for all to authenticated
  using (exists (select 1 from public.deliverable d
                  where d.id = public.deliverable_inclusion.deliverable_id
                    and app.contract_in_my_agency(d.contract_id)))
  with check (exists (select 1 from public.deliverable d
                  where d.id = public.deliverable_inclusion.deliverable_id
                    and app.contract_in_my_agency(d.contract_id)));

create policy support_month_agency_all on public.support_month
  for all to authenticated
  using (exists (select 1 from public.support_period p
                  where p.id = public.support_month.period_id
                    and app.contract_in_my_agency(p.contract_id)))
  with check (exists (select 1 from public.support_period p
                  where p.id = public.support_month.period_id
                    and app.contract_in_my_agency(p.contract_id)));

-- Ce que le client voit de son propre mandat : les documents qui l'engagent,
-- ses livrables, l'échéancier et ce qu'on attend de lui. Pas les rondes
-- facturables ni le suivi des exclusions — c'est le travail de l'agence.
create policy contract_document_portal_read on public.contract_document
  for select to authenticated
  using (app.contract_is_mine_as_client(contract_id));

create policy deliverable_portal_read on public.deliverable
  for select to authenticated
  using (app.contract_is_mine_as_client(contract_id));

create policy milestone_portal_read on public.milestone
  for select to authenticated
  using (app.contract_is_mine_as_client(contract_id));

create policy client_input_item_portal_read on public.client_input_item
  for select to authenticated
  using (app.contract_is_mine_as_client(contract_id));

create policy payment_milestone_portal_read on public.payment_milestone
  for select to authenticated
  using (app.contract_is_mine_as_client(contract_id));
