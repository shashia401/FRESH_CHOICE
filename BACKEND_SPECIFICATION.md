# Backend Specification for Fresh Choice Inventory Management System

## Overview

This document outlines the comprehensive backend architecture designed for seamless integration with the existing React frontend. The backend is built on Supabase with additional custom services to provide a robust, scalable, and secure foundation for the inventory management system.

## Backend Architecture Philosophy

### Core Principles
- **API-First Design** - RESTful APIs with GraphQL capabilities
- **Real-time by Default** - Live data synchronization across all clients
- **Security by Design** - Multi-layered security with zero-trust architecture
- **Microservices Ready** - Modular design for future scaling
- **Event-Driven Architecture** - Asynchronous processing for better performance
- **Data Consistency** - ACID transactions with eventual consistency where appropriate

### Technology Stack

#### Primary Backend Services
- **Supabase** - Core backend-as-a-service platform
- **PostgreSQL 15+** - Primary database with advanced features
- **Deno/Node.js** - Edge functions and custom services
- **Redis** - Caching and session management
- **MinIO/S3** - File storage and document management
- **Elasticsearch** - Advanced search and analytics

#### Supporting Services
- **Docker** - Containerization for consistent deployments
- **Nginx** - Reverse proxy and load balancing
- **Prometheus** - Metrics collection and monitoring
- **Grafana** - Visualization and alerting
- **Sentry** - Error tracking and performance monitoring

## API Architecture

### RESTful API Design

#### Base URL Structure
```
https://api.freshchoice.com/v1/
├── auth/                    # Authentication endpoints
├── inventory/               # Inventory management
├── vendors/                 # Vendor management
├── invoices/                # Invoice processing
├── shopping-lists/          # Shopping list management
├── reports/                 # Analytics and reporting
├── users/                   # User management
├── settings/                # System configuration
└── webhooks/                # External integrations
```

#### Standard Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
  };
}
```

#### HTTP Status Code Standards
- **200 OK** - Successful GET, PUT, PATCH
- **201 Created** - Successful POST
- **204 No Content** - Successful DELETE
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource conflict
- **422 Unprocessable Entity** - Validation errors
- **429 Too Many Requests** - Rate limiting
- **500 Internal Server Error** - Server errors

### Authentication & Authorization API

#### Authentication Endpoints
```typescript
// POST /auth/login
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// POST /auth/register
interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  companyName?: string;
  acceptTerms: boolean;
}

// POST /auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

// POST /auth/logout
interface LogoutRequest {
  refreshToken: string;
}

// POST /auth/forgot-password
interface ForgotPasswordRequest {
  email: string;
}

// POST /auth/reset-password
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
```

#### Authorization Middleware
```typescript
// JWT Token Validation
interface JWTPayload {
  sub: string;        // User ID
  email: string;      // User email
  role: string;       // User role
  permissions: string[]; // User permissions
  iat: number;        // Issued at
  exp: number;        // Expires at
}

// Role-based Access Control
enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer'
}

// Permission System
enum Permission {
  INVENTORY_READ = 'inventory:read',
  INVENTORY_WRITE = 'inventory:write',
  INVENTORY_DELETE = 'inventory:delete',
  VENDOR_MANAGE = 'vendor:manage',
  INVOICE_PROCESS = 'invoice:process',
  REPORTS_VIEW = 'reports:view',
  SETTINGS_MANAGE = 'settings:manage'
}
```

### Inventory Management API

#### Core Inventory Endpoints
```typescript
// GET /inventory
interface GetInventoryQuery {
  page?: number;
  limit?: number;
  category?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring';
  search?: string;
  sortBy?: 'name' | 'stock' | 'expiry' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  location?: string;
  vendor?: string;
}

// POST /inventory
interface CreateInventoryItemRequest {
  description: string;
  category: string;
  brand?: string;
  department?: string;
  itemSku?: string;
  itemUpc?: string;
  packSize?: string;
  qtyShipped: number;
  remainingStock: number;
  salesWeekly?: number;
  location?: string;
  aisle?: string;
  row?: string;
  bin?: string;
  expirationDate?: string;
  unitCost?: number;
  vendorCost?: number;
  custCostEach?: number;
  unitRetail?: number;
  advertisingFlag?: boolean;
  orderType?: string;
  vendorId?: string;
}

