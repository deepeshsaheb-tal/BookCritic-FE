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
    return api.get<User>('/users/profile/me');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: { displayName: string }): Promise<User> => {
    // Get current user ID first
    const currentUser = await UserService.getCurrentUser();
    return api.patch<User>(`/users/${currentUser.id}`, {
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
    // Get current user ID first
    const currentUser = await UserService.getCurrentUser();
    return api.delete<void>(`/users/${currentUser.id}`);
  },

  /**
   * Get user reading list
   */
  getReadingList: async (skip = 0, take = 10): Promise<{ books: any[]; total: number }> => {
    const currentUser = await UserService.getCurrentUser();
    return api.get<{ books: any[]; total: number }>(`/users/${currentUser.id}/reading-list?skip=${skip}&take=${take}`);
  },

  /**
   * Add book to reading list
   */
  addToReadingList: async (bookId: string): Promise<void> => {
    const currentUser = await UserService.getCurrentUser();
    return api.post<void>(`/users/${currentUser.id}/reading-list`, { bookId });
  },

  /**
   * Remove book from reading list
   */
  removeFromReadingList: async (bookId: string): Promise<void> => {
    const currentUser = await UserService.getCurrentUser();
    return api.delete<void>(`/users/${currentUser.id}/reading-list/${bookId}`);
  },
};
