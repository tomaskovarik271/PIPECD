export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      agent_conversations: {
        Row: {
          agent_version: string | null
          context: Json
          created_at: string
          extended_thinking_enabled: boolean | null
          id: string
          messages: Json
          plan: Json | null
          thinking_budget: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_version?: string | null
          context?: Json
          created_at?: string
          extended_thinking_enabled?: boolean | null
          id?: string
          messages?: Json
          plan?: Json | null
          thinking_budget?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_version?: string | null
          context?: Json
          created_at?: string
          extended_thinking_enabled?: boolean | null
          id?: string
          messages?: Json
          plan?: Json | null
          thinking_budget?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_thoughts: {
        Row: {
          concerns: string | null
          content: string
          conversation_id: string
          id: string
          metadata: Json
          next_steps: string | null
          reasoning: string | null
          reflection_data: Json | null
          strategy: string | null
          thinking_budget: string | null
          timestamp: string
          type: string
        }
        Insert: {
          concerns?: string | null
          content: string
          conversation_id: string
          id?: string
          metadata?: Json
          next_steps?: string | null
          reasoning?: string | null
          reflection_data?: Json | null
          strategy?: string | null
          thinking_budget?: string | null
          timestamp?: string
          type: string
        }
        Update: {
          concerns?: string | null
          content?: string
          conversation_id?: string
          id?: string
          metadata?: Json
          next_steps?: string | null
          reasoning?: string | null
          reflection_data?: Json | null
          strategy?: string | null
          thinking_budget?: string | null
          timestamp?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_thoughts_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          is_public: boolean | null
          setting_key: string
          setting_type: string | null
          setting_value: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          is_public?: boolean | null
          setting_key: string
          setting_type?: string | null
          setting_value?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          is_public?: boolean | null
          setting_key?: string
          setting_type?: string | null
          setting_value?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string | null
          deal_id: string | null
          description: string | null
          end_time: string
          event_type: string
          google_calendar_id: string
          google_event_id: string
          google_meet_link: string | null
          id: string
          is_all_day: boolean | null
          is_cancelled: boolean | null
          last_synced_at: string | null
          location: string | null
          next_actions: string[] | null
          organization_id: string | null
          outcome: string | null
          outcome_notes: string | null
          person_id: string | null
          start_time: string
          timezone: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          end_time: string
          event_type?: string
          google_calendar_id: string
          google_event_id: string
          google_meet_link?: string | null
          id?: string
          is_all_day?: boolean | null
          is_cancelled?: boolean | null
          last_synced_at?: string | null
          location?: string | null
          next_actions?: string[] | null
          organization_id?: string | null
          outcome?: string | null
          outcome_notes?: string | null
          person_id?: string | null
          start_time: string
          timezone?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          end_time?: string
          event_type?: string
          google_calendar_id?: string
          google_event_id?: string
          google_meet_link?: string | null
          id?: string
          is_all_day?: boolean | null
          is_cancelled?: boolean | null
          last_synced_at?: string | null
          location?: string | null
          next_actions?: string[] | null
          organization_id?: string | null
          outcome?: string | null
          outcome_notes?: string | null
          person_id?: string | null
          start_time?: string
          timezone?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_sync_log: {
        Row: {
          api_response: Json | null
          calendar_event_id: string | null
          calendar_id: string | null
          created_at: string | null
          error_message: string | null
          google_event_id: string | null
          id: string
          processing_time_ms: number | null
          success: boolean
          sync_action: string
          sync_direction: string
          sync_source: string
          user_id: string
        }
        Insert: {
          api_response?: Json | null
          calendar_event_id?: string | null
          calendar_id?: string | null
          created_at?: string | null
          error_message?: string | null
          google_event_id?: string | null
          id?: string
          processing_time_ms?: number | null
          success: boolean
          sync_action: string
          sync_direction: string
          sync_source: string
          user_id: string
        }
        Update: {
          api_response?: Json | null
          calendar_event_id?: string | null
          calendar_id?: string | null
          created_at?: string | null
          error_message?: string | null
          google_event_id?: string | null
          id?: string
          processing_time_ms?: number | null
          success?: boolean
          sync_action?: string
          sync_direction?: string
          sync_source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_log_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_history: {
        Row: {
          conversion_data: Json | null
          conversion_reason: string | null
          conversion_type: string
          converted_at: string | null
          converted_by_user_id: string | null
          created_at: string | null
          id: string
          source_entity_id: string
          source_entity_type: string
          target_entity_id: string
          target_entity_type: string
          updated_at: string | null
          wfm_transition_plan: Json | null
        }
        Insert: {
          conversion_data?: Json | null
          conversion_reason?: string | null
          conversion_type: string
          converted_at?: string | null
          converted_by_user_id?: string | null
          created_at?: string | null
          id?: string
          source_entity_id: string
          source_entity_type: string
          target_entity_id: string
          target_entity_type: string
          updated_at?: string | null
          wfm_transition_plan?: Json | null
        }
        Update: {
          conversion_data?: Json | null
          conversion_reason?: string | null
          conversion_type?: string
          converted_at?: string | null
          converted_by_user_id?: string | null
          created_at?: string | null
          id?: string
          source_entity_id?: string
          source_entity_type?: string
          target_entity_id?: string
          target_entity_type?: string
          updated_at?: string | null
          wfm_transition_plan?: Json | null
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string | null
          decimal_places: number
          is_active: boolean | null
          name: string
          symbol: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          decimal_places?: number
          is_active?: boolean | null
          name: string
          symbol: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          decimal_places?: number
          is_active?: boolean | null
          name?: string
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_field_definitions: {
        Row: {
          created_at: string
          display_order: number | null
          dropdown_options: Json | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          field_label: string
          field_name: string
          field_type: Database["public"]["Enums"]["custom_field_type"]
          id: string
          is_active: boolean | null
          is_required: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          dropdown_options?: Json | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          field_label: string
          field_name: string
          field_type: Database["public"]["Enums"]["custom_field_type"]
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          dropdown_options?: Json | null
          entity_type?: Database["public"]["Enums"]["entity_type"]
          field_label?: string
          field_name?: string
          field_type?: Database["public"]["Enums"]["custom_field_type"]
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      deal_document_attachments: {
        Row: {
          attached_at: string | null
          attached_by: string
          category: string | null
          deal_id: string
          file_name: string
          file_size: number | null
          file_url: string
          google_file_id: string
          id: string
          mime_type: string | null
          shared_drive_id: string | null
        }
        Insert: {
          attached_at?: string | null
          attached_by: string
          category?: string | null
          deal_id: string
          file_name: string
          file_size?: number | null
          file_url: string
          google_file_id: string
          id?: string
          mime_type?: string | null
          shared_drive_id?: string | null
        }
        Update: {
          attached_at?: string | null
          attached_by?: string
          category?: string | null
          deal_id?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          google_file_id?: string
          id?: string
          mime_type?: string | null
          shared_drive_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_document_attachments_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_documents: {
        Row: {
          attached_at: string | null
          attached_by: string
          category: string | null
          created_at: string | null
          deal_id: string
          file_id: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          updated_at: string | null
        }
        Insert: {
          attached_at?: string | null
          attached_by: string
          category?: string | null
          created_at?: string | null
          deal_id: string
          file_id: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          updated_at?: string | null
        }
        Update: {
          attached_at?: string | null
          attached_by?: string
          category?: string | null
          created_at?: string | null
          deal_id?: string
          file_id?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_drive_folders: {
        Row: {
          created_at: string | null
          created_by: string
          deal_id: string
          folder_id: string
          folder_name: string
          folder_url: string
          id: string
          is_main_folder: boolean | null
          parent_folder_id: string | null
          subfolder_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deal_id: string
          folder_id: string
          folder_name: string
          folder_url: string
          id?: string
          is_main_folder?: boolean | null
          parent_folder_id?: string | null
          subfolder_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deal_id?: string
          folder_id?: string
          folder_name?: string
          folder_url?: string
          id?: string
          is_main_folder?: boolean | null
          parent_folder_id?: string | null
          subfolder_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_drive_folders_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_history: {
        Row: {
          changes: Json | null
          created_at: string
          deal_id: string
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          changes?: Json | null
          created_at?: string
          deal_id: string
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          changes?: Json | null
          created_at?: string
          deal_id?: string
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_history_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_participants: {
        Row: {
          added_from_email: boolean | null
          created_at: string | null
          created_by_user_id: string | null
          deal_id: string
          id: string
          person_id: string
          role: string | null
        }
        Insert: {
          added_from_email?: boolean | null
          created_at?: string | null
          created_by_user_id?: string | null
          deal_id: string
          id?: string
          person_id: string
          role?: string | null
        }
        Update: {
          added_from_email?: boolean | null
          created_at?: string | null
          created_by_user_id?: string | null
          deal_id?: string
          id?: string
          person_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_participants_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_participants_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          amount: number | null
          amount_usd: number | null
          assigned_to_user_id: string | null
          conversion_date: string | null
          conversion_reason: string | null
          converted_to_lead_id: string | null
          created_at: string
          currency: string | null
          custom_field_values: Json | null
          deal_specific_probability: number | null
          exchange_rate_used: number | null
          expected_close_date: string | null
          id: string
          name: string
          organization_id: string | null
          person_id: string | null
          project_id: string | null
          stage_id: string | null
          updated_at: string
          user_id: string
          weighted_amount: number | null
          wfm_project_id: string | null
        }
        Insert: {
          amount?: number | null
          amount_usd?: number | null
          assigned_to_user_id?: string | null
          conversion_date?: string | null
          conversion_reason?: string | null
          converted_to_lead_id?: string | null
          created_at?: string
          currency?: string | null
          custom_field_values?: Json | null
          deal_specific_probability?: number | null
          exchange_rate_used?: number | null
          expected_close_date?: string | null
          id?: string
          name: string
          organization_id?: string | null
          person_id?: string | null
          project_id?: string | null
          stage_id?: string | null
          updated_at?: string
          user_id: string
          weighted_amount?: number | null
          wfm_project_id?: string | null
        }
        Update: {
          amount?: number | null
          amount_usd?: number | null
          assigned_to_user_id?: string | null
          conversion_date?: string | null
          conversion_reason?: string | null
          converted_to_lead_id?: string | null
          created_at?: string
          currency?: string | null
          custom_field_values?: Json | null
          deal_specific_probability?: number | null
          exchange_rate_used?: number | null
          expected_close_date?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          person_id?: string | null
          project_id?: string | null
          stage_id?: string | null
          updated_at?: string
          user_id?: string
          weighted_amount?: number | null
          wfm_project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_converted_to_lead_id_fkey"
            columns: ["converted_to_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_wfm_project_id_fkey"
            columns: ["wfm_project_id"]
            isOneToOne: false
            referencedRelation: "wfm_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          created_by_user_id: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size_bytes: number | null
          google_drive_download_link: string | null
          google_drive_file_id: string | null
          google_drive_folder_id: string | null
          google_drive_web_view_link: string | null
          id: string
          is_public: boolean
          last_synced_at: string | null
          mime_type: string | null
          shared_with_users: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size_bytes?: number | null
          google_drive_download_link?: string | null
          google_drive_file_id?: string | null
          google_drive_folder_id?: string | null
          google_drive_web_view_link?: string | null
          id?: string
          is_public?: boolean
          last_synced_at?: string | null
          mime_type?: string | null
          shared_with_users?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size_bytes?: number | null
          google_drive_download_link?: string | null
          google_drive_file_id?: string | null
          google_drive_folder_id?: string | null
          google_drive_web_view_link?: string | null
          id?: string
          is_public?: boolean
          last_synced_at?: string | null
          mime_type?: string | null
          shared_with_users?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      email_pins: {
        Row: {
          created_at: string | null
          deal_id: string
          email_id: string
          from_email: string | null
          id: string
          notes: string | null
          pinned_at: string | null
          subject: string | null
          thread_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deal_id: string
          email_id: string
          from_email?: string | null
          id?: string
          notes?: string | null
          pinned_at?: string | null
          subject?: string | null
          thread_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deal_id?: string
          email_id?: string
          from_email?: string | null
          id?: string
          notes?: string | null
          pinned_at?: string | null
          subject?: string | null
          thread_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_pins_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          bcc_emails: string[] | null
          body_preview: string | null
          cc_emails: string[] | null
          created_at: string
          created_by_user_id: string
          entity_id: string | null
          entity_type: string | null
          from_email: string
          full_body: string | null
          gmail_labels: string[] | null
          gmail_message_id: string | null
          gmail_thread_id: string | null
          has_attachments: boolean
          id: string
          is_outbound: boolean
          is_read: boolean
          sent_at: string
          subject: string
          to_emails: string[]
          updated_at: string
        }
        Insert: {
          bcc_emails?: string[] | null
          body_preview?: string | null
          cc_emails?: string[] | null
          created_at?: string
          created_by_user_id: string
          entity_id?: string | null
          entity_type?: string | null
          from_email: string
          full_body?: string | null
          gmail_labels?: string[] | null
          gmail_message_id?: string | null
          gmail_thread_id?: string | null
          has_attachments?: boolean
          id?: string
          is_outbound?: boolean
          is_read?: boolean
          sent_at: string
          subject: string
          to_emails?: string[]
          updated_at?: string
        }
        Update: {
          bcc_emails?: string[] | null
          body_preview?: string | null
          cc_emails?: string[] | null
          created_at?: string
          created_by_user_id?: string
          entity_id?: string | null
          entity_type?: string | null
          from_email?: string
          full_body?: string | null
          gmail_labels?: string[] | null
          gmail_message_id?: string | null
          gmail_thread_id?: string | null
          has_attachments?: boolean
          id?: string
          is_outbound?: boolean
          is_read?: boolean
          sent_at?: string
          subject?: string
          to_emails?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          created_at: string | null
          effective_date: string
          from_currency: string
          id: string
          rate: number
          source: string
          to_currency: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          effective_date?: string
          from_currency: string
          id?: string
          rate: number
          source?: string
          to_currency: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          effective_date?: string
          from_currency?: string
          id?: string
          rate?: number
          source?: string
          to_currency?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exchange_rates_from_currency_fkey"
            columns: ["from_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "exchange_rates_to_currency_fkey"
            columns: ["to_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      google_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          granted_scopes: string[]
          id: string
          is_active: boolean
          last_used_at: string | null
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          granted_scopes?: string[]
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          granted_scopes?: string[]
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_history: {
        Row: {
          created_at: string | null
          event_type: string
          field_name: string | null
          id: string
          lead_id: string
          new_value: Json | null
          old_value: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          field_name?: string | null
          id?: string
          lead_id: string
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          field_name?: string | null
          id?: string
          lead_id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ai_insights: Json | null
          assigned_at: string | null
          assigned_to_user_id: string | null
          automation_score_factors: Json | null
          company_name: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          conversion_date: string | null
          conversion_reason: string | null
          converted_at: string | null
          converted_by_user_id: string | null
          converted_to_deal_id: string | null
          converted_to_organization_id: string | null
          converted_to_person_id: string | null
          created_at: string | null
          created_by_user_id: string | null
          currency: string | null
          custom_field_values: Json | null
          description: string | null
          estimated_close_date: string | null
          estimated_value: number | null
          estimated_value_usd: number | null
          exchange_rate_used: number | null
          id: string
          last_activity_at: string | null
          lead_score: number | null
          lead_score_factors: Json | null
          name: string
          original_deal_id: string | null
          reactivation_target_date: string | null
          source: string | null
          updated_at: string | null
          user_id: string
          wfm_project_id: string | null
        }
        Insert: {
          ai_insights?: Json | null
          assigned_at?: string | null
          assigned_to_user_id?: string | null
          automation_score_factors?: Json | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          conversion_date?: string | null
          conversion_reason?: string | null
          converted_at?: string | null
          converted_by_user_id?: string | null
          converted_to_deal_id?: string | null
          converted_to_organization_id?: string | null
          converted_to_person_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          currency?: string | null
          custom_field_values?: Json | null
          description?: string | null
          estimated_close_date?: string | null
          estimated_value?: number | null
          estimated_value_usd?: number | null
          exchange_rate_used?: number | null
          id?: string
          last_activity_at?: string | null
          lead_score?: number | null
          lead_score_factors?: Json | null
          name: string
          original_deal_id?: string | null
          reactivation_target_date?: string | null
          source?: string | null
          updated_at?: string | null
          user_id: string
          wfm_project_id?: string | null
        }
        Update: {
          ai_insights?: Json | null
          assigned_at?: string | null
          assigned_to_user_id?: string | null
          automation_score_factors?: Json | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          conversion_date?: string | null
          conversion_reason?: string | null
          converted_at?: string | null
          converted_by_user_id?: string | null
          converted_to_deal_id?: string | null
          converted_to_organization_id?: string | null
          converted_to_person_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          currency?: string | null
          custom_field_values?: Json | null
          description?: string | null
          estimated_close_date?: string | null
          estimated_value?: number | null
          estimated_value_usd?: number | null
          exchange_rate_used?: number | null
          id?: string
          last_activity_at?: string | null
          lead_score?: number | null
          lead_score_factors?: Json | null
          name?: string
          original_deal_id?: string | null
          reactivation_target_date?: string | null
          source?: string | null
          updated_at?: string | null
          user_id?: string
          wfm_project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_converted_to_deal_id_fkey"
            columns: ["converted_to_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_to_organization_id_fkey"
            columns: ["converted_to_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_to_person_id_fkey"
            columns: ["converted_to_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "leads_original_deal_id_fkey"
            columns: ["original_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_wfm_project_id_fkey"
            columns: ["wfm_project_id"]
            isOneToOne: false
            referencedRelation: "wfm_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      note_document_attachments: {
        Row: {
          attached_at: string | null
          attached_by: string
          file_name: string
          file_size: number | null
          file_url: string
          google_file_id: string
          id: string
          mime_type: string | null
          note_id: string
        }
        Insert: {
          attached_at?: string | null
          attached_by: string
          file_name: string
          file_size?: number | null
          file_url: string
          google_file_id: string
          id?: string
          mime_type?: string | null
          note_id: string
        }
        Update: {
          attached_at?: string | null
          attached_by?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          google_file_id?: string
          id?: string
          mime_type?: string | null
          note_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          account_manager_id: string | null
          address: string | null
          created_at: string
          custom_field_values: Json
          id: string
          name: string
          notes: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_manager_id?: string | null
          address?: string | null
          created_at?: string
          custom_field_values?: Json
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_manager_id?: string | null
          address?: string | null
          created_at?: string
          custom_field_values?: Json
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      people: {
        Row: {
          company: string | null
          created_at: string
          created_from_email_id: string | null
          created_from_email_subject: string | null
          custom_field_values: Json
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_from_email_id?: string | null
          created_from_email_subject?: string | null
          custom_field_values?: Json
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          created_from_email_id?: string | null
          created_from_email_subject?: string | null
          custom_field_values?: Json
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          description: string | null
          id: string
          resource: string
        }
        Insert: {
          action: string
          description?: string | null
          id?: string
          resource: string
        }
        Update: {
          action?: string
          description?: string | null
          id?: string
          resource?: string
        }
        Relationships: []
      }
      pipelines: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_types: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          default_workflow_id: string | null
          description: string | null
          icon_name: string | null
          id: string
          is_archived: boolean
          name: string
          updated_at: string
          updated_by_user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          default_workflow_id?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_archived?: boolean
          name: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          default_workflow_id?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_types_default_workflow_id_fkey"
            columns: ["default_workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      reactivation_plans: {
        Row: {
          assigned_to_user_id: string | null
          created_at: string | null
          created_by_user_id: string | null
          follow_up_activities: Json | null
          id: string
          lead_id: string | null
          notes: string | null
          original_deal_id: string | null
          reactivation_strategy: string | null
          status: string | null
          target_reactivation_date: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to_user_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          follow_up_activities?: Json | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          original_deal_id?: string | null
          reactivation_strategy?: string | null
          status?: string | null
          target_reactivation_date?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to_user_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          follow_up_activities?: Json | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          original_deal_id?: string | null
          reactivation_strategy?: string | null
          status?: string | null
          target_reactivation_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reactivation_plans_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactivation_plans_original_deal_id_fkey"
            columns: ["original_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      smart_stickers: {
        Row: {
          category_id: string | null
          color: string | null
          content: string | null
          created_at: string | null
          created_by_user_id: string
          entity_id: string
          entity_type: string
          height: number | null
          id: string
          is_pinned: boolean | null
          is_private: boolean | null
          last_edited_at: string | null
          last_edited_by_user_id: string | null
          mentions: Json | null
          position_x: number | null
          position_y: number | null
          priority: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          width: number | null
        }
        Insert: {
          category_id?: string | null
          color?: string | null
          content?: string | null
          created_at?: string | null
          created_by_user_id: string
          entity_id: string
          entity_type: string
          height?: number | null
          id?: string
          is_pinned?: boolean | null
          is_private?: boolean | null
          last_edited_at?: string | null
          last_edited_by_user_id?: string | null
          mentions?: Json | null
          position_x?: number | null
          position_y?: number | null
          priority?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          category_id?: string | null
          color?: string | null
          content?: string | null
          created_at?: string | null
          created_by_user_id?: string
          entity_id?: string
          entity_type?: string
          height?: number | null
          id?: string
          is_pinned?: boolean | null
          is_private?: boolean | null
          last_edited_at?: string | null
          last_edited_by_user_id?: string | null
          mentions?: Json | null
          position_x?: number | null
          position_y?: number | null
          priority?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_stickers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "sticker_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_stickers_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "smart_stickers_last_edited_by_user_id_fkey"
            columns: ["last_edited_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      stages: {
        Row: {
          created_at: string
          deal_probability: number | null
          id: string
          name: string
          order: number
          pipeline_id: string
          stage_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_probability?: number | null
          id?: string
          name: string
          order?: number
          pipeline_id: string
          stage_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_probability?: number | null
          id?: string
          name?: string
          order?: number
          pipeline_id?: string
          stage_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      statuses: {
        Row: {
          color: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          id: string
          is_archived: boolean
          name: string
          updated_at: string
          updated_by_user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          name: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Relationships: []
      }
      sticker_categories: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_system: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to_user_id: string | null
          calendar_event_id: string | null
          completed_at: string | null
          created_at: string | null
          created_by_user_id: string
          deal_id: string | null
          description: string | null
          due_date: string | null
          email_thread_id: string | null
          estimated_duration: unknown | null
          id: string
          lead_id: string | null
          notes: string | null
          organization_id: string | null
          person_id: string | null
          priority: Database["public"]["Enums"]["task_priority_enum"]
          status: Database["public"]["Enums"]["task_status_enum"]
          tags: string[] | null
          title: string
          type: Database["public"]["Enums"]["task_type_enum"]
          updated_at: string | null
        }
        Insert: {
          assigned_to_user_id?: string | null
          calendar_event_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by_user_id: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          email_thread_id?: string | null
          estimated_duration?: unknown | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          organization_id?: string | null
          person_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority_enum"]
          status?: Database["public"]["Enums"]["task_status_enum"]
          tags?: string[] | null
          title: string
          type?: Database["public"]["Enums"]["task_type_enum"]
          updated_at?: string | null
        }
        Update: {
          assigned_to_user_id?: string | null
          calendar_event_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by_user_id?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          email_thread_id?: string | null
          estimated_duration?: unknown | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          organization_id?: string | null
          person_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority_enum"]
          status?: Database["public"]["Enums"]["task_status_enum"]
          tags?: string[] | null
          title?: string
          type?: Database["public"]["Enums"]["task_type_enum"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      user_calendar_preferences: {
        Row: {
          auto_add_deal_participants: boolean | null
          auto_add_google_meet: boolean | null
          auto_sync_enabled: boolean | null
          business_calendar_id: string | null
          created_at: string | null
          default_buffer_time: number | null
          default_location: string | null
          default_meeting_duration: number | null
          id: string
          include_deal_context: boolean | null
          primary_calendar_id: string | null
          reminder_preferences: Json | null
          sync_future_days: number | null
          sync_past_days: number | null
          updated_at: string | null
          user_id: string
          working_hours: Json | null
        }
        Insert: {
          auto_add_deal_participants?: boolean | null
          auto_add_google_meet?: boolean | null
          auto_sync_enabled?: boolean | null
          business_calendar_id?: string | null
          created_at?: string | null
          default_buffer_time?: number | null
          default_location?: string | null
          default_meeting_duration?: number | null
          id?: string
          include_deal_context?: boolean | null
          primary_calendar_id?: string | null
          reminder_preferences?: Json | null
          sync_future_days?: number | null
          sync_past_days?: number | null
          updated_at?: string | null
          user_id: string
          working_hours?: Json | null
        }
        Update: {
          auto_add_deal_participants?: boolean | null
          auto_add_google_meet?: boolean | null
          auto_sync_enabled?: boolean | null
          business_calendar_id?: string | null
          created_at?: string | null
          default_buffer_time?: number | null
          default_location?: string | null
          default_meeting_duration?: number | null
          id?: string
          include_deal_context?: boolean | null
          primary_calendar_id?: string | null
          reminder_preferences?: Json | null
          sync_future_days?: number | null
          sync_past_days?: number | null
          updated_at?: string | null
          user_id?: string
          working_hours?: Json | null
        }
        Relationships: []
      }
      user_currency_preferences: {
        Row: {
          created_at: string | null
          default_currency: string | null
          display_currency: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_currency?: string | null
          display_currency?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_currency?: string | null
          display_currency?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_currency_preferences_default_currency_fkey"
            columns: ["default_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "user_currency_preferences_display_currency_fkey"
            columns: ["display_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role_id: string
          user_id: string
        }
        Insert: {
          role_id: string
          user_id: string
        }
        Update: {
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      wfm_projects: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          current_step_id: string | null
          description: string | null
          id: string
          name: string
          project_type_id: string
          updated_at: string
          updated_by_user_id: string | null
          workflow_id: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          current_step_id?: string | null
          description?: string | null
          id?: string
          name: string
          project_type_id: string
          updated_at?: string
          updated_by_user_id?: string | null
          workflow_id: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          current_step_id?: string | null
          description?: string | null
          id?: string
          name?: string
          project_type_id?: string
          updated_at?: string
          updated_by_user_id?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wfm_projects_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wfm_projects_project_type_id_fkey"
            columns: ["project_type_id"]
            isOneToOne: false
            referencedRelation: "project_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wfm_projects_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          created_at: string
          id: string
          is_final_step: boolean
          is_initial_step: boolean
          metadata: Json | null
          status_id: string
          step_order: number
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_final_step?: boolean
          is_initial_step?: boolean
          metadata?: Json | null
          status_id: string
          step_order: number
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_final_step?: boolean
          is_initial_step?: boolean
          metadata?: Json | null
          status_id?: string
          step_order?: number
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_transitions: {
        Row: {
          created_at: string
          from_step_id: string
          id: string
          name: string | null
          to_step_id: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          from_step_id: string
          id?: string
          name?: string | null
          to_step_id: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          from_step_id?: string
          id?: string
          name?: string | null
          to_step_id?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_transitions_from_step_id_fkey"
            columns: ["from_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_transitions_to_step_id_fkey"
            columns: ["to_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_transitions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          description: string | null
          id: string
          is_archived: boolean
          name: string
          updated_at: string
          updated_by_user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          name: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      lead_index_usage: {
        Row: {
          idx_scan: number | null
          idx_tup_fetch: number | null
          idx_tup_read: number | null
          indexname: unknown | null
          schemaname: unknown | null
          tablename: unknown | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_user_read_only_role: {
        Args: { user_email: string }
        Returns: string
      }
      check_permission: {
        Args: { p_user_id: string; p_action: string; p_resource: string }
        Returns: boolean
      }
      check_user_has_permission: {
        Args: { checking_user_id: string; required_permission_code: string }
        Returns: boolean
      }
      create_lead_wfm_project: {
        Args: { lead_uuid: string; project_name?: string }
        Returns: string
      }
      expire_old_insights: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_project_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_permissions: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_users_by_role: {
        Args: { role_name: string }
        Returns: {
          user_id: string
          email: string
          assigned_at: string
        }[]
      }
      reassign_deal: {
        Args: {
          p_deal_id: string
          p_new_assignee_id: string
          p_current_user_id: string
        }
        Returns: undefined
      }
      setup_default_lead_permissions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      test_lead_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: {
          policy_name: string
          test_description: string
          test_result: boolean
        }[]
      }
      update_lead_workflow_step: {
        Args: { lead_uuid: string; target_step_id: string }
        Returns: boolean
      }
      user_has_lead_access: {
        Args: { lead_uuid: string; access_type?: string }
        Returns: boolean
      }
    }
    Enums: {
      custom_field_type:
        | "TEXT"
        | "NUMBER"
        | "DATE"
        | "BOOLEAN"
        | "DROPDOWN"
        | "MULTI_SELECT"
      entity_type: "DEAL" | "PERSON" | "ORGANIZATION" | "LEAD"
      task_priority_enum: "low" | "medium" | "high" | "urgent"
      task_status_enum:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "waiting"
      task_type_enum:
        | "follow_up"
        | "preparation"
        | "deadline"
        | "internal"
        | "research"
        | "administrative"
        | "email"
        | "call"
        | "meeting_prep"
        | "post_meeting"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      custom_field_type: [
        "TEXT",
        "NUMBER",
        "DATE",
        "BOOLEAN",
        "DROPDOWN",
        "MULTI_SELECT",
      ],
      entity_type: ["DEAL", "PERSON", "ORGANIZATION", "LEAD"],
      task_priority_enum: ["low", "medium", "high", "urgent"],
      task_status_enum: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "waiting",
      ],
      task_type_enum: [
        "follow_up",
        "preparation",
        "deadline",
        "internal",
        "research",
        "administrative",
        "email",
        "call",
        "meeting_prep",
        "post_meeting",
      ],
    },
  },
} as const