// PUT /inventory/:id
interface UpdateInventoryItemRequest extends Partial<CreateInventoryItemRequest> {
  id: string;
}

// DELETE /inventory/:id
// Returns 204 No Content on success

// POST /inventory/bulk-import
interface BulkImportRequest {
  file: File; // CSV/Excel file
  options: {
    skipDuplicates: boolean;
    updateExisting: boolean;
    validateOnly: boolean;
  };
}

interface BulkImportResponse {
  processed: number;
  created: number;
  updated: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
}

// GET /inventory/:id/history
interface InventoryHistoryResponse {
  changes: Array<{
    id: string;
    field: string;
    oldValue: any;
    newValue: any;
    changedBy: string;
    changedAt: string;
    reason?: string;
  }>;
}

// POST /inventory/:id/adjust-stock
interface StockAdjustmentRequest {
  adjustment: number; // Positive for increase, negative for decrease
  reason: string;
  notes?: string;
}
```

#### Advanced Inventory Features
```typescript
// GET /inventory/analytics
interface InventoryAnalyticsResponse {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  expiringItems: number;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    value: number;
  }>;
  topMovingItems: Array<{
    id: string;
    name: string;
    salesVelocity: number;
  }>;
  slowMovingItems: Array<{
    id: string;
    name: string;
    daysSinceLastSale: number;
  }>;
}

// GET /inventory/forecasting
interface ForecastingQuery {
  itemId?: string;
  category?: string;
  period: 'week' | 'month' | 'quarter';
  horizon: number; // Number of periods to forecast
}

interface ForecastingResponse {
  forecasts: Array<{
    itemId: string;
    itemName: string;
    predictions: Array<{
      period: string;
      predictedDemand: number;
      confidence: number;
      factors: string[];
    }>;
  }>;
}

// POST /inventory/barcode-lookup
interface BarcodeLookupRequest {
  barcode: string;
  type: 'upc' | 'ean' | 'code128';
}

interface BarcodeLookupResponse {
  found: boolean;
  item?: InventoryItem;
  suggestions?: Array<{
    name: string;
    brand: string;
    category: string;
    confidence: number;
  }>;
}
```

### Vendor Management API

#### Vendor Endpoints
```typescript
// GET /vendors
interface GetVendorsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  sortBy?: 'name' | 'created_at' | 'last_order';
}

// POST /vendors
interface CreateVendorRequest {
  name: string;
  contactInfo?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  paymentTerms?: string;
  taxId?: string;
  notes?: string;
}

// GET /vendors/:id/performance
interface VendorPerformanceResponse {
  vendorId: string;
  metrics: {
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
    onTimeDeliveryRate: number;
    qualityScore: number;
    responseTime: number; // Average response time in hours
  };
  trends: Array<{
    month: string;
    orders: number;
    value: number;
    deliveryScore: number;
  }>;
}

// GET /vendors/:id/products
interface VendorProductsResponse {
  products: Array<{
    id: string;
    name: string;
    category: string;
    unitCost: number;
    lastOrderDate: string;
    totalOrdered: number;
    averageLeadTime: number;
  }>;
}
```

### Invoice Processing API

#### Invoice Management
```typescript
// POST /invoices/upload
interface InvoiceUploadRequest {
  file: File; // PDF, CSV, or Excel
  vendorId?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
}

interface InvoiceUploadResponse {
  invoiceId: string;
  status: 'processing' | 'completed' | 'failed';
  extractedData?: {
    invoiceNumber: string;
    vendorName: string;
    invoiceDate: string;
    totalAmount: number;
    items: Array<{
      description: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
      upc?: string;
      sku?: string;
    }>;
  };
  matchingResults?: {
    matched: number;
    unmatched: number;
    conflicts: Array<{
      item: string;
      issue: string;
      suggestions: string[];
    }>;
  };
}

