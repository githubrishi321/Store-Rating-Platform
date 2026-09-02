import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-neutral-100">
    <span className="text-neutral-500 text-sm w-32 shrink-0">{label}</span>
    <span className="text-neutral-900 text-sm">{value}</span>
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
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="card text-center">
        <p className="text-red-500">{error}</p>
        <Link to="/admin/users" className="btn-secondary mt-4">← Back to Users</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/users" className="text-neutral-500 hover:text-neutral-900 text-sm font-medium">← Users</Link>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-500 text-sm truncate max-w-[200px]">{user.name}</span>
        </div>
        {currentUser?.id !== user.id && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-red-200"
          >
            Delete User
          </button>
        )}
      </div>

      {actionError && (
        <div className="mb-6 p-4 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700 font-medium flex items-center justify-between">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError('')}
            className="text-neutral-400 hover:text-neutral-900 text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{user.name}</h1>
            <p className="text-neutral-500 text-sm mt-1">{user.email}</p>
          </div>
          {roleBadge[user.role]}
        </div>

        <div>
          <InfoRow label="User ID" value={<span className="font-mono text-xs text-neutral-500 bg-neutral-100 px-1 py-0.5 rounded">{user.id}</span>} />
          <InfoRow label="Address" value={user.address} />
          <InfoRow label="Member Since" value={new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
        </div>

        {/* Store Owner section */}
        {user.role === 'STORE_OWNER' && user.ownedStore && (
          <div className="mt-6 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <h2 className="text-base font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              🏪 Owned Store
            </h2>
            <InfoRow label="Store Name" value={user.ownedStore.name} />
            <InfoRow label="Store Email" value={user.ownedStore.email} />
            <InfoRow label="Store Address" value={user.ownedStore.address} />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3">
              <span className="text-neutral-500 text-sm w-32">Avg. Rating</span>
              {user.ownedStore.averageRating ? (
                <StarRating value={user.ownedStore.averageRating} size="sm" />
              ) : (
                <span className="text-neutral-400 text-sm">No ratings yet</span>
              )}
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
