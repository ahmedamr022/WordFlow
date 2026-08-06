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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_activity: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          label: string
          meta: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          label?: string
          meta?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          label?: string
          meta?: Json
        }
        Relationships: []
      }
      ai_usage_log: {
        Row: {
          cost_estimate: number
          created_at: string
          id: string
          output_tokens: number
          prompt_tokens: number
          route: string
          user_id: string | null
        }
        Insert: {
          cost_estimate?: number
          created_at?: string
          id?: string
          output_tokens?: number
          prompt_tokens?: number
          route: string
          user_id?: string | null
        }
        Update: {
          cost_estimate?: number
          created_at?: string
          id?: string
          output_tokens?: number
          prompt_tokens?: number
          route?: string
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          description_ar: string
          icon: string
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description_ar?: string
          icon?: string
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description_ar?: string
          icon?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      category_words: {
        Row: {
          category_id: string
          created_at: string
          sort_order: number
          word_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          sort_order?: number
          word_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          sort_order?: number
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_words_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          description_ar: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          period: Database["public"]["Enums"]["challenge_period"]
          slug: string
          starts_at: string
          target_value: number
          title_ar: string
          type: Database["public"]["Enums"]["challenge_type"]
          updated_at: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          period?: Database["public"]["Enums"]["challenge_period"]
          slug: string
          starts_at?: string
          target_value: number
          title_ar: string
          type: Database["public"]["Enums"]["challenge_type"]
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          period?: Database["public"]["Enums"]["challenge_period"]
          slug?: string
          starts_at?: string
          target_value?: number
          title_ar?: string
          type?: Database["public"]["Enums"]["challenge_type"]
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      courses: {
        Row: {
          cefr_level: Database["public"]["Enums"]["cefr_level"]
          cover_image: string | null
          created_at: string
          description_ar: string | null
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          cefr_level?: Database["public"]["Enums"]["cefr_level"]
          cover_image?: string | null
          created_at?: string
          description_ar?: string | null
          id?: string
          is_published?: boolean
          slug: string
          sort_order?: number
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          cefr_level?: Database["public"]["Enums"]["cefr_level"]
          cover_image?: string | null
          created_at?: string
          description_ar?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      placement_tests: {
        Row: {
          answers: Json
          created_at: string
          id: string
          resulting_level: Database["public"]["Enums"]["cefr_level"]
          score: number
          taken_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          resulting_level: Database["public"]["Enums"]["cefr_level"]
          score?: number
          taken_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          resulting_level?: Database["public"]["Enums"]["cefr_level"]
          score?: number
          taken_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          english_level: Database["public"]["Enums"]["cefr_level"] | null
          id: string
          interface_language: string
          last_active_at: string | null
          last_seen_at: string | null
          native_language: string | null
          nickname: string | null
          onboarding_completed_at: string | null
          role: string
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          english_level?: Database["public"]["Enums"]["cefr_level"] | null
          id: string
          interface_language?: string
          last_active_at?: string | null
          last_seen_at?: string | null
          native_language?: string | null
          nickname?: string | null
          onboarding_completed_at?: string | null
          role?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          english_level?: Database["public"]["Enums"]["cefr_level"] | null
          id?: string
          interface_language?: string
          last_active_at?: string | null
          last_seen_at?: string | null
          native_language?: string | null
          nickname?: string | null
          onboarding_completed_at?: string | null
          role?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          key: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          key: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          created_at?: string
          key?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          access: Json
          appearance: Json
          bg_image: string | null
          category_id: string | null
          cefr_level: Database["public"]["Enums"]["cefr_level"]
          course_id: string | null
          cover_image: string | null
          created_at: string
          deleted_at: string | null
          description_ar: string | null
          description_en: string | null
          difficulty: string
          draft: Json | null
          estimated_minutes: number
          id: string
          is_premium: boolean
          is_published: boolean
          seo: Json
          slug: string
          sort_order: number
          status: string
          title_ar: string
          title_en: string
          total_lines: number
          total_words: number
          updated_at: string
          updated_by: string | null
          views: number
          xp_reward: number
        }
        Insert: {
          access?: Json
          appearance?: Json
          bg_image?: string | null
          category_id?: string | null
          cefr_level?: Database["public"]["Enums"]["cefr_level"]
          course_id?: string | null
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          difficulty?: string
          draft?: Json | null
          estimated_minutes?: number
          id?: string
          is_premium?: boolean
          is_published?: boolean
          seo?: Json
          slug: string
          sort_order?: number
          status?: string
          title_ar: string
          title_en: string
          total_lines?: number
          total_words?: number
          updated_at?: string
          updated_by?: string | null
          views?: number
          xp_reward?: number
        }
        Update: {
          access?: Json
          appearance?: Json
          bg_image?: string | null
          category_id?: string | null
          cefr_level?: Database["public"]["Enums"]["cefr_level"]
          course_id?: string | null
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          difficulty?: string
          draft?: Json | null
          estimated_minutes?: number
          id?: string
          is_premium?: boolean
          is_published?: boolean
          seo?: Json
          slug?: string
          sort_order?: number
          status?: string
          title_ar?: string
          title_en?: string
          total_lines?: number
          total_words?: number
          updated_at?: string
          updated_by?: string | null
          views?: number
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "stories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      story_line_words: {
        Row: {
          created_at: string
          line_id: string
          word_id: string
          word_index: number
        }
        Insert: {
          created_at?: string
          line_id: string
          word_id: string
          word_index: number
        }
        Update: {
          created_at?: string
          line_id?: string
          word_id?: string
          word_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "story_line_words_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "story_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_line_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      story_lines: {
        Row: {
          audio_url: string | null
          char_count: number | null
          created_at: string
          id: string
          level: string | null
          line_index: number
          story_id: string
          text: string
          translation_ar: string | null
          updated_at: string
          vocabulary: Json
        }
        Insert: {
          audio_url?: string | null
          char_count?: number | null
          created_at?: string
          id?: string
          level?: string | null
          line_index: number
          story_id: string
          text: string
          translation_ar?: string | null
          updated_at?: string
          vocabulary?: Json
        }
        Update: {
          audio_url?: string | null
          char_count?: number | null
          created_at?: string
          id?: string
          level?: string | null
          line_index?: number
          story_id?: string
          text?: string
          translation_ar?: string | null
          updated_at?: string
          vocabulary?: Json
        }
        Relationships: [
          {
            foreignKeyName: "story_lines_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_media: {
        Row: {
          bytes: number | null
          created_at: string
          created_by: string | null
          height: number | null
          id: string
          mime: string | null
          role: string
          sort_order: number
          story_id: string | null
          url: string
          width: number | null
        }
        Insert: {
          bytes?: number | null
          created_at?: string
          created_by?: string | null
          height?: number | null
          id?: string
          mime?: string | null
          role?: string
          sort_order?: number
          story_id?: string | null
          url: string
          width?: number | null
        }
        Update: {
          bytes?: number | null
          created_at?: string
          created_by?: string | null
          height?: number | null
          id?: string
          mime?: string | null
          role?: string
          sort_order?: number
          story_id?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "story_media_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          snapshot: Json
          story_id: string
          summary: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          snapshot: Json
          story_id: string
          summary?: string
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          snapshot?: Json
          story_id?: string
          summary?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "story_versions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          current_value: number
          reward_claimed_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          reward_claimed_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          reward_claimed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_activity: {
        Row: {
          activity_date: string
          created_at: string
          lines_typed: number
          minutes_spent: number
          stories_completed: number
          updated_at: string
          user_id: string
          words_reviewed: number
          xp_earned: number
        }
        Insert: {
          activity_date: string
          created_at?: string
          lines_typed?: number
          minutes_spent?: number
          stories_completed?: number
          updated_at?: string
          user_id: string
          words_reviewed?: number
          xp_earned?: number
        }
        Update: {
          activity_date?: string
          created_at?: string
          lines_typed?: number
          minutes_spent?: number
          stories_completed?: number
          updated_at?: string
          user_id?: string
          words_reviewed?: number
          xp_earned?: number
        }
        Relationships: []
      }
      user_line_attempts: {
        Row: {
          accuracy: number
          correct_chars: number
          created_at: string
          id: string
          incorrect_chars: number
          line_id: string
          rejected: boolean
          rejection_reason: string | null
          story_id: string
          time_spent_seconds: number
          total_chars: number
          user_id: string
          wpm: number
        }
        Insert: {
          accuracy: number
          correct_chars?: number
          created_at?: string
          id?: string
          incorrect_chars?: number
          line_id: string
          rejected?: boolean
          rejection_reason?: string | null
          story_id: string
          time_spent_seconds: number
          total_chars?: number
          user_id: string
          wpm: number
        }
        Update: {
          accuracy?: number
          correct_chars?: number
          created_at?: string
          id?: string
          incorrect_chars?: number
          line_id?: string
          rejected?: boolean
          rejection_reason?: string | null
          story_id?: string
          time_spent_seconds?: number
          total_chars?: number
          user_id?: string
          wpm?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_line_attempts_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "story_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_line_attempts_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          daily_goal_xp: number
          email_notifications: boolean
          playback_speed: number
          sound_enabled: boolean
          theme: string
          updated_at: string
          user_id: string
          voice_id: string | null
        }
        Insert: {
          created_at?: string
          daily_goal_xp?: number
          email_notifications?: boolean
          playback_speed?: number
          sound_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id: string
          voice_id?: string | null
        }
        Update: {
          created_at?: string
          daily_goal_xp?: number
          email_notifications?: boolean
          playback_speed?: number
          sound_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
          voice_id?: string | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          last_active_date: string | null
          level: number
          longest_streak: number
          stories_completed_count: number
          streak_count: number
          total_time_seconds: number
          updated_at: string
          user_id: string
          words_learned_count: number
          xp_total: number
        }
        Insert: {
          created_at?: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          stories_completed_count?: number
          streak_count?: number
          total_time_seconds?: number
          updated_at?: string
          user_id: string
          words_learned_count?: number
          xp_total?: number
        }
        Update: {
          created_at?: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          stories_completed_count?: number
          streak_count?: number
          total_time_seconds?: number
          updated_at?: string
          user_id?: string
          words_learned_count?: number
          xp_total?: number
        }
        Relationships: []
      }
      user_story_positions: {
        Row: {
          best_accuracy: number | null
          best_wpm: number | null
          completed_at: string | null
          created_at: string
          line_index: number
          lines_completed: number
          story_slug: string
          time_spent_seconds: number
          total_lines: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_accuracy?: number | null
          best_wpm?: number | null
          completed_at?: string | null
          created_at?: string
          line_index?: number
          lines_completed?: number
          story_slug: string
          time_spent_seconds?: number
          total_lines?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_accuracy?: number | null
          best_wpm?: number | null
          completed_at?: string | null
          created_at?: string
          line_index?: number
          lines_completed?: number
          story_slug?: string
          time_spent_seconds?: number
          total_lines?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_story_progress: {
        Row: {
          best_accuracy: number | null
          best_wpm: number | null
          completed_at: string | null
          created_at: string
          current_line_index: number
          lines_completed: number
          started_at: string | null
          status: Database["public"]["Enums"]["story_status"]
          story_id: string
          time_spent_seconds: number
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          best_accuracy?: number | null
          best_wpm?: number | null
          completed_at?: string | null
          created_at?: string
          current_line_index?: number
          lines_completed?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["story_status"]
          story_id: string
          time_spent_seconds?: number
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          best_accuracy?: number | null
          best_wpm?: number | null
          completed_at?: string | null
          created_at?: string
          current_line_index?: number
          lines_completed?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["story_status"]
          story_id?: string
          time_spent_seconds?: number
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_story_progress_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_word_progress: {
        Row: {
          correct_count: number
          created_at: string
          ease_factor: number
          incorrect_count: number
          interval_days: number
          last_reviewed_at: string | null
          next_review_at: string | null
          repetitions: number
          status: Database["public"]["Enums"]["word_status"]
          updated_at: string
          user_id: string
          word_id: string
        }
        Insert: {
          correct_count?: number
          created_at?: string
          ease_factor?: number
          incorrect_count?: number
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string | null
          repetitions?: number
          status?: Database["public"]["Enums"]["word_status"]
          updated_at?: string
          user_id: string
          word_id: string
        }
        Update: {
          correct_count?: number
          created_at?: string
          ease_factor?: number
          incorrect_count?: number
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string | null
          repetitions?: number
          status?: Database["public"]["Enums"]["word_status"]
          updated_at?: string
          user_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_word_progress_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_categories: {
        Row: {
          cover_image: string | null
          created_at: string
          description_ar: string | null
          icon: string | null
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description_ar?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          slug: string
          sort_order?: number
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description_ar?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      words: {
        Row: {
          audio_url: string | null
          cefr_level: Database["public"]["Enums"]["cefr_level"]
          created_at: string
          example_ar: string | null
          example_en: string | null
          id: string
          ipa: string | null
          normalized: string | null
          part_of_speech: string
          translation_ar: string
          updated_at: string
          word: string
        }
        Insert: {
          audio_url?: string | null
          cefr_level?: Database["public"]["Enums"]["cefr_level"]
          created_at?: string
          example_ar?: string | null
          example_en?: string | null
          id?: string
          ipa?: string | null
          normalized?: string | null
          part_of_speech?: string
          translation_ar: string
          updated_at?: string
          word: string
        }
        Update: {
          audio_url?: string | null
          cefr_level?: Database["public"]["Enums"]["cefr_level"]
          created_at?: string
          example_ar?: string | null
          example_en?: string | null
          id?: string
          ipa?: string | null
          normalized?: string | null
          part_of_speech?: string
          translation_ar?: string
          updated_at?: string
          word?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          idempotency_key: string
          source_id: string | null
          source_type: Database["public"]["Enums"]["xp_source"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          idempotency_key: string
          source_id?: string | null
          source_type: Database["public"]["Enums"]["xp_source"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          idempotency_key?: string
          source_id?: string | null
          source_type?: Database["public"]["Enums"]["xp_source"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_overview_stats: { Args: never; Returns: Json }
      attach_updated_at: { Args: { target_table: string }; Returns: undefined }
      award_xp: {
        Args: {
          p_amount: number
          p_idempotency_key: string
          p_source_id: string
          p_source_type: Database["public"]["Enums"]["xp_source"]
          p_user_id: string
        }
        Returns: number
      }
      check_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: {
          allowed: boolean
          remaining: number
          retry_after_seconds: number
        }[]
      }
      claim_daily_streak: { Args: { p_user_id: string }; Returns: number }
      complete_story: {
        Args: { p_story_id: string; p_user_id: string }
        Returns: Json
      }
      is_admin: { Args: { p_user_id?: string }; Returns: boolean }
      level_for_xp: { Args: { p_xp: number }; Returns: number }
      next_story_version: { Args: { p_story_id: string }; Returns: number }
      prune_rate_limits: { Args: never; Returns: undefined }
      record_line_attempt: {
        Args: {
          p_accuracy: number
          p_correct: number
          p_incorrect: number
          p_line_id: string
          p_seconds: number
          p_user_id: string
          p_wpm: number
        }
        Returns: Json
      }
      record_word_review: {
        Args: { p_correct: boolean; p_user_id: string; p_word_id: string }
        Returns: Json
      }
      setting_int: {
        Args: { fallback: number; setting_key: string }
        Returns: number
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      touch_daily_activity: {
        Args: {
          p_lines?: number
          p_minutes?: number
          p_stories?: number
          p_user_id: string
          p_words?: number
          p_xp?: number
        }
        Returns: undefined
      }
      upsert_story_position: {
        Args: {
          p_accuracy?: number
          p_completed?: boolean
          p_index_source?: string
          p_line_index: number
          p_lines_completed: number
          p_seconds?: number
          p_story_slug: string
          p_total_lines: number
          p_user_id: string
          p_wpm?: number
        }
        Returns: undefined
      }
      user_local_date: {
        Args: { p_at?: string; p_user_id: string }
        Returns: string
      }
    }
    Enums: {
      cefr_level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
      challenge_period: "daily" | "weekly"
      challenge_type: "xp" | "streak" | "accuracy" | "words" | "stories"
      story_status: "not_started" | "in_progress" | "completed"
      word_status: "new" | "learning" | "learned"
      xp_source:
        | "line"
        | "story"
        | "word"
        | "challenge"
        | "streak"
        | "migration"
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
      cefr_level: ["A1", "A2", "B1", "B2", "C1", "C2"],
      challenge_period: ["daily", "weekly"],
      challenge_type: ["xp", "streak", "accuracy", "words", "stories"],
      story_status: ["not_started", "in_progress", "completed"],
      word_status: ["new", "learning", "learned"],
      xp_source: ["line", "story", "word", "challenge", "streak", "migration"],
    },
  },
} as const

export type CefrLevel = Database["public"]["Enums"]["cefr_level"];
export type StoryStatusValue = "published" | "draft" | "locked";
export type StoryRow = Database["public"]["Tables"]["stories"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];