// GET /invoices
interface GetInvoicesQuery {
  page?: number;
  limit?: number;
  vendorId?: string;
  status?: 'paid' | 'pending' | 'overdue';
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

// PUT /invoices/:id/status
interface UpdateInvoiceStatusRequest {
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
}

// POST /invoices/:id/reconcile
interface ReconcileInvoiceRequest {
  adjustments: Array<{
    itemId: string;
    expectedQuantity: number;
    actualQuantity: number;
    reason: string;
  }>;
}
```

### Shopping List API

#### Shopping List Management
```typescript
// GET /shopping-lists
interface GetShoppingListsQuery {
  status?: 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  autoGenerated?: boolean;
}

// POST /shopping-lists/generate
interface GenerateShoppingListRequest {
  criteria: {
    lowStockThreshold?: number;
    daysAhead?: number;
    categories?: string[];
    vendors?: string[];
    includeExpiring?: boolean;
  };
}

interface GenerateShoppingListResponse {
  listId: string;
  items: Array<{
    inventoryId?: string;
    itemName: string;
    suggestedQuantity: number;
    priority: string;
    reason: string;
    estimatedCost: number;
    preferredVendor?: string;
  }>;
  totalEstimatedCost: number;
}

// PUT /shopping-lists/:id/items/:itemId
interface UpdateShoppingListItemRequest {
  quantity?: number;
  purchased?: boolean;
  actualCost?: number;
  vendor?: string;
  notes?: string;
}

// POST /shopping-lists/:id/optimize
interface OptimizeShoppingListRequest {
  criteria: {
    minimizeCost: boolean;
    preferredVendors: string[];
    consolidateOrders: boolean;
    respectMinimumOrders: boolean;
  };
}
```

### Reports & Analytics API

#### Reporting Endpoints
```typescript
// GET /reports/consumption
interface ConsumptionReportQuery {
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
  category?: string;
  groupBy?: 'item' | 'category' | 'vendor';
}

interface ConsumptionReportResponse {
  summary: {
    totalItems: number;
    totalValue: number;
    averageVelocity: number;
  };
  data: Array<{
    name: string;
    consumption: number;
    trend: number; // Percentage change
    forecast: number;
    stockDays: number;
  }>;
}

// GET /reports/waste
interface WasteReportResponse {
  summary: {
    totalWastedItems: number;
    totalWastedValue: number;
    wastePercentage: number;
  };
  breakdown: Array<{
    category: string;
    wastedItems: number;
    wastedValue: number;
    topWastedProducts: Array<{
      name: string;
      quantity: number;
      value: number;
      reason: string;
    }>;
  }>;
  trends: Array<{
    period: string;
    wastedValue: number;
    wastedItems: number;
  }>;
}

// GET /reports/vendor-performance
interface VendorPerformanceReportResponse {
  vendors: Array<{
    id: string;
    name: string;
    metrics: {
      totalOrders: number;
      totalValue: number;
      averageMargin: number;
      deliveryScore: number;
      qualityScore: number;
      responseTime: number;
    };
    ranking: number;
  }>;
}

// POST /reports/custom
interface CustomReportRequest {
  name: string;
  description?: string;
  query: {
    tables: string[];
    fields: string[];
    filters: Array<{
      field: string;
      operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'like';
      value: any;
    }>;
    groupBy?: string[];
    orderBy?: Array<{
      field: string;
      direction: 'asc' | 'desc';
    }>;
  };
  visualization?: {
    type: 'table' | 'chart' | 'graph';
    options: any;
  };
}
```

## Real-time Features

### WebSocket API

#### Connection Management
```typescript
// WebSocket connection endpoint
const wsUrl = 'wss://api.freshchoice.com/ws';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  userId: string;
}

// Subscription types
enum SubscriptionType {
  INVENTORY_CHANGES = 'inventory:changes',
  LOW_STOCK_ALERTS = 'alerts:low_stock',
  EXPIRY_WARNINGS = 'alerts:expiry',
  INVOICE_UPDATES = 'invoices:updates',
  SHOPPING_LIST_CHANGES = 'shopping_list:changes',
  USER_ACTIVITY = 'user:activity'
}
```

#### Real-time Events
```typescript
// Inventory change events
interface InventoryChangeEvent {
  type: 'inventory:stock_updated';
  payload: {
    itemId: string;
    oldStock: number;
    newStock: number;
    reason: string;
    updatedBy: string;
  };
}

// Alert events
interface LowStockAlert {
  type: 'alert:low_stock';
  payload: {
    itemId: string;
    itemName: string;
    currentStock: number;
    threshold: number;
    category: string;
    location: string;
  };
}

