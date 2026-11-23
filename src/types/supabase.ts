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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: number
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json
          entity: string
          entity_id?: string | null
          id?: never
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: never
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          id: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_areas: {
        Row: {
          created_at: string
          fee: number
          id: number
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          fee: number
          id?: never
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          fee?: number
          id?: never
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      delivery_methods: {
        Row: {
          code: string
          is_active: boolean
          name: string
          provider: string
          sort_order: number
        }
        Insert: {
          code: string
          is_active?: boolean
          name: string
          provider?: string
          sort_order?: number
        }
        Update: {
          code?: string
          is_active?: boolean
          name?: string
          provider?: string
          sort_order?: number
        }
        Relationships: []
      }
      matatu_routes: {
        Row: {
          created_at: string
          fee: number
          id: number
          is_active: boolean
          note: string | null
          sacco_id: number
          town_id: number
        }
        Insert: {
          created_at?: string
          fee: number
          id?: never
          is_active?: boolean
          note?: string | null
          sacco_id: number
          town_id: number
        }
        Update: {
          created_at?: string
          fee?: number
          id?: never
          is_active?: boolean
          note?: string | null
          sacco_id?: number
          town_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "matatu_routes_sacco_id_fkey"
            columns: ["sacco_id"]
            isOneToOne: false
            referencedRelation: "matatu_saccos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matatu_routes_town_id_fkey"
            columns: ["town_id"]
            isOneToOne: false
            referencedRelation: "matatu_towns"
            referencedColumns: ["id"]
          },
        ]
      }
      matatu_saccos: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: never
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: never
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      matatu_towns: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: never
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: never
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      mpesa_callback_logs: {
        Row: {
          checkout_request_id: string
          id: number
          order_id: string | null
          order_matched: boolean
          processed_at: string | null
          processing_message: string | null
          processing_status: string
          received_at: string
          result_code: number
          result_description: string | null
        }
        Insert: {
          checkout_request_id: string
          id?: never
          order_id?: string | null
          order_matched?: boolean
          processed_at?: string | null
          processing_message?: string | null
          processing_status?: string
          received_at?: string
          result_code: number
          result_description?: string | null
        }
        Update: {
          checkout_request_id?: string
          id?: never
          order_id?: string | null
          order_matched?: boolean
          processed_at?: string | null
          processing_message?: string | null
          processing_status?: string
          received_at?: string
          result_code?: number
          result_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mpesa_callback_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          confirmed_at: string | null
          consented_at: string
          created_at: string
          email: string
          id: number
          status: string
          unsubscribed_at: string | null
        }
        Insert: {
          confirmed_at?: string | null
          consented_at?: string
          created_at?: string
          email: string
          id?: never
          status?: string
          unsubscribed_at?: string | null
        }
        Update: {
          confirmed_at?: string | null
          consented_at?: string
          created_at?: string
          email?: string
          id?: never
          status?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      order_access_tokens: {
        Row: {
          created_at: string
          order_id: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          order_id: string
          token_hash: string
        }
        Update: {
          created_at?: string
          order_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_access_tokens_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          original_unit_price: number
          product_id: string
          product_name: string
          quantity: number
          selected_color: string | null
          selected_size: string | null
          selected_storage: string | null
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          original_unit_price: number
          product_id: string
          product_name: string
          quantity: number
          selected_color?: string | null
          selected_size?: string | null
          selected_storage?: string | null
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          original_unit_price?: number
          product_id?: string
          product_name?: string
          quantity?: number
          selected_color?: string | null
          selected_size?: string | null
          selected_storage?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_shipments: {
        Row: {
          dispatched_at: string
          dispatched_by: string | null
          note: string | null
          order_id: string
          provider: string
          reference: string | null
          updated_at: string
        }
        Insert: {
          dispatched_at?: string
          dispatched_by?: string | null
          note?: string | null
          order_id: string
          provider?: string
          reference?: string | null
          updated_at?: string
        }
        Update: {
          dispatched_at?: string
          dispatched_by?: string | null
          note?: string | null
          order_id?: string
          provider?: string
          reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          created_at: string
          currency: string
          customer_name: string
          delivery_area_id: number | null
          delivery_fee: number
          delivery_label: string | null
          delivery_method: string | null
          delivery_notes: string | null
          discount_total: number
          email: string
          id: string
          inventory_status: string
          matatu_route_id: number | null
          mpesa_checkout_request_id: string | null
          mpesa_initiated_at: string | null
          mpesa_initiation_status: string
          payment_method: string
          payment_provider: string | null
          payment_reference: string | null
          payment_resolution_status: string
          payment_status: string
          phone: string
          refund_reference: string | null
          reservation_expires_at: string | null
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          subtotal: number
          total: number
        }
        Insert: {
          address: string
          created_at?: string
          currency?: string
          customer_name: string
          delivery_area_id?: number | null
          delivery_fee?: number
          delivery_label?: string | null
          delivery_method?: string | null
          delivery_notes?: string | null
          discount_total?: number
          email: string
          id?: string
          inventory_status?: string
          matatu_route_id?: number | null
          mpesa_checkout_request_id?: string | null
          mpesa_initiated_at?: string | null
          mpesa_initiation_status?: string
          payment_method?: string
          payment_provider?: string | null
          payment_reference?: string | null
          payment_resolution_status?: string
          payment_status?: string
          phone: string
          refund_reference?: string | null
          reservation_expires_at?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subtotal: number
          total: number
        }
        Update: {
          address?: string
          created_at?: string
          currency?: string
          customer_name?: string
          delivery_area_id?: number | null
          delivery_fee?: number
          delivery_label?: string | null
          delivery_method?: string | null
          delivery_notes?: string | null
          discount_total?: number
          email?: string
          id?: string
          inventory_status?: string
          matatu_route_id?: number | null
          mpesa_checkout_request_id?: string | null
          mpesa_initiated_at?: string | null
          mpesa_initiation_status?: string
          payment_method?: string
          payment_provider?: string | null
          payment_reference?: string | null
          payment_resolution_status?: string
          payment_status?: string
          phone?: string
          refund_reference?: string | null
          reservation_expires_at?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subtotal?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_area_id_fkey"
            columns: ["delivery_area_id"]
            isOneToOne: false
            referencedRelation: "delivery_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_method_fkey"
            columns: ["delivery_method"]
            isOneToOne: false
            referencedRelation: "delivery_methods"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "orders_matatu_route_id_fkey"
            columns: ["matatu_route_id"]
            isOneToOne: false
            referencedRelation: "matatu_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          attributes: Json
          category_id: string
          date_added: string
          description: string
          discount_percent: number | null
          display_order: number | null
          featured: boolean
          highlights: Json
          id: string
          image_url: string
          images: string[] | null
          is_active: boolean
          kind: string
          name: string
          price: number
          rating: number
          reserved_stock: number
          review_count: number
          specifications: Json
          stock: number
        }
        Insert: {
          attributes?: Json
          category_id: string
          date_added?: string
          description: string
          discount_percent?: number | null
          display_order?: number | null
          featured?: boolean
          highlights?: Json
          id: string
          image_url: string
          images?: string[] | null
          is_active?: boolean
          kind: string
          name: string
          price: number
          rating?: number
          reserved_stock?: number
          review_count?: number
          specifications?: Json
          stock?: number
        }
        Update: {
          attributes?: Json
          category_id?: string
          date_added?: string
          description?: string
          discount_percent?: number | null
          display_order?: number | null
          featured?: boolean
          highlights?: Json
          id?: string
          image_url?: string
          images?: string[] | null
          is_active?: boolean
          kind?: string
          name?: string
          price?: number
          rating?: number
          reserved_stock?: number
          review_count?: number
          specifications?: Json
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      product_inventory: {
        Row: {
          available_stock: number | null
          id: string | null
          name: string | null
          reserved_stock: number | null
          stock: number | null
        }
        Insert: {
          available_stock?: never
          id?: string | null
          name?: string | null
          reserved_stock?: number | null
          stock?: number | null
        }
        Update: {
          available_stock?: never
          id?: string | null
          name?: string | null
          reserved_stock?: number | null
          stock?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_cancel_order: {
        Args: { p_note?: string; p_order_id: string }
        Returns: undefined
      }
      admin_check_product: {
        Args: { p: Json; p_is_new: boolean }
        Returns: undefined
      }
      admin_complete_cod_delivery: {
        Args: { p_order_id: string; p_reference?: string }
        Returns: undefined
      }
      admin_create_product: { Args: { p: Json }; Returns: string }
      admin_delete_product: { Args: { p_id: string }; Returns: undefined }
      admin_fail_cod_delivery: {
        Args: { p_note?: string; p_order_id: string }
        Returns: undefined
      }
      admin_fulfil_review_order: {
        Args: { p_note?: string; p_order_id: string }
        Returns: undefined
      }
      admin_get_delivery_config: { Args: never; Returns: Json }
      admin_get_order: { Args: { p_order_id: string }; Returns: Json }
      admin_get_product: { Args: { p_id: string }; Returns: Json }
      admin_get_review_queue: { Args: never; Returns: Json }
      admin_is_int: { Args: { j: Json }; Returns: boolean }
      admin_is_num: { Args: { j: Json }; Returns: boolean }
      admin_is_text_array: {
        Args: { j: Json; min_len: number; p_distinct: boolean }
        Returns: boolean
      }
      admin_list_orders: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_status?: string
        }
        Returns: Json
      }
      admin_list_products: {
        Args: {
          p_kind?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_status?: string
        }
        Returns: Json
      }
      admin_mark_delivered: { Args: { p_order_id: string }; Returns: undefined }
      admin_mark_refunded: {
        Args: {
          p_note?: string
          p_order_id: string
          p_refund_reference: string
        }
        Returns: undefined
      }
      admin_review_count: { Args: never; Returns: Json }
      admin_save_delivery_area: { Args: { p: Json }; Returns: number }
      admin_save_delivery_method: {
        Args: { p_active: boolean; p_code: string; p_name: string }
        Returns: undefined
      }
      admin_save_matatu_route: { Args: { p: Json }; Returns: number }
      admin_save_matatu_sacco: { Args: { p: Json }; Returns: number }
      admin_save_matatu_town: { Args: { p: Json }; Returns: number }
      admin_set_payment_reference: {
        Args: { p_order_id: string; p_reference: string }
        Returns: undefined
      }
      admin_ship_order: {
        Args: { p_note?: string; p_order_id: string; p_reference?: string }
        Returns: undefined
      }
      admin_start_refund: {
        Args: { p_note?: string; p_order_id: string }
        Returns: undefined
      }
      admin_update_dispatch: {
        Args: { p_note?: string; p_order_id: string; p_reference?: string }
        Returns: undefined
      }
      admin_update_product: { Args: { p: Json }; Returns: undefined }
      cancel_order: { Args: { p_order_id: string }; Returns: undefined }
      cancel_stale_cod_orders: { Args: never; Returns: number }
      claim_mpesa_initiation: { Args: { p_order_id: string }; Returns: boolean }
      confirm_cod_payment: {
        Args: { p_order_id: string; p_reference?: string }
        Returns: undefined
      }
      confirm_payment: {
        Args: { p_order_id: string; p_provider: string; p_reference: string }
        Returns: undefined
      }
      create_order: {
        Args: {
          p_address: string
          p_customer_name: string
          p_delivery_method: string
          p_delivery_notes?: string
          p_delivery_option_id: number
          p_email: string
          p_items: Json
          p_payment_method: string
          p_phone: string
        }
        Returns: Json
      }
      fail_cod_delivery: { Args: { p_order_id: string }; Returns: undefined }
      fail_payment: { Args: { p_order_id: string }; Returns: undefined }
      get_delivery_options: { Args: never; Returns: Json }
      get_order_confirmation: {
        Args: { p_access_token: string; p_order_id: string }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_member: { Args: never; Returns: boolean }
      mark_order_delivered: { Args: { p_order_id: string }; Returns: undefined }
      mark_order_shipped: { Args: { p_order_id: string }; Returns: undefined }
      order_admin_actions: {
        Args: { o: Database["public"]["Tables"]["orders"]["Row"] }
        Returns: string[]
      }
      release_expired_reservations: { Args: never; Returns: number }
      subscribe_newsletter: { Args: { p_email: string }; Returns: undefined }
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
    Enums: {},
  },
} as const
