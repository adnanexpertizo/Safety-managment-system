'use client';

import { useUser } from '@/context/UserContext';
import CustomSelect from './CustomSelect';

export default function FilterBar({
  filters = {},
  onFilterChange,
}) {
  const { user } = useUser();
  const isAdmin = user?.role === 'ADMIN';

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Physical', label: 'Physical' },
    { value: 'Chemical', label: 'Chemical' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Fire', label: 'Fire' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'closed', label: 'Closed' },
  ];

  const employeeOptions = [
    { value: '', label: 'All Employees' },
    { value: 'my', label: 'My Reports' },
    ...getLocalUsers().map(emp => ({
      value: emp.id,
      label: emp.name,
    })),
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex flex-wrap gap-4">

        {/* Category Filter */}
        <div className="min-w-[220px] flex-1">
          <CustomSelect
            label="Category"
            value={filters.category || ''}
            onChange={(value) =>
              onFilterChange({ ...filters, category: value || '' })
            }
            options={categoryOptions}
          />
        </div>

        {/* Status */}
        <div className="min-w-[220px] flex-1">
          <CustomSelect
            label="Status"
            value={filters.status || ''}
            onChange={(value) =>
              onFilterChange({ ...filters, status: value || '' })
            }
            options={statusOptions}
          />
        </div>

        {/* Employee Filter */}
        {isAdmin && (
          <div className="min-w-[220px] flex-1">
            <CustomSelect
              label="Employee"
              value={filters.assignedTo || ''}
              onChange={(value) =>
                onFilterChange({ ...filters, assignedTo: value || '' })
              }
              options={employeeOptions}
            />
          </div>
        )}

        {/* Search */}
        <div className="min-w-[260px] flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Search
          </label>
          <input
            type="text"
            placeholder="Search activity, hazard or location..."
            value={filters.search || ''}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl 
            focus:border-blue-600 focus:ring-0 focus:outline-none text-[15px]"
          />
        </div>

      </div>
    </div>
  );
}

// Helper to get fresh users (optional, safe to call here)
function getLocalUsers() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('safety_users')) || [];
  } catch {
    return [];
  }
}