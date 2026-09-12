// Généré depuis le schéma du projet Supabase `huntpilote` — ne pas modifier à
// la main. À régénérer après chaque migration :
//   outil MCP `generate_typescript_types`, ou `supabase gen types typescript`.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agency: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          gst_number: string | null
          id: string
          legal_name: string | null
          logo_url: string | null
          name: string
          phone: string | null
          postal_code: string | null
          province: string | null
          qst_number: string | null
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          qst_number?: string | null
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          qst_number?: string | null
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      agency_member: {
        Row: {
          accepted_at: string | null
          active: boolean
          address: string | null
          agency_id: string
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string | null
          hourly_rate_cents: number | null
          id: string
          initials: string
          invited_at: string | null
          job_title: string | null
          last_name: string | null
          phone: string | null
          postal_code: string | null
          province: string | null
          role: Database["public"]["Enums"]["agency_role"]
          started_on: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          active?: boolean
          address?: string | null
          agency_id: string
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          hourly_rate_cents?: number | null
          id?: string
          initials: string
          invited_at?: string | null
          job_title?: string | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          role?: Database["public"]["Enums"]["agency_role"]
          started_on?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          active?: boolean
          address?: string | null
          agency_id?: string
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          hourly_rate_cents?: number | null
          id?: string
          initials?: string
          invited_at?: string | null
          job_title?: string | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          role?: Database["public"]["Enums"]["agency_role"]
          started_on?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_member_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_settings: {
        Row: {
          agency_id: string
          automation_dry_run_warn: number
          automation_fail_max: number
          content_measure_days: number
          created_at: string
          cwv_detail_days: number
          grid_point_price_cents: number
          health_score_alert_below: number
          keyword_cache_days: number
          monthly_credit_quota: number | null
          pack_drop_alert_places: number
          serp_daily_days: number
          serp_weekly_days: number
          tps_rate: number
          tvq_rate: number
          updated_at: string
        }
        Insert: {
          agency_id: string
          automation_dry_run_warn?: number
          automation_fail_max?: number
          content_measure_days?: number
          created_at?: string
          cwv_detail_days?: number
          grid_point_price_cents?: number
          health_score_alert_below?: number
          keyword_cache_days?: number
          monthly_credit_quota?: number | null
          pack_drop_alert_places?: number
          serp_daily_days?: number
          serp_weekly_days?: number
          tps_rate?: number
          tvq_rate?: number
          updated_at?: string
        }
        Update: {
          agency_id?: string
          automation_dry_run_warn?: number
          automation_fail_max?: number
          content_measure_days?: number
          created_at?: string
          cwv_detail_days?: number
          grid_point_price_cents?: number
          health_score_alert_below?: number
          keyword_cache_days?: number
          monthly_credit_quota?: number | null
          pack_drop_alert_places?: number
          serp_daily_days?: number
          serp_weekly_days?: number
          tps_rate?: number
          tvq_rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_settings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: true
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      agenda_event: {
        Row: {
          agency_id: string
          at_time: string | null
          automation_id: string | null
          client_id: string | null
          created_at: string
          done: boolean
          duration_min: number | null
          id: string
          occurs_on: string
          report_id: string | null
          task_id: string | null
          title: string
          type: Database["public"]["Enums"]["agenda_event_type"]
          updated_at: string
        }
        Insert: {
          agency_id: string
          at_time?: string | null
          automation_id?: string | null
          client_id?: string | null
          created_at?: string
          done?: boolean
          duration_min?: number | null
          id?: string
          occurs_on: string
          report_id?: string | null
          task_id?: string | null
          title: string
          type: Database["public"]["Enums"]["agenda_event_type"]
          updated_at?: string
        }
        Update: {
          agency_id?: string
          at_time?: string | null
          automation_id?: string | null
          client_id?: string | null
          created_at?: string
          done?: boolean
          duration_min?: number | null
          id?: string
          occurs_on?: string
          report_id?: string | null
          task_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["agenda_event_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_event_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_event_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_event_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation_health"
            referencedColumns: ["automation_id"]
          },
          {
            foreignKeyName: "agenda_event_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_event_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_event_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_event_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "agenda_event_type_def"
            referencedColumns: ["type"]
          },
        ]
      }
      agenda_event_type_def: {
        Row: {
          label: string
          link_label: string
          movable: boolean
          type: Database["public"]["Enums"]["agenda_event_type"]
        }
        Insert: {
          label: string
          link_label: string
          movable?: boolean
          type: Database["public"]["Enums"]["agenda_event_type"]
        }
        Update: {
          label?: string
          link_label?: string
          movable?: boolean
          type?: Database["public"]["Enums"]["agenda_event_type"]
        }
        Relationships: []
      }
      audit: {
        Row: {
          agency_id: string
          avg_depth: number | null
          client_id: string
          crawl_errors: number | null
          created_at: string
          duration_s: number | null
          id: string
          launched_by: string | null
          pages_crawled: number | null
          quota_pages: number | null
          ref: string
          run_at: string
          score: number | null
          slug: string
          state: Database["public"]["Enums"]["audit_state"]
          updated_at: string
        }
        Insert: {
          agency_id: string
          avg_depth?: number | null
          client_id: string
          crawl_errors?: number | null
          created_at?: string
          duration_s?: number | null
          id?: string
          launched_by?: string | null
          pages_crawled?: number | null
          quota_pages?: number | null
          ref: string
          run_at?: string
          score?: number | null
          slug: string
          state?: Database["public"]["Enums"]["audit_state"]
          updated_at?: string
        }
        Update: {
          agency_id?: string
          avg_depth?: number | null
          client_id?: string
          crawl_errors?: number | null
          created_at?: string
          duration_s?: number | null
          id?: string
          launched_by?: string | null
          pages_crawled?: number | null
          quota_pages?: number | null
          ref?: string
          run_at?: string
          score?: number | null
          slug?: string
          state?: Database["public"]["Enums"]["audit_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_launched_by_fkey"
            columns: ["launched_by"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_launched_by_fkey"
            columns: ["launched_by"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
        ]
      }
      audit_criterion: {
        Row: {
          affected_pages: number | null
          audit_id: string
          created_at: string
          definition_id: string | null
          dimension: Database["public"]["Enums"]["audit_dimension"]
          establishment_id: string | null
          family: Database["public"]["Enums"]["audit_family"] | null
          id: string
          label: string
          measure: string | null
          note: string | null
          pages: Json | null
          status: Database["public"]["Enums"]["criterion_status"]
          threshold: string | null
        }
        Insert: {
          affected_pages?: number | null
          audit_id: string
          created_at?: string
          definition_id?: string | null
          dimension: Database["public"]["Enums"]["audit_dimension"]
          establishment_id?: string | null
          family?: Database["public"]["Enums"]["audit_family"] | null
          id?: string
          label: string
          measure?: string | null
          note?: string | null
          pages?: Json | null
          status: Database["public"]["Enums"]["criterion_status"]
          threshold?: string | null
        }
        Update: {
          affected_pages?: number | null
          audit_id?: string
          created_at?: string
          definition_id?: string | null
          dimension?: Database["public"]["Enums"]["audit_dimension"]
          establishment_id?: string | null
          family?: Database["public"]["Enums"]["audit_family"] | null
          id?: string
          label?: string
          measure?: string | null
          note?: string | null
          pages?: Json | null
          status?: Database["public"]["Enums"]["criterion_status"]
          threshold?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_criterion_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_criterion_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "criterion_definition"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_criterion_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_criterion_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment_alert"
            referencedColumns: ["establishment_id"]
          },
        ]
      }
      audit_dimension_score: {
        Row: {
          audit_id: string
          dimension: Database["public"]["Enums"]["audit_dimension"]
          score: number
          weight: number
        }
        Insert: {
          audit_id: string
          dimension: Database["public"]["Enums"]["audit_dimension"]
          score: number
          weight: number
        }
        Update: {
          audit_id?: string
          dimension?: Database["public"]["Enums"]["audit_dimension"]
          score?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "audit_dimension_score_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audit"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_url_change: {
        Row: {
          audit_id: string
          kind: Database["public"]["Enums"]["url_change_kind"]
          url: string
        }
        Insert: {
          audit_id: string
          kind: Database["public"]["Enums"]["url_change_kind"]
          url: string
        }
        Update: {
          audit_id?: string
          kind?: Database["public"]["Enums"]["url_change_kind"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_url_change_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audit"
            referencedColumns: ["id"]
          },
        ]
      }
      automation: {
        Row: {
          action: Database["public"]["Enums"]["automation_action"] | null
          action_params: Json
          agency_id: string
          category: Database["public"]["Enums"]["automation_category"]
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["automation_status"]
          trigger: Database["public"]["Enums"]["automation_trigger"] | null
          trigger_params: Json
          updated_at: string
          uses_ai: boolean
        }
        Insert: {
          action?: Database["public"]["Enums"]["automation_action"] | null
          action_params?: Json
          agency_id: string
          category: Database["public"]["Enums"]["automation_category"]
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["automation_status"]
          trigger?: Database["public"]["Enums"]["automation_trigger"] | null
          trigger_params?: Json
          updated_at?: string
          uses_ai?: boolean
        }
        Update: {
          action?: Database["public"]["Enums"]["automation_action"] | null
          action_params?: Json
          agency_id?: string
          category?: Database["public"]["Enums"]["automation_category"]
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["automation_status"]
          trigger?: Database["public"]["Enums"]["automation_trigger"] | null
          trigger_params?: Json
          updated_at?: string
          uses_ai?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "automation_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_condition: {
        Row: {
          automation_id: string
          id: string
          kind: Database["public"]["Enums"]["automation_condition_kind"]
          value: Json
        }
        Insert: {
          automation_id: string
          id?: string
          kind: Database["public"]["Enums"]["automation_condition_kind"]
          value: Json
        }
        Update: {
          automation_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["automation_condition_kind"]
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "automation_condition_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_condition_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation_health"
            referencedColumns: ["automation_id"]
          },
          {
            foreignKeyName: "automation_condition_kind_fkey"
            columns: ["kind"]
            isOneToOne: false
            referencedRelation: "automation_condition_def"
            referencedColumns: ["kind"]
          },
        ]
      }
      automation_condition_def: {
        Row: {
          kind: Database["public"]["Enums"]["automation_condition_kind"]
          label: string
          universal: boolean
        }
        Insert: {
          kind: Database["public"]["Enums"]["automation_condition_kind"]
          label: string
          universal?: boolean
        }
        Update: {
          kind?: Database["public"]["Enums"]["automation_condition_kind"]
          label?: string
          universal?: boolean
        }
        Relationships: []
      }
      automation_condition_scope: {
        Row: {
          kind: Database["public"]["Enums"]["automation_condition_kind"]
          trigger: Database["public"]["Enums"]["automation_trigger"]
        }
        Insert: {
          kind: Database["public"]["Enums"]["automation_condition_kind"]
          trigger: Database["public"]["Enums"]["automation_trigger"]
        }
        Update: {
          kind?: Database["public"]["Enums"]["automation_condition_kind"]
          trigger?: Database["public"]["Enums"]["automation_trigger"]
        }
        Relationships: [
          {
            foreignKeyName: "automation_condition_scope_kind_fkey"
            columns: ["kind"]
            isOneToOne: false
            referencedRelation: "automation_condition_def"
            referencedColumns: ["kind"]
          },
        ]
      }
      automation_run: {
        Row: {
          agency_id: string
          automation_id: string
          client_id: string | null
          created_audit_id: string | null
          created_priority_id: string | null
          created_task_id: string | null
          detail: string | null
          id: string
          outcome: Database["public"]["Enums"]["automation_run_outcome"]
          ran_at: string
        }
        Insert: {
          agency_id: string
          automation_id: string
          client_id?: string | null
          created_audit_id?: string | null
          created_priority_id?: string | null
          created_task_id?: string | null
          detail?: string | null
          id?: string
          outcome: Database["public"]["Enums"]["automation_run_outcome"]
          ran_at?: string
        }
        Update: {
          agency_id?: string
          automation_id?: string
          client_id?: string | null
          created_audit_id?: string | null
          created_priority_id?: string | null
          created_task_id?: string | null
          detail?: string | null
          id?: string
          outcome?: Database["public"]["Enums"]["automation_run_outcome"]
          ran_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_run_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_run_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_run_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation_health"
            referencedColumns: ["automation_id"]
          },
          {
            foreignKeyName: "automation_run_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_run_created_audit_id_fkey"
            columns: ["created_audit_id"]
            isOneToOne: false
            referencedRelation: "audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_run_created_priority_id_fkey"
            columns: ["created_priority_id"]
            isOneToOne: false
            referencedRelation: "priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_run_created_task_id_fkey"
            columns: ["created_task_id"]
            isOneToOne: false
            referencedRelation: "task"
            referencedColumns: ["id"]
          },
        ]
      }
      backlink_anchor: {
        Row: {
          anchor: string
          occurrences: number
          reading_id: string
        }
        Insert: {
          anchor: string
          occurrences: number
          reading_id: string
        }
        Update: {
          anchor?: string
          occurrences?: number
          reading_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "backlink_anchor_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "backlink_reading"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlink_anchor_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "backlink_reading_delta"
            referencedColumns: ["reading_id"]
          },
        ]
      }
      backlink_competitor: {
        Row: {
          domain: string | null
          name: string
          reading_id: string
          referring_domains: number | null
        }
        Insert: {
          domain?: string | null
          name: string
          reading_id: string
          referring_domains?: number | null
        }
        Update: {
          domain?: string | null
          name?: string
          reading_id?: string
          referring_domains?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "backlink_competitor_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "backlink_reading"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlink_competitor_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "backlink_reading_delta"
            referencedColumns: ["reading_id"]
          },
        ]
      }
      backlink_event: {
        Row: {
          agency_id: string
          anchor: string | null
          authority: number | null
          client_id: string
          created_at: string
          domain: string
          id: string
          kind: Database["public"]["Enums"]["backlink_event_kind"]
          occurred_on: string
          reading_id: string | null
          reason: string | null
          target_url: string | null
        }
        Insert: {
          agency_id: string
          anchor?: string | null
          authority?: number | null
          client_id: string
          created_at?: string
          domain: string
          id?: string
          kind: Database["public"]["Enums"]["backlink_event_kind"]
          occurred_on: string
          reading_id?: string | null
          reason?: string | null
          target_url?: string | null
        }
        Update: {
          agency_id?: string
          anchor?: string | null
          authority?: number | null
          client_id?: string
          created_at?: string
          domain?: string
          id?: string
          kind?: Database["public"]["Enums"]["backlink_event_kind"]
          occurred_on?: string
          reading_id?: string | null
          reason?: string | null
          target_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backlink_event_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlink_event_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlink_event_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "backlink_reading"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlink_event_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "backlink_reading_delta"
            referencedColumns: ["reading_id"]
          },
        ]
      }
      backlink_reading: {
        Row: {
          agency_id: string
          authority: number | null
          client_id: string
          created_at: string
          followed_pct: number | null
          id: string
          measured_on: string
          referring_domains: number | null
        }
        Insert: {
          agency_id: string
          authority?: number | null
          client_id: string
          created_at?: string
          followed_pct?: number | null
          id?: string
          measured_on?: string
          referring_domains?: number | null
        }
        Update: {
          agency_id?: string
          authority?: number | null
          client_id?: string
          created_at?: string
          followed_pct?: number | null
          id?: string
          measured_on?: string
          referring_domains?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "backlink_reading_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlink_reading_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      brief_competitor: {
        Row: {
          angle: string | null
          content_id: string
          domain: string
          rank: number
          word_count: number | null
        }
        Insert: {
          angle?: string | null
          content_id: string
          domain: string
          rank: number
          word_count?: number | null
        }
        Update: {
          angle?: string | null
          content_id?: string
          domain?: string
          rank?: number
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brief_competitor_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_brief"
            referencedColumns: ["content_id"]
          },
        ]
      }
      brief_internal_link: {
        Row: {
          anchor: string
          content_id: string
          url: string
        }
        Insert: {
          anchor: string
          content_id: string
          url: string
        }
        Update: {
          anchor?: string
          content_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "brief_internal_link_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_brief"
            referencedColumns: ["content_id"]
          },
        ]
      }
      brief_outline_row: {
        Row: {
          content_id: string
          level: number
          position: number
          title: string
        }
        Insert: {
          content_id: string
          level: number
          position: number
          title: string
        }
        Update: {
          content_id?: string
          level?: number
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "brief_outline_row_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_brief"
            referencedColumns: ["content_id"]
          },
        ]
      }
      brief_secondary_keyword: {
        Row: {
          content_id: string
          intent: Database["public"]["Enums"]["search_intent"] | null
          search_volume: number | null
          term: string
        }
        Insert: {
          content_id: string
          intent?: Database["public"]["Enums"]["search_intent"] | null
          search_volume?: number | null
          term: string
        }
        Update: {
          content_id?: string
          intent?: Database["public"]["Enums"]["search_intent"] | null
          search_volume?: number | null
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "brief_secondary_keyword_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_brief"
            referencedColumns: ["content_id"]
          },
        ]
      }
      catalog_item: {
        Row: {
          active: boolean
          agency_id: string
          billing: Database["public"]["Enums"]["billing_period"]
          code: string
          created_at: string
          description: string | null
          id: string
          kind: Database["public"]["Enums"]["catalog_kind"]
          name: string
          position: number
          price_cents: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          agency_id: string
          billing?: Database["public"]["Enums"]["billing_period"]
          code: string
          created_at?: string
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["catalog_kind"]
          name: string
          position?: number
          price_cents?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          agency_id?: string
          billing?: Database["public"]["Enums"]["billing_period"]
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["catalog_kind"]
          name?: string
          position?: number
          price_cents?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      citation: {
        Row: {
          agency_id: string
          checked_on: string | null
          created_at: string
          directory_id: string
          duplicate_note: string | null
          establishment_id: string
          id: string
          state: Database["public"]["Enums"]["citation_state"]
          unreachable_note: string | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          checked_on?: string | null
          created_at?: string
          directory_id: string
          duplicate_note?: string | null
          establishment_id: string
          id?: string
          state: Database["public"]["Enums"]["citation_state"]
          unreachable_note?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          checked_on?: string | null
          created_at?: string
          directory_id?: string
          duplicate_note?: string | null
          establishment_id?: string
          id?: string
          state?: Database["public"]["Enums"]["citation_state"]
          unreachable_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "citation_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citation_directory_id_fkey"
            columns: ["directory_id"]
            isOneToOne: false
            referencedRelation: "directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citation_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citation_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment_alert"
            referencedColumns: ["establishment_id"]
          },
        ]
      }
      citation_mismatch: {
        Row: {
          citation_id: string
          expected_value: string | null
          field: Database["public"]["Enums"]["nap_field"]
          id: string
          published_value: string
        }
        Insert: {
          citation_id: string
          expected_value?: string | null
          field: Database["public"]["Enums"]["nap_field"]
          id?: string
          published_value: string
        }
        Update: {
          citation_id?: string
          expected_value?: string | null
          field?: Database["public"]["Enums"]["nap_field"]
          id?: string
          published_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "citation_mismatch_citation_id_fkey"
            columns: ["citation_id"]
            isOneToOne: false
            referencedRelation: "citation"
            referencedColumns: ["id"]
          },
        ]
      }
      client: {
        Row: {
          address: string | null
          agency_id: string
          archived_at: string | null
          context: string | null
          created_at: string
          domain: string | null
          email: string | null
          engagement: string | null
          health_score: number | null
          health_score_prev: number | null
          id: string
          initials: string
          monthly_content_quota: number | null
          name: string
          owner_id: string | null
          phone: string | null
          plan: string | null
          sector: string | null
          since: string | null
          slug: string
          type: Database["public"]["Enums"]["client_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          agency_id: string
          archived_at?: string | null
          context?: string | null
          created_at?: string
          domain?: string | null
          email?: string | null
          engagement?: string | null
          health_score?: number | null
          health_score_prev?: number | null
          id?: string
          initials: string
          monthly_content_quota?: number | null
          name: string
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          sector?: string | null
          since?: string | null
          slug: string
          type: Database["public"]["Enums"]["client_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          agency_id?: string
          archived_at?: string | null
          context?: string | null
          created_at?: string
          domain?: string | null
          email?: string | null
          engagement?: string | null
          health_score?: number | null
          health_score_prev?: number | null
          id?: string
          initials?: string
          monthly_content_quota?: number | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          sector?: string | null
          since?: string | null
          slug?: string
          type?: Database["public"]["Enums"]["client_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
        ]
      }
      client_input_item: {
        Row: {
          contract_id: string
          due_milestone_id: string | null
          expected_format: string | null
          id: string
          label: string
          note: string | null
          position: number
          received_on: string | null
        }
        Insert: {
          contract_id: string
          due_milestone_id?: string | null
          expected_format?: string | null
          id?: string
          label: string
          note?: string | null
          position?: number
          received_on?: string | null
        }
        Update: {
          contract_id?: string
          due_milestone_id?: string | null
          expected_format?: string | null
          id?: string
          label?: string
          note?: string | null
          position?: number
          received_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_input_item_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_input_item_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract_financials"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "client_input_item_due_milestone_id_fkey"
            columns: ["due_milestone_id"]
            isOneToOne: false
            referencedRelation: "contract_schedule"
            referencedColumns: ["milestone_id"]
          },
          {
            foreignKeyName: "client_input_item_due_milestone_id_fkey"
            columns: ["due_milestone_id"]
            isOneToOne: false
            referencedRelation: "milestone"
            referencedColumns: ["id"]
          },
        ]
      }
      client_subscription: {
        Row: {
          agency_id: string
          billing: Database["public"]["Enums"]["billing_period"]
          catalog_item_id: string | null
          client_id: string
          created_at: string
          ended_on: string | null
          id: string
          intro_ends_on: string | null
          intro_price_cents: number | null
          offer_id: string | null
          price_cents: number
          quantity: number
          started_on: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          billing?: Database["public"]["Enums"]["billing_period"]
          catalog_item_id?: string | null
          client_id: string
          created_at?: string
          ended_on?: string | null
          id?: string
          intro_ends_on?: string | null
          intro_price_cents?: number | null
          offer_id?: string | null
          price_cents: number
          quantity?: number
          started_on?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          billing?: Database["public"]["Enums"]["billing_period"]
          catalog_item_id?: string | null
          client_id?: string
          created_at?: string
          ended_on?: string | null
          id?: string
          intro_ends_on?: string | null
          intro_price_cents?: number | null
          offer_id?: string | null
          price_cents?: number
          quantity?: number
          started_on?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_subscription_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subscription_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subscription_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subscription_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subscription_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer_value"
            referencedColumns: ["offer_id"]
          },
        ]
      }
      communication: {
        Row: {
          agency_id: string
          author_id: string | null
          body: string
          channel: Database["public"]["Enums"]["communication_channel"]
          client_id: string
          client_visible: boolean | null
          contact_id: string | null
          context_contact_id: string | null
          context_invoice_id: string | null
          context_priority_id: string | null
          context_report_id: string | null
          created_at: string
          direction: string
          id: string
          occurred_at: string
          read_at: string | null
        }
        Insert: {
          agency_id: string
          author_id?: string | null
          body: string
          channel: Database["public"]["Enums"]["communication_channel"]
          client_id: string
          client_visible?: boolean | null
          contact_id?: string | null
          context_contact_id?: string | null
          context_invoice_id?: string | null
          context_priority_id?: string | null
          context_report_id?: string | null
          created_at?: string
          direction: string
          id?: string
          occurred_at?: string
          read_at?: string | null
        }
        Update: {
          agency_id?: string
          author_id?: string | null
          body?: string
          channel?: Database["public"]["Enums"]["communication_channel"]
          client_id?: string
          client_visible?: boolean | null
          contact_id?: string | null
          context_contact_id?: string | null
          context_invoice_id?: string | null
          context_priority_id?: string | null
          context_report_id?: string | null
          created_at?: string
          direction?: string
          id?: string
          occurred_at?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "communication_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_context_contact_id_fkey"
            columns: ["context_contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_context_invoice_id_fkey"
            columns: ["context_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_context_invoice_id_fkey"
            columns: ["context_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_total"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "communication_context_priority_id_fkey"
            columns: ["context_priority_id"]
            isOneToOne: false
            referencedRelation: "priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_context_report_id_fkey"
            columns: ["context_report_id"]
            isOneToOne: false
            referencedRelation: "report"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_file: {
        Row: {
          communication_id: string
          created_at: string
          id: string
          name: string
          size_bytes: number | null
          storage_path: string | null
        }
        Insert: {
          communication_id: string
          created_at?: string
          id?: string
          name: string
          size_bytes?: number | null
          storage_path?: string | null
        }
        Update: {
          communication_id?: string
          created_at?: string
          id?: string
          name?: string
          size_bytes?: number | null
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_file_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communication"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor: {
        Row: {
          agency_id: string
          appearances: number | null
          appearances_total: number | null
          categories: string[] | null
          completeness: number | null
          created_at: string
          establishment_id: string
          id: string
          name: string
          rating: number | null
          review_count: number | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          appearances?: number | null
          appearances_total?: number | null
          categories?: string[] | null
          completeness?: number | null
          created_at?: string
          establishment_id: string
          id?: string
          name: string
          rating?: number | null
          review_count?: number | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          appearances?: number | null
          appearances_total?: number | null
          categories?: string[] | null
          completeness?: number | null
          created_at?: string
          establishment_id?: string
          id?: string
          name?: string
          rating?: number | null
          review_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment_alert"
            referencedColumns: ["establishment_id"]
          },
        ]
      }
      competitor_gap: {
        Row: {
          action: string
          competitor_id: string
          created_at: string
          id: string
          lever: string
          their_value: string
        }
        Insert: {
          action: string
          competitor_id: string
          created_at?: string
          id?: string
          lever: string
          their_value: string
        }
        Update: {
          action?: string
          competitor_id?: string
          created_at?: string
          id?: string
          lever?: string
          their_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_gap_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitor"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_overlap: {
        Row: {
          competitor_id: string
          kind: string
          value: string
        }
        Insert: {
          competitor_id: string
          kind: string
          value: string
        }
        Update: {
          competitor_id?: string
          kind?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_overlap_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitor"
            referencedColumns: ["id"]
          },
        ]
      }
      contact: {
        Row: {
          agency_id: string
          archived_at: string | null
          client_id: string
          created_at: string
          email: string | null
          establishment_id: string | null
          full_name: string
          id: string
          initials: string
          is_primary: boolean
          notes: string | null
          phone: string | null
          preferred_channel: Database["public"]["Enums"]["communication_channel"]
          role: string | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          archived_at?: string | null
          client_id: string
          created_at?: string
          email?: string | null
          establishment_id?: string | null
          full_name: string
          id?: string
          initials: string
          is_primary?: boolean
          notes?: string | null
          phone?: string | null
          preferred_channel?: Database["public"]["Enums"]["communication_channel"]
          role?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          archived_at?: string | null
          client_id?: string
          created_at?: string
          email?: string | null
          establishment_id?: string | null
          full_name?: string
          id?: string
          initials?: string
          is_primary?: boolean
          notes?: string | null
          phone?: string | null
          preferred_channel?: Database["public"]["Enums"]["communication_channel"]
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment_alert"
            referencedColumns: ["establishment_id"]
          },
        ]
      }
      content_brief: {
        Row: {
          agency_id: string
          assigned_at: string | null
          content_id: string
          created_at: string
          cta: string | null
          current_position: number | null
          difficulty: number | null
          images: string | null
          intent: Database["public"]["Enums"]["search_intent"] | null
          intent_proof: string | null
          intent_text: string | null
          length_why: string | null
          proof_draft: string | null
          target_length: string | null
          tone: string | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          assigned_at?: string | null
          content_id: string
          created_at?: string
          cta?: string | null
          current_position?: number | null
          difficulty?: number | null
          images?: string | null
          intent?: Database["public"]["Enums"]["search_intent"] | null
          intent_proof?: string | null
          intent_text?: string | null
          length_why?: string | null
          proof_draft?: string | null
          target_length?: string | null
          tone?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          assigned_at?: string | null
          content_id?: string
          created_at?: string
          cta?: string | null
          current_position?: number | null
          difficulty?: number | null
          images?: string | null
          intent?: Database["public"]["Enums"]["search_intent"] | null
          intent_proof?: string | null
          intent_text?: string | null
          length_why?: string | null
          proof_draft?: string | null
          target_length?: string | null
          tone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_brief_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_brief_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: true
            referencedRelation: "content_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_brief_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: true
            referencedRelation: "content_item_status"
            referencedColumns: ["content_id"]
          },
        ]
      }
      content_item: {
        Row: {
          agency_id: string
          client_id: string
          created_at: string
          due_on: string | null
          from_keyword: boolean
          from_keyword_note: string | null
          id: string
          priority_id: string | null
          proof_id: string | null
          published_at: string | null
          reviewer_id: string | null
          search_volume: number | null
          slug: string
          state: Database["public"]["Enums"]["content_state"]
          target_keyword: string | null
          title: string
          updated_at: string
          url: string | null
          writer_id: string | null
        }
        Insert: {
          agency_id: string
          client_id: string
          created_at?: string
          due_on?: string | null
          from_keyword?: boolean
          from_keyword_note?: string | null
          id?: string
          priority_id?: string | null
          proof_id?: string | null
          published_at?: string | null
          reviewer_id?: string | null
          search_volume?: number | null
          slug: string
          state?: Database["public"]["Enums"]["content_state"]
          target_keyword?: string | null
          title: string
          updated_at?: string
          url?: string | null
          writer_id?: string | null
        }
        Update: {
          agency_id?: string
          client_id?: string
          created_at?: string
          due_on?: string | null
          from_keyword?: boolean
          from_keyword_note?: string | null
          id?: string
          priority_id?: string | null
          proof_id?: string | null
          published_at?: string | null
          reviewer_id?: string | null
          search_volume?: number | null
          slug?: string
          state?: Database["public"]["Enums"]["content_state"]
          target_keyword?: string | null
          title?: string
          updated_at?: string
          url?: string | null
          writer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_item_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_priority_id_fkey"
            columns: ["priority_id"]
            isOneToOne: false
            referencedRelation: "priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "proof"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "content_item_writer_id_fkey"
            columns: ["writer_id"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_writer_id_fkey"
            columns: ["writer_id"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
        ]
      }
      content_performance: {
        Row: {
          agency_id: string
          content_id: string
          created_at: string
          id: string
          measured_on: string
          position: number | null
          visits: number | null
        }
        Insert: {
          agency_id: string
          content_id: string
          created_at?: string
          id?: string
          measured_on?: string
          position?: number | null
          visits?: number | null
        }
        Update: {
          agency_id?: string
          content_id?: string
          created_at?: string
          id?: string
          measured_on?: string
          position?: number | null
          visits?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_performance_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_performance_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_performance_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_item_status"
            referencedColumns: ["content_id"]
          },
        ]
      }
      contract: {
        Row: {
          acceptance_business_days: number
          agency_id: string
          client_id: string
          content_deadline_days: number
          created_at: string
          deal_id: string | null
          ended_on: string | null
          fee_cents: number | null
          hourly_rate_cents: number | null
          id: string
          ref: string
          sent_on: string | null
          signed_by_contact_id: string | null
          signed_by_member_id: string | null
          signed_on: string | null
          started_on: string | null
          status: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at: string
          warranty_days: number
        }
        Insert: {
          acceptance_business_days?: number
          agency_id: string
          client_id: string
          content_deadline_days?: number
          created_at?: string
          deal_id?: string | null
          ended_on?: string | null
          fee_cents?: number | null
          hourly_rate_cents?: number | null
          id?: string
          ref: string
          sent_on?: string | null
          signed_by_contact_id?: string | null
          signed_by_member_id?: string | null
          signed_on?: string | null
          started_on?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at?: string
          warranty_days?: number
        }
        Update: {
          acceptance_business_days?: number
          agency_id?: string
          client_id?: string
          content_deadline_days?: number
          created_at?: string
          deal_id?: string | null
          ended_on?: string | null
          fee_cents?: number | null
          hourly_rate_cents?: number | null
          id?: string
          ref?: string
          sent_on?: string | null
          signed_by_contact_id?: string | null
          signed_by_member_id?: string | null
          signed_on?: string | null
          started_on?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          title?: string
          updated_at?: string
          warranty_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_signed_by_contact_id_fkey"
            columns: ["signed_by_contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_signed_by_member_id_fkey"
            columns: ["signed_by_member_id"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_signed_by_member_id_fkey"
            columns: ["signed_by_member_id"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
        ]
      }
      contract_document: {
        Row: {
          contract_id: string
          created_at: string
          file_url: string | null
          id: string
          issued_on: string | null
          kind: Database["public"]["Enums"]["document_kind"]
          name: string
          precedence: number
          ref: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          issued_on?: string | null
          kind: Database["public"]["Enums"]["document_kind"]
          name: string
          precedence: number
          ref?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          issued_on?: string | null
          kind?: Database["public"]["Enums"]["document_kind"]
          name?: string
          precedence?: number
          ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_document_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_document_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract_financials"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      contract_exclusion: {
        Row: {
          contract_id: string
          detail: string | null
          id: string
          label: string
          offer_id: string | null
          position: number
          quote_id: string | null
        }
        Insert: {
          contract_id: string
          detail?: string | null
          id?: string
          label: string
          offer_id?: string | null
          position?: number
          quote_id?: string | null
        }
        Update: {
          contract_id?: string
          detail?: string | null
          id?: string
          label?: string
          offer_id?: string | null
          position?: number
          quote_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_exclusion_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_exclusion_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract_financials"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_exclusion_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_exclusion_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer_value"
            referencedColumns: ["offer_id"]
          },
          {
            foreignKeyName: "contract_exclusion_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quote"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_exclusion_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quote_total"
            referencedColumns: ["quote_id"]
          },
        ]
      }
      criterion_definition: {
        Row: {
          agency_id: string
          code: string
          created_at: string
          dimension: Database["public"]["Enums"]["audit_dimension"]
          id: string
          label: string
          scored: boolean
          source: string | null
          threshold: string | null
        }
        Insert: {
          agency_id: string
          code: string
          created_at?: string
          dimension: Database["public"]["Enums"]["audit_dimension"]
          id?: string
          label: string
          scored?: boolean
          source?: string | null
          threshold?: string | null
        }
        Update: {
          agency_id?: string
          code?: string
          created_at?: string
          dimension?: Database["public"]["Enums"]["audit_dimension"]
          id?: string
          label?: string
          scored?: boolean
          source?: string | null
          threshold?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "criterion_definition_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      deal: {
        Row: {
          agency_id: string
          client_id: string
          created_at: string
          id: string
          lost_at: string | null
          lost_note: string | null
          lost_reason: string | null
          mrr_cents: number
          next_action: string | null
          next_action_on: string | null
          owner_id: string | null
          probability: number | null
          stage: Database["public"]["Enums"]["deal_stage"]
          stage_since: string
          updated_at: string
          won_at: string | null
        }
        Insert: {
          agency_id: string
          client_id: string
          created_at?: string
          id?: string
          lost_at?: string | null
          lost_note?: string | null
          lost_reason?: string | null
          mrr_cents?: number
          next_action?: string | null
          next_action_on?: string | null
          owner_id?: string | null
          probability?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          stage_since?: string
          updated_at?: string
          won_at?: string | null
        }
        Update: {
          agency_id?: string
          client_id?: string
          created_at?: string
          id?: string
          lost_at?: string | null
          lost_note?: string | null
          lost_reason?: string | null
          mrr_cents?: number
          next_action?: string | null
          next_action_on?: string | null
          owner_id?: string | null
          probability?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          stage_since?: string
          updated_at?: string
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
        ]
      }
      deal_document: {
        Row: {
          created_at: string
          deal_id: string
          generated: boolean
          id: string
          kind: string
          name: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          generated?: boolean
          id?: string
          kind: string
          name: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          generated?: boolean
          id?: string
          kind?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_document_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_seo_snapshot: {
        Row: {
          authority: number | null
          captured_at: string
          deal_id: string
          domain: string
          keywords: number | null
          monthly_visits: number | null
          raw: Json | null
          top10: number | null
        }
        Insert: {
          authority?: number | null
          captured_at?: string
          deal_id: string
          domain: string
          keywords?: number | null
          monthly_visits?: number | null
          raw?: Json | null
          top10?: number | null
        }
        Update: {
          authority?: number | null
          captured_at?: string
          deal_id?: string
          domain?: string
          keywords?: number | null
          monthly_visits?: number | null
          raw?: Json | null
          top10?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_seo_snapshot_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: true
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable: {
        Row: {
          accepted_on: string | null
          code: string
          contract_id: string
          created_at: string
          description: string | null
          id: string
          included_rounds: number | null
          position: number
          state: Database["public"]["Enums"]["deliverable_state"]
          submitted_on: string | null
          title: string
          updated_at: string
        }
        Insert: {
          accepted_on?: string | null
          code: string
          contract_id: string
          created_at?: string
          description?: string | null
          id?: string
          included_rounds?: number | null
          position?: number
          state?: Database["public"]["Enums"]["deliverable_state"]
          submitted_on?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          accepted_on?: string | null
          code?: string
          contract_id?: string
          created_at?: string
          description?: string | null
          id?: string
          included_rounds?: number | null
          position?: number
          state?: Database["public"]["Enums"]["deliverable_state"]
          submitted_on?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract_financials"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      deliverable_inclusion: {
        Row: {
          deliverable_id: string
          included_in_id: string
        }
        Insert: {
          deliverable_id: string
          included_in_id: string
        }
        Update: {
          deliverable_id?: string
          included_in_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_inclusion_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_inclusion_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverable_revision_status"
            referencedColumns: ["deliverable_id"]
          },
          {
            foreignKeyName: "deliverable_inclusion_included_in_id_fkey"
            columns: ["included_in_id"]
            isOneToOne: false
            referencedRelation: "deliverable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_inclusion_included_in_id_fkey"
            columns: ["included_in_id"]
            isOneToOne: false
            referencedRelation: "deliverable_revision_status"
            referencedColumns: ["deliverable_id"]
          },
        ]
      }
      directory: {
        Row: {
          agency_id: string
          authority: Database["public"]["Enums"]["directory_authority"]
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          agency_id: string
          authority?: Database["public"]["Enums"]["directory_authority"]
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          agency_id?: string
          authority?: Database["public"]["Enums"]["directory_authority"]
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "directory_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      document_template: {
        Row: {
          active: boolean
          agency_id: string
          created_at: string
          footer: string | null
          id: string
          include_year: boolean
          intro: string | null
          is_default: boolean
          kind: Database["public"]["Enums"]["document_kind"]
          legal_mentions: string | null
          name: string
          number_padding: number
          payment_instructions: string | null
          payment_terms_days: number
          prefix: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          agency_id: string
          created_at?: string
          footer?: string | null
          id?: string
          include_year?: boolean
          intro?: string | null
          is_default?: boolean
          kind: Database["public"]["Enums"]["document_kind"]
          legal_mentions?: string | null
          name: string
          number_padding?: number
          payment_instructions?: string | null
          payment_terms_days?: number
          prefix?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          agency_id?: string
          created_at?: string
          footer?: string | null
          id?: string
          include_year?: boolean
          intro?: string | null
          is_default?: boolean
          kind?: Database["public"]["Enums"]["document_kind"]
          legal_mentions?: string | null
          name?: string
          number_padding?: number
          payment_instructions?: string | null
          payment_terms_days?: number
          prefix?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_template_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_geo_share: {
        Row: {
          reading_id: string
          region: string
          share_pct: number
        }
        Insert: {
          reading_id: string
          region: string
          share_pct: number
        }
        Update: {
          reading_id?: string
          region?: string
          share_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "domain_geo_share_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "domain_reading"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domain_geo_share_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "domain_reading_delta"
            referencedColumns: ["reading_id"]
          },
        ]
      }
      domain_reading: {
        Row: {
          agency_id: string
          authority: number | null
          avg_position: number | null
          bucket_beyond: number | null
          bucket_top10: number | null
          bucket_top3: number | null
          bucket_top30: number | null
          client_id: string
          created_at: string
          id: string
          keyword_count: number | null
          measured_on: string
          organic_traffic: number | null
          referring_domains: number | null
          tool_run_id: string | null
        }
        Insert: {
          agency_id: string
          authority?: number | null
          avg_position?: number | null
          bucket_beyond?: number | null
          bucket_top10?: number | null
          bucket_top3?: number | null
          bucket_top30?: number | null
          client_id: string
          created_at?: string
          id?: string
          keyword_count?: number | null
          measured_on: string
          organic_traffic?: number | null
          referring_domains?: number | null
          tool_run_id?: string | null
        }
        Update: {
          agency_id?: string
          authority?: number | null
          avg_position?: number | null
          bucket_beyond?: number | null
          bucket_top10?: number | null
          bucket_top3?: number | null
          bucket_top30?: number | null
          client_id?: string
          created_at?: string
          id?: string
          keyword_count?: number | null
          measured_on?: string
          organic_traffic?: number | null
          referring_domains?: number | null
          tool_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_reading_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domain_reading_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domain_reading_tool_run_id_fkey"
            columns: ["tool_run_id"]
            isOneToOne: false
            referencedRelation: "tool_run"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_top_page: {
        Row: {
          delta_pct: number | null
          reading_id: string
          url: string
          visits: number | null
        }
        Insert: {
          delta_pct?: number | null
          reading_id: string
          url: string
          visits?: number | null
        }
        Update: {
          delta_pct?: number | null
          reading_id?: string
          url?: string
          visits?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_top_page_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "domain_reading"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domain_top_page_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "domain_reading_delta"
            referencedColumns: ["reading_id"]
          },
        ]
      }
      domain_top_query: {
        Row: {
          page_url: string | null
          position: number | null
          query: string
          reading_id: string
          search_volume: number | null
        }
        Insert: {
          page_url?: string | null
          position?: number | null
          query: string
          reading_id: string
          search_volume?: number | null
        }
        Update: {
          page_url?: string | null
          position?: number | null
          query?: string
          reading_id?: string
          search_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_top_query_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "domain_reading"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domain_top_query_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "domain_reading_delta"
            referencedColumns: ["reading_id"]
          },
        ]
      }
      establishment: {
        Row: {
          address: string | null
          agency_id: string
          city: string | null
          client_id: string
          created_at: string
          gbp_state: Database["public"]["Enums"]["gbp_state"]
          id: string
          name: string
          nap_name: string | null
          phone: string | null
          slug: string
          updated_at: string
          website: string | null
          zone: Json | null
        }
        Insert: {
          address?: string | null
          agency_id: string
          city?: string | null
          client_id: string
          created_at?: string
          gbp_state?: Database["public"]["Enums"]["gbp_state"]
          id?: string
          name: string
          nap_name?: string | null
          phone?: string | null
          slug: string
          updated_at?: string
          website?: string | null
          zone?: Json | null
        }
        Update: {
          address?: string | null
          agency_id?: string
          city?: string | null
          client_id?: string
          created_at?: string
          gbp_state?: Database["public"]["Enums"]["gbp_state"]
          id?: string
          name?: string
          nap_name?: string | null
          phone?: string | null
          slug?: string
          updated_at?: string
          website?: string | null
          zone?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "establishment_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      establishment_reading: {
        Row: {
          agency_id: string
          calls: number | null
          created_at: string
          direction_requests: number | null
          establishment_id: string
          gbp_filled: number | null
          gbp_missing_fields: Database["public"]["Enums"]["gbp_field"][] | null
          id: string
          local_score: number | null
          measured_on: string
          nap_inconsistencies: number | null
          nap_sources: number | null
          profile_views: number | null
          rating: number | null
          review_count: number | null
        }
        Insert: {
          agency_id: string
          calls?: number | null
          created_at?: string
          direction_requests?: number | null
          establishment_id: string
          gbp_filled?: number | null
          gbp_missing_fields?: Database["public"]["Enums"]["gbp_field"][] | null
          id?: string
          local_score?: number | null
          measured_on?: string
          nap_inconsistencies?: number | null
          nap_sources?: number | null
          profile_views?: number | null
          rating?: number | null
          review_count?: number | null
        }
        Update: {
          agency_id?: string
          calls?: number | null
          created_at?: string
          direction_requests?: number | null
          establishment_id?: string
          gbp_filled?: number | null
          gbp_missing_fields?: Database["public"]["Enums"]["gbp_field"][] | null
          id?: string
          local_score?: number | null
          measured_on?: string
          nap_inconsistencies?: number | null
          nap_sources?: number | null
          profile_views?: number | null
          rating?: number | null
          review_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "establishment_reading_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishment_reading_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishment_reading_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment_alert"
            referencedColumns: ["establishment_id"]
          },
        ]
      }
      gap_competitor: {
        Row: {
          domain: string
          id: string
          name: string | null
          no_data: boolean
          position: number
          tool_run_id: string
        }
        Insert: {
          domain: string
          id?: string
          name?: string | null
          no_data?: boolean
          position?: number
          tool_run_id: string
        }
        Update: {
          domain?: string
          id?: string
          name?: string | null
          no_data?: boolean
          position?: number
          tool_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gap_competitor_tool_run_id_fkey"
            columns: ["tool_run_id"]
            isOneToOne: false
            referencedRelation: "tool_run"
            referencedColumns: ["id"]
          },
        ]
      }
      gap_position: {
        Row: {
          competitor_id: string
          position: number | null
          row_id: string
        }
        Insert: {
          competitor_id: string
          position?: number | null
          row_id: string
        }
        Update: {
          competitor_id?: string
          position?: number | null
          row_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gap_position_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "gap_competitor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gap_position_row_id_fkey"
            columns: ["row_id"]
            isOneToOne: false
            referencedRelation: "gap_row"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gap_position_row_id_fkey"
            columns: ["row_id"]
            isOneToOne: false
            referencedRelation: "gap_row_category"
            referencedColumns: ["row_id"]
          },
        ]
      }
      gap_row: {
        Row: {
          client_position: number | null
          id: string
          query: string
          search_volume: number | null
          tool_run_id: string
        }
        Insert: {
          client_position?: number | null
          id?: string
          query: string
          search_volume?: number | null
          tool_run_id: string
        }
        Update: {
          client_position?: number | null
          id?: string
          query?: string
          search_volume?: number | null
          tool_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gap_row_tool_run_id_fkey"
            columns: ["tool_run_id"]
            isOneToOne: false
            referencedRelation: "tool_run"
            referencedColumns: ["id"]
          },
        ]
      }
      gbp_post: {
        Row: {
          agency_id: string
          body: string
          created_at: string
          establishment_id: string
          expires_on: string | null
          id: string
          kind: Database["public"]["Enums"]["gbp_post_type"]
          published_on: string
          views: number
        }
        Insert: {
          agency_id: string
          body: string
          created_at?: string
          establishment_id: string
          expires_on?: string | null
          id?: string
          kind: Database["public"]["Enums"]["gbp_post_type"]
          published_on: string
          views?: number
        }
        Update: {
          agency_id?: string
          body?: string
          created_at?: string
          establishment_id?: string
          expires_on?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["gbp_post_type"]
          published_on?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "gbp_post_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gbp_post_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gbp_post_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment_alert"
            referencedColumns: ["establishment_id"]
          },
        ]
      }
      gbp_question: {
        Row: {
          agency_id: string
          answer: string | null
          answered_on: string | null
          asked_on: string
          body: string
          created_at: string
          establishment_id: string
          id: string
        }
        Insert: {
          agency_id: string
          answer?: string | null
          answered_on?: string | null
          asked_on: string
          body: string
          created_at?: string
          establishment_id: string
          id?: string
        }
        Update: {
          agency_id?: string
          answer?: string | null
          answered_on?: string | null
          asked_on?: string
          body?: string
          created_at?: string
          establishment_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gbp_question_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gbp_question_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gbp_question_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment_alert"
            referencedColumns: ["establishment_id"]
          },
        ]
      }
      invoice: {
        Row: {
          agency_id: string
          client_id: string
          created_at: string
          due_on: string | null
          id: string
          issued_on: string
          paid_on: string | null
          period_month: string
          ref: string
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          template_id: string | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          client_id: string
          created_at?: string
          due_on?: string | null
          id?: string
          issued_on: string
          paid_on?: string | null
          period_month: string
          ref: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          client_id?: string
          created_at?: string
          due_on?: string | null
          id?: string
          issued_on?: string
          paid_on?: string | null
          period_month?: string
          ref?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_template"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line: {
        Row: {
          catalog_item_id: string | null
          description: string
          id: string
          invoice_id: string
          offer_id: string | null
          period_month: string | null
          position: number
          quantity: number
          unit_price_cents: number
        }
        Insert: {
          catalog_item_id?: string | null
          description: string
          id?: string
          invoice_id: string
          offer_id?: string | null
          period_month?: string | null
          position: number
          quantity?: number
          unit_price_cents: number
        }
        Update: {
          catalog_item_id?: string | null
          description?: string
          id?: string
          invoice_id?: string
          offer_id?: string | null
          period_month?: string | null
          position?: number
          quantity?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_total"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_line_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer_value"
            referencedColumns: ["offer_id"]
          },
        ]
      }
      keyword_group: {
        Row: {
          agency_id: string
          client_id: string
          created_at: string
          id: string
          name: string
          position: number
        }
        Insert: {
          agency_id: string
          client_id: string
          created_at?: string
          id?: string
          name: string
          position?: number
        }
        Update: {
          agency_id?: string
          client_id?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "keyword_group_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyword_group_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_plan_tier: {
        Row: {
          agency_id: string
          created_at: string
          id: string
          max_keywords: number
          price_cents: number | null
        }
        Insert: {
          agency_id: string
          created_at?: string
          id?: string
          max_keywords: number
          price_cents?: number | null
        }
        Update: {
          agency_id?: string
          created_at?: string
          id?: string
          max_keywords?: number
          price_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_plan_tier_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_reading: {
        Row: {
          agency_id: string
          created_at: string
          id: string
          keyword_id: string
          measured_on: string
          position: number | null
          search_volume: number | null
        }
        Insert: {
          agency_id: string
          created_at?: string
          id?: string
          keyword_id: string
          measured_on?: string
          position?: number | null
          search_volume?: number | null
        }
        Update: {
          agency_id?: string
          created_at?: string
          id?: string
          keyword_id?: string
          measured_on?: string
          position?: number | null
          search_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_reading_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyword_reading_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "tracked_keyword"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyword_reading_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "tracked_keyword_reading"
            referencedColumns: ["keyword_id"]
          },
        ]
      }
      keyword_reading_url: {
        Row: {
          position: number | null
          reading_id: string
          url: string
        }
        Insert: {
          position?: number | null
          reading_id: string
          url: string
        }
        Update: {
          position?: number | null
          reading_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_reading_url_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "keyword_reading"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyword_reading_url_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "tracked_keyword_reading"
            referencedColumns: ["reading_id"]
          },
        ]
      }
      keyword_suggestion: {
        Row: {
          difficulty: number | null
          id: string
          intent: Database["public"]["Enums"]["search_intent"] | null
          is_question: boolean
          query: string
          search_volume: number | null
          theme: string | null
          tool_run_id: string
          trend: Database["public"]["Enums"]["seasonality"] | null
          word_count: number | null
        }
        Insert: {
          difficulty?: number | null
          id?: string
          intent?: Database["public"]["Enums"]["search_intent"] | null
          is_question?: boolean
          query: string
          search_volume?: number | null
          theme?: string | null
          tool_run_id: string
          trend?: Database["public"]["Enums"]["seasonality"] | null
          word_count?: number | null
        }
        Update: {
          difficulty?: number | null
          id?: string
          intent?: Database["public"]["Enums"]["search_intent"] | null
          is_question?: boolean
          query?: string
          search_volume?: number | null
          theme?: string | null
          tool_run_id?: string
          trend?: Database["public"]["Enums"]["seasonality"] | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_suggestion_tool_run_id_fkey"
            columns: ["tool_run_id"]
            isOneToOne: false
            referencedRelation: "tool_run"
            referencedColumns: ["id"]
          },
        ]
      }
      local_keyword: {
        Row: {
          agency_id: string
          created_at: string
          establishment_id: string
          id: string
          is_primary: boolean
          query: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          establishment_id: string
          id?: string
          is_primary?: boolean
          query: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          establishment_id?: string
          id?: string
          is_primary?: boolean
          query?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_keyword_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_keyword_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_keyword_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment_alert"
            referencedColumns: ["establishment_id"]
          },
        ]
      }
      local_position: {
        Row: {
          agency_id: string
          created_at: string
          id: string
          keyword_id: string
          measured_on: string
          point_col: number | null
          point_row: number | null
          position: number | null
          sector_name: string | null
        }
        Insert: {
          agency_id: string
          created_at?: string
          id?: string
          keyword_id: string
          measured_on?: string
          point_col?: number | null
          point_row?: number | null
          position?: number | null
          sector_name?: string | null
        }
        Update: {
          agency_id?: string
          created_at?: string
          id?: string
          keyword_id?: string
          measured_on?: string
          point_col?: number | null
          point_row?: number | null
          position?: number | null
          sector_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_position_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_position_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "local_keyword"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_position_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "local_keyword_reading"
            referencedColumns: ["keyword_id"]
          },
        ]
      }
      local_review: {
        Row: {
          agency_id: string
          author: string | null
          body: string | null
          created_at: string
          establishment_id: string
          external_id: string
          flag_reason: string | null
          id: string
          published_on: string
          rating: number
          response: string | null
          response_draft: string | null
          state: Database["public"]["Enums"]["local_review_state"]
          updated_at: string
        }
        Insert: {
          agency_id: string
          author?: string | null
          body?: string | null
          created_at?: string
          establishment_id: string
          external_id: string
          flag_reason?: string | null
          id?: string
          published_on: string
          rating: number
          response?: string | null
          response_draft?: string | null
          state?: Database["public"]["Enums"]["local_review_state"]
          updated_at?: string
        }
        Update: {
          agency_id?: string
          author?: string | null
          body?: string | null
          created_at?: string
          establishment_id?: string
          external_id?: string
          flag_reason?: string | null
          id?: string
          published_on?: string
          rating?: number
          response?: string | null
          response_draft?: string | null
          state?: Database["public"]["Enums"]["local_review_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_review_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_review_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_review_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment_alert"
            referencedColumns: ["establishment_id"]
          },
        ]
      }
      local_review_theme: {
        Row: {
          review_id: string
          theme: string
        }
        Insert: {
          review_id: string
          theme: string
        }
        Update: {
          review_id?: string
          theme?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_review_theme_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "local_review"
            referencedColumns: ["id"]
          },
        ]
      }
      member_permission: {
        Row: {
          created_at: string
          granted: boolean
          member_id: string
          permission: Database["public"]["Enums"]["permission"]
          reason: string | null
        }
        Insert: {
          created_at?: string
          granted: boolean
          member_id: string
          permission: Database["public"]["Enums"]["permission"]
          reason?: string | null
        }
        Update: {
          created_at?: string
          granted?: boolean
          member_id?: string
          permission?: Database["public"]["Enums"]["permission"]
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_permission_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_permission_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
        ]
      }
      milestone: {
        Row: {
          code: string
          contract_id: string
          created_at: string
          depends_on_id: string | null
          description: string
          fixed_on: string | null
          id: string
          offset_days: number | null
          owner: Database["public"]["Enums"]["milestone_owner"]
          position: number
          reached_on: string | null
          updated_at: string
        }
        Insert: {
          code: string
          contract_id: string
          created_at?: string
          depends_on_id?: string | null
          description: string
          fixed_on?: string | null
          id?: string
          offset_days?: number | null
          owner: Database["public"]["Enums"]["milestone_owner"]
          position?: number
          reached_on?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          contract_id?: string
          created_at?: string
          depends_on_id?: string | null
          description?: string
          fixed_on?: string | null
          id?: string
          offset_days?: number | null
          owner?: Database["public"]["Enums"]["milestone_owner"]
          position?: number
          reached_on?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract_financials"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "milestone_depends_on_id_fkey"
            columns: ["depends_on_id"]
            isOneToOne: false
            referencedRelation: "contract_schedule"
            referencedColumns: ["milestone_id"]
          },
          {
            foreignKeyName: "milestone_depends_on_id_fkey"
            columns: ["depends_on_id"]
            isOneToOne: false
            referencedRelation: "milestone"
            referencedColumns: ["id"]
          },
        ]
      }
      notification: {
        Row: {
          agency_id: string
          automation_run_id: string | null
          body: string | null
          client_id: string | null
          created_at: string
          cta_label: string | null
          href: string | null
          id: string
          kind: Database["public"]["Enums"]["notification_kind"]
          read_at: string | null
          recipient_id: string | null
          stale_reason: string | null
          title: string
        }
        Insert: {
          agency_id: string
          automation_run_id?: string | null
          body?: string | null
          client_id?: string | null
          created_at?: string
          cta_label?: string | null
          href?: string | null
          id?: string
          kind: Database["public"]["Enums"]["notification_kind"]
          read_at?: string | null
          recipient_id?: string | null
          stale_reason?: string | null
          title: string
        }
        Update: {
          agency_id?: string
          automation_run_id?: string | null
          body?: string | null
          client_id?: string | null
          created_at?: string
          cta_label?: string | null
          href?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["notification_kind"]
          read_at?: string | null
          recipient_id?: string | null
          stale_reason?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_automation_run_id_fkey"
            columns: ["automation_run_id"]
            isOneToOne: false
            referencedRelation: "automation_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_kind_fkey"
            columns: ["kind"]
            isOneToOne: false
            referencedRelation: "notification_kind_def"
            referencedColumns: ["kind"]
          },
          {
            foreignKeyName: "notification_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
        ]
      }
      notification_kind_def: {
        Row: {
          critical: boolean
          kind: Database["public"]["Enums"]["notification_kind"]
          label: string
          source: string
        }
        Insert: {
          critical?: boolean
          kind: Database["public"]["Enums"]["notification_kind"]
          label: string
          source: string
        }
        Update: {
          critical?: boolean
          kind?: Database["public"]["Enums"]["notification_kind"]
          label?: string
          source?: string
        }
        Relationships: []
      }
      number_counter: {
        Row: {
          agency_id: string
          next_value: number
          scope: string
          year: number
        }
        Insert: {
          agency_id: string
          next_value?: number
          scope: string
          year: number
        }
        Update: {
          agency_id?: string
          next_value?: number
          scope?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "number_counter_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      offer: {
        Row: {
          active: boolean
          agency_id: string
          billing: Database["public"]["Enums"]["billing_period"]
          code: string
          created_at: string
          delivery_weeks_max: number | null
          delivery_weeks_min: number | null
          description: string | null
          free_consult_minutes: number | null
          id: string
          intro_periods: number | null
          intro_price_cents: number | null
          is_popular: boolean
          name: string
          position: number
          price_cents: number | null
          price_is_from: boolean
          recommended_offer_id: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          agency_id: string
          billing?: Database["public"]["Enums"]["billing_period"]
          code: string
          created_at?: string
          delivery_weeks_max?: number | null
          delivery_weeks_min?: number | null
          description?: string | null
          free_consult_minutes?: number | null
          id?: string
          intro_periods?: number | null
          intro_price_cents?: number | null
          is_popular?: boolean
          name: string
          position?: number
          price_cents?: number | null
          price_is_from?: boolean
          recommended_offer_id?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          agency_id?: string
          billing?: Database["public"]["Enums"]["billing_period"]
          code?: string
          created_at?: string
          delivery_weeks_max?: number | null
          delivery_weeks_min?: number | null
          description?: string | null
          free_consult_minutes?: number | null
          id?: string
          intro_periods?: number | null
          intro_price_cents?: number | null
          is_popular?: boolean
          name?: string
          position?: number
          price_cents?: number | null
          price_is_from?: boolean
          recommended_offer_id?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_recommended_offer_id_fkey"
            columns: ["recommended_offer_id"]
            isOneToOne: false
            referencedRelation: "offer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_recommended_offer_id_fkey"
            columns: ["recommended_offer_id"]
            isOneToOne: false
            referencedRelation: "offer_value"
            referencedColumns: ["offer_id"]
          },
        ]
      }
      offer_benefit: {
        Row: {
          label: string
          offer_id: string
          position: number
        }
        Insert: {
          label: string
          offer_id: string
          position: number
        }
        Update: {
          label?: string
          offer_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "offer_benefit_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_benefit_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer_value"
            referencedColumns: ["offer_id"]
          },
        ]
      }
      offer_line: {
        Row: {
          catalog_item_id: string | null
          id: string
          included_offer_id: string | null
          label: string | null
          offer_id: string
          option_group: string | null
          option_key: string | null
          position: number
          quantity: number
        }
        Insert: {
          catalog_item_id?: string | null
          id?: string
          included_offer_id?: string | null
          label?: string | null
          offer_id: string
          option_group?: string | null
          option_key?: string | null
          position?: number
          quantity?: number
        }
        Update: {
          catalog_item_id?: string | null
          id?: string
          included_offer_id?: string | null
          label?: string | null
          offer_id?: string
          option_group?: string | null
          option_key?: string | null
          position?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "offer_line_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_line_included_offer_id_fkey"
            columns: ["included_offer_id"]
            isOneToOne: false
            referencedRelation: "offer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_line_included_offer_id_fkey"
            columns: ["included_offer_id"]
            isOneToOne: false
            referencedRelation: "offer_value"
            referencedColumns: ["offer_id"]
          },
          {
            foreignKeyName: "offer_line_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_line_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer_value"
            referencedColumns: ["offer_id"]
          },
        ]
      }
      offer_segment: {
        Row: {
          label: string
          offer_id: string
          position: number
        }
        Insert: {
          label: string
          offer_id: string
          position?: number
        }
        Update: {
          label?: string
          offer_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "offer_segment_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_segment_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer_value"
            referencedColumns: ["offer_id"]
          },
        ]
      }
      offer_task_template: {
        Row: {
          cadence: Database["public"]["Enums"]["task_cadence"]
          created_at: string
          default_role: Database["public"]["Enums"]["agency_role"] | null
          description: string | null
          due_day: number | null
          estimate_hours: number | null
          id: string
          kind: string
          offer_id: string
          option_group: string | null
          option_key: string | null
          position: number
          title: string
        }
        Insert: {
          cadence: Database["public"]["Enums"]["task_cadence"]
          created_at?: string
          default_role?: Database["public"]["Enums"]["agency_role"] | null
          description?: string | null
          due_day?: number | null
          estimate_hours?: number | null
          id?: string
          kind?: string
          offer_id: string
          option_group?: string | null
          option_key?: string | null
          position?: number
          title: string
        }
        Update: {
          cadence?: Database["public"]["Enums"]["task_cadence"]
          created_at?: string
          default_role?: Database["public"]["Enums"]["agency_role"] | null
          description?: string | null
          due_day?: number | null
          estimate_hours?: number | null
          id?: string
          kind?: string
          offer_id?: string
          option_group?: string | null
          option_key?: string | null
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_task_template_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_task_template_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer_value"
            referencedColumns: ["offer_id"]
          },
        ]
      }
      payment_milestone: {
        Row: {
          amount_cents: number | null
          contract_id: string
          due_on: string | null
          id: string
          invoice_id: string | null
          label: string
          milestone_id: string | null
          percentage: number | null
          position: number
          terms_days: number | null
          trigger: Database["public"]["Enums"]["payment_trigger"]
        }
        Insert: {
          amount_cents?: number | null
          contract_id: string
          due_on?: string | null
          id?: string
          invoice_id?: string | null
          label: string
          milestone_id?: string | null
          percentage?: number | null
          position?: number
          terms_days?: number | null
          trigger: Database["public"]["Enums"]["payment_trigger"]
        }
        Update: {
          amount_cents?: number | null
          contract_id?: string
          due_on?: string | null
          id?: string
          invoice_id?: string | null
          label?: string
          milestone_id?: string | null
          percentage?: number | null
          position?: number
          terms_days?: number | null
          trigger?: Database["public"]["Enums"]["payment_trigger"]
        }
        Relationships: [
          {
            foreignKeyName: "payment_milestone_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_milestone_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract_financials"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_milestone_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_milestone_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_total"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "payment_milestone_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "contract_schedule"
            referencedColumns: ["milestone_id"]
          },
          {
            foreignKeyName: "payment_milestone_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestone"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_identity: {
        Row: {
          contact_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_identity_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: true
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
        ]
      }
      priority: {
        Row: {
          agency_id: string
          client_id: string
          client_label: string | null
          client_label_review:
            | Database["public"]["Enums"]["review_state"]
            | null
          client_title: string | null
          created_at: string
          detected_at: string
          dimension: Database["public"]["Enums"]["audit_dimension"]
          dismissed_reason: string | null
          effort_hours: number | null
          first_seen_at: string | null
          id: string
          internal_label: string
          recommendation: string | null
          ref: string
          resolved_at: string | null
          severity: Database["public"]["Enums"]["severity"]
          slug: string
          source_audit_id: string | null
          source_criterion_id: string | null
          status: Database["public"]["Enums"]["priority_status"]
          updated_at: string
          visibility: Database["public"]["Enums"]["priority_visibility"]
        }
        Insert: {
          agency_id: string
          client_id: string
          client_label?: string | null
          client_label_review?:
            | Database["public"]["Enums"]["review_state"]
            | null
          client_title?: string | null
          created_at?: string
          detected_at?: string
          dimension: Database["public"]["Enums"]["audit_dimension"]
          dismissed_reason?: string | null
          effort_hours?: number | null
          first_seen_at?: string | null
          id?: string
          internal_label: string
          recommendation?: string | null
          ref: string
          resolved_at?: string | null
          severity: Database["public"]["Enums"]["severity"]
          slug: string
          source_audit_id?: string | null
          source_criterion_id?: string | null
          status?: Database["public"]["Enums"]["priority_status"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["priority_visibility"]
        }
        Update: {
          agency_id?: string
          client_id?: string
          client_label?: string | null
          client_label_review?:
            | Database["public"]["Enums"]["review_state"]
            | null
          client_title?: string | null
          created_at?: string
          detected_at?: string
          dimension?: Database["public"]["Enums"]["audit_dimension"]
          dismissed_reason?: string | null
          effort_hours?: number | null
          first_seen_at?: string | null
          id?: string
          internal_label?: string
          recommendation?: string | null
          ref?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["severity"]
          slug?: string
          source_audit_id?: string | null
          source_criterion_id?: string | null
          status?: Database["public"]["Enums"]["priority_status"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["priority_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "priority_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "priority_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "priority_source_audit_id_fkey"
            columns: ["source_audit_id"]
            isOneToOne: false
            referencedRelation: "audit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "priority_source_criterion_id_fkey"
            columns: ["source_criterion_id"]
            isOneToOne: false
            referencedRelation: "audit_criterion"
            referencedColumns: ["id"]
          },
        ]
      }
      proof: {
        Row: {
          agency_id: string
          client_id: string
          client_label: string | null
          client_label_review:
            | Database["public"]["Enums"]["review_state"]
            | null
          created_at: string
          id: string
          internal_title: string
          measure_after: string | null
          measure_before: string | null
          measured_on: string | null
          priority_id: string | null
          ref: string
          slug: string
          task_id: string | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          client_id: string
          client_label?: string | null
          client_label_review?:
            | Database["public"]["Enums"]["review_state"]
            | null
          created_at?: string
          id?: string
          internal_title: string
          measure_after?: string | null
          measure_before?: string | null
          measured_on?: string | null
          priority_id?: string | null
          ref: string
          slug: string
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          client_id?: string
          client_label?: string | null
          client_label_review?:
            | Database["public"]["Enums"]["review_state"]
            | null
          created_at?: string
          id?: string
          internal_title?: string
          measure_after?: string | null
          measure_before?: string | null
          measured_on?: string | null
          priority_id?: string | null
          ref?: string
          slug?: string
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_priority_id_fkey"
            columns: ["priority_id"]
            isOneToOne: false
            referencedRelation: "priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_audit: {
        Row: {
          agency_id: string
          client_id: string
          ctr_multiplier: number | null
          id: string
          payload: Json
          potential_gain: number | null
          prepared_on: string
          published_at: string
          published_by: string | null
          source_tool: Database["public"]["Enums"]["tool_id"]
          token: string
          tool_run_id: string | null
          validity_days: number
        }
        Insert: {
          agency_id: string
          client_id: string
          ctr_multiplier?: number | null
          id?: string
          payload: Json
          potential_gain?: number | null
          prepared_on?: string
          published_at?: string
          published_by?: string | null
          source_tool: Database["public"]["Enums"]["tool_id"]
          token: string
          tool_run_id?: string | null
          validity_days?: number
        }
        Update: {
          agency_id?: string
          client_id?: string
          ctr_multiplier?: number | null
          id?: string
          payload?: Json
          potential_gain?: number | null
          prepared_on?: string
          published_at?: string
          published_by?: string | null
          source_tool?: Database["public"]["Enums"]["tool_id"]
          token?: string
          tool_run_id?: string | null
          validity_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "prospect_audit_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_audit_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_audit_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "prospect_audit_tool_run_id_fkey"
            columns: ["tool_run_id"]
            isOneToOne: false
            referencedRelation: "tool_run"
            referencedColumns: ["id"]
          },
        ]
      }
      quote: {
        Row: {
          accepted_on: string | null
          agency_id: string
          client_id: string
          conditions: string | null
          contact_id: string | null
          created_at: string
          expires_on: string | null
          id: string
          issued_on: string | null
          ref: string
          refusal_note: string | null
          refused_on: string | null
          status: Database["public"]["Enums"]["quote_status"]
          subject: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          accepted_on?: string | null
          agency_id: string
          client_id: string
          conditions?: string | null
          contact_id?: string | null
          created_at?: string
          expires_on?: string | null
          id?: string
          issued_on?: string | null
          ref: string
          refusal_note?: string | null
          refused_on?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subject: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          accepted_on?: string | null
          agency_id?: string
          client_id?: string
          conditions?: string | null
          contact_id?: string | null
          created_at?: string
          expires_on?: string | null
          id?: string
          issued_on?: string | null
          ref?: string
          refusal_note?: string | null
          refused_on?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subject?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_template"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_line: {
        Row: {
          catalog_item_id: string | null
          description: string
          id: string
          offer_id: string | null
          position: number
          quantity: number
          quote_id: string
          unit_price_cents: number
        }
        Insert: {
          catalog_item_id?: string | null
          description: string
          id?: string
          offer_id?: string | null
          position: number
          quantity?: number
          quote_id: string
          unit_price_cents: number
        }
        Update: {
          catalog_item_id?: string | null
          description?: string
          id?: string
          offer_id?: string | null
          position?: number
          quantity?: number
          quote_id?: string
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_line_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_line_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_line_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer_value"
            referencedColumns: ["offer_id"]
          },
          {
            foreignKeyName: "quote_line_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quote"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_line_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quote_total"
            referencedColumns: ["quote_id"]
          },
        ]
      }
      quote_version: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          quote_id: string
          version: number
        }
        Insert: {
          content: Json
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          quote_id: string
          version: number
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          quote_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_version_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_version_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "quote_version_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quote"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_version_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quote_total"
            referencedColumns: ["quote_id"]
          },
        ]
      }
      report: {
        Row: {
          agency_id: string
          client_id: string
          created_at: string
          due_on: string | null
          id: string
          objective: string | null
          objective_pct: number | null
          period_month: string
          slug: string
          state: Database["public"]["Enums"]["report_state"]
          summary: string | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          client_id: string
          created_at?: string
          due_on?: string | null
          id?: string
          objective?: string | null
          objective_pct?: number | null
          period_month: string
          slug: string
          state?: Database["public"]["Enums"]["report_state"]
          summary?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          client_id?: string
          created_at?: string
          due_on?: string | null
          id?: string
          objective?: string | null
          objective_pct?: number | null
          period_month?: string
          slug?: string
          state?: Database["public"]["Enums"]["report_state"]
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      report_kpi: {
        Row: {
          id: string
          label: string
          position: number
          previous: string | null
          report_id: string
          sentence: string
          value: string
        }
        Insert: {
          id?: string
          label: string
          position: number
          previous?: string | null
          report_id: string
          sentence: string
          value: string
        }
        Update: {
          id?: string
          label?: string
          position?: number
          previous?: string | null
          report_id?: string
          sentence?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_kpi_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report"
            referencedColumns: ["id"]
          },
        ]
      }
      report_next_step: {
        Row: {
          detail: string
          id: string
          position: number
          report_id: string
          title: string
        }
        Insert: {
          detail: string
          id?: string
          position: number
          report_id: string
          title: string
        }
        Update: {
          detail?: string
          id?: string
          position?: number
          report_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_next_step_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report"
            referencedColumns: ["id"]
          },
        ]
      }
      report_proof: {
        Row: {
          position: number | null
          proof_id: string
          report_id: string
        }
        Insert: {
          position?: number | null
          proof_id: string
          report_id: string
        }
        Update: {
          position?: number | null
          proof_id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_proof_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "proof"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_proof_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report"
            referencedColumns: ["id"]
          },
        ]
      }
      report_version: {
        Row: {
          agency_id: string
          content: Json
          data_as_of: string
          id: string
          note: string | null
          published_at: string
          published_by: string | null
          report_id: string
          token: string
          version: number
        }
        Insert: {
          agency_id: string
          content: Json
          data_as_of: string
          id?: string
          note?: string | null
          published_at?: string
          published_by?: string | null
          report_id: string
          token: string
          version: number
        }
        Update: {
          agency_id?: string
          content?: Json
          data_as_of?: string
          id?: string
          note?: string | null
          published_at?: string
          published_by?: string | null
          report_id?: string
          token?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "report_version_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_version_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_version_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "report_version_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report"
            referencedColumns: ["id"]
          },
        ]
      }
      review_analysis: {
        Row: {
          agency_id: string
          analysed_on: string
          created_at: string
          establishment_id: string
          id: string
          insight: string | null
        }
        Insert: {
          agency_id: string
          analysed_on?: string
          created_at?: string
          establishment_id: string
          id?: string
          insight?: string | null
        }
        Update: {
          agency_id?: string
          analysed_on?: string
          created_at?: string
          establishment_id?: string
          id?: string
          insight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_analysis_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_analysis_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_analysis_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment_alert"
            referencedColumns: ["establishment_id"]
          },
        ]
      }
      review_theme_count: {
        Row: {
          analysis_id: string
          occurrences: number
          polarity: Database["public"]["Enums"]["sentiment_polarity"]
          theme: string
        }
        Insert: {
          analysis_id: string
          occurrences: number
          polarity: Database["public"]["Enums"]["sentiment_polarity"]
          theme: string
        }
        Update: {
          analysis_id?: string
          occurrences?: number
          polarity?: Database["public"]["Enums"]["sentiment_polarity"]
          theme?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_theme_count_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "review_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      revision_round: {
        Row: {
          closed_on: string | null
          created_at: string
          deliverable_id: string
          hours: number | null
          id: string
          notes: string | null
          number: number
          opened_on: string
          quote_id: string | null
        }
        Insert: {
          closed_on?: string | null
          created_at?: string
          deliverable_id: string
          hours?: number | null
          id?: string
          notes?: string | null
          number: number
          opened_on?: string
          quote_id?: string | null
        }
        Update: {
          closed_on?: string | null
          created_at?: string
          deliverable_id?: string
          hours?: number | null
          id?: string
          notes?: string | null
          number?: number
          opened_on?: string
          quote_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revision_round_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_round_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverable_revision_status"
            referencedColumns: ["deliverable_id"]
          },
          {
            foreignKeyName: "revision_round_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quote"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_round_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quote_total"
            referencedColumns: ["quote_id"]
          },
        ]
      }
      role_permission: {
        Row: {
          permission: Database["public"]["Enums"]["permission"]
          role: Database["public"]["Enums"]["agency_role"]
        }
        Insert: {
          permission: Database["public"]["Enums"]["permission"]
          role: Database["public"]["Enums"]["agency_role"]
        }
        Update: {
          permission?: Database["public"]["Enums"]["permission"]
          role?: Database["public"]["Enums"]["agency_role"]
        }
        Relationships: []
      }
      subscription_option: {
        Row: {
          option_group: string
          option_key: string
          subscription_id: string
        }
        Insert: {
          option_group: string
          option_key: string
          subscription_id: string
        }
        Update: {
          option_group?: string
          option_key?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_option_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "client_subscription"
            referencedColumns: ["id"]
          },
        ]
      }
      support_month: {
        Row: {
          hours_used: number
          month: string
          period_id: string
          warranty_hours: number
        }
        Insert: {
          hours_used?: number
          month: string
          period_id: string
          warranty_hours?: number
        }
        Update: {
          hours_used?: number
          month?: string
          period_id?: string
          warranty_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "support_month_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "support_period"
            referencedColumns: ["id"]
          },
        ]
      }
      support_period: {
        Row: {
          contract_id: string
          created_at: string
          hours_max: number
          hours_min: number | null
          id: string
          months: number
          overage_rate_cents: number | null
          starts_on: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          hours_max: number
          hours_min?: number | null
          id?: string
          months: number
          overage_rate_cents?: number | null
          starts_on: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          hours_max?: number
          hours_min?: number | null
          id?: string
          months?: number
          overage_rate_cents?: number | null
          starts_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_period_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_period_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract_financials"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      task: {
        Row: {
          agency_id: string
          assignee_id: string | null
          blocked_reason: string | null
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_on: string | null
          estimate_hours: number | null
          id: string
          kind: string
          offer_template_id: string | null
          period_month: string | null
          priority_id: string | null
          ref: string
          slug: string
          spent_hours: number
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          assignee_id?: string | null
          blocked_reason?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_on?: string | null
          estimate_hours?: number | null
          id?: string
          kind?: string
          offer_template_id?: string | null
          period_month?: string | null
          priority_id?: string | null
          ref: string
          slug: string
          spent_hours?: number
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          assignee_id?: string | null
          blocked_reason?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_on?: string | null
          estimate_hours?: number | null
          id?: string
          kind?: string
          offer_template_id?: string | null
          period_month?: string | null
          priority_id?: string | null
          ref?: string
          slug?: string
          spent_hours?: number
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "task_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_offer_template_id_fkey"
            columns: ["offer_template_id"]
            isOneToOne: false
            referencedRelation: "offer_task_template"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_priority_id_fkey"
            columns: ["priority_id"]
            isOneToOne: false
            referencedRelation: "priority"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comment: {
        Row: {
          author_id: string | null
          body: string
          by_agent: boolean
          created_at: string
          id: string
          task_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          by_agent?: boolean
          created_at?: string
          id?: string
          task_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          by_agent?: boolean
          created_at?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comment_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comment_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "task_comment_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task"
            referencedColumns: ["id"]
          },
        ]
      }
      task_step: {
        Row: {
          assignee_id: string | null
          created_at: string
          done: boolean
          gain: string | null
          id: string
          label: string
          position: number
          task_id: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          done?: boolean
          gain?: string | null
          id?: string
          label: string
          position: number
          task_id: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          done?: boolean
          gain?: string | null
          id?: string
          label?: string
          position?: number
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_step_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_step_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "task_step_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task"
            referencedColumns: ["id"]
          },
        ]
      }
      task_time_log: {
        Row: {
          created_at: string
          hours: number
          id: string
          logged_on: string
          member_id: string | null
          note: string | null
          task_id: string
        }
        Insert: {
          created_at?: string
          hours: number
          id?: string
          logged_on: string
          member_id?: string | null
          note?: string | null
          task_id: string
        }
        Update: {
          created_at?: string
          hours?: number
          id?: string
          logged_on?: string
          member_id?: string | null
          note?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_time_log_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_time_log_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "task_time_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_run: {
        Row: {
          agency_id: string
          client_id: string
          cost_cents: number | null
          created_at: string
          credits: number | null
          expires_on: string | null
          id: string
          params: Json | null
          ran_at: string
          retention: Database["public"]["Enums"]["retention_kind"]
          scope: string | null
          state: Database["public"]["Enums"]["tool_run_state"]
          tool: Database["public"]["Enums"]["tool_id"]
        }
        Insert: {
          agency_id: string
          client_id: string
          cost_cents?: number | null
          created_at?: string
          credits?: number | null
          expires_on?: string | null
          id?: string
          params?: Json | null
          ran_at?: string
          retention?: Database["public"]["Enums"]["retention_kind"]
          scope?: string | null
          state?: Database["public"]["Enums"]["tool_run_state"]
          tool: Database["public"]["Enums"]["tool_id"]
        }
        Update: {
          agency_id?: string
          client_id?: string
          cost_cents?: number | null
          created_at?: string
          credits?: number | null
          expires_on?: string | null
          id?: string
          params?: Json | null
          ran_at?: string
          retention?: Database["public"]["Enums"]["retention_kind"]
          scope?: string | null
          state?: Database["public"]["Enums"]["tool_run_state"]
          tool?: Database["public"]["Enums"]["tool_id"]
        }
        Relationships: [
          {
            foreignKeyName: "tool_run_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_run_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_save: {
        Row: {
          agency_id: string
          client_id: string
          id: string
          saved_at: string
          saved_by: string | null
          summary: string
          tool: Database["public"]["Enums"]["tool_id"]
          tool_run_id: string | null
        }
        Insert: {
          agency_id: string
          client_id: string
          id?: string
          saved_at?: string
          saved_by?: string | null
          summary: string
          tool: Database["public"]["Enums"]["tool_id"]
          tool_run_id?: string | null
        }
        Update: {
          agency_id?: string
          client_id?: string
          id?: string
          saved_at?: string
          saved_by?: string | null
          summary?: string
          tool?: Database["public"]["Enums"]["tool_id"]
          tool_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_save_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_save_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_save_saved_by_fkey"
            columns: ["saved_by"]
            isOneToOne: false
            referencedRelation: "agency_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_save_saved_by_fkey"
            columns: ["saved_by"]
            isOneToOne: false
            referencedRelation: "member_effective_permission"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "tool_save_tool_run_id_fkey"
            columns: ["tool_run_id"]
            isOneToOne: false
            referencedRelation: "tool_run"
            referencedColumns: ["id"]
          },
        ]
      }
      toxic_backlink: {
        Row: {
          agency_id: string
          authority: number | null
          client_id: string
          created_at: string
          disavowed_on: string | null
          domain: string
          id: string
          reason: string
          spam_score: number | null
          status: Database["public"]["Enums"]["toxic_backlink_status"]
          updated_at: string
        }
        Insert: {
          agency_id: string
          authority?: number | null
          client_id: string
          created_at?: string
          disavowed_on?: string | null
          domain: string
          id?: string
          reason: string
          spam_score?: number | null
          status?: Database["public"]["Enums"]["toxic_backlink_status"]
          updated_at?: string
        }
        Update: {
          agency_id?: string
          authority?: number | null
          client_id?: string
          created_at?: string
          disavowed_on?: string | null
          domain?: string
          id?: string
          reason?: string
          spam_score?: number | null
          status?: Database["public"]["Enums"]["toxic_backlink_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toxic_backlink_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toxic_backlink_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      tracked_keyword: {
        Row: {
          agency_id: string
          archived_at: string | null
          client_id: string
          created_at: string
          group_id: string | null
          id: string
          intent: Database["public"]["Enums"]["search_intent"] | null
          priority_id: string | null
          query: string
        }
        Insert: {
          agency_id: string
          archived_at?: string | null
          client_id: string
          created_at?: string
          group_id?: string | null
          id?: string
          intent?: Database["public"]["Enums"]["search_intent"] | null
          priority_id?: string | null
          query: string
        }
        Update: {
          agency_id?: string
          archived_at?: string | null
          client_id?: string
          created_at?: string
          group_id?: string | null
          id?: string
          intent?: Database["public"]["Enums"]["search_intent"] | null
          priority_id?: string | null
          query?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_keyword_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_keyword_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_keyword_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "keyword_group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_keyword_priority_id_fkey"
            columns: ["priority_id"]
            isOneToOne: false
            referencedRelation: "priority"
            referencedColumns: ["id"]
          },
        ]
      }
      traffic_drop: {
        Row: {
          agency_id: string
          cause: string
          client_id: string
          created_at: string
          id: string
          occurred_on: string
        }
        Insert: {
          agency_id: string
          cause: string
          client_id: string
          created_at?: string
          id?: string
          occurred_on: string
        }
        Update: {
          agency_id?: string
          cause?: string
          client_id?: string
          created_at?: string
          id?: string
          occurred_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "traffic_drop_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_drop_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      automation_health: {
        Row: {
          agency_id: string | null
          automation_id: string | null
          last_run_at: string | null
          name: string | null
          runs: number | null
          status: Database["public"]["Enums"]["automation_status"] | null
          success_pct: number | null
          successes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      backlink_reading_delta: {
        Row: {
          agency_id: string | null
          authority: number | null
          authority_previous: number | null
          client_id: string | null
          followed_pct: number | null
          measured_on: string | null
          measured_on_previous: string | null
          reading_id: string | null
          referring_domains: number | null
          referring_domains_previous: number | null
        }
        Relationships: [
          {
            foreignKeyName: "backlink_reading_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlink_reading_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      client_mrr: {
        Row: {
          agency_id: string | null
          client_id: string | null
          mrr_cents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_subscription_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subscription_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      content_item_status: {
        Row: {
          agency_id: string | null
          client_id: string | null
          content_id: string | null
          due_on: string | null
          late: boolean | null
          measured_on: string | null
          position: number | null
          position_previous: number | null
          published_at: string | null
          state: Database["public"]["Enums"]["content_state"] | null
          title: string | null
          visits: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_item_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      content_month_quota: {
        Row: {
          agency_id: string | null
          client_id: string | null
          delivered: number | null
          month: string | null
          planned: number | null
          quota: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_item_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_financials: {
        Row: {
          agency_id: string | null
          client_id: string | null
          contract_id: string | null
          fee_cents: number | null
          invoiced_cents: number | null
          ref: string | null
          scheduled_cents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_pending_input: {
        Row: {
          agency_id: string | null
          client_id: string | null
          contract_id: string | null
          due_on: string | null
          items_pending: number | null
          suspension_possible_from: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_input_item_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_input_item_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract_financials"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_schedule: {
        Row: {
          code: string | null
          contract_id: string | null
          description: string | null
          late: boolean | null
          milestone_id: string | null
          owner: Database["public"]["Enums"]["milestone_owner"] | null
          planned_on: string | null
          position: number | null
          reached_on: string | null
        }
        Insert: {
          code?: string | null
          contract_id?: string | null
          description?: string | null
          late?: never
          milestone_id?: string | null
          owner?: Database["public"]["Enums"]["milestone_owner"] | null
          planned_on?: never
          position?: number | null
          reached_on?: string | null
        }
        Update: {
          code?: string | null
          contract_id?: string | null
          description?: string | null
          late?: never
          milestone_id?: string | null
          owner?: Database["public"]["Enums"]["milestone_owner"] | null
          planned_on?: never
          position?: number | null
          reached_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestone_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract_financials"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      credit_usage_by_client: {
        Row: {
          agency_id: string | null
          client_id: string | null
          cost_cents: number | null
          credits: number | null
          month: string | null
          runs: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_run_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_run_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_usage_month: {
        Row: {
          agency_id: string | null
          cost_cents: number | null
          credits_used: number | null
          month: string | null
          monthly_credit_quota: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_run_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable_revision_status: {
        Row: {
          billable_hours: number | null
          code: string | null
          contract_id: string | null
          deliverable_id: string | null
          included_rounds: number | null
          rounds_billable: number | null
          rounds_used: number | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract_financials"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      domain_reading_delta: {
        Row: {
          agency_id: string | null
          authority: number | null
          avg_position: number | null
          avg_position_previous: number | null
          client_id: string | null
          keyword_count: number | null
          measured_on: string | null
          measured_on_previous: string | null
          organic_traffic: number | null
          organic_traffic_previous: number | null
          reading_id: string | null
          referring_domains: number | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_reading_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domain_reading_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      establishment_alert: {
        Row: {
          agency_id: string | null
          code: string | null
          establishment_id: string | null
          rank: number | null
        }
        Relationships: [
          {
            foreignKeyName: "establishment_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      establishment_citation_summary: {
        Row: {
          directories_present: number | null
          directories_referenced: number | null
          duplicated: number | null
          establishment_id: string | null
          inconsistent: number | null
          missing: number | null
          unreachable: number | null
        }
        Relationships: [
          {
            foreignKeyName: "citation_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citation_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment_alert"
            referencedColumns: ["establishment_id"]
          },
        ]
      }
      gap_row_category: {
        Row: {
          best_competitor_position: number | null
          category: string | null
          client_position: number | null
          query: string | null
          row_id: string | null
          search_volume: number | null
          tool_run_id: string | null
        }
        Insert: {
          best_competitor_position?: never
          category?: never
          client_position?: number | null
          query?: string | null
          row_id?: string | null
          search_volume?: number | null
          tool_run_id?: string | null
        }
        Update: {
          best_competitor_position?: never
          category?: never
          client_position?: number | null
          query?: string | null
          row_id?: string | null
          search_volume?: number | null
          tool_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gap_row_tool_run_id_fkey"
            columns: ["tool_run_id"]
            isOneToOne: false
            referencedRelation: "tool_run"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_total: {
        Row: {
          agency_id: string | null
          client_id: string | null
          invoice_id: string | null
          subtotal_cents: number | null
          total_cents: number | null
          tps_cents: number | null
          tvq_cents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      local_grid_point: {
        Row: {
          establishment_id: string | null
          measured_on: string | null
          point_col: number | null
          point_row: number | null
          position_avg: number | null
          sector_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_keyword_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_keyword_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment_alert"
            referencedColumns: ["establishment_id"]
          },
        ]
      }
      local_keyword_reading: {
        Row: {
          establishment_id: string | null
          is_primary: boolean | null
          keyword_id: string | null
          measured_on: string | null
          points_measured: number | null
          points_unranked: number | null
          position_avg: number | null
          position_avg_previous: number | null
          position_max: number | null
          position_min: number | null
          query: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_keyword_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_keyword_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishment_alert"
            referencedColumns: ["establishment_id"]
          },
        ]
      }
      member_effective_permission: {
        Row: {
          agency_id: string | null
          granted: boolean | null
          member_id: string | null
          overridden: boolean | null
          permission: Database["public"]["Enums"]["permission"] | null
          reason: string | null
          role: Database["public"]["Enums"]["agency_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_member_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_value: {
        Row: {
          agency_id: string | null
          catalog_value_cents: number | null
          code: string | null
          discount_cents: number | null
          name: string | null
          offer_id: string | null
          price_cents: number | null
          price_is_from: boolean | null
        }
        Insert: {
          agency_id?: string | null
          catalog_value_cents?: never
          code?: string | null
          discount_cents?: never
          name?: string | null
          offer_id?: string | null
          price_cents?: number | null
          price_is_from?: boolean | null
        }
        Update: {
          agency_id?: string | null
          catalog_value_cents?: never
          code?: string | null
          discount_cents?: never
          name?: string | null
          offer_id?: string | null
          price_cents?: number | null
          price_is_from?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_total: {
        Row: {
          agency_id: string | null
          quote_id: string | null
          subtotal_cents: number | null
          total_cents: number | null
          tps_cents: number | null
          tvq_cents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
        ]
      }
      review_queue: {
        Row: {
          agency_id: string | null
          client_id: string | null
          client_label: string | null
          id: string | null
          internal_label: string | null
          kind: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      tracked_keyword_reading: {
        Row: {
          agency_id: string | null
          cannibalised: boolean | null
          client_id: string | null
          dropped_out: boolean | null
          group_id: string | null
          intent: Database["public"]["Enums"]["search_intent"] | null
          is_first_reading: boolean | null
          keyword_id: string | null
          measured_on: string | null
          measured_on_previous: string | null
          position: number | null
          position_previous: number | null
          query: string | null
          reading_id: string | null
          search_volume: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tracked_keyword_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_keyword_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_keyword_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "keyword_group"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_my_invitation: { Args: never; Returns: string }
      whoami: {
        Args: never
        Returns: {
          agency_id: string
          agency_name: string
          client_id: string
          contact_id: string
          full_name: string
          initials: string
          kind: string
          member_id: string
          role: Database["public"]["Enums"]["agency_role"]
        }[]
      }
    }
    Enums: {
      agency_role: "admin" | "chef_projet" | "specialiste_seo" | "redacteur"
      agenda_event_type: "echeance" | "rapport" | "rdv" | "exec"
      audit_dimension: "presence" | "seo" | "design"
      audit_family: "indexation" | "erreurs" | "onpage" | "perf" | "structure"
      audit_state: "encours" | "termine" | "partiel"
      automation_action:
        | "tache"
        | "priorite"
        | "notifier"
        | "courriel"
        | "rapport"
        | "audit"
      automation_category:
        | "surveillance"
        | "rapports"
        | "client"
        | "facturation"
        | "ia"
      automation_condition_kind:
        | "clients"
        | "forfait"
        | "dim"
        | "volume"
        | "semaine"
        | "nonassignee"
      automation_run_outcome: "succes" | "echec"
      automation_status: "active" | "pause" | "echec" | "brouillon"
      automation_trigger:
        | "position"
        | "score"
        | "crawl"
        | "avis"
        | "date"
        | "pipeline"
        | "facture"
        | "citation"
      backlink_event_kind: "gain" | "perte"
      billing_period: "mensuel" | "trimestriel" | "annuel" | "ponctuel"
      catalog_kind: "service" | "produit"
      citation_state:
        | "conforme"
        | "incoherent"
        | "absent"
        | "doublon"
        | "inaccessible"
      client_type: "client" | "prospect"
      communication_channel:
        | "courriel"
        | "portail"
        | "whatsapp"
        | "messenger"
        | "slack"
        | "appel"
        | "reunion"
        | "note"
      content_state:
        | "idee"
        | "brief"
        | "assigne"
        | "redaction"
        | "relecture"
        | "publie"
        | "mesure"
      contract_status:
        | "brouillon"
        | "envoye"
        | "signe"
        | "en_cours"
        | "suspendu"
        | "termine"
        | "resilie"
      criterion_status: "ok" | "warn" | "fail" | "na"
      deal_stage:
        | "prospect"
        | "qualifie"
        | "proposition"
        | "negociation"
        | "gagne"
        | "perdu"
      deliverable_state:
        | "a_produire"
        | "soumis"
        | "en_revision"
        | "accepte"
        | "accepte_tacitement"
      directory_authority: "haute" | "moyenne" | "faible"
      document_kind:
        | "devis"
        | "facture"
        | "proposition"
        | "contrat"
        | "annexe"
        | "avenant"
      gbp_field:
        | "nom_coordonnees"
        | "categories"
        | "horaires"
        | "photos"
        | "description"
        | "services"
        | "zone_desservie"
        | "attributs"
        | "site_web"
      gbp_post_type: "offre" | "mise_a_jour" | "evenement"
      gbp_state: "revendiquee" | "non_revendiquee" | "suspendue" | "tiers"
      invoice_status: "payee" | "en_attente" | "en_retard" | "annulee"
      local_review_state: "sans_reponse" | "a_relire" | "publiee" | "signale"
      milestone_owner: "client" | "prestataire" | "les_deux"
      nap_field:
        | "nom"
        | "adresse"
        | "telephone"
        | "site_web"
        | "horaires"
        | "categorie"
        | "autre"
      notification_kind:
        | "integration"
        | "position"
        | "sante"
        | "facture"
        | "liens"
        | "avis"
        | "rapport"
        | "deal"
        | "agent"
      payment_trigger: "signature" | "jalon" | "livraison_finale" | "date"
      permission:
        | "manage_agency"
        | "manage_team"
        | "manage_catalogue"
        | "manage_billing"
        | "view_financials"
        | "manage_clients"
        | "send_documents"
        | "publish_reports"
        | "manage_automations"
        | "run_paid_tools"
        | "manage_content"
      priority_status:
        | "neuve"
        | "assignee"
        | "resolue"
        | "recurrente"
        | "ignoree"
        | "faux_positif"
      priority_visibility: "interne" | "annonce" | "traitement"
      quote_status: "brouillon" | "envoye" | "accepte" | "refuse" | "expire"
      report_state:
        | "apreparer"
        | "brouillon"
        | "bloque"
        | "pret"
        | "publie"
        | "corrige"
        | "sanspreuve"
      retention_kind: "historise" | "instantane" | "ephemere"
      review_state: "a_relire" | "relu"
      search_intent:
        | "informationnelle"
        | "commerciale"
        | "transactionnelle"
        | "navigationnelle"
      seasonality: "hiver" | "ete" | "stable"
      sentiment_polarity: "positif" | "negatif"
      severity: "critique" | "important" | "opportunite"
      task_cadence: "signature" | "mensuel" | "trimestriel" | "annuel"
      task_status: "afaire" | "encours" | "bloquee" | "terminee"
      tool_id:
        | "site_audit"
        | "position_tracking"
        | "backlink_analyse"
        | "keyword_hunter"
        | "keyword_gap"
        | "domain_overview"
        | "organic_research"
      tool_run_state: "encours" | "termine" | "incomplet" | "echec"
      toxic_backlink_status: "a_desavouer" | "desavoue"
      url_change_kind: "apparue" | "disparue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agency_role: ["admin", "chef_projet", "specialiste_seo", "redacteur"],
      agenda_event_type: ["echeance", "rapport", "rdv", "exec"],
      audit_dimension: ["presence", "seo", "design"],
      audit_family: ["indexation", "erreurs", "onpage", "perf", "structure"],
      audit_state: ["encours", "termine", "partiel"],
      automation_action: [
        "tache",
        "priorite",
        "notifier",
        "courriel",
        "rapport",
        "audit",
      ],
      automation_category: [
        "surveillance",
        "rapports",
        "client",
        "facturation",
        "ia",
      ],
      automation_condition_kind: [
        "clients",
        "forfait",
        "dim",
        "volume",
        "semaine",
        "nonassignee",
      ],
      automation_run_outcome: ["succes", "echec"],
      automation_status: ["active", "pause", "echec", "brouillon"],
      automation_trigger: [
        "position",
        "score",
        "crawl",
        "avis",
        "date",
        "pipeline",
        "facture",
        "citation",
      ],
      backlink_event_kind: ["gain", "perte"],
      billing_period: ["mensuel", "trimestriel", "annuel", "ponctuel"],
      catalog_kind: ["service", "produit"],
      citation_state: [
        "conforme",
        "incoherent",
        "absent",
        "doublon",
        "inaccessible",
      ],
      client_type: ["client", "prospect"],
      communication_channel: [
        "courriel",
        "portail",
        "whatsapp",
        "messenger",
        "slack",
        "appel",
        "reunion",
        "note",
      ],
      content_state: [
        "idee",
        "brief",
        "assigne",
        "redaction",
        "relecture",
        "publie",
        "mesure",
      ],
      contract_status: [
        "brouillon",
        "envoye",
        "signe",
        "en_cours",
        "suspendu",
        "termine",
        "resilie",
      ],
      criterion_status: ["ok", "warn", "fail", "na"],
      deal_stage: [
        "prospect",
        "qualifie",
        "proposition",
        "negociation",
        "gagne",
        "perdu",
      ],
      deliverable_state: [
        "a_produire",
        "soumis",
        "en_revision",
        "accepte",
        "accepte_tacitement",
      ],
      directory_authority: ["haute", "moyenne", "faible"],
      document_kind: [
        "devis",
        "facture",
        "proposition",
        "contrat",
        "annexe",
        "avenant",
      ],
      gbp_field: [
        "nom_coordonnees",
        "categories",
        "horaires",
        "photos",
        "description",
        "services",
        "zone_desservie",
        "attributs",
        "site_web",
      ],
      gbp_post_type: ["offre", "mise_a_jour", "evenement"],
      gbp_state: ["revendiquee", "non_revendiquee", "suspendue", "tiers"],
      invoice_status: ["payee", "en_attente", "en_retard", "annulee"],
      local_review_state: ["sans_reponse", "a_relire", "publiee", "signale"],
      milestone_owner: ["client", "prestataire", "les_deux"],
      nap_field: [
        "nom",
        "adresse",
        "telephone",
        "site_web",
        "horaires",
        "categorie",
        "autre",
      ],
      notification_kind: [
        "integration",
        "position",
        "sante",
        "facture",
        "liens",
        "avis",
        "rapport",
        "deal",
        "agent",
      ],
      payment_trigger: ["signature", "jalon", "livraison_finale", "date"],
      permission: [
        "manage_agency",
        "manage_team",
        "manage_catalogue",
        "manage_billing",
        "view_financials",
        "manage_clients",
        "send_documents",
        "publish_reports",
        "manage_automations",
        "run_paid_tools",
        "manage_content",
      ],
      priority_status: [
        "neuve",
        "assignee",
        "resolue",
        "recurrente",
        "ignoree",
        "faux_positif",
      ],
      priority_visibility: ["interne", "annonce", "traitement"],
      quote_status: ["brouillon", "envoye", "accepte", "refuse", "expire"],
      report_state: [
        "apreparer",
        "brouillon",
        "bloque",
        "pret",
        "publie",
        "corrige",
        "sanspreuve",
      ],
      retention_kind: ["historise", "instantane", "ephemere"],
      review_state: ["a_relire", "relu"],
      search_intent: [
        "informationnelle",
        "commerciale",
        "transactionnelle",
        "navigationnelle",
      ],
      seasonality: ["hiver", "ete", "stable"],
      sentiment_polarity: ["positif", "negatif"],
      severity: ["critique", "important", "opportunite"],
      task_cadence: ["signature", "mensuel", "trimestriel", "annuel"],
      task_status: ["afaire", "encours", "bloquee", "terminee"],
      tool_id: [
        "site_audit",
        "position_tracking",
        "backlink_analyse",
        "keyword_hunter",
        "keyword_gap",
        "domain_overview",
        "organic_research",
      ],
      tool_run_state: ["encours", "termine", "incomplet", "echec"],
      toxic_backlink_status: ["a_desavouer", "desavoue"],
      url_change_kind: ["apparue", "disparue"],
    },
  },
} as const
