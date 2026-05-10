'use client';

import React from 'react';

export default function SummaryCards({
  cards = [],
  columns = 4,
  className = '',
}) {

  const getGridCols = (cols) => {
    switch (cols) {
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2 lg:grid-cols-3';
      case 4:
      default:
        return 'grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div
      className={`grid ${getGridCols(
        columns
      )} gap-2 sm:gap-4 lg:gap-6 ${className}`}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          className="
            bg-white
            rounded-xl sm:rounded-2xl
            py-3 sm:py-4 lg:py-5 
            flex flex-col items-center justify-center
            text-center
            border border-gray-100
            shadow-md hover:shadow-lg
            transition-all duration-200
            min-h-[100px] sm:min-h-[120px]
          "
        >

          {/* Icon */}
          <div className="text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">
            {card.icon}
          </div>

          {/* Label */}
          <p
            className="
              text-[11px] sm:text-sm lg:text-base
              text-gray-500
              font-medium
              leading-tight
            "
          >
            {card.label}
          </p>

          {/* Value */}
          <p
            className={`
              mt-1
              text-lg sm:text-xl lg:text-2xl
              font-bold
              truncate
              ${card.color || 'text-gray-900'}
            `}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}