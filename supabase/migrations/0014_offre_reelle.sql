-- =============================================================================
-- 0014 — L'offre telle qu'elle se vend vraiment
-- =============================================================================
-- La migration 0012 a été écrite avant d'avoir vu les offres réelles. Les
-- voici — deux familles de trois, qui s'emboîtent :
--
--   Présence Digitale 4 500 $  →  Croissance Digitale 9 000 $  →  Commerce
--   Digital 13 000 $        (paiement unique, livraison 4 à 8 semaines)
--
--   Visibilité Locale 400 $/m  →  Croissance SEO 700 $/m  →  Domination SEO
--   1 100 $/m               (mensuel, 3 premiers mois à tarif préférentiel)
--
-- Cinq choses que le modèle ne savait pas dire, et que les offres exigent :
--
-- 1. **« Tout ce qui est dans Présence Digitale ».** Une offre en contient une
--    autre. `offer_line` ne pointait que vers un article du catalogue. Recopier
--    le contenu de la petite offre dans la grande garantirait qu'elles
--    divergent à la première révision de prix — c'est précisément la maladie
--    que ce schéma soigne partout ailleurs.
--
-- 2. **« À partir de » 4 500 $.** Le prix affiché est un plancher, pas un
--    tarif. Un devis à 6 200 $ ne contredit pas le catalogue ; il le précise.
--
-- 3. **« 3 premiers mois à tarif préférentiel ».** Le prix d'entrée n'est pas
--    le prix courant. Le revenu récurrent doit montrer ce qui rentre
--    aujourd'hui, pas ce qui rentrera au quatrième mois.
--
-- 4. **« Idéal pour : Croissance Digitale ».** Chaque pack mensuel désigne le
--    forfait web qu'il prolonge. C'est le moteur commercial de l'agence — on
--    vend un site, puis l'accompagnement — et le CRM doit le connaître pour le
--    proposer au bon moment.
--
-- 5. **« Espace membres *ou* réservation avancée ».** Deux livrables
--    incompatibles dans la même offre : le client choisit. Sans enregistrer ce
--    choix, impossible de savoir s'il faut créer la tâche « configurer
--    MemberStack » ou « configurer Acuity ».
--
-- Le reste — l'accroche, les segments visés, ce que le client y gagne, le
-- délai de livraison — est ce qui fait la différence entre un catalogue et une
-- ligne de prix.
-- =============================================================================


-- =============================================================================
-- Ce que l'offre dit d'elle-même
-- =============================================================================

alter table public.offer
  -- L'accroche affichée sous le nom.
  add column tagline               text,
  -- « À partir de » : le prix est un plancher.
  add column price_is_from         boolean not null default false,
  -- Le tarif d'entrée et sa durée, en périodes de facturation.
  add column intro_price_cents     integer,
  add column intro_periods         smallint,
  -- Le délai de livraison annoncé, en semaines.
  add column delivery_weeks_min    smallint,
  add column delivery_weeks_max    smallint,
  -- La consultation offerte, en minutes.
  add column free_consult_minutes  smallint,
  -- « Le plus populaire » — une mise en avant, une seule par famille.
  add column is_popular            boolean not null default false,
  -- Le pack mensuel qui prolonge ce forfait, ou le forfait que ce pack
  -- prolonge. C'est le chemin commercial de l'agence, écrit une fois.
  add column recommended_offer_id  uuid references public.offer(id) on delete set null,

  add constraint offer_intro_pairing check (
    (intro_price_cents is null) = (intro_periods is null)
  ),
  add constraint offer_intro_positive check (
    intro_price_cents is null or (intro_price_cents >= 0 and intro_periods > 0)
  ),
  add constraint offer_delivery_ordered check (
    delivery_weeks_max is null or delivery_weeks_min is null
    or delivery_weeks_max >= delivery_weeks_min
  ),
  add constraint offer_not_its_own_sequel check (recommended_offer_id <> id);

create index offer_recommended_idx on public.offer (recommended_offer_id);


-- Les segments visés (« Comptables », « Coachs », « E-commerce »…).
create table public.offer_segment (
  offer_id  uuid not null references public.offer(id) on delete cascade,
  label     text not null,
  position  smallint not null default 0,
  primary key (offer_id, label)
);

-- « Ce que vous gagnez » — la promesse, distincte de la liste des livrables.
-- Un client n'achète pas « 20 pages + 5 collections CMS », il achète
-- « des réservations en ligne 24 h/24 sans appels ».
create table public.offer_benefit (
  offer_id  uuid not null references public.offer(id) on delete cascade,
  position  smallint not null,
  label     text not null,
  primary key (offer_id, position)
);


-- =============================================================================
-- Une offre peut en contenir une autre
-- =============================================================================
-- `offer_line` avait pour clé (offre, article) et exigeait l'article. Elle
-- accepte désormais soit un article, soit une offre incluse.

