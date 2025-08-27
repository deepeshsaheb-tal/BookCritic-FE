import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context.tsx';

/**
 * Custom hook that combines logout functionality with navigation
 * @returns A function that logs out the user and navigates to the login page
 */
export const useAuthLogout = (): (() => void) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return () => {
    logout();
    navigate('/login');
  };
};
