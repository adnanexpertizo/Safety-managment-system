'use client';

import { useEffect, useState } from 'react';
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
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'OFFICER',
    department: '',
    designation: '',
    status: 'Active',
  });

  // Load users from localStorage
  useEffect(() => {
    setUsers(getLocalUsers());
  }, []);

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
        status: 'Active',
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
    setUsers(getLocalUsers()); // Refresh
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    deleteLocalUser(deleteModal.id);
    setUsers(getLocalUsers());
    setDeleteModal({ isOpen: false, id: null });
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'status', label: 'Status' },
  ];

  const actions = [
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-500">Manage system users and their roles</p>
        </div>
        <Button onClick={() => openModal()}>+ Add New User</Button>
      </div>

      <Table
        columns={columns}
        data={users}
        actions={actions}
        onActionClick={(action, row) => {
          if (action === 'edit') openModal(row);
          if (action === 'delete') setDeleteModal({ isOpen: true, id: row.id });
        }}
        maxHeight="600px"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit User" : "Add New User"}
        size="md"
        footerActions={[
          { label: "Cancel", variant: "secondary", onClick: () => setIsModalOpen(false) },
          { label: "Save", variant: "primary", onClick: handleSubmit },
        ]}
      >
        <div className="space-y-5 py-2">
          <input
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-border rounded-xl"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-border rounded-xl"
          />

          <CustomSelect
            label="Role"
            value={formData.role}
            onChange={(v) => setFormData({ ...formData, role: v })}
            options={[
              { value: 'ADMIN', label: 'Admin' },
              { value: 'OFFICER', label: 'Safety Officer' },
              { value: 'SUPERVISOR', label: 'Supervisor' },
            ]}
          />

          <input
            placeholder="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full px-4 py-3 border border-border rounded-xl"
          />

          <input
            placeholder="Designation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            className="w-full px-4 py-3 border border-border rounded-xl"
          />

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
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete User"
        footerActions={[
          { label: "Cancel", variant: "secondary" },
          { label: "Delete", variant: "danger", onClick: handleDelete },
        ]}
      >
        <p className="text-center py-6">Are you sure you want to delete this user?</p>
      </Modal>
    </div>
  );
}