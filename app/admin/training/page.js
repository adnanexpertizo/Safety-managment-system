'use client';

import { useEffect, useState, useMemo } from 'react';
import { Edit, Trash2, Award, Plus, CheckCircle2, Clock } from 'lucide-react';

import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';
import SummaryCards from '@/components/SummaryCards';

import {
  getLocalTrainings, addLocalTraining, updateLocalTraining,
  deleteLocalTraining, getLocalUsers,
} from '@/lib/localStorage';

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

const INPUT_CLS = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:outline-none transition hover:border-gray-300'
  ;

const EMPTY_FORM = {
  title: '', department: '', trainerId: '', trainer: '',
  date: '', duration: '', participants: 0, status: 'Scheduled', score: '',
};

const DEPT_OPTIONS = [
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Mechanical', label: 'Mechanical' },
  { value: 'HSE', label: 'HSE' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Administration', label: 'Administration' },
];

export default function AdminTrainings() {
  const [trainings, setTrainings] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ status: '', department: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });
  const [formData, setFormData] = useState(EMPTY_FORM);

  const refresh = () => setTrainings(getLocalTrainings());

  useEffect(() => {
    refresh();
    setUsers(Array.isArray(getLocalUsers()) ? getLocalUsers() : []);
    setLoading(false);
  }, []);

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

  const openModal = (item = null) => {
    setEditingTraining(item);
    setFormData(item ? { ...EMPTY_FORM, ...item, score: item.score ?? '' } : EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleTrainerSelect = (id) => {
    const trainer = users.find(u => u.id === id);
    setFormData(p => ({ ...p, trainerId: id, trainer: trainer?.name || '' }));
  };

  const handleSubmit = () => {
    if (!formData.title) return;
    if (editingTraining) updateLocalTraining(editingTraining.id, formData);
    else addLocalTraining(formData);
    refresh();
    setIsModalOpen(false);
  };

  const f = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const deptFilters = ['All', ...new Set(trainings.map(t => t.department).filter(Boolean))];
  const statusFilterOpts = [
    { value: '', label: 'All Statuses' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  const columns = [
    { key: 'title', label: 'Training Title', className: 'min-w-[200px] font-medium' },
    { key: 'department', label: 'Department', className: 'min-w-[120px]' },
    { key: 'trainer', label: 'Trainer', className: 'min-w-[130px]' },
    { key: 'date', label: 'Date', type: 'date', className: 'min-w-[110px]' },
    { key: 'duration', label: 'Duration', className: 'min-w-[100px]' },
    {
      key: 'participants', label: 'Participants',
      render: r => (
        <span className="inline-flex items-center gap-1 text-xs text-gray-700">
          👥 {r.participants ?? '—'}
        </span>
      )
    },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'score', label: 'Score', render: r => <ScoreBar score={r.score} /> },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-slate-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">

        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Award size={20} className="text-slate-600" /> Training & Compliance
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Employee Safety Training Management</p>
          </div>
          <Button onClick={() => openModal()} className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm flex-shrink-0">
            <Plus size={15} /> <span className="hidden sm:inline">New Training</span><span className="sm:hidden">New</span>
          </Button>
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
          departments={deptFilters}
        />

        {/* Table */}
        <Table
          columns={columns}
          data={filteredTrainings}
          actions={[
            { id: 'edit', label: 'Edit', icon: Edit },
            { id: 'delete', label: 'Delete', icon: Trash2 },
          ]}
          onActionClick={(action, row) => {
            if (action === 'edit') openModal(row);
            if (action === 'delete') setDeleteModal({ isOpen: true, id: row.id, title: row.title });
          }}
          maxHeight="calc(100vh - 420px)"
          className="min-w-[800px]"
          emptyMessage="No trainings found. Schedule your first training!"
        />

        {/* Add/Edit Modal */}


        {/* Delete Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: null, title: '' })}
          title="Delete Training"
          size="sm"
          footerActions={[
            { label: 'Cancel', variant: 'secondary', onClick: () => setDeleteModal({ isOpen: false, id: null, title: '' }) },
            { label: 'Delete', variant: 'danger', onClick: () => { deleteLocalTraining(deleteModal.id); refresh(); setDeleteModal({ isOpen: false, id: null, title: '' }); } },
          ]}
        >
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Delete "{deleteModal.title}"?</p>
              <p className="text-xs text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
          </div>
        </Modal>

      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTraining ? 'Edit Training' : 'New Training'}
        size="lg"
        footerActions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setIsModalOpen(false) },
          { label: editingTraining ? 'Update Training' : 'Schedule Training', variant: 'primary', onClick: handleSubmit },
        ]}
      >
        <div className="space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Training Title <span className="text-red-500">*</span>
            </label>
            <input
              value={formData.title}
              onChange={e => f('title', e.target.value)}
              placeholder="e.g. Fire Safety & Evacuation Procedures"
              className={INPUT_CLS}
            />
          </div>

          {/* Department + Trainer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect
              label="Department"
              value={formData.department}
              onChange={v => f('department', v)}
              options={DEPT_OPTIONS}
              placeholder="Select department..."
            />
            <CustomSelect
              label="Trainer"
              value={formData.trainerId}
              onChange={handleTrainerSelect}
              options={users.map(u => ({ value: u.id, label: `${u.name} — ${u.designation}` }))}
              placeholder="Select trainer..."
            />
          </div>

          {/* Date + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Training Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => f('date', e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
              <input
                value={formData.duration}
                onChange={e => f('duration', e.target.value)}
                placeholder="e.g. 4 hours, 2 days"
                className={INPUT_CLS}
              />
            </div>
          </div>

          {/* Participants + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">No. of Participants</label>
              <input
                type="number"
                min="0"
                value={formData.participants}
                onChange={e => f('participants', Number(e.target.value))}
                placeholder="0"
                className={INPUT_CLS}
              />
            </div>
            <CustomSelect
              label="Status"
              value={formData.status}
              onChange={v => f('status', v)}
              options={[
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' },
              ]}
            />
          </div>

          {/* Score — only when Completed */}
          {formData.status === 'Completed' && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Average Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={e => f('score', Number(e.target.value))}
                  placeholder="Enter average score (0–100)"
                  className={INPUT_CLS}
                />
              </div>
              {formData.score > 0 && <ScoreBar score={formData.score} />}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}