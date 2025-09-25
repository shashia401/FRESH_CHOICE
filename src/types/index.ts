export interface User {
  id: number;
  email: string;
  username: string;
}

export interface InventoryItem {
  id: number;
  user_id: number;
  invoice_no?: string;
  invoice_delivery_date?: string;
  category: string;
  brand: string;
  department: string;
  item_upc?: string;
  item_sku?: string;
  description: string;
  pack_size?: string;
  qty_shipped: number;
  remaining_stock: number;
  items_per_carton?: number;
  sales_weekly: number;
  location?: string;
  aisle?: string;
  row?: string;
  bin?: string;
  expiration_date?: string;
  unit_cost?: number;
  vendor_cost?: number;
  cust_cost_each?: number;
  cust_cost_extended?: number;
  unit_retail?: number;
  gross_margin?: number;
  burd_unit_cost?: number;
  burd_gross_margin?: number;
  discount_allowance?: number;
  advertising_flag: boolean;
  order_type?: string;
  vendor_id?: number;
  vendor_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: number;
  user_id: number;
  inventory_id?: number;
  item_name: string;
  quantity: number;
  purchased: boolean;
}

export interface Vendor {
  id: number;
  name: string;
  contact_info?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  contact_person?: string;
  payment_terms?: string;
  tax_id?: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  vendor_id: number;
  vendor_name: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  status: 'paid' | 'pending' | 'overdue';
  item_count: number;
  created_at: string;
}

export interface WasteItem {
  id: number;
  user_id: number;
  inventory_id?: number;
  item_name: string;
  expired_on: string;
  quantity: number;
}

export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  expiringItems: number;
  weeklySales: number;
}