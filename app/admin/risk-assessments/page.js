'use client';

import { useEffect, useState, useMemo } from 'react';
import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';

import {
  getLocalRiskAssessments,
  addLocalRiskAssessment,
  updateLocalRiskAssessment,
  deleteLocalRiskAssessment,
  getLocalEmployees
} from '@/lib/localStorage';

const staticEmployees = [
  { id: 'emp1', name: 'John Smith', designation: 'Safety Officer' },
  { id: 'emp2', name: 'Adnan Rafiq', designation: 'HSE Manager' },
  { id: 'emp3', name: 'Muhammad Danish', designation: 'Supervisor' },
  { id: 'emp4', name: 'Abdullah Naseer', designation: 'Technician' },
  { id: 'emp5', name: 'Izhaan Saqib', designation: 'Safety Coordinator' },
];

export default function AdminRiskAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    activity: '',
    hazard: '',
    hazardCategory: '',
    location: '',
    likelihood: 3,
    severity: 3,
    existingControls: '',
    additionalControls: '',
    ppeRequired: '',
    responsiblePerson: '',
    status: 'open',
    reviewDate: '',
    assignedTo: '',
    assignedName: '',
    assignedDesignation: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Load Data from localStorage
  useEffect(() => {
    const data = getLocalRiskAssessments();
    setAssessments(data);
    setFilteredAssessments(data);
    setLoading(false);
  }, []);

  // Filtering
  const filteredData = useMemo(() => {
    let result = [...assessments];

    if (filters.status) result = result.filter(a => a.status === filters.status);
    if (filters.month) result = result.filter(a => a.month === parseInt(filters.month));
    if (filters.year) result = result.filter(a => a.year === parseInt(filters.year));

    return result;
  }, [assessments, filters]);

  const total = filteredData.length;
  const open = filteredData.filter(a => a.status === 'open').length;
  const highRisk = filteredData.filter(a => (a.riskScore || 0) >= 15).length;

  const calculateRiskScore = (l, s) => l * s;
  const getRiskLevel = (score) => score <= 5 ? 'Low' : score <= 10 ? 'Medium' : 'High';

  const handleEmployeeSelect = (id) => {
    const emp = staticEmployees.find(e => e.id === id);
    setFormData(prev => ({
      ...prev,
      assignedTo: id,
      assignedName: emp?.name || '',
      assignedDesignation: emp?.designation || '',
    }));
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingAssessment(item);
      setFormData({ ...item });
      setImagePreview(item.imageUrl || null);
    } else {
      setEditingAssessment(null);
      setFormData({
        activity: '', hazard: '', hazardCategory: '', location: '',
        likelihood: 3, severity: 3, existingControls: '', additionalControls: '',
        ppeRequired: '', responsiblePerson: '', status: 'open', reviewDate: '',
        assignedTo: '', assignedName: '', assignedDesignation: '',
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      let imageUrl = editingAssessment?.imageUrl || '';

      if (imageFile) {
        // You can keep uploadImage if needed, otherwise remove
        imageUrl = editingAssessment?.imageUrl || '';
      }

      const riskScore = calculateRiskScore(formData.likelihood, formData.severity);
      const riskLevel = getRiskLevel(riskScore);

      const payload = {
        ...formData,
        riskScore,
        riskLevel,
        imageUrl,
        createdAt: new Date().toISOString(),
      };

      if (editingAssessment) {
        updateLocalRiskAssessment(editingAssessment.id, payload);
      } else {
        addLocalRiskAssessment(payload);
      }

      const updatedData = getLocalRiskAssessments();
      setAssessments(updatedData);
      setFilteredAssessments(updatedData);

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = () => {
    deleteLocalRiskAssessment(deleteModal.id);
    const updatedData = getLocalRiskAssessments();
    setAssessments(updatedData);
    setFilteredAssessments(updatedData);
    setDeleteModal({ isOpen: false, id: null });
  };

  const columns = [
    { key: 'activity', label: 'Activity' },
    { key: 'hazard', label: 'Hazard' },
    { key: 'location', label: 'Location' },
    { key: 'likelihood', label: 'L' },
    { key: 'severity', label: 'S' },
    { key: 'riskScore', label: 'Score' },
    { key: 'riskLevel', label: 'Risk Level', type: 'badge' },
    { key: 'assignedName', label: 'Responsible' },
    { key: 'status', label: 'Status' },
    { key: 'reviewDate', label: 'Review Date', type: 'date' },
  ];

  if (loading) return <p className="p-10 text-center">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Risk Assessments</h1>
          <p className="text-gray-500">HSE Risk Management & Hazard Control System</p>
        </div>
        <Button onClick={() => openModal()}>+ New Risk Assessment</Button>
      </div>

      <FilterBar filters={filters} onFilterChange={setFilters} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 rounded-3xl flex items-center gap-4">
          <div className="text-5xl">📊</div>
          <div><p className="text-gray-500">Total</p><p className="text-4xl font-bold">{total}</p></div>
        </div>
        <div className="card p-6 rounded-3xl flex items-center gap-4">
          <div className="text-5xl">🔴</div>
          <div><p className="text-gray-500">Open</p><p className="text-4xl font-bold text-orange-600">{open}</p></div>
        </div>
        <div className="card p-6 rounded-3xl flex items-center gap-4">
          <div className="text-5xl">⚠️</div>
          <div><p className="text-gray-500">High Risk</p><p className="text-4xl font-bold text-red-600">{highRisk}</p></div>
        </div>
        <div className="card p-6 rounded-3xl flex items-center gap-4">
          <div className="text-5xl">✅</div>
          <div><p className="text-gray-500">Closed</p><p className="text-4xl font-bold text-green-600">{total - open}</p></div>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredData}
        actions={[
          { id: 'edit', label: 'Edit' },
          { id: 'delete', label: 'Delete' },
        ]}
        onActionClick={(action, row) => {
          if (action === 'edit') openModal(row);
          if (action === 'delete') setDeleteModal({ isOpen: true, id: row.id });
        }}
      />

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssessment ? "Edit Risk Assessment" : "New Risk Assessment"}
        size="lg"
        footerActions={[
          { label: "Cancel", variant: "secondary", onClick: () => setIsModalOpen(false) },
          { label: "Save", variant: "primary", onClick: handleSubmit },
        ]}
      >
        <div className="space-y-6">

          <CustomSelect
            label="Assign To Employee"
            value={formData.assignedTo}
            onChange={handleEmployeeSelect}
            options={staticEmployees.map(e => ({
              value: e.id,
              label: `${e.name} - ${e.designation}`
            }))}
          />

          <div className="grid grid-cols-2 gap-6">
            <input placeholder="Activity" value={formData.activity} onChange={(e) => setFormData({ ...formData, activity: e.target.value })} className="w-full px-4 py-3 border rounded-xl" />
            <input placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 border rounded-xl" />
          </div>

          <textarea
            placeholder="Hazard Description"
            value={formData.hazard}
            onChange={(e) => setFormData({ ...formData, hazard: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
          />

          <CustomSelect
            label="Category"
            value={formData.hazardCategory}
            onChange={(v) => setFormData({ ...formData, hazardCategory: v })}
            options={[
              { value: 'Physical', label: 'Physical' },
              { value: 'Chemical', label: 'Chemical' },
              { value: 'Electrical', label: 'Electrical' },
              { value: 'Fire', label: 'Fire' }
            ]}
          />

          <div className="grid grid-cols-2 gap-6">
            <input
              type="number"
              value={formData.likelihood}
              onChange={(e) => setFormData({ ...formData, likelihood: Number(e.target.value) })}
              className="w-full px-4 py-3 border rounded-xl"
            />
            <input
              type="number"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: Number(e.target.value) })}
              className="w-full px-4 py-3 border rounded-xl"
            />
          </div>

          <textarea
            placeholder="Existing Controls"
            value={formData.existingControls}
            onChange={(e) => setFormData({ ...formData, existingControls: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
          />

          <textarea
            placeholder="Additional Controls"
            value={formData.additionalControls}
            onChange={(e) => setFormData({ ...formData, additionalControls: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
          />

          <input
            placeholder="PPE Required"
            value={formData.ppeRequired}
            onChange={(e) => setFormData({ ...formData, ppeRequired: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
          />

          <div className="grid grid-cols-2 gap-6">
            <input
              type="date"
              value={formData.reviewDate}
              onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl"
            />

            <CustomSelect
              label="Status"
              value={formData.status}
              onChange={(v) => setFormData({ ...formData, status: v })}
              options={[
                { value: 'open', label: 'Open' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'closed', label: 'Closed' }
              ]}
            />
          </div>

          <textarea
            placeholder="Legal Requirement"
            value={formData.legalRequirement}
            onChange={(e) => setFormData({ ...formData, legalRequirement: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
          />

          {/* IMAGE UI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Risk Image</label>
            <div 
            className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer" onClick={() => document.getElementById('fileUpload').click()}>
              <input id="fileUpload" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <p className="text-gray-600">📸 Click to upload risk image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 5MB)</p>
            </div>
            {imagePreview && <img src={imagePreview} className="mt-4 max-h-72 rounded-xl" />}
          </div>

        </div>
      </Modal>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Risk Assessment"
        footerActions={[
          { label: "Cancel", variant: "secondary" },
          { label: "Delete", variant: "danger", onClick: handleDelete },
        ]}
      >
        Are you sure?
      </Modal>

    </div>
  );
}