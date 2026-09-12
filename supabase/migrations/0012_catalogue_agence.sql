-- =============================================================================
-- 0012 — Le catalogue de l'agence : produits, services, offres
-- =============================================================================
-- Ce que l'agence vend n'existait nulle part. Quatre vocabulaires s'en
-- approchaient sans jamais se rejoindre : `badge` valait « Croissance » sur un
-- client, `workflow.FORFAITS` listait trois paliers, `CLIENT.plan` disait
-- « Croissance SEO », et `onboarding.SERVICES` portait cinq services avec des
-- prix. Aucun n'était paramétrable, et aucun ne servait à rien d'autre qu'à
-- s'afficher.
--
-- Les conséquences se voyaient partout : impossible d'établir un devis sans
-- retaper chaque ligne, impossible de facturer un forfait, et chaque tâche
-- d'un mandat devait être inventée — à la main ou par un modèle de langage qui
-- devine ce que l'agence a vendu.
--
-- Trois notions, une table pour les lignes facturables et une pour les
-- assemblages :
--
--   · un **produit** se vend une fois et se livre une fois (un audit complet,
--     une refonte, un lot de dix articles) ;
--   · un **service** se vend au mois et se reconduit (SEO technique, contenu,
--     SEO local) ;
--   · une **offre** — le forfait — assemble les deux sous un nom et un prix
--     qui n'est *pas* la somme de ses parties : c'est là qu'est la remise, et
--     elle doit se voir.
--
-- Et surtout : **une offre décrit le travail qu'elle engage.** Vendre le
-- forfait Croissance à un compte crée les tâches de ce forfait. C'est la
-- différence entre un CRM qui enregistre ce qu'on a vendu et un CRM qui sait
-- ce qu'on a promis.
-- =============================================================================


-- =============================================================================
-- Vocabulaires
-- =============================================================================

create type public.catalog_kind as enum (
  'service',  -- reconduit, facturé par période
  'produit'   -- vendu et livré une fois
);

create type public.billing_period as enum ('mensuel', 'trimestriel', 'annuel', 'ponctuel');

