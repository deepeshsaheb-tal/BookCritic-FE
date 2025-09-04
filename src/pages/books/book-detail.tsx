import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../../components/layout/layout.tsx';
import { Container } from '../../components/layout/container.tsx';
import { StarRating } from '../../components/ui/star-rating.tsx';
import { Spinner } from '../../components/ui/spinner.tsx';
import { Alert } from '../../components/ui/alert.tsx';
import { Pagination } from '../../components/ui/pagination.tsx';
import { useAuth } from '../../context/auth-context.tsx';
import { BookService } from '../../services/book-service.ts';
import { ReviewService } from '../../services/review-service.ts';
import { UserService } from '../../services/user-service.ts';
import { FavoriteService } from '../../services/favorite-service.ts';
import { Book, Review, ReviewResponse } from '../../types';

/**
 * Book detail page component
 */
export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [reviewPage, setReviewPage] = useState<number>(1);
  const reviewsPerPage = 5;
  const queryClient = useQueryClient();
  const [isInReadingList, setIsInReadingList] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  
  // Fetch book details
  const { 
    data: book, 
    isLoading: bookLoading, 
    error: bookError 
  } = useQuery<Book>(
    ['book', id],
    () => BookService.getBookById(id!),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  // Check if book is in reading list
  useQuery(
    ['readingList', id],
    () => UserService.getReadingList(0, 100),
    {
      enabled: !!id && isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onSuccess: (data) => {
        const isInList = data.books.some((book) => book.id === id);
        setIsInReadingList(isInList);
      }
    }
  );
  
  // Check if book is in favorites
  const {
    isLoading: favoriteCheckLoading
  } = useQuery(
    ['favorite', id],
    () => FavoriteService.checkFavorite(id!),
    {
      enabled: !!id && isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onSuccess: (data) => {
        setIsFavorite(data);
      }
    }
  );
  
  // Add to reading list mutation
  const addToReadingListMutation = useMutation(
    () => UserService.addToReadingList(id!),
    {
      onSuccess: () => {
        setIsInReadingList(true);
        queryClient.invalidateQueries(['readingList']);
      },
      onError: (err: any) => {
        alert(err?.message || 'Failed to add book to reading list. Please try again.');
      }
    }
  );
  
  // Remove from reading list mutation
  const removeFromReadingListMutation = useMutation(
    () => UserService.removeFromReadingList(id!),
    {
      onSuccess: () => {
        setIsInReadingList(false);
        queryClient.invalidateQueries(['readingList']);
      },
      onError: (err: any) => {
        alert(err?.message || 'Failed to remove book from reading list. Please try again.');
      }
    }
  );
  
  // Add to favorites mutation
  const addToFavoritesMutation = useMutation(
    () => FavoriteService.addFavorite(id!),
    {
      onSuccess: () => {
        setIsFavorite(true);
        queryClient.invalidateQueries(['favorite']);
      },
      onError: (err: any) => {
        alert(err?.message || 'Failed to add book to favorites. Please try again.');
      }
    }
  );
  
  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation(
    () => FavoriteService.removeFavorite(id!),
    {
      onSuccess: () => {
        setIsFavorite(false);
        queryClient.invalidateQueries(['favorite']);
      },
      onError: (err: any) => {
        alert(err?.message || 'Failed to remove book from favorites. Please try again.');
      }
    }
  );
  
  // Handle reading list toggle
  const handleReadingListToggle = (): void => {
    if (isInReadingList) {
      if (window.confirm('Are you sure you want to remove this book from your reading list?')) {
        removeFromReadingListMutation.mutate();
      }
    } else {
      addToReadingListMutation.mutate();
    }
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = (): void => {
    if (isFavorite) {
      if (window.confirm('Are you sure you want to remove this book from your favorites?')) {
        removeFromFavoritesMutation.mutate();
      }
    } else {
      addToFavoritesMutation.mutate();
    }
  };
  
  // Fetch book reviews with pagination
  const { 
    data: reviewsData, 
    isLoading: reviewsLoading, 
    error: reviewsError 
  } = useQuery<ReviewResponse>(
    ['bookReviews', id, reviewPage],
    () => ReviewService.getBookReviews(id!, (reviewPage - 1) * reviewsPerPage, reviewsPerPage),
    {
      enabled: !!id,
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
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Render review item
  const renderReview = (review: Review): React.ReactNode => (
    <div key={review.id} className="border-b border-gray-200 py-6 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-4 h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 font-medium">
              {review.user.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{review.user.displayName}</h4>
            <div className="mt-1 flex items-center">
              <StarRating rating={review.rating} readOnly size="sm" />
              <span className="ml-2 text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Show edit/delete buttons if user owns this review */}
        {isAuthenticated && user?.id === review.user.id && (
          <div className="flex space-x-2">
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
        )}
      </div>
      <div className="mt-4 space-y-6 text-sm text-gray-600">
        <p>{review.content}</p>
      </div>
    </div>
  );
  
  if (bookLoading) {
    return (
      <Layout>
        <Container className="py-12">
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
        </Container>
      </Layout>
    );
  }
  
  if (bookError) {
    return (
      <Layout>
        <Container className="py-12">
          <Alert type="error">Failed to load book details. Please try again later.</Alert>
        </Container>
      </Layout>
    );
  }
  
  if (!book) {
    return (
      <Layout>
        <Container className="py-12">
          <Alert type="error">Book not found.</Alert>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container className="py-8">
        {/* Book details section */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Book cover */}
          <div className="md:col-span-1">
            <div className="aspect-w-2 aspect-h-3 overflow-hidden rounded-lg">
              <img
                src={book.coverImageUrl || 'https://via.placeholder.com/300x450?text=No+Cover'}
                alt={book.title}
                className="h-full w-full object-cover object-center"
              />
            </div>
            
            {/* Add to reading list / Favorite / Write review buttons */}
            {isAuthenticated && (
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleReadingListToggle}
                  disabled={addToReadingListMutation.isLoading || removeFromReadingListMutation.isLoading}
                  className={`w-full flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${isInReadingList 
                    ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' 
                    : 'border-transparent text-white bg-primary-600 hover:bg-primary-700'}`}
                >
                  {addToReadingListMutation.isLoading || removeFromReadingListMutation.isLoading ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : isInReadingList ? (
                    'Remove from Reading List'
                  ) : (
                    'Add to Reading List'
                  )}
                </button>
                
                {/* Favorite button */}
                <button
                  type="button"
                  onClick={handleFavoriteToggle}
                  disabled={addToFavoritesMutation.isLoading || removeFromFavoritesMutation.isLoading || favoriteCheckLoading}
                  className={`w-full flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${isFavorite 
                    ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                >
                  {addToFavoritesMutation.isLoading || removeFromFavoritesMutation.isLoading ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="inline-flex items-center">
                      <svg className={`-ml-1 mr-2 h-5 w-5 ${isFavorite ? 'text-yellow-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </span>
                  )}
                </button>
                
                <Link
                  to={`/books/${book.id}/review`}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Write a Review
                </Link>
              </div>
            )}
          </div>
          
          {/* Book info */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{book.title}</h1>
            <p className="mt-2 text-lg text-gray-600">by {book.author}</p>
            
            <div className="mt-4 flex items-center">
              <StarRating rating={book.averageRating || 0} readOnly size="md" />
              <span className="ml-2 text-sm text-gray-500">
                {book.averageRating?.toFixed(1) || 'No ratings'} ({book.totalReviews} {book.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            
            {book.isbn && (
              <p className="mt-2 text-sm text-gray-500">ISBN: {book.isbn}</p>
            )}
            
            {book.publishedDate && (
              <p className="mt-1 text-sm text-gray-500">
                Published: {formatDate(book.publishedDate)}
              </p>
            )}
            
            {book.genres && book.genres.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">Genres</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {book.genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center rounded-full bg-primary-100 px-3 py-0.5 text-sm font-medium text-primary-800"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {book.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                <div className="mt-2 space-y-4 text-base text-gray-600">
                  <p>{book.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Reviews section */}
        <div id="reviews" className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Reviews</h2>
          
          {/* Write review CTA for authenticated users */}
          {isAuthenticated && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Share your thoughts with other readers.
              </p>
              <Link
                to={`/books/${book.id}/review`}
                className="flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Write a Review
              </Link>
            </div>
          )}
          
          {/* Reviews list */}
          <div className="mt-6">
            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="md" />
              </div>
            ) : reviewsError ? (
              <Alert type="error">Failed to load reviews. Please try again later.</Alert>
            ) : reviewsData && reviewsData.reviews.length > 0 ? (
              <>
                <div className="flow-root">
                  <div className="-my-6 divide-y divide-gray-200">
                    {reviewsData.reviews.map(renderReview)}
                  </div>
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
                No reviews yet. Be the first to review this book!
              </div>
            )}
          </div>
        </div>
      </Container>
    </Layout>
  );
};
