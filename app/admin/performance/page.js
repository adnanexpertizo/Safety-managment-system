'use client';

import { useState, useMemo, useEffect } from 'react';
import { Eye } from 'lucide-react';
import CustomSelect from '@/components/CustomSelect';
import Table from '@/components/Table';
import Modal from '@/components/Modal';

import {
  getLocalReports,
  getLocalRiskAssessments,
  getLocalTrainings,
  getLocalUsers,
} from '@/lib/localStorage';

import { PERFORMANCE_SCORING } from '@/lib/localStorage';   // ← Import Scoring Constants

export default function PerformancePage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all'); // Default: All Months
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ isOpen: false, data: null });

  const [employees, setEmployees] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [allRisks, setAllRisks] = useState([]);
  const [allTrainings, setAllTrainings] = useState([]);

  // Load Data
  useEffect(() => {
    setEmployees(getLocalUsers());
    setAllReports(getLocalReports());
    setAllRisks(getLocalRiskAssessments());
    setAllTrainings(getLocalTrainings());
  }, []);

  const months = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Combined Closed/Completed Data
  const combinedData = useMemo(() => {
    let data = [];

    // Closed Reports
    const closedReports = allReports.filter(r => 
      ['closed', 'resolved'].includes((r.status || '').toLowerCase())
    ).map(r => ({
      id: r.id,
      type: 'Report',
      title: r.reportTitle || r.description?.slice(0, 60) || 'Untitled Report',
      category: r.type || '',
      severity: r.severity || '',
      assignedTo: r.assignedName || '',
      date: r.dateOfIncident || r.createdAt,
      status: r.status,
      source: 'report',
      rawData: r
    }));

    // Closed Risk Assessments
    const closedRisks = allRisks.filter(ra => 
      (ra.status || '').toLowerCase() === 'closed'
    ).map(ra => ({
      id: ra.id,
      type: 'Risk Assessment',
      title: ra.activity,
      category: ra.hazardCategory || '',
      severity: ra.riskLevel || '',
      assignedTo: ra.assignedName || '',
      date: ra.reviewDate || ra.createdAt,
      status: ra.status,
      source: 'risk',
      rawData: ra
    }));

    // Completed Trainings
    const completedTrainings = allTrainings.filter(t => 
      (t.status || '').toLowerCase() === 'completed'
    ).map(t => ({
      id: t.id,
      type: 'Training',
      title: t.title,
      category: t.department || '',
      severity: t.score ? `${t.score}%` : '',
      assignedTo: t.trainer || '',
      date: t.date,
      status: t.status,
      source: 'training',
      rawData: t
    }));

    data = [...closedReports, ...closedRisks, ...completedTrainings];

    // Filter by Month
    if (selectedMonth !== 'all') {
      data = data.filter(item => {
        if (!item.date) return false;
        const itemMonth = new Date(item.date).toLocaleString('default', { month: 'long' });
        return itemMonth === selectedMonth;
      });
    }

    // Filter by Employee
    if (selectedEmployeeId !== 'all') {
      data = data.filter(item => 
        item.rawData.assignedTo === selectedEmployeeId || 
        item.rawData.trainerId === selectedEmployeeId ||
        item.assignedTo === selectedEmployeeId
      );
    }

    // Search
    if (search) {
      const term = search.toLowerCase();
      data = data.filter(item => 
        item.title?.toLowerCase().includes(term) || 
        item.assignedTo?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term)
      );
    }

    return data;
  }, [allReports, allRisks, allTrainings, selectedMonth, selectedEmployeeId, search]);

  // Performance Score (Only for Specific Employee)
  const performanceScore = useMemo(() => {
    if (selectedEmployeeId === 'all') return 0;

    const closedReportsCount = allReports.filter(r => 
      ['closed', 'resolved'].includes((r.status || '').toLowerCase()) && r.assignedTo === selectedEmployeeId
    ).length;

    const closedRiskCount = allRisks.filter(ra => 
      (ra.status || '').toLowerCase() === 'closed' && ra.assignedTo === selectedEmployeeId
    ).length;

    const completedTrainingCount = allTrainings.filter(t => 
      (t.status || '').toLowerCase() === 'completed' && t.trainerId === selectedEmployeeId
    ).length;

    let score = 0;
    score += closedReportsCount * PERFORMANCE_SCORING.REPORT_CLOSED;
    score += closedRiskCount * PERFORMANCE_SCORING.RISK_CLOSED;
    score += completedTrainingCount * PERFORMANCE_SCORING.TRAINING_COMPLETED;

    return Math.min(PERFORMANCE_SCORING.MAX_SCORE, score);
  }, [selectedEmployeeId, allReports, allRisks, allTrainings]);

  const performanceLabel = performanceScore >= 80 ? 'Excellent' : 
                           performanceScore >= 60 ? 'Good' : 'Needs Improvement';

  const performanceColor = performanceScore >= 80 ? 'text-green-600' : 
                           performanceScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  const columns = [
    { key: 'type', label: 'Type' },
    { key: 'title', label: 'Title / Activity' },
    { key: 'category', label: 'Category' },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'severity', label: 'Severity / Score' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
  ];

  const handleView = (row) => {
    setModal({ isOpen: true, data: row });
  };

  const summaryCards = [
    { label: "Total Activities", value: combinedData.length, icon: "📊", color: "text-blue-600" },
    { label: "Closed Reports", value: combinedData.filter(d => d.source === 'report').length, icon: "📋", color: "text-blue-600" },
    { label: "Closed Risk", value: combinedData.filter(d => d.source === 'risk').length, icon: "⚠️", color: "text-red-600" },
    { label: "Completed Training", value: combinedData.filter(d => d.source === 'training').length, icon: "🎓", color: "text-green-600" },
  ];

  return (
    <div className="w-full max-w-screen-2xl mx-auto  space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Employee Performance</h1>
          <p className="text-gray-500">Safety Performance Dashboard</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CustomSelect
          options={[
            { value: 'all', label: 'All Employees' },
            ...employees.map(emp => ({
              value: emp.id,
              label: `${emp.name} - ${emp.designation || ''}`
            }))
          ]}
          value={selectedEmployeeId}
          onChange={setSelectedEmployeeId}
        />

        <CustomSelect
          options={months.map(m => ({ value: m, label: m }))}
          value={selectedMonth}
          onChange={setSelectedMonth}
        />

        <div></div>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white border rounded-2xl p-5 text-center shadow-sm">
            <div className="text-2xl">{card.icon}</div>
            <p className="text-sm text-gray-500 mt-3">{card.label}</p>
            <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Performance Score - Only show when specific employee is selected */}
{selectedEmployeeId !== 'all' && (
  <div className="bg-white border rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-6">
    <div className="text-center md:text-left">
      <p className="text-gray-500 text-sm">Performance Score</p>
      <p className={`text-4xl sm:text-5xl font-bold ${performanceColor}`}>
        {performanceScore}/100
      </p>
      <p className="text-sm mt-1 font-medium">{performanceLabel}</p>
    </div>

    <div className="w-full md:w-2/3">
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${performanceScore}%` }}
        />
      </div>
    </div>
  </div>
)}

{selectedEmployeeId === 'all' && (
  <div className="bg-white border rounded-2xl p-5 sm:p-6 flex justify-center items-center">
    <p className="text-sm font-medium text-primary">
      Please select an employee to view their performance score here.
    </p>
  </div>
)}


      {/* Main Table */}
      <Table
        columns={columns}
        data={combinedData}
        actions={[
          { id: 'view', label: 'View', icon: Eye }
        ]}
        onActionClick={(action, row) => {
          if (action === 'view') handleView(row);
        }}
        maxHeight="580px"
      />

      {/* Beautiful View Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, data: null })}
        title={modal.data?.type || "Details"}
        size="lg"
      >
        {modal.data && (
          <div className="space-y-6 py-4">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">{modal.data.title}</h2>
              <p className="text-gray-500 mt-1">Type: <span className="font-medium">{modal.data.type}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="font-semibold">{modal.data.assignedTo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-semibold">{modal.data.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Severity / Score</p>
                <p className="font-semibold">{modal.data.severity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold">{modal.data.date}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Details</p>
              <p className="bg-gray-50 p-5 rounded-2xl text-gray-700 leading-relaxed">
                {modal.data.rawData?.description || 
                 modal.data.rawData?.hazard || 
                 modal.data.rawData?.title || 
                 "No additional details available."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}