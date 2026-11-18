-- =============================================================================
-- 0024 — Le document généré : ce qu'une proposition, un devis ou une facture
--        portent quand ils sortent du générateur (session 9.4)
-- =============================================================================
-- La proposition **est un devis** au sens de la base — lignes, totaux,
-- statuts, versions — avec deux différences : elle appartient à une
-- opportunité, et elle a des sections rédigées par client. Pas de table
-- `document` générique : `quote`, `invoice` et `contract` font le travail.
--
-- Ce que cette migration ajoute, et pourquoi :
--
-- 1. **La sorte et l'opportunité.** `quote.kind` (devis | proposition), avec
--    un modèle de la même sorte ; `quote.deal_id` ; `contract.source_quote_id`
--    pour que le contrat cite la proposition qu'il exécute (préambule).
-- 2. **La nature et la récurrence des lignes.** Le récapitulatif réel a
--    quatre sortes de lignes : le forfait (facturable, ponctuel), le bonus
--    (« Offert »), la maintenance (facturable, mensuelle), le budget média
--    (affiché, jamais facturé). `quote_line.kind` et `quote_line.billing` le
--    disent ; `quote_total` rend deux sous-totaux, ponctuel et récurrent.
-- 3. **Les taux figés.** Les taxes se calculaient avec les taux courants :
--    un changement de taux réécrirait les totaux passés. `tps_rate` et
--    `tvq_rate` se posent à l'envoi ; les vues font `coalesce`.
-- 4. **Le corps figé.** Ce que le client a reçu ne bouge plus : le HTML
--    rendu à l'envoi vit sur le document (`rendered_html`), et chaque envoi
--    dépose un instantané complet dans `quote_version.content`.
-- 5. **Les sections du document.** Copiées du modèle à la création du
--    brouillon, puis à lui : modifier le modèle ne les réécrit pas.
-- 6. **Le journal, la signature, le lien.** Des événements distincts et
--    datés ; une signature simple (nom tapé, date, adresse) ; un jeton
--    opaque qui donne accès au document rendu, et au geste d'acceptation.
--
-- Et deux règles que le moteur tient : **un document qui réclame les taxes
-- ne part pas sans les numéros de TPS et de TVQ de l'agence**, et **envoyer
-- demande le droit « Envoyer des documents »** (« Facturer » pour une facture).
-- =============================================================================


-- =============================================================================
-- 1. La sorte, l'opportunité, la chaîne
-- =============================================================================

create type public.quote_kind as enum ('devis', 'proposition');

alter table public.quote
  add column kind        public.quote_kind not null default 'devis',
  add column deal_id     uuid references public.deal(id) on delete set null,
  -- Les taux en vigueur à l'envoi. NULL tant que le document est un brouillon :
  -- il suit alors les réglages de l'agence.
  add column tps_rate    numeric(6,5),
  add column tvq_rate    numeric(6,5),
  -- Le moment de l'envoi, ce qui gèle le document — comme `invoice.sent_at`.
  add column sent_at     timestamptz,
  -- Le HTML rendu à l'envoi : ce que le client a reçu, tel quel.
  add column rendered_html text,
  -- Le jeton du lien remis au client. Opaque, jamais deviné : 36 caractères.
  add column access_token text,
  -- Le délai de paiement annoncé, copié du modèle à la création.
  add column payment_terms_days integer,

  add constraint quote_rates_pairing check ((tps_rate is null) = (tvq_rate is null)),
  add constraint quote_rates_range   check (
    (tps_rate is null or tps_rate between 0 and 1) and (tvq_rate is null or tvq_rate between 0 and 1)
  ),
  add constraint quote_sent_pairing  check ((status = 'brouillon') or sent_at is not null or issued_on is not null),
  add constraint quote_token_length  check (access_token is null or length(access_token) >= 24),
  add constraint quote_terms_positive check (payment_terms_days is null or payment_terms_days >= 0);

create unique index quote_access_token_unique on public.quote (access_token) where access_token is not null;
create index quote_deal_idx on public.quote (deal_id);
create index quote_client_kind_idx on public.quote (client_id, kind);

alter table public.contract
  add column source_quote_id uuid references public.quote(id) on delete set null;
create index contract_source_quote_idx on public.contract (source_quote_id);


