'use client';

import { useEffect, useState, useMemo } from 'react';
import { CheckCircle2, Clock, AlertCircle, Edit, Trash2 } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';
import SummaryCards from '@/components/SummaryCards';
import {
  getLocalCorrectiveActions, updateLocalCorrectiveAction, deleteLocalCorrectiveAction,
} from '@/lib/localStorage';
import { useUser } from '@/context/UserContext';

const INPUT_CLS = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:outline-none transition hover:border-gray-300';

function StatusBadge({ status }) {
  const map = {
    open:        { cls: 'bg-red-100 text-red-700',     icon: <AlertCircle size={10} />,  label: 'Open'        },
    'in-progress': { cls: 'bg-blue-100 text-blue-700', icon: <Clock size={10} />,        label: 'In Progress' },
    completed:   { cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={10} />, label: 'Completed' },
  };
  const s = map[status] || map.open;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    high:   'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low:    'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${map[priority] || map.low}`}>
      {priority}
    </span>
  );
}

const STATUS_OPTS = [
  { value: '',            label: 'All Statuses'  },
  { value: 'open',        label: 'Open'          },
  { value: 'in-progress', label: 'In Progress'   },
  { value: 'completed',   label: 'Completed'     },
];

const PRIORITY_OPTS = [
  { value: 'low',    label: 'Low'    },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High'   },
];

export default function OfficerCorrectiveActions() {
  const { user } = useUser();
  const [actions, setActions] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [formData, setFormData] = useState({ status: 'open', priority: 'medium', notes: '' });
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    if (!user) return;
    setActions(getLocalCorrectiveActions().filter(a => a.assignedTo === user.id));
  };

  useEffect(() => { refresh(); setLoading(false); }, [user]);

  const filtered = useMemo(() => {
    let r = [...actions];
    if (filters.status)   r = r.filter(a => a.status   === filters.status);
    if (filters.priority) r = r.filter(a => a.priority === filters.priority);
    if (filters.search) {
      const t = filters.search.toLowerCase();
      r = r.filter(a => [a.title, a.description].some(f => f?.toLowerCase().includes(t)));
    }
    return r;
  }, [actions, filters]);

  const open      = filtered.filter(a => a.status === 'open').length;
  const completed = filtered.filter(a => a.status === 'completed').length;
  const overdue   = filtered.filter(a =>
    a.status !== 'completed' && a.dueDate && new Date(a.dueDate) < new Date()
  ).length;

  // Officer can only update status & add notes — not edit full record
  const openUpdateModal = (item) => {
    setEditing(item);
    setFormData({ status: item.status || 'open', priority: item.priority || 'medium', notes: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!editing) return;
    updateLocalCorrectiveAction(editing.id, {
      status: formData.status,
      ...(formData.notes ? { statusNote: formData.notes } : {}),
    });
    refresh();
    setIsModalOpen(false);
  };

  const f = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const columns = [
    {
      key: 'title', label: 'Action Title', className: 'min-w-[200px]',
      render: r => (
        <div>
          <p className="text-sm font-semibold text-gray-900">{r.title}</p>
          {r.description && (
            <p className="text-[10px] text-gray-400 truncate max-w-[220px]">{r.description}</p>
          )}
        </div>
      ),
    },
    { key: 'priority', label: 'Priority', render: r => <PriorityBadge priority={r.priority} /> },
    {
      key: 'dueDate', label: 'Due Date', className: 'min-w-[110px]',
      render: r => {
        const isOverdue = r.status !== 'completed' && r.dueDate && new Date(r.dueDate) < new Date();
        return (
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
            {r.dueDate
              ? new Date(r.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '—'}
            {isOverdue && (
              <span className="ml-1.5 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">
                Overdue
              </span>
            )}
          </span>
        );
      },
    },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'linkedReportType', label: 'Linked To',
      render: r => r.linkedReportId
        ? <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium capitalize">{r.linkedReportType || 'Report'}</span>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    { key: 'createdAt', label: 'Created', type: 'date' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-slate-600" /> My Corrective Actions
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Actions assigned to you — update your progress</p>
      </div>

      <SummaryCards cards={[
        { icon: '📋', label: 'Total',     value: filtered.length, color: 'text-gray-800'    },
        { icon: '🔴', label: 'Open',      value: open,            color: 'text-red-600'     },
        { icon: '⏰', label: 'Overdue',   value: overdue,         color: 'text-rose-600'    },
        { icon: '✅', label: 'Completed', value: completed,       color: 'text-emerald-600' },
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

      {/* Priority quick-filter pills */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-gray-500 font-medium self-center">Priority:</span>
        {[{ value: '', label: 'All' }, ...PRIORITY_OPTS].map(p => (
          <button
            key={p.value}
            onClick={() => setFilters(prev => ({ ...prev, priority: p.value }))}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              filters.priority === p.value
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Overdue alert banner */}
      {overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">
              {overdue} overdue action{overdue > 1 ? 's' : ''} need immediate attention
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              Please update your progress or complete these actions as soon as possible.
            </p>
          </div>
        </div>
      )}

      <Table
        columns={columns}
        data={filtered}
        actions={[{ id: 'update', label: 'Update Status', icon: Edit }]}
        onActionClick={(action, row) => {
          if (action === 'update') openUpdateModal(row);
        }}
        maxHeight="calc(100vh - 480px)"
        className="min-w-[750px]"
        emptyMessage="No corrective actions assigned to you."
      />

      {/* Update Status Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Update Action — ${editing?.title || ''}`}
        size="md"
        footerActions={[
          { label: 'Cancel',        variant: 'secondary', onClick: () => setIsModalOpen(false) },
          { label: 'Save Progress', variant: 'primary',   onClick: handleSubmit },
        ]}
      >
        <div className="space-y-5 py-2">

          {/* Action summary */}
          {editing && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-1">
              <p className="text-sm font-semibold text-gray-900">{editing.title}</p>
              {editing.description && (
                <p className="text-xs text-gray-500 leading-relaxed">{editing.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <PriorityBadge priority={editing.priority} />
                {editing.dueDate && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    new Date(editing.dueDate) < new Date() && editing.status !== 'completed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    Due: {new Date(editing.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          )}

          <CustomSelect
            label="Update Status"
            value={formData.status}
            onChange={v => f('status', v)}
            options={[
              { value: 'open',        label: '🔴 Open'        },
              { value: 'in-progress', label: '🔵 In Progress' },
              { value: 'completed',   label: '✅ Completed'   },
            ]}
          />

          {formData.status === 'completed' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <p className="text-xs text-emerald-700 font-medium">
                Marking as completed will record the current timestamp automatically.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Progress Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={e => f('notes', e.target.value)}
              rows={3}
              placeholder="Describe what you have done or any observations..."
              className={INPUT_CLS}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}