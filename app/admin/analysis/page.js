'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

import CustomSelect from '@/components/CustomSelect';
import SummaryCards from '@/components/SummaryCards';

import {
  getLocalReports,
  getLocalRiskAssessments,
} from '@/lib/localStorage';

export default function AdminAnalysis() {
  const [dateRange, setDateRange] = useState('30');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const [allReports, setAllReports] = useState([]);
  const [allRisks, setAllRisks] = useState([]);

  useEffect(() => {
    setAllReports(getLocalReports());
    setAllRisks(getLocalRiskAssessments());
  }, []);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    let reports = [...allReports];

    // Date Filter
    const now = new Date();
    reports = reports.filter(report => {
      if (!report.dateOfIncident && !report.createdAt) return false;
      const reportDate = new Date(report.dateOfIncident || report.createdAt);
      const daysDiff = (now.getTime() - reportDate.getTime()) / (1000 * 3600 * 24);

      if (dateRange === '7') return daysDiff <= 7;
      if (dateRange === '30') return daysDiff <= 30;
      return true;
    });

    // Severity Filter
    if (severityFilter !== 'All') {
      reports = reports.filter(r => 
        (r.severity || '').toLowerCase() === severityFilter.toLowerCase()
      );
    }

    // Department Filter
    if (departmentFilter !== 'All') {
      reports = reports.filter(r => 
        (r.department || r.assignedDesignation || '').toLowerCase()
          .includes(departmentFilter.toLowerCase())
      );
    }

    return reports;
  }, [allReports, dateRange, severityFilter, departmentFilter]);

  const totalReports = filteredReports.length;
  const openReports = filteredReports.filter(r => (r.status || '').toLowerCase() === 'open').length;
  const highRiskOpen = filteredReports.filter(r => 
    (r.status || '').toLowerCase() === 'open' && 
    (r.severity || '').toLowerCase() === 'high'
  ).length;

  // Trend Data
  const trendData = useMemo(() => {
    const map = {};
    filteredReports.forEach(r => {
      const dateStr = r.dateOfIncident || r.createdAt;
      if (!dateStr) return;
      const date = new Date(dateStr).toISOString().split('T')[0];
      map[date] = (map[date] || 0) + 1;
    });

    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredReports]);

  // Severity Distribution
  const severityData = [
    { name: 'High', value: filteredReports.filter(r => (r.severity || '').toLowerCase() === 'high').length, color: '#ef4444' },
    { name: 'Medium', value: filteredReports.filter(r => (r.severity || '').toLowerCase() === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: filteredReports.filter(r => (r.severity || '').toLowerCase() === 'low').length, color: '#10b981' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 max-w-screen-2xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Safety Analysis</h1>
          <p className="text-gray-500 mt-1">Data-driven insights and trends</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-full sm:w-64">
          <CustomSelect
            options={[
              { value: '30', label: 'Last 30 Days' },
              { value: '7', label: 'Last 7 Days' },
              { value: 'all', label: 'All Time' },
            ]}
            value={dateRange}
            onChange={setDateRange}
          />
        </div>

        <div className="w-full sm:w-64">
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
        </div>

        <div className="w-full sm:w-64">
          <CustomSelect
            options={[
              { value: 'All', label: 'All Departments' },
              { value: 'HSE', label: 'HSE' },
              { value: 'Operations', label: 'Operations' },
              { value: 'Electrical', label: 'Electrical' },
              { value: 'Mechanical', label: 'Mechanical' },
            ]}
            value={departmentFilter}
            onChange={setDepartmentFilter}
          />
        </div>
      </div>

      {/* Summary Cards - Using Your Component */}
      <SummaryCards
        columns={4}
        cards={[
          {
            icon: <span className="text-2xl">📊</span>,
            label: "Total Reports",
            value: totalReports,
            color: "text-blue-600",
          },
          {
            icon: <span className="text-2xl">⏳</span>,
            label: "Open Reports",
            value: openReports,
            color: "text-orange-600",
          },
          {
            icon: <span className="text-2xl">🔴</span>,
            label: "High Risk Open",
            value: highRiskOpen,
            color: "text-red-600",
          },
          {
            icon: <span className="text-2xl">⚡</span>,
            label: "Avg Resolution",
            value: "4.2d",
            color: "text-emerald-600",
          },
        ]}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        
        {/* Trend Line Chart */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Incident Trend</h2>
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={trendData.length > 0 ? trendData : [{ date: 'No Data', count: 0 }]}>
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: '#3b82f6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Pie Chart */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Severity Distribution</h2>
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={severityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}