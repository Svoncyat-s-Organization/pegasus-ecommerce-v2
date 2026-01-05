import { Navigate } from 'react-router-dom';
import { useStorefrontAuthStore } from '@stores/storefront/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const StorefrontProtectedRoute = ({
  children,
}: ProtectedRouteProps) => {
  const isAuthenticated = useStorefrontAuthStore(
    (state) => state.isAuthenticated()
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
