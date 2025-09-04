import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../../components/layout/layout.tsx';
import { Container } from '../../components/layout/container.tsx';
import { Spinner } from '../../components/ui/spinner.tsx';
import { Alert } from '../../components/ui/alert.tsx';
import { ReviewForm } from '../../components/reviews/review-form.tsx';
import { BookService } from '../../services/book-service.ts';
import { ReviewService } from '../../services/review-service.ts';
import { Book, Review } from '../../types';

/**
 * Review editor page for creating or editing reviews
 */
export const ReviewEditorPage: React.FC = () => {
  const { bookId, reviewId } = useParams<{ bookId?: string; reviewId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const isEditMode = !!reviewId;
  
  // Fetch book details if creating a new review
  const { 
    data: book, 
    isLoading: bookLoading, 
    error: bookError 
  } = useQuery<Book>(
    ['book', bookId],
    () => BookService.getBookById(bookId!),
    {
      enabled: !!bookId && !isEditMode,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  // Fetch review details if editing an existing review
  const { 
    data: review, 
    isLoading: reviewLoading, 
    error: reviewError 
  } = useQuery<Review>(
    ['review', reviewId],
    () => ReviewService.getReviewById(reviewId!),
    {
      enabled: !!reviewId && isEditMode,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  // Create review mutation
  const createReviewMutation = useMutation(
    (data: { bookId: string; content: string; rating: number }) => 
      ReviewService.createReview({
        bookId: data.bookId,
        content: data.content,
        rating: data.rating,
      }),
    {
      onSuccess: (data, variables) => {
        // Invalidate and refetch book reviews
        queryClient.invalidateQueries(['bookReviews', variables.bookId]);
        queryClient.invalidateQueries(['book', variables.bookId]);
        navigate(`/books/${variables.bookId}`);
      },
      onError: (err: any) => {
        setError(err?.message || 'Failed to create review. Please try again.');
      },
    }
  );
  
  // Update review mutation
  const updateReviewMutation = useMutation(
    (data: { id: string; content: string; rating: number }) => 
      ReviewService.updateReview(data.id, {
        content: data.content,
        rating: data.rating,
      }),
    {
      onSuccess: (updatedReview) => {
        if (review?.book?.id) {
          // Invalidate and refetch book reviews and the specific review
          queryClient.invalidateQueries(['bookReviews', review.book.id]);
          queryClient.invalidateQueries(['review', reviewId]);
          queryClient.invalidateQueries(['book', review.book.id]);
          navigate(`/books/${review.book.id}`);
        } else {
          // Fallback to books page if book ID is not available
          navigate('/books');
        }
      },
      onError: (err: any) => {
        setError(err?.message || 'Failed to update review. Please try again.');
      },
    }
  );
  
  // Handle form submission
  const handleSubmit = (rating: number, content: string): void => {
    if (isEditMode && reviewId) {
      updateReviewMutation.mutate({
        id: reviewId,
        content,
        rating,
      });
    } else if (bookId) {
      createReviewMutation.mutate({
        bookId,
        content,
        rating,
      });
    }
  };
  
  // Handle cancel
  const handleCancel = (): void => {
    if (isEditMode && review) {
      navigate(`/books/${review.book.id}`);
    } else if (bookId) {
      navigate(`/books/${bookId}`);
    } else {
      navigate('/');
    }
  };
  
  // Loading state
  const isLoading = (isEditMode && reviewLoading) || (!isEditMode && bookLoading);
  
  // Error state
  const loadingError = (isEditMode && reviewError) || (!isEditMode && bookError);
  
  if (isLoading) {
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
  
  if (loadingError) {
    return (
      <Layout>
        <Container className="py-12">
          <Alert type="error">
            {isEditMode 
              ? 'Failed to load review. Please try again later.' 
              : 'Failed to load book details. Please try again later.'
            }
          </Alert>
          <div className="mt-6 text-center">
            <Link
              to={isEditMode && review ? `/books/${review.book.id}` : '/books'}
              className="text-primary-600 hover:text-primary-500"
            >
              Go back
            </Link>
          </div>
        </Container>
      </Layout>
    );
  }
  
  // If editing but review not found
  if (isEditMode && !review) {
    return (
      <Layout>
        <Container className="py-12">
          <Alert type="error">Review not found.</Alert>
          <div className="mt-6 text-center">
            <Link to="/books" className="text-primary-600 hover:text-primary-500">
              Browse books
            </Link>
          </div>
        </Container>
      </Layout>
    );
  }
  
  // If creating but book not found
  if (!isEditMode && !book) {
    return (
      <Layout>
        <Container className="py-12">
          <Alert type="error">Book not found.</Alert>
          <div className="mt-6 text-center">
            <Link to="/books" className="text-primary-600 hover:text-primary-500">
              Browse books
            </Link>
          </div>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container className="py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isEditMode ? 'Edit Review' : 'Write a Review'}
          </h1>
          
          <div className="mt-8">
            <ReviewForm
              initialRating={isEditMode ? review?.rating : 0}
              initialContent={isEditMode ? review?.content : ''}
              bookTitle={isEditMode ? review?.book.title : book?.title}
              isSubmitting={createReviewMutation.isLoading || updateReviewMutation.isLoading}
              error={error}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </Container>
    </Layout>
  );
};
