'use client';

import { useEffect, useState, useMemo } from 'react';
import { Edit, Trash2, Eye, Plus, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';

import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';
import SummaryCards from '@/components/SummaryCards';

import {
  getLocalRiskAssessments, addLocalRiskAssessment, updateLocalRiskAssessment, deleteLocalRiskAssessment,
  getLocalUsers, addLocalCorrectiveAction, getCorrectiveActionsForReport,
  updateLocalCorrectiveAction, deleteLocalCorrectiveAction,
} from '@/lib/localStorage';

// ─── Risk Badge ───────────────────────────────────────────────────────────────
function RiskBadge({ level }) {
  const map = { High: 'bg-red-100 text-red-700', Medium: 'bg-amber-100 text-amber-700', Low: 'bg-green-100 text-green-700' };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${map[level] || map.Low}`}>{level}</span>;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    open: { cls: 'bg-red-100 text-red-700', icon: <AlertTriangle size={10} /> },
    'in-progress': { cls: 'bg-blue-100 text-blue-700', icon: <Clock size={10} /> },
    closed: { cls: 'bg-gray-100 text-gray-500', icon: <XCircle size={10} /> },
  };
  const s = map[(status || '').toLowerCase()] || map.open;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold capitalize ${s.cls}`}>
      {s.icon} {status?.replace('-', ' ') || 'open'}
    </span>
  );
}