interface ExpiryWarning {
  type: 'alert:expiry_warning';
  payload: {
    itemId: string;
    itemName: string;
    expiryDate: string;
    daysUntilExpiry: number;
    currentStock: number;
  };
}
```

### Push Notifications

#### Notification Service
```typescript
// POST /notifications/subscribe
interface NotificationSubscriptionRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  preferences: {
    lowStock: boolean;
    expiry: boolean;
    invoices: boolean;
    reports: boolean;
  };
}

// POST /notifications/send
interface SendNotificationRequest {
  userId?: string;
  userIds?: string[];
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    url?: string;
  }>;
}
```

## Data Processing & Analytics

### Background Jobs

#### Job Queue System
```typescript
// Job types
enum JobType {
  INVENTORY_SYNC = 'inventory:sync',
  REPORT_GENERATION = 'report:generate',
  DATA_BACKUP = 'data:backup',
  EMAIL_NOTIFICATION = 'email:send',
  INVOICE_PROCESSING = 'invoice:process',
  FORECAST_CALCULATION = 'forecast:calculate'
}

// Job scheduling
interface ScheduleJobRequest {
  type: JobType;
  payload: any;
  schedule?: {
    cron?: string;
    delay?: number;
    repeat?: {
      every: number;
      limit?: number;
    };
  };
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

// Job monitoring
interface JobStatus {
  id: string;
  type: JobType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}
```

#### Scheduled Tasks
```typescript
// Daily tasks
const dailyTasks = [
  {
    name: 'Check Expiring Items',
    schedule: '0 6 * * *', // 6 AM daily
    job: 'inventory:check_expiry'
  },
  {
    name: 'Generate Low Stock Alerts',
    schedule: '0 8 * * *', // 8 AM daily
    job: 'inventory:low_stock_check'
  },
  {
    name: 'Update Sales Forecasts',
    schedule: '0 2 * * *', // 2 AM daily
    job: 'forecast:update_predictions'
  }
];

// Weekly tasks
const weeklyTasks = [
  {
    name: 'Generate Weekly Reports',
    schedule: '0 9 * * 1', // 9 AM every Monday
    job: 'report:weekly_summary'
  },
  {
    name: 'Vendor Performance Analysis',
    schedule: '0 10 * * 1', // 10 AM every Monday
    job: 'vendor:performance_analysis'
  }
];
```

### Machine Learning Integration

#### Demand Forecasting
```typescript
// POST /ml/forecast/demand
interface DemandForecastRequest {
  itemIds?: string[];
  categories?: string[];
  horizon: number; // Days to forecast
  includeSeasonality: boolean;
  includePromotions: boolean;
}

interface DemandForecastResponse {
  forecasts: Array<{
    itemId: string;
    predictions: Array<{
      date: string;
      predictedDemand: number;
      confidence: number;
      factors: Array<{
        name: string;
        impact: number;
      }>;
    }>;
    accuracy: {
      mape: number; // Mean Absolute Percentage Error
      rmse: number; // Root Mean Square Error
    };
  }>;
}

// POST /ml/optimize/inventory
interface InventoryOptimizationRequest {
  constraints: {
    maxBudget?: number;
    storageCapacity?: number;
    minServiceLevel: number;
  };
  objectives: {
    minimizeCost: boolean;
    maximizeServiceLevel: boolean;
    minimizeWaste: boolean;
  };
}
```

#### Anomaly Detection
```typescript
// GET /ml/anomalies
interface AnomalyDetectionResponse {
  anomalies: Array<{
    type: 'demand_spike' | 'demand_drop' | 'cost_increase' | 'quality_issue';
    itemId: string;
    itemName: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    detectedAt: string;
    suggestedActions: string[];
  }>;
}
```

## File Storage & Document Management

### Document Storage API

#### File Upload
```typescript
// POST /files/upload
interface FileUploadRequest {
  file: File;
  category: 'invoice' | 'product_image' | 'document' | 'report';
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    relatedId?: string; // Related entity ID
  };
}

interface FileUploadResponse {
  fileId: string;
  url: string;
  thumbnailUrl?: string;
  metadata: {
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  };
}

// GET /files/:id
// Returns file stream or redirect to CDN URL