-- À quel rythme une offre engage un travail. `signature` = une seule fois, au
-- démarrage du mandat (l'audit initial, la configuration des accès).
create type public.task_cadence as enum (
  'signature', 'mensuel', 'trimestriel', 'annuel'
);


-- =============================================================================
-- Une numérotation qui ne se répète pas
-- =============================================================================
-- Les tâches, les devis et les factures portent tous un numéro lisible
-- (`#142`, `DV-2026-017`, `2026-0431`). Deux objets ne peuvent pas partager le
-- leur — pour une facture, c'est une obligation, pas une préférence. Un
-- compteur par agence, par usage et par année, incrémenté de façon atomique.

create table public.number_counter (
  agency_id   uuid not null references public.agency(id) on delete cascade,
  scope       text not null,          -- 'task', 'quote', 'invoice', 'audit'…
  year        smallint not null,      -- 0 = compteur continu, sans remise à zéro
  next_value  integer not null default 1,
  primary key (agency_id, scope, year),
  constraint number_counter_positive check (next_value > 0)
);

-- Rend le prochain numéro et avance le compteur, en une seule opération.
-- `p_year` à 0 donne un compteur continu (les tâches), sinon il repart à 1
-- chaque année (les devis et les factures).
-- `p_year` est un `integer` et non un `smallint` : une année s'écrit `2026`
-- dans un appel, pas `2026::smallint`. La conversion est faite ici, une fois.
create or replace function app.next_number(
  p_agency uuid, p_scope text, p_year integer default 0
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare v integer;
begin
  insert into public.number_counter (agency_id, scope, year, next_value)
  values (p_agency, p_scope, p_year::smallint, 2)
  on conflict (agency_id, scope, year)
    do update set next_value = public.number_counter.next_value + 1
  returning public.number_counter.next_value - 1 into v;

  return v;
end;
$$;


-- =============================================================================
-- Le catalogue
-- =============================================================================
-- `service` (migration 0002) devient `catalog_item` : la table portait déjà un
-- code, un nom et un prix, il lui manquait de savoir si elle décrivait un
-- service ou un produit. Une ligne de devis ou de facture doit pouvoir pointer
-- vers l'un comme vers l'autre sans se demander dans quelle table chercher.

alter table public.service rename to catalog_item;

alter index service_code_unique rename to catalog_item_code_unique;
alter table public.catalog_item rename constraint service_price_positive to catalog_item_price_positive;

alter table public.catalog_item
  add column kind      public.catalog_kind not null default 'service',
  -- À quel rythme l'article se facture. Un produit est ponctuel par nature ;
  -- un service ne l'est jamais.
  add column billing   public.billing_period not null default 'mensuel',
  -- L'unité qui donne son sens à la quantité : « 3 » ne veut rien dire, « 3
  -- articles » ou « 3 heures », si.
  add column unit      text,
  add column active    boolean not null default true,
  add column position  smallint not null default 0,
  add constraint catalog_item_billing_matches_kind check (
    (kind = 'produit') = (billing = 'ponctuel')
  );

create index catalog_item_agency_idx on public.catalog_item (agency_id);

alter table public.catalog_item
  add column updated_at timestamptz not null default now();

create trigger catalog_item_touch
  before update on public.catalog_item
  for each row execute function app.touch_updated_at();


-- L'offre : un assemblage nommé, avec son propre prix.
create table public.offer (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references public.agency(id) on delete cascade,

  code         text not null,
  name         text not null,
  description  text,

  -- Le prix du forfait. Il n'est pas la somme de ses composants : c'est tout
  -- l'intérêt d'un forfait, et la vue `offer_value` montre l'écart.
  price_cents  integer,
  billing      public.billing_period not null default 'mensuel',

  active       boolean not null default true,
  position     smallint not null default 0,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint offer_code_unique unique (agency_id, code),
  constraint offer_price_positive check (price_cents is null or price_cents >= 0)
);

create index offer_agency_idx on public.offer (agency_id);

create trigger offer_touch
  before update on public.offer
  for each row execute function app.touch_updated_at();


-- Ce que l'offre contient.
create table public.offer_line (
  offer_id         uuid not null references public.offer(id) on delete cascade,
  catalog_item_id  uuid not null references public.catalog_item(id) on delete restrict,
  quantity         numeric(8,2) not null default 1,
  position         smallint not null default 0,

  primary key (offer_id, catalog_item_id),
  constraint offer_line_quantity_positive check (quantity > 0)
);

create index offer_line_item_idx on public.offer_line (catalog_item_id);


-- =============================================================================
-- Ce que l'offre engage comme travail
-- =============================================================================
-- Le cœur de la migration. Une offre ne dit pas seulement combien elle coûte,
-- elle dit ce qu'on s'est engagé à faire — et à quel rythme. Personne n'a plus
-- à se souvenir que « Croissance » implique un audit trimestriel.

create table public.offer_task_template (
  id              uuid primary key default gen_random_uuid(),
  offer_id        uuid not null references public.offer(id) on delete cascade,

  title           text not null,
  description     text,
  kind            text not null default 'technique',
  cadence         public.task_cadence not null,
  estimate_hours  numeric(5,1),

  -- Le jour du mois où la tâche est due. Null = le dernier jour de la période.
  due_day         smallint,
  -- Le rôle à qui elle revient par défaut ; l'assignation nominative reste
  -- une décision humaine.
  default_role    public.agency_role,

  position        smallint not null default 0,
  created_at      timestamptz not null default now(),

  constraint offer_task_template_kind_known check (kind in ('technique', 'contenu')),
  constraint offer_task_template_due_day_range check (due_day is null or due_day between 1 and 28),
  constraint offer_task_template_estimate_positive
    check (estimate_hours is null or estimate_hours > 0)
);

create index offer_task_template_offer_idx on public.offer_task_template (offer_id);


-- =============================================================================
-- Ce à quoi un compte a souscrit
-- =============================================================================
-- `client_service` ne portait qu'un lien (client, service) sans date ni prix :
-- impossible de dire depuis quand un mandat court, ni à quel prix il a été
-- signé. Elle est remplacée — elle n'a jamais contenu de ligne.

drop table public.client_service;

create table public.client_subscription (
  id               uuid primary key default gen_random_uuid(),
  agency_id        uuid not null references public.agency(id) on delete cascade,
  client_id        uuid not null references public.client(id) on delete cascade,

  -- Un compte souscrit à une offre, ou à un article seul. Jamais aux deux sur
  -- la même ligne : sinon on ne sait plus ce qu'on facture.
  offer_id         uuid references public.offer(id) on delete restrict,
  catalog_item_id  uuid references public.catalog_item(id) on delete restrict,

  quantity         numeric(8,2) not null default 1,
  -- Le prix signé, recopié au moment de la souscription. Le catalogue peut
  -- augmenter : les mandats en cours ne bougent pas.
  price_cents      integer not null,
  billing          public.billing_period not null default 'mensuel',

  started_on       date not null default current_date,
  ended_on         date,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint client_subscription_one_target check (
    (offer_id is not null) <> (catalog_item_id is not null)
  ),
  constraint client_subscription_price_positive check (price_cents >= 0),
  constraint client_subscription_quantity_positive check (quantity > 0),
  constraint client_subscription_dates_ordered check (ended_on is null or ended_on >= started_on)
);

create index client_subscription_client_idx on public.client_subscription (client_id);
create index client_subscription_agency_idx on public.client_subscription (agency_id);
create index client_subscription_offer_idx on public.client_subscription (offer_id);
create index client_subscription_item_idx on public.client_subscription (catalog_item_id);
-- Un même compte ne souscrit pas deux fois à la même offre en même temps.
create unique index client_subscription_active_unique
  on public.client_subscription (client_id, coalesce(offer_id, catalog_item_id))
  where ended_on is null;

create trigger client_subscription_touch
  before update on public.client_subscription
  for each row execute function app.touch_updated_at();


-- =============================================================================
-- Le revenu récurrent se compte
-- =============================================================================
-- `client.mrr_cents` était une valeur saisie à côté des abonnements qui la
-- produisent — le genre de champ qui finit par ne plus correspondre à rien
-- trois renouvellements plus tard. Il disparaît.

alter table public.client drop column mrr_cents;

create view public.client_mrr as
select
  s.agency_id,
  s.client_id,
  sum(
    case s.billing
      when 'mensuel'     then s.price_cents * s.quantity
      when 'trimestriel' then s.price_cents * s.quantity / 3
      when 'annuel'      then s.price_cents * s.quantity / 12
      else 0                      -- le ponctuel n'est pas du récurrent
    end
  )::bigint as mrr_cents
from public.client_subscription s
where s.ended_on is null
group by s.agency_id, s.client_id;

alter view public.client_mrr set (security_invoker = on);


-- La valeur catalogue d'une offre, et la remise qu'elle accorde. Un forfait
-- dont on ne voit pas la remise est un forfait qu'on ne sait pas défendre.
create view public.offer_value as
select
  o.id as offer_id,
  o.agency_id,
  o.code,
  o.name,
  o.price_cents,
  coalesce(sum(l.quantity * i.price_cents), 0)::bigint        as catalog_value_cents,
  (coalesce(sum(l.quantity * i.price_cents), 0) - coalesce(o.price_cents, 0))::bigint
                                                              as discount_cents
from public.offer o
left join public.offer_line l on l.offer_id = o.id
left join public.catalog_item i on i.id = l.catalog_item_id
group by o.id, o.agency_id, o.code, o.name, o.price_cents;

alter view public.offer_value set (security_invoker = on);


-- =============================================================================
-- Les tâches naissent de l'offre
-- =============================================================================

alter table public.task
  -- Le modèle d'où la tâche vient, et la période qu'elle couvre. Les deux
  -- ensemble empêchent de créer deux fois la tâche d'octobre.
  add column offer_template_id uuid references public.offer_task_template(id) on delete set null,
  add column period_month      date,
  add constraint task_period_is_month check (
    period_month is null or extract(day from period_month) = 1
  ),
  add constraint task_template_needs_period check (
    offer_template_id is null or period_month is not null
  );

create unique index task_from_template_once
  on public.task (client_id, offer_template_id, period_month)
  where offer_template_id is not null;

create index task_offer_template_idx on public.task (offer_template_id);


-- Crée les tâches d'un abonnement pour une période donnée. Idempotente : la
-- relancer ne produit rien de neuf, ce qui permet de la planifier sans risque
-- et de la rejouer après un incident.
create or replace function app.apply_offer_tasks(
  p_subscription uuid, p_period date default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  sub       record;
  modele    record;
  periode   date := coalesce(date_trunc('month', p_period)::date,
                             date_trunc('month', current_date)::date);
  debut     date;
  mois      integer;
  creees    integer := 0;
  numero    integer;
  echeance  date;
begin
  select s.*, o.id as offre
    into sub
    from public.client_subscription s
    left join public.offer o on o.id = s.offer_id
   where s.id = p_subscription;

  if not found or sub.offre is null then
    return 0;                                 -- un article seul n'engage pas de travail
  end if;

  debut := date_trunc('month', sub.started_on)::date;

  -- Hors de la période du mandat, rien n'est dû.
  if periode < debut then return 0; end if;
  if sub.ended_on is not null and periode > date_trunc('month', sub.ended_on)::date then
    return 0;
  end if;

  mois := (extract(year from age(periode, debut)) * 12
           + extract(month from age(periode, debut)))::integer;

  for modele in
    select * from public.offer_task_template t
     where t.offer_id = sub.offre
       and case t.cadence
             when 'signature'    then mois = 0
             when 'mensuel'      then true
             when 'trimestriel'  then mois % 3 = 0
             when 'annuel'       then mois % 12 = 0
           end
     order by t.position, t.id
  loop
    -- On regarde avant d'allouer : un numéro consommé pour rien à chaque
    -- passage de la routine ferait grimper le compteur sans qu'aucune tâche
    -- ne porte le numéro manquant.
    if exists (select 1 from public.task x
                where x.client_id = sub.client_id
                  and x.offer_template_id = modele.id
                  and x.period_month = periode) then
      continue;
    end if;

    echeance := periode + (coalesce(modele.due_day, 28) - 1);
    numero   := app.next_number(sub.agency_id, 'task');

    insert into public.task
      (agency_id, client_id, slug, ref, title, description, kind,
       estimate_hours, due_on, offer_template_id, period_month)
    values
      (sub.agency_id, sub.client_id,
       -- Convention de `docs/reconciliation-donnees.md` : le numéro sert de
       -- slug d'URL, et de référence affichée préfixée.
       numero::text, '#' || numero,
       modele.title, modele.description, modele.kind,
       modele.estimate_hours, echeance, modele.id, periode)
    -- L'index d'unicité est partiel : la clause `where` doit être reprise ici
    -- pour que PostgreSQL sache lequel viser. Le garde-fou sert en cas de
    -- passage concurrent, pas dans le cas courant.
    on conflict (client_id, offer_template_id, period_month)
       where offer_template_id is not null
       do nothing;

    if found then creees := creees + 1; end if;
  end loop;

  return creees;
end;
$$;

comment on function app.apply_offer_tasks(uuid, date) is
  'Crée les tâches engagées par une offre pour une période. Idempotente : '
  'la relancer ne duplique rien. À planifier mensuellement.';


-- Souscrire déclenche le travail de démarrage sans que personne y pense.
create or replace function app.apply_offer_tasks_on_subscription()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app.apply_offer_tasks(new.id, new.started_on);
  return null;
end;
$$;

create trigger client_subscription_creates_tasks
  after insert on public.client_subscription
  for each row
  when (new.offer_id is not null)
  execute function app.apply_offer_tasks_on_subscription();


-- =============================================================================
-- Les lignes de devis savent d'où elles viennent
-- =============================================================================
-- La ligne garde sa description et son prix : un devis est un engagement, il
-- ne se met pas à jour quand le catalogue change. Mais savoir de quel article
-- elle est partie permet de pré-remplir, et de retrouver ce qui se vend.

alter table public.quote_line
  add column catalog_item_id uuid references public.catalog_item(id) on delete set null,
  add column offer_id        uuid references public.offer(id) on delete set null,
  add constraint quote_line_one_origin check (
    catalog_item_id is null or offer_id is null
  );

create index quote_line_catalog_item_idx on public.quote_line (catalog_item_id);
create index quote_line_offer_idx on public.quote_line (offer_id);


-- =============================================================================
-- Cloisonnement
-- =============================================================================

alter table public.number_counter        enable row level security;
alter table public.offer                 enable row level security;
alter table public.offer_line            enable row level security;
alter table public.offer_task_template   enable row level security;
alter table public.client_subscription   enable row level security;

create policy offer_agency_all on public.offer
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy client_subscription_agency_all on public.client_subscription
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy offer_line_agency_all on public.offer_line
  for all to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_line.offer_id
                    and o.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.offer o
                  where o.id = public.offer_line.offer_id
                    and o.agency_id = app.current_agency_id()));

create policy offer_task_template_agency_all on public.offer_task_template
  for all to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_task_template.offer_id
                    and o.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.offer o
                  where o.id = public.offer_task_template.offer_id
                    and o.agency_id = app.current_agency_id()));

-- Les compteurs ne se lisent ni ne s'écrivent depuis l'application : seule
-- `app.next_number()` y touche, et elle s'exécute avec ses propres droits.
-- Aucune politique n'est donc posée — RLS activé sans politique interdit tout.

-- Le catalogue et les abonnements étaient déjà couverts sous leur ancien nom ;
-- la politique de `service` suit la table renommée. Celle de `client_service`
-- est partie avec la table.
alter policy service_agency_all on public.catalog_item rename to catalog_item_agency_all;

-- Le portail voit ce à quoi son compte a souscrit — c'est son contrat.
create policy client_subscription_portal_read on public.client_subscription
  for select to authenticated
  using (client_id = app.current_client_id());
