'use client';

import { useEffect, useState, useMemo } from 'react';
import { ClipboardCheck, Plus, Edit, Trash2, Eye, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';
import SummaryCards from '@/components/SummaryCards';
import {
  getLocalInspections, addLocalInspection, updateLocalInspection,
  deleteLocalInspection, getLocalUsers,
} from '@/lib/localStorage';

const INPUT_CLS = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:outline-none transition hover:border-gray-300';

const INSPECTION_TYPES = ['Fire Safety', 'Equipment Audit', 'General Safety', 'Environmental', 'Electrical Safety', 'Chemical Safety', 'Emergency Preparedness', 'PPE Compliance'];

function StatusBadge({ status }) {
  const map = {
    scheduled: { cls: 'bg-blue-100 text-blue-700', icon: <Clock size={10} />, label: 'Scheduled' },
    'in-progress': { cls: 'bg-amber-100 text-amber-700', icon: <AlertCircle size={10} />, label: 'In Progress' },
    completed: { cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={10} />, label: 'Completed' },
    cancelled: { cls: 'bg-red-100 text-red-700', icon: <XCircle size={10} />, label: 'Cancelled' },
  };
  const s = map[status] || map.scheduled;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

function ScoreBar({ score, total }) {
  if (score === null || score === undefined) return <span className="text-gray-300 text-xs">—</span>;
  const pct = Math.min(Number(score), 100);
  const color = pct >= 85 ? 'bg-emerald-500' : pct >= 65 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 flex-shrink-0">{score}%</span>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewInspectionModal({ inspection, onEdit }) {
  if (!inspection) return null;
  const passRate = inspection.totalItems > 0
    ? Math.round((inspection.passedItems / inspection.totalItems) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={inspection.status} />
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] rounded-full font-semibold">{inspection.type}</span>
        {inspection.score !== null && inspection.score !== undefined && (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${inspection.score >= 85 ? 'bg-emerald-100 text-emerald-700' : inspection.score >= 65 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
            Score: {inspection.score}%
          </span>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          ['Location', inspection.location],
          ['Inspector', inspection.inspector],
          ['Scheduled Date', inspection.scheduledDate ? new Date(inspection.scheduledDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'],
          ['Completed Date', inspection.completedDate ? new Date(inspection.completedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not yet'],
        ].map(([l, v]) => (
          <div key={l} className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{l}</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{v || '—'}</p>
          </div>
        ))}
      </div>

      {/* Score breakdown */}
      {inspection.status === 'completed' && inspection.totalItems > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Inspection Results</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
              <p className="text-lg font-black text-gray-900">{inspection.totalItems}</p>
              <p className="text-[10px] text-gray-500 font-medium">Total Items</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
              <p className="text-lg font-black text-emerald-600">{inspection.passedItems}</p>
              <p className="text-[10px] text-emerald-600 font-medium">Passed</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
              <p className="text-lg font-black text-red-600">{inspection.failedItems}</p>
              <p className="text-[10px] text-red-600 font-medium">Failed</p>
            </div>
          </div>
          {/* Pass rate bar */}
          <div>
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>Pass Rate</span><span className="font-semibold">{passRate}%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${passRate >= 85 ? 'bg-emerald-500' : passRate >= 65 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${passRate}%` }} />
            </div>
          </div>
        </div>
      )}

      {[['Findings', inspection.findings], ['Recommendations', inspection.recommendations]].filter(([, v]) => v).map(([l, v]) => (
        <div key={l}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{l}</p>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{v}</p>
        </div>
      ))}

      <div className="flex justify-end">
        <Button onClick={onEdit} variant="outline" size="sm" className="flex items-center gap-1.5">
          <Edit size={13} /> Edit Inspection
        </Button>
      </div>
    </div>
  );
}

const EMPTY = {
  title: '', type: 'Fire Safety', location: '', inspector: '',
  inspectorId: '', scheduledDate: '', completedDate: '',
  status: 'scheduled', score: '', totalItems: 0,
  passedItems: 0, failedItems: 0, findings: '', recommendations: '',
};

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function InspectionsPage() {
  const [inspections, setInspections] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewModal, setViewModal] = useState({ isOpen: false, inspection: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = () => setInspections(getLocalInspections());

  useEffect(() => {
    refresh();
    setUsers(Array.isArray(getLocalUsers()) ? getLocalUsers() : []);
    setLoading(false);
  }, []);

  const filtered = useMemo(() => {
    let r = [...inspections];
    if (filters.status) r = r.filter(i => i.status === filters.status);
    if (filters.search) {
      const t = filters.search.toLowerCase();
      r = r.filter(i => [i.title, i.location, i.type, i.inspector].some(f => f?.toLowerCase().includes(t)));
    }
    return r;
  }, [inspections, filters]);

  const completed = filtered.filter(i => i.status === 'completed');
  const avgScore = completed.filter(i => i.score !== null).length > 0
    ? Math.round(completed.filter(i => i.score !== null).reduce((s, i) => s + Number(i.score), 0) / completed.filter(i => i.score !== null).length)
    : 0;

  const openModal = (item = null) => {
    setEditing(item);
    setFormData(item ? { ...EMPTY, ...item, score: item.score ?? '' } : EMPTY);
    setIsModalOpen(true);
  };

  const handleInspectorSelect = (id) => {
    const emp = users.find(e => e.id === id);
    setFormData(p => ({ ...p, inspectorId: id, inspector: emp?.name || '' }));
  };

  const handleSubmit = () => {
    if (!formData.title) return;
    // Auto-calc score from pass/fail if completed
    let payload = { ...formData };
    if (formData.status === 'completed' && formData.totalItems > 0) {
      const passed = Number(formData.passedItems) || 0;
      const total = Number(formData.totalItems) || 1;
      payload.score = Math.round((passed / total) * 100);
      payload.failedItems = total - passed;
      if (!payload.completedDate) payload.completedDate = new Date().toISOString().split('T')[0];
    }
    if (editing) updateLocalInspection(editing.id, payload);
    else addLocalInspection(payload);
    refresh();
    setIsModalOpen(false);
  };

  const f = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const isCompleted = formData.status === 'completed';

  const columns = [
    {
      key: 'title', label: 'Inspection Title', className: 'min-w-[180px]',
      render: r => (
        <div>
          <p className="text-xs font-semibold text-gray-900">{r.title}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{r.type}</p>
        </div>
      )
    },
    { key: 'location', label: 'Location', className: 'min-w-[130px]' },
    { key: 'inspector', label: 'Inspector', className: 'min-w-[120px]' },
    { key: 'scheduledDate', label: 'Scheduled', type: 'date' },
    {
      key: 'totalItems', label: 'Items',
      render: r => r.totalItems > 0
        ? <span className="text-xs text-gray-700"><span className="font-semibold text-emerald-600">{r.passedItems}</span><span className="text-gray-400">/{r.totalItems}</span></span>
        : <span className="text-gray-300 text-xs">—</span>
    },
    { key: 'score', label: 'Score', render: r => <ScoreBar score={r.score} /> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-slate-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck size={20} className="text-slate-600" /> Inspections
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Schedule and conduct workplace safety inspections</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm flex-shrink-0">
          <Plus size={15} /> <span className="hidden sm:inline">New Inspection</span><span className="sm:hidden">New</span>
        </Button>
      </div>

      <SummaryCards cards={[
        { icon: '📋', label: 'Total', value: filtered.length, color: 'text-gray-800' },
        { icon: '⏳', label: 'Scheduled', value: filtered.filter(i => i.status === 'scheduled').length, color: 'text-blue-600' },
        { icon: '✅', label: 'Completed', value: completed.length, color: 'text-emerald-600' },
        { icon: '📈', label: 'Avg Score', value: avgScore ? `${avgScore}%` : '—', color: avgScore >= 85 ? 'text-emerald-600' : avgScore >= 65 ? 'text-amber-600' : 'text-red-600' },
      ]} />

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        showStatus={true}
        showSearch={true}
        showReportType={false}
        showCategory={false}
        showEmployee={false}
        customStatusOptions={STATUS_OPTS}
      />

      <Table
        columns={columns}
        data={filtered}
        actions={[
          { id: 'view', label: 'View', icon: Eye },
          { id: 'edit', label: 'Edit', icon: Edit },
          { id: 'delete', label: 'Delete', icon: Trash2 },
        ]}
        onActionClick={(action, row) => {
          if (action === 'view') setViewModal({ isOpen: true, inspection: row });
          if (action === 'edit') openModal(row);
          if (action === 'delete') setDeleteModal({ isOpen: true, id: row.id });
        }}
        maxHeight="calc(100vh - 400px)"
        className="min-w-[720px]"
        emptyMessage="No inspections found. Schedule your first inspection."
      />

      {/* View Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, inspection: null })}
        title={viewModal.inspection?.title || 'Inspection Details'}
        size="lg"
      >
        <ViewInspectionModal
          inspection={viewModal.inspection}
          onEdit={() => { openModal(viewModal.inspection); setViewModal({ isOpen: false, inspection: null }); }}
        />
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit Inspection' : 'New Inspection'}
        size="lg"
        footerActions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setIsModalOpen(false) },
          { label: editing ? 'Update' : 'Schedule Inspection', variant: 'primary', onClick: handleSubmit },
        ]}
      >
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Inspection Title *</label>
            <input value={formData.title} onChange={e => f('title', e.target.value)}
              placeholder="e.g. Monthly Fire Safety Inspection" className={INPUT_CLS} />
          </div>

          {/* Type + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect label="Inspection Type" value={formData.type} onChange={v => f('type', v)}
              options={INSPECTION_TYPES.map(t => ({ value: t, label: t }))}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input value={formData.location} onChange={e => f('location', e.target.value)}
                placeholder="e.g. Building A - All Floors" className={INPUT_CLS} />
            </div>
          </div>

          {/* Inspector + Scheduled Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect label="Inspector" value={formData.inspectorId} onChange={handleInspectorSelect}
              options={users.map(u => ({ value: u.id, label: `${u.name} — ${u.designation}` }))}
              placeholder="Select inspector..."
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Date</label>
              <input type="date" value={formData.scheduledDate} onChange={e => f('scheduledDate', e.target.value)} className={INPUT_CLS} />
            </div>
          </div>

          {/* Status */}
          <CustomSelect label="Status" value={formData.status} onChange={v => f('status', v)}
            options={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />

          {/* Completed section */}
          {isCompleted && (
            <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-4 space-y-4">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Inspection Results</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Completion Date</label>
                  <input type="date" value={formData.completedDate} onChange={e => f('completedDate', e.target.value)} className={INPUT_CLS} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Checklist Items</label>
                  <input type="number" min="0" value={formData.totalItems} onChange={e => f('totalItems', Number(e.target.value))} className={INPUT_CLS} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Items Passed ✅</label>
                  <input type="number" min="0" max={formData.totalItems} value={formData.passedItems}
                    onChange={e => f('passedItems', Number(e.target.value))} className={INPUT_CLS} />
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-200 flex flex-col justify-center">
                  <p className="text-xs text-gray-500 mb-1">Calculated Score</p>
                  <p className={`text-2xl font-black ${
                    formData.totalItems > 0
                      ? Math.round((formData.passedItems / formData.totalItems) * 100) >= 85 ? 'text-emerald-600'
                        : Math.round((formData.passedItems / formData.totalItems) * 100) >= 65 ? 'text-amber-600'
                        : 'text-red-600'
                      : 'text-gray-400'
                  }`}>
                    {formData.totalItems > 0 ? `${Math.round((Number(formData.passedItems) / Number(formData.totalItems)) * 100)}%` : '—'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Findings</label>
                <textarea value={formData.findings} onChange={e => f('findings', e.target.value)} rows={3}
                  placeholder="List any issues, failures, or observations found during inspection..." className={INPUT_CLS} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Recommendations</label>
                <textarea value={formData.recommendations} onChange={e => f('recommendations', e.target.value)} rows={3}
                  placeholder="Recommended corrective actions to address findings..." className={INPUT_CLS} />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Inspection"
        size="sm"
        footerActions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setDeleteModal({ isOpen: false, id: null }) },
          {
            label: 'Delete', variant: 'danger',
            onClick: () => { deleteLocalInspection(deleteModal.id); refresh(); setDeleteModal({ isOpen: false, id: null }); }
          },
        ]}
      >
        <div className="text-center py-6 space-y-3">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <p className="text-sm text-gray-600">Delete this inspection record? This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
}