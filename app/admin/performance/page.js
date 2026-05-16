'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp, Award, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, Shield, ClipboardList,
  FileCheck, Zap, Clock, Star, Activity
} from 'lucide-react';
import SummaryCards from '@/components/SummaryCards';
import FilterBar from '@/components/FilterBar';
import { getEmployeePerformanceData } from '@/lib/localStorage';

// ─── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 56 }) {
  const r = size * 0.38, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const glow = score >= 70 ? '0 0 12px #10b98140' : score >= 40 ? '0 0 12px #f59e0b40' : '0 0 12px #ef444440';
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ filter: `drop-shadow(${glow})` }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={size * 0.1} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.1}
          strokeDasharray={`${circ * (score / 100)} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black leading-none" style={{ color, fontSize: size * 0.22 }}>{score}</span>
      </div>
    </div>
  );
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color = '#64748b', label, done }) {
  const pct = max > 0 ? Math.round((done / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-[11px] font-bold text-slate-700">{done}<span className="text-slate-400 font-normal">/{max}</span></span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'md' }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = [
    'from-blue-500 to-blue-600', 'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-600', 'from-cyan-500 to-sky-600',
  ];
  const bg = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const sz = size === 'lg' ? 'w-12 h-12 text-sm' : 'w-9 h-9 text-xs';
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${bg} flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}>
      {initials}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ score }) {
  if (score >= 70) return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Good</span>;
  if (score >= 40) return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Fair</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Poor</span>;
}

// ─── Stat Tile ────────────────────────────────────────────────────────────────
function StatTile({ icon, label, done, total, color, bg, extra }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className={`rounded-2xl p-4 border ${bg} relative overflow-hidden`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{label}</p>
        </div>
        <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
      </div>
      <div className="flex items-end gap-1.5 mb-3">
        <span className="text-2xl font-black text-slate-800">{done}</span>
        <span className="text-sm text-slate-400 mb-0.5 font-medium">/ {total}</span>
      </div>
      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color.includes('blue') ? '#3b82f6' : color.includes('purple') ? '#8b5cf6' : color.includes('emerald') ? '#10b981' : color.includes('amber') ? '#f59e0b' : color.includes('rose') ? '#f43f5e' : color.includes('cyan') ? '#06b6d4' : '#64748b' }} />
      </div>
      {extra}
    </div>
  );
}

// ─── Expanded Row ──────────────────────────────────────────────────────────────
function ExpandedRow({ emp }) {
  const tiles = [
    {
      icon: <ClipboardList size={14} className="text-blue-600" />,
      label: 'Reports',
      done: emp.closedReports,
      total: emp.totalReports,
      color: 'bg-blue-50 border-blue-100',
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <Shield size={14} className="text-violet-600" />,
      label: 'Risk Assessments',
      done: emp.closedRisks,
      total: emp.totalRisks,
      color: 'bg-violet-50 border-violet-100',
      iconColor: 'bg-violet-100 text-violet-600',
    },
    {
      icon: <Zap size={14} className="text-emerald-600" />,
      label: 'Trainings',
      done: emp.completedTrainings,
      total: emp.totalTrainings,
      color: 'bg-emerald-50 border-emerald-100',
      iconColor: 'bg-emerald-100 text-emerald-600',
    },
    {
      icon: <CheckCircle2 size={14} className="text-amber-600" />,
      label: 'Corrective Actions',
      done: emp.completedActions,
      total: emp.totalActions,
      color: 'bg-amber-50 border-amber-100',
      iconColor: 'bg-amber-100 text-amber-600',
    },
    {
      icon: <FileCheck size={14} className="text-cyan-600" />,
      label: 'Permits',
      done: emp.completedPermits ?? 0,
      total: emp.totalPermits ?? 0,
      color: 'bg-cyan-50 border-cyan-100',
      iconColor: 'bg-cyan-100 text-cyan-600',
    },
    {
      icon: <Activity size={14} className="text-rose-600" />,
      label: 'Inspections',
      done: emp.completedInspections ?? 0,
      total: emp.totalInspections ?? 0,
      color: 'bg-rose-50 border-rose-100',
      iconColor: 'bg-rose-100 text-rose-600',
    },
  ];

  return (
    <div className="border-t border-slate-100 bg-slate-50/80">
      {/* Header strip */}
      <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3 border-b border-slate-100">
        <Avatar name={emp.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800">{emp.name}</p>
          <p className="text-[11px] text-slate-500">{emp.designation} · {emp.department}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ScoreRing score={emp.performanceScore} size={52} />
          <div>
            <Badge score={emp.performanceScore} />
            {emp.overdueActions > 0 && (
              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-red-600">
                <Clock size={10} />
                {emp.overdueActions} overdue
              </div>
            )}
            {emp.avgTrainingScore && (
              <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <Star size={10} className="text-amber-500" />
                Avg score: {emp.avgTrainingScore}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tiles grid */}
      <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiles.map(t => (
          <div key={t.label} className={`rounded-2xl p-3.5 border ${t.color} relative overflow-hidden`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2.5 ${t.iconColor}`}>
              {t.icon}
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.label}</p>
            <div className="flex items-end gap-1">
              <span className="text-xl font-black text-slate-800">{t.done}</span>
              <span className="text-xs text-slate-400 mb-0.5">/ {t.total}</span>
            </div>
            <div className="mt-2 h-1 bg-white/70 rounded-full overflow-hidden">
              <div className="h-full rounded-full"
                style={{
                  width: `${t.total > 0 ? Math.round((t.done / t.total) * 100) : 0}%`,
                  background: t.iconColor.includes('blue') ? '#3b82f6' : t.iconColor.includes('violet') ? '#8b5cf6' : t.iconColor.includes('emerald') ? '#10b981' : t.iconColor.includes('amber') ? '#f59e0b' : t.iconColor.includes('cyan') ? '#06b6d4' : '#f43f5e'
                }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mobile Card ──────────────────────────────────────────────────────────────
function MobileCard({ emp, isExpanded, onToggle }) {
  const scoreColor = emp.performanceScore >= 70 ? 'text-emerald-600' : emp.performanceScore >= 40 ? 'text-amber-600' : 'text-red-600';
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar name={emp.name} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{emp.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{emp.designation}</p>
            <p className="text-[10px] text-slate-400">{emp.department}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ScoreRing score={emp.performanceScore} size={48} />
            <Badge score={emp.performanceScore} />
          </div>
        </div>

        {/* Mini stats row */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: 'Reports', val: `${emp.closedReports}/${emp.totalReports}` },
            { label: 'Risks', val: `${emp.closedRisks}/${emp.totalRisks}` },
            { label: 'Actions', val: `${emp.completedActions}/${emp.totalActions}` },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-2 text-center">
              <p className="text-[9px] font-semibold text-slate-400 uppercase">{s.label}</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">{s.val}</p>
            </div>
          ))}
        </div>

        {emp.overdueActions > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
            <Clock size={11} />
            {emp.overdueActions} overdue corrective action{emp.overdueActions > 1 ? 's' : ''}
          </div>
        )}

        <button
          onClick={onToggle}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 py-2 rounded-xl transition-colors"
        >
          {isExpanded ? <><ChevronUp size={13} /> Hide Details</> : <><ChevronDown size={13} /> View Details</>}
        </button>
      </div>

      {isExpanded && <ExpandedRow emp={emp} />}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PerformancePage() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ search: '', department: 'All department', designation: 'All designation' });
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState('performanceScore');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData(getEmployeePerformanceData());
    setLoading(false);
  }, []);

  const filtered = useMemo(() => {
    let r = [...data];
    if (filters.search) {
      const t = filters.search.toLowerCase();
      r = r.filter(e => [e.name, e.email, e.designation, e.department].some(f => f?.toLowerCase().includes(t)));
    }
    if (filters.department !== 'All department') r = r.filter(e => e.department === filters.department);
    if (filters.designation !== 'All designation') r = r.filter(e => e.designation === filters.designation);
    return [...r].sort((a, b) => sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]);
  }, [data, filters, sortBy, sortDir]);

  const departments = ['All department', ...new Set(data.map(e => e.department).filter(Boolean))];
  const designations = ['All designation', ...new Set(data.map(e => e.designation).filter(Boolean))];

  const avgScore = filtered.length > 0
    ? Math.round(filtered.reduce((s, e) => s + e.performanceScore, 0) / filtered.length) : 0;
  const topPerformer = [...filtered].sort((a, b) => b.performanceScore - a.performanceScore)[0];
  const totalOverdue = filtered.reduce((s, e) => s + (e.overdueActions || 0), 0);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortBtn = ({ col }) => (
    <span className="inline-flex ml-1">
      {sortBy === col
        ? (sortDir === 'desc' ? <ChevronDown size={12} className="text-white" /> : <ChevronUp size={12} className="text-white" />)
        : <ChevronDown size={12} className="text-slate-400" />}
    </span>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading performance data…</p>
        </div>
      </div>
    );
  }

  const cols = [
    { label: 'Employee', col: 'name' },
    { label: 'Dept', col: 'department' },
    { label: 'Reports', col: 'totalReports' },
    { label: 'Risks', col: 'totalRisks' },
    { label: 'Trainings', col: 'totalTrainings' },
    { label: 'Actions', col: 'totalActions' },
    { label: 'Permits', col: 'totalPermits' },
    { label: 'Inspections', col: 'totalInspections' },
    { label: 'Score', col: 'performanceScore' },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 ml-10">Employee safety performance tracking & scoring</p>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards cards={[
        { icon: <TrendingUp size={18} className="text-blue-600" />, label: 'Team Avg Score', value: avgScore, color: 'text-blue-600', bg: 'bg-blue-50' },
        { icon: <Award size={18} className="text-emerald-600" />, label: 'Top Performer', value: topPerformer?.name?.split(' ')[0] || '—', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { icon: <CheckCircle2 size={18} className="text-violet-600" />, label: 'Employees Tracked', value: filtered.length, color: 'text-violet-600', bg: 'bg-violet-50' },
        { icon: <AlertTriangle size={18} className="text-red-600" />, label: 'Overdue Actions', value: totalOverdue, color: 'text-red-600', bg: 'bg-red-50' },
      ]} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        showReportType={false}
        showCategory={false}
        showEmployee={false}
        showStatus={false}
        showDepartment={true}
        showDesignation={true}
        showSearch={true}
        departments={departments}
        designations={designations}
      />

      {/* ── DESKTOP TABLE ─────────────────────────────────────────────── */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 via-slate-800 to-slate-700">
                {cols.map(h => (
                  <th key={h.col} onClick={() => toggleSort(h.col)}
                    className="px-4 py-3.5 text-left text-[10px] font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition select-none whitespace-nowrap">
                    <span className="flex items-center gap-0.5">{h.label}<SortBtn col={h.col} /></span>
                  </th>
                ))}
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-sm text-slate-400">No employees found</td>
                </tr>
              ) : filtered.map(emp => {
                const isExp = expanded === emp.id;
                return (
                  <>
                    <tr key={emp.id} className={`hover:bg-slate-50/80 transition-colors ${isExp ? 'bg-slate-50/50' : ''}`}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={emp.name} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{emp.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">{emp.department}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold text-slate-700">{emp.closedReports}</span>
                        <span className="text-[10px] text-slate-400">/{emp.totalReports}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold text-slate-700">{emp.closedRisks}</span>
                        <span className="text-[10px] text-slate-400">/{emp.totalRisks}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold text-slate-700">{emp.completedTrainings}</span>
                        <span className="text-[10px] text-slate-400">/{emp.totalTrainings}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-700">{emp.completedActions}</span>
                          <span className="text-[10px] text-slate-400">/{emp.totalActions}</span>
                          {emp.overdueActions > 0 && (
                            <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold border border-red-200">
                              {emp.overdueActions} late
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold text-slate-700">{emp.completedPermits ?? 0}</span>
                        <span className="text-[10px] text-slate-400">/{emp.totalPermits ?? 0}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold text-slate-700">{emp.completedInspections ?? 0}</span>
                        <span className="text-[10px] text-slate-400">/{emp.totalInspections ?? 0}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <ScoreRing score={emp.performanceScore} size={44} />
                          <Badge score={emp.performanceScore} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setExpanded(isExp ? null : emp.id)}
                          className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${isExp ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                          {isExp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {isExp ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {isExp && (
                      <tr key={`${emp.id}-expanded`}>
                        <td colSpan={10} className="p-0">
                          <ExpandedRow emp={emp} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE CARDS ──────────────────────────────────────────────── */}
      <div className="lg:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-12 text-center text-sm text-slate-400">
            No employees found
          </div>
        ) : filtered.map(emp => (
          <MobileCard
            key={emp.id}
            emp={emp}
            isExpanded={expanded === emp.id}
            onToggle={() => setExpanded(expanded === emp.id ? null : emp.id)}
          />
        ))}
      </div>

      {/* Score Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
        <span className="font-bold text-slate-600 flex items-center gap-1.5"><Star size={12} className="text-amber-500" /> Score legend</span>
        {[['#10b981', '70–100 · Good'], ['#f59e0b', '40–69 · Fair'], ['#ef4444', '0–39 · Poor']].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />{l}
          </div>
        ))}
        <span className="text-slate-300 hidden sm:inline">·</span>
        <span className="text-[11px] text-slate-400 leading-tight">Weighted: Reports 25% · Risks 25% · Trainings 20% · Actions 15% · Permits 10% · Inspections 5%</span>
      </div>
    </div>
  );
}