import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../../components/layout/layout.tsx';
import { Container } from '../../components/layout/container.tsx';
import { Pagination } from '../../components/ui/pagination.tsx';
import { StarRating } from '../../components/ui/star-rating.tsx';
import { Spinner } from '../../components/ui/spinner.tsx';
import { Alert } from '../../components/ui/alert.tsx';
import { BookService } from '../../services/book-service.ts';
import { Book, BookResponse } from '../../types';

/**
 * Book browsing page with search, filtering, and pagination
 */
export const BooksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    genre: searchParams.get('genre') || '',
  });
  
  // Pagination state
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 12;
  const skip = (page - 1) * pageSize;
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.genre) params.set('genre', filters.genre);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params);
  }, [filters, page, setSearchParams]);
  
  // Fetch books with filters and pagination
  const { data, isLoading, error } = useQuery<BookResponse>(
    ['books', skip, pageSize, filters],
    () => filters.search
      ? BookService.searchBooks(filters.search, skip, pageSize)
      : BookService.getBooks(skip, pageSize),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    // Reset to page 1 when searching
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    // Reset to page 1 when filters change
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };
  
  // Handle pagination
  const handlePageChange = (newPage: number): void => {
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <Layout>
      <Container className="py-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Browse Books</h1>
        
        {/* Search and filters */}
        <div className="mt-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                name="search"
                id="search"
                value={filters.search}
                onChange={handleSearchChange}
                placeholder="Search books by title or author"
                className="block w-full rounded-md border-gray-300 pr-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="submit"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Results */}
        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <Alert type="error">Failed to load books. Please try again later.</Alert>
          ) : data && data.books.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.books.map((book) => (
                  <div key={book.id} className="group relative">
                    <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none lg:h-80">
                      <img
                        src={book.coverImageUrl || 'https://via.placeholder.com/300x450?text=No+Cover'}
                        alt={book.title}
                        className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                      />
                    </div>
                    <div className="mt-4 flex justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          <a href={`/books/${book.id}`}>
                            <span aria-hidden="true" className="absolute inset-0" />
                            {book.title}
                          </a>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{book.author}</p>
                      </div>
                      <div className="flex items-center">
                        <StarRating rating={book.averageRating || 0} readOnly size="sm" />
                        <span className="ml-1 text-sm text-gray-500">
                          ({book.totalReviews})
                        </span>
                      </div>
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
              No books found. Try adjusting your search or filters.
            </div>
          )}
        </div>
      </Container>
    </Layout>
  );
};
