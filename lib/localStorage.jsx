// ==================== STORAGE KEYS ====================
const STORAGE_KEYS = {
  REPORTS: 'safety_reports',
  RISK_ASSESSMENTS: 'safety_risk_assessments',
  TRAININGS: 'safety_trainings',
  EMPLOYEES: 'safety_users',
  CORRECTIVE_ACTIONS: 'safety_corrective_actions',
  PERMITS: 'safety_permits',
  INSPECTIONS: 'safety_inspections',
};

export const PERFORMANCE_SCORING = {
  REPORT_CLOSED: 10,
  RISK_CLOSED: 20,
  TRAINING_COMPLETED: 20,
  MAX_SCORE: 100,
};

// ==================== STATIC SEED DATA ====================

const STATIC_TRAININGS = [
  {
    id: 'tr1',
    title: 'Electrical Safety & Lockout/Tagout',
    department: 'Electrical',
    trainer: 'Adnan Rafiq',
    trainerId: 'emp2',
    date: '2026-05-15',
    duration: '4 hours',
    participants: 18,
    status: 'Completed',
    score: 88,
    createdAt: '2026-04-20T10:00:00.000Z',
  },
  {
    id: 'tr2',
    title: 'Heavy Machinery Operation Safety',
    department: 'Mechanical',
    trainer: 'John Smith',
    trainerId: 'emp1',
    date: '2026-05-20',
    duration: '6 hours',
    participants: 12,
    status: 'Scheduled',
    score: null,
    createdAt: '2026-04-25T14:30:00.000Z',
  },
];

