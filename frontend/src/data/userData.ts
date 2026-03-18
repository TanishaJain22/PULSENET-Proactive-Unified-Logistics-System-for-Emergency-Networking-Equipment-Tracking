// ─── Types ──────────────────────────────────────────────────────────
export type PermissionTier = "notify" | "tracking" | "full-access"
export type VerificationStatus = "verified" | "pending"

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  avatarSeed: string
  avatarImage: string
  gender: "male" | "female" | "other"
  profileCompletion: number // 0-100
  completedSections: number
  totalSections: number
  preferredHospital?: string
}

export interface FamilyMember {
  id: string
  name: string
  relationship: string
  phone: string
  email: string
  gender: "male" | "female" | "other"
  avatarSeed: string
  avatarImage: string
  permissionTier: PermissionTier
  verificationStatus: VerificationStatus
  medicalConditions?: string[]
}

export interface GovernmentScheme {
  id: string
  name: string
  governmentBody: string
  bodyType: "central" | "state"
  stateName?: string
  coverageAmount: number
  description: string
  isEligible: boolean
  hospitalAccepted?: string
  category: string
  isNew?: boolean
  
  // Drawer Detailed Info
  launchedYear?: string
  officialLogo?: string
  
  eligibilityDetails?: {
    incomeLimit: "BPL" | "APL" | "All"
    ageGroup: string
    gender: "All" | "Women" | "Men"
    occupation: string
    rationCard: string
    stateResident: string
    specialConditions: string[]
  }

  coverageDetails?: {
    coveredTreatments: string[]
    maxClaimLimit: number
    membersCovered: string
    hospitalNetwork: "Government" | "Private" | "Both"
    opdIncluded: boolean
    medicinesIncluded: boolean
  }

  durationDetails?: {
    activePeriod: string
    renewal: string
    enrollmentWindow: string
  }

  applicationDetails?: {
    steps: string[]
    requiredDocuments: string[]
    whereToApply: string
    processingTime: string
  }
}


export interface ActivityLogEntry {
  id: string
  message: string
  timestamp: string
  relativeTime: string
}

// ─── Mock Data ──────────────────────────────────────────────────────
export const mockUser: UserProfile = {
  id: "u1",
  firstName: "Rahul",
  lastName: "Sharma",
  phone: "+91 98765 43210",
  email: "rahul.sharma@email.com",
  avatarSeed: "Rahul",
  avatarImage: "/husband.png",
  gender: "male",
  profileCompletion: 68,
  completedSections: 4,
  totalSections: 6,
  preferredHospital: "Apollo Hospital, Mumbai",
}

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: "f1",
    name: "Amit Sharma",
    relationship: "Father",
    phone: "+91 98111 22233",
    email: "amit.s@email.com",
    gender: "male",
    avatarSeed: "Amit",
    avatarImage: "/grandfather.png",
    permissionTier: "full-access",
    verificationStatus: "verified",
    medicalConditions: ["Heart Disease", "Hypertension"],
  },
  {
    id: "f2",
    name: "Priya Sharma",
    relationship: "Spouse",
    phone: "+91 97222 33344",
    email: "priya.s@email.com",
    gender: "female",
    avatarSeed: "Priya",
    avatarImage: "/wife.png",
    permissionTier: "full-access",
    verificationStatus: "verified",
    medicalConditions: ["Diabetes Type 2"],
  },
  {
    id: "f3",
    name: "Vikram Sharma",
    relationship: "Brother",
    phone: "+91 96333 44455",
    email: "vikram.s@email.com",
    gender: "male",
    avatarSeed: "Vikram",
    avatarImage: "/son.png",
    permissionTier: "tracking",
    verificationStatus: "pending",
  },
  {
    id: "f4",
    name: "Sunita Sharma",
    relationship: "Mother",
    phone: "+91 95444 55566",
    email: "sunita.s@email.com",
    gender: "female",
    avatarSeed: "Sunita",
    avatarImage: "/grandmother.png",
    permissionTier: "full-access",
    verificationStatus: "verified",
    medicalConditions: ["Arthritis", "Osteoporosis"],
  },
]

