-- =============================================================================
-- 0022 — Les livrables qu'une offre promet, et le droit d'écrire le catalogue
-- =============================================================================
-- Une offre engage des **tâches** (`offer_task_template`, migration 0012) : le
-- travail interne, avec son rôle et son échéance. Le contrat SHGM (0015b) a
-- montré qu'un mandat porte aussi des **livrables** soumis à l'approbation du
-- client, avec des rondes de révision incluses (`deliverable`). Les deux ne
-- sont pas la même chose : la tâche est ce qu'on fait, le livrable est ce que
-- le client approuve. Jusqu'ici, les livrables d'un contrat s'écrivaient à la
-- main ; l'offre ne savait pas les promettre.
--
-- Trois choses ici :
--
-- 1. **`offer_deliverable_template`** — les livrables qu'une offre promet à la
--    vente (code, titre, rondes incluses, ordre). La génération des lignes
--    `deliverable` d'un contrat à partir de ces modèles viendra avec « ce que
--    produit une vente », après le générateur de documents : ce n'est pas le
--    sujet de cette migration.
--
-- 2. **Le taux de dépassement d'une offre récurrente** — les packs de
--    maintenance de l'agence incluent des heures par mois et facturent
--    l'excédent à un taux propre à chaque pack (95, 90, 85 $/h). Une colonne
--    sur `offer`, parce que le taux est celui de l'offre, pas d'un article.
--
-- 3. **Le droit « Gérer le catalogue » s'étend à tout ce qui compose une
--    offre.** La migration 0016 l'a posé sur `catalog_item` et `offer`, mais
--    les lignes, segments, bénéfices et modèles de tâches sont restés ouverts
--    à toute l'équipe (`for all`). Un constructeur d'offres qui écrit sous RLS
--    doit être refusé par la base, pas seulement par un bouton grisé.
-- =============================================================================


-- =============================================================================
-- Les livrables promis par une offre
-- =============================================================================

create table public.offer_deliverable_template (
  id               uuid primary key default gen_random_uuid(),
  offer_id         uuid not null references public.offer(id) on delete cascade,

  code             text not null,          -- « L-01 »
  title            text not null,
  description      text,

  -- Les rondes de révision comprises. Null = sans objet (une formation ne se
  -- révise pas), comme sur `deliverable`.
  included_rounds  smallint,

  position         smallint not null default 0,
  created_at       timestamptz not null default now(),

  constraint offer_deliverable_template_code_unique unique (offer_id, code),
  constraint offer_deliverable_template_rounds_positive
    check (included_rounds is null or included_rounds >= 0)
);

create index offer_deliverable_template_offer_idx
  on public.offer_deliverable_template (offer_id, position);

comment on table public.offer_deliverable_template is
  'Ce qu''une offre promet au client et qu''il approuvera : distinct des '
  'tâches, qui sont le travail interne. À la vente, produira les lignes '
  '`deliverable` du contrat.';


-- =============================================================================
-- Le taux horaire au-delà du forfait
-- =============================================================================

alter table public.offer
  add column overage_hourly_rate_cents integer,
  add constraint offer_overage_rate_positive
    check (overage_hourly_rate_cents is null or overage_hourly_rate_cents >= 0);

comment on column public.offer.overage_hourly_rate_cents is
  'Pour une offre récurrente qui inclut des heures : le taux facturé au-delà, '
  'en cents par heure. Null = pas de dépassement prévu.';


-- =============================================================================
-- Cloisonnement : lecture pour l'agence, écriture pour qui gère le catalogue
-- =============================================================================

alter table public.offer_deliverable_template enable row level security;

create policy offer_deliverable_template_agency_read on public.offer_deliverable_template
  for select to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_deliverable_template.offer_id
                    and o.agency_id = app.current_agency_id()));

create policy offer_deliverable_template_agency_write on public.offer_deliverable_template
  for all to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_deliverable_template.offer_id
                    and o.agency_id = app.current_agency_id())
         and app.member_has('manage_catalogue'))
  with check (exists (select 1 from public.offer o
                  where o.id = public.offer_deliverable_template.offer_id
                    and o.agency_id = app.current_agency_id())
         and app.member_has('manage_catalogue'));


-- Ce qui compose une offre suit le même droit que l'offre.

drop policy offer_line_agency_all on public.offer_line;
create policy offer_line_agency_read on public.offer_line
  for select to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_line.offer_id
                    and o.agency_id = app.current_agency_id()));
create policy offer_line_agency_write on public.offer_line
  for all to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_line.offer_id
                    and o.agency_id = app.current_agency_id())
         and app.member_has('manage_catalogue'))
  with check (exists (select 1 from public.offer o
                  where o.id = public.offer_line.offer_id
                    and o.agency_id = app.current_agency_id())
         and app.member_has('manage_catalogue'));

drop policy offer_task_template_agency_all on public.offer_task_template;
create policy offer_task_template_agency_read on public.offer_task_template
  for select to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_task_template.offer_id
                    and o.agency_id = app.current_agency_id()));
create policy offer_task_template_agency_write on public.offer_task_template
  for all to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_task_template.offer_id
                    and o.agency_id = app.current_agency_id())
         and app.member_has('manage_catalogue'))
  with check (exists (select 1 from public.offer o
                  where o.id = public.offer_task_template.offer_id
                    and o.agency_id = app.current_agency_id())
         and app.member_has('manage_catalogue'));

drop policy offer_segment_agency_all on public.offer_segment;
create policy offer_segment_agency_read on public.offer_segment
  for select to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_segment.offer_id
                    and o.agency_id = app.current_agency_id()));
create policy offer_segment_agency_write on public.offer_segment
  for all to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_segment.offer_id
                    and o.agency_id = app.current_agency_id())
         and app.member_has('manage_catalogue'))
  with check (exists (select 1 from public.offer o
                  where o.id = public.offer_segment.offer_id
                    and o.agency_id = app.current_agency_id())
         and app.member_has('manage_catalogue'));

drop policy offer_benefit_agency_all on public.offer_benefit;
create policy offer_benefit_agency_read on public.offer_benefit
  for select to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_benefit.offer_id
                    and o.agency_id = app.current_agency_id()));
create policy offer_benefit_agency_write on public.offer_benefit
  for all to authenticated
  using (exists (select 1 from public.offer o
                  where o.id = public.offer_benefit.offer_id
                    and o.agency_id = app.current_agency_id())
         and app.member_has('manage_catalogue'))
  with check (exists (select 1 from public.offer o
                  where o.id = public.offer_benefit.offer_id
                    and o.agency_id = app.current_agency_id())
         and app.member_has('manage_catalogue'));
