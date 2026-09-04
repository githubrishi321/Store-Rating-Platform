import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Star, Menu, X, LogOut } from 'lucide-react';
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

// Derive initials for the avatar pill
const getInitials = (name, email) => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (email || '?')[0].toUpperCase();
};

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const links = roleLinks[user.role] || [];
  const badge = roleBadge[user.role] || { label: user.role || 'User', cls: 'badge badge-user' };
  const initials = getInitials(user.name, user.email);

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  const navLinkCls = (to) =>
    `px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
      isActive(to)
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const mobileNavLinkCls = (to) =>
    `flex items-center px-4 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 focus-visible:outline-none ${
      isActive(to)
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-slate-900 text-[0.9375rem] shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded-md"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white">
              <Star size={14} fill="currentColor" strokeWidth={0} />
            </span>
            StoreRate
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className={navLinkCls(link.to)}>
                {link.label}
              </Link>
            ))}
            <Link to="/account/password" className={navLinkCls('/account/password')}>
              Password
            </Link>
          </div>

          {/* Desktop right: avatar + logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 select-none">
                {initials}
              </div>
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-slate-800 truncate max-w-[130px]">
                  {user.name || user.email}
                </p>
                <span className={badge.cls}>{badge.label}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              aria-label="Log out"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-lg">
          {/* User info row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0 select-none">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name || user.email}</p>
              <span className={badge.cls}>{badge.label}</span>
            </div>
          </div>

          {/* Nav links */}
          <div className="py-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={mobileNavLinkCls(link.to)}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/account/password"
              className={mobileNavLinkCls('/account/password')}
              onClick={() => setMenuOpen(false)}
            >
              Change Password
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 focus-visible:outline-none"
            >
              <LogOut size={15} />
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
