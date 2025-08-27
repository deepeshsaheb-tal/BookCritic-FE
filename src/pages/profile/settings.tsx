import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthLogout } from '../../hooks/use-auth-logout.ts';
import { useMutation } from '@tanstack/react-query';
import { Layout } from '../../components/layout/layout.tsx';
import { Container } from '../../components/layout/container.tsx';
import { Spinner } from '../../components/ui/spinner.tsx';
import { Alert } from '../../components/ui/alert.tsx';
import { useAuth } from '../../context/auth-context.tsx';
import { UserService } from '../../services/user-service.ts';

interface ProfileFormData {
  displayName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * User profile settings page component
 */
export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const logoutAndNavigate = useAuthLogout();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: user?.displayName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Update profile mutation
  const updateProfileMutation = useMutation(
    (data: { displayName: string }) => UserService.updateProfile(data),
    {
      onSuccess: () => {
        setSuccess('Profile updated successfully.');
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      },
      onError: (err: any) => {
        setError(err?.message || 'Failed to update profile. Please try again.');
      },
    }
  );
  
  // Change password mutation
  const changePasswordMutation = useMutation(
    (data: { currentPassword: string; newPassword: string }) => 
      UserService.changePassword(data),
    {
      onSuccess: () => {
        setSuccess('Password changed successfully. Please log in again.');
        setTimeout(() => {
          logoutAndNavigate();
        }, 3000);
      },
      onError: (err: any) => {
        setError(err?.message || 'Failed to change password. Please try again.');
      },
    }
  );
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Validate profile form
  const validateProfileForm = (): boolean => {
    if (!formData.displayName.trim()) {
      setError('Display name is required');
      return false;
    }
    
    return true;
  };
  
  // Validate password form
  const validatePasswordForm = (): boolean => {
    if (!formData.currentPassword) {
      setError('Current password is required');
      return false;
    }
    
    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    
    return true;
  };
  
  // Handle profile form submission
  const handleProfileSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (validateProfileForm()) {
      updateProfileMutation.mutate({
        displayName: formData.displayName,
      });
    }
  };
  
  // Handle password form submission
  const handlePasswordSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (validatePasswordForm()) {
      changePasswordMutation.mutate({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
    }
  };
  
  if (!user) {
    return (
      <Layout>
        <Container className="py-12">
          <Alert type="error">You must be logged in to access this page.</Alert>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container className="py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account Settings</h1>
          
          {success && (
            <Alert type="success" className="mt-6" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}
          
          {error && (
            <Alert type="error" className="mt-6" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {/* Profile Information Form */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your account's profile information.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      disabled
                      value={formData.email}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-gray-50 text-gray-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed. Contact support if you need to update your email.
                  </p>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateProfileMutation.isLoading ? (
                      <>
                        <Spinner size="sm" color="text-white" className="mr-2" />
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Change Password Form */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
              <p className="mt-1 text-sm text-gray-500">
                Ensure your account is using a secure password.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      required
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters long.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changePasswordMutation.isLoading ? (
                      <>
                        <Spinner size="sm" color="text-white" className="mr-2" />
                        Changing Password...
                      </>
                    ) : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Delete Account Section */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-red-600">Delete Account</h2>
              <p className="mt-1 text-sm text-gray-500">
                Once your account is deleted, all of your data will be permanently removed.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // Delete account functionality will be implemented later
                  }
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  );
};
