'use client';

import { useEffect, useState, useMemo } from 'react';
import { Edit, Trash2 } from 'lucide-react';   // ← Icons Added

import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';
import SummaryCards from '@/components/SummaryCards';

import {
  getLocalTrainings,
  addLocalTraining,
  updateLocalTraining,
  deleteLocalTraining,
  getLocalUsers,
} from '@/lib/localStorage';

export default function AdminTrainings() {
  const [trainings, setTrainings] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    trainerId: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    trainerId: '',
    trainer: '',
    date: '',
    duration: '',
    participants: 0,
    status: 'Scheduled',
    score: '',
  });

  // Load Data
  useEffect(() => {
    const data = getLocalTrainings();
    const userList = getLocalUsers();
    setTrainings(data);
    setUsers(Array.isArray(userList) ? userList : []);
    setLoading(false);
  }, []);

  // Filtering
  const filteredTrainings = useMemo(() => {
    let result = [...trainings];

    if (filters.status) result = result.filter(t => t.status === filters.status);
    if (filters.department) result = result.filter(t => t.department === filters.department);
    if (filters.trainerId) result = result.filter(t => t.trainerId === filters.trainerId);
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(t =>
        t.title?.toLowerCase().includes(term) ||
        t.trainer?.toLowerCase().includes(term) ||
        t.department?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [trainings, filters]);

  // Summary Stats
  const total = filteredTrainings.length;
  const completed = filteredTrainings.filter(t => t.status === 'Completed').length;
  const scheduled = filteredTrainings.filter(t => t.status === 'Scheduled').length;
  const avgScore = filteredTrainings.filter(t => t.score).length > 0
    ? Math.round(
        filteredTrainings.filter(t => t.score)
          .reduce((sum, t) => sum + Number(t.score), 0) /
        filteredTrainings.filter(t => t.score).length
      )
    : 0;

  const handleTrainerSelect = (trainerId) => {
    const trainer = users.find(u => u.id === trainerId);
    setFormData(prev => ({
      ...prev,
      trainerId,
      trainer: trainer?.name || '',
    }));
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingTraining(item);
      setFormData({
        title: item.title || '',
        department: item.department || '',
        trainerId: item.trainerId || '',
        trainer: item.trainer || '',
        date: item.date || '',
        duration: item.duration || '',
        participants: item.participants || 0,
        status: item.status || 'Scheduled',
        score: item.score || '',
      });
    } else {
      setEditingTraining(null);
      setFormData({
        title: '', department: '', trainerId: '', trainer: '',
        date: '', duration: '', participants: 0, status: 'Scheduled', score: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (editingTraining) {
      updateLocalTraining(editingTraining.id, formData);
    } else {
      addLocalTraining(formData);
    }
    setTrainings(getLocalTrainings());
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    deleteLocalTraining(deleteModal.id);
    setTrainings(getLocalTrainings());
    setDeleteModal({ isOpen: false, id: null });
  };

  const columns = [
    { key: 'title', label: 'Training Title' },
    { key: 'department', label: 'Department' },
    { key: 'trainer', label: 'Trainer' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'duration', label: 'Duration' },
    { key: 'participants', label: 'Participants' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'score', label: 'Score' },
  ];

  if (loading) return <p className="p-6 text-center text-lg">Loading trainings...</p>;

  return (
    <div className=" bg-gray-50 min-h-screen">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Training & Compliance
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Employee Safety Training Management
            </p>
          </div>
          <Button 
            onClick={() => openModal()} 
            className="w-full sm:w-auto px-6 py-3"
          >
            + New Training
          </Button>
        </div>

        {/* FilterBar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          showReportType={false}
          showCategory={false}
          customStatusOptions={[
            { value: '', label: 'All Statuses' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Scheduled', label: 'Scheduled' },
          ]}
        />

        {/* Summary Cards */}
        <SummaryCards
          cards={[
            { icon: "📊", label: "Total Trainings", value: total },
            { icon: "✅", label: "Completed", value: completed, color: "text-green-600" },
            { icon: "⏳", label: "Scheduled", value: scheduled, color: "text-blue-600" },
            { icon: "📈", label: "Avg Score", value: `${avgScore}%`, color: "text-amber-600" },
          ]}
        />

        {/* Table with Icons */}
        <Table
          columns={columns}
          data={filteredTrainings}
          actions={[
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
          ]}
          onActionClick={(action, row) => {
            if (action === 'edit') openModal(row);
            if (action === 'delete') setDeleteModal({ isOpen: true, id: row.id });
          }}
          // maxHeight="calc(100vh - 380px)"
          className="min-w-[900px] md:min-w-[1400px]"
        />
      </div>

      {/* Training Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTraining ? "Edit Training" : "New Training"}
        size="lg"
      >
        <div className="space-y-5 sm:space-y-6 max-h-[68vh] overflow-y-auto pr-2 py-3">
          <input
            placeholder="Training Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <CustomSelect
              label="Department"
              value={formData.department}
              onChange={(v) => setFormData({ ...formData, department: v })}
              options={[
                { value: 'Electrical', label: 'Electrical' },
                { value: 'Mechanical', label: 'Mechanical' },
                { value: 'HSE', label: 'HSE' },
                { value: 'Operations', label: 'Operations' },
              ]}
            />

            <CustomSelect
              label="Trainer"
              value={formData.trainerId}
              onChange={handleTrainerSelect}
              options={users.map(u => ({
                value: u.id,
                label: `${u.name} - ${u.designation}`,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
            <input
              placeholder="Duration (e.g. 4 hours)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <input
              type="number"
              placeholder="Number of Participants"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />

            <CustomSelect
              label="Status"
              value={formData.status}
              onChange={(v) => setFormData({ ...formData, status: v })}
              options={[
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'Completed', label: 'Completed' },
              ]}
            />
          </div>

          {formData.status === 'Completed' && (
            <input
              type="number"
              placeholder="Average Score (%)"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Training"
        size="sm"
      >
        <p className="text-center py-8 text-gray-600">
          Are you sure you want to delete this training record? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}