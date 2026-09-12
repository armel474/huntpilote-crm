-- =============================================================================
-- 0011 — Contenu éditorial, automatisations, notifications, agenda
-- =============================================================================
-- Le dernier bloc du modèle. Trois constats guident ce fichier :
--
-- 1. **Une règle d'automatisation est écrite deux fois dans le code.** La
--    liste affiche des phrases rédigées à la main (« Un mot-clé top 10 perd
--    ≥ 5 positions »), l'éditeur manipule une règle structurée
--    (`trigger: 'position', params: { places: 5 }`), et rien ne garantit que
--    les deux disent la même chose. La phrase se fabrique depuis la règle —
--    c'est exactement ce que fait `TRIGGERS[x].phrase(v)`. Seule la règle est
--    donc stockée.
--
-- 2. **`runs`, `last`, `success` décrivent un journal qui n'existe pas.**
--    Vingt-quatre exécutions, la dernière « il y a 2 j », 100 % de réussite :
--    trois chiffres recopiés à la main faute de table d'exécutions. Avec le
--    journal, ils se comptent — et `FAIL_MAX`, le seuil au-delà duquel une
--    règle se met en pause, cesse d'être une constante d'interface pour
--    devenir ce que le moteur applique vraiment.
--
-- 3. **Une condition qui ne parle pas de son déclencheur rend la phrase
--    fausse.** Le code le sait (`condAllowed`, `pruneConds`) et nettoie après
--    coup ; ici la base refuse d'abord. « Seulement au-delà d'un volume de
--    recherche » n'a aucun sens sur un déclencheur de facturation.
--
-- Et comme ailleurs : `unread`, `day`, `late`, `movable`, `prevPos` et le
-- taux de réussite se déduisent.
-- =============================================================================


-- =============================================================================
-- Vocabulaires
-- =============================================================================

create type public.content_state as enum (
  'idee', 'brief', 'assigne', 'redaction', 'relecture', 'publie', 'mesure'
);

create type public.automation_category as enum (
  'surveillance', 'rapports', 'client', 'facturation', 'ia'
);

create type public.automation_trigger as enum (
  'position', 'score', 'crawl', 'avis', 'date', 'pipeline', 'facture', 'citation'
);

create type public.automation_action as enum (
  'tache', 'priorite', 'notifier', 'courriel', 'rapport', 'audit'
);

create type public.automation_status as enum ('active', 'pause', 'echec', 'brouillon');

create type public.automation_condition_kind as enum (
  'clients', 'forfait', 'dim', 'volume', 'semaine', 'nonassignee'
);

create type public.automation_run_outcome as enum ('succes', 'echec');

create type public.notification_kind as enum (
  'integration', 'position', 'sante', 'facture', 'liens', 'avis', 'rapport', 'deal', 'agent'
);

create type public.agenda_event_type as enum ('echeance', 'rapport', 'rdv', 'exec');


-- =============================================================================
-- Réglages d'agence
-- =============================================================================

alter table public.agency_settings
  -- `FAIL_MAX` — nombre d'échecs consécutifs au-delà duquel une règle se met
  -- en pause toute seule.
  add column automation_fail_max     integer not null default 3,
  -- `DRY_MAX` — au-delà, un test à blanc signale une règle probablement trop
  -- large.
  add column automation_dry_run_warn integer not null default 20,
  -- `CT_MEASURE_DAYS` — délai après publication avant de mesurer un contenu.
  add column content_measure_days    integer not null default 30,
  add constraint agency_settings_automation_thresholds check (
    automation_fail_max > 0 and automation_dry_run_warn > 0 and content_measure_days > 0
  );

-- Le quota d'articles du forfait (`CONTENU_CLIENT.quota`). Il varie d'un
-- compte à l'autre : c'est une clause de mandat, pas un réglage d'agence.
alter table public.client
  add column monthly_content_quota integer,
  add constraint client_content_quota_positive
    check (monthly_content_quota is null or monthly_content_quota > 0);


-- =============================================================================
-- Le contenu éditorial
-- =============================================================================

