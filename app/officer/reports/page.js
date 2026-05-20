'use client';

import { useEffect, useState, useMemo } from 'react';
import { Edit, Trash2, Eye, Plus, CheckCircle2, Clock, AlertCircle, XCircle, FileText } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';
import SummaryCards from '@/components/SummaryCards';
import { useUser } from '@/context/UserContext';
import {
  getLocalReports, addLocalReport, updateLocalReport,
  getCorrectiveActionsForReport, addLocalCorrectiveAction,
  updateLocalCorrectiveAction, deleteLocalCorrectiveAction,
} from '@/lib/localStorage';

function StatusBadge({ status }) {
  const map = {
    open: { cls: 'bg-red-100 text-red-700', icon: <AlertCircle size={10} />, label: 'Open' },
    'in-progress': { cls: 'bg-blue-100 text-blue-700', icon: <Clock size={10} />, label: 'In Progress' },
    resolved: { cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={10} />, label: 'Resolved' },
    closed: { cls: 'bg-gray-100 text-gray-500', icon: <XCircle size={10} />, label: 'Closed' },
  };
  const s = map[(status || '').toLowerCase()] || map.open;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

function SeverityBadge({ severity }) {
  const map = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-green-100 text-green-700' };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold capitalize ${map[severity] || map.medium}`}>{severity || '—'}</span>;
}

function TypeBadge({ type }) {
  const map = {
    incident: 'bg-red-50 text-red-700 border-red-200',
    near_miss: 'bg-amber-50 text-amber-700 border-amber-200',
    hazard: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border capitalize ${map[type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{(type || '').replace('_', ' ')}</span>;
}

function StatusTimeline({ history = [] }) {
  if (!history.length) return <p className="text-xs text-gray-400">No history available.</p>;
  return (
    <div className="relative pl-6">
      <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-200" />
      <div className="space-y-4">
        {[...history].reverse().map((h, i) => (
          <div key={i} className="relative">
            <div className={`absolute -left-[18px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${i === 0 ? 'bg-slate-700' : 'bg-gray-300'}`}>
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            <p className="text-xs font-bold text-gray-800 capitalize">{h.status?.replace('-', ' ')}</p>
            {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
            <p className="text-[10px] text-gray-400 mt-0.5">{h.date ? new Date(h.date).toLocaleString() : ''}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ViewReportModal({ report, onEdit, currentUser }) {
  const [tab, setTab] = useState('details');
  const [actions, setActions] = useState([]);
  const [newAction, setNewAction] = useState({ title: '', dueDate: '', priority: 'medium' });
  const [adding, setAdding] = useState(false);

  useEffect(() => { if (report) setActions(getCorrectiveActionsForReport(report.id)); }, [report]);
  if (!report) return null;

  const addAction = () => {
    if (!newAction.title) return;
    addLocalCorrectiveAction({
      ...newAction, linkedReportId: report.id, linkedReportType: 'report',
      assignedTo: currentUser?.id, assignedName: currentUser?.name, status: 'open',
    });
    setActions(getCorrectiveActionsForReport(report.id));
    setNewAction({ title: '', dueDate: '', priority: 'medium' });
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <TypeBadge type={report.type} />
        <SeverityBadge severity={report.severity} />
        <StatusBadge status={report.status} />
      </div>

      <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
        {['details', 'timeline', 'actions'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-slate-700 text-slate-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t === 'actions' ? `Actions (${actions.length})` : t}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Location', report.location],
              ['Date', report.dateOfIncident ? new Date(report.dateOfIncident).toLocaleString() : '—'],
              ['Assigned To', report.assignedName],
              ['Designation', report.assignedDesignation],
              ['Potential Severity', report.potentialSeverity],
              ['Reported', report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '—'],
            ].map(([lbl, val]) => (
              <div key={lbl} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{lbl}</p>
                <p className="text-sm text-gray-800 font-medium mt-0.5 capitalize">{val || '—'}</p>
              </div>
            ))}
          </div>
          {[['Description', report.description], ['Witnesses', report.witnesses], ['Immediate Actions', report.immediateActions], ['Recommended Actions', report.recommendedActions]].filter(([, v]) => v).map(([lbl, val]) => (
            <div key={lbl}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{lbl}</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{val}</p>
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button onClick={onEdit} variant="outline" size="sm" className="flex items-center gap-1.5">
              <Edit size={13} /> Edit Report
            </Button>
          </div>
        </div>
      )}

      {tab === 'timeline' && <StatusTimeline history={report.statusHistory} />}

      {tab === 'actions' && (
        <div className="space-y-3">
          {actions.map(a => (
            <div key={a.id} className={`flex items-start gap-3 p-3.5 rounded-xl border ${a.status === 'completed' ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => { updateLocalCorrectiveAction(a.id, { status: a.status === 'completed' ? 'open' : 'completed' }); setActions(getCorrectiveActionsForReport(report.id)); }}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${a.status === 'completed' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-white hover:border-emerald-400'}`}
              >
                {a.status === 'completed' && <CheckCircle2 size={11} className="text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${a.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{a.title}</p>
                {a.dueDate && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Due: {new Date(a.dueDate).toLocaleDateString()}
                    {a.status !== 'completed' && new Date(a.dueDate) < new Date() && <span className="ml-2 text-red-500 font-semibold">Overdue</span>}
                  </p>
                )}
                <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold ${a.priority === 'high' ? 'bg-red-100 text-red-700' : a.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{a.priority}</span>
              </div>
              <button onClick={() => { deleteLocalCorrectiveAction(a.id); setActions(getCorrectiveActionsForReport(report.id)); }} className="text-gray-300 hover:text-red-400 transition-colors"><XCircle size={15} /></button>
            </div>
          ))}
          {adding ? (
            <div className="border border-dashed border-blue-300 rounded-xl p-4 space-y-3 bg-blue-50/30">
              <input value={newAction.title} onChange={e => setNewAction(p => ({ ...p, title: e.target.value }))} placeholder="Action title..."
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500" />
              <div className="flex gap-3">
                <input type="date" value={newAction.dueDate} onChange={e => setNewAction(p => ({ ...p, dueDate: e.target.value }))}
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500" />
                <select value={newAction.priority} onChange={e => setNewAction(p => ({ ...p, priority: e.target.value }))}
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addAction}>Add</Button>
                <Button size="sm" variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
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

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const INPUT_CLS = 'w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:outline-none transition resize-none';

export default function OfficerReports() {
  const { user } = useUser();
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({ type: '', status: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [viewModal, setViewModal] = useState({ isOpen: false, report: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    type: 'incident', severity: 'medium', potentialSeverity: 'medium',
    dateOfIncident: '', location: '', description: '', witnesses: '',
    immediateActions: '', recommendedActions: '', status: 'open',
  });

  const refresh = () => {
    if (!user) return;
    setReports(getLocalReports().filter(r => r.assignedTo === user.id));
  };

  useEffect(() => { refresh(); setLoading(false); }, [user]);

  const filteredReports = useMemo(() => {
    let r = [...reports];
    if (filters.type) r = r.filter(x => x.type === filters.type);
    if (filters.status) r = r.filter(x => x.status === filters.status);
    if (filters.search) {
      const t = filters.search.toLowerCase();
      r = r.filter(x => [x.description, x.location, x.type].some(f => f?.toLowerCase().includes(t)));
    }
    return r;
  }, [reports, filters]);

  const openModal = (report = null) => {
    setEditingReport(report);
    if (report) {
      setFormData({
        type: report.type || 'incident', severity: report.severity || 'medium',
        potentialSeverity: report.potentialSeverity || 'medium',
        dateOfIncident: report.dateOfIncident || '', location: report.location || '',
        description: report.description || '', witnesses: report.witnesses || '',
        immediateActions: report.immediateActions || '', recommendedActions: report.recommendedActions || '',
        status: report.status || 'open',
      });
    } else {
      setFormData({ type: 'incident', severity: 'medium', potentialSeverity: 'medium', dateOfIncident: '', location: '', description: '', witnesses: '', immediateActions: '', recommendedActions: '', status: 'open' });
    }
    setImagePreview(report?.imageUrl || null);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      assignedTo: user?.id,
      assignedName: user?.name,
      assignedDesignation: user?.designation,
      updatedAt: new Date().toISOString(),
    };
    if (editingReport) updateLocalReport(editingReport.id, payload);
    else addLocalReport(payload);
    refresh();
    setIsModalOpen(false);
  };

  const f = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const columns = [
    { key: 'type', label: 'Type', render: r => <TypeBadge type={r.type} /> },
    { key: 'severity', label: 'Severity', render: r => <SeverityBadge severity={r.severity} /> },
    { key: 'location', label: 'Location', className: 'min-w-[130px]' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: 'Date', type: 'date' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  const open = filteredReports.filter(r => r.status === 'open').length;
  const resolved = filteredReports.filter(r => r.status === 'resolved').length;
  const closed = filteredReports.filter(r => r.status === 'closed').length;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-slate-600" /> My Reports
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Your submitted incidents, near misses & hazards</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm flex-shrink-0">
          <Plus size={15} /> <span className="hidden sm:inline">New Report</span><span className="sm:hidden">New</span>
        </Button>
      </div>

      <SummaryCards cards={[
        { icon: '📊', label: 'Total', value: filteredReports.length, color: 'text-gray-800' },
        { icon: '🔴', label: 'Open', value: open, color: 'text-red-600' },
        { icon: '🔵', label: 'In Progress', value: filteredReports.filter(r => r.status === 'in-progress').length, color: 'text-blue-600' },
        { icon: '✅', label: 'Resolved/Closed', value: resolved + closed, color: 'text-emerald-600' },
      ]} />

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        showReportType={true}
        showCategory={false}
        showEmployee={false}
        showStatus={true}
      />

      <Table
        columns={columns}
        data={filteredReports}
        actions={[
          { id: 'view', label: 'View', icon: Eye },
          { id: 'edit', label: 'Edit', icon: Edit },
        ]}
        onActionClick={(action, row) => {
          if (action === 'view') setViewModal({ isOpen: true, report: row });
          if (action === 'edit') openModal(row);
        }}
        maxHeight="calc(100vh - 400px)"
        emptyMessage="No reports found. File your first report!"
      />

      {/* View Modal */}
      <Modal isOpen={viewModal.isOpen} onClose={() => setViewModal({ isOpen: false, report: null })}
        title={`Report — ${(viewModal.report?.type || '').replace('_', ' ').toUpperCase()}`} size="lg">
        <ViewReportModal report={viewModal.report} currentUser={user}
          onEdit={() => { openModal(viewModal.report); setViewModal({ isOpen: false, report: null }); }} />
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingReport ? 'Edit Report' : 'New Report'} size="lg"
        footerActions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setIsModalOpen(false) },
          { label: editingReport ? 'Update' : 'Submit Report', variant: 'primary', onClick: handleSubmit },
        ]}>
        <div className="space-y-4 py-2">
          {/* Assigned to current user - read-only display */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">{user?.name}</p>
              <p className="text-[10px] text-gray-500">{user?.designation} — assigned to you</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <CustomSelect label="Report Type" value={formData.type} onChange={v => f('type', v)}
              options={[{ value: 'incident', label: 'Incident' }, { value: 'near_miss', label: 'Near Miss' }, { value: 'hazard', label: 'Hazard' }]} />
            <CustomSelect label="Severity" value={formData.severity} onChange={v => f('severity', v)}
              options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <CustomSelect label="Potential Severity" value={formData.potentialSeverity} onChange={v => f('potentialSeverity', v)}
              options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} />
            <Field label="Date & Time">
              <input type="datetime-local" value={formData.dateOfIncident} onChange={e => f('dateOfIncident', e.target.value)} className={INPUT_CLS} />
            </Field>
          </div>

          <Field label="Location">
            <input value={formData.location} onChange={e => f('location', e.target.value)} placeholder="Exact location of incident" className={INPUT_CLS} />
          </Field>

          <Field label="Description">
            <textarea value={formData.description} onChange={e => f('description', e.target.value)} rows={4} placeholder="Detailed description of what happened..." className={INPUT_CLS} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Witnesses">
              <textarea value={formData.witnesses} onChange={e => f('witnesses', e.target.value)} rows={2} placeholder="Names of witnesses" className={INPUT_CLS} />
            </Field>
            <Field label="Immediate Actions Taken">
              <textarea value={formData.immediateActions} onChange={e => f('immediateActions', e.target.value)} rows={2} placeholder="Actions taken immediately" className={INPUT_CLS} />
            </Field>
          </div>

          <Field label="Recommended Actions">
            <textarea value={formData.recommendedActions} onChange={e => f('recommendedActions', e.target.value)} rows={3} placeholder="Long-term corrective actions recommended..." className={INPUT_CLS} />
          </Field>

          <CustomSelect label="Status" value={formData.status} onChange={v => f('status', v)}
            options={[{ value: 'open', label: 'Open' }, { value: 'in-progress', label: 'In Progress' }, { value: 'resolved', label: 'Resolved' }]} />

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Upload Evidence Photo</label>
            <div onClick={() => document.getElementById('officerReportFileUpload').click()}
              className="border-2 border-dashed border-gray-300 hover:border-slate-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100">
              <input id="officerReportFileUpload" type="file" accept="image/*" className="hidden"
                onChange={e => { const f2 = e.target.files[0]; if (f2) setImagePreview(URL.createObjectURL(f2)); }} />
              <p className="text-sm text-gray-500">📸 Click to upload evidence image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
            </div>
            {imagePreview && <img src={imagePreview} alt="Evidence" className="mt-3 max-h-48 mx-auto rounded-xl shadow-sm object-cover" />}
          </div>
        </div>
      </Modal>
    </div>
  );
}