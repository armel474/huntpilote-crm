-- =============================================================================
-- 0013 — Les documents de l'agence : identité, modèles, numérotation
-- =============================================================================
-- Un devis et une facture sortent de l'agence et engagent sa responsabilité.
-- Trois choses leur manquaient :
--
-- 1. **L'identité de l'émetteur.** `agency` ne portait qu'un nom et un slug.
--    Une facture québécoise qui réclame la TPS et la TVQ doit afficher les
--    numéros d'inscription correspondants — ce n'est pas une préférence de
--    mise en page, c'est une obligation. Sans eux, le client ne peut pas
--    réclamer ses crédits de taxe.
--
-- 2. **Des modèles.** Les conditions de paiement, les mentions légales, le
--    pied de page et le préfixe de numérotation changent d'un type de
--    document à l'autre et se révisent avec le temps. Les retaper à chaque
--    fois garantit qu'ils finiront par diverger.
--
-- 3. **Des lignes de facture.** `invoice` portait un `amount_cents` unique —
--    un total sans rien pour l'expliquer. On ne peut ni facturer un forfait
--    ligne à ligne, ni justifier un montant à un client qui le conteste. Le
--    total rejoint `quote_total` : il se calcule.
--
-- Et une règle que le moteur tient : **une facture envoyée ne se modifie
-- plus.** On ne corrige pas une facture partie chez le client ; on en émet
-- une autre. Ses lignes sont gelées avec elle.
-- =============================================================================


create type public.document_kind as enum ('devis', 'facture');


-- =============================================================================
-- Qui émet le document
-- =============================================================================

alter table public.agency
  -- La raison sociale peut différer du nom commercial affiché dans l'outil.
  add column legal_name   text,
  add column address      text,
  add column city         text,
  add column province     text default 'QC',
  add column postal_code  text,
  add column country      text default 'CA',
  add column phone        text,
  add column email        text,
  add column website      text,
  add column logo_url     text,
  -- Numéros d'inscription aux taxes. Obligatoires sur une facture qui les
  -- réclame — c'est ce qui permet au client de récupérer les siennes.
  add column gst_number   text,
  add column qst_number   text;


-- =============================================================================
-- Les modèles de document
-- =============================================================================

create table public.document_template (
  id                  uuid primary key default gen_random_uuid(),
  agency_id           uuid not null references public.agency(id) on delete cascade,

  kind                public.document_kind not null,
  name                text not null,
  is_default          boolean not null default false,

  -- Numérotation : « DV » + année + numéro sur 3 chiffres donne `DV-2026-017`.
  prefix              text,
  include_year        boolean not null default true,
  number_padding      smallint not null default 3,

  -- Le délai de paiement par défaut, en jours. C'est lui qui pose l'échéance
  -- d'une facture, et donc ce qui la déclare en retard.
  payment_terms_days  integer not null default 30,

  -- Ce qui s'imprime autour des lignes.
  intro               text,
  legal_mentions      text,
  footer              text,
  payment_instructions text,

  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint document_template_padding_range check (number_padding between 1 and 8),
  constraint document_template_terms_positive check (payment_terms_days >= 0)
);

create index document_template_agency_idx on public.document_template (agency_id, kind);
-- Un seul modèle par défaut par type : « lequel s'applique ? » ne doit jamais
-- être une question.
create unique index document_template_one_default
  on public.document_template (agency_id, kind) where is_default;

create trigger document_template_touch
  before update on public.document_template
  for each row execute function app.touch_updated_at();