const STATIC_EMPLOYEES = [
  {
    id: 'emp1',
    name: 'John Smith',
    email: 'john@safety.com',
    role: 'OFFICER',
    department: 'Operations',
    designation: 'Safety Officer',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'emp2',
    name: 'Adnan Rafiq',
    email: 'adnan@safety.com',
    role: 'ADMIN',
    department: 'HSE',
    designation: 'HSE Manager',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'emp3',
    name: 'Muhammad Danish',
    email: 'danish@safety.com',
    role: 'SUPERVISOR',
    department: 'Operations',
    designation: 'Supervisor',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const STATIC_REPORTS = [
  {
    id: 'static-r1',
    type: 'incident',
    severity: 'high',
    potentialSeverity: 'high',
    dateOfIncident: '2026-04-15T09:30',
    location: 'Warehouse A - Loading Dock',
    description: 'Worker slipped on oil spill while moving pallets.',
    witnesses: 'Ahmed Khan, Sara Malik',
    immediateActions: 'Area cordoned off, spill cleaned.',
    recommendedActions: 'Install better lighting and anti-slip mats.',
    status: 'open',
    assignedTo: 'emp2',
    assignedName: 'Adnan Rafiq',
    assignedDesignation: 'HSE Manager',
    createdAt: '2026-04-15T09:30:00.000Z',
    statusHistory: [
      { status: 'open', date: '2026-04-15T09:30:00.000Z', note: 'Report created' },
    ],
  },
  {
    id: 'static-r2',
    type: 'near_miss',
    severity: 'medium',
    potentialSeverity: 'high',
    dateOfIncident: '2026-04-28T14:15',
    location: 'Production Floor',
    description: 'Forklift almost hit a pedestrian in unmarked crossing zone.',
    witnesses: 'Ali Hassan',
    immediateActions: 'Verbal warning given to forklift operator.',
    recommendedActions: 'Install pedestrian walkways and speed bumps.',
    status: 'resolved',
    assignedTo: 'emp1',
    assignedName: 'John Smith',
    assignedDesignation: 'Safety Officer',
    createdAt: '2026-04-28T14:15:00.000Z',
    statusHistory: [
      { status: 'open', date: '2026-04-28T14:15:00.000Z', note: 'Report created' },
      { status: 'resolved', date: '2026-05-02T10:00:00.000Z', note: 'Pedestrian barriers installed' },
    ],
  },
  {
    id: 'static-r3',
    type: 'hazard',
    severity: 'low',
    potentialSeverity: 'medium',
    dateOfIncident: '2026-05-01T08:00',
    location: 'Office Block B',
    description: 'Exposed electrical wiring near the server room entrance.',
    witnesses: '',
    immediateActions: 'Warning tape placed around area.',
    recommendedActions: 'Schedule electrician to repair within 48 hours.',
    status: 'in-progress',
    assignedTo: 'emp3',
    assignedName: 'Muhammad Danish',
    assignedDesignation: 'Supervisor',
    createdAt: '2026-05-01T08:00:00.000Z',
    statusHistory: [
      { status: 'open', date: '2026-05-01T08:00:00.000Z', note: 'Hazard reported' },
      { status: 'in-progress', date: '2026-05-03T09:00:00.000Z', note: 'Electrician scheduled' },
    ],
  },
];

const STATIC_RISK_ASSESSMENTS = [
  {
    id: 'ra1',
    activity: 'Maintenance on Main Transformer',
    hazard: 'Electrical shock and arc flash from high voltage equipment',
    hazardCategory: 'Electrical',
    location: 'Substation Area',
    likelihood: 4,
    severity: 5,
    riskScore: 20,
    riskLevel: 'High',
    existingControls: 'PPE required, permit to work system in place',
    additionalControls: 'Install arc flash boundary markers, upgrade PPE to category 4',
    ppeRequired: 'Arc flash suit, insulated gloves, face shield',
    residualLikelihood: 2,
    residualSeverity: 5,
    residualRiskScore: 10,
    residualRiskLevel: 'Medium',
    status: 'open',
    assignedTo: 'emp2',
    assignedName: 'Adnan Rafiq',
    assignedDesignation: 'HSE Manager',
    reviewDate: '2026-05-15',
    legalRequirement: 'OSHA 29 CFR 1910.333',
    createdAt: '2026-04-10T10:00:00.000Z',
    statusHistory: [
      { status: 'open', date: '2026-04-10T10:00:00.000Z', note: 'Assessment created' },
    ],
  },
  {
    id: 'ra2',
    activity: 'Chemical storage handling',
    hazard: 'Chemical spill and exposure to corrosive substances',
    hazardCategory: 'Chemical',
    location: 'Warehouse Zone B',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    riskLevel: 'Medium',
    existingControls: 'SDS sheets available, spill kits on site',
    additionalControls: 'Secondary containment trays, monthly spill drills',
    ppeRequired: 'Chemical resistant gloves, goggles, apron',
    residualLikelihood: 2,
    residualSeverity: 4,
    residualRiskScore: 8,
    residualRiskLevel: 'Medium',
    status: 'closed',
    assignedTo: 'emp1',
    assignedName: 'John Smith',
    assignedDesignation: 'Safety Officer',
    reviewDate: '2026-04-20',
    legalRequirement: 'COSHH Regulations 2002',
    createdAt: '2026-04-05T08:30:00.000Z',
    statusHistory: [
      { status: 'open', date: '2026-04-05T08:30:00.000Z', note: 'Assessment created' },
      { status: 'closed', date: '2026-04-20T11:00:00.000Z', note: 'All controls implemented and verified' },
    ],
  },
];

const STATIC_CORRECTIVE_ACTIONS = [
  {
    id: 'ca1',
    title: 'Install anti-slip mats at loading dock',
    description: 'Purchase and install industrial anti-slip mats at all loading dock entry points',
    linkedReportId: 'static-r1',
    linkedReportType: 'report',
    assignedTo: 'emp2',
    assignedName: 'Adnan Rafiq',
    dueDate: '2026-05-30',
    priority: 'high',
    status: 'open',
    createdAt: '2026-04-15T10:00:00.000Z',
  },
  {
    id: 'ca2',
    title: 'Install pedestrian walkway markers',
    description: 'Paint pedestrian crossing lines and install physical barriers on production floor',
    linkedReportId: 'static-r2',
    linkedReportType: 'report',
    assignedTo: 'emp1',
    assignedName: 'John Smith',
    dueDate: '2026-05-10',
    priority: 'medium',
    status: 'completed',
    completedAt: '2026-05-08T14:00:00.000Z',
    createdAt: '2026-04-28T15:00:00.000Z',
  },
];
const STATIC_PERMITS = [
  { id: 'ptw1', permitNumber: 'PTW-2026-001', type: 'Hot Work', title: 'Welding on Rooftop Structure', location: 'Rooftop - Block A', issuer: 'Adnan Rafiq', issuerId: 'emp2', assignedTo: 'emp1', assignedName: 'John Smith', startDate: '2026-05-10', endDate: '2026-05-10', startTime: '08:00', endTime: '17:00', status: 'active', hazards: 'Fire, Burns, Fumes', precautions: 'Fire extinguisher on site, PPE required, area barricaded', status_history: [{ status: 'active', date: '2026-05-10T07:00:00.000Z', note: 'Permit issued' }], createdAt: '2026-05-09T15:00:00.000Z' },
  { id: 'ptw2', permitNumber: 'PTW-2026-002', type: 'Confined Space', title: 'Inspection of Underground Tank', location: 'Utility Area - Tank B', issuer: 'Adnan Rafiq', issuerId: 'emp2', assignedTo: 'emp3', assignedName: 'Muhammad Danish', startDate: '2026-05-12', endDate: '2026-05-12', startTime: '09:00', endTime: '13:00', status: 'completed', hazards: 'Oxygen deficiency, Toxic gases', precautions: 'Gas monitor, rescue team on standby, buddy system', status_history: [{ status: 'active', date: '2026-05-12T08:30:00.000Z', note: 'Permit issued' }, { status: 'completed', date: '2026-05-12T13:15:00.000Z', note: 'Work completed safely' }], createdAt: '2026-05-11T10:00:00.000Z' },
  { id: 'ptw3', permitNumber: 'PTW-2026-003', type: 'Electrical Isolation', title: 'Panel Maintenance - Main Distribution Board', location: 'Substation Area', issuer: 'Adnan Rafiq', issuerId: 'emp2', assignedTo: 'emp1', assignedName: 'John Smith', startDate: '2026-05-18', endDate: '2026-05-18', startTime: '07:00', endTime: '12:00', status: 'pending', hazards: 'Electric shock, Arc flash', precautions: 'LOTO procedure, PPE Cat 4, Isolation certificate', status_history: [{ status: 'pending', date: '2026-05-15T14:00:00.000Z', note: 'Permit awaiting approval' }], createdAt: '2026-05-15T14:00:00.000Z' },
];

const STATIC_INSPECTIONS = [
  { id: 'ins1', title: 'Monthly Fire Safety Inspection', type: 'Fire Safety', location: 'Building A - All Floors', inspector: 'John Smith', inspectorId: 'emp1', scheduledDate: '2026-05-01', completedDate: '2026-05-01', status: 'completed', score: 85, totalItems: 20, passedItems: 17, failedItems: 3, findings: 'Exit sign on 2nd floor not illuminated. Fire door on 3rd floor blocked. Extinguisher P3 expired.', recommendations: 'Replace exit sign, clear fire door, replace extinguisher P3', createdAt: '2026-04-28T10:00:00.000Z' },
  { id: 'ins2', title: 'PPE & Equipment Audit', type: 'Equipment Audit', location: 'Warehouse & Production', inspector: 'Adnan Rafiq', inspectorId: 'emp2', scheduledDate: '2026-05-08', completedDate: '2026-05-08', status: 'completed', score: 92, totalItems: 25, passedItems: 23, failedItems: 2, findings: 'Two hard hats past expiry date. Safety harness tag missing on one unit.', recommendations: 'Replace expired hard hats, retag or replace safety harness', createdAt: '2026-05-06T09:00:00.000Z' },
  { id: 'ins3', title: 'Workplace Safety Walkthrough', type: 'General Safety', location: 'Production Floor & Yard', inspector: 'Muhammad Danish', inspectorId: 'emp3', scheduledDate: '2026-05-20', completedDate: null, status: 'scheduled', score: null, totalItems: 30, passedItems: 0, failedItems: 0, findings: '', recommendations: '', createdAt: '2026-05-14T11:00:00.000Z' },
];





export const initLocalData = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(STATIC_EMPLOYEES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(STATIC_REPORTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RISK_ASSESSMENTS)) {
    localStorage.setItem(STORAGE_KEYS.RISK_ASSESSMENTS, JSON.stringify(STATIC_RISK_ASSESSMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRAININGS)) {
    localStorage.setItem(STORAGE_KEYS.TRAININGS, JSON.stringify(STATIC_TRAININGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CORRECTIVE_ACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.CORRECTIVE_ACTIONS, JSON.stringify(STATIC_CORRECTIVE_ACTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PERMITS)) localStorage.setItem(STORAGE_KEYS.PERMITS, JSON.stringify(STATIC_PERMITS));
  if (!localStorage.getItem(STORAGE_KEYS.INSPECTIONS)) localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(STATIC_INSPECTIONS));
};

// ==================== DASHBOARD HELPERS ====================
export const getDashboardStats = () => {
  initLocalData();
  const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS)) || [];
  const riskAssessments = JSON.parse(localStorage.getItem(STORAGE_KEYS.RISK_ASSESSMENTS)) || [];
  const trainings = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRAININGS)) || [];
  const correctiveActions = JSON.parse(localStorage.getItem(STORAGE_KEYS.CORRECTIVE_ACTIONS)) || [];
  const permits = JSON.parse(localStorage.getItem(STORAGE_KEYS.PERMITS)) || [];
  const inspections = JSON.parse(localStorage.getItem(STORAGE_KEYS.INSPECTIONS)) || [];

  const openReports = reports.filter(r => (r.status || '').toLowerCase() === 'open').length;
  const highRiskAssessments = riskAssessments.filter(
    ra => (ra.riskLevel || '').toLowerCase() === 'high' && (ra.status || '').toLowerCase() === 'open'
  ).length;

  const completedTrainings = trainings.filter(t => t.status === 'Completed').length;
  const overdueActions = correctiveActions.filter(ca => {
    if (ca.status === 'completed') return false;
    return ca.dueDate && new Date(ca.dueDate) < new Date();
  }).length;

  const activePermits = permits.filter(p => p.status === 'active').length;

  const incidents = reports
    .filter(r => r.type === 'incident')
    .map(r => new Date(r.dateOfIncident || r.createdAt))
    .filter(d => !isNaN(d))
    .sort((a, b) => b - a);

  const daysSinceLastIncident = incidents.length > 0
    ? Math.floor((new Date() - incidents[0]) / (1000 * 60 * 60 * 24))
    : null;

  return {
    totalReports: reports.length,
    incidents: reports.filter(r => r.type === 'incident').length,
    nearMisses: reports.filter(r => r.type === 'near_miss').length,
    hazards: reports.filter(r => r.type === 'hazard').length,
    openReports,
    totalRiskAssessments: riskAssessments.length,
    highRiskAssessments,
    totalTrainings: trainings.length,
    completedTrainings,
    activeUsers: getLocalUsers()?.length || 0,
    safetyScore: 87,
    daysSinceLastIncident,
    overdueCorrectiveActions: overdueActions,
    openCorrectiveActions: correctiveActions.filter(ca => ca.status === 'open').length,
    activePermits,
    totalInspections: inspections.length,
    completedInspections: inspections.filter(i => i.status === 'completed').length,
  };
};

