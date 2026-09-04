import { useEffect, useState, useCallback } from 'react';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { storesAPI } from '../../api/endpoints';
import StarRating from '../../components/StarRating';

/**
 * StoreCard is a pure presentational component.
 * All state lives in StoresPage so that a refetch properly updates everything
 * including averageRating — no stale local copy.
 */
const StoreCard = ({ store, onRate, saving }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-150 flex flex-col h-full overflow-hidden">
      {/* Card Header */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-900 truncate">{store.name}</h2>
            <p className="text-slate-400 text-xs mt-0.5 truncate">{store.email}</p>
          </div>
          {store.averageRating != null ? (
            <div className="shrink-0 flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full">
              <span className="text-sm font-bold tabular-nums">{store.averageRating.toFixed(1)}</span>
              <span className="text-amber-400 text-xs">★</span>
            </div>
          ) : (
            <span className="shrink-0 text-xs text-slate-400 font-medium bg-slate-50 border border-slate-200 px-2 py-1 rounded-full">
              No ratings
            </span>
          )}
        </div>

        <p className="text-slate-500 text-sm flex items-start gap-1.5">
          <MapPin size={13} className="shrink-0 mt-0.5 text-slate-400" />
          <span className="leading-snug">{store.address}</span>
        </p>

        {/* Overall star display */}
        {store.averageRating != null && (
          <div className="mt-3">
            <StarRating value={store.averageRating} size="sm" showValue={false} />
          </div>
        )}
      </div>

      {/* Rating input */}
      <div className="px-5 pb-5 pt-4 border-t border-slate-100 bg-slate-50/50">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          {store.userRating ? `Your rating · ${store.userRating} star${store.userRating > 1 ? 's' : ''}` : 'Rate this store'}
        </p>
        <div className={saving === store.id ? 'opacity-40 pointer-events-none' : ''}>
          <StarRating value={store.userRating} onChange={(v) => onRate(store.id, v)} size="md" showValue={false} />
        </div>
      </div>
    </div>
  );
};

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  // Track which storeId is currently being saved to disable its stars
  const [savingStoreId, setSavingStoreId] = useState(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search: search || undefined, sortBy, order: sortOrder };
      const { data } = await storesAPI.getStores(params);
      setStores(data.stores);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(fetchStores, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  /**
   * Submit or update a rating, then refetch the full store list so that
   * averageRating reflects the new value from DB.
   */
  const handleRate = async (storeId, value) => {
    if (savingStoreId) return;
    setSavingStoreId(storeId);

    // Optimistically update local state
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, userRating: value } : s))
    );

    try {
      await storesAPI.submitRating(storeId, value);
      const params = { search: search || undefined, sortBy, order: sortOrder };
      const { data } = await storesAPI.getStores(params);
      setStores(data.stores);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingStoreId(null);
    }
  };

  const handleSortChange = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const sortOptions = [
    { field: 'name', label: 'Name' },
    { field: 'address', label: 'Address' },
    { field: 'averageRating', label: 'Rating' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Browse Stores</h1>
          <p className="text-slate-500 mt-1 text-sm">Discover and rate stores in your area</p>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            id="stores-search"
            type="text"
            placeholder="Search by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort chips */}
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {sortOptions.map(({ field, label }) => (
              <button
                key={field}
                onClick={() => handleSortChange(field)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                  sortBy === field
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {label}
                {sortBy === field ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">
          {stores.length} store{stores.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="spinner spinner-lg spinner-indigo" />
        </div>
      ) : stores.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3 opacity-30">🏪</div>
          <p className="text-slate-500 font-medium">
            {search ? `No stores found for "${search}"` : 'No stores available yet.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onRate={handleRate}
              saving={savingStoreId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StoresPage;
