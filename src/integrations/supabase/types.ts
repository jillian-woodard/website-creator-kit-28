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
      closet_items: {
        Row: {
          brand: string | null
          category: string
          color: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          notes: string | null
          season: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category: string
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          season?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          season?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      for_you_recs: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          recs: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          recs: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          recs?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_days: {
        Row: {
          created_at: string
          day_date: string
          id: string
          occasion: string | null
          outfit_data: Json | null
          plan_id: string
          weather_condition: string | null
          weather_temp_high: number | null
          weather_temp_low: number | null
        }
        Insert: {
          created_at?: string
          day_date: string
          id?: string
          occasion?: string | null
          outfit_data?: Json | null
          plan_id: string
          weather_condition?: string | null
          weather_temp_high?: number | null
          weather_temp_low?: number | null
        }
        Update: {
          created_at?: string
          day_date?: string
          id?: string
          occasion?: string | null
          outfit_data?: Json | null
          plan_id?: string
          weather_condition?: string | null
          weather_temp_high?: number | null
          weather_temp_low?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_days_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rec_dismissals: {
        Row: {
          category: string | null
          created_at: string
          id: string
          product_link: string
          product_title: string | null
          retailer: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          product_link: string
          product_title?: string | null
          retailer?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          product_link?: string
          product_title?: string | null
          retailer?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rec_impressions: {
        Row: {
          category: string
          generation_id: string
          id: string
          price: number | null
          product_link: string
          product_title: string | null
          retailer: string | null
          shown_at: string
          user_id: string
        }
        Insert: {
          category: string
          generation_id: string
          id?: string
          price?: number | null
          product_link: string
          product_title?: string | null
          retailer?: string | null
          shown_at?: string
          user_id: string
        }
        Update: {
          category?: string
          generation_id?: string
          id?: string
          price?: number | null
          product_link?: string
          product_title?: string | null
          retailer?: string | null
          shown_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          category: string | null
          created_at: string
          currency: string
          id: string
          image: string | null
          link: string
          price: number | null
          retailer: string | null
          source_query: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string
          id?: string
          image?: string | null
          link: string
          price?: number | null
          retailer?: string | null
          source_query?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string
          id?: string
          image?: string | null
          link?: string
          price?: number | null
          retailer?: string | null
          source_query?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      style_profiles: {
        Row: {
          ab_choices: number[] | null
          ai_keywords: string[] | null
          ai_silhouettes: string[] | null
          ai_style_brief: string | null
          body_input_method: string | null
          budget_max: number | null
          budget_min: number | null
          category_budgets: Json | null
          created_at: string
          height_inches: number | null
          id: string
          manual_measurements: Json | null
          occasions: string[] | null
          recalibration_cadence: string | null
          selected_visual_cues: string[] | null
          shopping_preference: string | null
          silhouette_type: string | null
          updated_at: string
          user_id: string
          vibe_description: string | null
        }
        Insert: {
          ab_choices?: number[] | null
          ai_keywords?: string[] | null
          ai_silhouettes?: string[] | null
          ai_style_brief?: string | null
          body_input_method?: string | null
          budget_max?: number | null
          budget_min?: number | null
          category_budgets?: Json | null
          created_at?: string
          height_inches?: number | null
          id?: string
          manual_measurements?: Json | null
          occasions?: string[] | null
          recalibration_cadence?: string | null
          selected_visual_cues?: string[] | null
          shopping_preference?: string | null
          silhouette_type?: string | null
          updated_at?: string
          user_id: string
          vibe_description?: string | null
        }
        Update: {
          ab_choices?: number[] | null
          ai_keywords?: string[] | null
          ai_silhouettes?: string[] | null
          ai_style_brief?: string | null
          body_input_method?: string | null
          budget_max?: number | null
          budget_min?: number | null
          category_budgets?: Json | null
          created_at?: string
          height_inches?: number | null
          id?: string
          manual_measurements?: Json | null
          occasions?: string[] | null
          recalibration_cadence?: string | null
          selected_visual_cues?: string[] | null
          shopping_preference?: string | null
          silhouette_type?: string | null
          updated_at?: string
          user_id?: string
          vibe_description?: string | null
        }
        Relationships: []
      }
      weekly_plans: {
        Row: {
          city: string
          created_at: string
          id: string
          user_id: string
          week_start: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          user_id: string
          week_start: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
