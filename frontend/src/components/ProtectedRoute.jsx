import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../context/authStore';

/**
 * ProtectedRoute — checks auth status and allowed roles.
 * Redirects to /login if not authenticated, or / if wrong role.
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to their correct home
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'NORMAL_USER') return <Navigate to="/stores" replace />;
    if (user.role === 'STORE_OWNER') return <Navigate to="/store-owner/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