create table public.content_item (
  id              uuid primary key default gen_random_uuid(),
  agency_id       uuid not null references public.agency(id) on delete cascade,
  client_id       uuid not null references public.client(id) on delete cascade,

  slug            text not null,
  title           text not null,
  state           public.content_state not null default 'idee',

  target_keyword  text,
  search_volume   integer,

  due_on          date,
  writer_id       uuid references public.agency_member(id) on delete set null,
  reviewer_id     uuid references public.agency_member(id) on delete set null,

  url             text,
  published_at    timestamptz,

  -- Un article existe pour une raison : il répond à une priorité du plan
  -- d'action, et il en devient la preuve une fois publié et mesuré.
  priority_id     uuid references public.priority(id) on delete set null,
  proof_id        uuid references public.proof(id) on delete set null,

  -- Repéré dans une exploration de mots-clés — et la note dit laquelle.
  from_keyword    boolean not null default false,
  from_keyword_note text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint content_item_slug_unique unique (agency_id, slug),
  constraint content_item_volume_positive check (search_volume is null or search_volume >= 0),
  -- Un contenu publié a une adresse et une date ; tant qu'il ne l'est pas, il
  -- n'en a pas. C'est l'état qui commande, pas l'inverse.
  constraint content_item_published_has_url check (
    (state in ('publie', 'mesure')) = (url is not null and published_at is not null)
  ),
  -- Assigné veut dire assigné à quelqu'un.
  constraint content_item_assigned_has_writer check (
    state in ('idee', 'brief') or writer_id is not null
  ),
  constraint content_item_origin_note check (from_keyword or from_keyword_note is null)
);

create index content_item_client_idx on public.content_item (client_id, due_on);
create index content_item_agency_idx on public.content_item (agency_id);
create index content_item_writer_idx on public.content_item (writer_id);
create index content_item_reviewer_idx on public.content_item (reviewer_id);
create index content_item_priority_idx on public.content_item (priority_id);
create index content_item_proof_idx on public.content_item (proof_id);

create trigger content_item_touch
  before update on public.content_item
  for each row execute function app.touch_updated_at();


-- La mesure après publication. `prevPos` n'est pas une colonne : c'est la
-- mesure d'avant.
create table public.content_performance (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references public.agency(id) on delete cascade,
  content_id   uuid not null references public.content_item(id) on delete cascade,
  measured_on  date not null default current_date,
  visits       integer,
  position     smallint,
  created_at   timestamptz not null default now(),

  constraint content_performance_unique unique (content_id, measured_on),
  constraint content_performance_position_range check (position is null or position > 0),
  constraint content_performance_visits_positive check (visits is null or visits >= 0)
);

create index content_performance_content_idx
  on public.content_performance (content_id, measured_on desc);
create index content_performance_agency_idx on public.content_performance (agency_id);


-- Le brief : ce qu'on demande au rédacteur, une fois pour toutes.
create table public.content_brief (
  content_id       uuid primary key references public.content_item(id) on delete cascade,
  agency_id        uuid not null references public.agency(id) on delete cascade,

  -- L'intention derrière la requête principale. Même vocabulaire que les
  -- outils SEO : le brief parlait « info / compare / transac » de son côté,
  -- ce qui faisait deux listes pour une seule notion.
  intent           public.search_intent,
  intent_text      text,
  -- Ce qui prouve l'intention : les résultats observés, pas une impression.
  intent_proof     text,
  difficulty       smallint,
  -- La position actuelle du site sur la requête ; null = non classé.
  current_position smallint,

  -- Les consignes de rédaction.
  target_length    text,
  length_why       text,
  tone             text,
  cta              text,
  images           text,

  -- Le brouillon de preuve de valeur, rédigé avant publication et relu comme
  -- les autres (règle 1).
  proof_draft      text,

  assigned_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint content_brief_difficulty_range
    check (difficulty is null or difficulty between 0 and 100),
  constraint content_brief_position_range
    check (current_position is null or current_position > 0),
  -- Une longueur cible sans justification est un chiffre sorti de nulle part.
  constraint content_brief_length_needs_reason check (
    target_length is null or length_why is not null
  )
);

create index content_brief_agency_idx on public.content_brief (agency_id);

