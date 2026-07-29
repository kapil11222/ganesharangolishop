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
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      cod_remittance: {
        Row: {
          amount: number
          awb: string
          collected_at: string | null
          created_at: string
          id: string
          order_id: string | null
          remitted_at: string | null
          status: string
          updated_at: string
          utr: string | null
        }
        Insert: {
          amount: number
          awb: string
          collected_at?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          remitted_at?: string | null
          status?: string
          updated_at?: string
          utr?: string | null
        }
        Update: {
          amount?: number
          awb?: string
          collected_at?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          remitted_at?: string | null
          status?: string
          updated_at?: string
          utr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cod_remittance_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_discount: number | null
          min_order_value: number | null
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order_value?: number | null
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order_value?: number | null
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_link: string | null
          display_order: number
          ends_at: string | null
          eyebrow: string | null
          id: string
          image_url: string
          is_active: boolean
          mobile_image_url: string | null
          starts_at: string | null
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          display_order?: number
          ends_at?: string | null
          eyebrow?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          mobile_image_url?: string | null
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          display_order?: number
          ends_at?: string | null
          eyebrow?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          mobile_image_url?: string | null
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ndr_records: {
        Row: {
          action: string | null
          attempt_no: number
          created_at: string
          id: string
          notes: string | null
          reason: string | null
          resolved: boolean
          shipment_id: string
          updated_at: string
        }
        Insert: {
          action?: string | null
          attempt_no?: number
          created_at?: string
          id?: string
          notes?: string | null
          reason?: string | null
          resolved?: boolean
          shipment_id: string
          updated_at?: string
        }
        Update: {
          action?: string | null
          attempt_no?: number
          created_at?: string
          id?: string
          notes?: string | null
          reason?: string | null
          resolved?: boolean
          shipment_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ndr_records_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      offer_campaigns: {
        Row: {
          badge_text: string | null
          banner_url: string | null
          coupon_code: string | null
          created_at: string
          cta_link: string | null
          description: string | null
          discount_percent: number | null
          display_order: number
          ends_at: string | null
          id: string
          is_active: boolean
          name: string
          occasion: string
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          banner_url?: string | null
          coupon_code?: string | null
          created_at?: string
          cta_link?: string | null
          description?: string | null
          discount_percent?: number | null
          display_order?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          occasion?: string
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          banner_url?: string | null
          coupon_code?: string | null
          created_at?: string
          cta_link?: string | null
          description?: string | null
          discount_percent?: number | null
          display_order?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          occasion?: string
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity: number
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          total?: number
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          alt_mobile: string | null
          awb: string | null
          city: string
          country: string
          coupon_code: string | null
          created_at: string
          customer_name: string
          discount: number
          email: string
          expected_delivery_at: string | null
          gst_number: string | null
          id: string
          landmark: string | null
          mobile: string
          order_notes: string | null
          order_number: string
          payment_method: string
          payment_status: string
          pincode: string
          shipping: number
          shipping_cost_actual: number | null
          shipping_status: string | null
          state: string
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
          user_id: string | null
          warehouse_id: string | null
        }
        Insert: {
          address: string
          alt_mobile?: string | null
          awb?: string | null
          city: string
          country?: string
          coupon_code?: string | null
          created_at?: string
          customer_name: string
          discount?: number
          email: string
          expected_delivery_at?: string | null
          gst_number?: string | null
          id?: string
          landmark?: string | null
          mobile: string
          order_notes?: string | null
          order_number?: string
          payment_method: string
          payment_status?: string
          pincode: string
          shipping?: number
          shipping_cost_actual?: number | null
          shipping_status?: string | null
          state: string
          status?: string
          subtotal: number
          tax?: number
          total: number
          updated_at?: string
          user_id?: string | null
          warehouse_id?: string | null
        }
        Update: {
          address?: string
          alt_mobile?: string | null
          awb?: string | null
          city?: string
          country?: string
          coupon_code?: string | null
          created_at?: string
          customer_name?: string
          discount?: number
          email?: string
          expected_delivery_at?: string | null
          gst_number?: string | null
          id?: string
          landmark?: string | null
          mobile?: string
          order_notes?: string | null
          order_number?: string
          payment_method?: string
          payment_status?: string
          pincode?: string
          shipping?: number
          shipping_cost_actual?: number | null
          shipping_status?: string | null
          state?: string
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_requests: {
        Row: {
          created_at: string
          expected_package_count: number
          id: string
          pickup_date: string
          pickup_id: string | null
          pickup_time: string | null
          raw_payload: Json | null
          status: string
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          expected_package_count?: number
          id?: string
          pickup_date: string
          pickup_id?: string | null
          pickup_time?: string | null
          raw_payload?: Json | null
          status?: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          expected_package_count?: number
          id?: string
          pickup_date?: string
          pickup_id?: string | null
          pickup_time?: string | null
          raw_payload?: Json | null
          status?: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pickup_requests_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_cod: boolean
          allow_prepaid: boolean
          category_id: string | null
          color: string | null
          created_at: string
          description: string | null
          festival: string | null
          height_cm: number | null
          id: string
          images: string[]
          is_active: boolean
          is_best_seller: boolean
          is_featured: boolean
          is_new_arrival: boolean
          length_cm: number | null
          material: string | null
          meta_description: string | null
          meta_title: string | null
          mrp: number | null
          name: string
          price: number
          rating: number | null
          review_count: number | null
          short_description: string | null
          size: string | null
          sku: string | null
          slug: string
          stock: number
          updated_at: string
          weight_grams: number | null
          width_cm: number | null
        }
        Insert: {
          allow_cod?: boolean
          allow_prepaid?: boolean
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          festival?: string | null
          height_cm?: number | null
          id?: string
          images?: string[]
          is_active?: boolean
          is_best_seller?: boolean
          is_featured?: boolean
          is_new_arrival?: boolean
          length_cm?: number | null
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          mrp?: number | null
          name: string
          price: number
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          size?: string | null
          sku?: string | null
          slug: string
          stock?: number
          updated_at?: string
          weight_grams?: number | null
          width_cm?: number | null
        }
        Update: {
          allow_cod?: boolean
          allow_prepaid?: boolean
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          festival?: string | null
          height_cm?: number | null
          id?: string
          images?: string[]
          is_active?: boolean
          is_best_seller?: boolean
          is_featured?: boolean
          is_new_arrival?: boolean
          length_cm?: number | null
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          mrp?: number | null
          name?: string
          price?: number
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          size?: string | null
          sku?: string | null
          slug?: string
          stock?: number
          updated_at?: string
          weight_grams?: number | null
          width_cm?: number | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          pincode: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          pincode?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shipment_events: {
        Row: {
          created_at: string
          event_time: string
          id: string
          location: string | null
          remark: string | null
          shipment_id: string
          status: string
        }
        Insert: {
          created_at?: string
          event_time?: string
          id?: string
          location?: string | null
          remark?: string | null
          shipment_id: string
          status: string
        }
        Update: {
          created_at?: string
          event_time?: string
          id?: string
          location?: string | null
          remark?: string | null
          shipment_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          awb: string | null
          cod_amount: number | null
          courier: string
          created_at: string
          current_location: string | null
          expected_delivery: string | null
          height_cm: number | null
          id: string
          label_url: string | null
          length_cm: number | null
          order_id: string
          payment_mode: string
          pickup_id: string | null
          raw_payload: Json | null
          status: string
          updated_at: string
          warehouse_id: string | null
          weight_grams: number | null
          width_cm: number | null
        }
        Insert: {
          awb?: string | null
          cod_amount?: number | null
          courier?: string
          created_at?: string
          current_location?: string | null
          expected_delivery?: string | null
          height_cm?: number | null
          id?: string
          label_url?: string | null
          length_cm?: number | null
          order_id: string
          payment_mode?: string
          pickup_id?: string | null
          raw_payload?: Json | null
          status?: string
          updated_at?: string
          warehouse_id?: string | null
          weight_grams?: number | null
          width_cm?: number | null
        }
        Update: {
          awb?: string | null
          cod_amount?: number | null
          courier?: string
          created_at?: string
          current_location?: string | null
          expected_delivery?: string | null
          height_cm?: number | null
          id?: string
          label_url?: string | null
          length_cm?: number | null
          order_id?: string
          payment_mode?: string
          pickup_id?: string | null
          raw_payload?: Json | null
          status?: string
          updated_at?: string
          warehouse_id?: string | null
          weight_grams?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          order_number: string | null
          phone: string | null
          priority: string
          status: string
          subject: string
          ticket_number: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          order_number?: string | null
          phone?: string | null
          priority?: string
          status?: string
          subject: string
          ticket_number?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          order_number?: string | null
          phone?: string | null
          priority?: string
          status?: string
          subject?: string
          ticket_number?: string
          user_id?: string | null
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      warehouses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          contact_person: string | null
          country: string
          created_at: string
          email: string | null
          id: string
          is_default: boolean
          name: string
          phone: string | null
          pincode: string
          return_address: string | null
          return_pincode: string | null
          state: string
          updated_at: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          contact_person?: string | null
          country?: string
          created_at?: string
          email?: string | null
          id?: string
          is_default?: boolean
          name: string
          phone?: string | null
          pincode: string
          return_address?: string | null
          return_pincode?: string | null
          state: string
          updated_at?: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          contact_person?: string | null
          country?: string
          created_at?: string
          email?: string | null
          id?: string
          is_default?: boolean
          name?: string
          phone?: string | null
          pincode?: string
          return_address?: string | null
          return_pincode?: string | null
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
