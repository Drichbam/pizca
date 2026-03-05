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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ingredient_prices: {
        Row: {
          brand: string | null
          created_at: string
          id: string
          ingredient_id: string | null
          ingredient_name: string
          is_default: boolean | null
          package_size: number | null
          package_unit: Database["public"]["Enums"]["ingredient_unit"] | null
          price: number
          supermarket: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          id?: string
          ingredient_id?: string | null
          ingredient_name: string
          is_default?: boolean | null
          package_size?: number | null
          package_unit?: Database["public"]["Enums"]["ingredient_unit"] | null
          price: number
          supermarket?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          id?: string
          ingredient_id?: string | null
          ingredient_name?: string
          is_default?: boolean | null
          package_size?: number | null
          package_unit?: Database["public"]["Enums"]["ingredient_unit"] | null
          price?: number
          supermarket?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_prices_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          aliases: Json
          canonical_name: string
          category: string
          created_at: string
          id: string
          off_category: string | null
          translations: Json
        }
        Insert: {
          aliases?: Json
          canonical_name: string
          category?: string
          created_at?: string
          id?: string
          off_category?: string | null
          translations?: Json
        }
        Update: {
          aliases?: Json
          canonical_name?: string
          category?: string
          created_at?: string
          id?: string
          off_category?: string | null
          translations?: Json
        }
        Relationships: []
      }
      recipe_components: {
        Row: {
          id: string
          name: string
          recipe_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          name?: string
          recipe_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          recipe_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_components_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          component_id: string
          display_name: string
          id: string
          ingredient_id: string | null
          quantity: number | null
          sort_order: number
          unit: Database["public"]["Enums"]["ingredient_unit"] | null
        }
        Insert: {
          component_id: string
          display_name: string
          id?: string
          ingredient_id?: string | null
          quantity?: number | null
          sort_order?: number
          unit?: Database["public"]["Enums"]["ingredient_unit"] | null
        }
        Update: {
          component_id?: string
          display_name?: string
          id?: string
          ingredient_id?: string | null
          quantity?: number | null
          sort_order?: number
          unit?: Database["public"]["Enums"]["ingredient_unit"] | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "recipe_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_notes: {
        Row: {
          content: string
          id: string
          recipe_id: string
          sort_order: number
        }
        Insert: {
          content: string
          id?: string
          recipe_id: string
          sort_order?: number
        }
        Update: {
          content?: string
          id?: string
          recipe_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_notes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_planning: {
        Row: {
          day_label: string
          id: string
          recipe_id: string
          sort_order: number
          tasks: string[]
        }
        Insert: {
          day_label: string
          id?: string
          recipe_id: string
          sort_order?: number
          tasks?: string[]
        }
        Update: {
          day_label?: string
          id?: string
          recipe_id?: string
          sort_order?: number
          tasks?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "recipe_planning_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_scale_factors: {
        Row: {
          id: string
          multiplier: number
          recipe_id: string
          reference_mold: string
          target_mold: string
        }
        Insert: {
          id?: string
          multiplier: number
          recipe_id: string
          reference_mold: string
          target_mold: string
        }
        Update: {
          id?: string
          multiplier?: number
          recipe_id?: string
          reference_mold?: string
          target_mold?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_scale_factors_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_steps: {
        Row: {
          component_id: string
          description: string
          duration_min: number | null
          id: string
          photo_url: string | null
          step_order: number
          technical_notes: string | null
          temp_c: number | null
        }
        Insert: {
          component_id: string
          description: string
          duration_min?: number | null
          id?: string
          photo_url?: string | null
          step_order?: number
          technical_notes?: string | null
          temp_c?: number | null
        }
        Update: {
          component_id?: string
          description?: string
          duration_min?: number | null
          id?: string
          photo_url?: string | null
          step_order?: number
          technical_notes?: string | null
          temp_c?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_steps_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "recipe_components"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_tags: {
        Row: {
          id: string
          recipe_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          recipe_id: string
          tag_id: string
        }
        Update: {
          id?: string
          recipe_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_variants: {
        Row: {
          description: string | null
          id: string
          name: string
          recipe_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          recipe_id: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_variants_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          bake_time_min: number | null
          category: Database["public"]["Enums"]["recipe_category"]
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["recipe_difficulty"] | null
          id: string
          mold: string | null
          origin_book: string | null
          origin_chef: string | null
          origin_url: string | null
          photo_url: string | null
          planning_days: number | null
          prep_time_min: number | null
          rating: number | null
          rest_time_min: number | null
          servings: number | null
          slug: string
          subcategory: string | null
          temperature: number | null
          test_notes: string | null
          tested: boolean | null
          title: string
          total_active_min: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bake_time_min?: number | null
          category?: Database["public"]["Enums"]["recipe_category"]
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"] | null
          id?: string
          mold?: string | null
          origin_book?: string | null
          origin_chef?: string | null
          origin_url?: string | null
          photo_url?: string | null
          planning_days?: number | null
          prep_time_min?: number | null
          rating?: number | null
          rest_time_min?: number | null
          servings?: number | null
          slug: string
          subcategory?: string | null
          temperature?: number | null
          test_notes?: string | null
          tested?: boolean | null
          title: string
          total_active_min?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bake_time_min?: number | null
          category?: Database["public"]["Enums"]["recipe_category"]
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"] | null
          id?: string
          mold?: string | null
          origin_book?: string | null
          origin_chef?: string | null
          origin_url?: string | null
          photo_url?: string | null
          planning_days?: number | null
          prep_time_min?: number | null
          rating?: number | null
          rest_time_min?: number | null
          servings?: number | null
          slug?: string
          subcategory?: string | null
          temperature?: number | null
          test_notes?: string | null
          tested?: boolean | null
          title?: string
          total_active_min?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          checked: boolean | null
          id: string
          ingredient_id: string | null
          ingredient_name: string
          quantity: number | null
          shopping_list_id: string
          sort_order: number
          unit: Database["public"]["Enums"]["ingredient_unit"] | null
        }
        Insert: {
          checked?: boolean | null
          id?: string
          ingredient_id?: string | null
          ingredient_name: string
          quantity?: number | null
          shopping_list_id: string
          sort_order?: number
          unit?: Database["public"]["Enums"]["ingredient_unit"] | null
        }
        Update: {
          checked?: boolean | null
          id?: string
          ingredient_id?: string | null
          ingredient_name?: string
          quantity?: number | null
          shopping_list_id?: string
          sort_order?: number
          unit?: Database["public"]["Enums"]["ingredient_unit"] | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
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
      tags: {
        Row: {
          color: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          id?: string
          name?: string
          user_id?: string
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
      ingredient_unit:
        | "g"
        | "kg"
        | "ml"
        | "cl"
        | "dl"
        | "l"
        | "pcs"
        | "QS"
        | "cc"
        | "cs"
        | "pincée"
      recipe_category:
        | "tartes"
        | "entremets"
        | "biscuits"
        | "gâteaux"
        | "pâtes-de-base"
        | "crèmes-de-base"
        | "mousses"
        | "glaces-sorbets"
        | "viennoiserie"
        | "confiserie"
        | "autre"
      recipe_difficulty: "basico" | "intermedio" | "avanzado" | "experto"
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
      ingredient_unit: [
        "g",
        "kg",
        "ml",
        "cl",
        "dl",
        "l",
        "pcs",
        "QS",
        "cc",
        "cs",
        "pincée",
      ],
      recipe_category: [
        "tartes",
        "entremets",
        "biscuits",
        "gâteaux",
        "pâtes-de-base",
        "crèmes-de-base",
        "mousses",
        "glaces-sorbets",
        "viennoiserie",
        "confiserie",
        "autre",
      ],
      recipe_difficulty: ["basico", "intermedio", "avanzado", "experto"],
    },
  },
} as const
