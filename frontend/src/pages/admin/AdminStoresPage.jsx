import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/endpoints';
import DataTable from '../../components/DataTable';
import StarRating from '../../components/StarRating';
import ConfirmationModal from '../../components/ConfirmationModal';

const filters = [
  { key: 'name', label: 'Name', placeholder: 'Filter by name...' },
  { key: 'email', label: 'Email', placeholder: 'Filter by email...' },
  { key: 'address', label: 'Address', placeholder: 'Filter by address...' },
];

const AdminStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filterValues, sortBy, order: sortOrder };
      const { data } = await adminAPI.getStores(params);
      setStores(data.stores);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterValues, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(fetchStores, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  const handleSort = (key) => {
    if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortOrder('asc'); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await adminAPI.deleteStore(deleteTarget.id);
      setAlert({ type: 'success', text: `Store "${deleteTarget.name}" was successfully deleted.` });
      setDeleteTarget(null);
      await fetchStores();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete store.';
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
      { key: 'address', label: 'Address' },
      {
        key: 'owner',
        label: 'Store Owner',
        render: (v) => v ? (
          <div>
            <div className="font-medium text-neutral-900">{v.name}</div>
            <div className="text-xs text-neutral-500">{v.email}</div>
          </div>
        ) : '—',
      },
      {
        key: 'averageRating',
        label: 'Avg. Rating',
        sortable: true,
        render: (v) => v ? <StarRating value={v} size="sm" /> : <span className="text-neutral-400 text-xs">No ratings</span>,
      },
      {
        key: 'totalRatings',
        label: 'Ratings',
        render: (v) => <span className="text-neutral-500 text-sm">{v ?? 0}</span>,
      },
      {
        key: 'id',
        label: 'Actions',
        render: (id, row) => (
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium transition-colors"
          >
            Delete
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Stores</h1>
          <p className="text-neutral-500 text-sm mt-1">{stores.length} total stores</p>
        </div>
        <Link to="/admin/stores/new" className="btn-primary">
          🏗️ Add Store
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
          data={stores}
          filters={filters}
          filterValues={filterValues}
          onFilterChange={setFilterValues}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          loading={loading}
          emptyMessage="No stores found."
        />
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Store?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        consequences="This action will permanently delete the store and all ratings associated with this store. This action cannot be undone."
        confirmLabel="Delete Store"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminStoresPage;