// Chart data: incidents by month (last 6 months)
export const getIncidentTrendData = () => {
  initLocalData();
  const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS)) || [];

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      label: d.toLocaleString('default', { month: 'short' }),
      month: d.getMonth(),
      year: d.getFullYear(),
      incidents: 0,
      nearMisses: 0,
      hazards: 0,
    });
  }

  reports.forEach(r => {
    const date = new Date(r.dateOfIncident || r.createdAt);
    const entry = months.find(m => m.month === date.getMonth() && m.year === date.getFullYear());
    if (!entry) return;
    if (r.type === 'incident') entry.incidents++;
    else if (r.type === 'near_miss') entry.nearMisses++;
    else if (r.type === 'hazard') entry.hazards++;
  });

  return months;
};

// Chart data: reports by location
export const getReportsByLocation = () => {
  initLocalData();
  const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS)) || [];
  const locationMap = {};
  reports.forEach(r => {
    const loc = r.location || 'Unknown';
    locationMap[loc] = (locationMap[loc] || 0) + 1;
  });
  return Object.entries(locationMap)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
};

// Chart data: risk level distribution
export const getRiskDistribution = () => {
  initLocalData();
  const risks = JSON.parse(localStorage.getItem(STORAGE_KEYS.RISK_ASSESSMENTS)) || [];
  return [
    { level: 'High', count: risks.filter(r => r.riskLevel === 'High').length, color: '#ef4444' },
    { level: 'Medium', count: risks.filter(r => r.riskLevel === 'Medium').length, color: '#f59e0b' },
    { level: 'Low', count: risks.filter(r => r.riskLevel === 'Low').length, color: '#10b981' },
  ];
};

