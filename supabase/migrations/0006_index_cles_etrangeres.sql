-- =============================================================================
-- 0006 — Index sur les clés étrangères restantes
-- =============================================================================
-- Une clé étrangère sans index couvrant oblige PostgreSQL à parcourir toute la
-- table fille à chaque suppression ou mise à jour du parent — et ce sont
-- justement les colonnes sur lesquelles l'application filtre (« les messages
-- qui parlent de cette priorité », « les preuves de cette tâche »).
--
-- Les colonnes « qui a fait quoi » (author_id, assignee_id, owner_id…) sont
-- rarement filtrées, mais elles pointent toutes vers `agency_member` :
-- désactiver un membre déclencherait sinon un parcours complet de chaque table
-- qui le référence.
--
-- Signalé par l'audit de performance Supabase (lint 0001_unindexed_foreign_keys).
-- =============================================================================

-- Jointures de la boucle de livraison
create index proof_task_idx                  on public.proof (task_id);
create index proof_priority_idx              on public.proof (priority_id);
create index priority_source_audit_idx       on public.priority (source_audit_id);
create index priority_source_criterion_idx   on public.priority (source_criterion_id);
create index report_proof_proof_idx          on public.report_proof (proof_id);
create index audit_criterion_definition_idx  on public.audit_criterion (definition_id);

-- Cloisonnement par agence
create index contact_agency_idx              on public.contact (agency_id);
create index report_version_agency_idx       on public.report_version (agency_id);

-- Ancres de contexte d'un message (session 7.2)
create index communication_ctx_priority_idx  on public.communication (context_priority_id);
create index communication_ctx_report_idx    on public.communication (context_report_id);
create index communication_ctx_invoice_idx   on public.communication (context_invoice_id);
create index communication_ctx_contact_idx   on public.communication (context_contact_id);
create index quote_contact_idx               on public.quote (contact_id);

-- Rattachements à un membre de l'agence
create index audit_launched_by_idx           on public.audit (launched_by);
create index communication_author_idx        on public.communication (author_id);
create index deal_owner_idx                  on public.deal (owner_id);
create index quote_version_created_by_idx    on public.quote_version (created_by);
create index report_version_published_by_idx on public.report_version (published_by);
create index task_comment_author_idx         on public.task_comment (author_id);
create index task_step_assignee_idx          on public.task_step (assignee_id);
create index task_time_log_member_idx        on public.task_time_log (member_id);
