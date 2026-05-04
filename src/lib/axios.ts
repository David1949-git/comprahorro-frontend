import axios from 'axios';

// Create a global Axios instance with proper configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://comprahorro-backend.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS and authentication
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('comprAhorro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('comprAhorro_token');
      window.location.href = '/register.html';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
