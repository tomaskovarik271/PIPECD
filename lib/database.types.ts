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
          created_at: string
          deal_id: string | null
          due_date: string | null
          id: string
          is_done: boolean
          notes: string | null
          organization_id: string | null
          person_id: string | null
          subject: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id?: string | null
          due_date?: string | null
          id?: string
          is_done?: boolean
          notes?: string | null
          organization_id?: string | null
          person_id?: string | null
          subject: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string | null
          due_date?: string | null
          id?: string
          is_done?: boolean
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
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
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
      deal_followers: {
        Row: {
          deal_id: string
          followed_at: string
          user_id: string
        }
        Insert: {
          deal_id: string
          followed_at?: string
          user_id: string
        }
        Update: {
          deal_id?: string
          followed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_followers_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_followers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
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
      deals: {
        Row: {
          amount: number | null
          created_at: string
          custom_field_values: Json
          deal_specific_probability: number | null
          expected_close_date: string | null
          id: string
          name: string
          notes: string | null
          person_id: string | null
          stage: string | null
          stage_id: string | null
          updated_at: string
          user_id: string
          weighted_amount: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          custom_field_values?: Json
          deal_specific_probability?: number | null
          expected_close_date?: string | null
          id?: string
          name: string
          notes?: string | null
          person_id?: string | null
          stage?: string | null
          stage_id?: string | null
          updated_at?: string
          user_id: string
          weighted_amount?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          custom_field_values?: Json
          deal_specific_probability?: number | null
          expected_close_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          person_id?: string | null
          stage?: string | null
          stage_id?: string | null
          updated_at?: string
          user_id?: string
          weighted_amount?: number | null
        }
        Relationships: [
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
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          custom_field_values?: Json
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          custom_field_values?: Json
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
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
      price_quotes: {
        Row: {
          base_minimum_price_mp: number | null
          calculated_discounted_offer_price: number | null
          calculated_effective_markup_fop_over_mp: number | null
          calculated_full_target_price_ftp: number | null
          calculated_target_price_tp: number | null
          calculated_total_direct_cost: number | null
          created_at: string
          deal_id: string
          escalation_details: Json | null
          escalation_status: string | null
          final_offer_price_fop: number | null
          id: string
          name: string | null
          overall_discount_percentage: number | null
          status: string
          subsequent_installments_count: number | null
          subsequent_installments_interval_days: number | null
          target_markup_percentage: number | null
          updated_at: string
          upfront_payment_due_days: number | null
          upfront_payment_percentage: number | null
          user_id: string
          version_number: number
        }
        Insert: {
          base_minimum_price_mp?: number | null
          calculated_discounted_offer_price?: number | null
          calculated_effective_markup_fop_over_mp?: number | null
          calculated_full_target_price_ftp?: number | null
          calculated_target_price_tp?: number | null
          calculated_total_direct_cost?: number | null
          created_at?: string
          deal_id: string
          escalation_details?: Json | null
          escalation_status?: string | null
          final_offer_price_fop?: number | null
          id?: string
          name?: string | null
          overall_discount_percentage?: number | null
          status?: string
          subsequent_installments_count?: number | null
          subsequent_installments_interval_days?: number | null
          target_markup_percentage?: number | null
          updated_at?: string
          upfront_payment_due_days?: number | null
          upfront_payment_percentage?: number | null
          user_id: string
          version_number?: number
        }
        Update: {
          base_minimum_price_mp?: number | null
          calculated_discounted_offer_price?: number | null
          calculated_effective_markup_fop_over_mp?: number | null
          calculated_full_target_price_ftp?: number | null
          calculated_target_price_tp?: number | null
          calculated_total_direct_cost?: number | null
          created_at?: string
          deal_id?: string
          escalation_details?: Json | null
          escalation_status?: string | null
          final_offer_price_fop?: number | null
          id?: string
          name?: string | null
          overall_discount_percentage?: number | null
          status?: string
          subsequent_installments_count?: number | null
          subsequent_installments_interval_days?: number | null
          target_markup_percentage?: number | null
          updated_at?: string
          upfront_payment_due_days?: number | null
          upfront_payment_percentage?: number | null
          user_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_quotes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_additional_costs: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          price_quote_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          price_quote_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          price_quote_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_additional_costs_price_quote_id_fkey"
            columns: ["price_quote_id"]
            isOneToOne: false
            referencedRelation: "price_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_invoice_schedule_entries: {
        Row: {
          amount_due: number
          created_at: string
          description: string | null
          due_date: string
          entry_type: string
          id: string
          price_quote_id: string
          updated_at: string
        }
        Insert: {
          amount_due: number
          created_at?: string
          description?: string | null
          due_date: string
          entry_type: string
          id?: string
          price_quote_id: string
          updated_at?: string
        }
        Update: {
          amount_due?: number
          created_at?: string
          description?: string | null
          due_date?: string
          entry_type?: string
          id?: string
          price_quote_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_invoice_schedule_entries_price_quote_id_fkey"
            columns: ["price_quote_id"]
            isOneToOne: false
            referencedRelation: "price_quotes"
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
      team_members: {
        Row: {
          joined_at: string
          team_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          team_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          description: string | null
          id: string
          name: string
          team_lead_user_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          name: string
          team_lead_user_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          name?: string
          team_lead_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teams_team_lead_user_id_fkey"
            columns: ["team_lead_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
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
    }
    Views: {
      [_ in never]: never
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
      get_my_permissions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_team_lead_of_item_owner: {
        Args: { viewer_user_id: string; item_owner_user_id: string }
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
      entity_type: "DEAL" | "PERSON" | "ORGANIZATION"
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
      entity_type: ["DEAL", "PERSON", "ORGANIZATION"],
    },
  },
} as const

