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
      hotels: {
        Row: {
          address: string | null
          booking_url: string | null
          city: string
          city_slug: string
          country: string
          cover_image_url: string | null
          created_at: string
          id: string
          is_published: boolean
          latitude: number | null
          longitude: number | null
          name: string
          neighborhood: string | null
          rank_position: number | null
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          booking_url?: string | null
          city: string
          city_slug: string
          country: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          neighborhood?: string | null
          rank_position?: number | null
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          booking_url?: string | null
          city?: string
          city_slug?: string
          country?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          neighborhood?: string | null
          rank_position?: number | null
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      meta_scores: {
        Row: {
          computed_at: string
          confidence_0_100: number | null
          hotel_id: string
          meta_rating_0_100: number | null
          notes: string | null
          sources_used: Json | null
        }
        Insert: {
          computed_at?: string
          confidence_0_100?: number | null
          hotel_id: string
          meta_rating_0_100?: number | null
          notes?: string | null
          sources_used?: Json | null
        }
        Update: {
          computed_at?: string
          confidence_0_100?: number | null
          hotel_id?: string
          meta_rating_0_100?: number | null
          notes?: string | null
          sources_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_scores_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: true
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_scores_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: true
            referencedRelation: "public_hotels_view"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_scores: {
        Row: {
          best_time: string | null
          components: Json | null
          editorial_notes: string | null
          facts: Json | null
          hotel_id: string
          pool_score_0_10: number | null
          pool_type: string | null
          updated_at: string
        }
        Insert: {
          best_time?: string | null
          components?: Json | null
          editorial_notes?: string | null
          facts?: Json | null
          hotel_id: string
          pool_score_0_10?: number | null
          pool_type?: string | null
          updated_at?: string
        }
        Update: {
          best_time?: string | null
          components?: Json | null
          editorial_notes?: string | null
          facts?: Json | null
          hotel_id?: string
          pool_score_0_10?: number | null
          pool_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_scores_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: true
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_scores_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: true
            referencedRelation: "public_hotels_view"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_admin: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean
          user_id?: string
        }
        Relationships: []
      }
      ratings_snapshots: {
        Row: {
          captured_at: string
          captured_date: string | null
          error_message: string | null
          hotel_id: string
          id: string
          rating_count: number | null
          rating_scale: number
          rating_value: number | null
          raw_payload: Json | null
          source: Database["public"]["Enums"]["rating_source"]
          status: Database["public"]["Enums"]["snapshot_status"]
        }
        Insert: {
          captured_at?: string
          captured_date?: string | null
          error_message?: string | null
          hotel_id: string
          id?: string
          rating_count?: number | null
          rating_scale?: number
          rating_value?: number | null
          raw_payload?: Json | null
          source: Database["public"]["Enums"]["rating_source"]
          status?: Database["public"]["Enums"]["snapshot_status"]
        }
        Update: {
          captured_at?: string
          captured_date?: string | null
          error_message?: string | null
          hotel_id?: string
          id?: string
          rating_count?: number | null
          rating_scale?: number
          rating_value?: number | null
          raw_payload?: Json | null
          source?: Database["public"]["Enums"]["rating_source"]
          status?: Database["public"]["Enums"]["snapshot_status"]
        }
        Relationships: [
          {
            foreignKeyName: "ratings_snapshots_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_snapshots_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "public_hotels_view"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_settings: {
        Row: {
          id: number
          updated_at: string
          volume_cap: number
          weights: Json
        }
        Insert: {
          id?: number
          updated_at?: string
          volume_cap?: number
          weights?: Json
        }
        Update: {
          id?: number
          updated_at?: string
          volume_cap?: number
          weights?: Json
        }
        Relationships: []
      }
      source_mappings: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          is_active: boolean
          source: Database["public"]["Enums"]["rating_source"]
          source_place_id: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          is_active?: boolean
          source: Database["public"]["Enums"]["rating_source"]
          source_place_id?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          is_active?: boolean
          source?: Database["public"]["Enums"]["rating_source"]
          source_place_id?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_mappings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_mappings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "public_hotels_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_hotels_view: {
        Row: {
          best_time: string | null
          booking_url: string | null
          city: string | null
          city_slug: string | null
          confidence_0_100: number | null
          country: string | null
          cover_image_url: string | null
          editorial_notes: string | null
          id: string | null
          meta_computed_at: string | null
          meta_rating_0_100: number | null
          name: string | null
          neighborhood: string | null
          pool_components: Json | null
          pool_score_0_10: number | null
          pool_score_updated_at: string | null
          pool_type: string | null
          rank_position: number | null
          slug: string | null
          sources_used: Json | null
          website_url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      rating_source: "google" | "tripadvisor" | "booking" | "hotels_com"
      snapshot_status: "ok" | "failed" | "missing_id"
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
    Enums: {
      rating_source: ["google", "tripadvisor", "booking", "hotels_com"],
      snapshot_status: ["ok", "failed", "missing_id"],
    },
  },
} as const