-- Un modèle de la même sorte que le document — « une proposition sur un
-- modèle de facture » ne doit pas pouvoir exister.
create or replace function app.check_quote_template_kind()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare k text;
begin
  if new.template_id is null then
    return new;
  end if;
  select t.kind::text into k from public.document_template t where t.id = new.template_id;
  if k is distinct from new.kind::text then
    raise exception 'Le modèle choisi est un modèle de « % », pas de « % ».', k, new.kind
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger quote_template_kind
  before insert or update of template_id, kind on public.quote
  for each row execute function app.check_quote_template_kind();


-- =============================================================================
-- 2. La nature et la récurrence des lignes
-- =============================================================================

create type public.line_kind as enum ('facturable', 'offert', 'remise', 'informatif');

alter table public.quote_line
  add column billing public.billing_period not null default 'ponctuel',
  add column kind    public.line_kind not null default 'facturable';

-- Une remise est une ligne négative *visible* ; un bonus est une ligne à zéro
-- libellée « Offert » ; le reste garde un prix positif ou nul.
alter table public.quote_line drop constraint quote_line_amounts_positive;
alter table public.quote_line
  add constraint quote_line_amounts_positive check (
    quantity > 0 and (unit_price_cents >= 0 or kind = 'remise')
  ),
  add constraint quote_line_offert_is_free check (kind <> 'offert' or unit_price_cents = 0);

comment on column public.quote_line.kind is
  'facturable : compte dans les totaux · offert : montré à zéro (bonus) · remise : montant négatif visible · informatif : montré, hors totaux (budget média).';


-- =============================================================================
-- 3. Les taux figés — les vues font `coalesce(document.rate, settings.rate)`
-- =============================================================================
-- Les colonnes existantes gardent leur nom, leur type et leur ordre ; deux
-- sous-totaux s'ajoutent à la fin : ponctuel et récurrent, hors taxes.

create or replace view public.quote_total as
  with base as (
    select
      q.id as quote_id,
      q.agency_id,
      coalesce(q.tps_rate, s.tps_rate) as tps_rate,
      coalesce(q.tvq_rate, s.tvq_rate) as tvq_rate,
      coalesce(sum(case when l.kind in ('facturable', 'remise') then l.quantity * l.unit_price_cents else 0 end), 0) as subtotal,
      coalesce(sum(case when l.kind in ('facturable', 'remise') and l.billing = 'ponctuel' then l.quantity * l.unit_price_cents else 0 end), 0) as ponctuel,
      coalesce(sum(case when l.kind in ('facturable', 'remise') and l.billing <> 'ponctuel' then l.quantity * l.unit_price_cents else 0 end), 0) as recurrent
    from public.quote q
    join public.agency_settings s on s.agency_id = q.agency_id
    left join public.quote_line l on l.quote_id = q.id
    group by q.id, q.agency_id, q.tps_rate, q.tvq_rate, s.tps_rate, s.tvq_rate
  )
  select
    quote_id,
    agency_id,
    subtotal::bigint as subtotal_cents,
    round(subtotal * tps_rate)::bigint as tps_cents,
    round(subtotal * tvq_rate)::bigint as tvq_cents,
    (subtotal + round(subtotal * tps_rate) + round(subtotal * tvq_rate))::bigint as total_cents,
    ponctuel::bigint as ponctuel_cents,
    recurrent::bigint as recurrent_cents
  from base;

alter view public.quote_total set (security_invoker = on);


alter table public.invoice
  add column tps_rate      numeric(6,5),
  add column tvq_rate      numeric(6,5),
  add column rendered_html text,
  add column access_token  text,
  add constraint invoice_rates_pairing check ((tps_rate is null) = (tvq_rate is null)),
  add constraint invoice_rates_range   check (
    (tps_rate is null or tps_rate between 0 and 1) and (tvq_rate is null or tvq_rate between 0 and 1)
  ),
  add constraint invoice_token_length  check (access_token is null or length(access_token) >= 24);

create unique index invoice_access_token_unique on public.invoice (access_token) where access_token is not null;

