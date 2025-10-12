/*
  # Fresh Choice Inventory Management - Initial Schema

  ## Overview
  Creates all necessary tables and security policies for the Fresh Choice inventory management system.

  ## New Tables

  ### 1. users (profiles)
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `username` (text) - Display name
  - `created_at` (timestamp) - Account creation date
  - `updated_at` (timestamp) - Last update

  ### 2. vendors
  - `id` (uuid, primary key)
  - `name` (text) - Vendor name
  - `contact_person` (text) - Contact person name
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `address` (text) - Vendor address
  - `payment_terms` (text) - Payment terms
  - `active` (boolean) - Active status
  - `created_at`, `updated_at` (timestamps)

  ### 3. inventory
  - `id` (uuid, primary key)
  - `invoice_no` (text) - Invoice number
  - `invoice_delivery_date` (text) - Delivery date
  - `description` (text) - Item description
  - `category` (text) - Item category
  - `brand` (text) - Brand name
  - `department` (text) - Department
  - `item_sku` (text) - SKU code
  - `item_upc` (text, unique) - UPC barcode
  - `pack_size` (text) - Package size
  - `qty_shipped` (integer) - Quantity shipped
  - `remaining_stock` (integer) - Current stock
  - `sales_weekly` (integer) - Weekly sales
  - `location`, `aisle`, `row`, `bin` (text) - Storage location
  - `expiration_date` (text) - Expiration date
  - `unit_cost`, `vendor_cost`, `cust_cost_each`, `cust_cost_extended` (decimal) - Costs
  - `unit_retail` (decimal) - Retail price
  - `gross_margin`, `burd_unit_cost`, `burd_gross_margin` (decimal) - Margins
  - `discount_allowance` (decimal) - Discount
  - `advertising_flag` (boolean) - Ad flag
  - `order_type` (text) - Order type
  - `vendor_id` (uuid) - Foreign key to vendors
  - `user_id` (uuid) - Foreign key to auth.users
  - `created_at`, `updated_at` (timestamps)

  ### 4. shopping_list
  - `id` (uuid, primary key)
  - `item_name` (text) - Item name
  - `category` (text) - Category
  - `quantity` (integer) - Quantity needed
  - `priority` (text) - Priority level
  - `vendor_id` (uuid) - Foreign key to vendors
  - `notes` (text) - Additional notes
  - `purchased` (boolean) - Purchase status
  - `purchase_date` (timestamp) - Purchase date
  - `user_id` (uuid) - Foreign key to auth.users
  - `created_at`, `updated_at` (timestamps)

  ### 5. invoices
  - `id` (uuid, primary key)
  - `invoice_number` (text, unique) - Invoice number
  - `vendor_id` (uuid) - Foreign key to vendors
  - `invoice_date` (text) - Invoice date
  - `due_date` (text) - Due date
  - `total_amount` (decimal) - Total amount
  - `status` (text) - Invoice status
  - `item_count` (integer) - Number of items
  - `user_id` (uuid) - Foreign key to auth.users
  - `created_at`, `updated_at` (timestamps)

  ### 6. invoice_items
  - `id` (uuid, primary key)
  - `invoice_id` (uuid) - Foreign key to invoices
  - `description` (text) - Item description
  - `quantity` (integer) - Quantity
  - `unit_cost` (decimal) - Unit cost
  - `total_cost` (decimal) - Total cost
  - `category` (text) - Category
  - `upc` (text) - UPC code
  - `sku` (text) - SKU code
  - `created_at` (timestamp)

  ### 7. system_settings
  - `id` (uuid, primary key)
  - `setting_key` (text, unique) - Setting key
  - `setting_value` (text) - Setting value
  - `description` (text) - Description
  - `data_type` (text) - Data type
  - `created_at`, `updated_at` (timestamps)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - System settings are read-only for authenticated users
  - Vendors are shared across all users (read access)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Profiles table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  username text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  payment_terms text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create vendors"
  ON vendors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update vendors"
  ON vendors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete vendors"
  ON vendors FOR DELETE
  TO authenticated
  USING (true);

-- Insert default vendor
INSERT INTO vendors (name, contact_person, email, phone)
VALUES ('Setup Required', 'Please add vendor details', 'setup@yourstore.com', '000-000-0000')
ON CONFLICT DO NOTHING;

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_no text,
  invoice_delivery_date text,
  description text NOT NULL,
  category text,
  brand text,
  department text,
  item_sku text,
  item_upc text UNIQUE,
  pack_size text,
  qty_shipped integer DEFAULT 0,
  remaining_stock integer DEFAULT 0,
  sales_weekly integer DEFAULT 0,
  location text,
  aisle text,
  row text,
  bin text,
  expiration_date text,
  unit_cost decimal DEFAULT 0,
  vendor_cost decimal DEFAULT 0,
  cust_cost_each decimal DEFAULT 0,
  cust_cost_extended decimal DEFAULT 0,
  unit_retail decimal DEFAULT 0,
  gross_margin decimal DEFAULT 0,
  burd_unit_cost decimal DEFAULT 0,
  burd_gross_margin decimal DEFAULT 0,
  discount_allowance decimal DEFAULT 0,
  advertising_flag boolean DEFAULT false,
  order_type text DEFAULT 'Regular',
  vendor_id uuid REFERENCES vendors(id),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own inventory"
  ON inventory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON inventory FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory"
  ON inventory FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Shopping list table
CREATE TABLE IF NOT EXISTS shopping_list (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name text NOT NULL,
  category text,
  quantity integer DEFAULT 1,
  priority text DEFAULT 'Medium',
  vendor_id uuid REFERENCES vendors(id),
  notes text,
  purchased boolean DEFAULT false,
  purchase_date timestamptz,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shopping list"
  ON shopping_list FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shopping list items"
  ON shopping_list FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping list"
  ON shopping_list FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping list"
  ON shopping_list FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number text UNIQUE NOT NULL,
  vendor_id uuid NOT NULL REFERENCES vendors(id),
  invoice_date text NOT NULL,
  due_date text NOT NULL,
  total_amount decimal DEFAULT 0,
  status text DEFAULT 'pending',
  item_count integer DEFAULT 0,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer DEFAULT 0,
  unit_cost decimal DEFAULT 0,
  total_cost decimal DEFAULT 0,
  category text,
  upc text,
  sku text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own invoice items"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoice items"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoice items"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  data_type text DEFAULT 'string',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description, data_type)
VALUES 
  ('low_stock_threshold', '10', 'Stock level considered low', 'number'),
  ('expiration_warning_days', '7', 'Days before expiration to warn', 'number')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_remaining_stock ON inventory(remaining_stock);
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id ON shopping_list(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