create trigger content_brief_touch
  before update on public.content_brief
  for each row execute function app.touch_updated_at();

create table public.brief_secondary_keyword (
  content_id     uuid not null references public.content_brief(content_id) on delete cascade,
  term           text not null,
  search_volume  integer,
  intent         public.search_intent,
  primary key (content_id, term)
);

create table public.brief_outline_row (
  content_id  uuid not null references public.content_brief(content_id) on delete cascade,
  position    smallint not null,
  level       smallint not null,
  title       text not null,
  primary key (content_id, position),
  -- Un plan d'article n'a que des H2 et des H3 : un H1, c'est le titre.
  constraint brief_outline_level check (level in (2, 3))
);

create table public.brief_internal_link (
  content_id  uuid not null references public.content_brief(content_id) on delete cascade,
  url         text not null,
  anchor      text not null,
  primary key (content_id, url)
);

create table public.brief_competitor (
  content_id  uuid not null references public.content_brief(content_id) on delete cascade,
  rank        smallint not null,
  domain      text not null,
  word_count  integer,
  angle       text,
  primary key (content_id, rank),
  constraint brief_competitor_rank_positive check (rank > 0)
);


-- =============================================================================
-- Les automatisations
-- =============================================================================
-- Une règle, c'est un déclencheur paramétré, des conditions, et une action.
-- La phrase affichée se fabrique depuis ces trois-là — elle n'est pas une
-- donnée, sinon elle finit par décrire autre chose que ce qui s'exécute.

-- Quelles conditions ont un sens pour quel déclencheur. Le code portait cette
-- table sous forme de champ `only: TriggerId[]` et filtrait après coup ; ici
-- elle est en base, et c'est elle qui refuse.
create table public.automation_condition_def (
  kind       public.automation_condition_kind primary key,
  label      text not null,
  -- Une condition universelle vaut pour tous les déclencheurs.
  universal  boolean not null default false
);

create table public.automation_condition_scope (
  kind     public.automation_condition_kind not null
             references public.automation_condition_def(kind) on delete cascade,
  trigger  public.automation_trigger not null,
  primary key (kind, trigger)
);

insert into public.automation_condition_def (kind, label, universal) values
  ('clients',     'Seulement pour certains clients',            true),
  ('forfait',     'Seulement pour certains forfaits',           true),
  ('semaine',     'Seulement en semaine',                       true),
  ('nonassignee', 'Seulement si rien n''est déjà assigné',      true),
  ('dim',         'Seulement sur certaines dimensions',         false),
  ('volume',      'Seulement au-delà d''un volume de recherche', false);

insert into public.automation_condition_scope (kind, trigger) values
  ('dim', 'crawl'), ('dim', 'score'), ('dim', 'citation'),
  ('volume', 'position');


create table public.automation (
  id              uuid primary key default gen_random_uuid(),
  agency_id       uuid not null references public.agency(id) on delete cascade,

  slug            text not null,
  name            text not null,
  description     text,
  category        public.automation_category not null,
  status          public.automation_status not null default 'brouillon',
  -- La règle passe par un modèle de langage : à dire, parce que ça change le
  -- coût, la latence et ce qu'on doit relire.
  uses_ai         boolean not null default false,

  -- Quand. Null tant que la règle est un brouillon.
  trigger         public.automation_trigger,
  trigger_params  jsonb not null default '{}',

  -- Alors.
  action          public.automation_action,
  action_params   jsonb not null default '{}',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint automation_slug_unique unique (agency_id, slug),
  -- Une règle qui tourne a forcément un quand et un alors. Un brouillon peut
  -- n'avoir ni l'un ni l'autre.
  constraint automation_running_is_complete check (
    status = 'brouillon' or (trigger is not null and action is not null)
  )
);

create index automation_agency_idx on public.automation (agency_id);

create trigger automation_touch
  before update on public.automation
  for each row execute function app.touch_updated_at();


create table public.automation_condition (
  id             uuid primary key default gen_random_uuid(),
  automation_id  uuid not null references public.automation(id) on delete cascade,
  kind           public.automation_condition_kind not null
                   references public.automation_condition_def(kind),
  value          jsonb not null,

  constraint automation_condition_unique unique (automation_id, kind)
);

