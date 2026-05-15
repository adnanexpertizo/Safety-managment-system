'use client';

import { useEffect, useState, useMemo } from 'react';
import { TrendingUp, Award, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

import SummaryCards from '@/components/SummaryCards';
import FilterBar from '@/components/FilterBar';
import { getEmployeePerformanceData } from '@/lib/localStorage';

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 56 }) {
  const r = size * 0.38, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={size * 0.1} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.1}
          strokeDasharray={`${circ * (score / 100)} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-black leading-none" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

// ─── Mini Bar ─────────────────────────────────────────────────────────────────
function MiniBar({ value, max, color = 'bg-slate-600' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-gray-500 w-6 text-right">{value}</span>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const bg = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Expanded Row ─────────────────────────────────────────────────────────────
function ExpandedRow({ emp }) {
  const stats = [
    { label: 'Reports Assigned', total: emp.totalReports, done: emp.closedReports, color: 'bg-blue-500' },
    { label: 'Risk Assessments', total: emp.totalRisks, done: emp.closedRisks, color: 'bg-purple-500' },
    { label: 'Trainings Conducted', total: emp.totalTrainings, done: emp.completedTrainings, color: 'bg-emerald-500' },
    { label: 'Corrective Actions', total: emp.totalActions, done: emp.completedActions, color: 'bg-amber-500' },
  ];

  return (
    <div className="px-5 pb-5 pt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 border-t border-gray-100">
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{s.label}</p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-xl font-black text-gray-900">{s.done}</span>
            <span className="text-xs text-gray-400 mb-0.5">/ {s.total}</span>
          </div>
          <MiniBar value={s.done} max={s.total} color={s.color} />
        </div>
      ))}

      {emp.avgTrainingScore && (
        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Avg Training Score</p>
          <p className="text-xl font-black text-gray-900">{emp.avgTrainingScore}%</p>
          <MiniBar value={emp.avgTrainingScore} max={100} color="bg-emerald-500" />
        </div>
      )}

      {emp.overdueActions > 0 && (
        <div className="bg-red-50 rounded-xl p-3.5 border border-red-100">
          <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-2">Overdue Actions</p>
          <p className="text-xl font-black text-red-600">{emp.overdueActions}</p>
          <p className="text-[10px] text-red-400 mt-1">Past due date</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PerformancePage() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ search: '', department: 'All', designation: 'All' });
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
      r = r.filter(e =>
        [e.name, e.email, e.designation, e.department].some(f => f?.toLowerCase().includes(t))
      );
    }
    if (filters.department !== 'All') r = r.filter(e => e.department === filters.department);
    if (filters.designation !== 'All') r = r.filter(e => e.designation === filters.designation);

    return [...r].sort((a, b) =>
      sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]
    );
  }, [data, filters, sortBy, sortDir]);

  const departments = ['All', ...new Set(data.map(e => e.department).filter(Boolean))];
  const designations = ['All', ...new Set(data.map(e => e.designation).filter(Boolean))];

  const avgScore = filtered.length > 0
    ? Math.round(filtered.reduce((s, e) => s + e.performanceScore, 0) / filtered.length)
    : 0;

  const topPerformer = [...filtered].sort((a, b) => b.performanceScore - a.performanceScore)[0];
  const totalOverdue = filtered.reduce((s, e) => s + e.overdueActions, 0);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => sortBy === col
    ? (sortDir === 'desc' ? <ChevronDown size={13} className="text-slate-600" /> : <ChevronUp size={13} className="text-slate-600" />)
    : <ChevronDown size={13} className="text-gray-300" />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp size={20} className="text-slate-600" /> Performance
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Employee safety performance tracking & scoring</p>
      </div>

      <SummaryCards cards={[
        { icon: <TrendingUp size={18} className="text-blue-600" />, label: 'Team Avg Score', value: avgScore, color: 'text-blue-600', bg: 'bg-blue-50' },
        { icon: <Award size={18} className="text-emerald-600" />, label: 'Top Performer', value: topPerformer?.name?.split(' ')[0] || '—', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { icon: <CheckCircle2 size={18} className="text-purple-600" />, label: 'Employees Tracked', value: filtered.length, color: 'text-purple-600', bg: 'bg-purple-50' },
        { icon: <AlertTriangle size={18} className="text-red-600" />, label: 'Overdue Actions', value: totalOverdue, color: 'text-red-600', bg: 'bg-red-50' },
      ]} />

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

      {/* Performance Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-700">
                {[
                  { label: 'Employee', col: 'name' },
                  { label: 'Department', col: 'department' },
                  { label: 'Reports', col: 'totalReports' },
                  { label: 'Risks', col: 'totalRisks' },
                  { label: 'Trainings', col: 'totalTrainings' },
                  { label: 'Actions', col: 'totalActions' },
                  { label: 'Score', col: 'performanceScore' },
                ].map(h => (
                  <th key={h.col} onClick={() => toggleSort(h.col)}
                    className="px-4 py-3 text-left text-[10px] font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition select-none whitespace-nowrap">
                    <div className="flex items-center gap-1">{h.label} <SortIcon col={h.col} /></div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400">No employees found</td>
                </tr>
              ) : filtered.map(emp => {
                const isExp = expanded === emp.id;
                const scoreColor = emp.performanceScore >= 70 ? 'text-emerald-600' : emp.performanceScore >= 40 ? 'text-amber-600' : 'text-red-600';

                return (
                  <>
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={emp.name} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{emp.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{emp.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">{emp.department}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs text-gray-700">
                          <span className="font-semibold">{emp.closedReports}</span>
                          <span className="text-gray-400">/{emp.totalReports}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs text-gray-700">
                          <span className="font-semibold">{emp.closedRisks}</span>
                          <span className="text-gray-400">/{emp.totalRisks}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs text-gray-700">
                          <span className="font-semibold">{emp.completedTrainings}</span>
                          <span className="text-gray-400">/{emp.totalTrainings}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="text-xs text-gray-700">
                            <span className="font-semibold">{emp.completedActions}</span>
                            <span className="text-gray-400">/{emp.totalActions}</span>
                          </div>
                          {emp.overdueActions > 0 && (
                            <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">
                              {emp.overdueActions} late
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <ScoreRing score={emp.performanceScore} size={40} />
                          <span className={`text-xs font-bold ${scoreColor}`}>
                            {emp.performanceScore >= 70 ? 'Good' : emp.performanceScore >= 40 ? 'Fair' : 'Poor'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setExpanded(isExp ? null : emp.id)}
                          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
                        >
                          {isExp ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {isExp ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {isExp && (
                      <tr>
                        <td colSpan={8} className="p-0">
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

      {/* Score Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="font-semibold text-gray-600">Score legend:</span>
        {[
          ['bg-emerald-500', '70–100: Good'],
          ['bg-amber-500', '40–69: Fair'],
          ['bg-red-500', '0–39: Poor']
        ].map(([cls, lbl]) => (
          <div key={lbl} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />{lbl}
          </div>
        ))}
        <span className="text-gray-400">• Score = weighted avg of closed reports (30%), risks (30%), training (20%), actions (20%)</span>
      </div>
    </div>
  );
}