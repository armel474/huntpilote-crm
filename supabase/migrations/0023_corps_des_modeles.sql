-- =============================================================================
-- 0023 — Le corps HTML des modèles de documents, et leurs sections
-- =============================================================================
-- Un modèle de document (`document_template`, migration 0013) portait son
-- nom, sa numérotation, son délai de paiement et quatre textes courts. Il
-- lui manquait l'essentiel : **son corps**, le HTML que le générateur
-- remplit avec les données d'un client. Le principe, posé par le brief 9.3 :
-- le modèle est du contenu de l'agence, pas du code. Il vit dans la base et
-- se modifie sans déploiement.
--
-- Deux choses ici :
--
-- 1. **`document_template.body_html`** — le corps, avec ses balises
--    `{{groupe.champ}}` et ses blocs `{{#bloc}}…{{/bloc}}` (syntaxe canonique,
--    décision du 14 septembre 2026). Null tant que l'agence n'a rien collé :
--    le générateur refuse alors le modèle, et l'écran le dit.
--
-- 2. **`document_template_section`** — les sections narratives d'un modèle
--    (analyse, section 4.2). Le gabarit réel d'offre de service en a onze ;
--    quatre se rédigent par client (« Compréhension de vos besoins »,
--    « Objectifs », la justification de la recommandation, « Preuve et
--    résultats »). Le modèle en porte le titre, l'ordre, le **texte par
--    défaut** — le guide « [Compléter : …] » du gabarit —, si la section est
--    optionnelle (se retire quand elle reste vide), si l'IA peut y proposer
--    un texte, si l'agence l'a verrouillée (une clause approuvée n'est jamais
--    réécrite), et une longueur indicative. Dans le corps, `{{section.cle}}`
--    marque l'endroit où le texte de la section se rend.
--
-- Les sections *d'un document* (`document_section`, copiées du modèle à la
-- création du brouillon, révisables une à une) viendront avec le
-- générateur (session 9.4) : elles s'accrochent à un devis ou à un contrat.
-- =============================================================================


alter table public.document_template
  add column body_html text;

comment on column public.document_template.body_html is
  'Le corps HTML du modèle, avec ses balises {{groupe.champ}} et ses blocs '
  '{{#bloc}}…{{/bloc}}. Null : le modèle n''a pas encore de corps et ne peut '
  'pas servir au générateur.';


create table public.document_template_section (
  id                uuid primary key default gen_random_uuid(),
  template_id       uuid not null references public.document_template(id) on delete cascade,

  -- La clé que le corps désigne : `{{section.besoins}}`.
  key               text not null,
  title             text not null,
  position          smallint not null default 0,

  -- Le guide de rédaction, copié dans chaque document à sa création.
  default_body      text,
  -- Se retire du document rendu quand elle reste vide.
  optional          boolean not null default false,
  -- Le modèle de langage peut y proposer un texte, qu'une personne relit.
  ai_assist         boolean not null default true,
  -- Clause approuvée par l'agence : se copie telle quelle, jamais réécrite.
  locked_by_agency  boolean not null default false,
  -- Longueur indicative, pour que la mise en page tienne.
  max_chars         integer,

  created_at        timestamptz not null default now(),

  constraint document_template_section_key_unique unique (template_id, key),
  constraint document_template_section_key_format check (key ~ '^[a-z][a-z0-9_]*$'),
  constraint document_template_section_max_chars_positive
    check (max_chars is null or max_chars > 0),
  -- Une clause verrouillée n'est pas un endroit où l'IA écrit.
  constraint document_template_section_locked_not_ai
    check (not (locked_by_agency and ai_assist))
);

create index document_template_section_template_idx
  on public.document_template_section (template_id, position);

comment on table public.document_template_section is
  'Les sections narratives d''un modèle : titre, ordre, guide de rédaction, '
  'optionnelle, IA autorisée, verrouillée par l''agence, longueur indicative.';


-- =============================================================================
-- Cloisonnement : lecture pour l'agence, écriture pour qui gère le catalogue
-- — les modèles de documents en font partie (migration 0016).
-- =============================================================================

alter table public.document_template_section enable row level security;

create policy document_template_section_agency_read on public.document_template_section
  for select to authenticated
  using (exists (select 1 from public.document_template t
                  where t.id = public.document_template_section.template_id
                    and t.agency_id = app.current_agency_id()));

create policy document_template_section_agency_write on public.document_template_section
  for all to authenticated
  using (exists (select 1 from public.document_template t
                  where t.id = public.document_template_section.template_id
                    and t.agency_id = app.current_agency_id())
         and app.member_has('manage_catalogue'))
  with check (exists (select 1 from public.document_template t
                  where t.id = public.document_template_section.template_id
                    and t.agency_id = app.current_agency_id())
         and app.member_has('manage_catalogue'));
