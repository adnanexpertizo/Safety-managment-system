// Add this to STORAGE_KEYS
const STORAGE_KEYS = {
  REPORTS: 'safety_reports',
  RISK_ASSESSMENTS: 'safety_risk_assessments',
  TRAININGS: 'safety_trainings',
  EMPLOYEES: 'safety_users',
};
const STATIC_TRAININGS = [
  {
    id: 'tr1',
    title: "Electrical Safety & Lockout/Tagout",
    department: "Electrical",
    trainer: "Adnan Rafiq",
    trainerId: "emp2",
    date: "2026-05-15",
    duration: "4 hours",
    participants: 18,
    status: "Completed",
    score: 88,
    createdAt: "2026-04-20T10:00:00.000Z",
  },
  {
    id: 'tr2',
    title: "Heavy Machinery Operation Safety",
    department: "Mechanical",
    trainer: "John Smith",
    trainerId: "emp1",
    date: "2026-05-20",
    duration: "6 hours",
    participants: 12,
    status: "Scheduled",
    score: null,
    createdAt: "2026-04-25T14:30:00.000Z",
  },
  {
    id: 'tr3',
    title: "Hazard Identification & Risk Assessment",
    department: "HSE",
    trainer: "Muhammad Danish",
    trainerId: "emp3",
    date: "2026-05-10",
    duration: "3 hours",
    participants: 25,
    status: "Completed",
    score: 92,
    createdAt: "2026-04-15T09:00:00.000Z",
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
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'emp2',
      name: 'Adnan Rafiq',
      email: 'adnan@safety.com',
      role: 'ADMIN',
      department: 'HSE',
      designation: 'HSE Manager',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'emp3',
      name: 'Muhammad Danish',
      email: 'danish@safety.com',
      role: 'SUPERVISOR',
      department: 'Operations',
      designation: 'Supervisor',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'emp4',
      name: 'Abdullah Naseer',
      email: 'abdullah@safety.com',
      role: 'TECHNICIAN',
      department: 'Maintenance',
      designation: 'Technician',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'emp5',
      name: 'Izhaan Saqib',
      email: 'izhaan@safety.com',
      role: 'COORDINATOR',
      department: 'HSE',
      designation: 'Safety Coordinator',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00.000Z'
    }

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
    },
    {
      id: 'static-r2',
      type: 'near_miss',
      severity: 'medium',
      potentialSeverity: 'high',
      dateOfIncident: '2026-04-28T14:15',
      location: 'Production Floor',
      description: 'Forklift almost hit a pedestrian.',
      witnesses: 'Ali Hassan',
      immediateActions: 'Verbal warning given.',
      recommendedActions: 'Install pedestrian walkways and speed bumps.',
      status: 'resolved',
      assignedTo: 'emp1',
      assignedName: 'John Smith',
      assignedDesignation: 'Safety Officer',
      createdAt: '2026-04-28T14:15:00.000Z',
    },
    {
      id: 'static-r3',
      type: 'hazard',
      severity: 'medium',
      potentialSeverity: 'medium',
      dateOfIncident: '2026-05-01T08:00',
      location: 'Electrical Room',
      description: 'Exposed wiring near control panel.',
      witnesses: '',
      immediateActions: 'Tagged out of service.',
      recommendedActions: 'Schedule urgent repair with electrician.',
      status: 'open',
      assignedTo: 'emp3',
      assignedName: 'Muhammad Danish',
      assignedDesignation: 'Supervisor',
      createdAt: '2026-05-01T08:00:00.000Z',
    },
  ];

  const STATIC_RISK_ASSESSMENTS = [
    {
      id: 'ra1',
      activity: "Maintenance on Main Transformer",
      hazard: "Electrical shock and arc flash",
      hazardCategory: "Electrical",
      location: "Substation Area",
      likelihood: 4,
      severity: 5,
      riskScore: 20,
      riskLevel: "High",
      status: "open",
      assignedName: "Adnan Rafiq",
      reviewDate: "2026-05-15",
      createdAt: "2026-04-10T10:00:00.000Z",
    },
    {
      id: 'ra2',
      activity: "Chemical storage handling",
      hazard: "Chemical spill and exposure",
      hazardCategory: "Chemical",
      location: "Warehouse Zone B",
      likelihood: 3,
      severity: 4,
      riskScore: 12,
      riskLevel: "Medium",
      status: "closed",
      assignedName: "John Smith",
      reviewDate: "2026-04-20",
      createdAt: "2026-04-05T08:30:00.000Z",
    },
    {
      id: 'ra3',
      activity: "Scaffolding erection",
      hazard: "Fall from height",
      hazardCategory: "Physical",
      location: "Site B - Building 3",
      likelihood: 5,
      severity: 5,
      riskScore: 25,
      riskLevel: "High",
      status: "open",
      assignedName: "Muhammad Danish",
      reviewDate: "2026-05-10",
      createdAt: "2026-04-28T14:00:00.000Z",
    },
  ];

