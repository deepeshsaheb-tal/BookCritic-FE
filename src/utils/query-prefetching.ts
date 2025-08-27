import { QueryClient } from '@tanstack/react-query';
import { BookService } from '../services/book-service.ts';
import { UserService } from '../services/user-service.ts';

/**
 * Utility functions for prefetching data with React Query
 * This helps improve perceived performance by loading data before it's needed
 */

/**
 * Prefetch popular books for the homepage
 */
export const prefetchPopularBooks = async (queryClient: QueryClient): Promise<void> => {
  await queryClient.prefetchQuery(
    ['popularBooks'],
    () => BookService.getPopularBooks(0, 8),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );
};

/**
 * Prefetch new releases for the homepage
 */
export const prefetchNewReleases = async (queryClient: QueryClient): Promise<void> => {
  await queryClient.prefetchQuery(
    ['newReleases'],
    () => BookService.getNewReleases(0, 8),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );
};

/**
 * Prefetch user profile data
 */
export const prefetchUserProfile = async (queryClient: QueryClient, userId: string): Promise<void> => {
  await queryClient.prefetchQuery(
    ['userProfile', userId],
    () => UserService.getUserProfile(userId),
    { staleTime: 2 * 60 * 1000 } // 2 minutes
  );
};

/**
 * Prefetch book details
 */
export const prefetchBookDetails = async (queryClient: QueryClient, bookId: string): Promise<void> => {
  await queryClient.prefetchQuery(
    ['bookDetails', bookId],
    () => BookService.getBookById(bookId),
    { staleTime: 10 * 60 * 1000 } // 10 minutes
  );
};

/**
 * Prefetch book reviews
 */
export const prefetchBookReviews = async (
  queryClient: QueryClient, 
  bookId: string, 
  page = 0, 
  pageSize = 5
): Promise<void> => {
  await queryClient.prefetchQuery(
    ['bookReviews', bookId, page, pageSize],
    () => BookService.getBookReviews(bookId, page, pageSize),
    { staleTime: 2 * 60 * 1000 } // 2 minutes
  );
};

/**
 * Prefetch user reading list
 */
export const prefetchReadingList = async (
  queryClient: QueryClient, 
  skip = 0, 
  take = 10
): Promise<void> => {
  await queryClient.prefetchQuery(
    ['readingList', skip, take],
    () => UserService.getReadingList(skip, take),
    { staleTime: 2 * 60 * 1000 } // 2 minutes
  );
};

/**
 * Prefetch initial data for the application
 */
export const prefetchInitialData = async (queryClient: QueryClient): Promise<void> => {
  await Promise.all([
    prefetchPopularBooks(queryClient),
    prefetchNewReleases(queryClient)
  ]);
};
