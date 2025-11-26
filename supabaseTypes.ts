export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      books: {
        Row: {
          cover_url: string | null
          created_at: string | null
          current_page: number | null
          id: string
          isbn: string | null
          last_reminded_at: string | null
          rating: number | null
          reminded_on_date: string | null
          reminder_days_of_week: number[] | null
          reminder_enabled: boolean | null
          reminder_frequency: string | null
          reminder_hour: number | null
          reminder_interval_days: number | null
          reminder_minute: number | null
          reminder_mode: string | null
          reminder_time: string | null
          review: string | null
          status: string | null
          title: string
          total_pages: number | null
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          current_page?: number | null
          id?: string
          isbn?: string | null
          last_reminded_at?: string | null
          rating?: number | null
          reminded_on_date?: string | null
          reminder_days_of_week?: number[] | null
          reminder_enabled?: boolean | null
          reminder_frequency?: string | null
          reminder_hour?: number | null
          reminder_interval_days?: number | null
          reminder_minute?: number | null
          reminder_mode?: string | null
          reminder_time?: string | null
          review?: string | null
          status?: string | null
          title: string
          total_pages?: number | null
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          current_page?: number | null
          id?: string
          isbn?: string | null
          last_reminded_at?: string | null
          rating?: number | null
          reminded_on_date?: string | null
          reminder_days_of_week?: number[] | null
          reminder_enabled?: boolean | null
          reminder_frequency?: string | null
          reminder_hour?: number | null
          reminder_interval_days?: number | null
          reminder_minute?: number | null
          reminder_mode?: string | null
          reminder_time?: string | null
          review?: string | null
          status?: string | null
          title?: string
          total_pages?: number | null
          user_id?: string
        }
        Relationships: []
      }
      reminder_logs: {
        Row: {
          attempted_at: string
          book_id: string
          error: string | null
          id: string
          idempotency_key: string | null
          schedule_date: string
          scheduled_for: string
          status: Database["public"]["Enums"]["reminder_attempt_status"]
          user_id: string
        }
        Insert: {
          attempted_at?: string
          book_id: string
          error?: string | null
          id?: string
          idempotency_key?: string | null
          schedule_date: string
          scheduled_for: string
          status: Database["public"]["Enums"]["reminder_attempt_status"]
          user_id: string
        }
        Update: {
          attempted_at?: string
          book_id?: string
          error?: string | null
          id?: string
          idempotency_key?: string | null
          schedule_date?: string
          scheduled_for?: string
          status?: Database["public"]["Enums"]["reminder_attempt_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_reminder_logs_recent: {
        Row: {
          attempted_at: string | null
          book_id: string | null
          email: string | null
          error: string | null
          id: string | null
          idempotency_key: string | null
          schedule_date: string | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["reminder_attempt_status"] | null
          title: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_reminders_today: {
        Row: {
          book_id: string | null
          days_since_last: number | null
          due_today: boolean | null
          email: string | null
          is_reminded_today: boolean | null
          last_reminded_at: string | null
          reached_time: boolean | null
          reminded_on_date: string | null
          reminder_days_of_week: number[] | null
          reminder_enabled: boolean | null
          reminder_hour: number | null
          reminder_interval_days: number | null
          reminder_minute: number | null
          reminder_mode: string | null
          scheduled_for_shanghai: string | null
          title: string | null
          user_id: string | null
          w: number | null
        }
        Relationships: []
      }
      v_user_book_reminders: {
        Row: {
          book_id: string | null
          email: string | null
          last_reminded_at: string | null
          reminded_on_date: string | null
          reminder_days_of_week: number[] | null
          reminder_enabled: boolean | null
          reminder_hour: number | null
          reminder_interval_days: number | null
          reminder_minute: number | null
          reminder_mode: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: { [_ in never]: never }
    Enums: {
      reminder_attempt_status: | "sent" | "skipped_no_key" | "skipped_no_email" | "error"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) 
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]) 
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]) [TableName] extends { Row: infer R } 
    ? R : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) 
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"]) [DefaultSchemaTableNameOrOptions] extends { Row: infer R } 
      ? R : never 
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends | keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I } 
    ? I : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] 
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I } 
      ? I : never 
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends | keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U } 
    ? U : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] 
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U } 
      ? U : never 
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends | keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] 
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions] 
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends | keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"] : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] 
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions] 
    : never

export const Constants = {
  public: {
    Enums: {
      reminder_attempt_status: [
        "sent",
        "skipped_no_key",
        "skipped_no_email",
        "error",
      ],
    },
  },
} as const
