import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Determine if this is an auth-related request
    const isAuthRequest = error.config?.url ? (
      error.config.url.includes('/auth/login') || 
      error.config.url.includes('/auth/register')
    ) : false;
    
    // Determine if we're on an auth page
    const isAuthPage = 
      window.location.pathname.includes('/login') || 
      window.location.pathname.includes('/register');
    
    console.log('API Error Interceptor:', { 
      status: error.response?.status,
      url: error.config?.url,
      isAuthRequest,
      isAuthPage,
      pathname: window.location.pathname
    });
    
    // Handle token expiration, but ONLY for non-auth requests and when not on auth pages
    if (error.response?.status === 401 && !isAuthRequest && !isAuthPage) {
      console.log('Redirecting to login due to 401');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Always reject with the error
    return Promise.reject(error);
  }
);

// Generic request function
const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Check if this is an auth request
      const isAuthRequest = config.url ? (
        config.url.includes('/auth/login') || 
        config.url.includes('/auth/register')
      ) : false;
      
      console.log('Request error handler:', {
        url: config.url,
        isAuthRequest,
        status: axiosError.response?.status
      });
      
      // Enhanced error handling - extract more detailed error information
      if (axiosError.response?.data) {
        // Add status code to the error object for better error handling
        const errorData = axiosError.response.data as Record<string, unknown>;
        errorData.statusCode = axiosError.response.status;
        
        console.error('API Error:', {
          status: axiosError.response.status,
          data: errorData,
          url: axiosError.config?.url
        });
        
        // For auth requests, make sure we're returning a properly formatted error
        if (isAuthRequest && axiosError.response.status === 401) {
          return Promise.reject({
            message: 'Invalid email or password. Please try again.',
            statusCode: 401
          }) as any;
        }
        
        return Promise.reject(errorData) as any;
      }
      
      return Promise.reject({
        message: axiosError.message || 'An error occurred. Please try again.',
        statusCode: axiosError.response?.status
      }) as any;
    }
    return Promise.reject(error) as any;
  }
};

const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'GET', url }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'POST', url, data }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'PUT', url, data }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'PATCH', url, data }),
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'DELETE', url }),
};

export default apiService;
