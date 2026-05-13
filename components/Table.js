'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Table({
  columns = [],
  data = [],
  actions = [],
  onActionClick = () => {},
  itemsPerPage = 10,
  maxHeight = '520px',
  className = '',
  emptyMessage = 'No records found',
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Scrollable body */}
      <div className="overflow-auto" style={{ maxHeight }}>
        <table className={`w-full min-w-full border-collapse ${className}`}>
          <thead className="sticky top-0 z-20">
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap border-b border-slate-600"
                >
                  {col.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-3 sm:px-4 py-3 text-center text-[10px] sm:text-xs font-semibold text-slate-200 uppercase tracking-wider sticky right-0 bg-slate-700 border-b border-slate-600 z-30">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">📭</div>
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {columns.map((col, colIdx) => {
                    if (col.render) {
                      return (
                        <td key={colIdx} className={`px-3 sm:px-4 py-3 sm:py-3.5 ${col.className || ''}`}>
                          {col.render(row)}
                        </td>
                      );
                    }

                    if (col.key === 'avatar' || col.key?.toLowerCase().includes('avatar')) {
                      return (
                        <td key={colIdx} className="px-3 sm:px-4 py-3">
                          <img
                            src={row[col.key] || '/default-avatar.png'}
                            alt="avatar"
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-gray-100"
                          />
                        </td>
                      );
                    }

                    const val = row[col.key];
                    const display = col.type === 'date' && val
                      ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : val;

                    return (
                      <td
                        key={colIdx}
                        className={`px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-gray-700 whitespace-nowrap ${col.className || ''}`}
                      >
                        {display ?? <span className="text-gray-300">—</span>}
                      </td>
                    );
                  })}

                  {actions.length > 0 && (
                    <td className="px-2 sm:px-3 py-3 sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-gray-100">
                      <div className="flex items-center justify-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        {actions.map((action, i) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={i}
                              onClick={(e) => { e.stopPropagation(); onActionClick(action.id, row); }}
                              className={`p-1.5 sm:p-2 rounded-lg transition-all active:scale-95 ${
                                action.id === 'delete'
                                  ? 'hover:bg-red-50 hover:text-red-600 text-gray-400'
                                  : action.id === 'edit'
                                  ? 'hover:bg-blue-50 hover:text-blue-600 text-gray-400'
                                  : 'hover:bg-gray-100 text-gray-500'
                              }`}
                              title={action.label}
                            >
                              {Icon ? <Icon size={15} /> : <span className="text-xs">{action.label}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-[11px] sm:text-xs text-gray-500 text-center sm:text-left">
            Showing <span className="font-semibold text-gray-700">{startIdx + 1}–{Math.min(startIdx + itemsPerPage, data.length)}</span> of <span className="font-semibold text-gray-700">{data.length}</span>
          </p>

          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (safePage <= 3) page = i + 1;
              else if (safePage >= totalPages - 2) page = totalPages - 4 + i;
              else page = safePage - 2 + i;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition ${
                    safePage === page
                      ? 'bg-slate-800 text-white border border-slate-800'
                      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}