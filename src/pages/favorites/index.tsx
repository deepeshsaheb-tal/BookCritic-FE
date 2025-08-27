import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/layout.tsx';
import { Container } from '../../components/layout/container.tsx';
import { Spinner } from '../../components/ui/spinner.tsx';
import { Alert } from '../../components/ui/alert.tsx';
import { Pagination } from '../../components/ui/pagination.tsx';
import { StarRating } from '../../components/ui/star-rating.tsx';
import { FavoriteService } from '../../services/favorite-service.ts';
import { UserFavorite } from '../../types';

/**
 * Favorites page component to display user's favorite books
 */
export const FavoritesPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 10;
  
  // Fetch user's favorite books
  const { 
    data: favoritesData, 
    isLoading, 
    error 
  } = useQuery(
    ['favorites', page],
    () => FavoriteService.getUserFavorites(),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Calculate pagination
  const totalItems = favoritesData?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentPageItems = favoritesData?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (error) {
    return (
      <Layout>
        <Container className="py-12">
          <Alert type="error">Failed to load favorites. Please try again later.</Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-8">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">My Favorite Books</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Your collection of favorite books. Click on a book to view details.
          </p>
        </div>

        {currentPageItems && currentPageItems.length > 0 ? (
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {currentPageItems.map((favorite: UserFavorite) => (
                favorite.book && (
                  <Link key={favorite.book.id} to={`/books/${favorite.book.id}`} className="group">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                      <img
                        src={favorite.book.coverImageUrl || 'https://via.placeholder.com/300x450?text=No+Cover'}
                        alt={favorite.book.title}
                        className="h-full w-full object-cover object-center group-hover:opacity-75"
                      />
                    </div>
                    <h3 className="mt-4 text-sm text-gray-700">{favorite.book.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">by {favorite.book.author}</p>
                    <div className="mt-2 flex items-center">
                      <StarRating rating={favorite.book.averageRating || 0} readOnly size="sm" />
                      <span className="ml-2 text-sm text-gray-500">
                        {favorite.book.averageRating?.toFixed(1) || 'No ratings'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Added on {formatDate(favorite.createdAt)}
                    </p>
                  </Link>
                )
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="mt-12 text-center">
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
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No favorites yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start adding books to your favorites to see them here.
            </p>
            <div className="mt-6">
              <Link
                to="/books"
                className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Browse Books
              </Link>
            </div>
          </div>
        )}
      </Container>
    </Layout>
  );
};