alter table public.offer_line add column id uuid not null default gen_random_uuid();
alter table public.offer_line drop constraint offer_line_pkey;
alter table public.offer_line add primary key (id);

alter table public.offer_line
  alter column catalog_item_id drop not null,
  add column included_offer_id uuid references public.offer(id) on delete restrict,
  -- Deux lignes d'un même groupe sont des alternatives : le client en prend
  -- une. `option_key` identifie laquelle.
  add column option_group      text,
  add column option_key        text,
  add column label             text,

  add constraint offer_line_one_target check (
    (catalog_item_id is not null) <> (included_offer_id is not null)
  ),
  add constraint offer_line_option_pairing check (
    (option_group is null) = (option_key is null)
  ),
  add constraint offer_line_not_itself check (included_offer_id <> offer_id);

-- Un article ou une offre n'apparaît qu'une fois par offre — sauf s'il s'agit
-- d'alternatives, qui se distinguent par leur clé d'option.
create unique index offer_line_item_unique
  on public.offer_line (offer_id, catalog_item_id, coalesce(option_key, ''))
  where catalog_item_id is not null;
create unique index offer_line_included_unique
  on public.offer_line (offer_id, included_offer_id, coalesce(option_key, ''))
  where included_offer_id is not null;

create index offer_line_offer_idx on public.offer_line (offer_id);
create index offer_line_included_idx on public.offer_line (included_offer_id);


-- Une offre ne peut pas se contenir elle-même, même de loin. Sans ce
-- garde-fou, le premier calcul de valeur catalogue tourne à l'infini.
create or replace function app.offer_contains(p_parent uuid, p_child uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with recursive descendance as (
    select l.included_offer_id as offer_id
      from public.offer_line l
     where l.offer_id = p_parent and l.included_offer_id is not null
    union
    select l.included_offer_id
      from public.offer_line l
      join descendance d on d.offer_id = l.offer_id
     where l.included_offer_id is not null
  )
  select exists (select 1 from descendance where offer_id = p_child);
$$;

create or replace function app.check_offer_line_cycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.included_offer_id is null then return new; end if;

  if app.offer_contains(new.included_offer_id, new.offer_id) then
    raise exception
      'Cette offre est déjà contenue dans celle que vous voulez y inclure : le catalogue tournerait en rond.';
  end if;

  return new;
end;
$$;

create trigger offer_line_no_cycle
  before insert or update on public.offer_line
  for each row execute function app.check_offer_line_cycle();


-- =============================================================================
-- Le choix du client, quand l'offre en laisse un
-- =============================================================================

alter table public.offer_task_template
  add column option_group text,
  add column option_key   text,
  add constraint offer_task_template_option_pairing check (
    (option_group is null) = (option_key is null)
  );

create table public.subscription_option (
  subscription_id  uuid not null references public.client_subscription(id) on delete cascade,
  option_group     text not null,
  option_key       text not null,
  primary key (subscription_id, option_group)
);


-- =============================================================================
-- Le prix d'entrée compte dans le revenu, pas le prix courant
-- =============================================================================

alter table public.client_subscription
  add column intro_price_cents integer,
  add column intro_ends_on     date,
  add constraint client_subscription_intro_pairing check (
    (intro_price_cents is null) = (intro_ends_on is null)
  ),
  add constraint client_subscription_intro_positive check (
    intro_price_cents is null or intro_price_cents >= 0
  );

-- Le prix qui s'applique aujourd'hui : le tarif d'entrée tant qu'il court, le
-- prix signé ensuite.
create or replace function app.subscription_price_today(
  p_price integer, p_intro integer, p_intro_ends date
)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
           when p_intro is not null and p_intro_ends >= current_date then p_intro
           else p_price
         end;
$$;

-- `client_mrr` tient compte du tarif d'entrée : un tableau de bord qui
-- annonce le prix courant pendant les trois mois préférentiels annonce de
-- l'argent qui n'est pas encore rentré.
create or replace view public.client_mrr as
select
  s.agency_id,
  s.client_id,
  sum(
    case s.billing
      when 'mensuel'     then app.subscription_price_today(s.price_cents, s.intro_price_cents, s.intro_ends_on) * s.quantity
      when 'trimestriel' then app.subscription_price_today(s.price_cents, s.intro_price_cents, s.intro_ends_on) * s.quantity / 3
      when 'annuel'      then app.subscription_price_today(s.price_cents, s.intro_price_cents, s.intro_ends_on) * s.quantity / 12
      else 0                      -- un paiement unique n'est pas du récurrent
    end
  )::bigint as mrr_cents
from public.client_subscription s
where s.ended_on is null
group by s.agency_id, s.client_id;

alter view public.client_mrr set (security_invoker = on);


-- =============================================================================
-- La valeur d'une offre additionne aussi les offres qu'elle contient
-- =============================================================================

create or replace function app.offer_catalog_value(p_offer uuid)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  with recursive contenu as (
    select l.catalog_item_id, l.included_offer_id, l.quantity::numeric
      from public.offer_line l
     where l.offer_id = p_offer
    union all
    select l.catalog_item_id, l.included_offer_id, c.quantity * l.quantity
      from contenu c
      join public.offer_line l on l.offer_id = c.included_offer_id
  )
  select coalesce(sum(c.quantity * i.price_cents), 0)::bigint
    from contenu c
    join public.catalog_item i on i.id = c.catalog_item_id;
$$;

-- Une colonne s'insère au milieu : `create or replace` ne sait pas le faire,
-- la vue se refait.
drop view public.offer_value;

create view public.offer_value as
select
  o.id as offer_id,
  o.agency_id,
  o.code,
  o.name,
  o.price_cents,
  o.price_is_from,
  app.offer_catalog_value(o.id)                              as catalog_value_cents,
  (app.offer_catalog_value(o.id) - coalesce(o.price_cents, 0)) as discount_cents
from public.offer o;

alter view public.offer_value set (security_invoker = on);


-- =============================================================================
-- La génération de tâches respecte le choix du client
-- =============================================================================
-- Un modèle rattaché à une alternative n'est appliqué que si le client a
-- retenu cette alternative — et les offres incluses engagent leur travail
-- comme si elles avaient été vendues seules.

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

  if periode < debut then return 0; end if;
  if sub.ended_on is not null and periode > date_trunc('month', sub.ended_on)::date then
    return 0;
  end if;

  mois := (extract(year from age(periode, debut)) * 12
           + extract(month from age(periode, debut)))::integer;

  for modele in
    -- L'offre vendue, plus toutes celles qu'elle contient.
    with recursive offres as (
      select sub.offre as id
      union
      select l.included_offer_id
        from public.offer_line l
        join offres o on o.id = l.offer_id
       where l.included_offer_id is not null
    )
    select t.*
      from public.offer_task_template t
      join offres o on o.id = t.offer_id
     where case t.cadence
             when 'signature'    then mois = 0
             when 'mensuel'      then true
             when 'trimestriel'  then mois % 3 = 0
             when 'annuel'       then mois % 12 = 0
           end
       -- Une alternative n'est due que si le client l'a retenue.
       and (t.option_group is null
            or exists (select 1 from public.subscription_option so
                        where so.subscription_id = sub.id
                          and so.option_group = t.option_group
                          and so.option_key = t.option_key))
     order by t.position, t.id
  loop
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
       numero::text, '#' || numero,
       modele.title, modele.description, modele.kind,
       modele.estimate_hours, echeance, modele.id, periode)
    on conflict (client_id, offer_template_id, period_month)
       where offer_template_id is not null
       do nothing;

    if found then creees := creees + 1; end if;
  end loop;

  return creees;
