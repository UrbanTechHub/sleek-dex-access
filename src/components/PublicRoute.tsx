import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user } = useAuth();
  
  if (user) {
    console.log('User found, redirecting to wallet dashboard');
    return <Navigate to="/wallet-dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;