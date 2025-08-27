import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../../components/layout/layout.tsx';
import { Container } from '../../components/layout/container.tsx';
import { Spinner } from '../../components/ui/spinner.tsx';
import { Alert } from '../../components/ui/alert.tsx';
import { Pagination } from '../../components/ui/pagination.tsx';
import { StarRating } from '../../components/ui/star-rating.tsx';
import { useAuth } from '../../context/auth-context.tsx';
import { ReviewService } from '../../services/review-service.ts';
import { ReviewResponse } from '../../types';

/**
 * User profile page component
 */
export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [reviewPage, setReviewPage] = useState<number>(1);
  const reviewsPerPage = 5;
  
  // Fetch user reviews with pagination
  const { 
    data: reviewsData, 
    isLoading: reviewsLoading, 
    error: reviewsError 
  } = useQuery<ReviewResponse>(
    ['userReviews', user?.id, reviewPage],
    () => ReviewService.getUserReviews(user!.id, (reviewPage - 1) * reviewsPerPage, reviewsPerPage),
    {
      enabled: !!user?.id,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  // Handle review page change
  const handleReviewPageChange = (page: number): void => {
    setReviewPage(page);
    window.scrollTo({ top: document.getElementById('reviews')?.offsetTop || 0, behavior: 'smooth' });
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  if (!user) {
    return (
      <Layout>
        <Container className="py-12">
          <Alert type="error">You must be logged in to view your profile.</Alert>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container className="py-8">
        <div className="max-w-3xl mx-auto">
          {/* Profile header */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-2xl font-bold">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Account type</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{user.role}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Actions</dt>
                  <dd className="mt-1 text-sm text-gray-900 space-y-2">
                    <div>
                      <Link
                        to="/profile/settings"
                        className="text-primary-600 hover:text-primary-500"
                      >
                        Edit Profile
                      </Link>
                    </div>
                    <div>
                      <Link
                        to="/profile/reading-list"
                        className="text-primary-600 hover:text-primary-500"
                      >
                        My Reading List
                      </Link>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Reviews section */}
          <div id="reviews" className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Your Reviews</h2>
              <Link
                to="/books"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Browse Books to Review
              </Link>
            </div>
            
            {/* Reviews list */}
            <div className="mt-6">
              {reviewsLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="md" />
                </div>
              ) : reviewsError ? (
                <Alert type="error">Failed to load your reviews. Please try again later.</Alert>
              ) : reviewsData && reviewsData.reviews.length > 0 ? (
                <>
                  <div className="space-y-8">
                    {reviewsData.reviews.map((review) => (
                      <div key={review.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">
                              <Link
                                to={`/books/${review.book.id}`}
                                className="hover:text-primary-600"
                              >
                                {review.book.title}
                              </Link>
                            </h3>
                            <div className="flex space-x-3">
                              <Link
                                to={`/reviews/${review.id}/edit`}
                                className="text-sm font-medium text-primary-600 hover:text-primary-500"
                              >
                                Edit
                              </Link>
                              <button
                                className="text-sm font-medium text-red-600 hover:text-red-500"
                                onClick={() => {/* Delete functionality will be implemented later */}}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center">
                            <StarRating rating={review.rating} readOnly size="sm" />
                            <span className="ml-2 text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                          <p className="text-sm text-gray-600">{review.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination for reviews */}
                  {reviewsData.total > reviewsPerPage && (
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        currentPage={reviewPage}
                        totalPages={Math.ceil(reviewsData.total / reviewsPerPage)}
                        onPageChange={handleReviewPageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  <p>You haven't written any reviews yet.</p>
                  <p className="mt-2">
                    <Link
                      to="/books"
                      className="text-primary-600 hover:text-primary-500"
                    >
                      Browse books
                    </Link>
                    {' '}to find something to review.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  );
};
