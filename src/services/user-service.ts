import api from './api.ts';
import { User } from '../types';

/**
 * Service for handling user-related API calls
 */
export const UserService = {
  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    return api.get<User>('/users/me');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: { displayName: string }): Promise<User> => {
    return api.patch<User>('/users/me', {
      displayName: data.displayName,
    });
  },

  /**
   * Change user password
   */
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    return api.post<void>('/users/change-password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    return api.get<User>(`/users/${id}`);
  },

  /**
   * Delete user account
   */
  deleteAccount: async (): Promise<void> => {
    return api.delete<void>('/users/me');
  },

  /**
   * Get user reading list
   */
  getReadingList: async (skip = 0, take = 10): Promise<{ books: any[]; total: number }> => {
    return api.get<{ books: any[]; total: number }>(`/users/me/reading-list?skip=${skip}&take=${take}`);
  },

  /**
   * Add book to reading list
   */
  addToReadingList: async (bookId: string): Promise<void> => {
    return api.post<void>('/users/me/reading-list', { bookId });
  },

  /**
   * Remove book from reading list
   */
  removeFromReadingList: async (bookId: string): Promise<void> => {
    return api.delete<void>(`/users/me/reading-list/${bookId}`);
  },
};
