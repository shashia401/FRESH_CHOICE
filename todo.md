# TODO: Remove Remaining Mock Data

This document lists all files that still contain mock data and provides clear instructions for replacing them with real backend integration.

## Pages

### 1. `src/pages/ReportsPage.tsx`

**Issues:**
- Mock weekly sales trend calculations using hardcoded multipliers (0.8, 0.9, 0.7, 1.1, 1.0)
- Category distribution derived from mock sales data

**Fix Instructions:**
```typescript
// REMOVE lines 76-84 (mock weekly trend calculation)
// REPLACE with:
const weeklyTrend = await reportsApi.getWeeklySalesTrend();
setSalesTrendData(weeklyTrend);

// ADD new API endpoint in server/routes/reports.js:
// GET /api/reports/weekly-sales-trend
// - Query actual sales data from database by week
// - Return array of {week: string, sales: number}
```

**Backend Changes Needed:**
- Create `reportsApi.getWeeklySalesTrend()` in `src/utils/api.ts`
- Add sales tracking table or use existing inventory sales data
- Implement weekly aggregation query

---

### 2. `src/pages/InvoicesPage.tsx`

**Issues:**
- `getInvoiceItems()` function generates mock invoice line items (lines 206-238)
- Mock invoice documents using `URL.createObjectURL()`
- Mock processing results

**Fix Instructions:**
```typescript
// REMOVE entire getInvoiceItems() function
// REPLACE handleViewInvoice() with:
const handleViewInvoice = async (invoice: Invoice) => {
  setSelectedInvoice(invoice);
  const items = await invoiceApi.getInvoiceItems(invoice.id);
  setInvoiceItems(items);
  setShowInvoiceDetailModal(true);
};

// REMOVE mock document handling
// REPLACE with real file upload to backend
```

**Backend Changes Needed:**
- Create `invoice_items` table with foreign key to invoices
- Add `invoiceApi.getInvoiceItems(invoiceId)` endpoint
- Implement file upload for invoice documents
- Add invoice CRUD operations to `server/routes/invoices.js`

---

### 3. `src/pages/DashboardPage.tsx`

**Issues:**
- Mock alerts generation (lines 84-111)
- Mock recent activity generation (lines 113-133)
- Hardcoded user "admin" in activity

**Fix Instructions:**
```typescript
// REPLACE mock alerts with:
const alerts = await dashboardApi.getAlerts();
setAlerts(alerts);

// REPLACE mock activity with:
const activity = await dashboardApi.getRecentActivity();
setRecentActivity(activity);

// GET real user info from auth context instead of hardcoded "admin"
```

**Backend Changes Needed:**
- Create `dashboardApi.getAlerts()` and `dashboardApi.getRecentActivity()`
- Add activity logging table to track user actions
- Implement alert rules engine for low stock/expiration detection

---

### 4. `src/pages/VendorsPage.tsx`

**Issues:**
- TODO comment: "Load invoice items from backend API" (line 123)
- Empty array fallback for invoice items

**Fix Instructions:**
```typescript
// IMPLEMENT the TODO on line 123:
const handleViewInvoice = async (invoice: Invoice) => {
  setSelectedInvoice(invoice);
  const items = await vendorApi.getInvoiceItems(invoice.id);
  setInvoiceItems(items);
  setShowInvoiceDetailModal(true);
};
```

**Backend Changes Needed:**
- Link invoice system to vendor management
- Add `vendorApi.getInvoiceItems(invoiceId)` endpoint

---

## Components

### 5. `src/components/inventory/ViewItemModal.tsx`

**Issues:**
- `generateSalesData()` creates mock historical & forecast sales (lines 47-78)
- `generateMovementData()` creates mock inventory movement (lines 81-103)

**Fix Instructions:**
```typescript
// REMOVE both generateSalesData() and generateMovementData() functions
// REPLACE with real API calls:

useEffect(() => {
  if (item) {
    const loadItemAnalytics = async () => {
      const [salesData, movementData] = await Promise.all([
        inventoryApi.getItemSalesHistory(item.id),
        inventoryApi.getItemMovementHistory(item.id)
      ]);
      setSalesData(salesData);
      setMovementData(movementData);
    };
    loadItemAnalytics();
  }
}, [item]);
```

**Backend Changes Needed:**
- Create sales history tracking table
- Create inventory movement/transaction log table
- Add APIs: `getItemSalesHistory()` and `getItemMovementHistory()`
- Implement actual sales forecasting algorithm

---

### 6. `src/components/inventory/ExportModal.tsx`

**Issues:**
- Mock data filtering in `getFilteredItems()` (lines 124-284)
- Mock calculations for suggested reorder quantities
- Mock priority assignments

**Fix Instructions:**
```typescript
// REPLACE mock calculations with business logic:
// Lines 165-166: Replace with configurable reorder rules
'Suggested Reorder': await getReorderQuantity(item),
'Priority': await calculatePriority(item),

// ADD reorder logic based on:
// - Lead times from vendors
// - Seasonal demand patterns
// - Safety stock requirements
```

**Backend Changes Needed:**
- Add reorder rules configuration table
- Implement intelligent reorder calculation algorithms
- Add vendor lead time tracking

---

### 7. `src/components/inventory/ImportModal.tsx`

**Issues:**
- `processImportData()` has mock validation logic (lines 90-185)
- Mock template generation in download function

