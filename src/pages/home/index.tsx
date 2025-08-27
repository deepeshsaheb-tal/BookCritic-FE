import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/layout.tsx';
import { Container } from '../../components/layout/container.tsx';
import { StarRating } from '../../components/ui/star-rating.tsx';
import { Spinner } from '../../components/ui/spinner.tsx';
import { Alert } from '../../components/ui/alert.tsx';
import { useAuth } from '../../context/auth-context.tsx';
import { BookService } from '../../services/book-service.ts';
import { Book } from '../../types';

/**
 * Homepage component with personalized book recommendations
 */
export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Fetch recommended books
  const { data: recommendedBooks, isLoading: recommendedLoading, error: recommendedError } = useQuery<Book[]>(
    ['recommendedBooks'],
    () => BookService.getRecommendedBooks(),
    {
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Recommended books query only

  // Render book card
  const renderBookCard = (book: Book): React.ReactNode => (
    <div key={book.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
      <div className="flex-shrink-0">
        <img
          className="h-48 w-full object-cover"
          src={book.coverImageUrl || 'https://via.placeholder.com/300x450?text=No+Cover'}
          alt={book.title}
        />
      </div>
      <div className="flex flex-1 flex-col justify-between bg-white p-6">
        <div className="flex-1">
          <Link to={`/books/${book.id}`} className="mt-2 block">
            <p className="text-xl font-semibold text-gray-900">{book.title}</p>
            <p className="mt-1 text-sm text-gray-500">{book.author}</p>
          </Link>
          <div className="mt-2 flex items-center">
            <StarRating rating={book.averageRating || 0} readOnly size="sm" />
            <span className="ml-1 text-sm text-gray-500">
              ({book.averageRating?.toFixed(1) || 'No ratings'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render book section
  const renderBookSection = (
    title: string,
    books: Book[] | undefined,
    isLoading: boolean,
    error: unknown,
    emptyMessage: string
  ): React.ReactNode => (
    <section className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
        <Link
          to={`/books/${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          View all
        </Link>
      </div>
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <Alert type="error">Failed to load books. Please try again later.</Alert>
        ) : books && books.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {books.map(renderBookCard)}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">{emptyMessage}</div>
        )}
      </div>
    </section>
  );

  return (
    <Layout>
      {/* Hero section */}
      <div className="bg-primary-700">
        <Container>
          <div className="py-16 sm:py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                <span className="block">Discover your next</span>
                <span className="block">favorite book</span>
              </h1>
              <p className="mx-auto mt-3 max-w-md text-base text-primary-100 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
                Join thousands of readers sharing honest reviews and recommendations.
              </p>
              <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link
                    to="/books"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-primary-600 hover:bg-primary-50 md:py-4 md:px-10 md:text-lg"
                  >
                    Browse Books
                  </Link>
                </div>
                {!isAuthenticated && (
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <Link
                      to="/register"
                      className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-500 px-8 py-3 text-base font-medium text-white hover:bg-primary-600 md:py-4 md:px-10 md:text-lg"
                    >
                      Sign Up Free
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main content */}
      <Container className="py-12">
        {/* Personalized recommendations section (only for authenticated users) */}
        {isAuthenticated && (
          renderBookSection(
            `Recommended for ${user?.displayName || 'You'}`,
            recommendedBooks,
            recommendedLoading,
            recommendedError,
            'No recommendations available yet. Start rating books to get personalized recommendations!'
          )
        )}

        {/* Only showing personalized recommendations */}
      </Container>
    </Layout>
  );
};
