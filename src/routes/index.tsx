import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth-context.tsx';
import { Spinner } from '../components/ui/spinner.tsx';

// Lazy loaded auth pages
const LoginPage = lazy(() => import('../pages/auth/login.tsx').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/register.tsx').then(module => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../pages/auth/forgot-password.tsx').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/auth/reset-password.tsx').then(module => ({ default: module.ResetPasswordPage })));

// Lazy loaded main pages
const HomePage = lazy(() => import('../pages/home/index.tsx').then(module => ({ default: module.HomePage })));
const BooksPage = lazy(() => import('../pages/books/index.tsx').then(module => ({ default: module.BooksPage })));
const BookDetailPage = lazy(() => import('../pages/books/book-detail.tsx').then(module => ({ default: module.BookDetailPage })));
const ReviewEditorPage = lazy(() => import('../pages/reviews/review-editor.tsx').then(module => ({ default: module.ReviewEditorPage })));
const ProfilePage = lazy(() => import('../pages/profile/index.tsx').then(module => ({ default: module.ProfilePage })));
const ProfileSettingsPage = lazy(() => import('../pages/profile/settings.tsx').then(module => ({ default: module.ProfileSettingsPage })));
const ReadingListPage = lazy(() => import('../pages/profile/reading-list.tsx').then(module => ({ default: module.ReadingListPage })));
const UserReviewsPage = lazy(() => import('../pages/profile/reviews.tsx').then(module => ({ default: module.UserReviewsPage })));
const FavoritesPage = lazy(() => import('../pages/favorites/index.tsx').then(module => ({ default: module.FavoritesPage })));

// Lazy loaded admin pages
const AdminDashboard = lazy(() => import('../pages/admin/dashboard.tsx').then(module => ({ default: module.AdminDashboard })));
const AdminBooksPage = lazy(() => import('../pages/admin/books.tsx').then(module => ({ default: module.AdminBooksPage })));
const AdminUsersPage = lazy(() => import('../pages/admin/users.tsx').then(module => ({ default: module.AdminUsersPage })));
const AdminReviewsPage = lazy(() => import('../pages/admin/reviews.tsx').then(module => ({ default: module.AdminReviewsPage })));
const PerformanceDashboard = lazy(() => import('../components/admin/performance-dashboard.tsx').then(module => ({ default: module.PerformanceDashboard })));

// Protected route wrapper
interface ProtectedRouteProps {
  isAllowed: boolean;
  redirectPath?: string;
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAllowed,
  redirectPath = '/login',
  children,
}) => {
  const location = useLocation();

  if (!isAllowed) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

/**
 * Application routes configuration
 */
export const AppRoutes: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen">
      <Spinner size="lg" />
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected routes for authenticated users */}
      <Route
        element={<ProtectedRoute isAllowed={isAuthenticated} />}
      >
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/settings" element={<ProfileSettingsPage />} />
        <Route path="/profile/reading-list" element={<ReadingListPage />} />
        <Route path="/profile/reviews" element={<UserReviewsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/books/:bookId/review" element={<ReviewEditorPage />} />
        <Route path="/reviews/:reviewId/edit" element={<ReviewEditorPage />} />
      </Route>

      {/* Protected routes for admin users */}
      <Route
        element={<ProtectedRoute isAllowed={isAuthenticated && isAdmin} redirectPath="/" />}
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/books" element={<AdminBooksPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />
        <Route path="/admin/performance" element={<PerformanceDashboard />} />
      </Route>

      {/* Public routes that don't require authentication */}
      <Route path="/" element={<HomePage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/books/:id" element={<BookDetailPage />} />
      <Route path="/books/search" element={<BooksPage />} />
      <Route path="/books/top-rated" element={<HomePage />} />
      <Route path="/books/new-releases" element={<HomePage />} />

      {/* Catch-all route for 404 */}
      <Route path="*" element={<div>404 Page Not Found</div>} />
    </Routes>
    </Suspense>
  );
};
