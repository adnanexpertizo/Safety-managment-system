'use client';

import { useEffect, useState, useMemo } from 'react';
import { CheckCircle2, Clock, AlertCircle, Trash2, Edit, Plus, XCircle } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';
import SummaryCards from '@/components/SummaryCards';
import { getLocalCorrectiveActions, addLocalCorrectiveAction, updateLocalCorrectiveAction, deleteLocalCorrectiveAction, getLocalUsers } from '@/lib/localStorage';

const INPUT_CLS = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:outline-none transition hover:border-gray-300';

function StatusBadge({ status }) {
  const map = {
    open: { cls: 'bg-red-100 text-red-700', icon: <AlertCircle size={10} />, label: 'Open' },
    'in-progress': { cls: 'bg-blue-100 text-blue-700', icon: <Clock size={10} />, label: 'In Progress' },
    completed: { cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={10} />, label: 'Completed' },
  };
  const s = map[status] || map.open;
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${s.cls}`}>{s.icon}{s.label}</span>;
}

function PriorityBadge({ priority }) {
  const map = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${map[priority] || map.low}`}>{priority}</span>;
}

const EMPTY = { title: '', description: '', assignedTo: '', assignedName: '', dueDate: '', priority: 'medium', status: 'open' };

const STATUS_OPTS = [{ value: '', label: 'All Statuses' }, { value: 'open', label: 'Open' }, { value: 'in-progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }];
const PRIORITY_OPTS = [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }];

export default function CorrectiveActionsPage() {
  const [actions, setActions] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = () => setActions(getLocalCorrectiveActions());
  useEffect(() => { refresh(); setUsers(Array.isArray(getLocalUsers()) ? getLocalUsers() : []); setLoading(false); }, []);

  const filtered = useMemo(() => {
    let r = [...actions];
    if (filters.status) r = r.filter(a => a.status === filters.status);
    if (filters.priority) r = r.filter(a => a.priority === filters.priority);
    if (filters.search) { const t = filters.search.toLowerCase(); r = r.filter(a => [a.title, a.assignedName, a.description].some(f => f?.toLowerCase().includes(t))); }
    return r;
  }, [actions, filters]);

  const open = filtered.filter(a => a.status === 'open').length;
  const completed = filtered.filter(a => a.status === 'completed').length;
  const overdue = filtered.filter(a => a.status !== 'completed' && a.dueDate && new Date(a.dueDate) < new Date()).length;

  const openModal = (item = null) => {
    setEditing(item);
    setFormData(item ? { ...EMPTY, ...item } : EMPTY);
    setIsModalOpen(true);
  };

  const handleEmpSelect = (id) => {
    const emp = users.find(e => e.id === id);
    setFormData(p => ({ ...p, assignedTo: id, assignedName: emp?.name || '' }));
  };

  const handleSubmit = () => {
    if (!formData.title) return;
    if (editing) updateLocalCorrectiveAction(editing.id, formData);
    else addLocalCorrectiveAction(formData);
    refresh(); setIsModalOpen(false);
  };

  const f = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const priorityFilterOpts = [{ value: '', label: 'All Priorities' }, ...PRIORITY_OPTS];

  const columns = [
    { key: 'title', label: 'Action Title', className: 'min-w-[200px]',
      render: r => (
        <div>
          <p className="text-sm font-semibold text-gray-900">{r.title}</p>
          {r.description && <p className="text-[10px] text-gray-400 truncate max-w-[220px]">{r.description}</p>}
        </div>
      )
    },
    { key: 'assignedName', label: 'Assigned To', className: 'min-w-[120px]' },
    { key: 'priority', label: 'Priority', render: r => <PriorityBadge priority={r.priority} /> },
    { key: 'dueDate', label: 'Due Date', className: 'min-w-[110px]',
      render: r => {
        const isOverdue = r.status !== 'completed' && r.dueDate && new Date(r.dueDate) < new Date();
        return (
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
            {r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            {isOverdue && <span className="ml-1.5 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">Overdue</span>}
          </span>
        );
      }
    },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'linkedReportType', label: 'Linked To', render: r => r.linkedReportId ? <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium capitalize">{r.linkedReportType || 'Report'}</span> : <span className="text-gray-300 text-xs">—</span> },
    { key: 'createdAt', label: 'Created', type: 'date' },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-slate-700 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">

      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-slate-600" /> Corrective Actions
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Track and manage all corrective & preventive actions</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm flex-shrink-0">
          <Plus size={15} /> <span className="hidden sm:inline">New Action</span><span className="sm:hidden">New</span>
        </Button>
      </div>

      <SummaryCards cards={[
        { icon: '📋', label: 'Total', value: filtered.length, color: 'text-gray-800' },
        { icon: '🔴', label: 'Open', value: open, color: 'text-red-600' },
        { icon: '⏰', label: 'Overdue', value: overdue, color: 'text-rose-600' },
        { icon: '✅', label: 'Completed', value: completed, color: 'text-emerald-600' },
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
      >
        {/* Priority inline filter */}
      </FilterBar>

      {/* Priority quick filter pills */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-gray-500 font-medium self-center">Priority:</span>
        {[{ value: '', label: 'All' }, ...PRIORITY_OPTS].map(p => (
          <button key={p.value} onClick={() => setFilters(prev => ({ ...prev, priority: p.value }))}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              filters.priority === p.value
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      <Table
        columns={columns}
        data={filtered}
        actions={[
          { id: 'edit', label: 'Edit', icon: Edit },
          { id: 'delete', label: 'Delete', icon: Trash2 },
        ]}
        onActionClick={(action, row) => {
          if (action === 'edit') openModal(row);
          if (action === 'delete') setDeleteModal({ isOpen: true, id: row.id });
        }}
        maxHeight="calc(100vh - 460px)"
        className="min-w-[750px]"
        emptyMessage="No corrective actions found."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit Corrective Action' : 'New Corrective Action'}
        size="lg"
        footerActions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setIsModalOpen(false) },
          { label: editing ? 'Update' : 'Create Action', variant: 'primary', onClick: handleSubmit },
        ]}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Action Title *</label>
            <input value={formData.title} onChange={e => f('title', e.target.value)} placeholder="e.g. Install anti-slip mats at loading dock" className={INPUT_CLS} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea value={formData.description} onChange={e => f('description', e.target.value)} rows={3} placeholder="Detailed description of what needs to be done..." className={INPUT_CLS} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect label="Assign To" value={formData.assignedTo} onChange={handleEmpSelect}
              options={users.map(e => ({ value: e.id, label: `${e.name} — ${e.designation}` }))}
              placeholder="Select employee..."
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
              <input type="date" value={formData.dueDate} onChange={e => f('dueDate', e.target.value)} className={INPUT_CLS} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect label="Priority" value={formData.priority} onChange={v => f('priority', v)} options={PRIORITY_OPTS} />
            <CustomSelect label="Status" value={formData.status} onChange={v => f('status', v)}
              options={[{ value: 'open', label: 'Open' }, { value: 'in-progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }]}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Action"
        size="sm"
        footerActions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setDeleteModal({ isOpen: false, id: null }) },
          { label: 'Delete', variant: 'danger', onClick: () => { deleteLocalCorrectiveAction(deleteModal.id); refresh(); setDeleteModal({ isOpen: false, id: null }); } },
        ]}
      >
        <div className="text-center py-6 space-y-3">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto"><Trash2 size={22} className="text-red-600" /></div>
          <p className="text-sm text-gray-600">Delete this corrective action? This cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
}