create index automation_condition_automation_idx
  on public.automation_condition (automation_id);
create index automation_condition_kind_idx on public.automation_condition (kind);


-- Une condition qui ne parle pas du déclencheur choisi rend la phrase fausse.
-- Le code la retirait après coup ; ici elle est refusée d'entrée.
create or replace function app.assert_condition_fits_trigger(p_automation uuid, p_kind public.automation_condition_kind)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare d public.automation_trigger; ok boolean;
begin
  select a.trigger into d from public.automation a where a.id = p_automation;

  select c.universal into ok from public.automation_condition_def c where c.kind = p_kind;
  if ok then return; end if;

  if d is null then
    raise exception
      'La condition « % » dépend du déclencheur : choisissez le déclencheur d''abord.', p_kind;
  end if;

  if not exists (select 1 from public.automation_condition_scope s
                  where s.kind = p_kind and s.trigger = d) then
    raise exception
      'La condition « % » n''a pas de sens sur le déclencheur « % » — la phrase de la règle serait fausse.',
      p_kind, d;
  end if;
end;
$$;

create or replace function app.check_condition_on_insert()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  perform app.assert_condition_fits_trigger(new.automation_id, new.kind);
  return new;
end;
$$;

create trigger automation_condition_fits_trigger
  before insert or update on public.automation_condition
  for each row execute function app.check_condition_on_insert();


-- Changer de déclencheur ne doit pas laisser derrière soi des conditions qui
-- ne veulent plus rien dire. `pruneConds` faisait ça côté écran ; la base le
-- fait pour tout le monde.
create or replace function app.prune_conditions_on_trigger_change()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.automation_condition c
   where c.automation_id = new.id
     and not exists (select 1 from public.automation_condition_def d
                      where d.kind = c.kind and d.universal)
     and (new.trigger is null
          or not exists (select 1 from public.automation_condition_scope s
                          where s.kind = c.kind and s.trigger = new.trigger));
  return null;
end;
$$;

create trigger automation_trigger_change_prunes
  after update of trigger on public.automation
  for each row
  when (new.trigger is distinct from old.trigger)
  execute function app.prune_conditions_on_trigger_change();


-- Le journal d'exécution. `runs`, `last` et `success` se comptent ici.
create table public.automation_run (
  id             uuid primary key default gen_random_uuid(),
  agency_id      uuid not null references public.agency(id) on delete cascade,
  automation_id  uuid not null references public.automation(id) on delete cascade,
  client_id      uuid references public.client(id) on delete set null,

  ran_at         timestamptz not null default now(),
  outcome        public.automation_run_outcome not null,
  -- Un échec dit pourquoi. Une réussite peut dire ce qu'elle a produit.
  detail         text,

  -- Ce que l'exécution a créé, selon l'action de la règle.
  created_task_id     uuid references public.task(id) on delete set null,
  created_priority_id uuid references public.priority(id) on delete set null,
  created_audit_id    uuid references public.audit(id) on delete set null,

  constraint automation_run_failure_explains check (
    outcome <> 'echec' or detail is not null
  )
);

create index automation_run_automation_idx on public.automation_run (automation_id, ran_at desc);
create index automation_run_agency_idx on public.automation_run (agency_id);
create index automation_run_client_idx on public.automation_run (client_id);
create index automation_run_task_idx on public.automation_run (created_task_id);
create index automation_run_priority_idx on public.automation_run (created_priority_id);
create index automation_run_audit_idx on public.automation_run (created_audit_id);


-- `FAIL_MAX` cesse d'être une constante d'interface : au-delà de N échecs
-- consécutifs, la règle se met en pause. Une automatisation qui échoue en
-- boucle coûte des appels au fournisseur et remplit la liste de notifications
-- de bruit — c'est au moteur de l'arrêter, pas à quelqu'un qui passe.
create or replace function app.pause_automation_after_failures()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare seuil integer; consecutifs integer;
begin
  if new.outcome <> 'echec' then return null; end if;

  select s.automation_fail_max into seuil
    from public.agency_settings s where s.agency_id = new.agency_id;
  seuil := coalesce(seuil, 3);

  select count(*) into consecutifs
  from (
    select r.outcome
    from public.automation_run r
    where r.automation_id = new.automation_id
    order by r.ran_at desc
    limit seuil
  ) derniers
  where derniers.outcome = 'echec';

  if consecutifs >= seuil then
    update public.automation a
       set status = 'echec'
     where a.id = new.automation_id
       and a.status = 'active';
  end if;

  return null;
