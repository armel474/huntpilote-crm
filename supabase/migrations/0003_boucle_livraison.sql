-- =============================================================================
-- 0003 — La boucle de livraison : audit → priorité → tâche → preuve → rapport
-- =============================================================================
-- La thèse du produit. Chaque étape produit la matière de la suivante, et le
-- rapport client n'est pas un document à rédiger mais la sortie naturelle du
-- travail déjà fait.
--
-- Deux règles de docs/decisions.md sont appliquées ici par le moteur, pas par
-- l'interface :
--   · règle 1 — trois états de visibilité, double libellé, relecture bloquante ;
--   · décision 6 — un rapport publié est un instantané figé.
-- =============================================================================


-- =============================================================================
-- L'audit
-- =============================================================================
-- Décision 13 : l'audit n'est pas un audit SEO. Il couvre trois dimensions —
-- présence en ligne, SEO, design — et produit donc trois familles de priorités.
-- Le score de santé du compte est leur moyenne pondérée.

create type public.audit_state as enum ('encours', 'termine', 'partiel');

create table public.audit (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid not null references public.agency(id) on delete cascade,
  client_id     uuid not null references public.client(id) on delete cascade,

  slug          text not null,
  ref           text not null,
  state         public.audit_state not null default 'encours',

  run_at        timestamptz not null default now(),
  pages_crawled integer,
  duration_s    integer,

  -- Moyenne pondérée des dimensions ci-dessous, recopiée ici à la clôture pour
  -- éviter de recalculer à chaque affichage d'historique.
  score         smallint,

  launched_by   uuid references public.agency_member(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint audit_slug_unique unique (agency_id, slug),
  constraint audit_score_range check (score is null or score between 0 and 100)
);

create index audit_client_idx on public.audit (client_id, run_at desc);

create trigger audit_touch
  before update on public.audit
  for each row execute function app.touch_updated_at();


-- Un score par dimension et par audit. Règle 3 : les scores d'audit sont
-- historisés sans dilution — « c'est léger, et c'est la courbe de progression ».
create table public.audit_dimension_score (
  audit_id   uuid not null references public.audit(id) on delete cascade,
  dimension  public.audit_dimension not null,
  weight     numeric(4,3) not null,
  score      smallint not null,
  primary key (audit_id, dimension),

  constraint ads_score_range check (score between 0 and 100),
  constraint ads_weight_range check (weight > 0 and weight <= 1)
);


-- Le référentiel des critères. Règle 2 nomme explicitement la grille du volet
-- design (mobile, lisibilité, parcours, conversion, cohérence de marque) avec,
-- pour chacun, ce qui est vérifié et par quelle source.
--
-- ⚠ Aujourd'hui, `Criterion.c` — le libellé français — sert de clé, et la
-- comparaison de deux audits joint sur (libellé de dimension + libellé de
-- critère). Renommer un critère casserait tout l'historique.
create table public.criterion_definition (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references public.agency(id) on delete cascade,
  dimension    public.audit_dimension not null,
  code         text not null,
  label        text not null,
  threshold    text,
  source       text,
  -- Règle 2 : on note ce qui se mesure, on caractérise ce qui s'apprécie. Un
  -- critère non noté est décrit, jamais compté dans le score.
  scored       boolean not null default true,
  created_at   timestamptz not null default now(),

  constraint criterion_definition_code_unique unique (agency_id, code)
);


create type public.criterion_status as enum ('ok', 'warn', 'fail', 'na');

create table public.audit_criterion (
  id             uuid primary key default gen_random_uuid(),
  audit_id       uuid not null references public.audit(id) on delete cascade,
  dimension      public.audit_dimension not null,

  -- Les critères de la grille référencent leur définition ; un constat
  -- ponctuel remonté par un outil porte seulement son libellé.
  definition_id  uuid references public.criterion_definition(id) on delete set null,
  label          text not null,

  status         public.criterion_status not null,
  -- Convention d'interface : une mesure ne s'affiche jamais sans son seuil.
  -- Les deux vont donc ensemble en base, et `measure` sans `threshold` est
  -- refusé.
  measure        text,
  threshold      text,
  note           text,
  pages          jsonb,

  created_at     timestamptz not null default now(),

  constraint audit_criterion_measure_needs_threshold check (
    measure is null or threshold is not null
  )
);

create index audit_criterion_audit_idx on public.audit_criterion (audit_id);

comment on constraint audit_criterion_measure_needs_threshold on public.audit_criterion is
  'Une mesure ne s''affiche jamais sans son seuil (convention figée en phase 1).';


-- =============================================================================
-- La priorité
-- =============================================================================
-- Le pivot du produit. Règle 1 : trois états de visibilité, double libellé,
-- relecture humaine avant toute sortie de l'agence.

create type public.priority_status as enum (
  'neuve', 'assignee', 'resolue', 'recurrente', 'ignoree', 'faux_positif'
);

create table public.priority (
  id                    uuid primary key default gen_random_uuid(),
  agency_id             uuid not null references public.agency(id) on delete cascade,
  client_id             uuid not null references public.client(id) on delete cascade,

  slug                  text not null,
  ref                   text not null,

  severity              public.severity not null,
  dimension             public.audit_dimension not null,
  status                public.priority_status not null default 'neuve',

  -- Règle 1. Par défaut `interne` : le client ne voit rien tant que la
  -- priorité n'entre pas au plan d'action.
  visibility            public.priority_visibility not null default 'interne',

  -- Le double libellé. L'interne est technique et obligatoire ; le client est
  -- rédigé par l'agent et facultatif tant que la priorité reste interne.
  internal_label        text not null,
  client_title          text,
  client_label          text,
  client_label_review   public.review_state,

  detected_at           date not null default current_date,
  first_seen_at         date,
  recommendation        text,
  effort_hours          numeric(5,1),

  source_audit_id       uuid references public.audit(id) on delete set null,
  source_criterion_id   uuid references public.audit_criterion(id) on delete set null,

  resolved_at           timestamptz,
  dismissed_reason      text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint priority_slug_unique unique (agency_id, slug),

  -- Règle 1 : une priorité visible du client doit être écrite dans sa langue.
  -- Rendre visible sans libellé client produirait « LCP à 4,2 s » dans le
  -- portail — exactement ce que la règle interdit.
  constraint priority_visible_needs_client_label check (
    visibility = 'interne' or client_label is not null
  ),

  -- Un libellé client rédigé porte toujours un état de relecture, et
  -- inversement.
  constraint priority_client_label_review_pairing check (
    (client_label is null) = (client_label_review is null)
  )
);

create index priority_client_idx     on public.priority (client_id, severity);
create index priority_visibility_idx on public.priority (client_id, visibility)
  where visibility <> 'interne';
create index priority_review_idx     on public.priority (agency_id)
  where client_label_review = 'a_relire';

create trigger priority_touch
  before update on public.priority
  for each row execute function app.touch_updated_at();

comment on constraint priority_visible_needs_client_label on public.priority is
  'Règle 1 : pas de priorité visible sans libellé client. Le portail ne doit jamais afficher du jargon interne.';


-- =============================================================================
-- La tâche
-- =============================================================================
-- Règle 1 : une priorité devient visible quand elle entre au plan d'action.
-- Le déclencheur plus bas applique cette bascule automatiquement.

create type public.task_status as enum (
  'afaire', 'encours', 'bloquee', 'terminee'
);

create table public.task (
  id              uuid primary key default gen_random_uuid(),
  agency_id       uuid not null references public.agency(id) on delete cascade,
  client_id       uuid not null references public.client(id) on delete cascade,

  slug            text not null,
  ref             text not null,

  title           text not null,
  description     text,
  kind            text not null default 'technique',

  -- Une tâche naît le plus souvent d'une priorité, mais pas toujours : une
  -- tâche créée à la main n'en a pas.
  priority_id     uuid references public.priority(id) on delete set null,

  status          public.task_status not null default 'afaire',
  blocked_reason  text,

  assignee_id     uuid references public.agency_member(id) on delete set null,
  due_on          date,
  estimate_hours  numeric(5,1),
  spent_hours     numeric(5,1) not null default 0,

  completed_at    timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint task_slug_unique unique (agency_id, slug),
  constraint task_kind_known check (kind in ('technique', 'contenu')),
  constraint task_blocked_needs_reason check (
    status <> 'bloquee' or blocked_reason is not null
  ),
  constraint task_completed_pairing check (
    (status = 'terminee') = (completed_at is not null)
  )
);

create index task_client_idx   on public.task (client_id, status);
create index task_assignee_idx on public.task (assignee_id, due_on);
create index task_priority_idx on public.task (priority_id);

create trigger task_touch
  before update on public.task
  for each row execute function app.touch_updated_at();

comment on column public.task.due_on is
  'Une vraie date. ⚠ Le code actuel stocke des phrases (« Aujourd''hui », « En retard depuis 4 jours ») — incomparables et fausses dès le lendemain.';


-- Les étapes d'une tâche : la case à cocher, son gain, son responsable.
create table public.task_step (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.task(id) on delete cascade,
  position     smallint not null,
  label        text not null,
  done         boolean not null default false,
  gain         text,
  assignee_id  uuid references public.agency_member(id) on delete set null,
  created_at   timestamptz not null default now(),

  constraint task_step_position_unique unique (task_id, position)
);

create table public.task_comment (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.task(id) on delete cascade,
  author_id   uuid references public.agency_member(id) on delete set null,
  -- Un commentaire de l'agent n'a pas d'auteur humain.
  by_agent    boolean not null default false,
  body        text not null,
  created_at  timestamptz not null default now(),

  constraint task_comment_author_or_agent check (by_agent or author_id is not null)
);

create index task_comment_task_idx on public.task_comment (task_id, created_at);

create table public.task_time_log (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.task(id) on delete cascade,
  member_id   uuid references public.agency_member(id) on delete set null,
  logged_on   date not null,
  hours       numeric(5,2) not null,
  note        text,
  created_at  timestamptz not null default now(),

  constraint task_time_log_hours_positive check (hours > 0)
);

create index task_time_log_task_idx on public.task_time_log (task_id);


-- Règle 1, la régulation gratuite : « une priorité devient visible quand elle
-- entre au plan d'action de la période ». L'interrupteur manuel reste possible
-- dans les deux sens — ce déclencheur ne force que la première bascule, et
-- seulement si un libellé client existe déjà (sinon la contrainte de
-- `priority` refuserait la ligne, à raison).
create or replace function app.priority_visible_on_assignment()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.priority_id is not null then
    update public.priority p
       set visibility = 'traitement'
     where p.id = new.priority_id
       and p.visibility = 'annonce'
       and p.client_label is not null;
  end if;
  return new;
end;
$$;

create trigger task_assignment_reveals_priority
  after insert on public.task
  for each row execute function app.priority_visible_on_assignment();

comment on function app.priority_visible_on_assignment is
  'Règle 1 : l''entrée au plan d''action fait passer une priorité annoncée en traitement. Une priorité interne sans libellé client reste interne — la rendre visible demanderait d''abord de la faire rédiger puis relire.';


-- =============================================================================
-- La preuve de valeur
-- =============================================================================
-- L'unité de valeur livrée : une tâche terminée, qualifiée pour le rapport.
-- Elle porte elle aussi un libellé client soumis à relecture (règle 1).

create table public.proof (
  id                   uuid primary key default gen_random_uuid(),
  agency_id            uuid not null references public.agency(id) on delete cascade,
  client_id            uuid not null references public.client(id) on delete cascade,

  slug                 text not null,
  ref                  text not null,

  task_id              uuid references public.task(id) on delete set null,
  priority_id          uuid references public.priority(id) on delete set null,

  internal_title       text not null,
  client_label         text,
  client_label_review  public.review_state,

  -- La mesure d'impact : avant, après. Texte, parce que l'unité change d'une
  -- preuve à l'autre (secondes, positions, sessions) et que le rapport les
  -- affiche telles quelles.
  measure_before       text,
  measure_after        text,
  measured_on          date,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint proof_slug_unique unique (agency_id, slug),
  constraint proof_client_label_review_pairing check (
    (client_label is null) = (client_label_review is null)
  )
);

create index proof_client_idx on public.proof (client_id);
create index proof_review_idx on public.proof (agency_id)
  where client_label_review = 'a_relire';

create trigger proof_touch
  before update on public.proof
  for each row execute function app.touch_updated_at();


-- =============================================================================
-- Le rapport
-- =============================================================================
-- Décision 6 : le portail est figé à la publication. Deux tables, donc — le
-- brouillon de travail, et l'instantané immuable envoyé au client.

create type public.report_state as enum (
  'apreparer', 'brouillon', 'bloque', 'pret', 'publie', 'corrige', 'sanspreuve'
);

create table public.report (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid not null references public.agency(id) on delete cascade,
  client_id     uuid not null references public.client(id) on delete cascade,

  -- La période, pas une chaîne d'affichage. ⚠ Le code identifie un rapport de
  -- cinq façons selon le fichier (slug, période, jeton, `sept26`, ou rien).
  period_month  date not null,
  slug          text not null,

  state         public.report_state not null default 'apreparer',
  due_on        date,

  summary       text,
  objective     text,
  objective_pct smallint,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint report_period_unique unique (client_id, period_month),
  constraint report_slug_unique unique (agency_id, slug),
  constraint report_period_is_month check (extract(day from period_month) = 1),
  constraint report_objective_pct_range check (
    objective_pct is null or objective_pct between 0 and 100
  )
);

create index report_client_idx on public.report (client_id, period_month desc);
create index report_due_idx    on public.report (agency_id, due_on)
  where state not in ('publie', 'corrige');

create trigger report_touch
  before update on public.report
  for each row execute function app.touch_updated_at();

comment on column public.report.period_month is
  'Premier jour du mois couvert. Une vraie date, ordonnable et comparable, plutôt que « Septembre 2026 ».';


-- Les preuves retenues dans un rapport. La relation est explicite : une preuve
-- existe indépendamment du rapport, et `on: boolean` du code devient la
-- présence ou l'absence de la ligne.
create table public.report_proof (
  report_id   uuid not null references public.report(id) on delete cascade,
  proof_id    uuid not null references public.proof(id) on delete cascade,
  position    smallint,
  primary key (report_id, proof_id)
);

create table public.report_kpi (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references public.report(id) on delete cascade,
  position    smallint not null,
  label       text not null,
  value       text not null,
  previous    text,
  sentence    text not null,

  constraint report_kpi_position_unique unique (report_id, position)
);

comment on column public.report_kpi.sentence is
  'Chaque chiffre du rapport client est accompagné d''une phrase qui dit ce qu''il signifie — le client doit comprendre sans avoir l''agence au téléphone.';

create table public.report_next_step (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references public.report(id) on delete cascade,
  position    smallint not null,
  title       text not null,
  detail      text not null,

  constraint report_next_step_position_unique unique (report_id, position)
);


-- L'instantané publié. Immuable : ni `updated_at`, ni déclencheur de mise à
-- jour, et une politique qui n'autorise que l'insertion et la lecture. Ce que
-- le client a reçu ne peut plus changer, même si la base vivante évolue.
create table public.report_version (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid not null references public.agency(id) on delete cascade,
  report_id     uuid not null references public.report(id) on delete cascade,

  version       smallint not null,
  token         text not null unique,
  published_at  timestamptz not null default now(),
  published_by  uuid references public.agency_member(id) on delete set null,
  note          text,

  -- Le rendu complet au moment de l'envoi : score, objectif, KPIs, preuves,
  -- priorités visibles, la suite. Figé volontairement : une jointure sur les
  -- tables vivantes rendrait le document dépendant de ce qui a bougé depuis.
  content       jsonb not null,
  data_as_of    date not null,

  constraint report_version_unique unique (report_id, version)
);

create index report_version_report_idx on public.report_version (report_id, version desc);

comment on table public.report_version is
  'Instantané immuable (décision 6). Le portail et /r/[token] lisent ici, jamais les tables vivantes.';


-- Règle 1 : l'état « à relire » bloque la publication. Écrit ici plutôt que
-- dans l'interface — une règle qui protège ce qui sort de l'agence ne peut pas
-- dépendre d'un bouton désactivé côté navigateur.
create or replace function app.block_publication_pending_review()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  pending integer;
begin
  select count(*) into pending
  from public.report_proof rp
  join public.proof p on p.id = rp.proof_id
  where rp.report_id = new.report_id
    and p.client_label_review = 'a_relire';

  if pending > 0 then
    raise exception
      'Publication refusée : % libellé(s) client attendent une relecture (règle 1).', pending
      using errcode = 'check_violation';
  end if;

  select count(*) into pending
  from public.priority p
  join public.report r on r.id = new.report_id
  where p.client_id = r.client_id
    and p.visibility in ('annonce', 'traitement')
    and p.client_label_review = 'a_relire';

  if pending > 0 then
    raise exception
      'Publication refusée : % priorité(s) visible(s) attendent une relecture (règle 1).', pending
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger report_version_requires_review
  before insert on public.report_version
  for each row execute function app.block_publication_pending_review();


-- =============================================================================
-- Politiques
-- =============================================================================

alter table public.audit                  enable row level security;
alter table public.audit_dimension_score  enable row level security;
alter table public.criterion_definition   enable row level security;
alter table public.audit_criterion        enable row level security;
alter table public.priority               enable row level security;
alter table public.task                   enable row level security;
alter table public.task_step              enable row level security;
alter table public.task_comment           enable row level security;
alter table public.task_time_log          enable row level security;
alter table public.proof                  enable row level security;
alter table public.report                 enable row level security;
alter table public.report_proof           enable row level security;
alter table public.report_kpi             enable row level security;
alter table public.report_next_step       enable row level security;
alter table public.report_version         enable row level security;

create policy audit_agency_all on public.audit
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy criterion_definition_agency_all on public.criterion_definition
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy priority_agency_all on public.priority
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy task_agency_all on public.task
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy proof_agency_all on public.proof
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy report_agency_all on public.report
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

-- Un rapport publié ne bouge plus : insertion et lecture, jamais de mise à
-- jour ni de suppression (décision 6).
create policy report_version_agency_read on public.report_version
  for select to authenticated
  using (agency_id = app.current_agency_id());

create policy report_version_agency_insert on public.report_version
  for insert to authenticated
  with check (agency_id = app.current_agency_id());


-- Les tables filles suivent leur parent : pas de politique propre, une
-- vérification d'appartenance via la table de rattachement.
create policy audit_dimension_score_agency_all on public.audit_dimension_score
  for all to authenticated
  using (exists (select 1 from public.audit a
                 where a.id = public.audit_dimension_score.audit_id
                   and a.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.audit a
                      where a.id = public.audit_dimension_score.audit_id
                        and a.agency_id = app.current_agency_id()));

create policy audit_criterion_agency_all on public.audit_criterion
  for all to authenticated
  using (exists (select 1 from public.audit a
                 where a.id = public.audit_criterion.audit_id
                   and a.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.audit a
                      where a.id = public.audit_criterion.audit_id
                        and a.agency_id = app.current_agency_id()));

create policy task_step_agency_all on public.task_step
  for all to authenticated
  using (exists (select 1 from public.task t
                 where t.id = public.task_step.task_id
                   and t.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.task t
                      where t.id = public.task_step.task_id
                        and t.agency_id = app.current_agency_id()));

create policy task_comment_agency_all on public.task_comment
  for all to authenticated
  using (exists (select 1 from public.task t
                 where t.id = public.task_comment.task_id
                   and t.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.task t
                      where t.id = public.task_comment.task_id
                        and t.agency_id = app.current_agency_id()));

create policy task_time_log_agency_all on public.task_time_log
  for all to authenticated
  using (exists (select 1 from public.task t
                 where t.id = public.task_time_log.task_id
                   and t.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.task t
                      where t.id = public.task_time_log.task_id
                        and t.agency_id = app.current_agency_id()));

create policy report_proof_agency_all on public.report_proof
  for all to authenticated
  using (exists (select 1 from public.report r
                 where r.id = public.report_proof.report_id
                   and r.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.report r
                      where r.id = public.report_proof.report_id
                        and r.agency_id = app.current_agency_id()));

create policy report_kpi_agency_all on public.report_kpi
  for all to authenticated
  using (exists (select 1 from public.report r
                 where r.id = public.report_kpi.report_id
                   and r.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.report r
                      where r.id = public.report_kpi.report_id
                        and r.agency_id = app.current_agency_id()));

create policy report_next_step_agency_all on public.report_next_step
  for all to authenticated
  using (exists (select 1 from public.report r
                 where r.id = public.report_next_step.report_id
                   and r.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.report r
                      where r.id = public.report_next_step.report_id
                        and r.agency_id = app.current_agency_id()));


-- =============================================================================
-- La file de relecture
-- =============================================================================
-- Règle 1 : « partout le même état à relire et le même blocage ». Trois
-- entités concernées, donc trois colonnes — et une vue pour les rassembler,
-- plutôt qu'une table polymorphe qu'aucune clé étrangère ne pourrait
-- contraindre. La réponse à un avis Google rejoindra cette vue en 0005.

create view public.review_queue as
  select
    'priorite'::text  as kind,
    p.id              as id,
    p.agency_id,
    p.client_id,
    p.internal_label  as internal_label,
    p.client_label,
    p.updated_at
  from public.priority p
  where p.client_label_review = 'a_relire'
  union all
  select
    'preuve'::text,
    pr.id,
    pr.agency_id,
    pr.client_id,
    pr.internal_title,
    pr.client_label,
    pr.updated_at
  from public.proof pr
  where pr.client_label_review = 'a_relire';

comment on view public.review_queue is
  'Tout ce qui attend une relecture, tous clients confondus. Alimente la file avant chaque envoi de rapport.';
