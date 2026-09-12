-- =============================================================================
-- 0016 — Le profil d'un membre, et ce que son rôle l'autorise à faire
-- =============================================================================
-- Le panneau d'équipe portait un nom, un courriel et un rôle. Il manquait deux
-- choses, et la seconde est la plus importante :
--
-- 1. **De quoi identifier une personne.** Prénom et nom séparés (« Marie » ne
--    se déduit pas de « Marie Chen » sans supposer qu'un nom composé n'existe
--    pas), une photo, un téléphone, une adresse. `full_name` devient une
--    colonne calculée : un nom d'affichage qui diverge de ses parties est un
--    bogue qui attend son heure.
--
-- 2. **Ce que le rôle autorise.** Quatre rôles existaient comme étiquettes :
--    `admin`, `chef_projet`, `specialiste_seo`, `redacteur`. Aucun n'empêchait
--    quoi que ce soit. Un rédacteur pouvait modifier les tarifs du catalogue,
--    envoyer une facture ou publier un rapport chez un client.
--
-- Les permissions ne sont pas une liste décorative : elles sont appliquées par
-- le moteur sur ce qui compte — le catalogue, la facturation, l'équipe, les
-- réglages de l'agence et la publication des rapports. Le reste du travail
-- quotidien reste ouvert à toute l'équipe, parce qu'un CRM qui refuse tout
-- finit contourné.
-- =============================================================================


-- =============================================================================
-- Qui est la personne
-- =============================================================================

alter table public.user_profile
  add column first_name   text,
  add column last_name    text,
  add column avatar_url   text,
  add column phone        text,
  add column address      text,
  add column city         text,
  add column province     text,
  add column postal_code  text,
  add column country      text default 'CA';

-- Les parties d'abord, le nom d'affichage ensuite. La migration reconstruit
-- les deux à partir de ce qui existe : le premier mot est le prénom, le reste
-- le nom.
update public.user_profile
   set first_name = split_part(full_name, ' ', 1),
       last_name  = nullif(substr(full_name, length(split_part(full_name, ' ', 1)) + 2), '');

alter table public.user_profile drop column full_name;

alter table public.user_profile
  add column full_name text generated always as (
    btrim(coalesce(first_name, '') || ' ' || coalesce(last_name, ''))
  ) stored,
  -- Un mononyme s'écrit dans le prénom ; une personne sans aucun des deux n'a
  -- pas de nom d'affichage du tout.
  add constraint user_profile_has_a_name check (
    first_name is not null or last_name is not null
  );


-- =============================================================================
-- Ce que le membre fait dans l'agence
-- =============================================================================

alter table public.agency_member
  add column job_title         text,
  add column started_on        date,
  -- Le taux horaire facturable de ce membre. Le contrat SHGM facture le hors
  -- portée à 100 $/h : c'est un taux de personne, pas une constante.
  add column hourly_rate_cents integer,
  add constraint agency_member_rate_positive check (
    hourly_rate_cents is null or hourly_rate_cents >= 0
  );


-- =============================================================================
-- Les permissions
-- =============================================================================

create type public.permission as enum (
  'manage_agency',       -- identité, réglages, taxes, intégrations
  'manage_team',         -- inviter, désactiver, changer un rôle
  'manage_catalogue',    -- produits, services, offres, modèles de documents
  'manage_billing',      -- factures, encaissements
  'view_financials',     -- revenus, consommation, marges
  'manage_clients',      -- créer, modifier, archiver un compte
  'send_documents',      -- envoyer un devis, une proposition, un contrat
  'publish_reports',     -- rendre un rapport visible du client (règle 1)
  'manage_automations',  -- créer et activer une règle Quand/Alors
  'run_paid_tools',      -- déclencher un appel facturé au fournisseur
  'manage_content'       -- briefs, articles, plan éditorial
);

-- Ce que chaque rôle autorise par défaut. Un référentiel commun à toutes les
-- agences : c'est le produit qui le définit, pas chaque client.
create table public.role_permission (
  role        public.agency_role not null,
  permission  public.permission not null,
  primary key (role, permission)
);

insert into public.role_permission (role, permission) values
  -- L'administratrice peut tout. C'est la définition du rôle.
  ('admin', 'manage_agency'),      ('admin', 'manage_team'),
  ('admin', 'manage_catalogue'),   ('admin', 'manage_billing'),
  ('admin', 'view_financials'),    ('admin', 'manage_clients'),
  ('admin', 'send_documents'),     ('admin', 'publish_reports'),
  ('admin', 'manage_automations'), ('admin', 'run_paid_tools'),
  ('admin', 'manage_content'),

  -- Le chef de projet mène les comptes et ce qui sort vers eux, sans toucher
  -- aux tarifs ni à l'équipe.
  ('chef_projet', 'view_financials'),    ('chef_projet', 'manage_clients'),
  ('chef_projet', 'send_documents'),     ('chef_projet', 'publish_reports'),
  ('chef_projet', 'manage_automations'), ('chef_projet', 'run_paid_tools'),
  ('chef_projet', 'manage_content'),

  -- Le spécialiste travaille les comptes et les outils. Ce qui part chez le
  -- client passe par quelqu'un d'autre (règle 1).
  ('specialiste_seo', 'manage_automations'), ('specialiste_seo', 'run_paid_tools'),
  ('specialiste_seo', 'manage_content'),

  -- Le rédacteur écrit.
  ('redacteur', 'manage_content');