export const getRecentReports = (limit = 5) => {
  const reports = getLocalReports();
  return [...reports]
    .sort((a, b) => new Date(b.createdAt || b.dateOfIncident) - new Date(a.createdAt || a.dateOfIncident))
    .slice(0, limit);
};

export const getRecentActivity = (limit = 8) => {
  initLocalData();
  const reports = getLocalReports();
  const risks = getLocalRiskAssessments();
  const trainings = getLocalTrainings();
  const actions = getLocalCorrectiveActions();

  let activities = [];

  getLocalReports().forEach(r => {
    activities.push({
      id: r.id,
      type: 'report',
      title: r.description?.substring(0, 55) + '…' || 'Report Submitted',
      subtitle: `${(r.type || '').replace('_', ' ').toUpperCase()} • ${r.location || 'N/A'}`,
      time: r.createdAt || r.dateOfIncident,
      icon: '📋',
    });
  });

  risks.forEach(ra => {
    activities.push({
      id: ra.id,
      type: 'risk',
      title: ra.activity || 'Risk Assessment',
      subtitle: `${ra.riskLevel} Risk • ${ra.location || ''}`,
      time: ra.createdAt || ra.reviewDate,
      icon: '⚠️',
      color: (ra.riskLevel || '').toLowerCase() === 'high' ? 'text-red-600' : 'text-amber-600',
    });
  });

  trainings.forEach(t => {
    activities.push({
      id: t.id,
      type: 'training',
      title: t.title,
      subtitle: `${t.status} • ${t.department || ''}`,
      time: t.createdAt || t.date,
      icon: '🎓',
      color: t.status === 'Completed' ? 'text-emerald-600' : 'text-blue-600',
    });
  });

  actions.forEach(ca => {
    activities.push({
      id: ca.id,
      type: 'action',
      title: ca.title,
      subtitle: `Corrective Action • ${ca.priority} priority`,
      time: ca.createdAt,
      icon: '✅',
      color: ca.status === 'completed' ? 'text-emerald-600' : 'text-blue-600',
    });
  });

  return activities
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, limit);
};

