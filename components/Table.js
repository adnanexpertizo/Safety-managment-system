'use client';

import { useState } from 'react';

export default function Table({
  columns,
  data,
  actions = [],
  onActionClick = () => {},
  itemsPerPage = 10,
  maxHeight = '650px',
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
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Table Container - Fixed Horizontal Scroll */}
      <div className="overflow-x-auto" style={{ maxHeight: maxHeight }}>
        <table className="w-full min-w-[1100px] md:min-w-[1300px] table-auto">
          {/* HEADER */}
          <thead className="sticky top-0 z-20 bg-gray-900 text-white">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-4 text-left text-xs md:text-sm font-semibold whitespace-nowrap border-b border-gray-700"
                >
                  {col.label}
                </th>
              ))}
              
              {actions.length > 0 && (
                <th className="px-4 py-4 text-left text-xs md:text-sm font-semibold w-24 md:w-28 border-b border-gray-700 sticky right-0 bg-gray-900 z-30">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-100 text-sm">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-20 text-center text-gray-500"
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
                        <td key={colIdx} className={`px-4 py-4 ${col.className || ''}`}>
                          {col.render(row)}
                        </td>
                      );
                    }

                    if (col.key === 'avatar' || col.key.toLowerCase().includes('avatar')) {
                      return (
                        <td key={colIdx} className="px-4 py-4">
                          <img
                            src={cellValue || '/default-avatar.png'}
                            alt="avatar"
                            className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-gray-200"
                          />
                        </td>
                      );
                    }

                    return (
                      <td
                        key={colIdx}
                        className={`px-4 py-4 text-gray-700 whitespace-nowrap ${col.className || ''}`}
                      >
                        {cellValue ?? '-'}
                      </td>
                    );
                  })}

                  {/* ACTIONS COLUMN */}
                  {actions.length > 0 && (
                    <td className="px-4 py-4 sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l">
                      <div className="flex items-center gap-1 md:gap-2 opacity-75 group-hover:opacity-100 transition-all">
                        {actions.map((action, i) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                onActionClick(action.id, row);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-all active:scale-95"
                              title={action.label}
                            >
                              {Icon ? <Icon size={18} className="text-gray-600" /> : action.label}
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 md:px-6 py-4 border-t bg-gray-50">
          <div className="text-xs md:text-sm text-gray-500 text-center sm:text-left">
            Showing <span className="font-medium">{startIdx + 1}</span> to{' '}
            <span className="font-medium">{Math.min(endIdx, data.length)}</span> of{' '}
            <span className="font-medium">{data.length}</span> entries
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-white disabled:opacity-40 transition disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-xl">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-white disabled:opacity-40 transition disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}