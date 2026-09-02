import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './context/authStore';

// Shared pages
import LoginPage from './pages/shared/LoginPage';
import RegisterPage from './pages/shared/RegisterPage';
import ChangePasswordPage from './pages/shared/ChangePasswordPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminAddUserPage from './pages/admin/AdminAddUserPage';
import AdminStoresPage from './pages/admin/AdminStoresPage';
import AdminAddStorePage from './pages/admin/AdminAddStorePage';

// Normal user pages
import StoresPage from './pages/user/StoresPage';

// Store owner pages
import OwnerDashboard from './pages/owner/OwnerDashboard';

const RootRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'NORMAL_USER') return <Navigate to="/stores" replace />;
  if (user.role === 'STORE_OWNER') return <Navigate to="/store-owner/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>
          } />
          <Route path="/admin/users/new" element={
            <ProtectedRoute roles={['ADMIN']}><AdminAddUserPage /></ProtectedRoute>
          } />
          <Route path="/admin/users/:id" element={
            <ProtectedRoute roles={['ADMIN']}><AdminUserDetailPage /></ProtectedRoute>
          } />
          <Route path="/admin/stores" element={
            <ProtectedRoute roles={['ADMIN']}><AdminStoresPage /></ProtectedRoute>
          } />
          <Route path="/admin/stores/new" element={
            <ProtectedRoute roles={['ADMIN']}><AdminAddStorePage /></ProtectedRoute>
          } />

          {/* Normal user routes */}
          <Route path="/stores" element={
            <ProtectedRoute roles={['NORMAL_USER']}><StoresPage /></ProtectedRoute>
          } />

          {/* Store owner routes */}
          <Route path="/store-owner/dashboard" element={
            <ProtectedRoute roles={['STORE_OWNER']}><OwnerDashboard /></ProtectedRoute>
          } />

          {/* Shared authenticated routes */}
          <Route path="/account/password" element={
            <ProtectedRoute><ChangePasswordPage /></ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="text-6xl mb-4">🔍</div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Page not found</h1>
              <p className="text-neutral-500 mb-6">The page you're looking for doesn't exist.</p>
              <RootRedirect />
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
