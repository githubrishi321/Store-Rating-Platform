import { useEffect, useState } from 'react';
import { ownerAPI } from '../../api/endpoints';
import StarRating from '../../components/StarRating';
import DataTable from '../../components/DataTable';

const raterColumns = [
  { key: 'name', label: 'Customer Name', sortable: false },
  { key: 'email', label: 'Email', sortable: false },
  {
    key: 'rating',
    label: 'Rating',
    render: (v) => <StarRating value={v} size="sm" />,
  },
  {
    key: 'submittedAt',
    label: 'Date',
    render: (v) => new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  },
];

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ownerAPI.getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load your store data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="card text-center"><p className="text-red-500">{error}</p></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 border-b border-neutral-200 pb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Store Dashboard</h1>
        <p className="text-neutral-500 mt-1 text-sm">Monitor your store's ratings and feedback</p>
      </div>

      {/* Store Info */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-900">{data.store.name}</h2>
            <p className="text-neutral-500 text-sm mt-0.5">{data.store.email}</p>
            <p className="text-neutral-500 text-sm flex items-center gap-1 mt-1">
              <span className="opacity-60">📍</span>{data.store.address}
            </p>
          </div>

          <div className="flex gap-8 shrink-0 border-t sm:border-t-0 sm:border-l border-neutral-200 pt-4 sm:pt-0 sm:pl-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900">
                {data.averageRating?.toFixed(1) ?? '—'}
              </div>
              <div className="text-xs uppercase font-bold tracking-wider text-neutral-400 mt-1 mb-1">Average</div>
              {data.averageRating != null && (
                <StarRating value={data.averageRating} size="sm" showValue={false} />
              )}
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900">{data.totalRatings}</div>
              <div className="text-xs uppercase font-bold tracking-wider text-neutral-400 mt-1">Total Ratings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating distribution */}
      {data.totalRatings > 0 && (
        <div className="card mb-6">
          <h2 className="text-sm uppercase font-bold tracking-wider text-neutral-900 mb-6 border-b border-neutral-100 pb-2">Rating Distribution</h2>
          <div className="max-w-md">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = data.raters.filter((r) => r.rating === star).length;
              const pct = data.totalRatings ? (count / data.totalRatings) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-medium text-neutral-600 w-4">{star}</span>
                  <span className="text-neutral-300 text-sm">★</span>
                  <div className="flex-1 bg-neutral-100 rounded-full h-2 overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-neutral-800 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Raters Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-2 sm:p-4">
        <div className="px-2 pt-2 pb-4">
          <h2 className="text-sm uppercase font-bold tracking-wider text-neutral-900">
            Recent Feedback ({data.totalRatings})
          </h2>
        </div>
        <DataTable
          columns={raterColumns}
          data={data.raters}
          emptyMessage="No one has rated your store yet."
        />
      </div>
    </div>
  );
};

export default OwnerDashboard;
