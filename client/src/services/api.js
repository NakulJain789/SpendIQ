import axios from "axios";

const api = axios.create({
  baseURL: `${(import.meta.env.VITE_API_URL || "https://spendiq-o7oc.onrender.com").replace(/\/+$/, "")}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("spendiq_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle session expiry smoothly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and token was present, clear invalid token
      if (localStorage.getItem("spendiq_token")) {
        localStorage.removeItem("spendiq_token");
        localStorage.removeItem("spendiq_user");
        // Let AuthContext handle redirect without hard reload if possible
        window.dispatchEvent(new Event("spendiq_auth_expired"));
      }
    }
    return Promise.reject(error);
  },
);

// Auth Service
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getMe: () => api.get("/auth/me"),
};

// Transactions Service
export const transactionsAPI = {
  getAll: (params) => api.get("/transactions", { params }),
  create: (data) => api.post("/transactions", data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  exportCSV: (params) => {
    return api.get("/transactions/export", {
      params,
      responseType: "blob",
    });
  },
};

// Categories Service
export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Budget Service
export const budgetAPI = {
  get: (month, year) => api.get("/budget", { params: { month, year } }),
  update: (budgetData) => api.put("/budget", budgetData),
};

// Dashboard Service
export const dashboardAPI = {
  getSummary: () => api.get("/dashboard/summary"),
};

export default api;
