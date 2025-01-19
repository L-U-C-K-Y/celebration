export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          celebration_id: string | null
          content: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_early_bird: boolean | null
          type: string
        }
        Insert: {
          celebration_id?: string | null
          content: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_early_bird?: boolean | null
          type: string
        }
        Update: {
          celebration_id?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_early_bird?: boolean | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_celebration_id_fkey"
            columns: ["celebration_id"]
            isOneToOne: false
            referencedRelation: "celebrations"
            referencedColumns: ["id"]
          },
        ]
      }
      celebrations: {
        Row: {
          allow_downloads: boolean | null
          allow_sharing: boolean | null
          background_music_url: string | null
          celebrant_birth_date: string | null
          celebrant_name: string | null
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          event_id: string | null
          id: string
          image_url: string | null
          is_public: boolean | null
          location: string | null
          require_approval: boolean | null
          theme_colors: Json | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          allow_downloads?: boolean | null
          allow_sharing?: boolean | null
          background_music_url?: string | null
          celebrant_birth_date?: string | null
          celebrant_name?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          event_id?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          location?: string | null
          require_approval?: boolean | null
          theme_colors?: Json | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_downloads?: boolean | null
          allow_sharing?: boolean | null
          background_music_url?: string | null
          celebrant_birth_date?: string | null
          celebrant_name?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          event_id?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          location?: string | null
          require_approval?: boolean | null
          theme_colors?: Json | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "celebrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reminders: {
        Row: {
          created_at: string | null
          days_before: number
          event_id: string | null
          id: string
          notification_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_before: number
          event_id?: string | null
          id?: string
          notification_type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_before?: number
          event_id?: string | null
          id?: string
          notification_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          is_recurring: boolean | null
          recurrence_day_of_month: number | null
          recurrence_days: number[] | null
          recurrence_end_date: string | null
          recurrence_interval: number | null
          recurrence_pattern: string | null
          recurrence_week_of_month: number | null
          reminder_days: number | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          is_recurring?: boolean | null
          recurrence_day_of_month?: number | null
          recurrence_days?: number[] | null
          recurrence_end_date?: string | null
          recurrence_interval?: number | null
          recurrence_pattern?: string | null
          recurrence_week_of_month?: number | null
          reminder_days?: number | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          is_recurring?: boolean | null
          recurrence_day_of_month?: number | null
          recurrence_days?: number[] | null
          recurrence_end_date?: string | null
          recurrence_interval?: number | null
          recurrence_pattern?: string | null
          recurrence_week_of_month?: number | null
          reminder_days?: number | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      media_items: {
        Row: {
          activity_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          media_type: string
          metadata: Json | null
          processing_status: string | null
          storage_path: string
          updated_at: string | null
        }
        Insert: {
          activity_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          media_type: string
          metadata?: Json | null
          processing_status?: string | null
          storage_path: string
          updated_at?: string | null
        }
        Update: {
          activity_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          media_type?: string
          metadata?: Json | null
          processing_status?: string | null
          storage_path?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_items_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          activity_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          type: string
        }
        Insert: {
          activity_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          type: string
        }
        Update: {
          activity_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      expanded_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string | null
          id: string | null
          is_recurring: boolean | null
          reminder_days: number | null
          title: string | null
          type: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_recurring_event_instances: {
        Args: {
          start_date: string
          end_date: string
          pattern: string
          interval_val: number
          rec_end_date?: string
          rec_days?: number[]
          day_of_month?: number
          week_of_month?: number
        }
        Returns: {
          instance_date: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
