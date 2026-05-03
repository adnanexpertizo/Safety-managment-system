'use client';

import { useState, useMemo } from 'react';
import CustomSelect from '@/components/CustomSelect';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { TrendingUp } from 'lucide-react';

export default function PerformancePage() {
  const [selectedEmployee, setSelectedEmployee] = useState('Ahmed Khan');
  const [month, setMonth] = useState('April');
  const [year, setYear] = useState('2026');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ isOpen: false, data: null });

  const employees = ["Ahmed Khan", "Sara Malik", "Usman Ali", "Fatima Noor", "Bilal Hassan"];

  const employeeData = useMemo(() => ({
    "Ahmed Khan": [
      { id: 1, reportTitle: "Electrical short circuit in Warehouse", type: "Incident", severity: "High", status: "Closed", reportedDate: "2026-04-05", resolutionDays: 2 },
      { id: 2, reportTitle: "Damaged insulation on main cable", type: "Hazard", severity: "Medium", status: "Closed", reportedDate: "2026-04-12", resolutionDays: 5 },
      { id: 3, reportTitle: "Near miss - Falling object", type: "Near Miss", severity: "High", status: "Closed", reportedDate: "2026-04-18", resolutionDays: 1 },
    ],
    "Sara Malik": [
      { id: 1, reportTitle: "Hydraulic oil leak on press machine", type: "Incident", severity: "High", status: "Closed", reportedDate: "2026-04-08", resolutionDays: 4 },
    ],
    "Usman Ali": [],
    "Fatima Noor": [],
    "Bilal Hassan": [],
  }), []);

  const currentData = employeeData[selectedEmployee] || [];

  const filteredData = currentData.filter(item =>
    item.reportTitle.toLowerCase().includes(search.toLowerCase())
  );

  const totalReports = filteredData.length;
  const highRisk = filteredData.filter(r => r.severity === 'High').length;
  const closedReports = filteredData.filter(r => r.status === 'Closed').length;

  const avgResolution = totalReports
    ? (filteredData.reduce((sum, r) => sum + r.resolutionDays, 0) / totalReports).toFixed(1)
    : 0;

  // ---------------- PERFORMANCE SCORE ----------------
  const performanceScore = useMemo(() => {
    if (!totalReports) return 0;

    let score = 100;
    score -= highRisk * 10;
    score += closedReports * 5;
    score -= parseFloat(avgResolution) * 2;

    return Math.max(0, Math.min(100, Math.round(score)));
  }, [totalReports, highRisk, closedReports, avgResolution]);

  const performanceLabel =
    performanceScore >= 80
      ? 'Excellent'
      : performanceScore >= 60
      ? 'Good'
      : 'Needs Improvement';

  const performanceColor =
    performanceScore >= 80
      ? 'text-green-600'
      : performanceScore >= 60
      ? 'text-yellow-600'
      : 'text-red-600';

  // ---------------- TABLE ----------------
  const columns = [
    { key: 'reportTitle', label: 'Report Title' },
    { key: 'type', label: 'Type' },
    { key: 'severity', label: 'Severity' },
    { key: 'status', label: 'Status' },
    { key: 'reportedDate', label: 'Reported Date', type: 'date' },
    { key: 'resolutionDays', label: 'Resolution (Days)' },
  ];

  const handleAction = (actionId, row) => {
    if (actionId === 'view') {
      setModal({ isOpen: true, data: row });
    }
  };

  const summaryCards = [
    {
      label: "Reports Created",
      value: totalReports,
      icon: "📋",
      color: "text-blue-600",
    },
    {
      label: "High Risk Cases",
      value: highRisk,
      icon: "⚠️",
      color: "text-red-600",
    },
    {
      label: "Closed Reports",
      value: closedReports,
      icon: "✅",
      color: "text-green-600",
    },
    {
      label: "Avg Resolution",
      value: `${avgResolution} days`,
      icon: "⏱️",
      color: "text-teal-600",
    },
  ];

  const recommendations = [
    totalReports === 0 && "No reports found for selected employee.",
    highRisk > 2 && "High risk cases are above acceptable threshold.",
    avgResolution > 3 && "Resolution time should be improved.",
    performanceScore < 70 && "Employee needs safety training refresh.",
  ].filter(Boolean);

  return (
    <div className="w-full space-y-6">

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CustomSelect
          options={employees.map(n => ({ value: n, label: n }))}
          value={selectedEmployee}
          onChange={setSelectedEmployee}
        />

        <CustomSelect
          options={[{ value: 'April', label: 'April' }]}
          value={month}
          onChange={setMonth}
        />

        <CustomSelect
          options={[{ value: '2026', label: '2026' }]}
          value={year}
          onChange={setYear}
        />

        <input
          type="text"
          placeholder="Search reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-3 border rounded-xl w-full"
        />
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white border rounded-xl p-5 text-center">
            <div className="text-xl">{card.icon}</div>
            <p className="text-sm text-gray-500 mt-2">{card.label}</p>
            <p className={`text-3xl font-bold mt-2 ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* PERFORMANCE SCORE */}
      <div className="bg-white border rounded-xl p-6 flex flex-col md:flex-row justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Performance Score</p>
          <p className={`text-4xl font-bold ${performanceColor}`}>
            {performanceScore}/100
          </p>
          <p className="text-sm mt-1">{performanceLabel}</p>
        </div>

        <div className="w-full md:w-1/2 mt-4 md:mt-0">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${performanceScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="font-semibold mb-2">Recommendations</p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            {recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* TABLE */}
      <Table
        columns={columns}
        data={filteredData}
        actions={[{ id: 'view', label: 'View' }]}
        onActionClick={handleAction}
        maxHeight="580px"
      />

      {/* MODAL */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, data: null })}
        title="Report Details"
        size="lg"
      >
        {modal.data && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {modal.data.reportTitle}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-semibold">{modal.data.type}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Severity</p>
                <p className="font-semibold">{modal.data.severity}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Resolution</p>
                <p className="font-semibold">{modal.data.resolutionDays} days</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold">{modal.data.status}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}