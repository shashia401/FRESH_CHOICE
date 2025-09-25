const API_BASE_URL = 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Mock users storage (in a real app, this would be handled by the backend)
const mockUsers = [
  { id: 1, email: 'admin@freshchoice.com', username: 'admin', password: 'password123' }
];

// Mock authentication functions
const mockAuth = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    return {
      user: { id: user.id, email: user.email, username: user.username },
      token: 'mock-jwt-token-' + Date.now()
    };
  },

  signup: async (email: string, username: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new ApiError(400, 'User already exists');
    }
    
    // Create new user
    const newUser = {
      id: mockUsers.length + 1,
      email,
      username,
      password
    };
    mockUsers.push(newUser);
    
    return {
      user: { id: newUser.id, email: newUser.email, username: newUser.username },
      token: 'mock-jwt-token-' + Date.now()
    };
  }
};

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
      throw new ApiError(response.status, `API Error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    // If backend is not available, fall back to mock for auth endpoints
    if (endpoint === '/login' || endpoint === '/signup') {
      throw error; // Let the auth API handle this
    }
    throw new ApiError(500, 'Backend not available');
  }
};

// Auth API calls
export const authApi = {
  login: mockAuth.login,
  signup: mockAuth.signup,
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