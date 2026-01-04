import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@stores/backoffice/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const BackofficeProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
