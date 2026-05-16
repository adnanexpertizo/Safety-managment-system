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

  const hasActiveFilters = Object.values(filters).some(
    v => v && v !== 'All' && v !== 'all' && v !== ''
  );

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

  // Collect all active filter items to render in grid
  const filterItems = [];

  // Search is always first if enabled
  if (showSearch) {
    filterItems.push(
      <div key="search" className="relative w-full">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
        />
        <input
          type="text"
          placeholder="Search..."
          value={filters.search || ''}
          onChange={e => update('search', e.target.value)}
          className="w-full pl-9 pr-8 py-2 md:py-3 text-sm bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:outline-none transition hover:border-gray-300"
        />
        {filters.search && (
          <button
            onClick={() => update('search', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>
    );
  }

  if (showStatus) {
    filterItems.push(
      <CustomSelect
        key="status"
        value={filters.status || ''}
        onChange={v => update('status', v)}
        options={statusOptions}
        placeholder="All Statuses"
      />
    );
  }

  if (showReportType) {
    filterItems.push(
      <CustomSelect
        key="type"
        value={filters.type || ''}
        onChange={v => update('type', v)}
        options={reportTypeOptions}
        placeholder="All Types"
      />
    );
  }

  if (showCategory) {
    filterItems.push(
      <CustomSelect
        key="category"
        value={filters.category || ''}
        onChange={v => update('category', v)}
        options={categoryOptions}
        placeholder="All Categories"
      />
    );
  }

  if (showEmployee && employees.length > 0) {
    filterItems.push(
      <CustomSelect
        key="employee"
        value={filters.assignedTo || ''}
        onChange={v => update('assignedTo', v)}
        options={employeeOptions}
        placeholder="All Employees"
      />
    );
  }

  if (showDepartment && departments.length > 0) {
    filterItems.push(
      <CustomSelect
        key="department"
        value={filters.department || 'All'}
        onChange={v => update('department', v)}
        options={departments.map(d => ({ value: d, label: d }))}
        placeholder="All Departments"
      />
    );
  }

  if (showDesignation && designations.length > 0) {
    filterItems.push(
      <CustomSelect
        key="designation"
        value={filters.designation || 'All'}
        onChange={v => update('designation', v)}
        options={designations.map(d => ({ value: d, label: d }))}
        placeholder="All Designations"
      />
    );
  }

  if (showMonth && monthOptions.length > 1) {
    filterItems.push(
      <CustomSelect
        key="month"
        value={filters.month || 'all'}
        onChange={v => update('month', v)}
        options={monthOptions}
        placeholder="All Months"
      />
    );
  }

  // Determine grid columns based on number of filter items
  const count = filterItems.length;
  // Always 2 on mobile, up to 4 on xl
  const gridCols =
    count <= 2
      ? 'grid-cols-2'
      : count === 3
      ? 'grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-2 xl:grid-cols-4';

  if (filterItems.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4">
      <div className={`grid ${gridCols} gap-2 sm:gap-3`}>
        {filterItems}
      </div>

      {/* Clear all — shown below grid when filters active */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400 font-medium">
            {Object.values(filters).filter(v => v && v !== 'All' && v !== 'all' && v !== '').length} filter{Object.values(filters).filter(v => v && v !== 'All' && v !== 'all' && v !== '').length !== 1 ? 's' : ''} active
          </p>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-lg transition-all"
          >
            <X size={11} /> Clear all
          </button>
        </div>
      )}
    </div>
  );
}