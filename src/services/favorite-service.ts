import api from './api.ts';
import { UserFavorite } from '../types';

/**
 * Service for managing user favorites
 */
export class FavoriteService {
  /**
   * Add a book to user's favorites
   * @param bookId - Book ID to add to favorites
   * @returns The created favorite relationship
   */
  static async addFavorite(bookId: string): Promise<UserFavorite> {
    return api.post<UserFavorite>(`/favorites/books/${bookId}`);
  }

  /**
   * Remove a book from user's favorites
   * @param bookId - Book ID to remove from favorites
   */
  static async removeFavorite(bookId: string): Promise<void> {
    await api.delete(`/favorites/books/${bookId}`);
  }

  /**
   * Check if a book is in user's favorites
   * @param bookId - Book ID to check
   * @returns True if book is in favorites, false otherwise
   */
  static async checkFavorite(bookId: string): Promise<boolean> {
    const response = await api.get<{ isFavorite: boolean }>(`/favorites/books/${bookId}/check`);
    return response.isFavorite;
  }

  /**
   * Get all favorite books for the current user
   * @returns List of favorite books with their details
   */
  static async getUserFavorites(): Promise<UserFavorite[]> {
    return api.get<UserFavorite[]>('/favorites');
  }
}