// ─── 5×5 Risk Matrix ──────────────────────────────────────────────────────────
function RiskMatrix({ likelihood, severity, residualLikelihood, residualSeverity }) {
  const color = (l, s) => {
    const sc = l * s;
    return sc >= 15 ? '#ef4444' : sc >= 8 ? '#f59e0b' : '#10b981';
  };
  const cells = [];
  for (let s = 5; s >= 1; s--) {
    for (let l = 1; l <= 5; l++) cells.push({ l, s });
  }
  return (
    <div>
      <div className="flex gap-3 text-[10px] text-gray-500 mb-2 flex-wrap">
        <span className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 rounded bg-slate-800 text-[7px] text-white flex items-center justify-center font-black">I</div> Initial
        </span>
        {residualLikelihood && <span className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 rounded border-2 border-blue-500 bg-blue-50 text-[7px] text-blue-700 flex items-center justify-center font-black">R</div> Residual
        </span>}
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col justify-center pr-1">
          <p className="text-[9px] text-gray-400 text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>SEVERITY →</p>
        </div>
        <div>
          <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(5,1fr)', width: 'min(100%, 200px)' }}>
            {cells.map((c, i) => {
              const isI = c.l === likelihood && c.s === severity;
              const isR = c.l === residualLikelihood && c.s === residualSeverity;
              const bg = color(c.l, c.s);
              return (
                <div key={i} className="aspect-square rounded-sm flex items-center justify-center relative" style={{ backgroundColor: bg + '30', border: `1px solid ${bg}30` }}>
                  {isI && <div className="absolute inset-0.5 rounded-sm flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: bg }}>I</div>}
                  {isR && !isI && <div className="absolute inset-0.5 rounded-sm flex items-center justify-center text-[8px] font-black border-2 border-blue-500 bg-blue-50 text-blue-700">R</div>}
                  {!isI && !isR && <span className="text-[8px] font-medium opacity-40" style={{ color: bg }}>{c.l * c.s}</span>}
                </div>
              );
            })}
          </div>
          <div className="grid gap-0.5 mt-0.5" style={{ gridTemplateColumns: 'repeat(5,1fr)', width: 'min(100%, 200px)' }}>
            {[1,2,3,4,5].map(n => <div key={n} className="text-center text-[8px] text-gray-400">{n}</div>)}
          </div>
          <p className="text-center text-[9px] text-gray-400 mt-0.5">LIKELIHOOD →</p>
        </div>
      </div>
      <div className="flex gap-3 mt-2">
        {[['#ef4444', 'High ≥15'], ['#f59e0b', 'Med 8-14'], ['#10b981', 'Low ≤7']].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
            <span className="text-[9px] text-gray-500">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function Timeline({ history = [] }) {
  if (!history.length) return <p className="text-xs text-gray-400">No history available.</p>;
  return (
    <div className="relative pl-6">
      <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-200" />
      <div className="space-y-4">
        {[...history].reverse().map((h, i) => (
          <div key={i} className="relative">
            <div className={`absolute -left-[18px] top-1 w-4 h-4 rounded-full border-2 border-white ${i === 0 ? 'bg-slate-700' : 'bg-gray-300'}`} />
            <p className="text-xs font-bold text-gray-800 capitalize">{h.status}</p>
            {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
            <p className="text-[10px] text-gray-400 mt-0.5">{h.date ? new Date(h.date).toLocaleString() : ''}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── View Risk Modal ──────────────────────────────────────────────────────────
function ViewRiskModal({ assessment, onEdit }) {
  const [tab, setTab] = useState('details');
  const [actions, setActions] = useState([]);
  const [newAction, setNewAction] = useState({ title: '', dueDate: '', priority: 'medium' });
  const [adding, setAdding] = useState(false);

  useEffect(() => { if (assessment) setActions(getCorrectiveActionsForReport(assessment.id)); }, [assessment]);
  if (!assessment) return null;

  const addAction = () => {
    if (!newAction.title) return;
    addLocalCorrectiveAction({ ...newAction, linkedReportId: assessment.id, linkedReportType: 'risk', assignedTo: assessment.assignedTo, assignedName: assessment.assignedName, status: 'open' });
    setActions(getCorrectiveActionsForReport(assessment.id));
    setNewAction({ title: '', dueDate: '', priority: 'medium' });
    setAdding(false);
  };

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'matrix', label: 'Risk Matrix' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'actions', label: `Actions (${actions.length})` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <RiskBadge level={assessment.riskLevel} />
        <StatusBadge status={assessment.status} />
        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] sm:text-xs rounded-full font-semibold">Score: {assessment.riskScore}</span>
        {assessment.residualRiskLevel && (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] sm:text-xs rounded-full font-semibold">Residual: {assessment.residualRiskLevel} ({assessment.residualRiskScore})</span>
        )}
      </div>

      <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === t.id ? 'border-slate-700 text-slate-700' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'details' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Activity', assessment.activity],
              ['Location', assessment.location],
              ['Category', assessment.hazardCategory],
              ['Assigned To', assessment.assignedName],
              ['Review Date', assessment.reviewDate],
              ['Legal Requirement', assessment.legalRequirement],
            ].map(([l, v]) => (
              <div key={l} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{l}</p>
                <p className="text-sm text-gray-800 font-medium mt-0.5">{v || '—'}</p>
              </div>
            ))}
          </div>
          {[['Hazard Description', assessment.hazard], ['Existing Controls', assessment.existingControls], ['Additional Controls', assessment.additionalControls], ['PPE Required', assessment.ppeRequired]].filter(([, v]) => v).map(([l, v]) => (
            <div key={l}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{l}</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{v}</p>
            </div>
          ))}
          <div className="flex justify-end">
            <Button onClick={onEdit} variant="outline" size="sm" className="flex items-center gap-1.5"><Edit size={13} /> Edit</Button>
          </div>
        </div>
      )}

      {tab === 'matrix' && (
        <div className="space-y-4">
          <RiskMatrix likelihood={assessment.likelihood} severity={assessment.severity} residualLikelihood={assessment.residualLikelihood} residualSeverity={assessment.residualSeverity} />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Initial Risk</p>
              <p className="text-2xl font-black text-red-600">{assessment.riskScore}</p>
              <div className="mt-1"><RiskBadge level={assessment.riskLevel} /></div>
            </div>
            {assessment.residualRiskScore && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Residual Risk</p>
                <p className="text-2xl font-black text-blue-600">{assessment.residualRiskScore}</p>
                <div className="mt-1"><RiskBadge level={assessment.residualRiskLevel} /></div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'timeline' && <Timeline history={assessment.statusHistory} />}

      {tab === 'actions' && (
        <div className="space-y-3">
          {actions.map(a => (
            <div key={a.id} className={`flex items-start gap-3 p-3.5 rounded-xl border ${a.status === 'completed' ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
              <button onClick={() => { updateLocalCorrectiveAction(a.id, { status: a.status === 'completed' ? 'open' : 'completed' }); setActions(getCorrectiveActionsForReport(assessment.id)); }}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${a.status === 'completed' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-white hover:border-emerald-400'}`}
              >
                {a.status === 'completed' && <CheckCircle2 size={11} className="text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${a.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{a.title}</p>
                {a.dueDate && <p className="text-[10px] text-gray-400 mt-0.5">Due: {new Date(a.dueDate).toLocaleDateString()} {a.status !== 'completed' && new Date(a.dueDate) < new Date() && <span className="ml-1 text-red-500 font-semibold">Overdue</span>}</p>}
              </div>
              <button onClick={() => { deleteLocalCorrectiveAction(a.id); setActions(getCorrectiveActionsForReport(assessment.id)); }} className="text-gray-300 hover:text-red-400 transition-colors"><XCircle size={15} /></button>
            </div>
          ))}
          {adding ? (
            <div className="border border-dashed border-blue-300 rounded-xl p-4 space-y-3 bg-blue-50/30">
              <input value={newAction.title} onChange={e => setNewAction(p => ({ ...p, title: e.target.value }))} placeholder="Action title..."
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-3">
                <input type="date" value={newAction.dueDate} onChange={e => setNewAction(p => ({ ...p, dueDate: e.target.value }))} className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none" />
                <select value={newAction.priority} onChange={e => setNewAction(p => ({ ...p, priority: e.target.value }))} className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-2"><Button size="sm" onClick={addAction}>Add</Button><Button size="sm" variant="secondary" onClick={() => setAdding(false)}>Cancel</Button></div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="w-full flex items-center gap-2 justify-center py-3 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
              <Plus size={13} /> Add Corrective Action
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcScore = (l, s) => (l || 1) * (s || 1);
const getLevel = (score) => score >= 15 ? 'High' : score >= 8 ? 'Medium' : 'Low';

const EMPTY = {
  activity: '', hazard: '', hazardCategory: '', location: '',
  likelihood: 3, severity: 3, residualLikelihood: 1, residualSeverity: 2,
  existingControls: '', additionalControls: '', ppeRequired: '',
  status: 'open', reviewDate: '', assignedTo: '', assignedName: '',
  assignedDesignation: '', legalRequirement: '',
};

const INPUT_CLS = 'w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:outline-none transition resize-none';

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminRiskAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ category: '', status: '', assignedTo: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, assessment: null });
  const [formData, setFormData] = useState(EMPTY);
  const [imagePreview, setImagePreview] = useState(null);

  const refresh = () => setAssessments(getLocalRiskAssessments());

  useEffect(() => {
    refresh();
    setUsers(Array.isArray(getLocalUsers()) ? getLocalUsers() : []);
    setLoading(false);
  }, []);

  const filtered = useMemo(() => {
    let r = [...assessments];
    if (filters.category) r = r.filter(a => a.hazardCategory === filters.category);
    if (filters.status) r = r.filter(a => a.status === filters.status);
    if (filters.assignedTo) r = r.filter(a => a.assignedTo === filters.assignedTo);
    if (filters.search) {
      const t = filters.search.toLowerCase();
      r = r.filter(a => [a.activity, a.hazard, a.location, a.assignedName].some(f => f?.toLowerCase().includes(t)));
    }
    return r;
  }, [assessments, filters]);

  const openModal = (item = null) => {
    setEditing(item);
    setFormData(item ? { ...EMPTY, ...item } : EMPTY);
    setImagePreview(item?.imageUrl || null);
    setIsModalOpen(true);
  };

  const handleEmpSelect = (id) => {
    const emp = users.find(e => e.id === id);
    setFormData(p => ({ ...p, assignedTo: id, assignedName: emp?.name || '', assignedDesignation: emp?.designation || '' }));
  };

  const handleSubmit = () => {
    const riskScore = calcScore(formData.likelihood, formData.severity);
    const riskLevel = getLevel(riskScore);
    const residualRiskScore = calcScore(formData.residualLikelihood, formData.residualSeverity);
    const residualRiskLevel = getLevel(residualRiskScore);
    const payload = { ...formData, riskScore, riskLevel, residualRiskScore, residualRiskLevel };
    if (editing) updateLocalRiskAssessment(editing.id, payload);
    else addLocalRiskAssessment(payload);
    refresh();
    setIsModalOpen(false);
  };

  const f = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const riskScore = calcScore(formData.likelihood, formData.severity);
  const resScore = calcScore(formData.residualLikelihood, formData.residualSeverity);

  const statusFilterOpts = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'closed', label: 'Closed' },
  ];

  const columns = [
    { key: 'activity', label: 'Activity', className: 'min-w-[150px]' },
    { key: 'hazardCategory', label: 'Category', className: 'min-w-[100px]' },
    { key: 'location', label: 'Location', className: 'min-w-[120px]' },
    { key: 'likelihood', label: 'L', className: 'text-center' },
    { key: 'severity', label: 'S', className: 'text-center' },
    {
      key: 'riskScore', label: 'Score',
      render: r => <span className="font-bold text-gray-900">{r.riskScore}</span>
    },
    { key: 'riskLevel', label: 'Risk', render: r => <RiskBadge level={r.riskLevel} /> },
    {
      key: 'residualRiskLevel', label: 'Residual',
      render: r => r.residualRiskLevel ? (
        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
          {r.residualRiskLevel} ({r.residualRiskScore})
        </span>
      ) : <span className="text-gray-300 text-xs">—</span>
    },
    { key: 'assignedName', label: 'Assigned To', className: 'min-w-[130px]' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} />,  className: 'min-w-[150px]' },
    { key: 'reviewDate', label: 'Review Date', type: 'date' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={20} className="text-slate-600" /> Risk Assessments
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">HSE Risk Management</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm flex-shrink-0">
          <Plus size={15} /> <span className="hidden sm:inline">New Assessment</span><span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Summary */}
      <SummaryCards cards={[
        { icon: '📊', label: 'Total', value: filtered.length, color: 'text-gray-800' },
        { icon: '🔴', label: 'High Risk', value: filtered.filter(a => a.riskLevel === 'High').length, color: 'text-red-600' },
        { icon: '🟡', label: 'Open', value: filtered.filter(a => a.status === 'open').length, color: 'text-amber-600' },
        { icon: '✅', label: 'Closed', value: filtered.filter(a => a.status === 'closed').length, color: 'text-emerald-600' },
      ]} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        showCategory={true}
        showReportType={false}
        showEmployee={true}
        showStatus={true}
        customStatusOptions={statusFilterOpts}
        employees={users}
      />

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        actions={[
          { id: 'view', label: 'View', icon: Eye },
          { id: 'edit', label: 'Edit', icon: Edit },
          { id: 'delete', label: 'Delete', icon: Trash2 },
        ]}
        onActionClick={(action, row) => {
          if (action === 'view') setViewModal({ isOpen: true, assessment: row });
          if (action === 'edit') openModal(row);
          if (action === 'delete') setDeleteModal({ isOpen: true, id: row.id });
        }}
        className="min-w-[900px]"
        emptyMessage="No risk assessments found."
      />

      {/* View Modal */}
      <Modal isOpen={viewModal.isOpen} onClose={() => setViewModal({ isOpen: false, assessment: null })}
        title={viewModal.assessment?.activity || 'Risk Assessment'} size="lg"
      >
        <ViewRiskModal
          assessment={viewModal.assessment}
          onEdit={() => { openModal(viewModal.assessment); setViewModal({ isOpen: false, assessment: null }); }}
        />
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit Risk Assessment' : 'New Risk Assessment'} size="xl"
        footerActions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setIsModalOpen(false) },
          { label: editing ? 'Update' : 'Create Assessment', variant: 'primary', onClick: handleSubmit },
        ]}
      >
        <div className="space-y-4 py-2">
          <CustomSelect label="Assign To Employee" value={formData.assignedTo} onChange={handleEmpSelect}
            options={users.map(e => ({ value: e.id, label: `${e.name} — ${e.designation}` }))}
            placeholder="Select employee..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Activity / Task</label>
              <input value={formData.activity} onChange={e => f('activity', e.target.value)} placeholder="e.g. Maintenance on transformer" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <input value={formData.location} onChange={e => f('location', e.target.value)} placeholder="e.g. Substation Area" className={INPUT_CLS} />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Hazard Description</label>
            <textarea value={formData.hazard} onChange={e => f('hazard', e.target.value)} rows={3} placeholder="Describe the hazard in detail..." className={INPUT_CLS} />
          </div>

          <CustomSelect label="Hazard Category" value={formData.hazardCategory} onChange={v => f('hazardCategory', v)}
            options={['Physical','Chemical','Electrical','Fire','Biological','Ergonomic'].map(v => ({ value: v, label: v }))}
          />

          {/* Initial Risk */}
          <div className="border border-red-200 rounded-xl p-4 bg-red-50/30 space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Initial Risk Scores</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Likelihood (1–5)</label>
                <input type="number" min="1" max="5" value={formData.likelihood} onChange={e => f('likelihood', Number(e.target.value))} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Severity (1–5)</label>
                <input type="number" min="1" max="5" value={formData.severity} onChange={e => f('severity', Number(e.target.value))} className={INPUT_CLS} />
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 flex items-center gap-3 text-sm">
              <span className="text-gray-500">Risk Score:</span>
              <strong className="text-lg text-gray-900">{riskScore}</strong>
              <RiskBadge level={getLevel(riskScore)} />
            </div>
          </div>

          {/* Residual Risk */}
          <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/20 space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Residual Risk (after controls)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Residual Likelihood</label>
                <input type="number" min="1" max="5" value={formData.residualLikelihood} onChange={e => f('residualLikelihood', Number(e.target.value))} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Residual Severity</label>
                <input type="number" min="1" max="5" value={formData.residualSeverity} onChange={e => f('residualSeverity', Number(e.target.value))} className={INPUT_CLS} />
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 flex items-center gap-3 text-sm">
              <span className="text-gray-500">Residual Score:</span>
              <strong className="text-lg text-gray-900">{resScore}</strong>
              <RiskBadge level={getLevel(resScore)} />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Existing Controls</label>
            <textarea value={formData.existingControls} onChange={e => f('existingControls', e.target.value)} rows={3} placeholder="List existing safety controls..." className={INPUT_CLS} />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Additional Controls Required</label>
            <textarea value={formData.additionalControls} onChange={e => f('additionalControls', e.target.value)} rows={3} placeholder="Recommended additional controls..." className={INPUT_CLS} />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">PPE Required</label>
            <input value={formData.ppeRequired} onChange={e => f('ppeRequired', e.target.value)} placeholder="e.g. Hard hat, safety glasses, gloves" className={INPUT_CLS} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Review Date</label>
              <input type="date" value={formData.reviewDate} onChange={e => f('reviewDate', e.target.value)} className={INPUT_CLS} />
            </div>
            <CustomSelect label="Status" value={formData.status} onChange={v => f('status', v)}
              options={[{ value: 'open', label: 'Open' }, { value: 'in-progress', label: 'In Progress' }, { value: 'closed', label: 'Closed' }]}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Legal Requirement</label>
            <textarea value={formData.legalRequirement} onChange={e => f('legalRequirement', e.target.value)} rows={2} placeholder="e.g. OSHA 29 CFR 1910.333" className={INPUT_CLS} />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Upload Risk Image</label>
            <div onClick={() => document.getElementById('raFileUpload').click()}
              className="border-2 border-dashed border-gray-300 hover:border-slate-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100"
            >
              <input id="raFileUpload" type="file" accept="image/*" className="hidden"
                onChange={e => { const file = e.target.files[0]; if (file) setImagePreview(URL.createObjectURL(file)); }}
              />
              <p className="text-sm text-gray-500">📸 Click to upload risk image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
            </div>
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-3 max-h-48 mx-auto rounded-xl shadow-sm object-cover" />}
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Assessment" size="sm"
        footerActions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setDeleteModal({ isOpen: false, id: null }) },
          { label: 'Delete', variant: 'danger', onClick: () => { deleteLocalRiskAssessment(deleteModal.id); refresh(); setDeleteModal({ isOpen: false, id: null }); } },
        ]}
      >
        <div className="text-center py-6 space-y-3">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <p className="text-sm text-gray-600">Are you sure you want to delete this risk assessment? This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
}