end;
$$;

create trigger automation_run_pauses_on_failures
  after insert on public.automation_run
  for each row execute function app.pause_automation_after_failures();


-- =============================================================================
-- Les notifications
-- =============================================================================

-- Le vocabulaire : ce qui est critique et d'où ça vient. C'était un objet
-- constant dans le code ; ici l'écran de réglages peut le lire.
create table public.notification_kind_def (
  kind      public.notification_kind primary key,
  label     text not null,
  critical  boolean not null default false,
  source    text not null
);

insert into public.notification_kind_def (kind, label, critical, source) values
  ('integration', 'Intégration',    true,  'Automatisation'),
  ('position',    'Position',       false, 'Relevé de positions'),
  ('sante',       'Score de santé', true,  'Audit automatique'),
  ('facture',     'Facturation',    false, 'Facturation'),
  ('liens',       'Liens brisés',   false, 'Audit automatique'),
  ('avis',        'Avis',           false, 'Veille des avis'),
  ('rapport',     'Rapport',        false, 'Cycle mensuel'),
  ('deal',        'Pipeline',       false, 'Pipeline'),
  ('agent',       'Agent',          false, 'Agent HuntPilote');


create table public.notification (
  id             uuid primary key default gen_random_uuid(),
  agency_id      uuid not null references public.agency(id) on delete cascade,
  -- À qui elle s'adresse. Null = toute l'agence.
  recipient_id   uuid references public.agency_member(id) on delete cascade,
  client_id      uuid references public.client(id) on delete set null,

  kind           public.notification_kind not null
                   references public.notification_kind_def(kind),
  title          text not null,
  body           text,
  cta_label      text,
  href           text,

  -- L'exécution d'automatisation qui l'a produite, quand il y en a une.
  automation_run_id uuid references public.automation_run(id) on delete set null,

  -- « Lu » n'est pas un booléen : c'est une date, ou rien.
  read_at        timestamptz,
  -- L'objet pointé n'existe plus (un brouillon supprimé, par exemple). La
  -- notification reste, mais elle dit pourquoi elle ne mène nulle part.
  stale_reason   text,

  created_at     timestamptz not null default now(),

  -- Un appel à l'action sans destination ne mène nulle part, et une
  -- destination sans libellé ne se clique pas.
  constraint notification_cta_pairing check ((cta_label is null) = (href is null)),
  -- Une notification périmée ne propose plus d'aller nulle part.
  constraint notification_stale_has_no_cta check (stale_reason is null or href is null)
);

create index notification_recipient_idx on public.notification (recipient_id, created_at desc);
create index notification_agency_idx on public.notification (agency_id, created_at desc);
create index notification_client_idx on public.notification (client_id);
create index notification_run_idx on public.notification (automation_run_id);
-- Les non lues : c'est la seule chose que la cloche compte.
create index notification_unread_idx on public.notification (recipient_id)
  where read_at is null;


-- =============================================================================
-- L'agenda
-- =============================================================================

create table public.agenda_event_type_def (
  type      public.agenda_event_type primary key,
  label     text not null,
  -- Seule une échéance se déplace : on ne repousse pas un rendez-vous client
  -- ni une exécution planifiée d'un glissement dans le calendrier.
  movable   boolean not null default false,
  link_label text not null
);

insert into public.agenda_event_type_def (type, label, movable, link_label) values
  ('echeance', 'Échéance de tâche',            true,  'Ouvrir la tâche'),
  ('rapport',  'Envoi de rapport programmé',   false, 'Ouvrir le rapport'),
  ('rdv',      'Rendez-vous client',           false, 'Ouvrir la fiche client'),
  ('exec',     'Exécution planifiée',          false, 'Ouvrir l''exécution');


