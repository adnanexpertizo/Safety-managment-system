'use client';

import { useState, useMemo } from 'react';
import CustomSelect from '@/components/CustomSelect';
import Table from '@/components/Table';

export default function AdminPersonnel() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // -----------------------------
  // DATA (DB READY)
  // -----------------------------
  const personnel = useMemo(() => [
    {
      id: 1,
      name: 'John Smith',
      role: 'Safety Officer',
      department: 'Operations',
      email: 'john.smith@company.com',
      reportsSubmitted: 12,
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Safety Officer',
      department: 'Manufacturing',
      email: 'sarah.johnson@company.com',
      reportsSubmitted: 18,
    },
    {
      id: 3,
      name: 'Mike Davis',
      role: 'Supervisor',
      department: 'Warehouse',
      email: 'mike.davis@company.com',
      reportsSubmitted: 8,
    },
    {
      id: 4,
      name: 'Emily Chen',
      role: 'Safety Officer',
      department: 'Quality',
      email: 'emily.chen@company.com',
      reportsSubmitted: 25,
    },
    {
      id: 5,
      name: 'Robert Wilson',
      role: 'Supervisor',
      department: 'Logistics',
      email: 'robert.wilson@company.com',
      reportsSubmitted: 5,
    },
  ], []);

  // -----------------------------
  // FILTER LOGIC (CLEAN)
  // -----------------------------
  const filteredData = useMemo(() => {
    return personnel.filter((p) => {
      const searchMatch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase());

      const roleMatch =
        roleFilter === 'All' || p.role === roleFilter;

      const deptMatch =
        departmentFilter === 'All' || p.department === departmentFilter;

      return searchMatch && roleMatch && deptMatch;
    });
  }, [personnel, search, roleFilter, departmentFilter]);

  // -----------------------------
  // TABLE CONFIG
  // -----------------------------
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role', type: 'badge' },
    { key: 'department', label: 'Department' },
    { key: 'email', label: 'Email' },
    { key: 'reportsSubmitted', label: 'Reports' },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Personnel</h1>
          <p className="text-sm text-gray-500">
            Manage safety personnel and track contributions
          </p>
        </div>

      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full border p-3 rounded-xl bg-white">

        <CustomSelect
          className="h-10 w-full"
          options={[
            { value: 'All', label: 'All Roles' },
            { value: 'Safety Officer', label: 'Safety Officer' },
            { value: 'Supervisor', label: 'Supervisor' },
          ]}
          value={roleFilter}
          onChange={setRoleFilter}
        />

        {/* DEPARTMENT */}
        <CustomSelect
          className="h-10 w-full"
          options={[
            { value: 'All', label: 'All Departments' },
            { value: 'Operations', label: 'Operations' },
            { value: 'Manufacturing', label: 'Manufacturing' },
            { value: 'Warehouse', label: 'Warehouse' },
            { value: 'Quality', label: 'Quality' },
            { value: 'Logistics', label: 'Logistics' },
          ]}
          value={departmentFilter}
          onChange={setDepartmentFilter}
        />

        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 px-3 border border-gray-300 rounded-lg text-sm
           w-full py-3 outline-none "
        />
        <button
          onClick={() => {
            setSearch('');
            setRoleFilter('All');
            setDepartmentFilter('All');
          }}
          className="h-12 px-4 text-sm font-medium rounded-lg border border-gray-300
      hover:bg-gray-100 transition w-full py-3"
        >
          Reset
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <Table
          columns={columns}
          data={filteredData}
          itemsPerPage={10}
        />
      </div>

    </div>
  );
}