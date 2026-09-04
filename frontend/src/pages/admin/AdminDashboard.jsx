import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, Star, UserPlus, PlusCircle } from 'lucide-react';
import { adminAPI } from '../../api/endpoints';

const statConfig = [
  { key: 'totalUsers',   label: 'Total Users',   Icon: Users,  iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  { key: 'totalStores',  label: 'Total Stores',  Icon: Store,  iconBg: 'bg-amber-50',  iconColor: 'text-amber-600'  },
  { key: 'totalRatings', label: 'Total Ratings', Icon: Star,   iconBg: 'bg-emerald-50',iconColor: 'text-emerald-600'},
];

const actionCards = [
  { to: '/admin/users',      label: 'View Users',   description: 'Manage all users', Icon: Users,      iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  { to: '/admin/users/new',  label: 'Add User',     description: 'Create a new user', Icon: UserPlus,   iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  { to: '/admin/stores',     label: 'View Stores',  description: 'Manage all stores', Icon: Store,      iconBg: 'bg-amber-50',  iconColor: 'text-amber-600'  },
  { to: '/admin/stores/new', label: 'Add Store',    description: 'Create a new store',Icon: PlusCircle, iconBg: 'bg-amber-50',  iconColor: 'text-amber-600'  },
];

const StatCard = ({ label, value, Icon, iconBg, iconColor }) => (
  <div className="stat-card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
      <Icon size={22} className={iconColor} strokeWidth={1.75} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">{value ?? '—'}</p>
    </div>
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
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Platform overview and quick actions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statConfig.map(({ key, label, Icon, iconBg, iconColor }) => (
          <StatCard
            key={key}
            label={label}
            value={loading ? <span className="text-slate-300">···</span> : stats?.[key]}
            Icon={Icon}
            iconBg={iconBg}
            iconColor={iconColor}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {actionCards.map(({ to, label, description, Icon, iconBg, iconColor }) => (
            <Link
              key={to}
              to={to}
              className="card text-left hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                <Icon size={18} className={iconColor} strokeWidth={1.75} />
              </div>
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