export const mockSchemes: GovernmentScheme[] = [
  {
    id: "s1",
    name: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana",
    governmentBody: "Ministry of Health and Family Welfare",
    bodyType: "central",
    coverageAmount: 500000,
    description: "Health cover of ₹5 lakh per family per year for secondary and tertiary care hospitalisation",
    isEligible: true,
    hospitalAccepted: "Apollo Hospital",
    category: "General",
    launchedYear: "2018",
    isNew: false,
    eligibilityDetails: {
      incomeLimit: "BPL",
      ageGroup: "0-99",
      gender: "All",
      occupation: "Unorganized",
      rationCard: "Yellow/Orange",
      stateResident: "All India",
      specialConditions: ["Deprived rural families", "Identified occupational categories"],
    },
    coverageDetails: {
      coveredTreatments: ["Cardiology", "Oncology", "Neurology", "Orthopedics", "Neonatal care"],
      maxClaimLimit: 500000,
      membersCovered: "Entire family (no cap on family size)",
      hospitalNetwork: "Both",
      opdIncluded: false,
      medicinesIncluded: true,
    },
    durationDetails: {
      activePeriod: "Ongoing",
      renewal: "Auto-renewed annually",
      enrollmentWindow: "Open year-round",
    },
    applicationDetails: {
      steps: [
        "Check eligibility using Aadhaar or Ration Card at PMJAY portal",
        "Visit the nearest Common Service Centre (CSC) or empaneled hospital",
        "Complete KYC verification using biometric authentication",
        "Receive Ayushman e-Card instantly upon verification"
      ],
      requiredDocuments: ["Aadhaar Card", "Ration Card", "Mobile Number", "Income Certificate (Optional)"],
      whereToApply: "Online portal / Empowered hospitals / CSC centers",
      processingTime: "Instant to 48 hours for card generation",
    }
  },
  {
    id: "s2",
    name: "Janani Suraksha Yojana",
    governmentBody: "National Health Mission",
    bodyType: "central",
    coverageAmount: 1400,
    description: "Promotes institutional delivery among poor pregnant women with cash assistance",
    isEligible: true,
    category: "Maternity",
    launchedYear: "2005",
    isNew: false,
    eligibilityDetails: {
      incomeLimit: "BPL",
      ageGroup: "19+",
      gender: "Women",
      occupation: "All",
      rationCard: "BPL registered",
      stateResident: "All India (Special focus on Low Performing States)",
      specialConditions: ["Pregnant women", "Delivering in government hospitals"],
    },
    coverageDetails: {
      coveredTreatments: ["Institutional Delivery", "Post-delivery care", "Neonatal care"],
      maxClaimLimit: 1400,
      membersCovered: "Mother and newborn",
      hospitalNetwork: "Government",
      opdIncluded: true,
      medicinesIncluded: true,
    },
    durationDetails: {
      activePeriod: "During pregnancy and post-delivery",
      renewal: "Not required (per delivery basis)",
      enrollmentWindow: "During antenatal check-ups",
    },
    applicationDetails: {
      steps: [
        "Register pregnancy at nearest Anganwadi or PHC",
        "Undergo at least 3 Antenatal Care (ANC) check-ups",
        "Link bank account and Aadhaar at the health center",
        "Cash assistance is transferred directly after institutional delivery"
      ],
      requiredDocuments: ["MCP Card (Mother & Child Protection)", "Aadhaar Card", "Bank Passbook passbook", "BPL Certificate"],
      whereToApply: "Local PHC / ASHA worker",
      processingTime: "7-14 days post-delivery",
    }
  },
  {
    id: "s3",
    name: "Chief Minister's Comprehensive Health Insurance",
    governmentBody: "State Department of Health",
    bodyType: "state",
    stateName: "Tamil Nadu",
    coverageAmount: 500000,
    description: "Quality health care to the eligible persons through empanelled Government and Private hospitals",
    isEligible: false,
    category: "General",
    launchedYear: "2012",
    isNew: false,
    eligibilityDetails: {
      incomeLimit: "BPL",
      ageGroup: "All",
      gender: "All",
      occupation: "All",
      rationCard: "Smart Card required",
      stateResident: "Tamil Nadu",
      specialConditions: ["Annual income less than ₹1,20,000"],
    },
    coverageDetails: {
      coveredTreatments: ["1000+ medical and surgical procedures", "Diagnostic tests", "Follow-up care"],
      maxClaimLimit: 500000,
      membersCovered: "Eligible family members on Ration Card",
      hospitalNetwork: "Both",
      opdIncluded: false,
      medicinesIncluded: true,
    },
    durationDetails: {
      activePeriod: "Ongoing",
      renewal: "Auto-renewed with valid Smart Card",
      enrollmentWindow: "Open year-round via VAO",
    },
    applicationDetails: {
      steps: [
        "Obtain Income Certificate from Village Administrative Officer (VAO)",
        "Visit the District Kiosk with original Ration Card and Aadhaar",
        "Biometric data of all family members is captured",
        "Smart Health Card is issued immediately"
      ],
      requiredDocuments: ["Income Certificate", "Ration Card", "Aadhaar Card of all members"],
      whereToApply: "District Collectorate Kiosks",
      processingTime: "Instant upon successful biometrics",
    }
  },
  {
    id: "s4",
    name: "Senior Citizen Health Coverage Extension",
    governmentBody: "Ministry of Health",
    bodyType: "central",
    coverageAmount: 500000,
    description: "Extended ₹5 lakh top-up cover specifically for citizens above 70 years",
    isEligible: false,
    category: "Senior",
    isNew: true,
    launchedYear: "2024",
    eligibilityDetails: {
      incomeLimit: "All",
      ageGroup: "70+",
      gender: "All",
      occupation: "All",
      rationCard: "Not required",
      stateResident: "All India",
      specialConditions: ["Must be aged 70 or above"],
    },
    coverageDetails: {
      coveredTreatments: ["Geriatric care", "Joint replacements", "Cataract", "Cardiac interventions"],
      maxClaimLimit: 500000,
      membersCovered: "Individual senior citizen",
      hospitalNetwork: "Both",
      opdIncluded: false,
      medicinesIncluded: true,
    },
    durationDetails: {
      activePeriod: "Ongoing",
      renewal: "Annual declaration",
      enrollmentWindow: "Open year-round via specialized portal",
    },
    applicationDetails: {
      steps: [
        "Login to the PMJAY Senior Citizen extended portal via Aadhaar",
        "Complete e-KYC to verify age (must be 70+)",
        "Generate the dedicated senior citizen health card",
      ],
      requiredDocuments: ["Aadhaar Card (for age proof)"],
      whereToApply: "Online PMJAY portal / Empanelled Hospitals",
      processingTime: "Instant digital generation",
    }
  },
  {
    id: "s5",
    name: "Rashtriya Arogya Nidhi",
    governmentBody: "Ministry of Health and Family Welfare",
    bodyType: "central",
    coverageAmount: 1500000,
    description: "Financial assistance to BPL patients for treatment of life-threatening diseases at super specialty Hospitals",
    isEligible: false,
    category: "Cancer",
    launchedYear: "1997",
    isNew: false,
    eligibilityDetails: {
      incomeLimit: "BPL",
      ageGroup: "All",
      gender: "All",
      occupation: "All",
      rationCard: "BPL Card required",
      stateResident: "All India",
      specialConditions: ["Suffering from major life-threatening diseases", "Treatment required at Government Super Specialty Hospital"],
    },
    coverageDetails: {
      coveredTreatments: ["Cancer", "Renal failure", "Liver diseases", "Heart surgeries"],
      maxClaimLimit: 1500000,
      membersCovered: "Individual Patient",
      hospitalNetwork: "Government",
      opdIncluded: true,
      medicinesIncluded: true,
    },
    durationDetails: {
      activePeriod: "One-time grant per illness event",
      renewal: "Not applicable",
      enrollmentWindow: "Applied at the time of diagnosis/admission",
    },
    applicationDetails: {
      steps: [
        "Obtain estimated cost of treatment from the treating super specialty department",
        "Gather BPL certificate and detailed medical reports",
        "Submit the application through the Medical Superintendent of the treating hospital",
        "Fund is directly transferred to the hospital's account"
      ],
      requiredDocuments: ["BPL Certificate", "Estimated Cost Certificate from Hospital", "Medical Reports", "Aadhaar Card"],
      whereToApply: "Directly through treating Government Super Specialty Hospital",
      processingTime: "2 to 4 weeks for approval",
    }
  },
]