create or replace view public.invoice_total as
  with base as (
    select
      i.id as invoice_id,
      i.agency_id,
      i.client_id,
      coalesce(i.tps_rate, s.tps_rate) as tps_rate,
      coalesce(i.tvq_rate, s.tvq_rate) as tvq_rate,
      coalesce(sum(l.quantity * l.unit_price_cents), 0) as subtotal
    from public.invoice i
    join public.agency_settings s on s.agency_id = i.agency_id
    left join public.invoice_line l on l.invoice_id = i.id
    group by i.id, i.agency_id, i.client_id, i.tps_rate, i.tvq_rate, s.tps_rate, s.tvq_rate
  )
  select
    invoice_id,
    agency_id,
    client_id,
    subtotal::bigint as subtotal_cents,
    round(subtotal * tps_rate)::bigint as tps_cents,
    round(subtotal * tvq_rate)::bigint as tvq_cents,
    (subtotal + round(subtotal * tps_rate) + round(subtotal * tvq_rate))::bigint as total_cents
  from base;

alter view public.invoice_total set (security_invoker = on);


-- =============================================================================
-- 4. Les sections du document
-- =============================================================================
-- Copiées de `document_template_section` à la création du brouillon, puis
-- au document : modifier le modèle, le contact ou le forfait ne les réécrit
-- pas. Une section verrouillée ne bouge plus.

create table public.document_section (
  id            uuid primary key default gen_random_uuid(),
  quote_id      uuid not null references public.quote(id) on delete cascade,

  key           text not null,
  title         text not null,
  position      smallint not null,
  body          text,

  -- Section optionnelle retirée pour ce document.
  optional      boolean not null default false,
  enabled       boolean not null default true,
  -- Paragraphe validé : plus touché par une régénération.
  locked        boolean not null default false,
  -- Le texte vient de l'IA et attend une relecture : bloque l'envoi (règle 1).
  ai_generated  boolean not null default false,
  reviewed_at   timestamptz,
  reviewed_by   uuid references public.agency_member(id) on delete set null,
  max_chars     integer,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint document_section_key_unique check (key ~ '^[a-z][a-z0-9_]*$'),
  constraint document_section_key_per_quote unique (quote_id, key),
  constraint document_section_position_positive check (position > 0),
  constraint document_section_max_chars_positive check (max_chars is null or max_chars > 0)
);

create index document_section_quote_idx on public.document_section (quote_id, position);
create index document_section_reviewed_by_idx on public.document_section (reviewed_by);

create trigger document_section_touch
  before update on public.document_section
  for each row execute function app.touch_updated_at();


-- =============================================================================
-- 5. Le journal, la signature
-- =============================================================================

create type public.document_event_kind as enum (
  'cree', 'modifie', 'envoye', 'relance', 'ouvert', 'accepte', 'refuse', 'signe', 'paye', 'corrige', 'annule'
);

create table public.document_event (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references public.agency(id) on delete cascade,
  -- Une seule clé posée : le document concerné.
  quote_id     uuid references public.quote(id) on delete cascade,
  invoice_id   uuid references public.invoice(id) on delete cascade,
  contract_id  uuid references public.contract(id) on delete cascade,

  kind         public.document_event_kind not null,
  occurred_at  timestamptz not null default now(),
  -- Qui : un membre de l'agence, ou le contact du client (acceptation, signature).
  member_id    uuid references public.agency_member(id) on delete set null,
  contact_id   uuid references public.contact(id) on delete set null,
  -- Le numéro de version concerné, quand il y en a un (envoi, correction).
  version      smallint,
  note         text,

  constraint document_event_one_document check (
    (case when quote_id    is not null then 1 else 0 end)
  + (case when invoice_id  is not null then 1 else 0 end)
  + (case when contract_id is not null then 1 else 0 end) = 1
  )
);

create index document_event_quote_idx    on public.document_event (quote_id, occurred_at);
create index document_event_invoice_idx  on public.document_event (invoice_id, occurred_at);
create index document_event_contract_idx on public.document_event (contract_id, occurred_at);
create index document_event_agency_idx   on public.document_event (agency_id);
create index document_event_member_idx   on public.document_event (member_id);
create index document_event_contact_idx  on public.document_event (contact_id);


