'use client';

import { useEffect, useState, useMemo } from 'react';
import { FileCheck, Plus, Edit, Trash2, Eye, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';
import SummaryCards from '@/components/SummaryCards';
import { getLocalPermits, addLocalPermit, updateLocalPermit, deleteLocalPermit, getLocalUsers } from '@/lib/localStorage';

const INPUT_CLS = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:outline-none transition hover:border-gray-300';

const PERMIT_TYPES = ['Hot Work', 'Confined Space', 'Electrical Isolation', 'Working at Height', 'Excavation', 'Cold Work', 'Chemical Handling'];

function StatusBadge({ status }) {
  const map = {
    pending: { cls: 'bg-amber-100 text-amber-700', icon: <Clock size={10} /> },
    active: { cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={10} /> },
    completed: { cls: 'bg-gray-100 text-gray-600', icon: <XCircle size={10} /> },
    cancelled: { cls: 'bg-red-100 text-red-700', icon: <XCircle size={10} /> },
  };
  const s = map[status] || map.pending;
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${s.cls}`}>{s.icon}{status}</span>;
}

function TypeBadge({ type }) {
  const colors = { 'Hot Work': 'bg-red-50 text-red-700', 'Confined Space': 'bg-purple-50 text-purple-700', 'Electrical Isolation': 'bg-blue-50 text-blue-700', 'Working at Height': 'bg-amber-50 text-amber-700' };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${colors[type] || 'bg-gray-100 text-gray-600'}`}>{type}</span>;
}

