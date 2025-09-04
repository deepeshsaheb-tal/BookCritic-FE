import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../../components/layout/layout.tsx';
import { Container } from '../../components/layout/container.tsx';
import { Spinner } from '../../components/ui/spinner.tsx';
import { Alert } from '../../components/ui/alert.tsx';
import { Pagination } from '../../components/ui/pagination.tsx';
import { useAuth } from '../../context/auth-context.tsx';
import { AdminService } from '../../services/admin-service.ts';
import { User } from '../../types';

interface UserFormData {
  id: string;
  displayName: string;
  email: string;
  role: 'user' | 'admin';
}

/**
 * Admin user management page component
 */
export const AdminUsersPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [ setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    id: '',
    displayName: '',
    email: '',
    role: 'user',
  });
  const [formError, setFormError] = useState<string>('');
  const usersPerPage = 10;

  // Fetch users with pagination
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery(
    ['adminUsers', currentPage],
    () => AdminService.getUsers((currentPage - 1) * usersPerPage, usersPerPage),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: isAdmin,
    }
  );

  // Update user mutation
  const updateUserMutation = useMutation(
    (data: UserFormData) => AdminService.updateUser(data.id, {
      displayName: data.displayName,
      role: data.role,
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminUsers']);
        resetForm();
        setIsModalOpen(false);
      },
      onError: (err: any) => {
        setFormError(err?.message || 'Failed to update user. Please try again.');
      },
    }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(
    (id: string) => AdminService.deleteUser(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminUsers']);
      },
      onError: (err: any) => {
        alert(err?.message || 'Failed to delete user. Please try again.');
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
      id: '',
      displayName: '',
      email: '',
      role: 'user',
    });
    setSelectedUser(null);
    setFormError('');
  };

  // Open modal for editing a user
  const handleEditUser = (user: User): void => {
    setSelectedUser(user);
    setFormData({
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role as 'user' | 'admin',
    });
    setIsModalOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (id: string): void => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(id);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setFormError('');

    // Validate form
    if (!formData.displayName.trim()) {
      setFormError('Display name is required');
      return;
    }

    updateUserMutation.mutate(formData);
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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage user accounts and permissions.
        </p>

        {/* Users table */}
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
                    <Alert type="error">Failed to load users. Please try again later.</Alert>
                  </div>
                ) : usersData && usersData.users.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Role
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Joined
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Reviews
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
                      {usersData.users.map((user) => (
                        <tr key={user.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {user.displayName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.reviewCount || 0}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
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
                    No users found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {usersData && usersData.total > usersPerPage && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(usersData.total / usersPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* User form modal */}
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
                      Edit User
                    </h3>

                    {formError && (
                      <Alert type="error" className="mt-4" onClose={() => setFormError('')}>
                        {formError}
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                          Display Name
                        </label>
                        <input
                          type="text"
                          name="displayName"
                          id="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          disabled
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Email cannot be changed.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={updateUserMutation.isLoading}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updateUserMutation.isLoading ? (
                            <>
                              <Spinner size="sm" color="text-white" className="mr-2" />
                              Updating...
                            </>
                          ) : 'Update'}
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
