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
    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
      
      {/* ✅ Table Container (MIN HEIGHT FIX APPLIED) */}
      <div
        className="overflow-auto"
        style={{
          maxHeight: maxHeight,
          minHeight: 'min(600px, 60vh)', // ✅ key fix (responsive safe)
        }}
      >
        <table className="w-full min-w-[1200px]">
          
          {/* HEADER */}
          <thead className="sticky top-0 z-10 bg-primary text-white">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-4 text-left text-sm font-semibold w-28">
                  Action
                </th>
              )}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-24 text-center text-gray-500"
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

                    // Avatar
                    if (
                      col.key === 'avatar' ||
                      col.key.toLowerCase().includes('avatar')
                    ) {
                      return (
                        <td key={colIdx} className="px-6 py-4">
                          <img
                            src={cellValue || '/default-avatar.png'}
                            alt="avatar"
                            className="w-9 h-9 rounded-full object-cover border border-gray-200"
                          />
                        </td>
                      );
                    }

                    // Badge
                    if (col.type === 'badge') {
                      return (
                        <td key={colIdx} className="px-6 py-4">
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                            {cellValue}
                          </span>
                        </td>
                      );
                    }

                    // Date
                    if (col.type === 'date') {
                      return (
                        <td className="px-6 py-4 text-sm text-gray-700" key={colIdx}>
                          {formatDate(cellValue)}
                        </td>
                      );
                    }

                    // Default
                    return (
                      <td
                        key={colIdx}
                        className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                      >
                        {cellValue || '-'}
                      </td>
                    );
                  })}

                  {/* ACTIONS */}
                  {actions.length > 0 && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 opacity-70 group-hover:opacity-100 transition">
                        {actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => onActionClick(action.id, row)}
                            className="text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition"
                            title={action.label}
                          >
                            {action.id === 'edit' && '✏️'}
                            {action.id === 'delete' && '🗑️'}
                          </button>
                        ))}
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 py-4 border-t bg-gray-50">
          
          <div className="text-sm text-gray-500 text-center md:text-left">
            Showing {startIdx + 1} to {Math.min(endIdx, data.length)} of {data.length} entries
          </div>

          <div className="flex justify-center md:justify-end gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-white disabled:opacity-50 transition"
            >
              Previous
            </button>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-white disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}