// DELETE /files/:id
// Soft delete with retention policy
```

#### Document Processing
```typescript
// POST /files/:id/process
interface DocumentProcessingRequest {
  type: 'ocr' | 'invoice_extraction' | 'image_analysis';
  options?: {
    language?: string;
    extractTables?: boolean;
    detectObjects?: boolean;
  };
}

interface DocumentProcessingResponse {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  result?: {
    text?: string;
    tables?: any[];
    objects?: any[];
    extractedData?: any;
  };
}
```

## Integration APIs

### Third-party Integrations

#### ERP System Integration
```typescript
// POST /integrations/erp/sync
interface ERPSyncRequest {
  system: 'sap' | 'oracle' | 'quickbooks' | 'custom';
  entities: ('inventory' | 'vendors' | 'invoices')[];
  direction: 'import' | 'export' | 'bidirectional';
  schedule?: string; // Cron expression
}

// Webhook endpoints for external systems
// POST /webhooks/erp/inventory-update
// POST /webhooks/pos/sales-data
// POST /webhooks/supplier/price-update
```

#### E-commerce Integration
```typescript
// POST /integrations/ecommerce/sync
interface EcommerceSyncRequest {
  platform: 'shopify' | 'woocommerce' | 'magento' | 'custom';
  syncInventory: boolean;
  syncPricing: boolean;
  autoUpdateStock: boolean;
}
```

### API Rate Limiting

#### Rate Limit Configuration
```typescript
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message: string; // Error message when limit exceeded
  standardHeaders: boolean; // Return rate limit info in headers
  legacyHeaders: boolean; // Return legacy headers
}

// Different limits for different endpoints
const rateLimits = {
  '/auth/*': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
  '/inventory': { windowMs: 60 * 1000, max: 100 }, // 100 requests per minute
  '/reports/*': { windowMs: 60 * 1000, max: 10 }, // 10 requests per minute
  '/files/upload': { windowMs: 60 * 1000, max: 20 } // 20 uploads per minute
};
```

## Database Layer

### Advanced Database Features

#### Connection Pooling
```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  pool: {
    min: number; // Minimum connections
    max: number; // Maximum connections
    acquireTimeoutMillis: number;
    idleTimeoutMillis: number;
    reapIntervalMillis: number;
  };
  ssl: boolean;
  logging: boolean;
}
```

#### Query Optimization
```sql
-- Materialized views for complex reports
CREATE MATERIALIZED VIEW inventory_summary AS
SELECT 
  category,
  COUNT(*) as total_items,
  SUM(remaining_stock * unit_cost) as total_value,
  AVG(remaining_stock) as avg_stock,
  COUNT(CASE WHEN remaining_stock <= 10 THEN 1 END) as low_stock_count
FROM inventory_items
WHERE user_id = auth.uid()
GROUP BY category;

-- Refresh materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY inventory_summary;

-- Partial indexes for better performance
CREATE INDEX CONCURRENTLY idx_inventory_low_stock 
ON inventory_items (user_id, category) 
WHERE remaining_stock <= 10;

-- Full-text search index
CREATE INDEX CONCURRENTLY idx_inventory_search 
ON inventory_items 
USING GIN (to_tsvector('english', description || ' ' || COALESCE(brand, '')));
```

#### Database Functions
```sql
-- Function to calculate reorder points
CREATE OR REPLACE FUNCTION calculate_reorder_point(
  item_id UUID,
  lead_time_days INTEGER DEFAULT 7,
  safety_stock_days INTEGER DEFAULT 3
) RETURNS INTEGER AS $$
DECLARE
  daily_usage DECIMAL;
  reorder_point INTEGER;
