'use client';

import { useState } from 'react';

export default function Table({
  columns,
  data,
  actions = [],
  onActionClick = () => {},
  itemsPerPage = 10,
  maxHeight = '500px',
  className = '',
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedData = data.slice(startIdx, endIdx);

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 sm:rounded-xl rounded-lg shadow-sm overflow-hidden">
      
      {/* Scrollable Container */}
      <div 
        className="overflow-auto" 
        style={{ maxHeight: maxHeight }}
      >
        <table className={`w-full min-w-full ${className}`}>
          <thead className="sticky top-0 z-20 bg-gray-900 text-white">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm font-semibold whitespace-nowrap border-b border-gray-700"
                >
                  {col.label}
                </th>
              ))}

              {actions.length > 0 && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm font-semibold w-20 sm:w-24 md:w-28 border-b border-gray-700 sticky right-0 bg-gray-900 z-30">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-[10px] sm:text-sm">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-4 sm:px-6 py-12 sm:py-20 text-center text-gray-500 text-xs sm:text-sm"
                >
                  No records found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  {columns.map((col, colIdx) => {
                    const cellValue = row[col.key];

                    if (col.render) {
                      return (
                        <td key={colIdx} className={`px-2 sm:px-4 py-2 sm:py-3 ${col.className || ''}`}>
                          {col.render(row)}
                        </td>
                      );
                    }

                    if (col.key === 'avatar' || col.key.toLowerCase().includes('avatar')) {
                      return (
                        <td key={colIdx} className="px-2 sm:px-4 py-2 sm:py-3">
                          <img
                            src={cellValue || '/default-avatar.png'}
                            alt="avatar"
                            className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full object-cover border border-gray-200"
                          />
                        </td>
                      );
                    }

                    return (
                      <td
                        key={colIdx}
                        className={`px-2 sm:px-4 py-2 sm:py-3 text-gray-700 whitespace-nowrap text-[11px] sm:text-sm ${col.className || ''}`}
                      >
                        {cellValue ?? '-'}
                      </td>
                    );
                  })}

                  {/* Actions Column */}
                  {actions.length > 0 && (
                    <td className="px-2 sm:px-4 py-2 sm:py-3 sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l">
                      <div className="flex items-center sm:gap-2 opacity-75 group-hover:opacity-100 transition-all">
                        {actions.map((action, i) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                onActionClick(action.id, row);
                              }}
                              className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-all active:scale-95"
                              title={action.label}
                            >
                              {Icon ? <Icon size={14} className="text-gray-600" /> : action.label}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t bg-gray-50">
          <div className="text-[11px] sm:text-xs md:text-sm text-gray-500 text-center sm:text-left">
            Showing <span className="font-medium">{startIdx + 1}</span> to{' '}
            <span className="font-medium">{Math.min(endIdx, data.length)}</span> of{' '}
            <span className="font-medium">{data.length}</span> entries
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm border border-gray-300 rounded-lg sm:rounded-xl hover:bg-white disabled:opacity-40 transition disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium bg-white border border-gray-300 rounded-lg sm:rounded-xl">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm border border-gray-300 rounded-lg sm:rounded-xl hover:bg-white disabled:opacity-40 transition disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}