-- Signature simple : le nom tapé, la date, l'adresse — ce que la clause 18.5
-- du contrat réel autorise. Pas une signature électronique certifiée.
create table public.document_signature (
  id                   uuid primary key default gen_random_uuid(),
  quote_id             uuid references public.quote(id) on delete cascade,
  contract_id          uuid references public.contract(id) on delete cascade,
  version              smallint not null default 1,
  contact_id           uuid references public.contact(id) on delete set null,
  typed_name           text not null,
  signed_at            timestamptz not null default now(),
  ip                   text,
  user_agent           text,
  -- L'empreinte de ce qui a été signé : le HTML rendu, tel quel.
  rendered_html_sha256 text,

  constraint document_signature_one_document check (
    (quote_id is not null)::int + (contract_id is not null)::int = 1
  ),
  constraint document_signature_name_present check (length(trim(typed_name)) > 0)
);

create index document_signature_quote_idx    on public.document_signature (quote_id);
create index document_signature_contract_idx on public.document_signature (contract_id);
create index document_signature_contact_idx  on public.document_signature (contact_id);


-- =============================================================================
-- 6. Les règles que le moteur tient
-- =============================================================================

-- Créer un brouillon demande « Gérer les comptes » (ou « Envoyer des
-- documents ») ; passer un devis à « envoyé » demande « Envoyer des
-- documents », des taux, un corps rendu, et les numéros de taxes de l'agence.
-- Les vérifications de droit ne s'appliquent qu'à une session authentifiée :
-- un semis joué par l'administrateur de la base n'a pas de membre.
create or replace function app.guard_quote()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare gst text; qst text;
begin
  if tg_op = 'INSERT' then
    if (select auth.uid()) is not null
       and not (app.member_has('manage_clients') or app.member_has('send_documents')) then
      raise exception 'Créer un document demande le droit « Gérer les comptes ».'
        using errcode = 'insufficient_privilege';
    end if;
    return new;
  end if;

  -- Le passage à « envoyé ».
  if new.status = 'envoye' and old.status is distinct from 'envoye' then
    if (select auth.uid()) is not null and not app.member_has('send_documents') then
      raise exception 'Envoyer un document demande le droit « Envoyer des documents ».'
        using errcode = 'insufficient_privilege';
    end if;
    select a.gst_number, a.qst_number into gst, qst from public.agency a where a.id = new.agency_id;
    if nullif(trim(coalesce(gst, '')), '') is null or nullif(trim(coalesce(qst, '')), '') is null then
      raise exception 'Ce document réclame les taxes : renseignez les numéros de TPS et de TVQ de l''agence avant de l''envoyer.'
        using errcode = 'check_violation';
    end if;
    if new.rendered_html is null or new.tps_rate is null or new.sent_at is null then
      raise exception 'Un document envoyé porte son corps rendu, ses taux et sa date d''envoi.'
        using errcode = 'check_violation';
    end if;
    if exists (select 1 from public.document_section s
                where s.quote_id = new.id and s.enabled and s.ai_generated and s.reviewed_at is null) then
      raise exception 'Une section écrite par l''IA attend une relecture : relisez-la avant d''envoyer.'
        using errcode = 'check_violation';
    end if;
  end if;

  -- Une fois parti, le document ne se réécrit pas : seul son sort change
  -- (accepté, refusé, expiré, corrigé), plus les traces que ce sort laisse.
  -- C'est l'envoi (`sent_at`) qui gèle, pas le statut seul : un devis semé
  -- « envoyé » sans date d'envoi n'est pas parti par le générateur.
  if old.sent_at is not null and old.status <> 'brouillon' and new.status <> 'brouillon' then
    if new.subject       is distinct from old.subject
       or new.client_id  is distinct from old.client_id
       or new.template_id is distinct from old.template_id
       or new.kind       is distinct from old.kind
       or new.rendered_html is distinct from old.rendered_html
       or new.tps_rate   is distinct from old.tps_rate
       or new.tvq_rate   is distinct from old.tvq_rate
       or new.sent_at    is distinct from old.sent_at
       or new.issued_on  is distinct from old.issued_on then
      raise exception 'Le document % est parti chez le client : corrigez-le dans une nouvelle version.', old.ref
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

create trigger quote_guard
  before insert or update on public.quote
  for each row execute function app.guard_quote();


