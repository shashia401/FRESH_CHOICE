# Database Schema Documentation

## Overview

The Fresh Choice Inventory Management System uses a PostgreSQL database hosted on Supabase with comprehensive Row Level Security (RLS) policies. The schema is designed for multi-tenant architecture where each user has complete data isolation.

## Database Architecture

### Core Principles
- **Multi-tenant Design** - Complete data isolation between users
- **Row Level Security** - Database-level access control
- **Referential Integrity** - Proper foreign key relationships
- **Audit Trail** - Comprehensive timestamp tracking
- **Performance Optimized** - Strategic indexing for fast queries

## Table Definitions

### 1. inventory_items

The central table for all inventory management functionality.

```sql
CREATE TABLE inventory_items (
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
```

#### Key Fields
- **id** - Primary key (UUID)
- **user_id** - Foreign key to auth.users for data isolation
- **item_upc/item_sku** - Product identification codes
- **description** - Product name/description (required)
- **category** - Product category for organization
- **remaining_stock** - Current inventory level
- **sales_weekly** - Weekly sales velocity for forecasting
- **location/aisle/row/bin** - Precise warehouse location
- **expiration_date** - For perishable items
- **unit_cost/unit_retail** - Pricing information
- **gross_margin** - Calculated profit margin

#### Business Logic
- Automatically triggers shopping list additions when stock is low
- Tracks waste when items expire
- Supports bulk import from supplier invoices
- Maintains pricing history for analysis

### 2. vendors

Supplier and vendor relationship management.

```sql
CREATE TABLE vendors (
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
```

#### Key Fields
- **name** - Vendor company name (required)
- **contact_info** - Legacy field for backward compatibility
- **address/city/state/zip** - Complete address information
- **phone/email** - Primary contact methods
- **contact_person** - Primary contact name
- **payment_terms** - e.g., "Net 30", "Net 15"
- **tax_id** - Tax identification number

#### Relationships
- One-to-many with invoices
- Referenced by inventory_items for supplier tracking

### 3. invoices

Invoice tracking and payment management.

```sql
CREATE TABLE invoices (
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
```

#### Key Fields
- **invoice_number** - Unique invoice identifier
- **vendor_id** - Foreign key to vendors table
- **invoice_date** - Date of invoice
- **due_date** - Payment due date
- **status** - Payment status (paid, pending, overdue)
- **total_amount** - Total invoice value
- **document_url** - Link to original invoice document

#### Status Management
- **pending** - Awaiting payment
- **paid** - Payment completed
- **overdue** - Past due date

### 4. invoice_items

Individual line items for detailed invoice tracking.

```sql
CREATE TABLE invoice_items (
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
```

#### Key Fields
- **invoice_id** - Foreign key to invoices
- **inventory_id** - Links to inventory item (if exists)
- **description** - Item description
- **quantity** - Number of items
- **unit_cost/total_cost** - Pricing information
- **upc/sku** - Product identification for matching

#### Business Logic
- Used for automatic inventory updates from invoices
- Enables detailed cost analysis
- Supports invoice reconciliation

### 5. shopping_list_items

Automated and manual shopping list management.

```sql
CREATE TABLE shopping_list_items (
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
```

#### Key Fields
- **inventory_id** - Links to inventory item (for auto-generated items)
- **item_name** - Item description
- **quantity** - Suggested order quantity
- **purchased** - Completion status
- **priority** - Urgency level (low, medium, high, urgent)
- **reason** - Why item was added (e.g., "Low stock")

#### Priority Levels
- **urgent** - Out of stock items
- **high** - Critical low stock (≤5 items)
- **medium** - Low stock (≤10 items)
- **low** - Planned restocking

### 6. waste_items

Expired item tracking for waste analysis.

```sql
CREATE TABLE waste_items (
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
```

#### Key Fields
- **inventory_id** - Links to original inventory item
- **expired_on** - Date item expired
- **quantity** - Number of items wasted
- **value_lost** - Calculated monetary loss
- **reason** - Reason for waste (expired, damaged, etc.)

#### Analytics Support
- Enables waste trend analysis
- Calculates financial impact of waste
- Identifies problematic products

### 7. user_settings

User preferences and system configuration.

```sql
CREATE TABLE user_settings (
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
```

#### Key Fields
- **low_stock_threshold** - When to trigger low stock alerts
- **expiry_warning_days** - Days before expiration to warn
- **default_category/location** - Default values for new items
- **company_name** - User's company name
- **notifications_enabled** - System notification preferences
- **email_alerts** - Email notification preferences

## Security Implementation

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:

```sql
-- Example policy for inventory_items
CREATE POLICY "Users can manage their own inventory items"
  ON inventory_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Security Features
- **Data Isolation** - Complete separation between users
- **Authenticated Access** - All operations require authentication
- **Cascade Deletion** - User deletion removes all associated data
- **Audit Trail** - All changes tracked with timestamps

## Database Indexes

Strategic indexing for optimal performance:

```sql
-- Primary indexes for fast lookups
CREATE INDEX idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_upc ON inventory_items(item_upc);
CREATE INDEX idx_inventory_items_sku ON inventory_items(item_sku);
CREATE INDEX idx_inventory_items_expiration ON inventory_items(expiration_date);
CREATE INDEX idx_inventory_items_stock ON inventory_items(remaining_stock);