end;
$$;


-- Enregistrer le choix du client après coup doit produire les tâches qui en
-- découlent : sinon l'alternative retenue reste sans travail.
create or replace function app.apply_tasks_on_option_choice()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare debut date;
begin
  select s.started_on into debut
    from public.client_subscription s where s.id = new.subscription_id;
  perform app.apply_offer_tasks(new.subscription_id, debut);
  return null;
end;
$$;

create trigger subscription_option_creates_tasks
  after insert or update on public.subscription_option
  for each row execute function app.apply_tasks_on_option_choice();


-- =============================================================================
-- Cloisonnement
-- =============================================================================

alter table public.offer_segment        enable row level security;
alter table public.offer_benefit        enable row level security;
alter table public.subscription_option  enable row level security;

create policy offer_segment_agency_all on public.offer_segment
  for all to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_segment.offer_id
                    and o.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.offer o
                  where o.id = public.offer_segment.offer_id
                    and o.agency_id = app.current_agency_id()));

create policy offer_benefit_agency_all on public.offer_benefit
  for all to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_benefit.offer_id
                    and o.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.offer o
                  where o.id = public.offer_benefit.offer_id
                    and o.agency_id = app.current_agency_id()));

create policy subscription_option_agency_all on public.subscription_option
  for all to authenticated
  using (exists (select 1 from public.client_subscription s
                  where s.id = public.subscription_option.subscription_id
                    and s.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.client_subscription s
                  where s.id = public.subscription_option.subscription_id
                    and s.agency_id = app.current_agency_id()));

-- Le client voit l'option qu'il a retenue : c'est son contrat.
create policy subscription_option_portal_read on public.subscription_option
  for select to authenticated
  using (exists (select 1 from public.client_subscription s
                  where s.id = public.subscription_option.subscription_id
                    and s.client_id = app.current_client_id()));