create table public.agenda_event (
  id             uuid primary key default gen_random_uuid(),
  agency_id      uuid not null references public.agency(id) on delete cascade,
  client_id      uuid references public.client(id) on delete cascade,

  type           public.agenda_event_type not null
                   references public.agenda_event_type_def(type),
  title          text not null,
  occurs_on      date not null,
  -- Un événement sans heure occupe la journée.
  at_time        time,
  duration_min   integer,
  done           boolean not null default false,

  -- Un événement d'agenda pointe toujours vers quelque chose de réel — sinon
  -- « Ouvrir la tâche » n'ouvre rien.
  task_id        uuid references public.task(id) on delete cascade,
  report_id      uuid references public.report(id) on delete cascade,
  automation_id  uuid references public.automation(id) on delete cascade,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint agenda_event_duration_positive check (duration_min is null or duration_min > 0),
  constraint agenda_event_duration_needs_time check (duration_min is null or at_time is not null),
  constraint agenda_event_target check (
    case type
      when 'echeance' then task_id is not null      and report_id is null and automation_id is null
      when 'rapport'  then report_id is not null    and task_id is null   and automation_id is null
      when 'exec'     then automation_id is not null and task_id is null  and report_id is null
      when 'rdv'      then client_id is not null and task_id is null
                           and report_id is null and automation_id is null
    end
  ),
  -- Seule une échéance se coche.
  constraint agenda_event_only_deadlines_are_done check (type = 'echeance' or not done)
);

create index agenda_event_agency_idx on public.agenda_event (agency_id, occurs_on);
create index agenda_event_client_idx on public.agenda_event (client_id);
create index agenda_event_task_idx on public.agenda_event (task_id);
create index agenda_event_report_idx on public.agenda_event (report_id);
create index agenda_event_automation_idx on public.agenda_event (automation_id);

create trigger agenda_event_touch
  before update on public.agenda_event
  for each row execute function app.touch_updated_at();


-- =============================================================================
-- Ce qui se déduit
-- =============================================================================

-- L'état de santé d'une règle : ses exécutions, la dernière, son taux de
-- réussite, et le nombre d'échecs qu'elle enchaîne.
create view public.automation_health as
select
  a.id as automation_id,
  a.agency_id,
  a.name,
  a.status,
  count(r.id)                                            as runs,
  max(r.ran_at)                                          as last_run_at,
  count(r.id) filter (where r.outcome = 'succes')         as successes,
  case when count(r.id) = 0 then null
       else round(100.0 * count(r.id) filter (where r.outcome = 'succes')
                  / count(r.id))
  end                                                    as success_pct
from public.automation a
left join public.automation_run r on r.automation_id = a.id
group by a.id, a.agency_id, a.name, a.status;

alter view public.automation_health set (security_invoker = on);


-- Un contenu, son retard et sa mesure. `late` et `prevPos` disparaissent.
create view public.content_item_status as
select
  c.id as content_id,
  c.agency_id,
  c.client_id,
  c.title,
  c.state,
  c.due_on,
  c.published_at,
  (c.state not in ('publie', 'mesure')
   and c.due_on is not null and c.due_on < current_date)  as late,
  p.measured_on,
  p.visits,
  p.position,
  pp.position                                             as position_previous
from public.content_item c
left join lateral (
  select * from public.content_performance x
   where x.content_id = c.id order by x.measured_on desc limit 1
) p on true
left join lateral (
  select * from public.content_performance x
   where x.content_id = c.id and x.measured_on < p.measured_on
   order by x.measured_on desc limit 1
) pp on true;

alter view public.content_item_status set (security_invoker = on);


-- Le quota éditorial du mois : produit contre promis.
create view public.content_month_quota as
select
  c.agency_id,
  c.client_id,
  date_trunc('month', c.due_on)::date as month,
  count(*)                            as planned,
  count(*) filter (where c.state in ('publie', 'mesure')) as delivered,
  cl.monthly_content_quota            as quota
from public.content_item c
join public.client cl on cl.id = c.client_id
where c.due_on is not null
group by c.agency_id, c.client_id, date_trunc('month', c.due_on), cl.monthly_content_quota;

alter view public.content_month_quota set (security_invoker = on);


