const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Frontend API integration with backend

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new ApiError(response.status, errorData.error || `API Error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('API request failed:', error);
    throw new ApiError(500, 'Network error or backend unavailable');
  }
};

// Auth API calls - now using real backend
export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  signup: async (email: string, username: string, password: string) => {
    return apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  },
};


// Inventory API calls
export const inventoryApi = {
  getAll: () => apiRequest('/inventory'),
  create: (item: Partial<any>) => apiRequest('/inventory', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  bulkCreate: (items: Partial<any>[]) => apiRequest('/inventory/bulk', {
    method: 'POST',
    body: JSON.stringify({ items }),
  }),
  update: (id: number, item: Partial<any>) => apiRequest(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  }),
  delete: (id: number) => apiRequest(`/inventory/${id}`, {
    method: 'DELETE',
  }),
};

// Shopping list API calls
export const shoppingListApi = {
  getAll: () => apiRequest('/shopping-list'),
  add: (item: Partial<any>) => apiRequest('/shopping-list', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  markPurchased: (id: number) => apiRequest(`/shopping-list/${id}/purchase`, {
    method: 'PUT',
  }),
};

// Reports API calls
export const reportsApi = {
  getWaste: () => apiRequest('/reports/waste'),
  getConsumption: () => apiRequest('/reports/consumption'),
  getMargins: () => apiRequest('/reports/margins'),
  getWeeklySalesTrend: () => apiRequest('/reports/weekly-sales-trend'),
};

// Vendor API calls
export const vendorApi = {
  getAll: () => apiRequest('/vendors'),
  getById: (id: number) => apiRequest(`/vendors/${id}`),
  create: (vendor: Partial<any>) => apiRequest('/vendors', {
    method: 'POST',
    body: JSON.stringify(vendor),
  }),
  update: (id: number, vendor: Partial<any>) => apiRequest(`/vendors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(vendor),
  }),
  delete: (id: number) => apiRequest(`/vendors/${id}`, {
    method: 'DELETE',
  }),
  getInvoices: (id: number) => apiRequest(`/vendors/${id}/invoices`),
  getInvoiceItems: (vendorId: number, invoiceId: number) => apiRequest(`/vendors/${vendorId}/invoices/${invoiceId}/items`),
  getProducts: (id: number) => apiRequest(`/vendors/${id}/products`),
};

// Invoice API calls
export const invoiceApi = {
  getAll: () => apiRequest('/invoices'),
  getItems: (id: number) => apiRequest(`/invoices/${id}/items`),
  create: (invoice: Partial<any>) => apiRequest('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoice),
  }),
  updateStatus: (id: number, status: string) => apiRequest(`/invoices/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// Dashboard API calls
export const dashboardApi = {
  getAlerts: () => apiRequest('/dashboard/alerts'),
  getRecentActivity: () => apiRequest('/dashboard/activity'),
  getStats: () => apiRequest('/dashboard/stats'),
};

// Analytics API calls
export const analyticsApi = {
  getItemSalesHistory: (id: number) => apiRequest(`/analytics/items/${id}/sales-history`),
  getItemMovementHistory: (id: number) => apiRequest(`/analytics/items/${id}/movement-history`),
  getItemSummary: (id: number) => apiRequest(`/analytics/items/${id}/summary`),
};

// Settings API calls
export const settingsApi = {
  getSettings: () => apiRequest('/settings'),
  updateSetting: (key: string, value: any) => apiRequest(`/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  }),
  getReorderCalculation: (itemId: number) => apiRequest(`/settings/reorder-calculation/${itemId}`),
  getCategories: () => apiRequest('/settings/categories'),
  validateImport: (items: any[]) => apiRequest('/settings/validate-import', {
    method: 'POST',
    body: JSON.stringify({ items }),
  }),
};