BEGIN
  SELECT sales_weekly / 7.0 INTO daily_usage
  FROM inventory_items
  WHERE id = item_id;
  
  reorder_point := CEIL(daily_usage * (lead_time_days + safety_stock_days));
  
  RETURN GREATEST(reorder_point, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to update inventory from invoice
CREATE OR REPLACE FUNCTION process_invoice_items(
  invoice_id UUID,
  items JSONB
) RETURNS VOID AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    -- Update existing inventory or create new item
    INSERT INTO inventory_items (
      user_id, description, item_upc, remaining_stock, unit_cost
    ) VALUES (
      auth.uid(),
      item->>'description',
      item->>'upc',
      (item->>'quantity')::INTEGER,
      (item->>'unit_cost')::DECIMAL
    )
    ON CONFLICT (user_id, item_upc) 
    DO UPDATE SET
      remaining_stock = inventory_items.remaining_stock + (item->>'quantity')::INTEGER,
      unit_cost = (item->>'unit_cost')::DECIMAL,
      updated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## Monitoring & Observability

### Application Performance Monitoring

#### Metrics Collection
```typescript
// Custom metrics
interface ApplicationMetrics {
  requests: {
    total: number;
    success: number;
    errors: number;
    averageResponseTime: number;
  };
  database: {
    connections: number;
    queryTime: number;
    slowQueries: number;
  };
  business: {
    activeUsers: number;
    inventoryItems: number;
    dailyTransactions: number;
    systemHealth: 'healthy' | 'degraded' | 'down';
  };
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    services: {
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      storage: await checkStorageHealth(),
      external: await checkExternalServices()
    },
    metrics: await getApplicationMetrics()
  };
  
  const overallStatus = Object.values(health.services).every(s => s.status === 'healthy')
    ? 'healthy' : 'degraded';
    
  res.status(overallStatus === 'healthy' ? 200 : 503).json(health);
});
```

#### Error Tracking
```typescript
// Structured error logging
interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context: {
    userId?: string;
    requestId: string;
    endpoint: string;
    userAgent?: string;
    ip?: string;
  };
  metadata?: any;
}

// Error handling middleware
const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorLog: ErrorLog = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    level: 'error',
    message: error.message,
    stack: error.stack,
    context: {
      userId: req.user?.id,
      requestId: req.id,
      endpoint: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    }
  };
  
  // Send to monitoring service
  monitoringService.logError(errorLog);
  
  // Return appropriate response
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred',
      requestId: req.id
    }
  });
};
```

### Logging Strategy

#### Structured Logging
```typescript
// Log levels and structure
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  version: string;
  environment: string;
  context: {
    userId?: string;
    requestId?: string;
    sessionId?: string;
    traceId?: string;
  };
  metadata?: any;
}

// Logger implementation
class Logger {
  private service: string;
  private version: string;
  private environment: string;
  
  constructor(service: string) {
    this.service = service;
    this.version = process.env.APP_VERSION || '1.0.0';
    this.environment = process.env.NODE_ENV || 'development';
  }
  
  private log(level: LogLevel, message: string, context?: any, metadata?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      version: this.version,
      environment: this.environment,
      context: context || {},
      metadata
    };
    
    // Output to console in development
    if (this.environment === 'development') {
      console.log(JSON.stringify(entry, null, 2));
    } else {
      // Send to centralized logging service
      this.sendToLoggingService(entry);
    }
  }
  
  error(message: string, context?: any, metadata?: any) {
    this.log(LogLevel.ERROR, message, context, metadata);
  }
  
  warn(message: string, context?: any, metadata?: any) {
    this.log(LogLevel.WARN, message, context, metadata);
  }
  
  info(message: string, context?: any, metadata?: any) {
    this.log(LogLevel.INFO, message, context, metadata);
  }
  
  debug(message: string, context?: any, metadata?: any) {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }
}
```

## Security Implementation

### Advanced Security Features

#### API Security
```typescript
// Security middleware stack
const securityMiddleware = [
  helmet(), // Security headers
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }),
  compression(), // Gzip compression
  morgan('combined'), // Request logging
];

// Input validation
const validateInput = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message
        }
      });
    }
    next();
  };
};

// SQL injection prevention
const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.replace(/['"\\]/g, '\\$&');
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};
```

#### Data Encryption
```typescript
// Encryption service
class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  
  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  }
  
  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }
  
  decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## Deployment & DevOps

### Container Configuration

#### Docker Setup
```dockerfile
# Multi-stage Dockerfile for backend services
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

WORKDIR /app

COPY --from=builder --chown=backend:nodejs /app/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/package.json ./package.json

USER backend

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=freshchoice
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
name: Backend CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Build Docker image
        run: docker build -t freshchoice-backend:${{ github.sha }} .
      
      - name: Run security scan
        run: |
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
            -v $PWD:/tmp/.cache/ aquasec/trivy:latest image \
            --exit-code 0 --no-progress --format table \
            freshchoice-backend:${{ github.sha }}

  deploy:
    needs: [test, build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        run: |
          # Deployment script here
          echo "Deploying to production..."
```

## Performance Optimization

### Caching Strategy

#### Multi-level Caching
```typescript
// Cache configuration
interface CacheConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    ttl: number; // Time to live in seconds
  };
  memory: {
    max: number; // Maximum items in memory cache
    ttl: number;
  };
}

