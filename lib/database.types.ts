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
      activities: {
        Row: {
          assigned_to_user_id: string | null
          created_at: string
          deal_id: string | null
          due_date: string | null
          id: string
          is_done: boolean
          is_system_activity: boolean
          lead_id: string | null
          notes: string | null
          organization_id: string | null
          person_id: string | null
          subject: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          created_at?: string
          deal_id?: string | null
          due_date?: string | null
          id?: string
          is_done?: boolean
          is_system_activity?: boolean
          lead_id?: string | null
          notes?: string | null
          organization_id?: string | null
          person_id?: string | null
          subject: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to_user_id?: string | null
          created_at?: string
          deal_id?: string | null
          due_date?: string | null
          id?: string
          is_done?: boolean
          is_system_activity?: boolean
          lead_id?: string | null
          notes?: string | null
          organization_id?: string | null
          person_id?: string | null
          subject?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_conversations: {
        Row: {
          context: Json
          created_at: string
          id: string
          messages: Json
          plan: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json
          created_at?: string
          id?: string
          messages?: Json
          plan?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: Json
          created_at?: string
          id?: string
          messages?: Json
          plan?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_thoughts: {
        Row: {
          content: string
          conversation_id: string
          id: string
          metadata: Json
          timestamp: string
          type: string
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          metadata?: Json
          timestamp?: string
          type: string
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          metadata?: Json
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
      deals: {
        Row: {
          amount: number | null
          assigned_to_user_id: string | null
          created_at: string
          custom_field_values: Json | null
          deal_specific_probability: number | null
          expected_close_date: string | null
          id: string
          name: string
          organization_id: string | null
          person_id: string | null
          stage_id: string | null
          updated_at: string
          user_id: string
          weighted_amount: number | null
          wfm_project_id: string | null
        }
        Insert: {
          amount?: number | null
          assigned_to_user_id?: string | null
          created_at?: string
          custom_field_values?: Json | null
          deal_specific_probability?: number | null
          expected_close_date?: string | null
          id?: string
          name: string
          organization_id?: string | null
          person_id?: string | null
          stage_id?: string | null
          updated_at?: string
          user_id: string
          weighted_amount?: number | null
          wfm_project_id?: string | null
        }
        Update: {
          amount?: number | null
          assigned_to_user_id?: string | null
          created_at?: string
          custom_field_values?: Json | null
          deal_specific_probability?: number | null
          expected_close_date?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          person_id?: string | null
          stage_id?: string | null
          updated_at?: string
          user_id?: string
          weighted_amount?: number | null
          wfm_project_id?: string | null
        }
        Relationships: [
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
          converted_at: string | null
          converted_by_user_id: string | null
          converted_to_deal_id: string | null
          converted_to_organization_id: string | null
          converted_to_person_id: string | null
          created_at: string | null
          created_by_user_id: string | null
          custom_field_values: Json | null
          description: string | null
          estimated_close_date: string | null
          estimated_value: number | null
          id: string
          last_activity_at: string | null
          lead_score: number | null
          lead_score_factors: Json | null
          name: string
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
          converted_at?: string | null
          converted_by_user_id?: string | null
          converted_to_deal_id?: string | null
          converted_to_organization_id?: string | null
          converted_to_person_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          custom_field_values?: Json | null
          description?: string | null
          estimated_close_date?: string | null
          estimated_value?: number | null
          id?: string
          last_activity_at?: string | null
          lead_score?: number | null
          lead_score_factors?: Json | null
          name: string
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
          converted_at?: string | null
          converted_by_user_id?: string | null
          converted_to_deal_id?: string | null
          converted_to_organization_id?: string | null
          converted_to_person_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          custom_field_values?: Json | null
          description?: string | null
          estimated_close_date?: string | null
          estimated_value?: number | null
          id?: string
          last_activity_at?: string | null
          lead_score?: number | null
          lead_score_factors?: Json | null
          name?: string
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
            foreignKeyName: "leads_wfm_project_id_fkey"
            columns: ["wfm_project_id"]
            isOneToOne: false
            referencedRelation: "wfm_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
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
          address?: string | null
          created_at?: string
          custom_field_values?: Json
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      people: {
        Row: {
          company: string | null
          created_at: string
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
      get_user_permissions: {
        Args: { p_user_id: string }
        Returns: Json
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
    },
  },
} as const

