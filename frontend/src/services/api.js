import axios from "axios";

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  // Ensure it ends with /api
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
};

const API_URL = getBaseUrl();
console.log("🚀 Frontend is connecting to API at:", API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Don't redirect from login/register pages
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        window.location.href = "/login";
      }
    }

    if (!error.response) {
      console.error("Network error - is backend running?");
    }

    return Promise.reject(error);
  },
);

// Auth service
export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);

      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  getProfile: async () => {
    return api.get("/users/profile");
  },

  updateProfile: async (profileData) => {
    return api.put("/users/profile", profileData);
  },

  changePassword: async (passwordData) => {
    return api.put("/users/change-password", passwordData);
  },

  requestPasswordReset: async (email) => {
    return api.post("/users/request-password-reset", { email });
  },

  resetPassword: async (data) => {
    return api.post("/users/reset-password", data);
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "/login";
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Menu service
export const menuService = {
  getAllMenuItems: async () => {
    try {
      const response = await api.get("/menu");
      // Store menu items in localStorage for checkout page
      if (response.data) {
        localStorage.setItem("menuItems", JSON.stringify(response.data));
      }
      return response;
    } catch (error) {
      console.error("Error fetching menu:", error);
      throw error;
    }
  },

  getMenuItem: (id) => api.get(`/menu/${id}`),

  createMenuItem: async (formData) => {
    const response = await api.post("/menu", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  updateMenuItem: async (id, formData) => {
    const response = await api.put(`/menu/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  deleteMenuItem: async (id) => {
    const response = await api.delete(`/menu/${id}`);
    return response;
  },

  toggleAvailability: async (id) => {
    const response = await api.patch(`/menu/${id}/toggle`);
    return response;
  },
};


// Order service
export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response;
  },

  getOrder: (id) => api.get(`/orders/${id}`),

  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),

  getUserOrders: () => api.get("/users/orders"),

  getAllOrders: async (status = "all", page = 1, limit = 50) => {
    const response = await api.get("/orders/admin/all", {
      params: { status, page, limit },
    });
    return response;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response;
  },

  getOrderStats: async () => {
    const response = await api.get("/orders/admin/stats");
    return response;
  },

  // Add other admin methods as needed
  deleteOrder: async (orderId) => {
    const response = await api.delete(`/orders/admin/${orderId}`);
    return response;
  },

  getRecentOrders: async (limit = 10) => {
    const response = await api.get("/orders/admin/recent", {
      params: { limit },
    });
    return response;
  },
};

// User service
export const userService = {
  getFavorites: () => api.get("/users/favorites"),

  toggleFavorite: (menuItemId) => api.post(`/users/favorites/${menuItemId}`),

  updateAddress: (address) => api.put("/users/address", address),
};

// Health check
export const testConnection = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    console.error("Backend connection failed:", error.message);
    throw error;
  }
};

export default api;