// ==================== REPORTS ====================

export const getEmployeePerformanceData = () => {
  initLocalData();
  const users = getLocalUsers();
  const reports = getLocalReports();
  const risks = getLocalRiskAssessments();
  const trainings = getLocalTrainings();
  const actions = getLocalCorrectiveActions();

  return users.map(user => {
    const ur = reports.filter(r => r.assignedTo === user.id);
    const closedReports = ur.filter(r => r.status === 'closed' || r.status === 'resolved').length;
    const urisk = risks.filter(r => r.assignedTo === user.id);
    const closedRisks = urisk.filter(r => r.status === 'closed').length;
    const utr = trainings.filter(t => t.trainerId === user.id);
    const completedTrainings = utr.filter(t => t.status === 'Completed').length;
    const scoresTr = utr.filter(t => t.score);
    const avgTrainingScore = scoresTr.length > 0 ? Math.round(scoresTr.reduce((s, t) => s + Number(t.score), 0) / scoresTr.length) : null;
    const ua = actions.filter(a => a.assignedTo === user.id);
    const completedActions = ua.filter(a => a.status === 'completed').length;
    const overdueActions = ua.filter(a => a.status !== 'completed' && a.dueDate && new Date(a.dueDate) < new Date()).length;

    const reportScore = Math.min((closedReports / Math.max(ur.length, 1)) * 30, 30);
    const riskScore = Math.min((closedRisks / Math.max(urisk.length, 1)) * 30, 30);
    const trainingScore = avgTrainingScore ? (avgTrainingScore / 100) * 20 : 0;
    const actionScore = Math.min((completedActions / Math.max(ua.length, 1)) * 20, 20);

    return {
      ...user,
      totalReports: ur.length,
      closedReports,
      openReports: ur.filter(r => r.status === 'open').length,
      totalRisks: urisk.length,
      closedRisks,
      totalTrainings: utr.length,
      completedTrainings,
      avgTrainingScore,
      totalActions: ua.length,
      completedActions,
      overdueActions,
      performanceScore: Math.round(reportScore + riskScore + trainingScore + actionScore),
    };
  });
};

