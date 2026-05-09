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
            rounded-2xl sm:rounded-3xl
            p-3 sm:p-4 lg:p-5
            flex flex-col items-center justify-center
            text-center
            border border-gray-100
            shadow-sm hover:shadow-md
            transition-all duration-200
            min-h-[120px] sm:min-h-[150px]
          "
        >

          {/* Icon */}
          <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">
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
              text-xl sm:text-3xl lg:text-4xl
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