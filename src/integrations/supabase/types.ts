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
      evidence_automation_state: {
        Row: {
          cron_token: string
          id: number
          last_result: Json | null
          last_run_at: string | null
          locked_until: string | null
          paused_at: string | null
          paused_reason: string | null
          updated_at: string
        }
        Insert: {
          cron_token?: string
          id?: number
          last_result?: Json | null
          last_run_at?: string | null
          locked_until?: string | null
          paused_at?: string | null
          paused_reason?: string | null
          updated_at?: string
        }
        Update: {
          cron_token?: string
          id?: number
          last_result?: Json | null
          last_run_at?: string | null
          locked_until?: string | null
          paused_at?: string | null
          paused_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      external_mentions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author: string | null
          canonical_url: string | null
          created_at: string
          excluded_reason: string | null
          hotel_id: string
          id: string
          is_about_pool: boolean | null
          is_positive: boolean | null
          notes: string | null
          publication: string | null
          published_at: string | null
          tier: string | null
          updated_at: string
          url: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          canonical_url?: string | null
          created_at?: string
          excluded_reason?: string | null
          hotel_id: string
          id?: string
          is_about_pool?: boolean | null
          is_positive?: boolean | null
          notes?: string | null
          publication?: string | null
          published_at?: string | null
          tier?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          canonical_url?: string | null
          created_at?: string
          excluded_reason?: string | null
          hotel_id?: string
          id?: string
          is_about_pool?: boolean | null
          is_positive?: boolean | null
          notes?: string | null
          publication?: string | null
          published_at?: string | null
          tier?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_mentions_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_mentions_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "public_hotels_view"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_photos: {
        Row: {
          alt_text: string | null
          attribution: string | null
          created_at: string
          height: number | null
          hotel_id: string
          id: string
          image_credit: string | null
          image_license: string | null
          image_owner: string | null
          image_source: string | null
          is_outdoor: boolean | null
          is_pool: boolean | null
          license_source: string | null
          permission_status: string | null
          pool_score: number | null
          position: number
          source: string
          source_url: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          attribution?: string | null
          created_at?: string
          height?: number | null
          hotel_id: string
          id?: string
          image_credit?: string | null
          image_license?: string | null
          image_owner?: string | null
          image_source?: string | null
          is_outdoor?: boolean | null
          is_pool?: boolean | null
          license_source?: string | null
          permission_status?: string | null
          pool_score?: number | null
          position?: number
          source: string
          source_url?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          attribution?: string | null
          created_at?: string
          height?: number | null
          hotel_id?: string
          id?: string
          image_credit?: string | null
          image_license?: string | null
          image_owner?: string | null
          image_source?: string | null
          is_outdoor?: boolean | null
          is_pool?: boolean | null
          license_source?: string | null
          permission_status?: string | null
          pool_score?: number | null
          position?: number
          source?: string
          source_url?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_photos_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_photos_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "public_hotels_view"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_pools: {
        Row: {
          adults_only: boolean | null
          approximate_size: string | null
          area_sqm: number | null
          children_allowed: boolean | null
          created_at: string
          day_pass: boolean | null
          evidence: Json
          existence_state: string
          fact_status: Database["public"]["Enums"]["pool_fact_status"]
          guest_access: string | null
          heated: boolean | null
          heated_months: string | null
          heating_state: string
          heating_status: string | null
          hotel_id: string
          id: string
          indoor: boolean | null
          infinity_edge: boolean | null
          last_verified: string | null
          length_metres: number | null
          opening_hours: string | null
          outdoor: boolean | null
          pool_category: Database["public"]["Enums"]["pool_category"]
          pool_name: string | null
          position: number
          rooftop: boolean | null
          saltwater: boolean | null
          season_state: string
          seasonal_dates: string | null
          shared_or_private: string
          size_source_url: string | null
          size_verified: boolean
          source_urls: Json
          updated_at: string
          view: string | null
          year_round: boolean | null
        }
        Insert: {
          adults_only?: boolean | null
          approximate_size?: string | null
          area_sqm?: number | null
          children_allowed?: boolean | null
          created_at?: string
          day_pass?: boolean | null
          evidence?: Json
          existence_state?: string
          fact_status?: Database["public"]["Enums"]["pool_fact_status"]
          guest_access?: string | null
          heated?: boolean | null
          heated_months?: string | null
          heating_state?: string
          heating_status?: string | null
          hotel_id: string
          id?: string
          indoor?: boolean | null
          infinity_edge?: boolean | null
          last_verified?: string | null
          length_metres?: number | null
          opening_hours?: string | null
          outdoor?: boolean | null
          pool_category?: Database["public"]["Enums"]["pool_category"]
          pool_name?: string | null
          position?: number
          rooftop?: boolean | null
          saltwater?: boolean | null
          season_state?: string
          seasonal_dates?: string | null
          shared_or_private?: string
          size_source_url?: string | null
          size_verified?: boolean
          source_urls?: Json
          updated_at?: string
          view?: string | null
          year_round?: boolean | null
        }
        Update: {
          adults_only?: boolean | null
          approximate_size?: string | null
          area_sqm?: number | null
          children_allowed?: boolean | null
          created_at?: string
          day_pass?: boolean | null
          evidence?: Json
          existence_state?: string
          fact_status?: Database["public"]["Enums"]["pool_fact_status"]
          guest_access?: string | null
          heated?: boolean | null
          heated_months?: string | null
          heating_state?: string
          heating_status?: string | null
          hotel_id?: string
          id?: string
          indoor?: boolean | null
          infinity_edge?: boolean | null
          last_verified?: string | null
          length_metres?: number | null
          opening_hours?: string | null
          outdoor?: boolean | null
          pool_category?: Database["public"]["Enums"]["pool_category"]
          pool_name?: string | null
          position?: number
          rooftop?: boolean | null
          saltwater?: boolean | null
          season_state?: string
          seasonal_dates?: string | null
          shared_or_private?: string
          size_source_url?: string | null
          size_verified?: boolean
          source_urls?: Json
          updated_at?: string
          view?: string | null
          year_round?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_pools_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_pools_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "public_hotels_view"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          address: string | null
          adults_only: boolean | null
          affiliate_url: string | null
          amenities: Json | null
          beachfront: boolean | null
          best_time_to_visit: string | null
          booking_url: string | null
          canonical_hotel_id: string | null
          children_allowed: boolean | null
          city: string
          city_slug: string
          country: string
          cover_image_url: string | null
          created_at: string
          day_pass_available: boolean | null
          distance_to_beach_m: number | null
          editorial_notes: string | null
          editorial_status: Database["public"]["Enums"]["editorial_status"]
          fact_verification: Json | null
          family_friendly: boolean | null
          guest_only: boolean | null
          has_active_pool: boolean | null
          has_pool: boolean | null
          heated_pool: boolean | null
          hotel_status: Database["public"]["Enums"]["hotel_status"]
          id: string
          indoor: boolean | null
          infinity: boolean | null
          is_published: boolean
          last_verified_date: string | null
          latitude: number | null
          longitude: number | null
          lounging_space: string | null
          name: string
          neighborhood: string | null
          official_url: string | null
          outdoor: boolean | null
          party_level: number | null
          pool_count: number | null
          pool_floor: number | null
          pool_opening_hours: string | null
          pool_setting: string | null
          pool_size: string | null
          pool_status: Database["public"]["Enums"]["hotel_pool_status"]
          pool_type: string | null
          pool_verification_notes: string | null
          pool_verified_at: string | null
          pool_view: string | null
          previous_names: string[] | null
          price_from_eur: number | null
          primary_source_url: string | null
          qa_blocked: boolean
          qa_blocked_reasons: Json
          qa_checked_at: string | null
          quiet_party_level: number | null
          rank_position: number | null
          ranking_eligible: boolean
          rooftop: boolean | null
          saltwater: boolean | null
          score_approved_at: string | null
          score_approved_by: string | null
          score_last_updated: string | null
          score_updated_at: string | null
          score_version: string | null
          scrape_website: boolean
          season: string | null
          secondary_source_url: string | null
          slug: string
          sources: Json | null
          tags: string[] | null
          updated_at: string
          verification_method: string | null
          verification_notes: string | null
          verification_sources: Json | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_by: string | null
          vibe: string | null
          view_description: string | null
          view_type: string | null
          website_url: string | null
          why_included: string | null
          why_not_higher: string | null
          year_round: boolean | null
        }
        Insert: {
          address?: string | null
          adults_only?: boolean | null
          affiliate_url?: string | null
          amenities?: Json | null
          beachfront?: boolean | null
          best_time_to_visit?: string | null
          booking_url?: string | null
          canonical_hotel_id?: string | null
          children_allowed?: boolean | null
          city: string
          city_slug: string
          country: string
          cover_image_url?: string | null
          created_at?: string
          day_pass_available?: boolean | null
          distance_to_beach_m?: number | null
          editorial_notes?: string | null
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          fact_verification?: Json | null
          family_friendly?: boolean | null
          guest_only?: boolean | null
          has_active_pool?: boolean | null
          has_pool?: boolean | null
          heated_pool?: boolean | null
          hotel_status?: Database["public"]["Enums"]["hotel_status"]
          id?: string
          indoor?: boolean | null
          infinity?: boolean | null
          is_published?: boolean
          last_verified_date?: string | null
          latitude?: number | null
          longitude?: number | null
          lounging_space?: string | null
          name: string
          neighborhood?: string | null
          official_url?: string | null
          outdoor?: boolean | null
          party_level?: number | null
          pool_count?: number | null
          pool_floor?: number | null
          pool_opening_hours?: string | null
          pool_setting?: string | null
          pool_size?: string | null
          pool_status?: Database["public"]["Enums"]["hotel_pool_status"]
          pool_type?: string | null
          pool_verification_notes?: string | null
          pool_verified_at?: string | null
          pool_view?: string | null
          previous_names?: string[] | null
          price_from_eur?: number | null
          primary_source_url?: string | null
          qa_blocked?: boolean
          qa_blocked_reasons?: Json
          qa_checked_at?: string | null
          quiet_party_level?: number | null
          rank_position?: number | null
          ranking_eligible?: boolean
          rooftop?: boolean | null
          saltwater?: boolean | null
          score_approved_at?: string | null
          score_approved_by?: string | null
          score_last_updated?: string | null
          score_updated_at?: string | null
          score_version?: string | null
          scrape_website?: boolean
          season?: string | null
          secondary_source_url?: string | null
          slug: string
          sources?: Json | null
          tags?: string[] | null
          updated_at?: string
          verification_method?: string | null
          verification_notes?: string | null
          verification_sources?: Json | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_by?: string | null
          vibe?: string | null
          view_description?: string | null
          view_type?: string | null
          website_url?: string | null
          why_included?: string | null
          why_not_higher?: string | null
          year_round?: boolean | null
        }
        Update: {
          address?: string | null
          adults_only?: boolean | null
          affiliate_url?: string | null
          amenities?: Json | null
          beachfront?: boolean | null
          best_time_to_visit?: string | null
          booking_url?: string | null
          canonical_hotel_id?: string | null
          children_allowed?: boolean | null
          city?: string
          city_slug?: string
          country?: string
          cover_image_url?: string | null
          created_at?: string
          day_pass_available?: boolean | null
          distance_to_beach_m?: number | null
          editorial_notes?: string | null
          editorial_status?: Database["public"]["Enums"]["editorial_status"]
          fact_verification?: Json | null
          family_friendly?: boolean | null
          guest_only?: boolean | null
          has_active_pool?: boolean | null
          has_pool?: boolean | null
          heated_pool?: boolean | null
          hotel_status?: Database["public"]["Enums"]["hotel_status"]
          id?: string
          indoor?: boolean | null
          infinity?: boolean | null
          is_published?: boolean
          last_verified_date?: string | null
          latitude?: number | null
          longitude?: number | null
          lounging_space?: string | null
          name?: string
          neighborhood?: string | null
          official_url?: string | null
          outdoor?: boolean | null
          party_level?: number | null
          pool_count?: number | null
          pool_floor?: number | null
          pool_opening_hours?: string | null
          pool_setting?: string | null
          pool_size?: string | null
          pool_status?: Database["public"]["Enums"]["hotel_pool_status"]
          pool_type?: string | null
          pool_verification_notes?: string | null
          pool_verified_at?: string | null
          pool_view?: string | null
          previous_names?: string[] | null
          price_from_eur?: number | null
          primary_source_url?: string | null
          qa_blocked?: boolean
          qa_blocked_reasons?: Json
          qa_checked_at?: string | null
          quiet_party_level?: number | null
          rank_position?: number | null
          ranking_eligible?: boolean
          rooftop?: boolean | null
          saltwater?: boolean | null
          score_approved_at?: string | null
          score_approved_by?: string | null
          score_last_updated?: string | null
          score_updated_at?: string | null
          score_version?: string | null
          scrape_website?: boolean
          season?: string | null
          secondary_source_url?: string | null
          slug?: string
          sources?: Json | null
          tags?: string[] | null
          updated_at?: string
          verification_method?: string | null
          verification_notes?: string | null
          verification_sources?: Json | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_by?: string | null
          vibe?: string | null
          view_description?: string | null
          view_type?: string | null
          website_url?: string | null
          why_included?: string | null
          why_not_higher?: string | null
          year_round?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "hotels_canonical_hotel_id_fkey"
            columns: ["canonical_hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotels_canonical_hotel_id_fkey"
            columns: ["canonical_hotel_id"]
            isOneToOne: false
            referencedRelation: "public_hotels_view"
            referencedColumns: ["id"]
          },
        ]
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
      pool_comments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author: string | null
          created_at: string
          editor_relevance: string | null
          editor_sentiment: string | null
          excluded_reason: string | null
          hotel_id: string
          id: string
          is_duplicate_of: string | null
          is_owner_content: boolean
          normalized_text: string
          published_at: string | null
          raw_text: string
          relevance: string
          sentiment: string
          source: string
          source_url: string | null
          stay_group_key: string | null
          text_hash: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          created_at?: string
          editor_relevance?: string | null
          editor_sentiment?: string | null
          excluded_reason?: string | null
          hotel_id: string
          id?: string
          is_duplicate_of?: string | null
          is_owner_content?: boolean
          normalized_text: string
          published_at?: string | null
          raw_text: string
          relevance?: string
          sentiment?: string
          source: string
          source_url?: string | null
          stay_group_key?: string | null
          text_hash: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          created_at?: string
          editor_relevance?: string | null
          editor_sentiment?: string | null
          excluded_reason?: string | null
          hotel_id?: string
          id?: string
          is_duplicate_of?: string | null
          is_owner_content?: boolean
          normalized_text?: string
          published_at?: string | null
          raw_text?: string
          relevance?: string
          sentiment?: string
          source?: string
          source_url?: string | null
          stay_group_key?: string | null
          text_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_comments_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_comments_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "public_hotels_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_comments_is_duplicate_of_fkey"
            columns: ["is_duplicate_of"]
            isOneToOne: false
            referencedRelation: "pool_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_quotes: {
        Row: {
          author: string | null
          created_at: string
          hotel_id: string
          id: string
          position: number
          quote: string
          source: string
          source_url: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          hotel_id: string
          id?: string
          position?: number
          quote: string
          source: string
          source_url?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string
          hotel_id?: string
          id?: string
          position?: number
          quote?: string
          source?: string
          source_url?: string | null
        }
        Relationships: []
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
      pool_scores_evidence: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          blocking_reasons: Json
          calculated_at: string
          confidence_level: string
          created_at: string
          external_recognition_points: number | null
          guest_sentiment_points: number | null
          heating_points: number | null
          hotel_id: string
          inputs: Json
          pool_count_points: number | null
          pool_size_points: number | null
          score_out_of_ten: number | null
          score_version: string
          total_points: number | null
          updated_at: string
          verification_status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          blocking_reasons?: Json
          calculated_at?: string
          confidence_level?: string
          created_at?: string
          external_recognition_points?: number | null
          guest_sentiment_points?: number | null
          heating_points?: number | null
          hotel_id: string
          inputs?: Json
          pool_count_points?: number | null
          pool_size_points?: number | null
          score_out_of_ten?: number | null
          score_version?: string
          total_points?: number | null
          updated_at?: string
          verification_status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          blocking_reasons?: Json
          calculated_at?: string
          confidence_level?: string
          created_at?: string
          external_recognition_points?: number | null
          guest_sentiment_points?: number | null
          heating_points?: number | null
          hotel_id?: string
          inputs?: Json
          pool_count_points?: number | null
          pool_size_points?: number | null
          score_out_of_ten?: number | null
          score_version?: string
          total_points?: number | null
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_scores_evidence_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: true
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_scores_evidence_hotel_id_fkey"
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      hotel_pool_summary: {
        Row: {
          all_adults_only: boolean | null
          any_children_allowed: boolean | null
          any_day_pass: boolean | null
          any_heated: boolean | null
          any_indoor: boolean | null
          any_infinity: boolean | null
          any_outdoor: boolean | null
          any_rooftop: boolean | null
          any_saltwater: boolean | null
          any_year_round: boolean | null
          documented_pool_areas: number | null
          heated_state: string | null
          hotel_id: string | null
          jacuzzi_count: number | null
          kids_pool_count: number | null
          plunge_pool_count: number | null
          pools_last_verified: string | null
          private_pool_count: number | null
          season_state: string | null
          shared_pool_count: number | null
          spa_pool_count: number | null
          swim_up_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_pools_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_pools_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "public_hotels_view"
            referencedColumns: ["id"]
          },
        ]
      }
      public_hotels_view: {
        Row: {
          adults_only: boolean | null
          affiliate_url: string | null
          beachfront: boolean | null
          best_time: string | null
          best_time_to_visit: string | null
          booking_url: string | null
          canonical_hotel_id: string | null
          children_allowed: boolean | null
          city: string | null
          city_slug: string | null
          confidence_0_100: number | null
          country: string | null
          cover_image_url: string | null
          day_pass_available: boolean | null
          distance_to_beach_m: number | null
          documented_pool_areas: number | null
          editorial_notes: string | null
          editorial_status:
            | Database["public"]["Enums"]["editorial_status"]
            | null
          fact_verification: Json | null
          family_friendly: boolean | null
          guest_only: boolean | null
          has_active_pool: boolean | null
          has_pool: boolean | null
          heated_pool: boolean | null
          heated_state: string | null
          hotel_status: Database["public"]["Enums"]["hotel_status"] | null
          id: string | null
          indoor: boolean | null
          infinity: boolean | null
          jacuzzi_count: number | null
          kids_pool_count: number | null
          last_verified_date: string | null
          lounging_space: string | null
          meta_computed_at: string | null
          meta_rating_0_100: number | null
          name: string | null
          neighborhood: string | null
          official_url: string | null
          outdoor: boolean | null
          plunge_pool_count: number | null
          pool_components: Json | null
          pool_count: number | null
          pool_facts: Json | null
          pool_opening_hours: string | null
          pool_score_0_10: number | null
          pool_score_updated_at: string | null
          pool_setting: string | null
          pool_size: string | null
          pool_status: Database["public"]["Enums"]["hotel_pool_status"] | null
          pool_type: string | null
          pool_verified_at: string | null
          pool_view: string | null
          previous_names: string[] | null
          price_from_eur: number | null
          primary_source_url: string | null
          private_pool_count: number | null
          qa_blocked: boolean | null
          qa_blocked_reasons: Json | null
          qa_checked_at: string | null
          rank_position: number | null
          ranking_eligible: boolean | null
          rooftop: boolean | null
          saltwater: boolean | null
          score_approved_at: string | null
          score_approved_by: string | null
          score_updated_at: string | null
          score_version: string | null
          season: string | null
          season_state: string | null
          secondary_source_url: string | null
          shared_pool_count: number | null
          slug: string | null
          sources_used: Json | null
          spa_pool_count: number | null
          swim_up_count: number | null
          tags: string[] | null
          verification_method: string | null
          verification_notes: string | null
          verification_sources: Json | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_by: string | null
          vibe: string | null
          view_description: string | null
          view_type: string | null
          website_url: string | null
          why_included: string | null
          why_not_higher: string | null
          year_round: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "hotels_canonical_hotel_id_fkey"
            columns: ["canonical_hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotels_canonical_hotel_id_fkey"
            columns: ["canonical_hotel_id"]
            isOneToOne: false
            referencedRelation: "public_hotels_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      derive_hotel_heating: { Args: { _hotel_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      sync_hotel_pool_count: { Args: { _hotel_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      editorial_status: "draft" | "review" | "published"
      hotel_pool_status:
        | "active_pool"
        | "no_pool"
        | "pool_closed"
        | "pool_construction"
        | "unknown"
      hotel_status:
        | "active"
        | "renamed"
        | "temporarily_closed"
        | "permanently_closed"
        | "opening_soon"
        | "unverified"
      pool_category:
        | "shared_hotel_pool"
        | "private_room_pool"
        | "shared_swim_up"
        | "spa_pool"
        | "childrens_pool"
        | "plunge_pool"
        | "jacuzzi"
      pool_fact_status: "research_pending" | "partially_verified" | "verified"
      rating_source: "google" | "tripadvisor" | "booking" | "hotels_com"
      snapshot_status: "ok" | "failed" | "missing_id"
      verification_status:
        | "verified"
        | "partially_verified"
        | "research_pending"
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
      app_role: ["admin", "moderator", "user"],
      editorial_status: ["draft", "review", "published"],
      hotel_pool_status: [
        "active_pool",
        "no_pool",
        "pool_closed",
        "pool_construction",
        "unknown",
      ],
      hotel_status: [
        "active",
        "renamed",
        "temporarily_closed",
        "permanently_closed",
        "opening_soon",
        "unverified",
      ],
      pool_category: [
        "shared_hotel_pool",
        "private_room_pool",
        "shared_swim_up",
        "spa_pool",
        "childrens_pool",
        "plunge_pool",
        "jacuzzi",
      ],
      pool_fact_status: ["research_pending", "partially_verified", "verified"],
      rating_source: ["google", "tripadvisor", "booking", "hotels_com"],
      snapshot_status: ["ok", "failed", "missing_id"],
      verification_status: [
        "verified",
        "partially_verified",
        "research_pending",
      ],
    },
  },
} as const
