import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/endpoints';

const StatCard = ({ icon, label, value }) => (
  <div className="stat-card">
    <div className="flex items-center gap-3 mb-2">
      <div className="text-2xl">{icon}</div>
      <p className="text-neutral-500 text-sm font-medium">{label}</p>
    </div>
    <p className="text-3xl font-bold text-neutral-900">{value ?? '—'}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 border-b border-neutral-200 pb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p className="text-neutral-500 mt-1">Platform overview and quick actions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <StatCard icon="👥" label="Total Users" value={loading ? '...' : stats?.totalUsers} />
        <StatCard icon="🏪" label="Total Stores" value={loading ? '...' : stats?.totalStores} />
        <StatCard icon="⭐" label="Total Ratings" value={loading ? '...' : stats?.totalRatings} />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: '/admin/users', label: 'View Users', icon: '👥' },
            { to: '/admin/users/new', label: 'Add User', icon: '➕' },
            { to: '/admin/stores', label: 'View Stores', icon: '🏪' },
            { to: '/admin/stores/new', label: 'Add Store', icon: '🏗️' },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="card text-center hover:border-neutral-300 hover:bg-neutral-50 transition-all cursor-pointer group shadow-sm flex flex-col items-center justify-center p-6"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{action.icon}</div>
              <p className="text-sm font-medium text-neutral-700">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