// ==================== CRUD FUNCTIONS ====================

// Reports
export const getLocalReports = () => { initLocalData(); return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS)) || []; };

export const addLocalReport = (report) => {
  const reports = getLocalReports();
  const newReport = {
    ...report,
    id: 'report_' + Date.now(),
    createdAt: new Date().toISOString(),
    statusHistory: [{ status: report.status || 'open', date: new Date().toISOString(), note: 'Report created' }],
  };
  reports.unshift(newReport);
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  return newReport;
};

export const updateLocalReport = (id, data) => {
  const reports = getLocalReports();
  const index = reports.findIndex(r => r.id === id);
  if (index !== -1) {
    const existing = reports[index];
    // Append to status history if status changed
    let statusHistory = existing.statusHistory || [];
    if (data.status && data.status !== existing.status) {
      statusHistory = [
        ...statusHistory,
        { status: data.status, date: new Date().toISOString(), note: data.statusNote || '' },
      ];
    }
    reports[index] = { ...existing, ...data, statusHistory, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }
};

export const deleteLocalReport = (id) => {
  const reports = getLocalReports().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
};

export const getLocalReportById = (id) => {
  return getLocalReports().find(r => r.id === id) || null;
};

// ==================== RISK ASSESSMENTS ====================

export const getLocalRiskAssessments = () => {
  initLocalData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.RISK_ASSESSMENTS)) || [];
};

export const addLocalRiskAssessment = (assessment) => {
  const assessments = getLocalRiskAssessments();
  const newAssessment = {
    ...assessment,
    id: 'ra_' + Date.now(),
    createdAt: new Date().toISOString(),
    statusHistory: [{ status: assessment.status || 'open', date: new Date().toISOString(), note: 'Assessment created' }],
  };
  assessments.unshift(newAssessment);
  localStorage.setItem(STORAGE_KEYS.RISK_ASSESSMENTS, JSON.stringify(assessments));
  return newAssessment;
};

export const updateLocalRiskAssessment = (id, data) => {
  const assessments = getLocalRiskAssessments();
  const index = assessments.findIndex(r => r.id === id);
  if (index !== -1) {
    const existing = assessments[index];
    let statusHistory = existing.statusHistory || [];
    if (data.status && data.status !== existing.status) {
      statusHistory = [
        ...statusHistory,
        { status: data.status, date: new Date().toISOString(), note: data.statusNote || '' },
      ];
    }
    assessments[index] = { ...existing, ...data, statusHistory, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.RISK_ASSESSMENTS, JSON.stringify(assessments));
  }
};

export const deleteLocalRiskAssessment = (id) => {
  const assessments = getLocalRiskAssessments().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.RISK_ASSESSMENTS, JSON.stringify(assessments));
};

export const getLocalRiskAssessmentById = (id) => {
  return getLocalRiskAssessments().find(r => r.id === id) || null;
};

// ==================== EMPLOYEES ====================

export const getLocalUsers = () => {
  initLocalData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) || STATIC_EMPLOYEES;
};

export const addLocalUser = (user) => {
  const users = getLocalUsers();
  const newUser = { ...user, id: 'user_' + Date.now(), createdAt: new Date().toISOString() };
  users.unshift(newUser);
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(users));
  return newUser;
};

export const updateLocalUser = (id, data) => {
  const users = getLocalUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(users));
  }
};

export const deleteLocalUser = (id) => {
  const users = getLocalUsers().filter(u => u.id !== id);
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(users));
};

// ==================== TRAININGS ====================

