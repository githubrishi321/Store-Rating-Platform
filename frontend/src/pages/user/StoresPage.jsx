import { useEffect, useState, useCallback } from 'react';
import { storesAPI } from '../../api/endpoints';
import StarRating from '../../components/StarRating';

/**
 * StoreCard is a pure presentational component.
 * All state lives in StoresPage so that a refetch properly updates everything
 * including averageRating — no stale local copy.
 */
const StoreCard = ({ store, onRate, saving }) => {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 hover:border-neutral-300 hover:shadow-md transition-all flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <h2 className="text-lg font-bold text-neutral-900 truncate">{store.name}</h2>
          <p className="text-neutral-500 text-sm mt-0.5 truncate">{store.email}</p>
        </div>
        {store.averageRating != null ? (
          <div className="text-right shrink-0 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-100">
            <div className="text-lg font-bold text-neutral-900">{store.averageRating.toFixed(1)}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">avg</div>
          </div>
        ) : (
          <div className="text-right shrink-0">
            <div className="text-xs text-neutral-400">No ratings</div>
          </div>
        )}
      </div>

      <p className="text-neutral-500 text-sm mb-4 flex items-start gap-1.5 flex-1">
        <span className="mt-0.5 opacity-60">📍</span>
        <span>{store.address}</span>
      </p>

      {/* Overall rating display */}
      {store.averageRating != null && (
        <div className="mb-4">
          <StarRating value={store.averageRating} size="sm" />
        </div>
      )}

      {/* User rating input */}
      <div className="pt-4 border-t border-neutral-100 mt-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          {store.userRating
            ? `Your rating: ${store.userRating} ★ — update`
            : 'Rate this store'}
        </p>
        <div className={saving === store.id ? 'opacity-50 pointer-events-none' : ''}>
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
   * averageRating reflects the new value from DB — consistent with Admin and
   * Owner views which always do a live aggregate on request.
   */
  const handleRate = async (storeId, value) => {
    if (savingStoreId) return;
    setSavingStoreId(storeId);

    // Optimistically update local state so the selected rating updates immediately
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, userRating: value } : s))
    );

    try {
      await storesAPI.submitRating(storeId, value);
      // Refetch to get fresh averageRating from DB (live AVG aggregate)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 border-b border-neutral-200 pb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Browse Stores</h1>
        <p className="text-neutral-500 mt-1 text-sm">Discover and rate stores in your area</p>
      </div>

      {/* Search + Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            id="stores-search"
            type="text"
            placeholder="Search by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
        </div>
        <div className="flex gap-2 shrink-0 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {['name', 'address', 'averageRating'].map((field) => (
            <button
              key={field}
              onClick={() => handleSortChange(field)}
              className={`px-4 py-2 text-xs rounded-lg border font-medium transition-colors whitespace-nowrap ${
                sortBy === field
                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {field === 'averageRating' ? 'Rating' : field.charAt(0).toUpperCase() + field.slice(1)}
              {sortBy === field ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-neutral-500 font-medium mb-6">
          {stores.length} store{stores.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stores.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3 opacity-50">🏪</div>
          <p className="text-neutral-500">No stores found{search ? ` for "${search}"` : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
