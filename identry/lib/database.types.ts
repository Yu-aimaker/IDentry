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
      career: {
        Row: {
          company: string
          created_at: string
          id: string
          period: string | null
          position: string | null
          profile_id: string | null
        }
        Insert: {
          company: string
          created_at?: string
          id?: string
          period?: string | null
          position?: string | null
          profile_id?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          id?: string
          period?: string | null
          position?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      education: {
        Row: {
          created_at: string
          degree: string | null
          id: string
          profile_id: string | null
          school: string
          year: string | null
        }
        Insert: {
          created_at?: string
          degree?: string | null
          id?: string
          profile_id?: string | null
          school: string
          year?: string | null
        }
        Update: {
          created_at?: string
          degree?: string | null
          id?: string
          profile_id?: string | null
          school?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image: string | null
          profile_id: string | null
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          profile_id?: string | null
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          profile_id?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          banner_image: string | null
          bio: string | null
          birth_date: string | null
          birth_day: string | null
          birth_month: string | null
          birth_year: string | null
          created_at: string
          gender: string | null
          github: string | null
          google_avatar_url: string | null
          id: string
          instagram: string | null
          is_public: boolean | null
          linkedin: string | null
          name: string
          nickname: string | null
          photo: string | null
          profile_url: string | null
          show_career: boolean | null
          show_education: boolean | null
          show_portfolio: boolean | null
          show_skills: boolean | null
          show_sns: boolean | null
          skills: string[] | null
          twitter: string | null
          updated_at: string
          user_id: string | null
          views_count: number | null
          custom_id: string | null
        }
        Insert: {
          address?: string | null
          banner_image?: string | null
          bio?: string | null
          birth_date?: string | null
          birth_day?: string | null
          birth_month?: string | null
          birth_year?: string | null
          created_at?: string
          gender?: string | null
          github?: string | null
          google_avatar_url?: string | null
          id?: string
          instagram?: string | null
          is_public?: boolean | null
          linkedin?: string | null
          name: string
          nickname?: string | null
          photo?: string | null
          profile_url?: string | null
          show_career?: boolean | null
          show_education?: boolean | null
          show_portfolio?: boolean | null
          show_skills?: boolean | null
          show_sns?: boolean | null
          skills?: string[] | null
          twitter?: string | null
          updated_at?: string
          user_id?: string | null
          views_count?: number | null
          custom_id?: string | null
        }
        Update: {
          address?: string | null
          banner_image?: string | null
          bio?: string | null
          birth_date?: string | null
          birth_day?: string | null
          birth_month?: string | null
          birth_year?: string | null
          created_at?: string
          gender?: string | null
          github?: string | null
          google_avatar_url?: string | null
          id?: string
          instagram?: string | null
          is_public?: boolean | null
          linkedin?: string | null
          name?: string
          nickname?: string | null
          photo?: string | null
          profile_url?: string | null
          show_career?: boolean | null
          show_education?: boolean | null
          show_portfolio?: boolean | null
          show_skills?: boolean | null
          show_sns?: boolean | null
          skills?: string[] | null
          twitter?: string | null
          updated_at?: string
          user_id?: string | null
          views_count?: number | null
          custom_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_profile_views: {
        Args: { profile_id: string }
        Returns: undefined
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
  public: {
    Enums: {},
  },
} as const
