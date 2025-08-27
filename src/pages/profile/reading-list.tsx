import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/layout.tsx';
import { Container } from '../../components/layout/container.tsx';
import { Spinner } from '../../components/ui/spinner.tsx';
import { Alert } from '../../components/ui/alert.tsx';
import { Pagination } from '../../components/ui/pagination.tsx';
import { StarRating } from '../../components/ui/star-rating.tsx';
import { useAuth } from '../../context/auth-context.tsx';
import { UserService } from '../../services/user-service.ts';
import { Book } from '../../types';

/**
 * User reading list page component
 */
export const ReadingListPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const booksPerPage = 10;

  // Fetch user's reading list with pagination
  const {
    data: readingListData,
    isLoading,
    error,
  } = useQuery(
    ['readingList', currentPage],
    () => UserService.getReadingList((currentPage - 1) * booksPerPage, booksPerPage),
    {
      enabled: isAuthenticated,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Remove book from reading list mutation
  const removeFromReadingListMutation = useMutation(
    (bookId: string) => UserService.removeFromReadingList(bookId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['readingList']);
      },
      onError: (err: any) => {
        alert(err?.message || 'Failed to remove book from reading list. Please try again.');
      },
    }
  );

  // Handle page change
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  // Handle remove from reading list
  const handleRemoveFromReadingList = (bookId: string): void => {
    if (window.confirm('Are you sure you want to remove this book from your reading list?')) {
      removeFromReadingListMutation.mutate(bookId);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <Container className="py-12">
          <Alert type="error">
            You need to be logged in to view your reading list.
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Reading List</h1>
            <p className="mt-2 text-lg text-gray-600">
              Books you've saved to read later.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/books"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Browse Books
            </Link>
          </div>
        </div>

        {/* Reading list */}
        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <Alert type="error">
              Failed to load your reading list. Please try again later.
            </Alert>
          ) : readingListData && readingListData.books.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {readingListData.books.map((book: Book) => (
                <div key={book.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-4 flex items-start">
                    <div className="flex-shrink-0 h-32 w-24 bg-gray-200 rounded overflow-hidden">
                      {book.coverImageUrl ? (
                        <img
                          src={book.coverImageUrl}
                          alt={`${book.title} cover`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                          No Cover
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <Link to={`/books/${book.id}`}>
                        <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600">
                          {book.title}
                        </h3>
                      </Link>
                      <p className="mt-1 text-sm text-gray-500">{book.author}</p>
                      <div className="mt-2 flex items-center">
                        <StarRating rating={book.averageRating || 0} readOnly size="sm" />
                        <span className="ml-1 text-sm text-gray-500">
                          ({book.averageRating?.toFixed(1) || 'No ratings'})
                        </span>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Link
                          to={`/books/${book.id}`}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleRemoveFromReadingList(book.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          disabled={removeFromReadingListMutation.isLoading}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No books in your reading list</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start browsing books and add them to your reading list.
              </p>
              <div className="mt-6">
                <Link
                  to="/books"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Browse Books
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {readingListData && readingListData.total > booksPerPage && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(readingListData.total / booksPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Container>
    </Layout>
  );
};
