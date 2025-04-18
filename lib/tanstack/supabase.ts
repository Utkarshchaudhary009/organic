import { createClient } from "@supabase/supabase-js";

// Supabase client for client-side usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

// Create a single supabase client for client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for the database schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          clerk_id: string;
          name: string | null;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          image_url: string | null;
          primary_email_address_id: string | null;
          primary_phone_number_id: string | null;
          phone: string | null;
          default_address: string;
          shipping_addresses: Array<any>;
          billing_addresses: Array<any>;
          cart_products: Array<any>;
          wishlist_products: Array<string>;
          role: string;
          email_verified_at: string | null;
          phone_verified_at: string | null;
          last_login_at: string | null;
          is_active: boolean;
          metadata: any;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          clerk_id: string;
          name?: string | null;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          image_url?: string | null;
          primary_email_address_id?: string | null;
          primary_phone_number_id?: string | null;
          phone?: string | null;
          default_address?: string;
          shipping_addresses?: Array<any>;
          billing_addresses?: Array<any>;
          cart_products?: Array<any>;
          wishlist_products?: Array<string>;
          role?: string;
          email_verified_at?: string | null;
          phone_verified_at?: string | null;
          last_login_at?: string | null;
          is_active?: boolean;
          metadata?: any;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          clerk_id?: string;
          name?: string | null;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          image_url?: string | null;
          primary_email_address_id?: string | null;
          primary_phone_number_id?: string | null;
          phone?: string | null;
          default_address?: string;
          shipping_addresses?: Array<any>;
          billing_addresses?: Array<any>;
          cart_products?: Array<any>;
          wishlist_products?: Array<string>;
          role?: string;
          email_verified_at?: string | null;
          phone_verified_at?: string | null;
          last_login_at?: string | null;
          is_active?: boolean;
          metadata?: any;
        };
      };
      products: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string | null;
          slug: string | null;
          details: string | null;
          price: number | null;
          discount: number;
          final_price: number;
          trending: boolean;
          number_of_people_bought: number;
          category_id: string | null;
          inventory: number;
          sku: string | null;
          images: string[] | null;
          is_published: boolean;
          rating: number;
          number_of_reviews: number;
          meta_title: string | null;
          meta_description: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string | null;
          slug?: string | null;
          details?: string | null;
          price?: number | null;
          discount?: number;
          final_price?: never;
          trending?: boolean;
          number_of_people_bought?: number;
          category_id?: string | null;
          inventory?: number;
          sku?: string | null;
          images?: string[] | null;
          is_published?: boolean;
          rating?: number;
          number_of_reviews?: number;
          meta_title?: string | null;
          meta_description?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string | null;
          slug?: string | null;
          details?: string | null;
          price?: number | null;
          discount?: number;
          final_price?: never;
          trending?: boolean;
          number_of_people_bought?: number;
          category_id?: string | null;
          inventory?: number;
          sku?: string | null;
          images?: string[] | null;
          is_published?: boolean;
          rating?: number;
          number_of_reviews?: number;
          meta_title?: string | null;
          meta_description?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string | null;
          slug: string | null;
          description: string | null;
          parent_category_id: string | null;
          image_url: string | null;
          meta_title: string | null;
          meta_description: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string | null;
          slug?: string | null;
          description?: string | null;
          parent_category_id?: string | null;
          image_url?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string | null;
          slug?: string | null;
          description?: string | null;
          parent_category_id?: string | null;
          image_url?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
        };
      };
      store: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          logo: string | null;
          name: string | null;
          tagline: string | null;
          link: string | null;
          description: string | null;
          pages: Array<any>;
          social_links: any;
          featuredimages: string[] | null;
          contact_email: string | null;
          contact_phone: string | null;
          default_currency: string;
          tax_rate: number;
          shipping_policy: string | null;
          return_policy: string | null;
          meta_title: string | null;
          meta_description: string | null;
          footer_links: Array<any>;
          address: string | null;
          newsletter_enabled: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          logo?: string | null;
          name?: string | null;
          tagline?: string | null;
          link?: string | null;
          description?: string | null;
          pages?: Array<any>;
          social_links?: any;
          featuredimages?: string[] | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          default_currency?: string;
          tax_rate?: number;
          shipping_policy?: string | null;
          return_policy?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          footer_links?: Array<any>;
          address?: string | null;
          newsletter_enabled?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          logo?: string | null;
          name?: string | null;
          tagline?: string | null;
          link?: string | null;
          description?: string | null;
          pages?: Array<any>;
          social_links?: any;
          featuredimages?: string[] | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          default_currency?: string;
          tax_rate?: number;
          shipping_policy?: string | null;
          return_policy?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          footer_links?: Array<any>;
          address?: string | null;
          newsletter_enabled?: boolean;
        };
      };
      // Add other tables as needed
      orders: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          order_number: string;
          order_date: string;
          shipping_address: any;
          billing_address: any;
          total_amount: number;
          shipping_cost: number;
          tax_amount: number;
          discount_applied: number;
          payment_status: string | null;
          shipping_status: string | null;
          tracking_number: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          order_number?: string;
          order_date?: string;
          shipping_address?: any;
          billing_address?: any;
          total_amount: number;
          shipping_cost?: number;
          tax_amount?: number;
          discount_applied?: number;
          payment_status?: string | null;
          shipping_status?: string | null;
          tracking_number?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          order_number?: string;
          order_date?: string;
          shipping_address?: any;
          billing_address?: any;
          total_amount?: number;
          shipping_cost?: number;
          tax_amount?: number;
          discount_applied?: number;
          payment_status?: string | null;
          shipping_status?: string | null;
          tracking_number?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          order_id: string;
          product_id: string;
          product_name: string | null;
          quantity: number | null;
          unit_price: number | null;
          discount_applied: number;
          total_price: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          order_id: string;
          product_id: string;
          product_name?: string | null;
          quantity?: number | null;
          unit_price?: number | null;
          discount_applied?: number;
          total_price?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string | null;
          quantity?: number | null;
          unit_price?: number | null;
          discount_applied?: number;
          total_price?: number | null;
        };
      };
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
