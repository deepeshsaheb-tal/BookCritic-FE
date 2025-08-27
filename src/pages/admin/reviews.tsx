import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../../components/layout/layout.tsx';
import { Container } from '../../components/layout/container.tsx';
import { Spinner } from '../../components/ui/spinner.tsx';
import { Alert } from '../../components/ui/alert.tsx';
import { Pagination } from '../../components/ui/pagination.tsx';
import { StarRating } from '../../components/ui/star-rating.tsx';
import { useAuth } from '../../context/auth-context.tsx';
import { AdminService } from '../../services/admin-service.ts';

interface ReviewForModeration {
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
}

/**
 * Admin review management page component
 */
export const AdminReviewsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedReview, setSelectedReview] = useState<ReviewForModeration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const reviewsPerPage = 10;

  // Fetch reviews that need moderation
  const {
    data: reviewsData,
    isLoading,
    error,
  } = useQuery(
    ['adminReviews', currentPage],
    () => AdminService.getReviewsForModeration((currentPage - 1) * reviewsPerPage, reviewsPerPage),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: isAdmin,
    }
  );

  // Approve review mutation
  const approveReviewMutation = useMutation(
    (id: string) => AdminService.approveReview(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminReviews']);
        setIsModalOpen(false);
        setSelectedReview(null);
      },
      onError: (err: any) => {
        alert(err?.message || 'Failed to approve review. Please try again.');
      },
    }
  );

  // Reject review mutation
  const rejectReviewMutation = useMutation(
    (id: string) => AdminService.rejectReview(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminReviews']);
        setIsModalOpen(false);
        setSelectedReview(null);
      },
      onError: (err: any) => {
        alert(err?.message || 'Failed to reject review. Please try again.');
      },
    }
  );

  // Handle page change
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  // Open modal to view review details
  const handleViewReview = (review: ReviewForModeration): void => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  // Handle approve review
  const handleApproveReview = (id: string): void => {
    approveReviewMutation.mutate(id);
  };

  // Handle reject review
  const handleRejectReview = (id: string): void => {
    if (window.confirm('Are you sure you want to reject this review? This action cannot be undone.')) {
      rejectReviewMutation.mutate(id);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isAdmin) {
    return (
      <Layout>
        <Container className="py-12">
          <Alert type="error">
            You do not have permission to access this page.
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Review Management</h1>
        <p className="mt-2 text-lg text-gray-600">
          Moderate reviews and manage reported content.
        </p>

        {/* Reviews table */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : error ? (
                  <div className="p-6">
                    <Alert type="error">Failed to load reviews. Please try again later.</Alert>
                  </div>
                ) : reviewsData && reviewsData.reviews.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Book
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          User
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Rating
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Reports
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {reviewsData.reviews.map((review) => (
                        <tr key={review.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {review.book.title}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {review.user.displayName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <StarRating rating={review.rating} readOnly size="sm" />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              review.reportCount > 5 
                                ? 'bg-red-100 text-red-800' 
                                : review.reportCount > 2
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {review.reportCount}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleViewReview(review)}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleApproveReview(review.id)}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectReview(review.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No reviews requiring moderation at this time.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {reviewsData && reviewsData.total > reviewsPerPage && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(reviewsData.total / reviewsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Review detail modal */}
        {isModalOpen && selectedReview && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setIsModalOpen(false)}
              ></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Review Details
                    </h3>

                    <div className="mt-4">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Book</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedReview.book.title}</p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">User</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedReview.user.displayName}</p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Rating</h4>
                        <div className="mt-1">
                          <StarRating rating={selectedReview.rating} readOnly />
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Date</h4>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedReview.createdAt)}</p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Content</h4>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedReview.content}</p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Report Count</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedReview.reportCount}</p>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        onClick={() => handleApproveReview(selectedReview.id)}
                        disabled={approveReviewMutation.isLoading}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approveReviewMutation.isLoading ? (
                          <>
                            <Spinner size="sm" color="text-white" className="mr-2" />
                            Approving...
                          </>
                        ) : 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectReview(selectedReview.id)}
                        disabled={rejectReviewMutation.isLoading}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {rejectReviewMutation.isLoading ? (
                          <>
                            <Spinner size="sm" color="text-white" className="mr-2" />
                            Rejecting...
                          </>
                        ) : 'Reject'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </Layout>
  );
};
