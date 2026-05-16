'use client';

import React from 'react';

export default function SummaryCards({ cards = [], columns = 4, className = '' }) {
  const colMap = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 xl:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-5',
  };

  return (
    <div className={`grid ${colMap[columns] || colMap[4]} gap-3 sm:gap-4 ${className}`}>
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md  transition-all duration-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 group justify-between"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center md:gap-3 gap-1">
            <div className={`
            flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl
            ${card.bg || 'bg-gray-50'}
            group-hover:scale-110 transition-transform duration-200
          `}>
              {card.icon}
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-tight truncate">
              {card.label}
            </p>
          </div>
          <p className={`mt-0.5 text-xl sm:text-2xl font-bold truncate ${card.color || 'text-gray-900'}`}>
            {card.value ?? '—'}
          </p>
          {card.sub && (
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">{card.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}