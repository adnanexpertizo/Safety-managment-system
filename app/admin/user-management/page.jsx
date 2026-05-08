'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';

import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';

import {
  getLocalUsers,
  addLocalUser,
  updateLocalUser,
  deleteLocalUser
} from '@/lib/localStorage';

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'OFFICER',
    department: '',
    designation: '',
    status: 'Active',
  });

  // Load users
  useEffect(() => {
    setUsers(getLocalUsers());
  }, []);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.designation?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = 
        departmentFilter === 'All' || user.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [users, searchTerm, departmentFilter]);

  const departments = ['All', ...new Set(users.map(u => u.department).filter(Boolean))];

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ ...user });
    } else {
      setEditingUser(null);
      setFormData({
        name: '', 
        email: '', 
        role: 'OFFICER', 
        department: '',
        designation: '', 
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (editingUser) {
      updateLocalUser(editingUser.id, formData);
    } else {
      addLocalUser(formData);
    }
    setUsers(getLocalUsers());
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    deleteLocalUser(deleteModal.id);
    setUsers(getLocalUsers());
    setDeleteModal({ isOpen: false, id: null });
  };

  // uuuu
   // ✅ Corrected Columns
 const actions = [
    { 
      id: 'view', 
      label: 'View', 
      icon: Eye 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: Edit 
    },
    { 
      id: 'delete', 
      label: 'Delete', 
      icon: Trash2 
    },
  ];

  // Columns (without actions column)
  const columns = [
    { key: 'name', label: 'Employee Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { 
      key: 'role', 
      label: 'Role',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium
          ${row.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
            row.role === 'SUPERVISOR' ? 'bg-blue-100 text-blue-700' : 
            'bg-amber-100 text-amber-700'}`}>
          {row.role}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium
          ${row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.status}
        </span>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8" /> User Management
          </h1>
          <p className="text-gray-500 mt-1">Manage employees, roles, and access</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus size={18} /> Add New User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        <CustomSelect
          value={departmentFilter}
          onChange={setDepartmentFilter}
          options={departments.map(dep => ({ value: dep, label: dep }))}
          className="w-full md:w-64"
        />
      </div>

      {/* Table */}
      <Table
          columns={columns}
          data={filteredUsers}
          actions={actions}
          onActionClick={(action, row) => {
            // the view button is not visibale in the table but it is working when we click on the row
            if (action === 'view') router.push(`/admin/user-management/${row.id}`);
            if (action === 'edit') openModal(row);
            if (action === 'delete') setDeleteModal({ isOpen: true, id: row.id });
          }}
          maxHeight="calc(100vh - 280px)"
        />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit User" : "Add New User"}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <CustomSelect
              label="Role"
              value={formData.role}
              onChange={(v) => setFormData({ ...formData, role: v })}
              options={[
                { value: 'ADMIN', label: 'Admin' },
                { value: 'OFFICER', label: 'Safety Officer' },
                { value: 'SUPERVISOR', label: 'Supervisor' },
                { value: 'TECHNICIAN', label: 'Technician' },
                { value: 'COORDINATOR', label: 'Coordinator' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              placeholder="e.g. HSE, Operations"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              placeholder="e.g. Safety Manager"
            />
          </div>

          <div>
            <CustomSelect
              label="Status"
              value={formData.status}
              onChange={(v) => setFormData({ ...formData, status: v })}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Confirm Delete"
      >
        <p className="text-center py-6 text-gray-600">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setDeleteModal({ isOpen: false, id: null })}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Yes, Delete User
          </Button>
        </div>
      </Modal>
    </div>
  );
}