import React, { useState } from 'react';
import { StarRating } from '../ui/star-rating.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { Alert } from '../ui/alert.tsx';

interface ReviewFormProps {
  initialRating?: number;
  initialContent?: string;
  bookTitle?: string;
  isSubmitting: boolean;
  error?: string;
  onSubmit: (rating: number, content: string) => void;
  onCancel?: () => void;
}

/**
 * Review form component for creating and editing reviews
 */
export const ReviewForm: React.FC<ReviewFormProps> = ({
  initialRating = 0,
  initialContent = '',
  bookTitle,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [content, setContent] = useState<string>(initialContent);
  const [contentError, setContentError] = useState<string>('');
  const [ratingError, setRatingError] = useState<string>('');

  // Handle rating change
  const handleRatingChange = (newRating: number): void => {
    setRating(newRating);
    setRatingError('');
  };

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setContent(e.target.value);
    setContentError('');
  };

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;

    if (rating === 0) {
      setRatingError('Please select a rating');
      isValid = false;
    }

    if (!content.trim()) {
      setContentError('Please enter a review');
      isValid = false;
    } else if (content.trim().length < 10) {
      setContentError('Review must be at least 10 characters long');
      isValid = false;
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(rating, content);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert type="error" className="mb-4" onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Book title if provided */}
      {bookTitle && (
        <div>
          <h3 className="text-lg font-medium text-gray-900">Review for "{bookTitle}"</h3>
        </div>
      )}

      {/* Rating */}
      <div>
        <div className="flex items-center">
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mr-4">
            Your Rating
          </label>
          <StarRating
            rating={rating}
            onChange={handleRatingChange}
            size="lg"
          />
        </div>
        {ratingError && (
          <p className="mt-1 text-sm text-red-600">{ratingError}</p>
        )}
      </div>

      {/* Review content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Your Review
        </label>
        <div className="mt-1">
          <textarea
            id="content"
            name="content"
            rows={5}
            value={content}
            onChange={handleContentChange}
            placeholder="Share your thoughts about this book..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        {contentError && (
          <p className="mt-1 text-sm text-red-600">{contentError}</p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          Be honest and helpful. Your review will help other readers make informed decisions.
        </p>
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" color="text-white" className="mr-2" />
              Submitting...
            </>
          ) : initialContent ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};
