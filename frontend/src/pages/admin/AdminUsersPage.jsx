import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserPlus, Trash2, X } from 'lucide-react';
import { adminAPI } from '../../api/endpoints';
import DataTable from '../../components/DataTable';
import ConfirmationModal from '../../components/ConfirmationModal';
import useAuthStore from '../../context/authStore';

const roleBadge = {
  ADMIN: <span className="badge badge-admin">Admin</span>,
  NORMAL_USER: <span className="badge badge-user">User</span>,
  STORE_OWNER: <span className="badge badge-owner">Owner</span>,
};

// Text-searchable filters (sent to DataTable's generic filter bar)
const filters = [
  { key: 'name',    label: 'Name',    placeholder: 'Filter by name...'    },
  { key: 'email',   label: 'Email',   placeholder: 'Filter by email...'   },
  { key: 'address', label: 'Address', placeholder: 'Filter by address...' },
];

// Role options — values must exactly match the Prisma enum
const ROLE_OPTIONS = [
  { value: '',            label: 'All Roles'   },
  { value: 'ADMIN',       label: 'Admin'       },
  { value: 'NORMAL_USER', label: 'User'        },
  { value: 'STORE_OWNER', label: 'Store Owner' },
];

const AdminUsersPage = () => {
  const location = useLocation();
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const [roleFilter, setRoleFilter] = useState('');
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
      const params = {
        ...filterValues,
        ...(roleFilter ? { role: roleFilter } : {}),
        sortBy,
        order: sortOrder,
      };
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterValues, roleFilter, sortBy, sortOrder]);

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
      { key: 'name',  label: 'Name',    sortable: true },
      { key: 'email', label: 'Email',   sortable: true, hideOnMobile: true },
      { key: 'address', label: 'Address', hideOnMobile: true },
      { key: 'role',  label: 'Role',    sortable: true, render: (v) => roleBadge[v] || v },
      {
        key: 'id',
        label: 'Actions',
        render: (id, row) => (
          <div className="flex items-center gap-1">
            <Link
              to={`/admin/users/${id}`}
              className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              View →
            </Link>
            {currentUser?.id !== id && (
              <button
                type="button"
                onClick={() => setDeleteTarget(row)}
                className="btn-ghost-danger"
                aria-label={`Delete user ${row.name}`}
              >
                <Trash2 size={13} />
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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading...' : `${users.length} total user${users.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Role filter dropdown — must match exact enum values */}
          <select
            id="users-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm py-2 px-3 w-auto min-w-[140px]"
            aria-label="Filter by role"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Link to="/admin/users/new" className="btn-primary">
            <UserPlus size={15} />
            Add User
          </Link>
        </div>
      </div>

      {alert && (
        <div className={`mb-6 ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          <span>{alert.text}</span>
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none rounded"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="section-panel">
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
