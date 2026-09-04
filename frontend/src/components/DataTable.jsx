import { ChevronUp, ChevronDown, ChevronsUpDown, PackageOpen } from 'lucide-react';

/**
 * Reusable DataTable with sortable columns and a filter bar.
 *
 * Props:
 *  columns: [{ key, label, sortable?, render?, hideOnMobile? }]
 *  data: Array of row objects
 *  filters: [{ key, label, placeholder? }]  — text filter inputs
 *  onFilterChange: (filters) => void
 *  filterValues: { [key]: string }
 *  sortBy: string
 *  sortOrder: 'asc'|'desc'
 *  onSort: (key) => void
 *  loading?: boolean
 *  emptyMessage?: string
 */
const DataTable = ({
  columns,
  data,
  filters = [],
  onFilterChange,
  filterValues = {},
  sortBy,
  sortOrder,
  onSort,
  loading = false,
  emptyMessage = 'No records found.',
}) => {
  const SortIcon = ({ column }) => {
    if (!column.sortable) return null;
    const isActive = sortBy === column.key;
    if (!isActive) return <ChevronsUpDown size={13} className="ml-1 text-slate-300 inline-block" />;
    return sortOrder === 'asc'
      ? <ChevronUp size={13} className="ml-1 text-indigo-600 inline-block" />
      : <ChevronDown size={13} className="ml-1 text-indigo-600 inline-block" />;
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-3 px-4 pt-4 pb-2">
          {filters.map((f) => (
            <div key={f.key} className="flex-1 min-w-[160px] max-w-xs">
              <input
                type="text"
                placeholder={f.placeholder || `Filter by ${f.label}...`}
                value={filterValues[f.key] || ''}
                onChange={(e) => onFilterChange({ ...filterValues, [f.key]: e.target.value })}
                className="text-sm py-2 px-3"
              />
            </div>
          ))}
        </div>
      )}

      {/* Table wrapper with horizontal scroll */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left min-w-[480px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap select-none
                    ${col.sortable ? 'cursor-pointer hover:text-slate-900 transition-colors' : ''}
                    ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                >
                  {col.label}
                  <SortIcon column={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center">
                  <div className="flex items-center justify-center gap-2.5 text-slate-500">
                    <div className="spinner spinner-md spinner-indigo" />
                    <span className="text-sm">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <PackageOpen size={32} strokeWidth={1.5} />
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors duration-100"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3.5 text-slate-800 ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                    >
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile scroll hint — only shown when content overflows */}
      {data.length > 0 && !loading && (
        <p className="text-xs text-slate-400 text-center pb-1 sm:hidden select-none">
          ← Scroll to see all columns →
        </p>
      )}
    </div>
  );
};

export default DataTable;