-- Un ajustement nominatif, quand le rôle ne suffit pas — accorder à un
-- spécialiste le droit de publier, retirer à un chef de projet l'accès aux
-- chiffres. L'exception est nommée et datée plutôt que d'inventer un rôle.
create table public.member_permission (
  member_id   uuid not null references public.agency_member(id) on delete cascade,
  permission  public.permission not null,
  granted     boolean not null,
  reason      text,
  created_at  timestamptz not null default now(),
  primary key (member_id, permission)
);

create index member_permission_member_idx on public.member_permission (member_id);


-- La question que toutes les politiques posent : est-ce que la personne
-- connectée a le droit ? L'ajustement nominatif l'emporte sur le rôle ; à
-- défaut, le rôle décide ; un membre désactivé n'a aucun droit.
create or replace function app.member_has(p_permission public.permission)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select mp.granted
       from public.member_permission mp
       join public.agency_member m on m.id = mp.member_id
      where m.user_id = (select auth.uid())
        and m.active
        and mp.permission = p_permission
      limit 1),
    exists (
      select 1
        from public.agency_member m
        join public.role_permission rp on rp.role = m.role
       where m.user_id = (select auth.uid())
         and m.active
         and rp.permission = p_permission),
    false);
$$;


-- Ce que chaque membre peut réellement faire, rôle et ajustements combinés.
-- L'écran d'équipe lit ça, plutôt que de refaire le calcul de son côté.
create view public.member_effective_permission as
select
  m.id as member_id,
  m.agency_id,
  m.role,
  p.permission,
  coalesce(mp.granted, rp.role is not null) as granted,
  (mp.member_id is not null)                as overridden,
  mp.reason
from public.agency_member m
cross join unnest(enum_range(null::public.permission)) as p(permission)
left join public.role_permission rp
       on rp.role = m.role and rp.permission = p.permission
left join public.member_permission mp
       on mp.member_id = m.id and mp.permission = p.permission
where coalesce(mp.granted, rp.role is not null);

alter view public.member_effective_permission set (security_invoker = on);


-- =============================================================================
-- Les permissions s'appliquent
-- =============================================================================
-- Sur ce qui engage l'agence : ses tarifs, son argent, son équipe, ses
-- réglages, et ce qui part chez un client. Le travail quotidien — tâches,
-- audits, contenus, échanges — reste ouvert à toute l'équipe : un outil qui
-- refuse tout finit contourné.

-- Le catalogue et les modèles de documents : lecture pour tous, écriture pour
-- qui gère le catalogue.
drop policy catalog_item_agency_all on public.catalog_item;
create policy catalog_item_agency_read on public.catalog_item
  for select to authenticated
  using (agency_id = app.current_agency_id());
create policy catalog_item_agency_write on public.catalog_item
  for all to authenticated
  using (agency_id = app.current_agency_id() and app.member_has('manage_catalogue'))
  with check (agency_id = app.current_agency_id() and app.member_has('manage_catalogue'));

drop policy offer_agency_all on public.offer;
create policy offer_agency_read on public.offer
  for select to authenticated
  using (agency_id = app.current_agency_id());
create policy offer_agency_write on public.offer
  for all to authenticated
  using (agency_id = app.current_agency_id() and app.member_has('manage_catalogue'))
  with check (agency_id = app.current_agency_id() and app.member_has('manage_catalogue'));

drop policy document_template_agency_all on public.document_template;
create policy document_template_agency_read on public.document_template
  for select to authenticated
  using (agency_id = app.current_agency_id());
create policy document_template_agency_write on public.document_template
  for all to authenticated
  using (agency_id = app.current_agency_id() and app.member_has('manage_catalogue'))
  with check (agency_id = app.current_agency_id() and app.member_has('manage_catalogue'));

-- La facturation.
drop policy invoice_agency_all on public.invoice;
create policy invoice_agency_read on public.invoice
  for select to authenticated
  using (agency_id = app.current_agency_id());
create policy invoice_agency_write on public.invoice
  for all to authenticated
  using (agency_id = app.current_agency_id() and app.member_has('manage_billing'))
  with check (agency_id = app.current_agency_id() and app.member_has('manage_billing'));

-- L'équipe et les exceptions de permission : seule la gestion d'équipe y
-- touche. Sans ça, n'importe qui s'accorde n'importe quel droit.
alter table public.role_permission   enable row level security;
alter table public.member_permission enable row level security;

create policy role_permission_read on public.role_permission
  for select to authenticated using (true);

create policy member_permission_read on public.member_permission
  for select to authenticated
  using (exists (select 1 from public.agency_member m
                  where m.id = public.member_permission.member_id
                    and m.agency_id = app.current_agency_id()));

create policy member_permission_write on public.member_permission
  for all to authenticated
  using (app.member_has('manage_team')
         and exists (select 1 from public.agency_member m
                      where m.id = public.member_permission.member_id
                        and m.agency_id = app.current_agency_id()))
  with check (app.member_has('manage_team')
         and exists (select 1 from public.agency_member m
                      where m.id = public.member_permission.member_id
                        and m.agency_id = app.current_agency_id()));
