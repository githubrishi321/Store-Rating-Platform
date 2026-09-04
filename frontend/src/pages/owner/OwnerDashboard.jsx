import { useEffect, useState } from 'react';
import { MapPin, Star } from 'lucide-react';
import { ownerAPI } from '../../api/endpoints';
import StarRating from '../../components/StarRating';
import DataTable from '../../components/DataTable';

const raterColumns = [
  { key: 'name',  label: 'Customer',  sortable: false },
  { key: 'email', label: 'Email',     sortable: false, hideOnMobile: true },
  {
    key: 'rating',
    label: 'Rating',
    render: (v) => <StarRating value={v} size="sm" />,
  },
  {
    key: 'submittedAt',
    label: 'Date',
    hideOnMobile: true,
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
    <div className="flex justify-center py-24">
      <div className="spinner spinner-lg spinner-indigo" />
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="card text-center py-12">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Store Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Monitor your store's ratings and customer feedback</p>
        </div>
      </div>

      {/* Store Info Card */}
      <div className="card mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Store details */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900">{data.store.name}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{data.store.email}</p>
            <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-2">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              {data.store.address}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 shrink-0 sm:border-l sm:border-slate-100 sm:pl-6 border-t border-slate-100 pt-4 sm:pt-0">
            {/* Average */}
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 tabular-nums">
                {data.averageRating?.toFixed(1) ?? '—'}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5 mb-1.5">Average</div>
              {data.averageRating != null && (
                <StarRating value={data.averageRating} size="sm" showValue={false} />
              )}
            </div>
            {/* Total */}
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 tabular-nums">{data.totalRatings}</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">Ratings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating distribution */}
      {data.totalRatings > 0 && (
        <div className="card mb-5">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            <Star size={14} className="text-amber-400" fill="currentColor" strokeWidth={0} />
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Rating Distribution</h2>
          </div>
          <div className="max-w-md space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = data.raters.filter((r) => r.rating === star).length;
              const pct = data.totalRatings ? (count / data.totalRatings) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-500 w-3 text-right tabular-nums">{star}</span>
                  <Star size={11} className="text-amber-400 shrink-0" fill="currentColor" strokeWidth={0} />
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 w-5 text-right tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Raters Table */}
      <div className="section-panel">
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">
            Recent Feedback
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium tabular-nums">
              {data.totalRatings}
            </span>
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
