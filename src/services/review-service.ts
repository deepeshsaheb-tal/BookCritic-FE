import api from './api.ts';
import { Review, ReviewResponse, CreateReviewFormData, UpdateReviewFormData } from '../types';

/**
 * Service for handling review-related API calls
 */
export const ReviewService = {
  /**
   * Get all reviews with pagination
   */
  getReviews: async (skip = 0, take = 10): Promise<ReviewResponse> => {
    return api.get<ReviewResponse>(`/reviews?skip=${skip}&take=${take}`);
  },

  /**
   * Get reviews for a specific book
   */
  getBookReviews: async (bookId: string, skip = 0, take = 10): Promise<ReviewResponse> => {
    return api.get<ReviewResponse>(`/reviews/book/${bookId}?skip=${skip}&take=${take}`);
  },

  /**
   * Get reviews by a specific user
   */
  getUserReviews: async (userId: string, skip = 0, take = 10): Promise<ReviewResponse> => {
    return api.get<ReviewResponse>(`/reviews/user/${userId}?skip=${skip}&take=${take}`);
  },

  /**
   * Get a review by ID
   */
  getReviewById: async (id: string): Promise<Review> => {
    return api.get<Review>(`/reviews/${id}`);
  },

  /**
   * Create a new review
   */
  createReview: async (reviewData: CreateReviewFormData): Promise<Review> => {
    return api.post<Review>('/reviews', {
      bookId: reviewData.bookId,
      content: reviewData.content,
      rating: reviewData.rating,
    });
  },

  /**
   * Update a review
   */
  updateReview: async (id: string, reviewData: UpdateReviewFormData): Promise<Review> => {
    return api.patch<Review>(`/reviews/${id}`, {
      content: reviewData.content,
      rating: reviewData.rating,
    });
  },

  /**
   * Delete a review
   */
  deleteReview: async (id: string): Promise<void> => {
    return api.delete<void>(`/reviews/${id}`);
  },

  /**
   * Get average rating for a book
   */
  getAverageRating: async (bookId: string): Promise<{ averageRating: number }> => {
    return api.get<{ averageRating: number }>(`/reviews/book/${bookId}/average-rating`);
  },
};
