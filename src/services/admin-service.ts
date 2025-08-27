import api from './api.ts';
import { User } from '../types';

interface UsersResponse {
  users: User[];
  total: number;
}

interface UpdateUserData {
  displayName?: string;
  role?: 'user' | 'admin';
}

/**
 * Service for handling admin-related API calls
 */
export const AdminService = {
  /**
   * Get all users with pagination
   */
  getUsers: async (skip = 0, take = 10): Promise<UsersResponse> => {
    return api.get<UsersResponse>(`/admin/users?skip=${skip}&take=${take}`);
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    return api.get<User>(`/admin/users/${id}`);
  },

  /**
   * Update user
   */
  updateUser: async (id: string, data: UpdateUserData): Promise<User> => {
    return api.patch<User>(`/admin/users/${id}`, data);
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<void> => {
    return api.delete<void>(`/admin/users/${id}`);
  },

  /**
   * Get admin dashboard statistics
   */
  getDashboardStats: async (): Promise<{
    totalBooks: number;
    totalUsers: number;
    totalReviews: number;
    recentActivity: Array<{
      id: string;
      type: 'book' | 'user' | 'review';
      action: string;
      details: string;
      timestamp: string;
    }>;
  }> => {
    return api.get<{
      totalBooks: number;
      totalUsers: number;
      totalReviews: number;
      recentActivity: Array<{
        id: string;
        type: 'book' | 'user' | 'review';
        action: string;
        details: string;
        timestamp: string;
      }>;
    }>('/admin/dashboard/stats');
  },

  /**
   * Get reviews that need moderation
   */
  getReviewsForModeration: async (skip = 0, take = 10): Promise<{
    reviews: Array<{
      id: string;
      content: string;
      rating: number;
      createdAt: string;
      reportCount: number;
      book: {
        id: string;
        title: string;
      };
      user: {
        id: string;
        displayName: string;
      };
    }>;
    total: number;
  }> => {
    return api.get<{
      reviews: Array<{
        id: string;
        content: string;
        rating: number;
        createdAt: string;
        reportCount: number;
        book: {
          id: string;
          title: string;
        };
        user: {
          id: string;
          displayName: string;
        };
      }>;
      total: number;
    }>(`/admin/reviews/moderation?skip=${skip}&take=${take}`);
  },

  /**
   * Approve a review
   */
  approveReview: async (id: string): Promise<void> => {
    return api.post<void>(`/admin/reviews/${id}/approve`);
  },

  /**
   * Reject a review
   */
  rejectReview: async (id: string): Promise<void> => {
    return api.post<void>(`/admin/reviews/${id}/reject`);
  },
};
