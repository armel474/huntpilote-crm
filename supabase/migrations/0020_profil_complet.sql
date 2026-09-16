-- =============================================================================
-- 0020 — Le profil de l'agence, complété par ce que les gabarits réclament
-- =============================================================================
-- Les quatre gabarits de l'agence (offre de service, contrat, Annexe A,
-- Meta Ads) portent des valeurs en dur que le profil ne savait pas dire :
--
--   · le NEQ, cité au contrat à côté de la raison sociale ;
--   · le représentant et son titre — « Armel Junior Nguimbi, Propriétaire »
--     figure six fois dans l'offre, deux fois dans le contrat ;
--   · le district judiciaire de l'article 17 ;
--   · les instructions de paiement par défaut, reprises d'un document à
--     l'autre (« virement ou Interac, payable sous 15 jours »).
--
-- Une balise `{{agence.*}}` par colonne, et plus rien d'écrit en dur dans un
-- modèle (analyse, section 3.5 ; brief 9.1).
-- =============================================================================

alter table public.agency
  add column neq                  text,
  add column representative_name  text,
  add column representative_title text,
  add column judicial_district    text,
  add column payment_instructions text;

comment on column public.agency.neq is
  'Numéro d''entreprise du Québec — dix chiffres, affiché au contrat.';
comment on column public.agency.representative_name is
  'Qui signe pour l''agence : la balise {{agence.representant}} des modèles.';
comment on column public.agency.judicial_district is
  'District judiciaire de la clause de juridiction (article 17 du contrat).';
comment on column public.agency.payment_instructions is
  'Instructions de paiement par défaut ; un modèle de document peut les surcharger.';

-- Un NEQ est fait de dix chiffres, sans espace — ou il n'y en a pas.
alter table public.agency
  add constraint agency_neq_format check (neq is null or neq ~ '^[0-9]{10}$');