-- =============================================================================
-- Cloisonnement
-- =============================================================================

alter table public.content_item             enable row level security;
alter table public.content_performance      enable row level security;
alter table public.content_brief            enable row level security;
alter table public.brief_secondary_keyword  enable row level security;
alter table public.brief_outline_row        enable row level security;
alter table public.brief_internal_link      enable row level security;
alter table public.brief_competitor         enable row level security;
alter table public.automation               enable row level security;
alter table public.automation_condition     enable row level security;
alter table public.automation_run           enable row level security;
alter table public.notification             enable row level security;
alter table public.agenda_event             enable row level security;

-- Les trois vocabulaires sont les mêmes pour toutes les agences : lisibles de
-- tous ceux qui sont connectés, modifiables par personne depuis l'application.
alter table public.automation_condition_def   enable row level security;
alter table public.automation_condition_scope enable row level security;
alter table public.notification_kind_def      enable row level security;
alter table public.agenda_event_type_def      enable row level security;

create policy automation_condition_def_read on public.automation_condition_def
  for select to authenticated using (true);
create policy automation_condition_scope_read on public.automation_condition_scope
  for select to authenticated using (true);
create policy notification_kind_def_read on public.notification_kind_def
  for select to authenticated using (true);
create policy agenda_event_type_def_read on public.agenda_event_type_def
  for select to authenticated using (true);

create policy content_item_agency_all on public.content_item
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy content_performance_agency_all on public.content_performance
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy content_brief_agency_all on public.content_brief
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy automation_agency_all on public.automation
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy automation_run_agency_all on public.automation_run
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy agenda_event_agency_all on public.agenda_event
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

-- Une notification s'adresse à quelqu'un : un membre ne lit que les siennes,
-- et celles adressées à toute l'agence.
create policy notification_own_read on public.notification
  for select to authenticated
  using (agency_id = app.current_agency_id()
         and (recipient_id is null
              or recipient_id in (select m.id from public.agency_member m
                                   where m.user_id = (select auth.uid()))));

create policy notification_own_update on public.notification
  for update to authenticated
  using (agency_id = app.current_agency_id()
         and (recipient_id is null
              or recipient_id in (select m.id from public.agency_member m
                                   where m.user_id = (select auth.uid()))))
  with check (agency_id = app.current_agency_id());

create policy notification_agency_write on public.notification
  for insert to authenticated
  with check (agency_id = app.current_agency_id());

-- Les détails du brief suivent le brief.
create policy brief_secondary_keyword_agency_all on public.brief_secondary_keyword
  for all to authenticated
  using (exists (select 1 from public.content_brief b
                  where b.content_id = public.brief_secondary_keyword.content_id
                    and b.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.content_brief b
                  where b.content_id = public.brief_secondary_keyword.content_id
                    and b.agency_id = app.current_agency_id()));

create policy brief_outline_row_agency_all on public.brief_outline_row
  for all to authenticated
  using (exists (select 1 from public.content_brief b
                  where b.content_id = public.brief_outline_row.content_id
                    and b.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.content_brief b
                  where b.content_id = public.brief_outline_row.content_id
                    and b.agency_id = app.current_agency_id()));

create policy brief_internal_link_agency_all on public.brief_internal_link
  for all to authenticated
  using (exists (select 1 from public.content_brief b
                  where b.content_id = public.brief_internal_link.content_id
                    and b.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.content_brief b
                  where b.content_id = public.brief_internal_link.content_id
                    and b.agency_id = app.current_agency_id()));

create policy brief_competitor_agency_all on public.brief_competitor
  for all to authenticated
  using (exists (select 1 from public.content_brief b
                  where b.content_id = public.brief_competitor.content_id
                    and b.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.content_brief b
                  where b.content_id = public.brief_competitor.content_id
                    and b.agency_id = app.current_agency_id()));

create policy automation_condition_agency_all on public.automation_condition
  for all to authenticated
  using (exists (select 1 from public.automation a
                  where a.id = public.automation_condition.automation_id
                    and a.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.automation a
                  where a.id = public.automation_condition.automation_id
                    and a.agency_id = app.current_agency_id()));
