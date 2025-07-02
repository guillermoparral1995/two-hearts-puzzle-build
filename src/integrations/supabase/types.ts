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
      current_game_state: {
        Row: {
          current_game: Database['public']['Enums']['game_type'] | null
          current_round: number | null
          current_turn: Database['public']['Enums']['user_name'] | null
          game_data: Json | null
          id: string
          session_id: string
          updated_at: string
          waiting_for_players: boolean | null
        }
        Insert: {
          current_game?: Database['public']['Enums']['game_type'] | null
          current_round?: number | null
          current_turn?: Database['public']['Enums']['user_name'] | null
          game_data?: Json | null
          id?: string
          session_id: string
          updated_at?: string
          waiting_for_players?: boolean | null
        }
        Update: {
          current_game?: Database['public']['Enums']['game_type'] | null
          current_round?: number | null
          current_turn?: Database['public']['Enums']['user_name'] | null
          game_data?: Json | null
          id?: string
          session_id?: string
          updated_at?: string
          waiting_for_players?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: 'current_game_state_session_id_fkey'
            columns: ['session_id']
            isOneToOne: true
            referencedRelation: 'game_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      game_progress: {
        Row: {
          completed: boolean | null
          created_at: string
          game_type: Database['public']['Enums']['game_type']
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          game_type: Database['public']['Enums']['game_type']
          id?: string
          session_id: string
          updated_at?: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          game_type?: Database['public']['Enums']['game_type']
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'game_progress_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'game_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      game_responses: {
        Row: {
          answer: string | null
          created_at: string
          drawing_data: string | null
          game_type: Database['public']['Enums']['game_type']
          id: string
          question: string | null
          round_number: number
          session_id: string
          user_name: Database['public']['Enums']['user_name']
        }
        Insert: {
          answer?: string | null
          created_at?: string
          drawing_data?: string | null
          game_type: Database['public']['Enums']['game_type']
          id?: string
          question?: string | null
          round_number: number
          session_id: string
          user_name: Database['public']['Enums']['user_name']
        }
        Update: {
          answer?: string | null
          created_at?: string
          drawing_data?: string | null
          game_type?: Database['public']['Enums']['game_type']
          id?: string
          question?: string | null
          round_number?: number
          session_id?: string
          user_name?: Database['public']['Enums']['user_name']
        }
        Relationships: [
          {
            foreignKeyName: 'game_responses_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'game_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      game_sessions: {
        Row: {
          created_at: string
          delfina_connected: boolean | null
          guille_connected: boolean | null
          id: string
          session_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delfina_connected?: boolean | null
          guille_connected?: boolean | null
          id?: string
          session_code?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delfina_connected?: boolean | null
          guille_connected?: boolean | null
          id?: string
          session_code?: string
          updated_at?: string
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
      game_type: 'top10' | 'predict_future' | 'drawful' | 'would_you_do'
      user_name: 'Guille' | 'Delfina'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      game_type: ['top10', 'predict_future', 'drawful', 'would_you_do'],
      user_name: ['Guille', 'Delfina'],
    },
  },
} as const
