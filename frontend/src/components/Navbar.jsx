import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';

const roleLinks = {
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/stores', label: 'Stores' },
  ],
  NORMAL_USER: [
    { to: '/stores', label: 'Stores' },
  ],
  STORE_OWNER: [
    { to: '/store-owner/dashboard', label: 'My Store' },
  ],
};

const roleBadge = {
  ADMIN: { label: 'Admin', cls: 'badge badge-admin' },
  NORMAL_USER: { label: 'User', cls: 'badge badge-user' },
  STORE_OWNER: { label: 'Owner', cls: 'badge badge-owner' },
};

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const links = roleLinks[user.role] || [];
  const badge = roleBadge[user.role] || { label: user.role || 'User', cls: 'badge badge-user' };

  return (
    <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-neutral-900">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>StoreRate</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/account/password"
            className="px-3 py-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
          >
            Password
          </Link>
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-neutral-900 leading-tight truncate max-w-[140px]">{user.name || user.email}</p>
            <span className={badge.cls}>{badge.label}</span>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary text-sm py-1.5 px-3"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