-- Les lignes et les sections d'un document parti sont gelées ; elles
-- redeviennent modifiables quand une correction le ramène au brouillon.
create or replace function app.protect_sent_quote_children()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare st public.quote_status; reference text; envoye timestamptz;
begin
  select q.status, q.ref, q.sent_at into st, reference, envoye
    from public.quote q
   where q.id = case when tg_op = 'DELETE' then old.quote_id else new.quote_id end;

  if envoye is not null and st is distinct from 'brouillon' then
    raise exception 'Le document % est parti chez le client : ses lignes et ses sections sont gelées.', reference
      using errcode = 'check_violation';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger quote_line_protect_sent
  before insert or update or delete on public.quote_line
  for each row execute function app.protect_sent_quote_children();

create trigger document_section_protect_sent
  before insert or update or delete on public.document_section
  for each row execute function app.protect_sent_quote_children();


-- Envoyer une facture demande « Facturer » et les numéros de taxes.
create or replace function app.guard_invoice_send()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare gst text; qst text;
begin
  if new.sent_at is not null and old.sent_at is null then
    if (select auth.uid()) is not null and not app.member_has('manage_billing') then
      raise exception 'Envoyer une facture demande le droit « Facturer ».'
        using errcode = 'insufficient_privilege';
    end if;
    select a.gst_number, a.qst_number into gst, qst from public.agency a where a.id = new.agency_id;
    if nullif(trim(coalesce(gst, '')), '') is null or nullif(trim(coalesce(qst, '')), '') is null then
      raise exception 'Cette facture réclame les taxes : renseignez les numéros de TPS et de TVQ de l''agence avant de l''envoyer.'
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create trigger invoice_guard_send
  before update on public.invoice
  for each row execute function app.guard_invoice_send();


-- =============================================================================
-- 7. Le lien remis au client
-- =============================================================================
-- Le client n'a pas de compte : il reçoit un lien à jeton. Ces deux fonctions
-- sont les seules portes : l'une lit le document rendu, l'autre l'accepte ou
-- le refuse. Rien d'autre du document n'est exposé.

