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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      client_checkins: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          photo_back: string | null
          photo_front: string | null
          photo_side: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          photo_back?: string | null
          photo_front?: string | null
          photo_side?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          photo_back?: string | null
          photo_front?: string | null
          photo_side?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      client_evolutions: {
        Row: {
          body_fat_after: number | null
          body_fat_before: number | null
          created_at: string
          description: string | null
          id: string
          photo_after: string | null
          photo_before: string | null
          title: string
          user_id: string
          weight_after: number | null
          weight_before: number | null
        }
        Insert: {
          body_fat_after?: number | null
          body_fat_before?: number | null
          created_at?: string
          description?: string | null
          id?: string
          photo_after?: string | null
          photo_before?: string | null
          title?: string
          user_id: string
          weight_after?: number | null
          weight_before?: number | null
        }
        Update: {
          body_fat_after?: number | null
          body_fat_before?: number | null
          created_at?: string
          description?: string | null
          id?: string
          photo_after?: string | null
          photo_before?: string | null
          title?: string
          user_id?: string
          weight_after?: number | null
          weight_before?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_evolutions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_feedbacks: {
        Row: {
          created_at: string
          id: string
          message: string
          rating: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          rating: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      client_protocols: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          uploaded_by: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          uploaded_by: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          uploaded_by?: string
          user_id?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          form_data: Json
          id: string
          photo_assessment: string | null
          photo_back: string | null
          photo_front: string | null
          photo_side: string | null
          plan: string | null
          selected_equipment: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          form_data: Json
          id?: string
          photo_assessment?: string | null
          photo_back?: string | null
          photo_front?: string | null
          photo_side?: string | null
          plan?: string | null
          selected_equipment?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          form_data?: Json
          id?: string
          photo_assessment?: string | null
          photo_back?: string | null
          photo_front?: string | null
          photo_side?: string | null
          plan?: string | null
          selected_equipment?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          plan: Database["public"]["Enums"]["user_plan"] | null
          plan_activated_at: string | null
          plan_duration: string | null
          plan_expires_at: string | null
          renewal_starts_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          plan?: Database["public"]["Enums"]["user_plan"] | null
          plan_activated_at?: string | null
          plan_duration?: string | null
          plan_expires_at?: string | null
          renewal_starts_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["user_plan"] | null
          plan_activated_at?: string | null
          plan_duration?: string | null
          plan_expires_at?: string | null
          renewal_starts_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      protocol_exercises: {
        Row: {
          admin_obs: string | null
          client_back_off: string | null
          client_obs: string | null
          client_resultado: string | null
          client_top_set: string | null
          created_at: string
          day_label: string
          exercise_name: string
          id: string
          metodo: string | null
          protocolo_id: string
          sort_order: number
          table_type: string
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          admin_obs?: string | null
          client_back_off?: string | null
          client_obs?: string | null
          client_resultado?: string | null
          client_top_set?: string | null
          created_at?: string
          day_label?: string
          exercise_name?: string
          id?: string
          metodo?: string | null
          protocolo_id: string
          sort_order?: number
          table_type?: string
          updated_at?: string
          user_id: string
          week_number?: number
        }
        Update: {
          admin_obs?: string | null
          client_back_off?: string | null
          client_obs?: string | null
          client_resultado?: string | null
          client_top_set?: string | null
          created_at?: string
          day_label?: string
          exercise_name?: string
          id?: string
          metodo?: string | null
          protocolo_id?: string
          sort_order?: number
          table_type?: string
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "protocol_exercises_protocolo_id_fkey"
            columns: ["protocolo_id"]
            isOneToOne: false
            referencedRelation: "protocolos"
            referencedColumns: ["id"]
          },
        ]
      }
      protocolos: {
        Row: {
          cardio: string
          created_at: string
          id: string
          nome: string
          observacoes: string | null
          plano_alimentar: string
          suplementacao: string
          tipo_protocolo: string
          treino: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cardio?: string
          created_at?: string
          id?: string
          nome: string
          observacoes?: string | null
          plano_alimentar?: string
          suplementacao?: string
          tipo_protocolo: string
          treino?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cardio?: string
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          plano_alimentar?: string
          suplementacao?: string
          tipo_protocolo?: string
          treino?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_logs: {
        Row: {
          created_at: string
          difficulty: number | null
          exercise_name: string
          id: string
          notes: string | null
          protocolo_id: string
          reps: number | null
          set_number: number
          training_date: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          difficulty?: number | null
          exercise_name: string
          id?: string
          notes?: string | null
          protocolo_id: string
          reps?: number | null
          set_number?: number
          training_date?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          difficulty?: number | null
          exercise_name?: string
          id?: string
          notes?: string | null
          protocolo_id?: string
          reps?: number | null
          set_number?: number
          training_date?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "training_logs_protocolo_id_fkey"
            columns: ["protocolo_id"]
            isOneToOne: false
            referencedRelation: "protocolos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_form_submission: {
        Args: { _old_user_id: string; _submission_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      user_plan: "base" | "transformacao" | "elite"
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
      app_role: ["admin", "moderator", "user"],
      user_plan: ["base", "transformacao", "elite"],
    },
  },
} as const
