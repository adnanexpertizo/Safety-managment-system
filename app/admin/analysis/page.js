'use client';

import { useState, useMemo, useEffect } from 'react';
import CustomSelect from '@/components/CustomSelect';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

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

  // Load Data from localStorage
  useEffect(() => {
    setAllReports(getLocalReports());
    setAllRisks(getLocalRiskAssessments());
  }, []);

  // Filtered Data
  const filteredReports = useMemo(() => {
    let reports = [...allReports];

    // Date Filter
    const now = new Date();
    reports = reports.filter(report => {
      if (!report.dateOfIncident && !report.createdAt) return false;
      const reportDate = new Date(report.dateOfIncident || report.createdAt);
      
      let daysDiff = (now.getTime() - reportDate.getTime()) / (1000 * 3600 * 24);
      
      if (dateRange === '7') return daysDiff <= 7;
      if (dateRange === '30') return daysDiff <= 30;
      return true; // All time
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
        (r.department || r.assignedDesignation || '').toLowerCase().includes(departmentFilter.toLowerCase())
      );
    }

    return reports;
  }, [allReports, dateRange, severityFilter, departmentFilter]);

  const totalReports = filteredReports.length;
  const openReports = filteredReports.filter(r => 
    (r.status || '').toLowerCase() === 'open'
  ).length;
  
  const highRiskOpen = filteredReports.filter(r => 
    (r.status || '').toLowerCase() === 'open' && 
    (r.severity || '').toLowerCase() === 'high'
  ).length;

  // Trend Data (Last 30 days)
  const trendData = useMemo(() => {
    const map = {};
    const now = new Date();

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
    { 
      name: 'High', 
      value: filteredReports.filter(r => (r.severity || '').toLowerCase() === 'high').length, 
      color: '#ef4444' 
    },
    { 
      name: 'Medium', 
      value: filteredReports.filter(r => (r.severity || '').toLowerCase() === 'medium').length, 
      color: '#f59e0b' 
    },
    { 
      name: 'Low', 
      value: filteredReports.filter(r => (r.severity || '').toLowerCase() === 'low').length, 
      color: '#10b981' 
    },
  ];

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Safety Intelligence Dashboard</h1>
              <p className="text-gray-500 mt-1">Enterprise-grade HSE decision system</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
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
                  { value: 'Electrical', label: 'Electrical' },
                  { value: 'Mechanical', label: 'Mechanical' },
                  { value: 'HSE', label: 'HSE' },
                  { value: 'Operations', label: 'Operations' },
                ]}
                value={departmentFilter}
                onChange={setDepartmentFilter}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Reports', value: totalReports, color: 'from-blue-500 to-blue-600' },
              { label: 'Open Reports', value: openReports, color: 'from-orange-400 to-orange-500' },
              { label: 'High Risk Open', value: highRiskOpen, color: 'from-red-500 to-red-600' },
              { label: 'Avg Resolution', value: '4.2d', color: 'from-green-400 to-green-600' },
              { label: 'Repeat Hazards', value: 7, color: 'from-purple-500 to-purple-600' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white border rounded-2xl p-6 hover:shadow-md transition-all"
              >
                <p className="text-sm text-gray-500">{item.label}</p>
                <h2 className="text-4xl font-bold mt-3">{item.value}</h2>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Trend Chart */}
            <div className="lg:col-span-4 bg-white border rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Incident Trend</h2>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={trendData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Severity Pie Chart */}
            <div className="lg:col-span-3 bg-white border rounded-2xl p-6">
              <h2 className="font-semibold mb-4">By Severity</h2>
              <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                  <Pie 
                    data={severityData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={130}
                  >
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