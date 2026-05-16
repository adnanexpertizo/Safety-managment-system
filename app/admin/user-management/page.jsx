'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Eye, Edit, Trash2, UserCheck, UserX, Shield } from 'lucide-react';

import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';
import SummaryCards from '@/components/SummaryCards';

import {
  getLocalUsers,
  addLocalUser,
  updateLocalUser,
  deleteLocalUser,
} from '@/lib/localStorage';

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const map = {
    ADMIN: { cls: 'bg-purple-100 text-purple-700', icon: '👑' },
    SUPERVISOR: { cls: 'bg-blue-100 text-blue-700', icon: '🔷' },
    OFFICER: { cls: 'bg-amber-100 text-amber-700', icon: '🛡️' },
    TECHNICIAN: { cls: 'bg-cyan-100 text-cyan-700', icon: '⚙️' },
    COORDINATOR: { cls: 'bg-indigo-100 text-indigo-700', icon: '📋' },
  };
  const r = map[role] || { cls: 'bg-gray-100 text-gray-600', icon: '👤' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${r.cls}`}>
      {r.icon} {role}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
      status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
    }`}>
      {status === 'Active' ? <UserCheck size={10} /> : <UserX size={10} />} {status}
    </span>
  );
}

// ─── Avatar Initials ──────────────────────────────────────────────────────────
function Avatar({ name, size = 'sm' }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-8 h-8 text-xs';
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

const EMPTY_FORM = {
  name: '', email: '', role: 'OFFICER',
  department: '', designation: '', status: 'Active',
};

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: '👑 Admin' },
  { value: 'SUPERVISOR', label: '🔷 Supervisor' },
  { value: 'OFFICER', label: '🛡️ Safety Officer' },
  { value: 'TECHNICIAN', label: '⚙️ Technician' },
  { value: 'COORDINATOR', label: '📋 Coordinator' },
];

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [filters, setFilters] = useState({ search: '', department: 'All department', designation: 'All designation', status: '' });

  const refresh = () => setUsers(getLocalUsers());
  useEffect(() => { refresh(); }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !filters.search ||
        [u.name, u.email, u.designation, u.department].some(f =>
          f?.toLowerCase().includes(filters.search.toLowerCase())
        );
      const matchDept = filters.department === 'All department' || !filters.department || u.department === filters.department;
      const matchDesig = filters.designation === 'All designation' || !filters.designation || u.designation === filters.designation;
      const matchStatus = !filters.status || u.status === filters.status;
      return matchSearch && matchDept && matchDesig && matchStatus;
    });
  }, [users, filters]);

  const departments = ['All department', ...new Set(users.map(u => u.department).filter(Boolean))];
  const designations = ['All designation', ...new Set(users.map(u => u.designation).filter(Boolean))];

  const openModal = (user = null) => {
    setEditingUser(user);
    setFormData(user ? { ...user } : EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email) return;
    if (editingUser) updateLocalUser(editingUser.id, formData);
    else addLocalUser(formData);
    refresh();
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    deleteLocalUser(deleteModal.id);
    refresh();
    setDeleteModal({ isOpen: false, id: null, name: '' });
  };

  const field = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const totalActive = users.filter(u => u.status === 'Active').length;
  const totalAdmins = users.filter(u => u.role === 'ADMIN').length;
  const depts = new Set(users.map(u => u.department).filter(Boolean)).size;

  const columns = [
    {
      key: 'name', label: 'Employee',
      className: 'min-w-[200px]',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{row.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'department', label: 'Department', className: 'min-w-[120px]' },
    { key: 'designation', label: 'Designation', className: 'min-w-[140px]' },
    {
      key: 'role', label: 'Role', className: 'min-w-[130px]',
      render: (row) => <RoleBadge role={row.role} />
    },
    {
      key: 'status', label: 'Status', className: 'min-w-[100px]',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'createdAt', label: 'Joined', className: 'min-w-[110px]',
      type: 'date',
    },
  ];

  const tableActions = [
    { id: 'view', label: 'View', icon: Eye },
    { id: 'edit', label: 'Edit', icon: Edit },
    { id: 'delete', label: 'Delete', icon: Trash2 },
  ];

  const statusFilterOpts = [
    { value: '', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-slate-600" /> User Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Manage employees, roles, and access</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm flex-shrink-0">
          <Plus size={15} /> <span className="hidden sm:inline">Add User</span><span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Summary */}
      <SummaryCards cards={[
        { icon: <Users size={18} className="text-slate-600" />, label: 'Total Users', value: users.length, bg: 'bg-slate-50', color: 'text-slate-700' },
        { icon: <UserCheck size={18} className="text-emerald-600" />, label: 'Active', value: totalActive, bg: 'bg-emerald-50', color: 'text-emerald-700' },
        { icon: <Shield size={18} className="text-purple-600" />, label: 'Admins', value: totalAdmins, bg: 'bg-purple-50', color: 'text-purple-700' },
        { icon: <Users size={18} className="text-blue-600" />, label: 'Departments', value: depts, bg: 'bg-blue-50', color: 'text-blue-700' },
      ]} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        showReportType={false}
        showCategory={false}
        showEmployee={false}
        showDepartment={true}
        showDesignation={true}
        showSearch={true}
        showStatus={true}
        customStatusOptions={statusFilterOpts}
        departments={departments}
        designations={designations}
      />

      {/* Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        actions={tableActions}
        onActionClick={(action, row) => {
          if (action === 'view') router.push(`/admin/user-management/${row.id}`);
          if (action === 'edit') openModal(row);
          if (action === 'delete') setDeleteModal({ isOpen: true, id: row.id, name: row.name });
        }}
        maxHeight="520px"
        className="min-w-[700px]"
        emptyMessage="No users found. Add your first user!"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit User — ${editingUser.name}` : 'Add New User'}
        size="lg"
        footerActions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setIsModalOpen(false) },
          { label: editingUser ? 'Update User' : 'Create User', variant: 'primary', onClick: handleSubmit },
        ]}
      >
        <div className="space-y-5 py-2">
          {/* Avatar preview */}
          {formData.name && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Avatar name={formData.name} size="lg" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{formData.name}</p>
                <p className="text-xs text-gray-400">{formData.designation || 'No designation'} • {formData.department || 'No department'}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
              <input
                value={formData.name}
                onChange={e => field('name', e.target.value)}
                placeholder="Enter full name"
                className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => field('email', e.target.value)}
                placeholder="user@company.com"
                className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Department</label>
              <input
                value={formData.department}
                onChange={e => field('department', e.target.value)}
                placeholder="e.g. HSE, Operations"
                className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Designation</label>
              <input
                value={formData.designation}
                onChange={e => field('designation', e.target.value)}
                placeholder="e.g. Safety Manager"
                className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:outline-none transition"
              />
            </div>
            <CustomSelect label="Role" value={formData.role} onChange={v => field('role', v)} options={ROLE_OPTIONS} />
            <CustomSelect label="Status" value={formData.status} onChange={v => field('status', v)} options={STATUS_OPTIONS} />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        title="Delete User"
        size="sm"
        footerActions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setDeleteModal({ isOpen: false, id: null, name: '' }) },
          { label: 'Delete', variant: 'danger', onClick: handleDelete },
        ]}
      >
        <div className="text-center py-6 space-y-3">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Delete {deleteModal.name}?</p>
            <p className="text-xs text-gray-500 mt-1">This action cannot be undone.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}