**Fix Instructions:**
```typescript
// ENHANCE processImportData() with:
// - Real vendor validation against database
// - UPC uniqueness checking
// - Category validation against allowed categories
// - Proper error handling with specific validation messages

// REPLACE mock template with:
// - Dynamic template based on current inventory schema
// - Include real vendor options and categories
```

**Backend Changes Needed:**
- Add data validation endpoints
- Create configurable import templates
- Add bulk import API with transaction safety

---

### 8. `src/components/inventory/InventoryFilters.tsx`

**Issues:**
- Hardcoded arrays for categories and statuses (lines 23-24)

**Fix Instructions:**
```typescript
// REPLACE hardcoded arrays with dynamic data:
const [categories, setCategories] = useState<string[]>(['All']);
const [statuses] = useState(['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Expiring Soon']);

useEffect(() => {
  const loadCategories = async () => {
    const cats = await inventoryApi.getCategories();
    setCategories(['All', ...cats]);
  };
  loadCategories();
}, []);
```

**Backend Changes Needed:**
- Add `inventoryApi.getCategories()` endpoint
- Return distinct categories from inventory table
- Make categories configurable/manageable

---

### 9. `src/components/inventory/InventoryTable.tsx`

**Issues:**
- Mock badge logic for stock status (lines 24-28)
- Mock expiration badge logic (lines 30-40)

**Fix Instructions:**
```typescript
// REPLACE hardcoded thresholds with configurable settings:
const getStockBadge = (stock: number, lowStockThreshold: number) => {
  if (stock === 0) return <Badge variant="danger" size="sm">Out of Stock</Badge>;
  if (stock <= lowStockThreshold) return <Badge variant="warning" size="sm">Low Stock</Badge>;
  return <Badge variant="success" size="sm">In Stock</Badge>;
};

// MAKE expiration warnings configurable:
const getExpirationBadge = (expirationDate?: string, warningDays: number = 3) => {
  // Use configurable warning period instead of hardcoded 3 days
};
```

**Backend Changes Needed:**
- Add system settings/configuration table
- Allow configurable thresholds per category or item type
- Add user preferences for warning periods

---

## Backend

### 10. `server/database.js`

**Issues:**
- Default vendor with mock contact info (lines 112-115)

**Fix Instructions:**
```sql
-- REPLACE mock vendor data with:
INSERT OR IGNORE INTO vendors (id, name, contact_person, email, phone) 
VALUES (1, 'Setup Required', 'Please add vendor details', 'setup@yourstore.com', '000-000-0000');

-- OR remove entirely and handle empty vendor list in UI
```

**Backend Changes Needed:**
- Remove default vendor or make it more generic
- Add vendor setup wizard in UI
- Handle empty vendor states gracefully

---

## New Backend APIs Needed

### Reports API (`server/routes/reports.js`)
```javascript
// GET /api/reports/weekly-sales-trend
// GET /api/reports/category-performance
// GET /api/reports/vendor-analysis
```

### Dashboard API (`server/routes/dashboard.js`)
```javascript
// GET /api/dashboard/alerts
// GET /api/dashboard/recent-activity
// GET /api/dashboard/statistics
```

### Invoice API (`server/routes/invoices.js`)
```javascript
// GET /api/invoices/:id/items
// POST /api/invoices/:id/upload-document
// GET /api/invoices/:id/document
```

### Analytics API (`server/routes/analytics.js`)
```javascript
// GET /api/analytics/items/:id/sales-history
// GET /api/analytics/items/:id/movement-history
// GET /api/analytics/forecasting/:id
```

### Configuration API (`server/routes/config.js`)
```javascript
// GET /api/config/categories
// GET /api/config/reorder-rules
// POST /api/config/update-settings
```

---

## Database Schema Updates Needed

### New Tables to Create:
```sql
-- Sales history tracking
CREATE TABLE sales_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER REFERENCES inventory(id),
  date DATE,
  quantity_sold INTEGER,
  revenue REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory movements/transactions
CREATE TABLE inventory_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER REFERENCES inventory(id),
  movement_type TEXT, -- 'in', 'out', 'adjustment', 'waste'
  quantity INTEGER,
  reference_type TEXT, -- 'sale', 'delivery', 'manual', 'expiry'
  reference_id INTEGER,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System activity log
CREATE TABLE activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  action TEXT,
  entity_type TEXT,
  entity_id INTEGER,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice items
CREATE TABLE invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER,
  item_id INTEGER REFERENCES inventory(id),
  description TEXT,
  quantity INTEGER,
  unit_cost REAL,
  total_cost REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System configuration
CREATE TABLE system_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Priority Order for Implementation:

1. **High Priority** - Remove basic mock data:
   - InventoryFilters.tsx (categories from backend)
   - VendorsPage.tsx (implement TODO)
   - DashboardPage.tsx (real alerts & activity)

2. **Medium Priority** - Analytics & Reporting:
   - ViewItemModal.tsx (sales & movement history)
   - ReportsPage.tsx (real weekly trends)
   - ExportModal.tsx (intelligent calculations)

3. **Low Priority** - Advanced Features:
   - InvoicesPage.tsx (full invoice management)
   - ImportModal.tsx (enhanced validation)
   - Advanced analytics and forecasting

---

**Total Files to Update: 10 files + 5 new API routes + database schema**