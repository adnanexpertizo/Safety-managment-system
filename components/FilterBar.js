'use client';

import { useUser } from '@/context/UserContext';
import CustomSelect from './CustomSelect';

export default function FilterBar({
  filters = {},
  onFilterChange,
}) {
  const { user } = useUser();
  const isAdmin = user?.role === 'ADMIN';

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'incident', label: 'Incidents' },
    { value: 'near_miss', label: 'Near Misses' },
    { value: 'hazard', label: 'Hazards' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'closed', label: 'Closed' },
  ];

  const viewOptions = [
    { value: '', label: 'All Reports' },
    { value: 'my', label: 'My Reports' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Report Type */}
        <CustomSelect
          label="Report Type"
          value={filters.type || ''}
          onChange={(value) => onFilterChange({ ...filters, type: value || null })}
          options={typeOptions}
        />

        {/* Status */}
        <CustomSelect
          label="Status"
          value={filters.status || ''}
          onChange={(value) => onFilterChange({ ...filters, status: value || null })}
          options={statusOptions}
        />

        {/* View - Admin Only */}
        {isAdmin && (
          <CustomSelect
            label="View"
            value={filters.userId || ''}
            onChange={(value) => onFilterChange({ ...filters, userId: value || null })}
            options={viewOptions}
          />
        )}

        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Search
          </label>
          <input
            type="text"
            placeholder="Search reports..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-0 focus:outline-none text-[15px]"
          />
        </div>

      </div>
    </div>
  );
}