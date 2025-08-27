import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../../components/layout/layout.tsx';
import { Container } from '../../components/layout/container.tsx';
import { Spinner } from '../../components/ui/spinner.tsx';
import { Alert } from '../../components/ui/alert.tsx';
import { Pagination } from '../../components/ui/pagination.tsx';
import { useAuth } from '../../context/auth-context.tsx';
import { BookService } from '../../services/book-service.ts';
import { Book } from '../../types';

interface BookFormData {
  id?: string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  publishedDate: string;
  coverImageUrl: string;
  genres: string[];
}

/**
 * Admin book management page component
 */
export const AdminBooksPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    isbn: '',
    description: '',
    publishedDate: '',
    coverImageUrl: '',
    genres: [],
  });
  const [formError, setFormError] = useState<string>('');
  const booksPerPage = 10;

  // Fetch books with pagination
  const {
    data: booksData,
    isLoading,
    error,
  } = useQuery(
    ['adminBooks', currentPage],
    () => BookService.getBooks((currentPage - 1) * booksPerPage, booksPerPage),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Create book mutation
  const createBookMutation = useMutation(
    (data: Omit<BookFormData, 'id'>) => BookService.createBook(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminBooks']);
        resetForm();
        setIsModalOpen(false);
      },
      onError: (err: any) => {
        setFormError(err?.message || 'Failed to create book. Please try again.');
      },
    }
  );

  // Update book mutation
  const updateBookMutation = useMutation(
    (data: BookFormData) => BookService.updateBook(data.id!, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminBooks']);
        resetForm();
        setIsModalOpen(false);
      },
      onError: (err: any) => {
        setFormError(err?.message || 'Failed to update book. Please try again.');
      },
    }
  );

  // Delete book mutation
  const deleteBookMutation = useMutation(
    (id: string) => BookService.deleteBook(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminBooks']);
      },
      onError: (err: any) => {
        alert(err?.message || 'Failed to delete book. Please try again.');
      },
    }
  );

  // Handle page change
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  // Reset form
  const resetForm = (): void => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      description: '',
      publishedDate: '',
      coverImageUrl: '',
      genres: [],
    });
    setSelectedBook(null);
    setFormError('');
  };

  // Open modal for creating a new book
  const handleAddBook = (): void => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing a book
  const handleEditBook = (book: Book): void => {
    setSelectedBook(book);
    setFormData({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      description: book.description || '',
      publishedDate: book.publishedDate || '',
      coverImageUrl: book.coverImageUrl || '',
      genres: book.genres || [],
    });
    setIsModalOpen(true);
  };

  // Handle delete book
  const handleDeleteBook = (id: string): void => {
    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      deleteBookMutation.mutate(id);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle genres change
  const handleGenresChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const genres = e.target.value.split(',').map((genre) => genre.trim());
    setFormData((prev) => ({
      ...prev,
      genres,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setFormError('');

    // Validate form
    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }

    if (!formData.author.trim()) {
      setFormError('Author is required');
      return;
    }

    if (selectedBook) {
      // Update existing book
      updateBookMutation.mutate(formData);
    } else {
      // Create new book
      createBookMutation.mutate(formData);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Book Management</h1>
          <button
            type="button"
            onClick={handleAddBook}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add New Book
          </button>
        </div>

        {/* Books table */}
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
                    <Alert type="error">Failed to load books. Please try again later.</Alert>
                  </div>
                ) : booksData && booksData.books.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Title
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Author
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          ISBN
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Published Date
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Rating
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
                      {booksData.books.map((book) => (
                        <tr key={book.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {book.title}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {book.author}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {book.isbn || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {book.publishedDate ? formatDate(book.publishedDate) : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {book.averageRating?.toFixed(1) || '-'} ({book.totalReviews || 0})
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleEditBook(book)}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No books found. Add a new book to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {booksData && booksData.total > booksPerPage && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(booksData.total / booksPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Book form modal */}
        {isModalOpen && (
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
                      {selectedBook ? 'Edit Book' : 'Add New Book'}
                    </h3>

                    {formError && (
                      <Alert type="error" className="mt-4" onClose={() => setFormError('')}>
                        {formError}
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                          Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          id="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                          Author *
                        </label>
                        <input
                          type="text"
                          name="author"
                          id="author"
                          value={formData.author}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                          ISBN
                        </label>
                        <input
                          type="text"
                          name="isbn"
                          id="isbn"
                          value={formData.isbn}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="publishedDate" className="block text-sm font-medium text-gray-700">
                          Published Date
                        </label>
                        <input
                          type="date"
                          name="publishedDate"
                          id="publishedDate"
                          value={formData.publishedDate ? formatDate(formData.publishedDate) : ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700">
                          Cover Image URL
                        </label>
                        <input
                          type="url"
                          name="coverImageUrl"
                          id="coverImageUrl"
                          value={formData.coverImageUrl}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="genres" className="block text-sm font-medium text-gray-700">
                          Genres (comma separated)
                        </label>
                        <input
                          type="text"
                          name="genres"
                          id="genres"
                          value={formData.genres.join(', ')}
                          onChange={handleGenresChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows={4}
                          value={formData.description}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={createBookMutation.isLoading || updateBookMutation.isLoading}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {createBookMutation.isLoading || updateBookMutation.isLoading ? (
                            <>
                              <Spinner size="sm" color="text-white" className="mr-2" />
                              {selectedBook ? 'Updating...' : 'Creating...'}
                            </>
                          ) : (
                            selectedBook ? 'Update' : 'Create'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
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
