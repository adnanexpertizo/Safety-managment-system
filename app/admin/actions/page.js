'use client';

import { useState, useMemo } from 'react';
import CustomSelect from '@/components/CustomSelect';
import Table from '@/components/Table';

export default function CorrectiveActionsPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // -----------------------------
  // DB READY DATA
  // -----------------------------
  const actions = useMemo(() => [
    {
      id: 1,
      reportId: "R-1023",
      title: "Fix faulty electrical wiring in Warehouse",
      department: "Electrical",
      assignee: "Ahmed Khan",
      dueDate: "2026-05-10",
      status: "In Progress",
      priority: "High",
      progress: 65
    },
    {
      id: 2,
      reportId: "R-0987",
      title: "Install safety guards on machinery",
      department: "Mechanical",
      assignee: "Sara Malik",
      dueDate: "2026-05-08",
      status: "Pending",
      priority: "High",
      progress: 20
    },
    {
      id: 3,
      reportId: "R-1056",
      title: "Conduct training on chemical handling",
      department: "Electrical",
      assignee: "Usman Ali",
      dueDate: "2026-05-15",
      status: "Completed",
      priority: "Medium",
      progress: 100
    },
    {
      id: 4,
      reportId: "R-0991",
      title: "Repair leaking hydraulic system",
      department: "Mechanical",
      assignee: "Fatima Noor",
      dueDate: "2026-05-05",
      status: "In Progress",
      priority: "High",
      progress: 40
    },
    {
      id: 5,
      reportId: "R-1078",
      title: "Update emergency exit signage",
      department: "Electrical",
      assignee: "Bilal Hassan",
      dueDate: "2026-05-12",
      status: "Completed",
      priority: "Low",
      progress: 100
    },
  ], []);

  // -----------------------------
  // FILTERED DATA
  // -----------------------------
  const filteredActions = useMemo(() => {
    return actions.filter(a => {
      const statusMatch = statusFilter === 'All' || a.status === statusFilter;
      const deptMatch = departmentFilter === 'All' || a.department === departmentFilter;
      return statusMatch && deptMatch;
    });
  }, [actions, statusFilter, departmentFilter]);

  // -----------------------------
  // KPI LOGIC
  // -----------------------------
  const kpis = useMemo(() => {
    const total = filteredActions.length;
    const inProgress = filteredActions.filter(a => a.status === 'In Progress').length;
    const completed = filteredActions.filter(a => a.status === 'Completed').length;
    const overdue = filteredActions.filter(
      a => new Date(a.dueDate) < new Date() && a.status !== 'Completed'
    ).length;

    return [
      { label: "Total Actions", value: total, color: "text-gray-900" },
      { label: "In Progress", value: inProgress, color: "text-blue-600" },
      { label: "Overdue", value: overdue, color: "text-red-600" },
      { label: "Completed", value: completed, color: "text-green-600" },
    ];
  }, [filteredActions]);

  // -----------------------------
  // TABLE CONFIG
  // -----------------------------
  const columns = [
    { key: 'reportId', label: 'Report ID' },
    { key: 'title', label: 'Action Title' },
    { key: 'department', label: 'Department' },
    { key: 'assignee', label: 'Assignee' },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'progress', label: 'Progress (%)' },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Corrective Actions
          </h1>
          <p className="text-sm text-muted-foreground">
            Track CAPA (Corrective & Preventive Actions)
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <CustomSelect
            options={[
              { value: 'All', label: 'All Status' },
              { value: 'Pending', label: 'Pending' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />

          <CustomSelect
            options={[
              { value: 'All', label: 'All Departments' },
              { value: 'Electrical', label: 'Electrical' },
              { value: 'Mechanical', label: 'Mechanical' },
            ]}
            value={departmentFilter}
            onChange={setDepartmentFilter}
          />
        </div>
      </div>

      {/* KPI CARDS (MATCH YOUR DASHBOARD STYLE) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-lg p-6 text-center"
          >
            <p className="text-[13px] text-muted-foreground">
              {kpi.label}
            </p>
            <p className={`text-[28px] font-bold mt-2 ${kpi.color}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* TABLE (same system style) */}
      <div className="bg-card border border-border rounded-lg">
        <Table
          columns={columns}
          data={filteredActions}
          maxHeight="600px"
        />
      </div>

    </div>
  );
}