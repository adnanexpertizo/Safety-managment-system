'use client';

import { useEffect, useState, useMemo } from 'react';
import { Award, CheckCircle2, Clock, Eye } from 'lucide-react';

import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import SummaryCards from '@/components/SummaryCards';

import { getLocalTrainings } from '@/lib/localStorage';
import { useUser } from '@/context/UserContext';

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Completed: { cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={10} /> },
    Scheduled: { cls: 'bg-blue-100 text-blue-700', icon: <Clock size={10} /> },
    Cancelled: { cls: 'bg-red-100 text-red-700', icon: null },
  };
  const s = map[status] || map.Scheduled;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${s.cls}`}>
      {s.icon} {status}
    </span>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score }) {
  if (!score) return <span className="text-gray-300 text-xs">—</span>;
  const pct = Math.min(Number(score), 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700">{score}%</span>
    </div>
  );
}

// ─── View Training Modal ──────────────────────────────────────────────────────
function ViewTrainingModal({ training }) {
  if (!training) return null;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={training.status} />
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] rounded-full font-semibold">{training.department}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          ['Department', training.department],
          ['Trainer', training.trainer],
          ['Date', training.date ? new Date(training.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'],
          ['Duration', training.duration],
          ['Participants', training.participants ?? '—'],
          ['Status', training.status],
        ].map(([l, v]) => (
          <div key={l} className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{l}</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{v || '—'}</p>
          </div>
        ))}
      </div>

      {training.status === 'Completed' && training.score && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Training Score</p>
          <div className="flex items-center gap-4">
            <ScoreBar score={training.score} />
            <span className={`text-sm font-bold ${Number(training.score) >= 80 ? 'text-emerald-600' : Number(training.score) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
              {Number(training.score) >= 80 ? 'Excellent' : Number(training.score) >= 60 ? 'Satisfactory' : 'Needs Improvement'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const DEPT_OPTIONS = ['All', 'Electrical', 'Mechanical', 'HSE', 'Operations', 'Administration'];

export default function OfficerTraining() {
  const { user } = useUser();
  const [trainings, setTrainings] = useState([]);
  const [filters, setFilters] = useState({ status: '', department: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState({ isOpen: false, training: null });

  useEffect(() => {
    if (!user) return;
    // Officer sees trainings where they are the trainer
    const all = getLocalTrainings();
    setTrainings(all.filter(t => t.trainerId === user.id));
    setLoading(false);
  }, [user]);

  const filteredTrainings = useMemo(() => {
    let r = [...trainings];
    if (filters.status) r = r.filter(t => t.status === filters.status);
    if (filters.department) r = r.filter(t => t.department === filters.department);
    if (filters.search) {
      const t = filters.search.toLowerCase();
      r = r.filter(x => [x.title, x.trainer, x.department].some(f => f?.toLowerCase().includes(t)));
    }
    return r;
  }, [trainings, filters]);

  const completed = filteredTrainings.filter(t => t.status === 'Completed').length;
  const scheduled = filteredTrainings.filter(t => t.status === 'Scheduled').length;
  const scores = filteredTrainings.filter(t => t.score);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((s, t) => s + Number(t.score), 0) / scores.length)
    : 0;

  const statusFilterOpts = [
    { value: '', label: 'All Statuses' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  const columns = [
    { key: 'title', label: 'Training Title', className: 'min-w-[200px] font-medium' },
    { key: 'department', label: 'Department', className: 'min-w-[120px]' },
    {
      key: 'date', label: 'Date', type: 'date', className: 'min-w-[110px]',
    },
    { key: 'duration', label: 'Duration', className: 'min-w-[100px]' },
    {
      key: 'participants', label: 'Participants',
      render: r => (
        <span className="inline-flex items-center gap-1 text-xs text-gray-700">
          👥 {r.participants ?? '—'}
        </span>
      ),
    },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'score', label: 'Score', render: r => <ScoreBar score={r.score} /> },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award size={20} className="text-slate-600" /> My Trainings
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Training sessions conducted by you</p>
        </div>
      </div>

      {/* Summary */}
      <SummaryCards cards={[
        { icon: '📊', label: 'Total', value: filteredTrainings.length, color: 'text-gray-800' },
        { icon: '✅', label: 'Completed', value: completed, color: 'text-emerald-600' },
        { icon: '⏳', label: 'Scheduled', value: scheduled, color: 'text-blue-600' },
        { icon: '📈', label: 'Avg Score', value: avgScore ? `${avgScore}%` : '—', color: 'text-amber-600' },
      ]} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        showReportType={false}
        showCategory={false}
        showEmployee={false}
        showDepartment={true}
        showStatus={true}
        customStatusOptions={statusFilterOpts}
        departments={DEPT_OPTIONS}
      />

      {/* Table */}
      <Table
        columns={columns}
        data={filteredTrainings}
        actions={[{ id: 'view', label: 'View', icon: Eye }]}
        onActionClick={(action, row) => {
          if (action === 'view') setViewModal({ isOpen: true, training: row });
        }}
        maxHeight="calc(100vh - 420px)"
        className="min-w-[700px]"
        emptyMessage="No trainings found for your account."
      />

      {/* View Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, training: null })}
        title={viewModal.training?.title || 'Training Details'}
        size="lg"
      >
        <ViewTrainingModal training={viewModal.training} />
      </Modal>
    </div>
  );
}