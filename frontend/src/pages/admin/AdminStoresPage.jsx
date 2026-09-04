import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { adminAPI } from '../../api/endpoints';
import DataTable from '../../components/DataTable';
import StarRating from '../../components/StarRating';
import ConfirmationModal from '../../components/ConfirmationModal';

const filters = [
  { key: 'name',    label: 'Name',    placeholder: 'Filter by name...'    },
  { key: 'email',   label: 'Email',   placeholder: 'Filter by email...'   },
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
      { key: 'name',  label: 'Store Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true, hideOnMobile: true },
      { key: 'address', label: 'Address', hideOnMobile: true },
      {
        key: 'owner',
        label: 'Owner',
        hideOnMobile: true,
        render: (v) => v ? (
          <div>
            <div className="font-medium text-slate-800 text-sm">{v.name}</div>
            <div className="text-xs text-slate-400">{v.email}</div>
          </div>
        ) : '—',
      },
      {
        key: 'averageRating',
        label: 'Avg. Rating',
        sortable: true,
        render: (v) => v
          ? <StarRating value={v} size="sm" />
          : <span className="text-slate-400 text-xs font-medium">No ratings</span>,
      },
      {
        key: 'totalRatings',
        label: 'Ratings',
        render: (v) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium tabular-nums">
            {v ?? 0}
          </span>
        ),
      },
      {
        key: 'id',
        label: 'Actions',
        render: (id, row) => (
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="btn-ghost-danger"
            aria-label={`Delete store ${row.name}`}
          >
            <Trash2 size={13} />
            Delete
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Stores</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading...' : `${stores.length} total store${stores.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link to="/admin/stores/new" className="btn-primary shrink-0">
          <PlusCircle size={15} />
          Add Store
        </Link>
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
          data={stores}
          filters={filters}
          filterValues={filterValues}
          onFilterChange={setFilterValues}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          loading={loading}
          emptyMessage="No stores found matching your filters."
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