export const mockActivityLog: ActivityLogEntry[] = [
  { id: "a1", message: "Vikram (Brother) invited — awaiting verification", timestamp: "2026-03-13T10:00:00", relativeTime: "2d ago" },
  { id: "a2", message: "Priya (Spouse) → Full Access", timestamp: "2026-03-10T14:30:00", relativeTime: "5d ago" },
  { id: "a3", message: "SOS alert sent to all contacts", timestamp: "2026-02-28T08:15:00", relativeTime: "Feb 28" },
  { id: "a4", message: "Amit (Father) verified successfully", timestamp: "2026-02-25T16:00:00", relativeTime: "Feb 25" },
  { id: "a5", message: "Family network created", timestamp: "2026-02-20T09:00:00", relativeTime: "Feb 20" },
]

export const schemeCategories = ["Maternity", "Cancer", "Cardiac", "Senior", "Children", "BPL"]

export function getPermissionLabel(tier: PermissionTier): string {
  switch (tier) {
    case "notify": return "Notify Only"
    case "tracking": return "Tracking"
    case "full-access": return "Full Access"
  }
}

export function getPermissionDots(tier: PermissionTier): [boolean, boolean, boolean] {
  switch (tier) {
    case "notify": return [true, false, false]
    case "tracking": return [true, true, false]
    case "full-access": return [true, true, true]
  }
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return "Free"
  return "₹" + amount.toLocaleString("en-IN")
}

// Map relationship to avatar image path
const RELATIONSHIP_AVATAR_MAP: Record<string, string> = {
  "Father": "/grandfather.png",
  "Mother": "/grandmother.png",
  "Spouse": "/wife.png",
  "Brother": "/son.png",
  "Sister": "/daughter.png",
  "Son": "/son.png",
  "Daughter": "/daughter.png",
  "Grandfather": "/grandfather.png",
  "Grandmother": "/grandmother.png",
}

export function getAvatarForRelationship(relationship: string, gender: string): string {
  return RELATIONSHIP_AVATAR_MAP[relationship] || (gender === "female" ? "/girl.png" : "/boy.png")
}
