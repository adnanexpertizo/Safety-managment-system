'use client';

import { useEffect, useState } from 'react';
import { addDocument, updateDocument, deleteDocument, subscribeToCollection, uploadImage } from '@/lib/firebase';
import { useUser } from '@/context/UserContext';
import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';

export default function OfficerReports() {
  const { user } = useUser();

  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  const [formData, setFormData] = useState({
    type: 'incident',
    severity: 'medium',
    description: '',
    location: '',
    status: 'open',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // 🔥 REALTIME
  useEffect(() => {
    const unsubscribe = subscribeToCollection('reports', (data) => {
      const myData = data.filter((r) => r.createdBy === user?.id);
      setReports(myData);
      setFilteredReports(myData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // 🔎 FILTER
  useEffect(() => {
    let filtered = reports;

    if (filters.month) filtered = filtered.filter(r => r.month === parseInt(filters.month));
    if (filters.year) filtered = filtered.filter(r => r.year === parseInt(filters.year));
    if (filters.type) filtered = filtered.filter(r => r.type === filters.type);
    if (filters.status) filtered = filtered.filter(r => r.status === filters.status);

    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(r =>
        r.description?.toLowerCase().includes(s) ||
        r.location?.toLowerCase().includes(s)
      );
    }

    setFilteredReports(filtered);
  }, [filters, reports]);

  // 🧠 MODAL
  const openModal = (report = null) => {
    if (report) {
      setEditingReport(report);
      setFormData(report);
      setImagePreview(report.imageUrl || null);
    } else {
      setEditingReport(null);
      setFormData({
        type: 'incident',
        severity: 'medium',
        description: '',
        location: '',
        status: 'open',
      });
      setImagePreview(null);
    }

    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    let imageUrl = editingReport?.imageUrl || '';

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const data = {
      ...formData,
      imageUrl,
      createdBy: user.id,
    };

    console.log("Submitting Data:", data);

    if (editingReport) {
      await updateDocument('reports', editingReport.id, data);
    } else {
      await addDocument('reports', data);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    await deleteDocument('reports', deleteModal.id);
    setDeleteModal({ isOpen: false, id: null });
  };

  const columns = [
    { key: 'type', label: 'Type' },
    { key: 'severity', label: 'Severity' },
    { key: 'description', label: 'Description', truncate: true },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Date', type: 'date' },
    { key: 'imageUrl', label: 'Image', type: 'image' },
  ];

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-[28px] font-bold">My Reports</h1>
        <Button onClick={() => openModal()}>+ New Report</Button>
      </div>

      <FilterBar filters={filters} onFilterChange={setFilters} />

      <Table
        columns={columns}
        data={filteredReports}
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
        title={editingReport ? "Edit Report" : "New Report"}
        footerActions={[
          { label: "Cancel", variant: "secondary", onClick: () => setIsModalOpen(false) },
          { label: "Save", onClick: handleSubmit },
        ]}
      >
        <div className="space-y-4">
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-3 border rounded-lg text-[15px]">
            <option value="incident">Incident</option>
            <option value="near_miss">Near Miss</option>
            <option value="hazard">Hazard</option>
          </select>

          <input placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-3 border rounded-lg text-[15px]" />

          <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 border rounded-lg text-[15px]" />

          <input type="file" accept="image/*" capture="environment" onChange={handleImage} />

          {imagePreview && <img src={imagePreview} className="w-full max-h-[200px] object-cover rounded-lg" />}
        </div>
      </Modal>

      {/* DELETE */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete"
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