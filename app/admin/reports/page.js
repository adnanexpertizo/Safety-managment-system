'use client';

import { useEffect, useState, useMemo } from 'react';
import { Edit, Trash2 } from 'lucide-react'; // ← Icons Imported

import { getLocalReports, addLocalReport, updateLocalReport, deleteLocalReport, getLocalUsers } from '@/lib/localStorage';

import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';
import SummaryCards from '@/components/SummaryCards';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    assignedTo: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, reportId: null });

  const [statusModal, setStatusModal] = useState({ isOpen: false, report: null, newStatus: '' });
  const [statusNote, setStatusNote] = useState('');
  const [statusImage, setStatusImage] = useState(null);
  const [statusDate, setStatusDate] = useState(new Date().toISOString().slice(0, 16));

  const [formData, setFormData] = useState({
    type: 'incident',
    severity: 'medium',
    potentialSeverity: 'medium',
    dateOfIncident: '',
    location: '',
    description: '',
    witnesses: '',
    immediateActions: '',
    recommendedActions: '',
    status: 'open',
    assignedTo: '',
    assignedName: '',
    assignedDesignation: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Load Data
  useEffect(() => {
    const reportData = getLocalReports();
    const userData = getLocalUsers();

    setReports(reportData);
    setUsers(Array.isArray(userData) ? userData : []);
    setLoading(false);
  }, []);

  // Enhanced Filtering
  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    if (filters.type) {
      filtered = filtered.filter(r => r.type === filters.type);
    }
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    if (filters.assignedTo) {
      if (filters.assignedTo === 'my') {
        // Add your own logic here if needed
      } else {
        filtered = filtered.filter(r => r.assignedTo === filters.assignedTo);
      }
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(r =>
        r.description?.toLowerCase().includes(term) ||
        r.location?.toLowerCase().includes(term) ||
        r.assignedName?.toLowerCase().includes(term) ||
        r.type?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [reports, filters]);

  // Summary Stats
  const total = filteredReports.length;
  const open = filteredReports.filter(r => r.status === 'open').length;
  const closed = filteredReports.filter(r => r.status === 'closed').length;
  const inProgress = filteredReports.filter(r => r.status === 'in-progress').length;

  const openModal = (report = null) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        type: report.type || 'incident',
        severity: report.severity || 'medium',
        potentialSeverity: report.potentialSeverity || 'medium',
        dateOfIncident: report.dateOfIncident || '',
        location: report.location || '',
        description: report.description || '',
        witnesses: report.witnesses || '',
        immediateActions: report.immediateActions || '',
        recommendedActions: report.recommendedActions || '',
        status: report.status || 'open',
        assignedTo: report.assignedTo || '',
        assignedName: report.assignedName || '',
        assignedDesignation: report.assignedDesignation || '',
      });
      setImagePreview(report.imageUrl || null);
    } else {
      setEditingReport(null);
      setFormData({
        type: 'incident',
        severity: 'medium',
        potentialSeverity: 'medium',
        dateOfIncident: '',
        location: '',
        description: '',
        witnesses: '',
        immediateActions: '',
        recommendedActions: '',
        status: 'open',
        assignedTo: '',
        assignedName: '',
        assignedDesignation: '',
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleEmployeeSelect = (employeeId) => {
    const emp = users.find(e => e.id === employeeId);
    setFormData(prev => ({
      ...prev,
      assignedTo: employeeId,
      assignedName: emp?.name || '',
      assignedDesignation: emp?.designation || '',
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    const reportData = {
      ...formData,
      imageUrl: editingReport?.imageUrl || 'local-image-placeholder',
      updatedAt: new Date().toISOString(),
    };

    if (editingReport) {
      updateLocalReport(editingReport.id, reportData);
    } else {
      addLocalReport(reportData);
    }

    setReports(getLocalReports());
    setIsModalOpen(false);
  };

  const handleStatusChange = () => {
    if (!statusModal.report) return;
    updateLocalReport(statusModal.report.id, { status: statusModal.newStatus });
    setReports(getLocalReports());
    setStatusModal({ isOpen: false, report: null, newStatus: '' });
  };

  const handleDelete = () => {
    deleteLocalReport(deleteModal.reportId);
    setReports(getLocalReports());
    setDeleteModal({ isOpen: false, reportId: null });
  };

  const columns = [
    { key: 'type', label: 'Type' },
    { key: 'severity', label: 'Severity' },
    { key: 'assignedName', label: 'Assigned To' },
    { key: 'assignedDesignation', label: 'Designation' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Date', type: 'date' },
  ];

  if (loading) return <p className="p-6 text-center text-lg">Loading reports...</p>;

  return (
    <div className=" bg-gray-50 min-h-screen">
      <div className="max-w-screen-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between gap-2 sm:gap-4 flex-nowrap">
          <div className="min-w-0">
            <h1 className="text-md sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
              All Reports
            </h1>

            <p className="text-[10px] sm:text-sm lg:text-base text-gray-500 truncate">
              Incident, Near Miss & Hazard Management
            </p>
          </div>

          <Button
            onClick={() => openModal()}
            className=" sm:w-auto px-6 py-3 text-base"
          >
            + New Report
          </Button>
        </div>


        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          showReportType={true}
          showCategory={false}
        />

        {/* Summary Cards */}
        <SummaryCards
          cards={[
            { icon: "📊", label: "Total Reports", value: total },
            { icon: "🔴", label: "Open", value: open, color: "text-orange-600" },
            { icon: "✅", label: "Closed", value: closed, color: "text-green-600" },
            { icon: "⚠️", label: "In Progress", value: inProgress, color: "text-blue-600" },
          ]}
        />

        {/* Table with Icons */}
        <Table
          columns={columns}
          data={filteredReports}
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
            if (action === 'delete') setDeleteModal({ isOpen: true, reportId: row.id });
          }}
          maxHeight="calc(100vh - 360px)"
          className="min-w-[900px] md:min-w-[1400px]"
        />
      </div>

      {/* Modals remain the same */}
      {/* Main Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReport ? "Edit Report" : "New Report"}
        size="lg"
        footerActions={[
          { label: "Cancel", variant: "secondary", onClick: () => setIsModalOpen(false) },
          { label: editingReport ? "Update" : "Create", variant: "primary", onClick: handleSubmit },
        ]}
      >
        <div className="space-y-5 sm:space-y-6 max-h-[68vh] overflow-y-auto pr-2 py-3">
          {/* ... (your existing form content - unchanged) ... */}
          <CustomSelect
            label="Assign To Employee"
            value={formData.assignedTo}
            onChange={handleEmployeeSelect}
            options={users.map(emp => ({
              value: emp.id,
              label: `${emp.name} - ${emp.designation}`
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <CustomSelect
              label="Report Type"
              value={formData.type}
              onChange={(v) => setFormData({ ...formData, type: v })}
              options={[
                { value: 'incident', label: 'Incident' },
                { value: 'near_miss', label: 'Near Miss' },
                { value: 'hazard', label: 'Hazard' }
              ]}
            />

            <CustomSelect
              label="Severity"
              value={formData.severity}
              onChange={(v) => setFormData({ ...formData, severity: v })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ]}
            />
          </div>

          {/* Rest of the form remains same as you provided */}
          <div className="grid grid-cols-2 gap-6">
            <CustomSelect
              label="Potential Severity"
              value={formData.potentialSeverity}
              onChange={(v) => setFormData({ ...formData, potentialSeverity: v })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time of Incident</label>
              <input
                type="datetime-local"
                value={formData.dateOfIncident}
                onChange={(e) => setFormData({ ...formData, dateOfIncident: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-0 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <input
              placeholder="Exact location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              placeholder="Detailed description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-0 focus:outline-none resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Witnesses</label>
              <textarea placeholder="Witness names" value={formData.witnesses} onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })} rows={2} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-0 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Immediate Actions</label>
              <textarea placeholder="Immediate actions taken" value={formData.immediateActions} onChange={(e) => setFormData({ ...formData, immediateActions: e.target.value })} rows={2} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-0 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Recommended Actions</label>
            <textarea placeholder="Recommended corrective actions" value={formData.recommendedActions} onChange={(e) => setFormData({ ...formData, recommendedActions: e.target.value })} rows={3} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-0 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Evidence</label>
            <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer bg-gray-50"
              onClick={() => document.getElementById('fileUpload').click()}>
              <input id="fileUpload" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <p className="text-gray-600">📸 Click to upload image</p>
            </div>
            {imagePreview && <img src={imagePreview} className="mt-4 max-h-72 mx-auto rounded-xl shadow" />}
          </div>
        </div>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, report: null, newStatus: '' })}
        title={`Change to ${statusModal.newStatus?.toUpperCase()}`}
        size="md"
        footerActions={[
          { label: "Cancel", variant: "secondary" },
          { label: "Save Status", variant: "primary", onClick: handleStatusChange },
        ]}
      >
        <div className="space-y-4">
          <input type="datetime-local" value={statusDate} onChange={(e) => setStatusDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />

          <textarea placeholder="Notes / Reason for status change" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer" onClick={() => document.getElementById('statusImg').click()}>
            <input id="statusImg" type="file" accept="image/*" onChange={(e) => setStatusImage(e.target.files[0])} className="hidden" />
            <p>📸 Upload Evidence (Optional)</p>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, reportId: null })}
        title="Delete Report"
        footerActions={[
          { label: "Cancel", variant: "secondary" },
          { label: "Delete", variant: "danger", onClick: handleDelete },
        ]}
      >
        Are you sure you want to delete this report?
      </Modal>
    </div>
  );
}