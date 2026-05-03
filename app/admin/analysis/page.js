'use client';

import { useMemo, useState } from 'react';
import CustomSelect from '@/components/CustomSelect';   // ← Update path if needed
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

export default function AdminAnalysis() {
  const [dateRange, setDateRange] = useState('30');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Dummy Data
  const allReports = useMemo(() => [
    { id: 1, type: 'incident', status: 'open', severity: 'High', department: 'Electrical', createdAt: '2026-04-28' },
    { id: 2, type: 'hazard', status: 'open', severity: 'High', department: 'Mechanical', createdAt: '2026-04-29' },
    { id: 3, type: 'near_miss', status: 'resolved', severity: 'Medium', department: 'Electrical', createdAt: '2026-04-30' },
    { id: 4, type: 'incident', status: 'open', severity: 'High', department: 'Electrical', createdAt: '2026-05-01' },
    { id: 5, type: 'hazard', status: 'in_progress', severity: 'Low', department: 'Mechanical', createdAt: '2026-05-02' },
    ...Array.from({ length: 55 }, (_, i) => ({
      id: i + 6,
      type: ['incident', 'hazard', 'near_miss'][Math.floor(Math.random() * 3)],
      status: ['open', 'resolved', 'in_progress'][Math.floor(Math.random() * 3)],
      severity: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
      department: ['Electrical', 'Mechanical'][Math.floor(Math.random() * 2)],
      createdAt: `2026-04-${20 + Math.floor(Math.random() * 14)}`,
    }))
  ], []);

  // Filtered Data
  const filteredReports = useMemo(() => {
    return allReports.filter(report => {
      const reportDate = new Date(report.createdAt);
      const now = new Date();

      let dateMatch = true;
      if (dateRange === '7') {
        dateMatch = (now.getTime() - reportDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      } else if (dateRange === '30') {
        dateMatch = (now.getTime() - reportDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      }

      const severityMatch = severityFilter === 'All' || report.severity === severityFilter;
      const deptMatch = departmentFilter === 'All' || report.department === departmentFilter;

      return dateMatch && severityMatch && deptMatch;
    });
  }, [allReports, dateRange, severityFilter, departmentFilter]);

  const totalReports = filteredReports.length;
  const openReports = filteredReports.filter(r => r.status === 'open').length;
  const highRiskOpen = filteredReports.filter(r => r.status === 'open' && r.severity === 'High').length;

  // Trend Data
  const trendData = useMemo(() => {
    const map = {};
    filteredReports.forEach(r => {
      const date = r.createdAt;
      map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count: Number(count) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredReports]);

  // Severity Data
  const severityData = [
    { name: 'High', value: filteredReports.filter(r => r.severity === 'High').length, color: '#ef4444' },
    { name: 'Medium', value: filteredReports.filter(r => r.severity === 'Medium').length, color: '#f59e0b' },
    { name: 'Low', value: filteredReports.filter(r => r.severity === 'Low').length, color: '#10b981' },
  ];

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Safety Intelligence Dashboard</h1>
              <p className="text-gray-500 mt-1">Enterprise-grade HSE decision system</p>
            </div>

            {/* Custom Select Filters */}
            <div className="flex flex-wrap gap-4">
              <CustomSelect
                options={[
                  { value: '30', label: 'Last 30 Days' },
                  { value: '7', label: 'Last 7 Days' },
                ]}
                value={dateRange}
                onChange={setDateRange}
              />

              <CustomSelect
                options={[
                  { value: 'All', label: 'All Severities' },
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' },
                ]}
                value={severityFilter}
                onChange={setSeverityFilter}
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

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            <div className="card p-6 text-center">
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-4xl font-bold mt-1">{totalReports}</p>
            </div>
            <div className="card p-6 text-center">
              <p className="text-sm text-gray-500">Open Reports</p>
              <p className="text-4xl font-bold mt-1 text-orange-600">{openReports}</p>
            </div>
            <div className="card p-6 text-center">
              <p className="text-sm text-gray-500">High Risk Open</p>
              <p className="text-4xl font-bold mt-1 text-red-600">{highRiskOpen}</p>
            </div>
            <div className="card p-6 text-center">
              <p className="text-sm text-gray-500">Avg Resolution</p>
              <p className="text-4xl font-bold mt-1">4.2d</p>
            </div>
            <div className="card p-6 text-center">
              <p className="text-sm text-gray-500">Repeat Hazards</p>
              <p className="text-4xl font-bold mt-1">7</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            <div className="lg:col-span-4 card p-6">
              <h2 className="font-semibold mb-4">Incident Trend</h2>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={trendData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={4} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-3 card p-6">
              <h2 className="font-semibold mb-4">By Severity</h2>
              <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                  <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={130}>
                    {severityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}