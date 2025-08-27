import api from './api.ts';
import { Book, BookResponse } from '../types';

/**
 * Service for handling book-related API calls
 */
export const BookService = {
  /**
   * Get all books with pagination
   */
  getBooks: async (skip = 0, take = 10): Promise<BookResponse> => {
    return api.get<BookResponse>(`/books?skip=${skip}&take=${take}`);
  },

  /**
   * Search for books by query
   */
  searchBooks: async (query: string, skip = 0, take = 10): Promise<BookResponse> => {
    return api.get<BookResponse>(`/books/search?query=${encodeURIComponent(query)}&skip=${skip}&take=${take}`);
  },

  /**
   * Get a book by ID
   */
  getBookById: async (id: string): Promise<Book> => {
    return api.get<Book>(`/books/${id}`);
  },

  /**
   * Get personalized book recommendations for the current user
   */
  getRecommendedBooks: async (limit = 4): Promise<Book[]> => {
    return api.get<Book[]>(`/books/recommended?limit=${limit}`);
  },

  // Top rated books and new releases methods removed

  /**
   * Create a new book (admin only)
   */
  createBook: async (bookData: Partial<Book>): Promise<Book> => {
    return api.post<Book>('/books', bookData);
  },

  /**
   * Update a book (admin only)
   */
  updateBook: async (id: string, bookData: Partial<Book>): Promise<Book> => {
    return api.patch<Book>(`/books/${id}`, bookData);
  },

  /**
   * Delete a book (admin only)
   */
  deleteBook: async (id: string): Promise<void> => {
    return api.delete<void>(`/books/${id}`);
  },
};
