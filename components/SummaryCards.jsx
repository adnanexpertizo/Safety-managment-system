'use client';

import React from 'react';

export default function SummaryCards({
  cards = [],
  columns = 4,
  className = '',
}) {
  // Define grid columns based on number
  const getGridCols = (cols) => {
    switch (cols) {
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2 md:grid-cols-3';
      case 4:
      default:
        return 'grid-cols-2 md:grid-cols-4';
    }
  };

  return (
    <div className={`grid ${getGridCols(columns)} gap-6 ${className}`}>
      {cards.map((card, index) => (
        <div
          key={index}
          className="card bg-white flex-col mb-5 p-3 rounded-3xl flex items-center gap-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl flex-shrink-0">{card.icon}</div>
          
          {/* <div className="flex-1 min-w-0"> */}
            <p className="text-gray-500 text-sm font-medium">{card.label}</p>
            <p
              className={`text-4xl font-bold mt-1 truncate ${
                card.color || 'text-gray-900'
              }`}
            >
              {card.value}
            </p>        
          {/* </div> */}
        </div>
      ))}
    </div>
  );
}