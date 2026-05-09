'use client';

import { useUser } from '@/context/UserContext';
import CustomSelect from './CustomSelect';

export default function FilterBar({
  filters = {},
  onFilterChange,
  showReportType = false,
  showCategory = false,
  showEmployee = true,
  showDepartment = false,
  showDesignation = false,
  showMonth = false,
  showSearch = true,
  departments = [],
  designations = [],
  months = [],
  customStatusOptions = null,
}) {
  const { user } = useUser();
  const isAdmin = user?.role === 'ADMIN';

  // Report Type Options
  const reportTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'incident', label: 'Incidents' },
    { value: 'near_miss', label: 'Near Misses' },
    { value: 'hazard', label: 'Hazards' },
  ];

  // Category Options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Physical', label: 'Physical' },
    { value: 'Chemical', label: 'Chemical' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Fire', label: 'Fire' },
  ];

  // Status Options
  const defaultStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'closed', label: 'Closed' },
  ];

  const statusOptions = customStatusOptions || defaultStatusOptions;

  // Employee Options
  const employeeOptions = [
    { value: '', label: 'All Employees' },
    { value: 'my', label: 'My Reports' },
    ...getLocalUsers()?.map((emp) => ({
      value: emp.id,
      label: emp.name,
    })),
  ];

  // Month Options
  const monthOptions = months.map(m => ({
    value: m === 'All Months' ? 'all' : m,
    label: m,
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-2 sm:p-4 mb-3 sm:mb-6 shadow-sm">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-4">

        {/* Report Type */}
        {showReportType && (
          <div className="w-full">
            <CustomSelect
              label="Report Type"
              value={filters.type || ''}
              onChange={(value) => onFilterChange({ ...filters, type: value || '' })}
              options={reportTypeOptions}
            />
          </div>
        )}

        {/* Category */}
        {showCategory && (
          <div className="w-full">
            <CustomSelect
              label="Category"
              value={filters.category || ''}
              onChange={(value) => onFilterChange({ ...filters, category: value || '' })}
              options={categoryOptions}
            />
          </div>
        )}

        {/* Status */}
        <div className="w-full">
          <CustomSelect
            label="Status"
            value={filters.status || ''}
            onChange={(value) => onFilterChange({ ...filters, status: value || '' })}
            options={statusOptions}
          />
        </div>

        {/* Employee */}
        {showEmployee && isAdmin && (
          <div className="w-full">
            <CustomSelect label="Employee" value={filters.assignedTo || ''} onChange={(v) => onFilterChange({ ...filters, assignedTo: v || '' })} options={employeeOptions} />
          </div>
        )}

        {/* Department */}
        {showDepartment && departments.length > 0 && (
          <div className="w-full">
            <CustomSelect
              label="Department"
              value={filters.department || 'All'}
              onChange={(v) => onFilterChange({ ...filters, department: v })}
              options={departments.map(dep => ({ value: dep, label: dep }))}
            />
          </div>
        )}

        {/* Designation */}
        {showDesignation && designations.length > 0 && (
          <div className="w-full">
            <CustomSelect
              label="Designation"
              value={filters.designation || 'All'}
              onChange={(v) => onFilterChange({ ...filters, designation: v })}
              options={designations.map(des => ({ value: des, label: des }))}
            />
          </div>
        )}

        {/* Month */}
        {showMonth && monthOptions.length > 0 && (
          <div className="w-full">
            <CustomSelect label="Month" value={filters.month || 'all'} onChange={(v) => onFilterChange({ ...filters, month: v })} options={monthOptions} />
          </div>
        )}

        {/* Search */}
        {showSearch && (
          <div className="w-full sm:col-span-2 xl:col-span-1">
            <label className="block text-[11px] sm:text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="w-full px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-md sm:rounded-lg focus:border-blue-600 focus:ring-0 focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Function
function getLocalUsers() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('safety_users')) || [];
  } catch {
    return [];
  }
}