'use client';

import { useEffect, useState } from 'react';
import { addDocument, updateDocument, deleteDocument, subscribeToCollection, calculateRiskScore, getRiskLevel } from '@/lib/firebase';
import { useUser } from '@/context/UserContext';
import FilterBar from '@/components/FilterBar';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';

export default function OfficerRiskAssessments() {
  const { user } = useUser();

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    hazard: '',
    likelihood: 1,
    severity: 1,
    mitigation: '',
    status: 'open',
  });

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    const unsub = subscribeToCollection('riskAssessments', (res) => {
      const my = res.filter(r => r.createdBy === user?.id);
      setData(my);
      setFiltered(my);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.id]);

  useEffect(() => {
    let f = data;
    if (filters.month) f = f.filter(r => r.month === parseInt(filters.month));
    if (filters.year) f = f.filter(r => r.year === parseInt(filters.year));
    setFiltered(f);
  }, [filters, data]);

  const openModal = (item=null) => {
    if(item){
      setEditing(item);
      setForm(item);
    } else {
      setEditing(null);
      setForm({
        hazard: '',
        likelihood: 1,
        severity: 1,
        mitigation: '',
        status: 'open',
      });
    }
    setModal(true);
  };

  const handleSubmit = async () => {
    const riskScore = calculateRiskScore(form.likelihood, form.severity);
    const riskLevel = getRiskLevel(riskScore);

    const payload = {
      ...form,
      riskScore,
      riskLevel,
      createdBy: user.id,
    };

    console.log("Submitting Data:", payload);

    if (editing) {
      await updateDocument('riskAssessments', editing.id, payload);
    } else {
      await addDocument('riskAssessments', payload);
    }

    setModal(false);
  };

  const handleDelete = async () => {
    await deleteDocument('riskAssessments', deleteModal.id);
    setDeleteModal({ isOpen: false, id: null });
  };

  const columns = [
    { key: 'hazard', label: 'Hazard' },
    { key: 'likelihood', label: 'Likelihood' },
    { key: 'severity', label: 'Severity' },
    { key: 'riskScore', label: 'Score' },
    { key: 'riskLevel', label: 'Risk Level' },
    { key: 'createdAt', label: 'Date', type: 'date' },
  ];

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-[28px] font-bold">My Risk Assessments</h1>
        <Button onClick={()=>openModal()}>+ New</Button>
      </div>

      <FilterBar filters={filters} onFilterChange={setFilters} />

      <Table
        columns={columns}
        data={filtered}
        actions={[
          { id: 'edit', label: 'Edit' },
          { id: 'delete', label: 'Delete' },
        ]}
        onActionClick={(action,row)=>{
          if(action==='edit') openModal(row);
          if(action==='delete') setDeleteModal({ isOpen:true, id:row.id });
        }}
      />

      <Modal
        isOpen={modal}
        onClose={()=>setModal(false)}
        title="Risk Assessment"
        footerActions={[
          { label:"Cancel", variant:"secondary" },
          { label:"Save", onClick:handleSubmit }
        ]}
      >
        <div className="space-y-4">
          <input placeholder="Hazard" value={form.hazard} onChange={e=>setForm({...form, hazard:e.target.value})} className="w-full p-3 border rounded-lg text-[15px]" />

          <select value={form.likelihood} onChange={e=>setForm({...form, likelihood:Number(e.target.value)})} className="w-full p-3 border">
            {[1,2,3,4,5].map(v=><option key={v}>{v}</option>)}
          </select>

          <select value={form.severity} onChange={e=>setForm({...form, severity:Number(e.target.value)})} className="w-full p-3 border">
            {[1,2,3,4,5].map(v=><option key={v}>{v}</option>)}
          </select>

          <textarea placeholder="Mitigation" value={form.mitigation} onChange={e=>setForm({...form, mitigation:e.target.value})} className="w-full p-3 border" />
        </div>
      </Modal>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={()=>setDeleteModal({ isOpen:false, id:null })}
        title="Delete"
        footerActions={[
          { label:"Cancel" },
          { label:"Delete", variant:"danger", onClick:handleDelete }
        ]}
      >
        Are you sure?
      </Modal>
    </div>
  );
}