import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Store, X } from 'lucide-react';
import { adminAPI } from '../../api/endpoints';
import StarRating from '../../components/StarRating';
import ConfirmationModal from '../../components/ConfirmationModal';
import useAuthStore from '../../context/authStore';

const roleBadge = {
  ADMIN: <span className="badge badge-admin">Admin</span>,
  NORMAL_USER: <span className="badge badge-user">Normal User</span>,
  STORE_OWNER: <span className="badge badge-owner">Store Owner</span>,
};

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-slate-100 last:border-b-0">
    <span className="text-slate-500 text-sm w-36 shrink-0 font-medium">{label}</span>
    <span className="text-slate-800 text-sm">{value}</span>
  </div>
);

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    adminAPI.getUserById(id)
      .then((res) => setUser(res.data.user))
      .catch(() => setError('User not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeleteConfirm = async () => {
    if (deleting) return;
    setDeleting(true);
    setActionError('');
    try {
      await adminAPI.deleteUser(user.id);
      navigate('/admin/users', {
        state: { message: `User "${user.name}" was successfully deleted.` },
        replace: true,
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete user.';
      setActionError(errorMsg);
      setShowDeleteModal(false);
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="spinner spinner-lg spinner-indigo" />
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="card text-center py-12">
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <Link to="/admin/users" className="btn-secondary">
          <ChevronLeft size={15} />
          Back to Users
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb + Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5 text-sm min-w-0">
          <Link
            to="/admin/users"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
          >
            <ChevronLeft size={15} />
            Users
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 truncate max-w-[180px]">{user.name}</span>
        </div>
        {currentUser?.id !== user.id && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="btn-ghost-danger border border-red-200 hover:border-red-300"
          >
            <Trash2 size={13} />
            Delete User
          </button>
        )}
      </div>

      {/* Action error */}
      {actionError && (
        <div className="mb-6 alert-error">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError('')}
            className="flex-shrink-0 opacity-60 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none rounded"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* User Card */}
      <div className="card">
        {/* User header */}
        <div className="flex items-start justify-between mb-5 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-base font-bold select-none shrink-0">
              {user.name?.slice(0, 2).toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
              <p className="text-slate-500 text-sm mt-0.5">{user.email}</p>
            </div>
          </div>
          {roleBadge[user.role]}
        </div>

        {/* Info rows */}
        <div>
          <InfoRow label="User ID" value={
            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{user.id}</span>
          } />
          <InfoRow label="Address" value={user.address} />
          <InfoRow label="Member Since" value={
            new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          } />
        </div>

        {/* Store Owner section */}
        {user.role === 'STORE_OWNER' && user.ownedStore && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Store size={13} />
              Owned Store
            </h2>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1">
              <InfoRow label="Store Name" value={user.ownedStore.name} />
              <InfoRow label="Store Email" value={user.ownedStore.email} />
              <InfoRow label="Store Address" value={user.ownedStore.address} />
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3">
                <span className="text-slate-500 text-sm w-36 font-medium shrink-0">Avg. Rating</span>
                {user.ownedStore.averageRating ? (
                  <StarRating value={user.ownedStore.averageRating} size="sm" />
                ) : (
                  <span className="text-slate-400 text-sm">No ratings yet</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete User?"
        message={`Are you sure you want to delete "${user.name}"?`}
        consequences={
          user.role === 'STORE_OWNER'
            ? 'This action will permanently delete the user, their owned store, and all ratings associated with both the user and the store. This action cannot be undone.'
            : 'This action will permanently delete the user and all ratings submitted by this user. This action cannot be undone.'
        }
        confirmLabel="Delete User"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AdminUserDetailPage;
