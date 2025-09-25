/*
  # Complete Fresh Choice Inventory Management Schema

  1. New Tables
    - `inventory_items` - Main inventory table with all product details
    - `vendors` - Vendor/supplier information
    - `invoices` - Invoice tracking
    - `invoice_items` - Individual items on invoices
    - `shopping_list_items` - Shopping list management
    - `waste_items` - Expired/wasted item tracking
    - `user_settings` - User preferences and settings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure data isolation between users

  3. Features
    - Full inventory management with detailed product information
    - Vendor relationship management
    - Invoice processing and tracking
    - Shopping list automation
    - Waste tracking for expired items
    - User settings and preferences
*/

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_no text,
  invoice_delivery_date date,
  category text NOT NULL DEFAULT 'General',
  brand text,
  department text DEFAULT 'General',
  item_upc text,
  item_sku text,
  description text NOT NULL,
  pack_size text,
  qty_shipped integer DEFAULT 0,
  remaining_stock integer DEFAULT 0,
  items_per_carton integer,
  sales_weekly integer DEFAULT 0,
  location text,
  aisle text,
  row text,
  bin text,
  expiration_date date,
  unit_cost decimal(10,2),
  vendor_cost decimal(10,2),
  cust_cost_each decimal(10,2),
  cust_cost_extended decimal(10,2),
  unit_retail decimal(10,2),
  gross_margin decimal(5,4),
  burd_unit_cost decimal(10,2),
  burd_gross_margin decimal(5,4),
  discount_allowance decimal(10,2),
  advertising_flag boolean DEFAULT false,
  order_type text DEFAULT 'Regular',
  vendor_id integer,
  vendor_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  contact_info text,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  email text,
  website text,
  contact_person text,
  payment_terms text,
  tax_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_number text NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  vendor_name text,
  invoice_date date NOT NULL,
  due_date date,
  total_amount decimal(10,2) DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  item_count integer DEFAULT 0,
  document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  inventory_id uuid REFERENCES inventory_items(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_cost decimal(10,2) DEFAULT 0,
  total_cost decimal(10,2) DEFAULT 0,
  category text,
  upc text,
  sku text,
  created_at timestamptz DEFAULT now()
);

-- Create shopping_list_items table
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  inventory_id uuid REFERENCES inventory_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  purchased boolean DEFAULT false,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create waste_items table
CREATE TABLE IF NOT EXISTS waste_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  inventory_id uuid REFERENCES inventory_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  expired_on date NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  value_lost decimal(10,2) DEFAULT 0,
  reason text DEFAULT 'expired',
  created_at timestamptz DEFAULT now()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  low_stock_threshold integer DEFAULT 10,
  expiry_warning_days integer DEFAULT 3,
  default_category text DEFAULT 'General',
  default_location text DEFAULT 'Warehouse A',
  company_name text,
  notifications_enabled boolean DEFAULT true,
  email_alerts boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_items
CREATE POLICY "Users can manage their own inventory items"
  ON inventory_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for vendors
CREATE POLICY "Users can manage their own vendors"
  ON vendors
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for invoices
CREATE POLICY "Users can manage their own invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for invoice_items
CREATE POLICY "Users can manage their own invoice items"
  ON invoice_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for shopping_list_items
CREATE POLICY "Users can manage their own shopping list items"
  ON shopping_list_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for waste_items
CREATE POLICY "Users can manage their own waste items"
  ON waste_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can manage their own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_upc ON inventory_items(item_upc);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(item_sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiration ON inventory_items(expiration_date);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON inventory_items(remaining_stock);

CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_vendor_id ON invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);

CREATE INDEX IF NOT EXISTS idx_invoice_items_user_id ON invoice_items(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id ON shopping_list_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_purchased ON shopping_list_items(purchased);

CREATE INDEX IF NOT EXISTS idx_waste_items_user_id ON waste_items(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_items_expired_on ON waste_items(expired_on);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_list_updated_at
  BEFORE UPDATE ON shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically add low stock items to shopping list
CREATE OR REPLACE FUNCTION auto_add_to_shopping_list()
RETURNS TRIGGER AS $$
BEGIN
  -- If stock falls below threshold and item isn't already in shopping list
  IF NEW.remaining_stock <= 10 AND OLD.remaining_stock > 10 THEN
    INSERT INTO shopping_list_items (user_id, inventory_id, item_name, quantity, reason, priority)
    VALUES (
      NEW.user_id,
      NEW.id,
      NEW.description,
      GREATEST(NEW.sales_weekly * 2, 20), -- Suggest 2 weeks worth or minimum 20
      'Low stock (' || NEW.remaining_stock || ' remaining)',
      CASE 
        WHEN NEW.remaining_stock = 0 THEN 'urgent'
        WHEN NEW.remaining_stock <= 5 THEN 'high'
        ELSE 'medium'
      END
    )
    ON CONFLICT DO NOTHING; -- Avoid duplicates if item already exists
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto shopping list
CREATE TRIGGER auto_shopping_list_trigger
  AFTER UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION auto_add_to_shopping_list();

-- Function to track waste when items expire
CREATE OR REPLACE FUNCTION track_expired_items()
RETURNS TRIGGER AS $$
BEGIN
  -- If expiration date passes and item has stock, add to waste tracking
  IF NEW.expiration_date < CURRENT_DATE AND NEW.remaining_stock > 0 AND 
     (OLD.expiration_date IS NULL OR OLD.expiration_date >= CURRENT_DATE) THEN
    INSERT INTO waste_items (user_id, inventory_id, item_name, expired_on, quantity, value_lost)
    VALUES (
      NEW.user_id,
      NEW.id,
      NEW.description,
      NEW.expiration_date,
      NEW.remaining_stock,
      NEW.remaining_stock * COALESCE(NEW.unit_cost, 0)
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for waste tracking
CREATE TRIGGER track_waste_trigger
  AFTER UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION track_expired_items();