export const initLocalData = () => {
  
  // Add this line at the top (Important for Next.js)
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

  // ← ADD THIS BLOCK (for Trainings)
  if (!localStorage.getItem(STORAGE_KEYS.TRAININGS)) {
    localStorage.setItem(STORAGE_KEYS.TRAININGS, JSON.stringify(STATIC_TRAININGS));
  }
};

// ==================== DASHBOARD HELPERS ====================

export const getDashboardStats = () => {
  initLocalData();

  const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS)) || [];
  const riskAssessments = JSON.parse(localStorage.getItem(STORAGE_KEYS.RISK_ASSESSMENTS)) || [];
  const trainings = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRAININGS)) || [];

  const openReports = reports.filter(r => (r.status || '').toLowerCase() === 'open').length;
  const resolvedReports = reports.filter(r => ['resolved', 'closed'].includes((r.status || '').toLowerCase())).length;

  const highRiskAssessments = riskAssessments.filter(ra => 
    (ra.riskLevel || '').toLowerCase() === 'high' && (ra.status || '').toLowerCase() === 'open'
  ).length;

  return {
    totalReports: reports.length,
    incidents: reports.filter(r => r.type === 'incident').length,
    nearMisses: reports.filter(r => r.type === 'near_miss').length,
    hazards: reports.filter(r => r.type === 'hazard').length,
    openReports,
    resolvedReports,
    totalRiskAssessments: riskAssessments.length,
    highRiskAssessments,
    totalTrainings: trainings.length,
  };
};

export const getRecentReports = (limit = 5) => {
  const reports = getLocalReports();
  return [...reports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};

  // ==================== REPORTS ====================

  export const getLocalReports = () => {
    initLocalData();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS)) || [];
  };

  export const addLocalReport = (report) => {
    const reports = getLocalReports();
    const newReport = { ...report, id: 'report_' + Date.now(), createdAt: new Date().toISOString() };
    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    return newReport;
  };

  export const updateLocalReport = (id, data) => {
    const reports = getLocalReports();
    const index = reports.findIndex(r => r.id === id);

    if (index !== -1) {
      reports[index] = { ...reports[index], ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    }
  };

  export const deleteLocalReport = (id) => {
    const reports = getLocalReports().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
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
    };

    assessments.unshift(newAssessment);

    localStorage.setItem(STORAGE_KEYS.RISK_ASSESSMENTS, JSON.stringify(assessments));

    return newAssessment;
  };

  export const updateLocalRiskAssessment = (id, data) => {
    const assessments = getLocalRiskAssessments();
    const index = assessments.findIndex(r => r.id === id);

    if (index !== -1) {
      assessments[index] = { ...assessments[index], ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.RISK_ASSESSMENTS, JSON.stringify(assessments));
    }
  };

  export const deleteLocalRiskAssessment = (id) => {
    const assessments = getLocalRiskAssessments().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RISK_ASSESSMENTS, JSON.stringify(assessments));
  };

  // ==================== EMPLOYEES ====================

  export const getLocalUsers = () => {
    initLocalData();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) || STATIC_EMPLOYEES;
  };

  export const addLocalUser = (user) => {
    const users = getLocalUsers();

    const newUser = {
      ...user,
      id: 'user_' + Date.now(),
      createdAt: new Date().toISOString()
    };

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

// ==================== TRAININGS CRUD ====================

export const getLocalTrainings = () => {
  initLocalData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRAININGS)) || [];
};

export const addLocalTraining = (training) => {
  const trainings = getLocalTrainings();
  const newTraining = {
    ...training,
    id: 'tr_' + Date.now(),
    createdAt: new Date().toISOString(),
  };
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