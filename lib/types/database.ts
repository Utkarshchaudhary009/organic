// Database types for Organic e-commerce platform
// Generated from Supabase schema

/**
 * Address interface for shipping and billing addresses
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
  label?: string;
}

/**
 * CartProduct interface for items in the user's cart
 */
export interface CartProduct {
  productId: string;
  quantity: number;
  selectedOptions?: Record<string, any>;
  addedAt: string | Date;
}

/**
 * Page interface for store pages
 */
export interface Page {
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * SocialLinks interface for store social media links
 */
export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  pinterest?: string;
  linkedin?: string;
}

/**
 * User interface matching the users table
 */
export interface User {
  id: string;
  created_at: string | Date;
  updated_at: string | Date;
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
  shipping_addresses: Address[];
  billing_addresses: Address[];
  cart_products: CartProduct[];
  wishlist_products: string[];
  role: string;
  email_verified_at: string | Date | null;
  phone_verified_at: string | Date | null;
  last_login_at: string | Date | null;
  is_active: boolean;
  metadata: Record<string, any>;
}

/**
 * Product interface matching the products table
 */
export interface Product {
  id: string;
  created_at: string | Date;
  updated_at: string | Date;
  name: string | null;
  slug: string | null;
  details: string | null;
  price: number | null;
  discount: number;
  final_price: number; // Generated column
  trending: boolean;
  number_of_people_bought: number;
  category_id: string | null;
  inventory: number;
  sku: string | null;
  images: string[];
  is_published: boolean;
  rating: number;
  number_of_reviews: number;
  meta_title: string | null;
  meta_description: string | null;
}

/**
 * Store interface matching the store table
 */
export interface Store {
  id: string;
  created_at: string | Date;
  updated_at: string | Date;
  logo: string | null;
  name: string | null;
  tagline: string | null;
  link: string | null;
  description: string | null;
  pages: Page[];
  social_links: SocialLinks;
  featuredimages: string[];
  contact_email: string | null;
  contact_phone: string | null;
  default_currency: string;
  tax_rate: number;
  shipping_policy: string | null;
  return_policy: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

/**
 * Category interface matching the categories table
 */
export interface Category {
  id: string;
  created_at: string | Date;
  updated_at: string | Date;
  name: string | null;
  slug: string | null;
  description: string | null;
  parent_category_id: string | null;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

/**
 * Order interface matching the orders table
 */
export interface Order {
  id: string;
  created_at: string | Date;
  updated_at: string | Date;
  user_id: string | null;
  order_number: string | null;
  order_date: string | Date;
  shipping_address: Address | null;
  billing_address: Address | null;
  total_amount: number | null;
  shipping_cost: number;
  tax_amount: number;
  discount_applied: number;
  payment_status: string | null;
  shipping_status: string | null;
  tracking_number: string | null;
}

/**
 * OrderItem interface matching the order_items table
 */
export interface OrderItem {
  id: string;
  created_at: string | Date;
  updated_at: string | Date;
  order_id: string | null;
  product_id: string | null;
  product_name: string | null;
  quantity: number | null;
  unit_price: number | null;
  discount_applied: number;
  total_price: number | null;
}

/**
 * ShippingRate interface matching the shipping_rates table
 */
export interface ShippingRate {
  id: string;
  created_at: string | Date;
  updated_at: string | Date;
  location: string | null;
  weight_range_min: number | null;
  weight_range_max: number | null;
  price: number | null;
}

/**
 * Database interface combining all table types
 */
export interface Database {
  users: User[];
  products: Product[];
  store: Store[];
  categories: Category[];
  orders: Order[];
  order_items: OrderItem[];
  shipping_rates: ShippingRate[];
} 