import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/auth-context.tsx';
import { Layout } from '../../components/layout/layout.tsx';
import { Container } from '../../components/layout/container.tsx';
import { Pagination } from '../../components/ui/pagination.tsx';
import { Spinner } from '../../components/ui/spinner.tsx';
import { Alert } from '../../components/ui/alert.tsx';
import { ReviewService } from '../../services/review-service.ts';
import { ReviewResponse } from '../../types';

/**
 * User's reviews page
 */
export const UserReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  // Fetch user's reviews
  const { data, isLoading, error } = useQuery<ReviewResponse>(
    ['userReviews', user?.id, skip, pageSize],
    () => ReviewService.getUserReviews(user!.id, skip, pageSize),
    {
      enabled: !!user?.id,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Handle pagination
  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <Container className="py-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">My Reviews</h1>
        
        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <Alert type="error">Failed to load your reviews. Please try again later.</Alert>
          ) : data && data.reviews.length > 0 ? (
            <>
              <div className="space-y-8">
                {data.reviews.map((review) => (
                  <div key={review.id} className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          <a href={`/books/${review.book.id}`} className="hover:underline">
                            {review.book.title}
                          </a>
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <div className="ml-4">
                          <a
                            href={`/reviews/${review.id}/edit`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            Edit
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <p className="text-gray-700">{review.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {data.total > pageSize && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(data.total / pageSize)}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <p>You haven't written any reviews yet.</p>
              <a
                href="/books"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Browse Books to Review
              </a>
            </div>
          )}
        </div>
      </Container>
    </Layout>
  );
};
