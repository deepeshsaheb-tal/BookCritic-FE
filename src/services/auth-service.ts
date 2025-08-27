import api from './api.ts';
import { User, LoginFormData, RegisterFormData } from '../types';

interface AuthResponse {
  accessToken: string;
  user: User;
}

/**
 * Service for handling authentication-related API calls
 */
export const AuthService = {
  /**
   * Login with email and password
   */
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    try {
      return await api.post<AuthResponse>('/auth/login', data);
    } catch (error) {
      console.log('Auth service login error:', error);
      
      // Format error message for better user experience
      if (typeof error === 'object' && error !== null) {
        // Handle specific status codes
        if ('statusCode' in error) {
          const statusCode = error.statusCode as number;
          if (statusCode === 401) {
            return Promise.reject({
              message: 'Invalid email or password. Please try again.',
              statusCode: 401
            });
          }
        }
        
        // Handle error with message property
        if ('message' in error) {
          return Promise.reject({
            message: error.message as string,
            statusCode: ('statusCode' in error) ? error.statusCode as number : undefined
          });
        }
      }
      
      // Default error
      return Promise.reject({
        message: 'Login failed. Please try again.',
        statusCode: 500
      });
    }
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    try {
      return await api.post<AuthResponse>('/auth/register', data);
    } catch (error) {
      console.log('Auth service register error:', error);
      
      // Format error message for better user experience
      if (typeof error === 'object' && error !== null) {
        // Handle specific status codes
        if ('statusCode' in error) {
          const statusCode = error.statusCode as number;
          if (statusCode === 409) {
            return Promise.reject({
              message: 'An account with this email already exists.',
              statusCode: 409
            });
          } else if (statusCode === 400) {
            return Promise.reject({
              message: 'Invalid registration data. Please check your information.',
              statusCode: 400
            });
          } else if (statusCode === 401) {
            return Promise.reject({
              message: 'Authentication failed. Please try again.',
              statusCode: 401
            });
          }
        }
        
        // Handle error with message property
        if ('message' in error) {
          return Promise.reject({
            message: error.message as string,
            statusCode: ('statusCode' in error) ? error.statusCode as number : undefined
          });
        }
      }
      
      // Default error
      return Promise.reject({
        message: 'Registration failed. Please try again.',
        statusCode: 500
      });
    }
  },

  /**
   * Validate the current token
   */
  validateToken: async (): Promise<{ valid: boolean; user: User }> => {
    return api.post<{ valid: boolean; user: User }>('/auth/validate');
  },

  /**
   * Request password reset email
   */
  requestPasswordReset: async (email: string): Promise<{ success: boolean }> => {
    return api.post<{ success: boolean }>('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean }> => {
    return api.post<{ success: boolean }>('/auth/reset-password', { token, newPassword });
  },

  // OAuth-related methods removed

  /**
   * Store authentication data in local storage
   */
  setAuthData: (token: string, user: User): void => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Get authentication data from local storage
   */
  getAuthData: (): { token: string | null; user: User | null } => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  },

  /**
   * Clear authentication data from local storage
   */
  clearAuthData: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
