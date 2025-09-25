const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://0700eb5a-cbb2-433f-8c5b-82a84250966a-00-2nwwdrtivgcr9.picard.replit.dev/api';

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
};

// Vendor API calls
export const vendorApi = {
  getAll: () => apiRequest('/vendors'),
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
};