// Cache service implementation
class CacheService {
  private redisClient: Redis;
  private memoryCache: LRUCache<string, any>;
  
  constructor(config: CacheConfig) {
    this.redisClient = new Redis(config.redis);
    this.memoryCache = new LRUCache({
      max: config.memory.max,
      ttl: config.memory.ttl * 1000
    });
  }
  
  async get(key: string): Promise<any> {
    // Try memory cache first
    let value = this.memoryCache.get(key);
    if (value !== undefined) {
      return value;
    }
    
    // Try Redis cache
    const redisValue = await this.redisClient.get(key);
    if (redisValue) {
      value = JSON.parse(redisValue);
      this.memoryCache.set(key, value);
      return value;
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Set in memory cache
    this.memoryCache.set(key, value);
    
    // Set in Redis cache
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.redisClient.setex(key, ttl, serialized);
    } else {
      await this.redisClient.set(key, serialized);
    }
  }
  
  async invalidate(pattern: string): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();
    
    // Clear Redis cache
    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }
}

// Cache decorators
const cache = (ttl: number = 300) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      let result = await cacheService.get(cacheKey);
      if (result === null) {
        result = await method.apply(this, args);
        await cacheService.set(cacheKey, result, ttl);
      }
      
      return result;
    };
  };
};

// Usage example
class InventoryService {
  @cache(300) // Cache for 5 minutes
  async getInventoryItems(userId: string, filters: any): Promise<InventoryItem[]> {
    // Database query here
    return await this.database.query('SELECT * FROM inventory_items WHERE user_id = $1', [userId]);
  }
}
```

### Database Optimization

#### Query Performance
```typescript
// Query builder with optimization
class QueryBuilder {
  private query: string = '';
  private params: any[] = [];
  private includes: string[] = [];
  
  select(fields: string[]): this {
    this.query += `SELECT ${fields.join(', ')} `;
    return this;
  }
  
  from(table: string): this {
    this.query += `FROM ${table} `;
    return this;
  }
  
  where(condition: string, value: any): this {
    this.query += this.query.includes('WHERE') ? 'AND ' : 'WHERE ';
    this.query += `${condition} $${this.params.length + 1} `;
    this.params.push(value);
    return this;
  }
  
  include(relation: string): this {
    this.includes.push(relation);
    return this;
  }
  
  limit(count: number): this {
    this.query += `LIMIT $${this.params.length + 1} `;
    this.params.push(count);
    return this;
  }
  
  offset(count: number): this {
    this.query += `OFFSET $${this.params.length + 1} `;
    this.params.push(count);
    return this;
  }
  
  async execute(): Promise<any[]> {
    // Add joins for includes
    this.includes.forEach(include => {
      // Add appropriate JOIN clauses
    });
    
    return await database.query(this.query, this.params);
  }
}

// Usage
const items = await new QueryBuilder()
  .select(['id', 'description', 'remaining_stock'])
  .from('inventory_items')
  .where('user_id = ', userId)
  .where('remaining_stock <= ', 10)
  .include('vendor')
  .limit(50)
  .execute();
