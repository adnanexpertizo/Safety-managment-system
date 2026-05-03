'use client';

import { useState, useMemo } from 'react';
import CustomSelect from '@/components/CustomSelect';
import Table from '@/components/Table';

export default function TrainingPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [search, setSearch] = useState('');

  // -----------------------------
  // DB READY DATA
  // -----------------------------
  const trainings = useMemo(() => [
    {
      id: 1,
      title: "Electrical Safety & Lockout/Tagout",
      department: "Electrical",
      trainer: "Ahmed Khan",
      date: "2026-05-15",
      duration: "4 hours",
      participants: 18,
      status: "Completed",
      score: 88
    },
    {
      id: 2,
      title: "Heavy Machinery Operation Safety",
      department: "Mechanical",
      trainer: "Sara Malik",
      date: "2026-05-20",
      duration: "6 hours",
      participants: 12,
      status: "Scheduled",
      score: null
    },
    {
      id: 3,
      title: "Hazard Identification & Risk Assessment",
      department: "Electrical",
      trainer: "Usman Ali",
      date: "2026-05-10",
      duration: "3 hours",
      participants: 25,
      status: "Completed",
      score: 92
    },
    {
      id: 4,
      title: "Chemical Handling & PPE Usage",
      department: "Mechanical",
      trainer: "Fatima Noor",
      date: "2026-05-25",
      duration: "4 hours",
      participants: 15,
      status: "Scheduled",
      score: null
    },
    {
      id: 5,
      title: "Fire Safety & Emergency Response",
      department: "Electrical",
      trainer: "Bilal Hassan",
      date: "2026-05-08",
      duration: "5 hours",
      participants: 22,
      status: "Completed",
      score: 85
    },
  ], []);

  // -----------------------------
  // FILTER + SEARCH
  // -----------------------------
  const filteredTrainings = useMemo(() => {
    return trainings.filter(t => {
      const statusMatch = statusFilter === 'All' || t.status === statusFilter;
      const deptMatch = departmentFilter === 'All' || t.department === departmentFilter;

      const searchMatch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.trainer.toLowerCase().includes(search.toLowerCase()) ||
        t.department.toLowerCase().includes(search.toLowerCase());

      return statusMatch && deptMatch && searchMatch;
    });
  }, [trainings, statusFilter, departmentFilter, search]);

  // -----------------------------
  // KPIs
  // -----------------------------
  const kpis = useMemo(() => {
    const completed = filteredTrainings.filter(t => t.status === 'Completed').length;
    const scheduled = filteredTrainings.filter(t => t.status === 'Scheduled').length;

    const avgScoreList = filteredTrainings.filter(t => t.score !== null);
    const avgScore =
      avgScoreList.length > 0
        ? Math.round(avgScoreList.reduce((a, b) => a + b.score, 0) / avgScoreList.length)
        : 0;

    return [
      { label: 'Total Trainings', value: filteredTrainings.length, color: 'text-gray-900' },
      { label: 'Completed', value: completed, color: 'text-green-600' },
      { label: 'Upcoming', value: scheduled, color: 'text-blue-600' },
      { label: 'Avg Score', value: `${avgScore}%`, color: 'text-amber-600' },
    ];
  }, [filteredTrainings]);

  // -----------------------------
  // TABLE CONFIG
  // -----------------------------
  const columns = [
    { key: 'title', label: 'Training' },
    { key: 'department', label: 'Department' },
    { key: 'trainer', label: 'Trainer' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'duration', label: 'Duration' },
    { key: 'participants', label: 'Participants' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'score', label: 'Score' },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER + FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

        {/* TITLE */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Training & Compliance
          </h1>
          <p className="text-sm text-gray-500">
            Employee safety training management system
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search training, trainer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full sm:w-64 lg:w-72
              h-12 px-3
              border border-gray-300
              rounded-lg
              text-sm
              bg-white outline-none py-3
              transition
            "
          />

          {/* STATUS */}
          <div className="w-full sm:w-48">
            <CustomSelect
              className="h-10"
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Scheduled', label: 'Scheduled' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>

          {/* DEPARTMENT */}
          <div className="w-full sm:w-52">
            <CustomSelect
              className="h-10"
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
      </div>

      {/* KPI CARDS */}
      <div className="  grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 text-center shadow-sm hover:shadow-md transition"
          >
            <p className="text-xs sm:text-sm text-gray-500">
              {kpi.label}
            </p>
            <p className={`text-2xl sm:text-3xl font-bold mt-2 ${kpi.color}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        <Table
          columns={columns}
          data={filteredTrainings}
          maxHeight="600px"
        />
      </div>

    </div>
  );
}