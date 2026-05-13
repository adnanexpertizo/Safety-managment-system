'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, TrendingUp, Users, Award, ShieldAlert,
  Clock, Flame, Wrench, ArrowRight, Calendar, Activity,
  CheckCircle2, FileText,
} from 'lucide-react';

import Table from '@/components/Table';
import {
  getDashboardStats,
  getRecentReports,
  getRecentActivity,
  getIncidentTrendData,
  getReportsByLocation,
  getRiskDistribution,
  getLocalCorrectiveActions,
} from '@/lib/localStorage';

// ─── Badges ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    open: 'bg-red-100 text-red-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    resolved: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold capitalize ${map[(status || '').toLowerCase()] || map.open}`}>
      {status?.replace('-', ' ') || 'open'}
    </span>
  );
}

// ─── Stacked Bar Trend Chart ──────────────────────────────────────────────────
function TrendChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.incidents + d.nearMisses + d.hazards), 1);
  return (
    <div className="flex items-end gap-1.5 sm:gap-2 h-28 w-full">
      {data.map((d, i) => {
        const total = d.incidents + d.nearMisses + d.hazards;
        const heightPct = Math.max((total / maxVal) * 100, 3);
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            <div className="relative w-full flex flex-col justify-end" style={{ height: '90px' }}>
              <div className="w-full rounded overflow-hidden flex flex-col-reverse" style={{ height: `${heightPct}%` }}>
                <div className="bg-red-400 flex-shrink-0" style={{ flex: Math.max(d.incidents, 0.01) }} />
                <div className="bg-amber-400 flex-shrink-0" style={{ flex: Math.max(d.nearMisses, 0.01) }} />
                <div className="bg-orange-300 flex-shrink-0" style={{ flex: Math.max(d.hazards, 0.01) }} />
              </div>
              {total > 0 && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-600">{total}</div>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  let cumulative = 0;
  const radius = 38, cx = 56, cy = 56;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-5">
      <svg width="112" height="112" viewBox="0 0 112 112" className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="16" />
        {data.map((d, i) => {
          if (d.count === 0) { cumulative += 0; return null; }
          const pct = d.count / total;
          const dashArr = `${circumference * pct} ${circumference * (1 - pct)}`;
          const offset = circumference * (1 - cumulative);
          cumulative += pct;
          return (
            <circle key={i} cx={cx} cy={cy} r={radius} fill="none"
              stroke={d.color} strokeWidth="16"
              strokeDasharray={dashArr} strokeDashoffset={offset}
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="700" fill="#1e293b">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#94a3b8">TOTAL</text>
      </svg>
      <div className="space-y-2 flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-gray-600">{d.level}</span>
            </div>
            <span className="text-xs font-bold text-gray-900">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Location Bars ────────────────────────────────────────────────────────────
function LocationBars({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const colors = ['bg-slate-700', 'bg-slate-600', 'bg-slate-500', 'bg-slate-400', 'bg-slate-300', 'bg-slate-200'];
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-28 sm:w-36 truncate flex-shrink-0 font-medium" title={d.location}>
            {d.location}
          </span>
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${colors[i] || colors[colors.length - 1]} transition-all duration-700`}
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-700 w-5 text-right flex-shrink-0">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Safety Score Ring ────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 42, cx = 52, cy = 52;
  const circ = 2 * Math.PI * r;
  const filled = circ * (score / 100);
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work';

  return (
    <div className="flex items-center gap-4">
      <svg width="104" height="104" viewBox="0 0 104 104" className="flex-shrink-0 -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div style={{ marginLeft: '-90px', pointerEvents: 'none', position: 'relative' }}>
        <svg width="104" height="104" viewBox="0 0 104 104" className="absolute inset-0">
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="800" fill={color}>{score}</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#94a3b8">SCORE</text>
        </svg>
      </div>
      <div style={{ marginLeft: '20px' }}>
        <p className="text-sm font-bold" style={{ color }}>{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">Safety performance</p>
      </div>
    </div>
  );
}

// ─── Days Counter ─────────────────────────────────────────────────────────────
function DaysCounter({ days }) {
  const isGood = days !== null && days >= 30;
  const isWarn = days !== null && days >= 7 && days < 30;
  const bgCls = isGood ? 'bg-emerald-50 border-emerald-200' : isWarn ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
  const textCls = isGood ? 'text-emerald-600' : isWarn ? 'text-amber-600' : 'text-red-600';

  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${bgCls}`}>
      <div className={`text-3xl sm:text-4xl font-black ${textCls} min-w-[3ch] text-center`}>
        {days === null ? '—' : days}
      </div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Days Since</p>
        <p className="text-sm font-bold text-gray-800">Last Incident</p>
        <p className={`text-xs mt-0.5 font-medium ${textCls}`}>
          {days === null ? 'No incidents recorded' : days < 7 ? '⚠️ Recent incident' : days >= 30 ? '✅ Great streak!' : '📊 Stay vigilant'}
        </p>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, bg, href }) {
  const content = (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all group ${href ? 'cursor-pointer' : ''}`}>
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-2xl sm:text-3xl font-black mt-1 ${color}`}>{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentReports, setRecentReports] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [riskDist, setRiskDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats(getDashboardStats());
    setRecentReports(getRecentReports(5));
    setRecentActivity(getRecentActivity(8));
    setTrendData(getIncidentTrendData());
    setLocationData(getReportsByLocation());
    setRiskDist(getRiskDistribution());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const safetyScore = stats.safetyScore || 87;

  const topCards = [
    { icon: <FileText size={18} className="text-blue-600" />, label: 'Total Reports', value: stats.totalReports || 0, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/reports' },
    { icon: <Flame size={18} className="text-red-600" />, label: 'Incidents', value: stats.incidents || 0, color: 'text-red-600', bg: 'bg-red-50', href: '/admin/reports' },
    { icon: <TrendingUp size={18} className="text-amber-600" />, label: 'Near Misses', value: stats.nearMisses || 0, color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: <Award size={18} className="text-emerald-600" />, label: 'Trainings Done', value: stats.completedTrainings || 0, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/admin/training' },
  ];

  const row2Cards = [
    { icon: <Clock size={18} className="text-red-600" />, label: 'Open Cases', value: stats.openReports || 0, color: 'text-red-600', bg: 'bg-red-50' },
    { icon: <ShieldAlert size={18} className="text-orange-600" />, label: 'High Risk', value: stats.highRiskAssessments || 0, color: 'text-orange-600', bg: 'bg-orange-50', href: '/admin/risk-assessments' },
    { icon: <Users size={18} className="text-purple-600" />, label: 'Active Users', value: stats.activeUsers || 0, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/user-management' },
    { icon: <Wrench size={18} className="text-rose-600" />, label: 'Overdue Actions', value: stats.overdueCorrectiveActions || 0, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const recentReportColumns = [
    {
      key: 'type', label: 'Type',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
          {(row.type || '').replace('_', ' ')}
        </span>
      )
    },
    { key: 'location', label: 'Location' },
    {
      key: 'severity', label: 'Severity',
      render: (row) => {
        const map = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-green-100 text-green-700' };
        return <span className={`px-2 py-1 rounded-full text-[10px] font-semibold capitalize ${map[row.severity] || map.medium}`}>{row.severity}</span>;
      }
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', label: 'Date', type: 'date' },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Safety Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Real-time safety performance & risk intelligence</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-2 w-fit">
          <Calendar size={13} />
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Row 1 KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {topCards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* Row 2 KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {row2Cards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* Mid section: Score + Trend + Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Safety Score */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <p className="text-sm font-bold text-gray-800">Safety Score</p>
          <ScoreRing score={safetyScore} />
          <DaysCounter days={stats.daysSinceLastIncident} />
        </div>

        {/* Trend Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold text-gray-800">6-Month Trend</p>
            <Activity size={15} className="text-gray-400" />
          </div>
          <TrendChart data={trendData} />
          <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
            {[['bg-red-400', 'Incidents'], ['bg-amber-400', 'Near Misses'], ['bg-orange-300', 'Hazards']].map(([cls, lbl]) => (
              <div key={lbl} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
                <span className="text-[10px] text-gray-500">{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold text-gray-800">Risk Distribution</p>
            <Link href="/admin/risk-assessments" className="flex items-center gap-1 text-[10px] text-slate-600 hover:underline font-medium">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <DonutChart data={riskDist} />
        </div>
      </div>

      {/* Location + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Locations */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-bold text-gray-800 mb-4">Reports by Location</p>
          {locationData.length > 0 ? (
            <LocationBars data={locationData} />
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-gray-300">
              <div className="text-4xl">📍</div>
              <p className="text-xs">No location data yet</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-bold text-gray-800 mb-4">Recent Activity</p>
          <div className="space-y-3">
            {recentActivity.slice(0, 6).map((item, i) => (
              <div key={i} className="flex gap-3 items-start group">
                <span className="text-sm flex-shrink-0 mt-0.5 w-6 text-center">{item.icon}</span>
                <div className="flex-1 min-w-0 border-b border-gray-50 pb-2.5 last:border-0 last:pb-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.subtitle}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">
                    {item.time ? new Date(item.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Required */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={15} className="text-red-500" /> Action Required
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: 'High Risk Assessments',
              sub: `${stats.highRiskAssessments || 0} need attention`,
              bg: 'bg-red-50 border-red-100',
              href: '/admin/risk-assessments',
              btnLabel: 'Review',
              dot: 'bg-red-500',
            },
            {
              label: 'Overdue Corrective Actions',
              sub: `${stats.overdueCorrectiveActions || 0} past due`,
              bg: 'bg-rose-50 border-rose-100',
              href: '/admin/reports',
              btnLabel: 'View',
              dot: 'bg-rose-500',
            },
            {
              label: 'Open Reports',
              sub: `${stats.openReports || 0} unresolved`,
              bg: 'bg-amber-50 border-amber-100',
              href: '/admin/reports',
              btnLabel: 'View',
              dot: 'bg-amber-500',
            },
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${item.bg}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full ${item.dot} mt-1.5 flex-shrink-0`} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                </div>
              </div>
              <Link href={item.href}>
                <button className="ml-3 px-3 py-1.5 text-xs font-semibold border border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition flex-shrink-0">
                  {item.btnLabel}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Recent Reports</h2>
          <Link href="/admin/reports" className="flex items-center gap-1 text-xs text-slate-600 hover:underline font-medium">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <Table
          columns={recentReportColumns}
          data={recentReports}
          actions={[{ id: 'view', label: 'View', icon: null }]}
          onActionClick={(action, row) => { window.location.href = `/admin/reports/${row.id}`; }}
          maxHeight="300px"
          itemsPerPage={5}
          emptyMessage="No reports yet"
        />
      </div>
    </div>
  );
}