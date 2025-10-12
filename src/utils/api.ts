import { supabase } from '../lib/supabase';
import { InventoryItem } from '../types';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Inventory API calls using Supabase
export const inventoryApi = {
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, error.message);
    return data || [];
  },

  create: async (item: Partial<InventoryItem>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data, error } = await supabase
      .from('inventory')
      .insert([{ ...item, user_id: user.id }])
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return data;
  },

  bulkCreate: async (items: Partial<InventoryItem>[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const itemsWithUserId = items.map(item => ({ ...item, user_id: user.id }));
    const { data, error } = await supabase
      .from('inventory')
      .insert(itemsWithUserId)
      .select();

    if (error) throw new ApiError(500, error.message);
    return { success: data?.length || 0, total: items.length, errors: [] };
  },

  update: async (id: string, item: Partial<InventoryItem>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data, error } = await supabase
      .from('inventory')
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return data;
  },

  delete: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw new ApiError(500, error.message);
    return { success: true };
  },
};

// Shopping list API calls
export const shoppingListApi = {
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data, error } = await supabase
      .from('shopping_list')
      .select('*, vendors(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, error.message);
    return data || [];
  },

  add: async (item: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data, error } = await supabase
      .from('shopping_list')
      .insert([{ ...item, user_id: user.id }])
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return data;
  },

  update: async (id: string, item: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data, error } = await supabase
      .from('shopping_list')
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return data;
  },

  markPurchased: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data, error } = await supabase
      .from('shopping_list')
      .update({ purchased: true, purchase_date: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return data;
  },

  delete: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw new ApiError(500, error.message);
    return { success: true };
  },
};

// Vendors API calls
export const vendorApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) throw new ApiError(500, error.message);
    return data || [];
  },

  create: async (vendor: any) => {
    const { data, error } = await supabase
      .from('vendors')
      .insert([vendor])
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return data;
  },

  update: async (id: string, vendor: any) => {
    const { data, error } = await supabase
      .from('vendors')
      .update({ ...vendor, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) throw new ApiError(500, error.message);
    return { success: true };
  },
};

// Dashboard API calls
export const dashboardApi = {
  getStats: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data: items } = await supabase
      .from('inventory')
      .select('remaining_stock, expiration_date, sales_weekly')
      .eq('user_id', user.id);

    if (!items) return { totalItems: 0, lowStockItems: 0, expiringItems: 0, weeklySales: 0 };

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats = {
      totalItems: items.length,
      lowStockItems: items.filter(item => item.remaining_stock <= 10).length,
      expiringItems: items.filter(item => {
        if (!item.expiration_date) return false;
        const expDate = new Date(item.expiration_date);
        return expDate <= nextWeek;
      }).length,
      weeklySales: items.reduce((sum, item) => sum + (item.sales_weekly || 0), 0),
    };

    return stats;
  },

  getAlerts: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data: items } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', user.id);

    if (!items) return [];

    const alerts: any[] = [];
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    items.forEach(item => {
      if (item.remaining_stock === 0) {
        alerts.push({
          type: 'out-of-stock',
          message: `${item.description} is out of stock`,
          item_id: item.id,
        });
      } else if (item.remaining_stock <= 10) {
        alerts.push({
          type: 'low-stock',
          message: `${item.description} is low on stock (${item.remaining_stock} remaining)`,
          item_id: item.id,
        });
      }

      if (item.expiration_date) {
        const expDate = new Date(item.expiration_date);
        if (expDate <= nextWeek) {
          alerts.push({
            type: 'expiring',
            message: `${item.description} expires on ${item.expiration_date}`,
            item_id: item.id,
          });
        }
      }
    });

    return alerts;
  },

  getRecentActivity: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data: items } = await supabase
      .from('inventory')
      .select('id, description, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (!items) return [];

    return items.map(item => ({
      type: 'update',
      description: `Updated ${item.description}`,
      timestamp: item.updated_at || item.created_at,
    }));
  },
};

// Settings API calls
export const settingsApi = {
  getSettings: async () => {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*');

    if (error) throw new ApiError(500, error.message);

    const settings: any = {};
    data?.forEach(setting => {
      settings[setting.setting_key] = {
        value: setting.data_type === 'number' ? Number(setting.setting_value) : setting.setting_value,
        description: setting.description,
      };
    });

    return settings;
  },

  updateSetting: async (key: string, value: string) => {
    const { data, error} = await supabase
      .from('system_settings')
      .update({ setting_value: value, updated_at: new Date().toISOString() })
      .eq('setting_key', key)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return data;
  },
};

// Reports API calls
export const reportsApi = {
  getWaste: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const today = new Date();
    const { data: items } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', user.id);

    if (!items) return [];

    return items.filter(item => {
      if (!item.expiration_date) return false;
      const expDate = new Date(item.expiration_date);
      return expDate < today;
    });
  },

  getConsumption: async () => {
    return { message: 'Consumption report not yet implemented' };
  },

  getMargins: async () => {
    return { message: 'Margins report not yet implemented' };
  },

  getWeeklySalesTrend: async () => {
    return { message: 'Weekly sales trend not yet implemented' };
  },
};

// Invoices API calls
export const invoiceApi = {
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data, error } = await supabase
      .from('invoices')
      .select('*, vendors(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, error.message);
    return data || [];
  },

  getById: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data, error } = await supabase
      .from('invoices')
      .select('*, vendors(name), invoice_items(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw new ApiError(500, error.message);
    return data;
  },

  create: async (invoice: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data, error } = await supabase
      .from('invoices')
      .insert([{ ...invoice, user_id: user.id }])
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return data;
  },

  update: async (id: string, invoice: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { data, error } = await supabase
      .from('invoices')
      .update({ ...invoice, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return data;
  },

  delete: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, 'Unauthorized');

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw new ApiError(500, error.message);
    return { success: true };
  },
};
