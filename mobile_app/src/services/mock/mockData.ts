export const MOCK_HOSPITALS = [
  { id: 'hosp01', name: 'City General Hospital', type: 'Level 1 Trauma', distance: '2.4 km', availability: 'High' },
  { id: 'hosp02', name: 'Sunrise Medical Center', type: 'Specialized Cardiac', distance: '4.8 km', availability: 'Medium' },
  { id: 'hosp03', name: 'St. Mary\'s Hospital', type: 'Pediatric Care', distance: '6.1 km', availability: 'Normal' },
];

export const MOCK_RECORDS = [
  { 
    id: 'rec01', 
    date: '2024-02-15', 
    type: 'Diagnostic Report', 
    title: 'Blood Analysis', 
    doctor: 'Dr. Sarah Wilson',
    result: 'Normal'
  },
  { 
    id: 'rec02', 
    date: '2023-11-10', 
    type: 'Prescription', 
    title: 'Chronic Hypertension Meds', 
    doctor: 'Dr. James Miller',
    result: 'Ongoing'
  },
];

export const MOCK_HEALTH_SCHEMES = [
  { id: 'sch01', name: 'PMJAY (Ayushman Bharat)', status: 'Eligible', coverage: '₹5,00,000' },
  { id: 'sch02', name: 'State Employees Health Scheme', status: 'Active', coverage: 'Full' },
];

export const MOCK_TIMELINE = [
  { time: '10:45 AM', event: 'Emergency Call Received', status: 'completed' },
  { time: '10:48 AM', event: 'Ambulance Dispatched', status: 'completed' },
  { time: '10:55 AM', event: 'Paramedics Arrived on Scene', status: 'completed' },
  { time: '11:02 AM', event: 'Vitals Recorded & Triage Assessed', status: 'active' },
  { time: 'Pending', event: 'Hospital Arrival & ER Handoff', status: 'pending' },
];

/**
 * Simulates a severity calculation based on vitals
 */
export const calculateSeverity = async (vitals: any): Promise<{ severity: string, score: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Logic: 0-3 Normal, 4-6 Moderate, 7+ High/Critical
      const score = Math.floor(Math.random() * 10);
      let severity = 'NORMAL';
      if (score >= 7) severity = 'CRITICAL';
      else if (score >= 4) severity = 'MODERATE';
      
      resolve({ severity, score });
    }, 1500);
  });
};

/**
 * Simulates finding the best hospital
 */
export const findAssignedHospital = async (caseId: string): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_HOSPITALS[0]);
    }, 1500);
  });
};
