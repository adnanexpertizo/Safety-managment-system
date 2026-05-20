'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp, Award, AlertTriangle, CheckCircle2,
  Shield, ClipboardList, FileCheck, Zap, Clock, Star, Activity,
} from 'lucide-react';
import SummaryCards from '@/components/SummaryCards';
import { getEmployeePerformanceData } from '@/lib/localStorage';
import { useUser } from '@/context/UserContext';

function ScoreRing({ score, size = 80 }) {
  const r = size * 0.38, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const glow = score >= 70 ? '0 0 16px #10b98150' : score >= 40 ? '0 0 16px #f59e0b50' : '0 0 16px #ef444450';
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ filter: `drop-shadow(${glow})` }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={size * 0.1} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.1}
          strokeDasharray={`${circ * (score / 100)} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black leading-none" style={{ color, fontSize: size * 0.22 }}>{score}</span>
        <span className="text-gray-400 font-medium" style={{ fontSize: size * 0.1 }}>SCORE</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, done, max, color }) {
  const pct = max > 0 ? Math.round((done / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-[12px] font-bold text-slate-700">{done}<span className="text-slate-400 font-normal">/{max}</span> <span className="text-[10px] text-slate-400">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function Badge({ score }) {
  if (score >= 70) return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Good</span>;
  if (score >= 40) return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Fair</span>;
  return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Poor</span>;
}

function StatTile({ icon, label, done, total, color, bg, iconColor }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className={`rounded-2xl p-4 border ${bg} relative overflow-hidden`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconColor}`}>{icon}</div>
        <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end gap-1 mb-2">
        <span className="text-2xl font-black text-slate-800">{done}</span>
        <span className="text-sm text-slate-400 mb-0.5 font-medium">/ {total}</span>
      </div>
      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function OfficerPerformance() {
  const { user } = useUser();
  const [empData, setEmpData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const allPerf = getEmployeePerformanceData();
    const mine = allPerf.find(e => e.id === user.id);
    setEmpData(mine || null);
    setLoading(false);
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading your performance...</p>
      </div>
    </div>
  );

  if (!empData) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-sm text-gray-400">No performance data found for your account.</p>
    </div>
  );

  const score = empData.performanceScore || 0;
  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  const tiles = [
    { icon: <ClipboardList size={16} className="text-blue-600" />, label: 'Reports', done: empData.closedReports, total: empData.totalReports, color: '#3b82f6', bg: 'bg-blue-50 border-blue-100', iconColor: 'bg-blue-100 text-blue-600' },
    { icon: <Shield size={16} className="text-violet-600" />, label: 'Risk Assessments', done: empData.closedRisks, total: empData.totalRisks, color: '#8b5cf6', bg: 'bg-violet-50 border-violet-100', iconColor: 'bg-violet-100 text-violet-600' },
    { icon: <Zap size={16} className="text-emerald-600" />, label: 'Trainings', done: empData.completedTrainings, total: empData.totalTrainings, color: '#10b981', bg: 'bg-emerald-50 border-emerald-100', iconColor: 'bg-emerald-100 text-emerald-600' },
    { icon: <CheckCircle2 size={16} className="text-amber-600" />, label: 'Corrective Actions', done: empData.completedActions, total: empData.totalActions, color: '#f59e0b', bg: 'bg-amber-50 border-amber-100', iconColor: 'bg-amber-100 text-amber-600' },
    { icon: <FileCheck size={16} className="text-cyan-600" />, label: 'Permits', done: empData.completedPermits ?? 0, total: empData.totalPermits ?? 0, color: '#06b6d4', bg: 'bg-cyan-50 border-cyan-100', iconColor: 'bg-cyan-100 text-cyan-600' },
    { icon: <Activity size={16} className="text-rose-600" />, label: 'Inspections', done: empData.completedInspections ?? 0, total: empData.totalInspections ?? 0, color: '#f43f5e', bg: 'bg-rose-50 border-rose-100', iconColor: 'bg-rose-100 text-rose-600' },
  ];

  const initials = empData.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          My Performance
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5 ml-10">Your personal safety performance & achievement breakdown</p>
      </div>

      {/* Summary Cards */}
      <SummaryCards cards={[
        { icon: <TrendingUp size={18} className="text-blue-600" />, label: 'My Score', value: score, color: 'text-blue-600', bg: 'bg-blue-50' },
        { icon: <Award size={18} className="text-emerald-600" />, label: 'Trainings Done', value: empData.completedTrainings, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { icon: <CheckCircle2 size={18} className="text-violet-600" />, label: 'Actions Completed', value: empData.completedActions, color: 'text-violet-600', bg: 'bg-violet-50' },
        { icon: <AlertTriangle size={18} className="text-red-600" />, label: 'Overdue Actions', value: empData.overdueActions || 0, color: 'text-red-600', bg: 'bg-red-50' },
      ]} />

      {/* Profile + Score card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-black shadow-lg flex-shrink-0">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-black text-slate-900">{empData.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{empData.designation}</p>
              <p className="text-xs text-slate-400 mt-0.5">{empData.department} · {empData.email}</p>
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                <Badge score={score} />
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full capitalize">{empData.role?.toLowerCase()}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">{empData.status || 'Active'}</span>
              </div>
            </div>

            {/* Score Ring */}
            <div className="flex flex-col items-center gap-3">
              <ScoreRing score={score} size={100} />
              <p className="text-sm font-bold" style={{ color: scoreColor }}>
                {score >= 70 ? 'Excellent Performance' : score >= 40 ? 'Good Performance' : 'Needs Improvement'}
              </p>
            </div>
          </div>

          {/* Overdue warning */}
          {empData.overdueActions > 0 && (
            <div className="mt-5 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
              <Clock size={16} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-700">
                  {empData.overdueActions} overdue corrective action{empData.overdueActions > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-red-500 mt-0.5">Please address these immediately to improve your score</p>
              </div>
            </div>
          )}

          {/* Avg training score */}
          {empData.avgTrainingScore && (
            <div className="mt-3 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <Star size={16} className="text-amber-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-amber-700">Average training score: <strong>{empData.avgTrainingScore}%</strong></p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Tiles */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3">Activity Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {tiles.map(t => <StatTile key={t.label} {...t} />)}
        </div>
      </div>

      {/* Progress Bars */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-5">Completion Progress</h3>
        <div className="space-y-4">
          <ProgressBar label="Reports Closed" done={empData.closedReports} max={empData.totalReports} color="#3b82f6" />
          <ProgressBar label="Risks Closed" done={empData.closedRisks} max={empData.totalRisks} color="#8b5cf6" />
          <ProgressBar label="Trainings Completed" done={empData.completedTrainings} max={empData.totalTrainings} color="#10b981" />
          <ProgressBar label="Actions Completed" done={empData.completedActions} max={empData.totalActions} color="#f59e0b" />
          <ProgressBar label="Permits Completed" done={empData.completedPermits ?? 0} max={empData.totalPermits ?? 0} color="#06b6d4" />
          <ProgressBar label="Inspections Completed" done={empData.completedInspections ?? 0} max={empData.totalInspections ?? 0} color="#f43f5e" />
        </div>
      </div>

      {/* Score Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
        <span className="font-bold text-slate-600 flex items-center gap-1.5"><Star size={12} className="text-amber-500" /> Score legend</span>
        {[['#10b981', '70–100 · Excellent'], ['#f59e0b', '40–69 · Good'], ['#ef4444', '0–39 · Needs Work']].map(([c, l]) => (
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