export const getLocalTrainings = () => {
  initLocalData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRAININGS)) || [];
};

export const addLocalTraining = (training) => {
  const trainings = getLocalTrainings();
  const newTraining = { ...training, id: 'tr_' + Date.now(), createdAt: new Date().toISOString() };
  trainings.unshift(newTraining);
  localStorage.setItem(STORAGE_KEYS.TRAININGS, JSON.stringify(trainings));
  return newTraining;
};

export const updateLocalTraining = (id, data) => {
  const trainings = getLocalTrainings();
  const index = trainings.findIndex(t => t.id === id);
  if (index !== -1) {
    trainings[index] = { ...trainings[index], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.TRAININGS, JSON.stringify(trainings));
  }
};

export const deleteLocalTraining = (id) => {
  const trainings = getLocalTrainings().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TRAININGS, JSON.stringify(trainings));
};

// ==================== CORRECTIVE ACTIONS ====================

export const getLocalCorrectiveActions = () => {
  initLocalData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CORRECTIVE_ACTIONS)) || [];
};

export const addLocalCorrectiveAction = (action) => {
  const actions = getLocalCorrectiveActions();
  const newAction = { ...action, id: 'ca_' + Date.now(), createdAt: new Date().toISOString() };
  actions.unshift(newAction);
  localStorage.setItem(STORAGE_KEYS.CORRECTIVE_ACTIONS, JSON.stringify(actions));
  return newAction;
};

export const updateLocalCorrectiveAction = (id, data) => {
  const actions = getLocalCorrectiveActions();
  const index = actions.findIndex(a => a.id === id);
  if (index !== -1) {
    actions[index] = {
      ...actions[index],
      ...data,
      ...(data.status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CORRECTIVE_ACTIONS, JSON.stringify(actions));
  }
};

export const deleteLocalCorrectiveAction = (id) => {
  const actions = getLocalCorrectiveActions().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.CORRECTIVE_ACTIONS, JSON.stringify(actions));
};

export const getCorrectiveActionsForReport = (reportId) => {
  return getLocalCorrectiveActions().filter(a => a.linkedReportId === reportId);
};

// Permits
export const getLocalPermits = () => { initLocalData(); return JSON.parse(localStorage.getItem(STORAGE_KEYS.PERMITS)) || []; };

export const addLocalPermit = (permit) => {
  const items = getLocalPermits();
  const count = items.length + 1;
  const newItem = {
    ...permit,
    id: 'ptw_' + Date.now(),
    permitNumber: `PTW-2026-${String(count).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
    status_history: [{ status: permit.status || 'pending', date: new Date().toISOString(), note: 'Permit created' }]
  };
  items.unshift(newItem);
  localStorage.setItem(STORAGE_KEYS.PERMITS, JSON.stringify(items));
  return newItem;
};

export const updateLocalPermit = (id, data) => {
  const items = getLocalPermits();
  const i = items.findIndex(p => p.id === id);
  if (i !== -1) {
    const existing = items[i];
    let status_history = existing.status_history || [];
    if (data.status && data.status !== existing.status) {
      status_history = [...status_history, { status: data.status, date: new Date().toISOString(), note: data.statusNote || '' }];
    }
    items[i] = { ...existing, ...data, status_history, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PERMITS, JSON.stringify(items));
  }
};

export const deleteLocalPermit = (id) => {
  const permits = getLocalPermits().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PERMITS, JSON.stringify(permits));
};

// Inspections
export const getLocalInspections = () => { initLocalData(); return JSON.parse(localStorage.getItem(STORAGE_KEYS.INSPECTIONS)) || []; };

export const addLocalInspection = (inspection) => {
  const items = getLocalInspections();
  const newItem = { ...inspection, id: 'ins_' + Date.now(), createdAt: new Date().toISOString() };
  items.unshift(newItem);
  localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(items));
  return newItem;
};

export const updateLocalInspection = (id, data) => {
  const items = getLocalInspections();
  const i = items.findIndex(x => x.id === id);
  if (i !== -1) {
    items[i] = { ...items[i], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(items));
  }
};

export const deleteLocalInspection = (id) => {
  const inspections = getLocalInspections().filter(x => x.id !== id);
  localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
};