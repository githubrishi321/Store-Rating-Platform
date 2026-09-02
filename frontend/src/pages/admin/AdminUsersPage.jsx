import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminAPI } from '../../api/endpoints';
import DataTable from '../../components/DataTable';
import ConfirmationModal from '../../components/ConfirmationModal';
import useAuthStore from '../../context/authStore';

const roleBadge = {
  ADMIN: <span className="badge badge-admin">Admin</span>,
  NORMAL_USER: <span className="badge badge-user">User</span>,
  STORE_OWNER: <span className="badge badge-owner">Owner</span>,
};

const filters = [
  { key: 'name', label: 'Name', placeholder: 'Filter by name...' },
  { key: 'email', label: 'Email', placeholder: 'Filter by email...' },
  { key: 'address', label: 'Address', placeholder: 'Filter by address...' },
  { key: 'role', label: 'Role', placeholder: 'Filter by role (ADMIN, NORMAL_USER, STORE_OWNER)...' },
];

const AdminUsersPage = () => {
  const location = useLocation();
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState(
    location.state?.message ? { type: 'success', text: location.state.message } : null
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filterValues, sortBy, order: sortOrder };
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterValues, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleSort = (key) => {
    if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortOrder('asc'); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await adminAPI.deleteUser(deleteTarget.id);
      setAlert({ type: 'success', text: `User "${deleteTarget.name}" was successfully deleted.` });
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete user.';
      setAlert({ type: 'error', text: errorMsg });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'address', label: 'Address', sortable: false },
      { key: 'role', label: 'Role', sortable: true, render: (v) => roleBadge[v] || v },
      {
        key: 'id',
        label: 'Actions',
        render: (id, row) => (
          <div className="flex items-center gap-3">
            <Link to={`/admin/users/${id}`} className="text-neutral-900 hover:underline text-sm font-medium">
              View →
            </Link>
            {currentUser?.id !== id && (
              <button
                type="button"
                onClick={() => setDeleteTarget(row)}
                className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        ),
      },
    ],
    [currentUser?.id]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Users</h1>
          <p className="text-neutral-500 text-sm mt-1">{users.length} total users</p>
        </div>
        <Link to="/admin/users/new" className="btn-primary">
          ➕ Add User
        </Link>
      </div>

      {alert && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm border flex items-center justify-between font-medium ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <span>{alert.text}</span>
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="text-neutral-400 hover:text-neutral-900 text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-1 sm:p-4">
        <DataTable
          columns={columns}
          data={users}
          filters={filters}
          filterValues={filterValues}
          onFilterChange={setFilterValues}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          loading={loading}
          emptyMessage="No users found matching your filters."
        />
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete User?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        consequences={
          deleteTarget?.role === 'STORE_OWNER'
            ? 'This action will permanently delete the user, their owned store, and all ratings associated with both the user and the store. This action cannot be undone.'
            : 'This action will permanently delete the user and all ratings submitted by this user. This action cannot be undone.'
        }
        confirmLabel="Delete User"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminUsersPage;