create or replace function public.document_by_token(p_token text)
returns table (
  kind            text,
  ref             text,
  status          text,
  subject         text,
  client_name     text,
  contact_name    text,
  agency_name     text,
  rendered_html   text,
  sent_at         timestamptz,
  expires_on      date,
  due_on          date,
  decided_on      date,
  total_cents     bigint,
  can_decide      boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare q record; i record;
begin
  if p_token is null or length(p_token) < 24 then
    return;
  end if;

  select qq.*, c.name as cname, ct.full_name as contact_full_name, a.name as aname, t.total_cents as total
    into q
    from public.quote qq
    join public.client c on c.id = qq.client_id
    join public.agency a on a.id = qq.agency_id
    left join public.contact ct on ct.id = qq.contact_id
    left join public.quote_total t on t.quote_id = qq.id
   where qq.access_token = p_token and qq.sent_at is not null;

  if found then
    -- La première ouverture se note, une fois.
    if not exists (select 1 from public.document_event e where e.quote_id = q.id and e.kind = 'ouvert') then
      insert into public.document_event (agency_id, quote_id, kind, contact_id)
      values (q.agency_id, q.id, 'ouvert', q.contact_id);
    end if;
    return query select
      q.kind::text, q.ref, q.status::text, q.subject, q.cname, q.contact_full_name, q.aname,
      q.rendered_html, q.sent_at, q.expires_on, null::date,
      coalesce(q.accepted_on, q.refused_on),
      q.total,
      (q.status = 'envoye' and (q.expires_on is null or q.expires_on >= current_date));
    return;
  end if;

  select ii.*, c.name as cname, a.name as aname, t.total_cents as total
    into i
    from public.invoice ii
    join public.client c on c.id = ii.client_id
    join public.agency a on a.id = ii.agency_id
    left join public.invoice_total t on t.invoice_id = ii.id
   where ii.access_token = p_token and ii.sent_at is not null;

  if found then
    if not exists (select 1 from public.document_event e where e.invoice_id = i.id and e.kind = 'ouvert') then
      insert into public.document_event (agency_id, invoice_id, kind)
      values (i.agency_id, i.id, 'ouvert');
    end if;
    return query select
      'facture'::text, i.ref, i.status::text, null::text, i.cname, null::text, i.aname,
      i.rendered_html, i.sent_at, null::date, i.due_on, i.paid_on, i.total, false;
  end if;
end;
$$;

revoke all on function public.document_by_token(text) from public;
grant execute on function public.document_by_token(text) to anon, authenticated;


create or replace function public.decide_document_by_token(
  p_token text, p_accept boolean, p_typed_name text, p_reason text, p_ip text, p_user_agent text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare q record; v smallint;
begin
  if p_token is null or length(p_token) < 24 then
    raise exception 'Lien invalide.' using errcode = 'no_data_found';
  end if;

  select * into q from public.quote where access_token = p_token and sent_at is not null;
  if not found then
    raise exception 'Ce lien ne mène à aucun document.' using errcode = 'no_data_found';
  end if;
  if q.status <> 'envoye' then
    raise exception 'Ce document a déjà reçu une réponse.' using errcode = 'check_violation';
  end if;
  if q.expires_on is not null and q.expires_on < current_date then
    raise exception 'Ce document a expiré : demandez-en une nouvelle version.' using errcode = 'check_violation';
  end if;

  select coalesce(max(version), 1) into v from public.quote_version where quote_id = q.id;

  if p_accept then
    if nullif(trim(coalesce(p_typed_name, '')), '') is null then
      raise exception 'Tapez votre nom pour accepter.' using errcode = 'check_violation';
    end if;
    update public.quote set status = 'accepte', accepted_on = current_date where id = q.id;
    insert into public.document_signature (quote_id, version, contact_id, typed_name, ip, user_agent, rendered_html_sha256)
    values (q.id, v, q.contact_id, trim(p_typed_name), p_ip, p_user_agent, encode(sha256(convert_to(coalesce(q.rendered_html, ''), 'UTF8')), 'hex'));
    insert into public.document_event (agency_id, quote_id, kind, contact_id, version, note)
    values (q.agency_id, q.id, 'accepte', q.contact_id, v, 'Accepté par ' || trim(p_typed_name));
    return 'accepte';
  end if;

  update public.quote
     set status = 'refuse', refused_on = current_date, refusal_note = nullif(trim(coalesce(p_reason, '')), '')
   where id = q.id;
  insert into public.document_event (agency_id, quote_id, kind, contact_id, version, note)
  values (q.agency_id, q.id, 'refuse', q.contact_id, v, nullif(trim(coalesce(p_reason, '')), ''));
  return 'refuse';
end;
$$;

revoke all on function public.decide_document_by_token(text, boolean, text, text, text, text) from public;
grant execute on function public.decide_document_by_token(text, boolean, text, text, text, text) to anon, authenticated;


-- =============================================================================
-- 8. Cloisonnement
-- =============================================================================

alter table public.document_section   enable row level security;
alter table public.document_event     enable row level security;
alter table public.document_signature enable row level security;

create policy document_section_agency_all on public.document_section
  for all to authenticated
  using (exists (select 1 from public.quote q
                  where q.id = public.document_section.quote_id
                    and q.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.quote q
                  where q.id = public.document_section.quote_id
                    and q.agency_id = app.current_agency_id()));

-- Le journal se lit et s'alimente dans l'agence ; il ne se corrige pas.
create policy document_event_agency_read on public.document_event
  for select to authenticated
  using (agency_id = app.current_agency_id());

create policy document_event_agency_insert on public.document_event
  for insert to authenticated
  with check (agency_id = app.current_agency_id());

-- Une signature se lit dans l'agence ; elle ne s'écrit que par le lien du client.
create policy document_signature_agency_read on public.document_signature
  for select to authenticated
  using (
    exists (select 1 from public.quote q where q.id = public.document_signature.quote_id and q.agency_id = app.current_agency_id())
    or exists (select 1 from public.contract c where c.id = public.document_signature.contract_id and c.agency_id = app.current_agency_id())
  );

-- Le client voit ses propres documents, une fois envoyés — jamais un brouillon.
create policy quote_portal_read on public.quote
  for select to authenticated
  using (client_id = app.current_client_id() and sent_at is not null);

create policy quote_line_portal_read on public.quote_line
  for select to authenticated
  using (exists (select 1 from public.quote q
                  where q.id = public.quote_line.quote_id
                    and q.client_id = app.current_client_id()
                    and q.sent_at is not null));
