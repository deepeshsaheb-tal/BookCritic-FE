import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/auth-service.ts';
import { AuthState, LoginFormData, RegisterFormData } from '../types/index.ts';

interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAdmin: false,
});

export const useAuth = (): AuthContextType => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  
  // Check if user is already logged in
  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const { token, user } = AuthService.getAuthData();
      
      if (token && user) {
        try {
          // Validate token with backend
          const response = await AuthService.validateToken();
          
          if (response.valid) {
            setState({
              user: response.user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token is invalid, clear auth data
            AuthService.clearAuthData();
            setState({
              ...initialState,
              isLoading: false,
            });
          }
        } catch (error) {
          // Error validating token, clear auth data
          AuthService.clearAuthData();
          setState({
            ...initialState,
            isLoading: false,
          });
        }
      } else {
        // No token or user in local storage
        setState({
          ...initialState,
          isLoading: false,
        });
      }
    };
    
    initAuth();
  }, []);
  
  // Login function
  const login = async (data: LoginFormData): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      const response = await AuthService.login(data);
      AuthService.setAuthData(response.accessToken, response.user);
      
      setState({
        user: response.user,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return Promise.resolve();
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      // Important: Return a rejected promise with the error instead of throwing
      // This prevents the page from reloading
      return Promise.reject(error);
    }
  };
  
  // Register function
  const register = async (data: RegisterFormData): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      const response = await AuthService.register(data);
      AuthService.setAuthData(response.accessToken, response.user);
      
      setState({
        user: response.user,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return Promise.resolve();
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      // Return a rejected promise instead of throwing
      // This prevents page reloads and allows proper error handling
      return Promise.reject(error);
    }
  };
  
  // Logout function
  const logout = (): void => {
    AuthService.clearAuthData();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };
  
  // OAuth-related functions removed
  
  // Check if user is admin
  const isAdmin = state.user?.role === 'admin';
  
  const value = {
    ...state,
    login,
    register,
    logout,
    isAdmin,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
