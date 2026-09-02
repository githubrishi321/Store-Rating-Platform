import { useState } from 'react';

/**
 * Reusable DataTable with sortable columns and a filter bar.
 *
 * Props:
 *  columns: [{ key, label, sortable?, render? }]
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
    return (
      <span className={`ml-1 text-xs transition-colors ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`}>
        {isActive ? (sortOrder === 'asc' ? '↑' : '↓') : '⇅'}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
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

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-y border-neutral-200 bg-neutral-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  className={`px-4 py-3 font-medium text-neutral-500 whitespace-nowrap
                    ${col.sortable ? 'cursor-pointer hover:text-neutral-900 select-none' : ''}`}
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
                <td colSpan={columns.length} className="px-4 py-12 text-center text-neutral-500 border-b border-neutral-100">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-neutral-500 border-b border-neutral-100">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-neutral-900">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
