'use client';

import { useEffect, useState, useMemo } from 'react';
import { Edit, Trash2 } from 'lucide-react';   // ← Icons Added

import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import SummaryCards from '@/components/SummaryCards';
import CustomSelect from '@/components/CustomSelect';

import {
  getLocalRiskAssessments,
  addLocalRiskAssessment,
  updateLocalRiskAssessment,
  deleteLocalRiskAssessment,
  getLocalUsers,
} from '@/lib/localStorage';

export default function AdminRiskAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    assignedTo: '',
    search: '',
  });
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
    legalRequirement: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Load Data
  useEffect(() => {
    const data = getLocalRiskAssessments();
    const userList = getLocalUsers();

    setAssessments(data);
    setUsers(Array.isArray(userList) ? userList : []);
    setLoading(false);
  }, []);

  // Filtering Logic
  const filteredData = useMemo(() => {
    let result = [...assessments];

    if (filters.category) result = result.filter(a => a.hazardCategory === filters.category);
    if (filters.status) result = result.filter(a => a.status === filters.status);
    if (filters.assignedTo) {
      result = result.filter(a => a.assignedTo === filters.assignedTo);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(a =>
        a.activity?.toLowerCase().includes(term) ||
        a.hazard?.toLowerCase().includes(term) ||
        a.location?.toLowerCase().includes(term) ||
        a.assignedName?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [assessments, filters]);

  const total = filteredData.length;
  const open = filteredData.filter(a => a.status === 'open').length;
  const highRisk = filteredData.filter(a => (a.riskScore || 0) >= 15).length;

  const calculateRiskScore = (l, s) => l * s;
  const getRiskLevel = (score) =>
    score <= 5 ? 'Low' : score <= 10 ? 'Medium' : 'High';

  const handleEmployeeSelect = (id) => {
    const emp = users.find(e => e.id === id);
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
      setFormData({
        ...item,
        legalRequirement: item.legalRequirement || '',
      });
      setImagePreview(item.imageUrl || null);
    } else {
      setEditingAssessment(null);
      setFormData({
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
        legalRequirement: '',
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

  const handleSubmit = () => {
    const riskScore = calculateRiskScore(formData.likelihood, formData.severity);
    const riskLevel = getRiskLevel(riskScore);

    const payload = {
      ...formData,
      riskScore,
      riskLevel,
      imageUrl: editingAssessment?.imageUrl || '',
      updatedAt: new Date().toISOString(),
    };

    if (editingAssessment) {
      updateLocalRiskAssessment(editingAssessment.id, payload);
    } else {
      addLocalRiskAssessment(payload);
    }

    setAssessments(getLocalRiskAssessments());
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    deleteLocalRiskAssessment(deleteModal.id);
    setAssessments(getLocalRiskAssessments());
    setDeleteModal({ isOpen: false, id: null });
  };

  const columns = [
    { key: 'activity', label: 'Activity', className: 'min-w-[160px]' },
    { key: 'hazard', label: 'Hazard', className: 'min-w-[160px]' },
    { key: 'hazardCategory', label: 'Category' },
    { key: 'location', label: 'Location' },
    { key: 'likelihood', label: 'L' },
    { key: 'severity', label: 'S' },
    { key: 'riskScore', label: 'Score' },
    { 
      key: 'riskLevel', 
      label: 'Risk Level',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium
          ${row.riskLevel === 'High' ? 'bg-red-100 text-red-700' : 
            row.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
            'bg-green-100 text-green-700'}`}>
          {row.riskLevel}
        </span>
      )
    },
    { key: 'assignedName', label: 'Assigned To' },
    { key: 'status', label: 'Status' },
    { key: 'reviewDate', label: 'Review Date', type: 'date' },
  ];

  if (loading) return <p className="p-6 text-center text-lg">Loading...</p>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Risk Assessments
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              HSE Risk Management & Hazard Control System
            </p>
          </div>
          <Button 
            onClick={() => openModal()} 
            className="w-full sm:w-auto px-6 py-3 text-base"
          >
            + New Risk Assessment
          </Button>
        </div>

        {/* Filter Bar */}
        <FilterBar 
          filters={filters} 
          onFilterChange={setFilters}
          showCategory={true}           
          showReportType={false}
        />

        {/* Summary Cards */}
        <SummaryCards
          cards={[
            { icon: "📊", label: "Total", value: total },
            { icon: "🔴", label: "Open", value: open, color: "text-orange-600" },
            { icon: "⚠️", label: "High Risk", value: highRisk, color: "text-red-600" },
            { icon: "✅", label: "Closed", value: total - open, color: "text-green-600" },
          ]}
        />

        {/* Table with Icons */}
        <Table
          columns={columns}
          data={filteredData}
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
          minWidth="1400px"
        />
      </div>

      {/* ====================== MODALS ====================== */}

      {/* Main Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssessment ? "Edit Risk Assessment" : "New Risk Assessment"}
        size="xl"
      >
        <div className="space-y-5 sm:space-y-6 max-h-[70vh] overflow-y-auto pr-2 py-3">
          
          <CustomSelect
            label="Assign To Employee"
            value={formData.assignedTo}
            onChange={handleEmployeeSelect}
            options={users.map(e => ({
              value: e.id,
              label: `${e.name} - ${e.designation}`,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <input 
              placeholder="Activity" 
              value={formData.activity} 
              onChange={(e) => setFormData({ ...formData, activity: e.target.value })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none" 
            />
            <input 
              placeholder="Location" 
              value={formData.location} 
              onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none" 
            />
          </div>

          <textarea 
            placeholder="Hazard Description" 
            value={formData.hazard} 
            onChange={(e) => setFormData({ ...formData, hazard: e.target.value })} 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none" 
            rows={3}
          />

          <CustomSelect
            label="Category"
            value={formData.hazardCategory}
            onChange={(v) => setFormData({ ...formData, hazardCategory: v })}
            options={[
              { value: 'Physical', label: 'Physical' },
              { value: 'Chemical', label: 'Chemical' },
              { value: 'Electrical', label: 'Electrical' },
              { value: 'Fire', label: 'Fire' },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Likelihood (1-5)</label>
              <input 
                type="number" 
                min="1" 
                max="5" 
                value={formData.likelihood} 
                onChange={(e) => setFormData({ ...formData, likelihood: Number(e.target.value) })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity (1-5)</label>
              <input 
                type="number" 
                min="1" 
                max="5" 
                value={formData.severity} 
                onChange={(e) => setFormData({ ...formData, severity: Number(e.target.value) })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none" 
              />
            </div>
          </div>

          <textarea 
            placeholder="Existing Controls" 
            value={formData.existingControls} 
            onChange={(e) => setFormData({ ...formData, existingControls: e.target.value })} 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none" 
            rows={3}
          />

          <textarea 
            placeholder="Additional Controls" 
            value={formData.additionalControls} 
            onChange={(e) => setFormData({ ...formData, additionalControls: e.target.value })} 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none" 
            rows={3}
          />

          <input 
            placeholder="PPE Required" 
            value={formData.ppeRequired} 
            onChange={(e) => setFormData({ ...formData, ppeRequired: e.target.value })} 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Date</label>
              <input 
                type="date" 
                value={formData.reviewDate} 
                onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none" 
              />
            </div>
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none" 
            rows={2}
          />

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Risk Image</label>
            <div 
              className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-6 sm:p-8 text-center cursor-pointer bg-gray-50"
              onClick={() => document.getElementById('fileUpload').click()}
            >
              <input id="fileUpload" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <p className="text-gray-600">📸 Click to upload risk image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 5MB)</p>
            </div>
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="mt-4 max-h-72 mx-auto rounded-xl shadow-sm" 
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Risk Assessment"
        size="sm"
      >
        <p className="text-center py-8 text-gray-600">
          Are you sure you want to delete this risk assessment? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}