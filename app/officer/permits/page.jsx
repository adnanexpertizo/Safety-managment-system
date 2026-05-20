'use client';

import { useEffect, useState, useMemo } from 'react';
import { FileCheck, Eye, Clock, CheckCircle2, XCircle } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import SummaryCards from '@/components/SummaryCards';
import { getLocalPermits } from '@/lib/localStorage';
import { useUser } from '@/context/UserContext';

function StatusBadge({ status }) {
  const map = {
    pending:   { cls: 'bg-amber-100 text-amber-700',   icon: <Clock size={10} /> },
    active:    { cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={10} /> },
    completed: { cls: 'bg-gray-100 text-gray-600',      icon: <XCircle size={10} /> },
    cancelled: { cls: 'bg-red-100 text-red-700',        icon: <XCircle size={10} /> },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${s.cls}`}>
      {s.icon} {status}
    </span>
  );
}

function TypeBadge({ type }) {
  const colors = {
    'Hot Work':            'bg-red-50 text-red-700',
    'Confined Space':      'bg-purple-50 text-purple-700',
    'Electrical Isolation':'bg-blue-50 text-blue-700',
    'Working at Height':   'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${colors[type] || 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>
  );
}

function ViewPermitModal({ permit }) {
  if (!permit) return null;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <TypeBadge type={permit.type} />
        <StatusBadge status={permit.status} />
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] rounded-full font-semibold">
          {permit.permitNumber}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          ['Location',    permit.location],
          ['Issued By',   permit.issuer],
          ['Assigned To', permit.assignedName],
          ['Start Date',  permit.startDate],
          ['End Date',    permit.endDate],
          ['Time',        `${permit.startTime || '—'} – ${permit.endTime || '—'}`],
        ].map(([l, v]) => (
          <div key={l} className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{l}</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{v || '—'}</p>
          </div>
        ))}
      </div>

      {[['Hazards Identified', permit.hazards], ['Precautions & Controls', permit.precautions]]
        .filter(([, v]) => v)
        .map(([l, v]) => (
          <div key={l}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{l}</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{v}</p>
          </div>
        ))}

      {/* Status History */}
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
                <p className="text-[10px] text-gray-400">
                  {h.date ? new Date(h.date).toLocaleString() : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety reminder for active permits */}
      {permit.status === 'active' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="text-xs font-bold text-amber-800">Active Permit — Stay Safe</p>
            <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
              Ensure all precautions are followed. Keep this permit accessible at the work site at all times.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_OPTS = [
  { value: '',          label: 'All Statuses' },
  { value: 'pending',   label: 'Pending' },
  { value: 'active',    label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OfficerPermits() {
  const { user } = useUser();
  const [permits, setPermits] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [viewModal, setViewModal] = useState({ isOpen: false, permit: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setPermits(getLocalPermits().filter(p => p.assignedTo === user.id));
    setLoading(false);
  }, [user]);

  const filtered = useMemo(() => {
    let r = [...permits];
    if (filters.status) r = r.filter(p => p.status === filters.status);
    if (filters.search) {
      const t = filters.search.toLowerCase();
      r = r.filter(p =>
        [p.title, p.location, p.type, p.permitNumber].some(f => f?.toLowerCase().includes(t))
      );
    }
    return r;
  }, [permits, filters]);

  const columns = [
    {
      key: 'permitNumber', label: 'Permit #', className: 'min-w-[120px]',
      render: r => <span className="text-xs font-mono font-bold text-slate-700">{r.permitNumber}</span>,
    },
    { key: 'type',       label: 'Type',     className: 'min-w-[150px]', render: r => <TypeBadge type={r.type} /> },
    {
      key: 'title', label: 'Title', className: 'min-w-[180px]',
      render: r => <span className="text-xs font-semibold text-gray-800">{r.title}</span>,
    },
    { key: 'location',  label: 'Location',   className: 'min-w-[130px]' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate',   label: 'End Date',   type: 'date' },
    { key: 'status',    label: 'Status',     render: r => <StatusBadge status={r.status} /> },
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
          <FileCheck size={20} className="text-slate-600" /> My Permits
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Work permits assigned to you</p>
      </div>

      <SummaryCards cards={[
        { icon: '📋', label: 'Total',     value: filtered.length,                                      color: 'text-gray-800'    },
        { icon: '⏳', label: 'Pending',   value: filtered.filter(p => p.status === 'pending').length,   color: 'text-amber-600'   },
        { icon: '✅', label: 'Active',    value: filtered.filter(p => p.status === 'active').length,    color: 'text-emerald-600' },
        { icon: '🔒', label: 'Completed', value: filtered.filter(p => p.status === 'completed').length, color: 'text-gray-600'    },
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
        actions={[{ id: 'view', label: 'View', icon: Eye }]}
        onActionClick={(action, row) => {
          if (action === 'view') setViewModal({ isOpen: true, permit: row });
        }}
        maxHeight="calc(100vh - 400px)"
        className="min-w-[700px]"
        emptyMessage="No permits assigned to you."
      />

      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, permit: null })}
        title={viewModal.permit?.title || 'Permit Details'}
        size="lg"
      >
        <ViewPermitModal permit={viewModal.permit} />
      </Modal>
    </div>
  );
}