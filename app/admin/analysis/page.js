'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend,
} from 'recharts';

import CustomSelect from '@/components/CustomSelect';
import SummaryCards from '@/components/SummaryCards';

import { getLocalReports, getLocalRiskAssessments } from '@/lib/localStorage';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function Card({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-5 ${className}`}>
      <div className="mb-4">
        <p className="text-sm font-bold text-gray-800">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Severity Dot ─────────────────────────────────────────────────────────────
function SevDot({ name, value, color }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs text-gray-600">{name}</span>
      </div>
      <span className="text-xs font-bold text-gray-900">{value}</span>
    </div>
  );
}

const DATE_OPTIONS = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
];

const SEV_OPTIONS = [
  { value: 'All', label: 'All Severities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const DEPT_OPTIONS = [
  { value: 'All', label: 'All Departments' },
  { value: 'HSE', label: 'HSE' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Mechanical', label: 'Mechanical' },
];

const SEV_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const TYPE_COLORS = { incident: '#ef4444', near_miss: '#f59e0b', hazard: '#f97316' };

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

  const filteredReports = useMemo(() => {
    const now = new Date();
    return allReports.filter(r => {
      const d = new Date(r.dateOfIncident || r.createdAt);
      if (isNaN(d)) return false;
      const days = (now - d) / 86400000;
      if (dateRange === '7' && days > 7) return false;
      if (dateRange === '30' && days > 30) return false;
      if (dateRange === '90' && days > 90) return false;
      if (severityFilter !== 'All' && (r.severity || '').toLowerCase() !== severityFilter.toLowerCase()) return false;
      if (departmentFilter !== 'All' && !(r.department || r.assignedDesignation || '').toLowerCase().includes(departmentFilter.toLowerCase())) return false;
      return true;
    });
  }, [allReports, dateRange, severityFilter, departmentFilter]);

  // Trend data — daily counts
  const trendData = useMemo(() => {
    const map = {};
    filteredReports.forEach(r => {
      const dateStr = new Date(r.dateOfIncident || r.createdAt).toISOString().split('T')[0];
      if (!map[dateStr]) map[dateStr] = { date: dateStr, incidents: 0, near_miss: 0, hazard: 0 };
      const key = r.type === 'incident' ? 'incidents' : r.type === 'near_miss' ? 'near_miss' : 'hazard';
      map[dateStr][key]++;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [filteredReports]);

  // Severity dist
  const severityData = [
    { name: 'High', value: filteredReports.filter(r => (r.severity || '').toLowerCase() === 'high').length, color: '#ef4444' },
    { name: 'Medium', value: filteredReports.filter(r => (r.severity || '').toLowerCase() === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: filteredReports.filter(r => (r.severity || '').toLowerCase() === 'low').length, color: '#10b981' },
  ];

  // Type dist bar chart
  const typeData = [
    { name: 'Incidents', value: filteredReports.filter(r => r.type === 'incident').length, fill: '#ef4444' },
    { name: 'Near Misses', value: filteredReports.filter(r => r.type === 'near_miss').length, fill: '#f59e0b' },
    { name: 'Hazards', value: filteredReports.filter(r => r.type === 'hazard').length, fill: '#f97316' },
  ];

  // Risk dist
  const riskData = [
    { name: 'High', value: allRisks.filter(r => r.riskLevel === 'High').length, color: '#ef4444' },
    { name: 'Medium', value: allRisks.filter(r => r.riskLevel === 'Medium').length, color: '#f59e0b' },
    { name: 'Low', value: allRisks.filter(r => r.riskLevel === 'Low').length, color: '#10b981' },
  ];

  const openCount = filteredReports.filter(r => r.status === 'open').length;
  const highOpen = filteredReports.filter(r => r.status === 'open' && (r.severity || '').toLowerCase() === 'high').length;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Safety Analysis</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Data-driven insights & trends</p>
        </div>

        {/* Filters inline */}
        <div className="flex flex-wrap gap-2">
          <div className="min-w-[130px]">
            <CustomSelect options={DATE_OPTIONS} value={dateRange} onChange={setDateRange} placeholder="Date Range" />
          </div>
          <div className="min-w-[130px]">
            <CustomSelect options={SEV_OPTIONS} value={severityFilter} onChange={setSeverityFilter} placeholder="Severity" />
          </div>
          <div className="min-w-[140px]">
            <CustomSelect options={DEPT_OPTIONS} value={departmentFilter} onChange={setDepartmentFilter} placeholder="Department" />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <SummaryCards cards={[
        { icon: '📊', label: 'Total Reports', value: filteredReports.length, color: 'text-slate-700' },
        { icon: '⏳', label: 'Open Reports', value: openCount, color: 'text-amber-600' },
        { icon: '🔴', label: 'High Risk Open', value: highOpen, color: 'text-red-600' },
        { icon: '🛡️', label: 'Risk Assessments', value: allRisks.length, color: 'text-purple-600' },
      ]} />

      {/* Row 1: Trend + Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Line Trend */}
        <Card title="Incident Trend" subtitle={`Reports over ${dateRange === 'all' ? 'all time' : `last ${dateRange} days`}`} className="lg:col-span-2">
          {trendData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No data for selected range</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Incidents" />
                <Line type="monotone" dataKey="near_miss" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Near Misses" />
                <Line type="monotone" dataKey="hazard" stroke="#f97316" strokeWidth={2.5} dot={false} name="Hazards" />
              </LineChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-2">
            {[['#ef4444', 'Incidents'], ['#f59e0b', 'Near Misses'], ['#f97316', 'Hazards']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                <span className="text-[10px] text-gray-500">{l}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Severity Dist */}
        <Card title="Severity Distribution" subtitle="By report count">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={severityData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={40} paddingAngle={3}>
                {severityData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-1">
            {severityData.map((d) => <SevDot key={d.name} {...d} />)}
          </div>
        </Card>
      </div>

      {/* Row 2: Type Bar + Risk Dist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Report Type Bar */}
        <Card title="Reports by Type" subtitle="Breakdown of report categories">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Count">
                {typeData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk Assessment Distribution */}
        <Card title="Risk Assessment Levels" subtitle="Across all assessments">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={riskData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={40} paddingAngle={3}>
                {riskData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-1">
            {riskData.map(d => <SevDot key={d.name} {...d} />)}
          </div>
        </Card>
      </div>

      {/* Status breakdown */}
      <Card title="Report Status Breakdown" subtitle="Current resolution status">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Open', val: filteredReports.filter(r => r.status === 'open').length, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
            { label: 'In Progress', val: filteredReports.filter(r => r.status === 'in-progress').length, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
            { label: 'Resolved', val: filteredReports.filter(r => r.status === 'resolved').length, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Closed', val: filteredReports.filter(r => r.status === 'closed').length, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}