-- Vendor and invoice indexes
CREATE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_vendor_id ON invoices(vendor_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);

-- Shopping list and waste tracking
CREATE INDEX idx_shopping_list_user_id ON shopping_list_items(user_id);
CREATE INDEX idx_shopping_list_purchased ON shopping_list_items(purchased);
CREATE INDEX idx_waste_items_user_id ON waste_items(user_id);
CREATE INDEX idx_waste_items_expired_on ON waste_items(expired_on);
```

## Automated Functions & Triggers

### 1. Automatic Timestamp Updates

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

Applied to all tables with `updated_at` columns.

### 2. Auto Shopping List Generation

```sql
CREATE OR REPLACE FUNCTION auto_add_to_shopping_list()
RETURNS TRIGGER AS $$
BEGIN
  -- Add items to shopping list when stock falls below threshold
  IF NEW.remaining_stock <= 10 AND OLD.remaining_stock > 10 THEN
    INSERT INTO shopping_list_items (user_id, inventory_id, item_name, quantity, reason, priority)
    VALUES (
      NEW.user_id,
      NEW.id,
      NEW.description,
      GREATEST(NEW.sales_weekly * 2, 20),
      'Low stock (' || NEW.remaining_stock || ' remaining)',
      CASE 
        WHEN NEW.remaining_stock = 0 THEN 'urgent'
        WHEN NEW.remaining_stock <= 5 THEN 'high'
        ELSE 'medium'
      END
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';
```

### 3. Automatic Waste Tracking

```sql
CREATE OR REPLACE FUNCTION track_expired_items()
RETURNS TRIGGER AS $$
BEGIN
  -- Track waste when items expire
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
```

## Data Relationships

### Entity Relationship Diagram

```
auth.users (Supabase Auth)
    ↓ (1:many)
├── inventory_items
├── vendors
├── invoices
├── shopping_list_items
├── waste_items
└── user_settings (1:1)

vendors
    ↓ (1:many)
invoices
    ↓ (1:many)
invoice_items

inventory_items
    ↓ (1:many)
├── shopping_list_items (optional)
├── waste_items (optional)
└── invoice_items (optional)
```

### Key Relationships
- **Users to Data** - All user data is isolated via user_id foreign keys
- **Vendors to Invoices** - Track all invoices from each vendor
- **Invoices to Items** - Detailed line item tracking
- **Inventory to Lists** - Link shopping list items to inventory
- **Inventory to Waste** - Track waste from expired inventory

## Performance Considerations

### Query Optimization
- **Selective Indexes** - Indexes on frequently queried columns
- **Composite Indexes** - Multi-column indexes for complex queries
- **Partial Indexes** - Indexes on filtered data (e.g., non-expired items)

### Data Archiving
- **Soft Deletion** - Mark records as deleted rather than removing
- **Historical Data** - Maintain historical records for analytics
- **Cleanup Jobs** - Automated cleanup of old data

### Scaling Strategies
- **Connection Pooling** - Efficient database connection management
- **Read Replicas** - Separate read and write operations
- **Caching Layer** - Redis for frequently accessed data
- **Partitioning** - Table partitioning for large datasets

## Migration Strategy

### Version Control
- **Sequential Migrations** - Numbered migration files
- **Rollback Support** - Ability to reverse migrations
- **Environment Consistency** - Same schema across all environments

### Deployment Process
1. **Backup Database** - Full backup before migration
2. **Run Migration** - Apply schema changes
3. **Verify Data** - Ensure data integrity
4. **Update Application** - Deploy application changes
5. **Monitor Performance** - Watch for performance issues

## Backup & Recovery

### Backup Strategy
- **Automated Backups** - Daily full backups via Supabase
- **Point-in-Time Recovery** - Restore to any point in time
- **Cross-Region Replication** - Geographic backup distribution

### Recovery Procedures
- **Data Corruption** - Restore from clean backup
- **Accidental Deletion** - Point-in-time recovery
- **Schema Issues** - Migration rollback procedures

## Monitoring & Maintenance

### Performance Monitoring
- **Query Performance** - Monitor slow queries
- **Index Usage** - Track index effectiveness
- **Connection Metrics** - Monitor connection pool usage
- **Storage Growth** - Track database size growth

### Maintenance Tasks
- **Index Maintenance** - Rebuild fragmented indexes
- **Statistics Updates** - Keep query planner statistics current
- **Vacuum Operations** - PostgreSQL maintenance operations
- **Log Analysis** - Review database logs for issues

## Security Best Practices

### Access Control
- **Principle of Least Privilege** - Minimal required permissions
- **Regular Audits** - Review access permissions
- **Strong Authentication** - Multi-factor authentication
- **Session Management** - Secure session handling

### Data Protection
- **Encryption at Rest** - All data encrypted in storage
- **Encryption in Transit** - TLS for all connections
- **Data Masking** - Sensitive data protection
- **Audit Logging** - Complete audit trail

### Compliance
- **GDPR Compliance** - Data protection regulation compliance
- **Data Retention** - Appropriate data retention policies
- **Right to Deletion** - User data deletion capabilities
- **Privacy by Design** - Privacy considerations in schema design

---

This database schema provides a robust foundation for the Fresh Choice Inventory Management System, ensuring data integrity, security, and performance while supporting all business requirements.