-- Fabrique la référence suivante à partir d'un modèle : `DV-2026-017`.
-- Le compteur de la migration 0012 garantit qu'aucune n'est servie deux fois.
create or replace function app.next_document_ref(p_template uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare t record; n integer; annee integer;
begin
  select * into t from public.document_template where id = p_template;
  if not found then
    raise exception 'Modèle de document introuvable : %', p_template;
  end if;

  annee := case when t.include_year then extract(year from current_date)::integer else 0 end;
  n := app.next_number(t.agency_id, t.kind::text, annee);

  return concat_ws('-',
    nullif(t.prefix, ''),
    case when t.include_year then annee::text end,
    lpad(n::text, t.number_padding, '0'));
end;
$$;


-- Les documents savent de quel modèle ils sont sortis : c'est ce qui permet
-- de les réimprimer à l'identique, et de retrouver quelles conditions de
-- paiement s'appliquaient au moment de l'envoi.
alter table public.quote
  add column template_id uuid references public.document_template(id) on delete set null;
create index quote_template_idx on public.quote (template_id);

alter table public.invoice
  add column template_id uuid references public.document_template(id) on delete set null,
  -- La date d'envoi au client. C'est elle qui gèle le document, pas le statut
  -- de paiement : une facture part avant d'être payée.
  add column sent_at     timestamptz;
create index invoice_template_idx on public.invoice (template_id);


-- =============================================================================
-- Une facture a des lignes
-- =============================================================================

create table public.invoice_line (
  id               uuid primary key default gen_random_uuid(),
  invoice_id       uuid not null references public.invoice(id) on delete cascade,
  position         smallint not null,
  description      text not null,
  quantity         numeric(8,2) not null default 1,
  unit_price_cents integer not null,

  -- D'où vient la ligne, quand elle vient du catalogue. Elle garde sa propre
  -- description et son propre prix : une facture est un constat, pas une vue
  -- sur un catalogue qui bouge.
  catalog_item_id  uuid references public.catalog_item(id) on delete set null,
  offer_id         uuid references public.offer(id) on delete set null,
  -- La période facturée, pour un service reconduit.
  period_month     date,

  constraint invoice_line_position_unique unique (invoice_id, position),
  constraint invoice_line_amounts_positive check (quantity > 0 and unit_price_cents >= 0),
  constraint invoice_line_one_origin check (catalog_item_id is null or offer_id is null),
  constraint invoice_line_period_is_month check (
    period_month is null or extract(day from period_month) = 1
  )
);

create index invoice_line_invoice_idx on public.invoice_line (invoice_id);
create index invoice_line_catalog_item_idx on public.invoice_line (catalog_item_id);
create index invoice_line_offer_idx on public.invoice_line (offer_id);


-- `amount_cents` disparaît : c'était un total posé à côté de rien. Le montant
-- se lit désormais dans `invoice_total`, exactement comme pour un devis.
alter table public.invoice drop column amount_cents;

create view public.invoice_total as
  select
    i.id as invoice_id,
    i.agency_id,
    i.client_id,
    coalesce(sum(l.quantity * l.unit_price_cents), 0)::bigint as subtotal_cents,
    round(coalesce(sum(l.quantity * l.unit_price_cents), 0) * s.tps_rate)::bigint as tps_cents,
    round(coalesce(sum(l.quantity * l.unit_price_cents), 0) * s.tvq_rate)::bigint as tvq_cents,
    -- Même convention que `quote_total` : on additionne les parties arrondies
    -- pour que la somme des lignes affichées fasse le total affiché.
    (coalesce(sum(l.quantity * l.unit_price_cents), 0)
     + round(coalesce(sum(l.quantity * l.unit_price_cents), 0) * s.tps_rate)
     + round(coalesce(sum(l.quantity * l.unit_price_cents), 0) * s.tvq_rate))::bigint as total_cents
  from public.invoice i
  join public.agency_settings s on s.agency_id = i.agency_id
  left join public.invoice_line l on l.invoice_id = i.id
  group by i.id, i.agency_id, i.client_id, s.tps_rate, s.tvq_rate;

alter view public.invoice_total set (security_invoker = on);


-- =============================================================================
-- Une facture envoyée ne se modifie plus
-- =============================================================================
-- On ne corrige pas une facture partie chez le client : on en émet une autre,
-- ou on l'annule. Seuls le suivi de paiement et l'annulation restent
-- possibles — le reste est figé, lignes comprises.

create or replace function app.protect_sent_invoice()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.sent_at is not null then
      raise exception
        'La facture % est partie chez le client : elle s''annule, elle ne se supprime pas.', old.ref;
    end if;
    return old;
  end if;

  if old.sent_at is null then
    return new;                       -- brouillon : encore modifiable
  end if;

  -- Ce qui reste permis une fois envoyée : constater le paiement, ajuster
  -- l'échéance, annuler.
  if new.ref            is distinct from old.ref
     or new.client_id   is distinct from old.client_id
     or new.period_month is distinct from old.period_month
     or new.issued_on   is distinct from old.issued_on
     or new.template_id is distinct from old.template_id
     or new.sent_at     is distinct from old.sent_at then
    raise exception
      'La facture % est partie chez le client : seuls le paiement, l''échéance et l''annulation peuvent encore changer.',
      old.ref;
  end if;

  return new;
end;
$$;

create trigger invoice_protect_sent
  before update or delete on public.invoice
  for each row execute function app.protect_sent_invoice();


create or replace function app.protect_sent_invoice_lines()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare envoyee timestamptz; reference text;
begin
  select i.sent_at, i.ref into envoyee, reference
    from public.invoice i
   where i.id = case when tg_op = 'DELETE' then old.invoice_id else new.invoice_id end;

  if envoyee is not null then
    raise exception
      'Les lignes de la facture % sont gelées : elle est partie chez le client.', reference;
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger invoice_line_protect_sent
  before insert or update or delete on public.invoice_line
  for each row execute function app.protect_sent_invoice_lines();


-- =============================================================================
-- Cloisonnement
-- =============================================================================

alter table public.document_template enable row level security;
alter table public.invoice_line      enable row level security;

create policy document_template_agency_all on public.document_template
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy invoice_line_agency_all on public.invoice_line
  for all to authenticated
  using (exists (select 1 from public.invoice i
                  where i.id = public.invoice_line.invoice_id
                    and i.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.invoice i
                  where i.id = public.invoice_line.invoice_id
                    and i.agency_id = app.current_agency_id()));

-- Le client voit ses propres factures, une fois envoyées — c'est son document,
-- il l'a payé. Un brouillon n'est pas une facture : tant qu'elle n'est pas
-- partie, elle n'existe pas pour lui (même discipline que la règle 1 sur les
-- rapports non publiés).
create policy invoice_portal_read on public.invoice
  for select to authenticated
  using (client_id = app.current_client_id() and sent_at is not null);

create policy invoice_line_portal_read on public.invoice_line
  for select to authenticated
  using (exists (select 1 from public.invoice i
                  where i.id = public.invoice_line.invoice_id
                    and i.client_id = app.current_client_id()
                    and i.sent_at is not null));