function ViewPermitModal({ permit, onEdit }) {
  if (!permit) return null;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <TypeBadge type={permit.type} />
        <StatusBadge status={permit.status} />
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] rounded-full font-semibold">{permit.permitNumber}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          ['Location', permit.location], ['Issued By', permit.issuer],
          ['Assigned To', permit.assignedName], ['Start Date', permit.startDate],
          ['End Date', permit.endDate], ['Time', `${permit.startTime} – ${permit.endTime}`],
        ].map(([l, v]) => (
          <div key={l} className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{l}</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{v || '—'}</p>
          </div>
        ))}
      </div>

      {[['Hazards Identified', permit.hazards], ['Precautions & Controls', permit.precautions]].filter(([, v]) => v).map(([l, v]) => (
        <div key={l}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{l}</p>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{v}</p>
        </div>
      ))}

      {/* Timeline */}
      {permit.status_history?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Status History</p>
          <div className="relative pl-5 space-y-3">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
            {[...permit.status_history].reverse().map((h, i) => (
              <div key={i} className="relative">
                <div className={`absolute -left-[14px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${i === 0 ? 'bg-slate-700' : 'bg-gray-300'}`} />
                <p className="text-xs font-bold text-gray-800 capitalize">{h.status}</p>
                {h.note && <p className="text-[10px] text-gray-500">{h.note}</p>}
                <p className="text-[10px] text-gray-400">{h.date ? new Date(h.date).toLocaleString() : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onEdit} variant="outline" size="sm" className="flex items-center gap-1.5"><Edit size={13} /> Edit Permit</Button>
      </div>
    </div>
  );
}

const EMPTY = { type: 'Hot Work', title: '', location: '', assignedTo: '', assignedName: '', startDate: '', endDate: '', startTime: '08:00', endTime: '17:00', status: 'pending', hazards: '', precautions: '' };

const STATUS_OPTS = [{ value: '', label: 'All Statuses' }, { value: 'pending', label: 'Pending' }, { value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }];

export default function PermitsPage() {
  const [permits, setPermits] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewModal, setViewModal] = useState({ isOpen: false, permit: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = () => setPermits(getLocalPermits());
  useEffect(() => { refresh(); setUsers(Array.isArray(getLocalUsers()) ? getLocalUsers() : []); setLoading(false); }, []);

  const filtered = useMemo(() => {
    let r = [...permits];
    if (filters.status) r = r.filter(p => p.status === filters.status);
    if (filters.search) { const t = filters.search.toLowerCase(); r = r.filter(p => [p.title, p.location, p.type, p.assignedName, p.permitNumber].some(f => f?.toLowerCase().includes(t))); }
    return r;
  }, [permits, filters]);

  const openModal = (item = null) => { setEditing(item); setFormData(item ? { ...EMPTY, ...item } : EMPTY); setIsModalOpen(true); };

  const handleEmpSelect = (id) => { const emp = users.find(e => e.id === id); setFormData(p => ({ ...p, assignedTo: id, assignedName: emp?.name || '' })); };

  const handleSubmit = () => {
    if (!formData.title) return;
    if (editing) updateLocalPermit(editing.id, formData);
    else addLocalPermit({ ...formData, issuer: users.find(u => u.role === 'ADMIN')?.name || 'Admin', issuerId: users.find(u => u.role === 'ADMIN')?.id || '' });
    refresh(); setIsModalOpen(false);
  };

  const f = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const columns = [
    { key: 'permitNumber', label: 'Permit #', className: 'min-w-[120px]', render: r => <span className="text-xs font-mono font-bold text-slate-700">{r.permitNumber}</span> },
    { key: 'type', label: 'Type', className: 'min-w-[150px]', render: r => <TypeBadge type={r.type} /> },
    { key: 'title', label: 'Title', className: 'min-w-[180px]', render: r => <span className="text-xs font-semibold text-gray-800">{r.title}</span> },
    { key: 'location', label: 'Location', className: 'min-w-[130px]' },
    { key: 'assignedName', label: 'Assigned To' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate', label: 'End Date', type: 'date' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-slate-700 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">

      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck size={20} className="text-slate-600" /> Permit to Work
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Issue and manage work permits for high-risk activities</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm flex-shrink-0">
          <Plus size={15} /> <span className="hidden sm:inline">New Permit</span><span className="sm:hidden">New</span>
        </Button>
      </div>

      <SummaryCards cards={[
        { icon: '📋', label: 'Total', value: filtered.length, color: 'text-gray-800' },
        { icon: '⏳', label: 'Pending', value: filtered.filter(p => p.status === 'pending').length, color: 'text-amber-600' },
        { icon: '✅', label: 'Active', value: filtered.filter(p => p.status === 'active').length, color: 'text-emerald-600' },
        { icon: '🔒', label: 'Completed', value: filtered.filter(p => p.status === 'completed').length, color: 'text-gray-600' },
      ]} />

      <FilterBar filters={filters} onFilterChange={setFilters} showStatus={true} showSearch={true} showReportType={false} showCategory={false} showEmployee={false} customStatusOptions={STATUS_OPTS} />

      <Table
        columns={columns}
        data={filtered}
        actions={[{ id: 'view', label: 'View', icon: Eye }, { id: 'edit', label: 'Edit', icon: Edit }, { id: 'delete', label: 'Delete', icon: Trash2 }]}
        onActionClick={(action, row) => {
          if (action === 'view') setViewModal({ isOpen: true, permit: row });
          if (action === 'edit') openModal(row);
          if (action === 'delete') setDeleteModal({ isOpen: true, id: row.id });
        }}
        maxHeight="calc(100vh - 400px)"
        className="min-w-[800px]"
        emptyMessage="No permits found. Issue your first permit."
      />

      {/* View */}
      <Modal isOpen={viewModal.isOpen} onClose={() => setViewModal({ isOpen: false, permit: null })} title={viewModal.permit?.title || 'Permit Details'} size="lg">
        <ViewPermitModal permit={viewModal.permit} onEdit={() => { openModal(viewModal.permit); setViewModal({ isOpen: false, permit: null }); }} />
      </Modal>

      {/* Add/Edit */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Permit' : 'New Permit to Work'} size="lg"
        footerActions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setIsModalOpen(false) },
          { label: editing ? 'Update Permit' : 'Issue Permit', variant: 'primary', onClick: handleSubmit },
        ]}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Permit Title *</label>
            <input value={formData.title} onChange={e => f('title', e.target.value)} placeholder="e.g. Welding on Rooftop Structure" className={INPUT_CLS} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect label="Permit Type" value={formData.type} onChange={v => f('type', v)} options={PERMIT_TYPES.map(t => ({ value: t, label: t }))} />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input value={formData.location} onChange={e => f('location', e.target.value)} placeholder="e.g. Rooftop Block A" className={INPUT_CLS} />
            </div>
          </div>

          <CustomSelect label="Assign Worker" value={formData.assignedTo} onChange={handleEmpSelect}
            options={users.map(e => ({ value: e.id, label: `${e.name} — ${e.designation}` }))} placeholder="Select worker..."
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <input type="date" value={formData.startDate} onChange={e => f('startDate', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <input type="date" value={formData.endDate} onChange={e => f('endDate', e.target.value)} className={INPUT_CLS} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
              <input type="time" value={formData.startTime} onChange={e => f('startTime', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
              <input type="time" value={formData.endTime} onChange={e => f('endTime', e.target.value)} className={INPUT_CLS} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hazards Identified</label>
            <textarea value={formData.hazards} onChange={e => f('hazards', e.target.value)} rows={2} placeholder="e.g. Fire, Burns, Fumes from welding" className={INPUT_CLS} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Precautions & Controls</label>
            <textarea value={formData.precautions} onChange={e => f('precautions', e.target.value)} rows={3} placeholder="e.g. Fire extinguisher on site, PPE required, area barricaded" className={INPUT_CLS} />
          </div>

          <CustomSelect label="Status" value={formData.status} onChange={v => f('status', v)}
            options={[{ value: 'pending', label: 'Pending' }, { value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }]}
          />
        </div>
      </Modal>

      {/* Delete */}
      <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, id: null })} title="Delete Permit" size="sm"
        footerActions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setDeleteModal({ isOpen: false, id: null }) },
          { label: 'Delete', variant: 'danger', onClick: () => { deleteLocalPermit(deleteModal.id); refresh(); setDeleteModal({ isOpen: false, id: null }); } },
        ]}
      >
        <div className="text-center py-6 space-y-3">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto"><Trash2 size={22} className="text-red-600" /></div>
          <p className="text-sm text-gray-600">Delete this permit? This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
}