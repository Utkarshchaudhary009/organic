-- Create storage bucket for images
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true);

-- Create policy to allow public access to the images (read-only)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Create policy to allow only admins to insert/update/delete images
CREATE POLICY "Admin Insert Images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND 
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Admin Update Images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' AND 
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Admin Delete Images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' AND 
    (auth.jwt() ->> 'role')::text = 'admin'
  );

-- Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  clerk_id TEXT UNIQUE NOT NULL, -- Clerk User ID (Primary link to Clerk)
  name TEXT, -- User's full name (can be derived from Clerk)
  email TEXT UNIQUE, -- User's email address (from Clerk)
  first_name TEXT, -- User's first name (from Clerk)
  last_name TEXT, -- User's last name (from Clerk)
  image_url TEXT, -- Profile picture URL from Clerk
  primary_email_address_id TEXT, -- ID of the primary email in Clerk (optional)
  primary_phone_number_id TEXT, -- ID of the primary phone number in Clerk (optional)
  phone TEXT, -- User's phone number (you might manage this separately or sync from Clerk if available)
  default_address TEXT DEFAULT '',
  shipping_addresses JSONB[] DEFAULT '{}'::JSONB[],
  billing_addresses JSONB[] DEFAULT '{}'::JSONB[],
  cart_products JSONB[] DEFAULT '{}'::JSONB[],
  wishlist_products UUID[] DEFAULT '{}'::UUID[],
  role TEXT DEFAULT 'user',
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Add index for faster querying by clerk_id
CREATE INDEX idx_users_clerk_id ON users (clerk_id);

-- Create Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  slug TEXT UNIQUE,
  details TEXT,
  price NUMERIC,
  discount NUMERIC DEFAULT 0,
  final_price NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN discount > 0 THEN price - (price * discount / 100)
      ELSE price
    END
  ) STORED,
  trending BOOLEAN DEFAULT FALSE,
  number_of_people_bought INTEGER DEFAULT 0,
  category_id UUID,
  inventory INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  images TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  rating NUMERIC DEFAULT 0,
  number_of_reviews INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT
);

-- Create Store Table
CREATE TABLE store (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  logo TEXT,
  name TEXT,
  tagline TEXT,
  link TEXT,
  description TEXT,
  pages JSONB[] DEFAULT '{}'::JSONB[],
  social_links JSONB DEFAULT '{}'::JSONB,
  featuredimages TEXT[],
  contact_email TEXT,
  contact_phone TEXT,
  default_currency TEXT DEFAULT 'INR',
  tax_rate NUMERIC DEFAULT 0.0,
  shipping_policy TEXT,
  return_policy TEXT,
  meta_title TEXT,
  meta_description TEXT
);

-- Create Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT UNIQUE,
  slug TEXT UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES categories(id),
  image_url TEXT,
  meta_title TEXT,
  meta_description TEXT
);

-- Add foreign key constraint to products table for category_id
ALTER TABLE products
ADD CONSTRAINT fk_products_category_id
FOREIGN KEY (category_id)
REFERENCES categories(id);

-- Create Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  order_number TEXT UNIQUE,
  order_date TIMESTAMPTZ DEFAULT NOW(),
  shipping_address JSONB,
  billing_address JSONB,
  total_amount NUMERIC,
  shipping_cost NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  discount_applied NUMERIC DEFAULT 0,
  payment_status TEXT,
  shipping_status TEXT,
  tracking_number TEXT
);

-- Create Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  product_name TEXT,
  quantity INTEGER,
  unit_price NUMERIC,
  discount_applied NUMERIC DEFAULT 0,
  total_price NUMERIC
);

-- Create Shipping Rates Table
CREATE TABLE shipping_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  location TEXT,
  weight_range_min NUMERIC,
  weight_range_max NUMERIC,
  price NUMERIC
);

-- Add index for faster querying
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_order_items_order_id ON order_items (order_id);

-- Enable Row Level Security on Tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" 
ON users FOR SELECT 
USING (clerk_id = auth.uid()::text);

CREATE POLICY "Admin can view all user profiles" 
ON users FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert users" 
ON users FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update users" 
ON users FOR UPDATE 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE 
USING (clerk_id = auth.uid()::text);

-- Create policies for products table
CREATE POLICY "Anyone can view published products" 
ON products FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admin can view all products" 
ON products FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert products" 
ON products FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update products" 
ON products FOR UPDATE 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete products" 
ON products FOR DELETE 
USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for categories table
CREATE POLICY "Anyone can view categories" 
ON categories FOR SELECT 
USING (true);

CREATE POLICY "Admin can insert categories" 
ON categories FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update categories" 
ON categories FOR UPDATE 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete categories" 
ON categories FOR DELETE 
USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for orders table
CREATE POLICY "Users can view their own orders" 
ON orders FOR SELECT 
USING (user_id = auth.uid()::uuid);

CREATE POLICY "Admin can view all orders" 
ON orders FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert their own orders" 
ON orders FOR INSERT 
WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Admin can update orders" 
ON orders FOR UPDATE 
USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for order_items table
CREATE POLICY "Users can view their own order items" 
ON order_items FOR SELECT 
USING (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()::uuid
  )
);

CREATE POLICY "Admin can view all order items" 
ON order_items FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert their own order items" 
ON order_items FOR INSERT 
WITH CHECK (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()::uuid
  )
);

-- Create policies for store table (typically managed by admin only)
CREATE POLICY "Anyone can view store details" 
ON store FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage store details" 
ON store FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for shipping_rates
CREATE POLICY "Anyone can view shipping rates" 
ON shipping_rates FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage shipping rates" 
ON shipping_rates FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update timestamps
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_categories_timestamp
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_order_items_timestamp
BEFORE UPDATE ON order_items
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_store_timestamp
BEFORE UPDATE ON store
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_shipping_rates_timestamp
BEFORE UPDATE ON shipping_rates
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Function and trigger to automatically set trending products based on sales
CREATE OR REPLACE FUNCTION update_trending_products()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset all trending flags
  UPDATE products SET trending = FALSE;
  
  -- Set top 6 selling products as trending
  UPDATE products 
  SET trending = TRUE 
  WHERE id IN (
    SELECT p.id
    FROM products p
    ORDER BY p.number_of_people_bought DESC
    LIMIT 6
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update trending products after a product sale
CREATE TRIGGER update_trending_after_sale
AFTER INSERT OR UPDATE ON order_items
FOR EACH STATEMENT EXECUTE FUNCTION update_trending_products();

-- Also create a scheduled function to periodically update trending products
-- This can be called via a cron job or other scheduling mechanism
CREATE OR REPLACE FUNCTION refresh_trending_products()
RETURNS void AS $$
BEGIN
  PERFORM update_trending_products();
END;
$$ LANGUAGE plpgsql; 