```

## Testing Strategy

### Comprehensive Testing

#### Unit Tests
```typescript
// Service testing
describe('InventoryService', () => {
  let service: InventoryService;
  let mockDatabase: jest.Mocked<Database>;
  let mockCache: jest.Mocked<CacheService>;
  
  beforeEach(() => {
    mockDatabase = createMockDatabase();
    mockCache = createMockCache();
    service = new InventoryService(mockDatabase, mockCache);
  });
  
  describe('getInventoryItems', () => {
    it('should return cached items when available', async () => {
      const cachedItems = [{ id: '1', name: 'Test Item' }];
      mockCache.get.mockResolvedValue(cachedItems);
      
      const result = await service.getInventoryItems('user1', {});
      
      expect(result).toEqual(cachedItems);
      expect(mockDatabase.query).not.toHaveBeenCalled();
    });
    
    it('should query database when cache miss', async () => {
      const dbItems = [{ id: '1', name: 'Test Item' }];
      mockCache.get.mockResolvedValue(null);
      mockDatabase.query.mockResolvedValue(dbItems);
      
      const result = await service.getInventoryItems('user1', {});
      
      expect(result).toEqual(dbItems);
      expect(mockCache.set).toHaveBeenCalledWith(expect.any(String), dbItems, 300);
    });
  });
});
```

#### Integration Tests
```typescript
// API endpoint testing
describe('Inventory API', () => {
  let app: Application;
  let database: Database;
  
  beforeAll(async () => {
    app = await createTestApp();
    database = await createTestDatabase();
  });
  
  afterAll(async () => {
    await database.close();
  });
  
  describe('POST /inventory', () => {
    it('should create new inventory item', async () => {
      const newItem = {
        description: 'Test Product',
        category: 'Test Category',
        remainingStock: 100
      };
      
      const response = await request(app)
        .post('/inventory')
        .set('Authorization', `Bearer ${testToken}`)
        .send(newItem)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(newItem.description);
      
      // Verify in database
      const dbItem = await database.query(
        'SELECT * FROM inventory_items WHERE id = $1',
        [response.body.data.id]
      );
      expect(dbItem[0]).toBeDefined();
    });
  });
});
```

#### Load Testing
```typescript
// Performance testing with Artillery
const loadTestConfig = {
  config: {
    target: 'http://localhost:3000',
    phases: [
      { duration: 60, arrivalRate: 10 }, // Warm up
      { duration: 120, arrivalRate: 50 }, // Ramp up
      { duration: 300, arrivalRate: 100 }, // Sustained load
      { duration: 60, arrivalRate: 200 } // Spike test
    ],
    defaults: {
      headers: {
        'Authorization': 'Bearer {{ $randomString() }}'
      }
    }
  },
  scenarios: [
    {
      name: 'Get inventory items',
      weight: 70,
      flow: [
        { get: { url: '/inventory?page=1&limit=50' } }
      ]
    },
    {
      name: 'Create inventory item',
      weight: 20,
      flow: [
        {
          post: {
            url: '/inventory',
            json: {
              description: 'Load Test Item {{ $randomString() }}',
              category: 'Test',
              remainingStock: '{{ $randomInt(1, 100) }}'
            }
          }
        }
      ]
    },
    {
      name: 'Update inventory item',
      weight: 10,
      flow: [
        { get: { url: '/inventory?limit=1' } },
        {
          put: {
            url: '/inventory/{{ id }}',
            json: {
              remainingStock: '{{ $randomInt(1, 100) }}'
            }
          }
        }
      ]
    }
  ]
};
```

## Conclusion

This backend specification provides a comprehensive foundation for the Fresh Choice Inventory Management System that seamlessly integrates with the existing React frontend. The architecture emphasizes:

### Key Strengths
- **Scalability** - Microservices-ready architecture with horizontal scaling capabilities
- **Performance** - Multi-level caching, optimized queries, and efficient data processing
- **Security** - Multi-layered security with encryption, authentication, and authorization
- **Reliability** - Comprehensive error handling, monitoring, and automated recovery
- **Maintainability** - Clean code architecture with extensive testing and documentation

### Integration Points
- **Real-time Synchronization** - WebSocket connections for live data updates
- **RESTful APIs** - Standard HTTP APIs matching frontend expectations
- **Type Safety** - TypeScript interfaces ensuring frontend-backend compatibility
- **Error Handling** - Consistent error responses for frontend error handling
- **Authentication** - JWT-based authentication matching frontend auth context

### Future Extensibility
- **Plugin Architecture** - Easy integration of new features and third-party services
- **API Versioning** - Backward compatibility for frontend updates
- **Event-Driven Design** - Flexible event system for new business logic
- **Microservices Migration** - Clear path to microservices architecture

This backend specification ensures that the Fresh Choice Inventory Management System can grow from a single-tenant application to a multi-tenant, enterprise-grade solution while maintaining seamless integration with the existing frontend codebase.