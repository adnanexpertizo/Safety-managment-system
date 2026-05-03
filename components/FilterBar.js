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

  // ✅ FIXED: use IDs (important for filtering)
  const employeeOptions = [
    { value: '', label: 'All Employees' },
    { value: 'my', label: 'My Reports' },

    { value: 'emp1', label: 'John Smith' },
    { value: 'emp2', label: 'Adnan Rafiq' },
    { value: 'emp3', label: 'Muhammad Danish' },
    { value: 'emp4', label: 'Abdullah Naseer' },
    { value: 'emp5', label: 'Izhaan Saqib' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">

      {/* ✅ FLEX WRAP + MIN WIDTH FIX */}
      <div className="flex flex-wrap gap-4">

        {/* Report Type */}
        <div className="min-w-[220px] flex-1">
          <CustomSelect
            label="Report Type"
            value={filters.type || ''}
            onChange={(value) =>
              onFilterChange({ ...filters, type: value || null })
            }
            options={typeOptions}
          />
        </div>

        {/* Status */}
        <div className="min-w-[220px] flex-1">
          <CustomSelect
            label="Status"
            value={filters.status || ''}
            onChange={(value) =>
              onFilterChange({ ...filters, status: value || null })
            }
            options={statusOptions}
          />
        </div>

        {/* Employee */}
        {isAdmin && (
          <div className="min-w-[220px] flex-1">
            <CustomSelect
              label="Employee"
              value={filters.userId || ''}
              onChange={(value) =>
                onFilterChange({ ...filters, userId: value || null })
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
            placeholder="Search reports..."
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