'use client';

import { Search, X } from 'lucide-react';
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
  showStatus = true,
  departments = [],
  designations = [],
  months = [],
  employees = [],
  customStatusOptions = null,
}) {
  const update = (key, val) => onFilterChange({ ...filters, [key]: val });

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'All' && v !== 'all');

  const clearAll = () => {
    const cleared = {};
    Object.keys(filters).forEach(k => (cleared[k] = ''));
    onFilterChange(cleared);
  };

  const reportTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'incident', label: 'Incident' },
    { value: 'near_miss', label: 'Near Miss' },
    { value: 'hazard', label: 'Hazard' },
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Physical', label: 'Physical' },
    { value: 'Chemical', label: 'Chemical' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Fire', label: 'Fire' },
    { value: 'Biological', label: 'Biological' },
    { value: 'Ergonomic', label: 'Ergonomic' },
  ];

  const defaultStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const statusOptions = customStatusOptions || defaultStatusOptions;

  const employeeOptions = [
    { value: '', label: 'All Employees' },
    ...employees.map(emp => ({ value: emp.id, label: emp.name })),
  ];

  const monthOptions = [
    { value: 'all', label: 'All Months' },
    ...months.filter(m => m !== 'All Months').map(m => ({ value: m, label: m })),
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4">
      <div className="flex flex-wrap gap-2 sm:gap-3">

        {showSearch && (
          <div className="relative flex-1 min-w-[160px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search || ''}
              onChange={(e) => update('search', e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:outline-none transition"
            />
            {filters.search && (
              <button onClick={() => update('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>
        )}

        {showStatus && (
          <div className="min-w-[140px] sm:min-w-[160px]">
            <CustomSelect
              value={filters.status || ''}
              onChange={(v) => update('status', v)}
              options={statusOptions}
              placeholder="All Statuses"
            />
          </div>
        )}

        {showReportType && (
          <div className="min-w-[140px] sm:min-w-[150px]">
            <CustomSelect
              value={filters.type || ''}
              onChange={(v) => update('type', v)}
              options={reportTypeOptions}
              placeholder="All Types"
            />
          </div>
        )}

        {showCategory && (
          <div className="min-w-[140px] sm:min-w-[160px]">
            <CustomSelect
              value={filters.category || ''}
              onChange={(v) => update('category', v)}
              options={categoryOptions}
              placeholder="All Categories"
            />
          </div>
        )}

        {showEmployee && employees.length > 0 && (
          <div className="min-w-[150px] sm:min-w-[180px]">
            <CustomSelect
              value={filters.assignedTo || ''}
              onChange={(v) => update('assignedTo', v)}
              options={employeeOptions}
              placeholder="All Employees"
            />
          </div>
        )}

        {showDepartment && departments.length > 0 && (
          <div className="min-w-[140px] sm:min-w-[160px]">
            <CustomSelect
              value={filters.department || 'All'}
              onChange={(v) => update('department', v)}
              options={departments.map(d => ({ value: d, label: d }))}
              placeholder="All Departments"
            />
          </div>
        )}

        {showDesignation && designations.length > 0 && (
          <div className="min-w-[140px] sm:min-w-[160px]">
            <CustomSelect
              value={filters.designation || 'All'}
              onChange={(v) => update('designation', v)}
              options={designations.map(d => ({ value: d, label: d }))}
              placeholder="All Designations"
            />
          </div>
        )}

        {showMonth && monthOptions.length > 1 && (
          <div className="min-w-[130px] sm:min-w-[150px]">
            <CustomSelect
              value={filters.month || 'all'}
              onChange={(v) => update('month', v)}
              options={monthOptions}
              placeholder="All Months"
            />
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 border border-dashed border-gray-300 hover:border-red-300 rounded-xl transition-all whitespace-nowrap"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>
    </div>
  );
}