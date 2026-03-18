import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CreditCard, FileText, Plus, CheckCircle, Clock, AlertTriangle, 
  Search, Filter, Download, Upload, Phone, Mail, MapPin, Calendar,
  TrendingUp, TrendingDown, DollarSign, Users, Building, Heart,
  Stethoscope, Pill, Activity, Eye, Zap, Baby, Car, Home, Star,
  ExternalLink, RefreshCw, AlertCircle, Info, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface InsurancePolicy {
  id: string;
  provider: string;
  policyNumber: string;
  type: string;
  coverage: number;
  premium: number;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  expiryDate: string;
  familyMembers: number;
  deductible: number;
  coPayment: number;
  networkHospitals: number;
  claimsUsed: number;
  renewalDate: string;
  agentName: string;
  agentPhone: string;
  benefits: string[];
  exclusions: string[];
}

interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  hospital: string;
  amount: number;
  approvedAmount?: number;
  status: 'approved' | 'pending' | 'rejected' | 'processing' | 'settled';
  date: string;
  description: string;
  documents: string[];
  estimatedSettlement?: string;
  rejectionReason?: string;
  treatmentType: string;
  doctorName: string;
  admissionDate?: string;
  dischargeDate?: string;
}

interface InsuranceProvider {
  id: string;
  name: string;
  logo: string;
  rating: number;
  claimSettlementRatio: number;
  networkHospitals: number;
  customerSupport: string;
  website: string;
  specialties: string[];
}

interface CoverageCategory {
  name: string;
  covered: number;
  total: number;
  icon: any;
  color: string;
  details: string[];
}

interface PreAuthRequest {
  id: string;
  hospitalName: string;
  treatmentType: string;
  estimatedCost: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  validUntil?: string;
}

export default function InsuranceHub() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([
    {
      id: '1',
      provider: 'Star Health Insurance',
      policyNumber: 'SH123456789',
      type: 'Family Floater',
      coverage: 500000,
      premium: 12000,
      status: 'active',
      expiryDate: '2024-12-31',
      renewalDate: '2024-11-30',
      familyMembers: 4,
      deductible: 5000,
      coPayment: 10,
      networkHospitals: 12000,
      claimsUsed: 25000,
      agentName: 'Rajesh Kumar',
      agentPhone: '+91-9876543210',
      benefits: [
        'Cashless treatment at network hospitals',
        'Pre and post hospitalization coverage',
        'Day care procedures',
        'Ambulance charges',
        'Health check-ups',
        'Maternity benefits'
      ],
      exclusions: [
        'Pre-existing diseases (first 2 years)',
        'Cosmetic surgery',
        'Dental treatment',
        'War and nuclear risks'
      ]
    },
    {
      id: '2',
      provider: 'HDFC ERGO',
      policyNumber: 'HE987654321',
      type: 'Individual',
      coverage: 300000,
      premium: 8000,
      status: 'active',
      expiryDate: '2024-08-15',
      renewalDate: '2024-07-15',
      familyMembers: 1,
      deductible: 3000,
      coPayment: 15,
      networkHospitals: 8500,
      claimsUsed: 0,
      agentName: 'Priya Sharma',
      agentPhone: '+91-9123456789',
      benefits: [
        'Cashless treatment',
        'Emergency ambulance',
        'Health check-ups',
        'Second medical opinion'
      ],
      exclusions: [
        'Pre-existing diseases (first 3 years)',
        'Cosmetic procedures',
        'Alternative treatments'
      ]
    }
  ]);

  const [claims, setClaims] = useState<Claim[]>([
    {
      id: '1',
      claimNumber: 'CLM2024001',
      policyId: '1',
      hospital: 'Apollo Hospital',
      amount: 25000,
      approvedAmount: 23000,
      status: 'settled',
      date: '2024-02-15',
      description: 'Emergency surgery - Appendectomy',
      documents: ['discharge_summary.pdf', 'bills.pdf', 'reports.pdf'],
      treatmentType: 'Surgery',
      doctorName: 'Dr. Amit Patel',
      admissionDate: '2024-02-14',
      dischargeDate: '2024-02-16'
    },
    {
      id: '2',
      claimNumber: 'CLM2024002',
      policyId: '1',
      hospital: 'Fortis Healthcare',
      amount: 15000,
      status: 'processing',
      date: '2024-03-01',
      description: 'Diagnostic tests and consultation',
      documents: ['test_reports.pdf', 'prescription.pdf'],
      estimatedSettlement: '2024-03-20',
      treatmentType: 'Diagnostic',
      doctorName: 'Dr. Sarah Johnson'
    },
    {
      id: '3',
      claimNumber: 'CLM2024003',
      policyId: '2',
      hospital: 'Max Healthcare',
      amount: 8000,
      status: 'rejected',
      date: '2024-02-28',
      description: 'Dental treatment',
      documents: ['dental_bill.pdf'],
      rejectionReason: 'Dental treatment not covered under policy',
      treatmentType: 'Dental',
      doctorName: 'Dr. Ravi Gupta'
    }
  ]);

  const [preAuthRequests, setPreAuthRequests] = useState<PreAuthRequest[]>([
    {
      id: '1',
      hospitalName: 'Manipal Hospital',
      treatmentType: 'Cardiac Surgery',
      estimatedCost: 150000,
      requestDate: '2024-03-10',
      status: 'approved',
      validUntil: '2024-04-10'
    },
    {
      id: '2',
      hospitalName: 'Narayana Health',
      treatmentType: 'Orthopedic Surgery',
      estimatedCost: 80000,
      requestDate: '2024-03-12',
      status: 'pending'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const governmentSchemes: GovernmentScheme[] = [
    {
      id: '1',
      name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
      nameHindi: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
      description: 'World\'s largest health insurance scheme providing coverage up to ₹5 lakh per family per year',
      descriptionHindi: 'दुनिया की सबसे बड़ी स्वास्थ्य बीमा योजना जो प्रति परिवार प्रति वर्ष ₹5 लाख तक का कवरेज प्रदान करती है',
      eligibility: [
        'Families identified in SECC 2011 database',
        'Rural families with specific deprivation criteria',
        'Urban families in occupational categories',
        'Income below poverty line'
      ],
      eligibilityHindi: [
        'SECC 2011 डेटाबेस में पहचाने गए परिवार',
        'विशिष्ट वंचना मानदंडों वाले ग्रामीण परिवार',
        'व्यावसायिक श्रेणियों में शहरी परिवार',
        'गरीबी रेखा से नीचे आय'
      ],
      benefits: [
        'Cashless treatment at empanelled hospitals',
        'Coverage for secondary and tertiary care',
        'Pre and post hospitalization expenses',
        'No cap on family size and age'
      ],
      benefitsHindi: [
        'सूचीबद्ध अस्पतालों में कैशलेस उपचार',
        'द्वितीयक और तृतीयक देखभाल के लिए कवरेज',
        'अस्पताल में भर्ती से पहले और बाद के खर्च',
        'परिवार के आकार और उम्र पर कोई सीमा नहीं'
      ],
      applicationProcess: [
        'Check eligibility on official website',
        'Visit nearest Common Service Center (CSC)',
        'Provide Aadhaar and family details',
        'Get Ayushman Card printed',
        'Use card at empanelled hospitals'
      ],
      applicationProcessHindi: [
        'आधिकारिक वेबसाइट पर पात्रता जांचें',
        'निकटतम कॉमन सर्विस सेंटर (CSC) पर जाएं',
        'आधार और परिवार का विवरण प्रदान करें',
        'आयुष्मान कार्ड प्रिंट कराएं',
        'सूचीबद्ध अस्पतालों में कार्ड का उपयोग करें'
      ],
      documents: [
        'Aadhaar Card',
        'Ration Card',
        'Mobile Number',
        'Family ID (if available)'
      ],
      documentsHindi: [
        'आधार कार्ड',
        'राशन कार्ड',
        'मोबाइल नंबर',
        'पारिवारिक आईडी (यदि उपलब्ध हो)'
      ],
      website: 'https://pmjay.gov.in',
      helpline: '14555',
      category: 'universal',
      coverage: '₹5 Lakh per family per year',
      coverageHindi: '₹5 लाख प्रति परिवार प्रति वर्ष'
    },
    {
      id: '2',
      name: 'Rashtriya Swasthya Bima Yojana (RSBY)',
      nameHindi: 'राष्ट्रीय स्वास्थ्य बीमा योजना',
      description: 'Health insurance scheme for Below Poverty Line (BPL) families',
      descriptionHindi: 'गरीबी रेखा से नीचे (BPL) परिवारों के लिए स्वास्थ्य बीमा योजना',
      eligibility: [
        'BPL families',
        'Annual income below ₹1 lakh',
        'Registered with state government'
      ],
      eligibilityHindi: [
        'BPL परिवार',
        'वार्षिक आय ₹1 लाख से कम',
        'राज्य सरकार के साथ पंजीकृत'
      ],
      benefits: [
        'Cashless treatment',
        'Coverage for hospitalization',
        'Pre-existing disease coverage after waiting period'
      ],
      benefitsHindi: [
        'कैशलेस उपचार',
        'अस्पताल में भर्ती के लिए कवरेज',
        'प्रतीक्षा अवधि के बाद पूर्व-मौजूदा बीमारी कवरेज'
      ],
      applicationProcess: [
        'Contact local authorities',
        'Submit BPL certificate',
        'Biometric enrollment',
        'Receive smart card'
      ],
      applicationProcessHindi: [
        'स्थानीय अधिकारियों से संपर्क करें',
        'BPL प्रमाणपत्र जमा करें',
        'बायोमेट्रिक नामांकन',
        'स्मार्ट कार्ड प्राप्त करें'
      ],
      documents: [
        'BPL Certificate',
        'Aadhaar Card',
        'Address Proof',
        'Income Certificate'
      ],
      documentsHindi: [
        'BPL प्रमाणपत्र',
        'आधार कार्ड',
        'पता प्रमाण',
        'आय प्रमाणपत्र'
      ],
      website: 'https://www.rsby.gov.in',
      helpline: '1800-345-6789',
      category: 'universal',
      coverage: '₹30,000 per family per year',
      coverageHindi: '₹30,000 प्रति परिवार प्रति वर्ष'
    },
    {
      id: '3',
      name: 'Janani Suraksha Yojana (JSY)',
      nameHindi: 'जननी सुरक्षा योजना',
      description: 'Safe motherhood intervention scheme for pregnant women',
      descriptionHindi: 'गर्भवती महिलाओं के लिए सुरक्षित मातृत्व हस्तक्षेप योजना',
      eligibility: [
        'Pregnant women from BPL families',
        'All pregnant women in low performing states',
        'Age 19 years and above'
      ],
      eligibilityHindi: [
        'BPL परिवारों की गर्भवती महिलाएं',
        'कम प्रदर्शन वाले राज्यों में सभी गर्भवती महिलाएं',
        '19 वर्ष और उससे अधिक आयु'
      ],
      benefits: [
        'Cash assistance for institutional delivery',
        'Free delivery care',
        'Post-delivery care'
      ],
      benefitsHindi: [
        'संस्थागत प्रसव के लिए नकद सहायता',
        'मुफ्त प्रसव देखभाल',
        'प्रसव के बाद देखभाल'
      ],
      applicationProcess: [
        'Register at nearest ANM/ASHA',
        'Complete antenatal checkups',
        'Deliver at registered institution',
        'Receive cash incentive'
      ],
      applicationProcessHindi: [
        'निकटतम ANM/ASHA में पंजीकरण',
        'प्रसवपूर्व जांच पूरी करें',
        'पंजीकृत संस्थान में प्रसव',
        'नकद प्रोत्साहन प्राप्त करें'
      ],
      documents: [
        'BPL Card',
        'Aadhaar Card',
        'Bank Account Details',
        'Medical Records'
      ],
      documentsHindi: [
        'BPL कार्ड',
        'आधार कार्ड',
        'बैंक खाता विवरण',
        'चिकित्सा रिकॉर्ड'
      ],
      website: 'https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=841&lid=309',
      helpline: '104',
      category: 'women',
      coverage: 'Cash incentive up to ₹1,400',
      coverageHindi: '₹1,400 तक नकद प्रोत्साहन'
    }
  ];

  const insuranceProviders: InsuranceProvider[] = [
    {
      id: '1',
      name: 'HDFC ERGO Health Insurance',
      logo: '🏦',
      rating: 4.5,
      claimSettlementRatio: 92.8,
      networkHospitals: 13000,
      customerSupport: '1800-266-9966',
      website: 'https://www.hdfcergo.com',
      specialties: ['Family Coverage', 'Long-term Plans', 'High Claim Settlement']
    },
    {
      id: '2',
      name: 'ICICI Lombard Health Insurance',
      logo: '🏛️',
      rating: 4.3,
      claimSettlementRatio: 88.5,
      networkHospitals: 6500,
      customerSupport: '1800-266-7766',
      website: 'https://www.icicilombard.com',
      specialties: ['Lifelong Renewability', 'Cashless Hospitals', 'Brand Trust']
    },
    {
      id: '3',
      name: 'Star Health Insurance',
      logo: '⭐',
      rating: 4.2,
      claimSettlementRatio: 85.4,
      networkHospitals: 14000,
      customerSupport: '1800-102-4477',
      website: 'https://www.starhealth.in',
      specialties: ['Largest Network', 'Health-only Insurer', 'Specialized Plans']
    },
    {
      id: '4',
      name: 'Niva Bupa Health Insurance',
      logo: '💙',
      rating: 4.4,
      claimSettlementRatio: 90.2,
      networkHospitals: 10000,
      customerSupport: '1800-103-2255',
      website: 'https://www.nivabupa.com',
      specialties: ['Fast Claims', 'High Coverage', 'Premium Plans']
    },
    {
      id: '5',
      name: 'Care Health Insurance',
      logo: '❤️',
      rating: 4.6,
      claimSettlementRatio: 98.5,
      networkHospitals: 9500,
      customerSupport: '1800-102-4488',
      website: 'https://www.careinsurance.com',
      specialties: ['High Settlement', 'Family Plans', 'Senior Citizens']
    },
    {
      id: '6',
      name: 'Tata AIG Health Insurance',
      logo: '🏢',
      rating: 4.3,
      claimSettlementRatio: 87.9,
      networkHospitals: 8200,
      customerSupport: '1800-266-7780',
      website: 'https://www.tataaig.com',
      specialties: ['Tata Group', 'Critical Illness', 'Reliable Coverage']
    },
    {
      id: '7',
      name: 'Aditya Birla Health Insurance',
      logo: '🌟',
      rating: 4.1,
      claimSettlementRatio: 86.3,
      networkHospitals: 7800,
      customerSupport: '1800-270-7000',
      website: 'https://www.adityabirlacapital.com',
      specialties: ['Wellness Programs', 'Health Coaching', 'Lifestyle Plans']
    },
    {
      id: '8',
      name: 'SBI Health Insurance',
      logo: '🏛️',
      rating: 4.0,
      claimSettlementRatio: 84.7,
      networkHospitals: 7500,
      customerSupport: '1800-22-1111',
      website: 'https://www.sbigeneral.in',
      specialties: ['Government Backed', 'Affordable Plans', 'Trusted Brand']
    },
    {
      id: '9',
      name: 'Digit Health Insurance',
      logo: '📱',
      rating: 4.2,
      claimSettlementRatio: 89.1,
      networkHospitals: 6800,
      customerSupport: '1800-258-4242',
      website: 'https://www.godigit.com',
      specialties: ['Simple Claims', 'Young Users', 'Digital First']
    },
    {
      id: '10',
      name: 'Reliance Health Insurance',
      logo: '🔷',
      rating: 4.1,
      claimSettlementRatio: 86.8,
      networkHospitals: 8900,
      customerSupport: '1800-300-1111',
      website: 'https://www.reliancegeneral.co.in',
      specialties: ['Cashless Treatment', 'Large Coverage', 'Corporate Plans']
    }
  ];

  const coverageCategories: CoverageCategory[] = [
    {
      name: 'Hospitalization',
      covered: 475000,
      total: 500000,
      icon: Building,
      color: 'text-blue-600',
      details: ['Room rent', 'ICU charges', 'Surgery costs', 'Doctor fees']
    },
    {
      name: 'Critical Illness',
      covered: 200000,
      total: 300000,
      icon: Heart,
      color: 'text-red-600',
      details: ['Cancer', 'Heart attack', 'Stroke', 'Kidney failure']
    },
    {
      name: 'Maternity',
      covered: 50000,
      total: 100000,
      icon: Baby,
      color: 'text-pink-600',
      details: ['Normal delivery', 'C-section', 'Pre-natal care', 'Post-natal care']
    },
    {
      name: 'Dental & Vision',
      covered: 15000,
      total: 25000,
      icon: Eye,
      color: 'text-green-600',
      details: ['Dental procedures', 'Eye surgery', 'Spectacles', 'Contact lenses']
    },
    {
      name: 'Pharmacy',
      covered: 8000,
      total: 15000,
      icon: Pill,
      color: 'text-purple-600',
      details: ['Prescription drugs', 'Generic medicines', 'Chronic medications']
    },
    {
      name: 'Preventive Care',
      covered: 5000,
      total: 10000,
      icon: Activity,
      color: 'text-orange-600',
      details: ['Health check-ups', 'Vaccinations', 'Screenings', 'Wellness programs']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'approved': case 'settled': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': case 'rejected': case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'approved': case 'settled': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': case 'processing': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'expired': case 'rejected': case 'cancelled': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const totalCoverage = policies.reduce((sum, policy) => sum + policy.coverage, 0);
  const totalPremium = policies.reduce((sum, policy) => sum + policy.premium, 0);
  const totalClaimsUsed = policies.reduce((sum, policy) => sum + policy.claimsUsed, 0);
  const activePolicies = policies.filter(p => p.status === 'active').length;

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || claim.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleFileUpload = (claimId: string) => {
    toast.success('Document upload functionality will be implemented');
  };

  const handleNewClaim = () => {
    toast.success('New claim form will be opened');
  };

  const handlePreAuth = () => {
    toast.success('Pre-authorization request form will be opened');
  };

  const handlePolicyRenewal = (policyId: string) => {
    toast.success('Policy renewal process will be initiated');
  };

  const handleContactAgent = (agentPhone: string) => {
    toast.success(`Calling agent at ${agentPhone}`);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: chatInput,
      timestamp: new Date(),
      language: chatLanguage
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    try {
      // Call Gemini API for government scheme information
      const response = await fetch('/api/ai-health/government-scheme-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          language: chatLanguage,
          schemes: governmentSchemes
        }),
      });

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: data.response || 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
        language: chatLanguage
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: chatLanguage === 'hi' 
          ? 'क्षमा करें, मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।'
          : 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
        language: chatLanguage
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const getSchemesByCategory = (category: string) => {
    return governmentSchemes.filter(scheme => scheme.category === category);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Insurance Hub</h1>
            <p className="text-sm text-muted-foreground">Comprehensive health insurance management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreAuth}>
            <FileText className="w-4 h-4 mr-2" />
            Pre-Auth
          </Button>
          <Button onClick={handleNewClaim}>
            <Plus className="w-4 h-4 mr-2" />
            New Claim
          </Button>
        </div>
      </div>

      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Coverage</p>
                <p className="text-2xl font-bold">₹{(totalCoverage / 100000).toFixed(1)}L</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Active policies: {activePolicies}
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Annual Premium</p>
                <p className="text-2xl font-bold">₹{(totalPremium / 1000).toFixed(0)}K</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Monthly: ₹{Math.round(totalPremium / 12).toLocaleString()}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Claims Used</p>
                <p className="text-2xl font-bold">₹{(totalClaimsUsed / 1000).toFixed(0)}K</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Activity className="w-3 h-3 mr-1" />
                  {((totalClaimsUsed / totalCoverage) * 100).toFixed(1)}% utilized
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Network Hospitals</p>
                <p className="text-2xl font-bold">{(policies.reduce((sum, p) => sum + p.networkHospitals, 0) / 1000).toFixed(0)}K+</p>
                <p className="text-xs text-indigo-600 flex items-center mt-1">
                  <Building className="w-3 h-3 mr-1" />
                  Cashless treatment
                </p>
              </div>
              <Building className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="policies" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="policies">🛡️ Policies</TabsTrigger>
          <TabsTrigger value="claims">📋 Claims</TabsTrigger>
          <TabsTrigger value="coverage">📊 Coverage</TabsTrigger>
          <TabsTrigger value="preauth">⚡ Pre-Auth</TabsTrigger>
          <TabsTrigger value="providers">🏥 Providers</TabsTrigger>
        </TabsList>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Your Insurance Policies</h3>
              <p className="text-sm text-gray-600">Manage your active and expired policies</p>
            </div>
            <Button onClick={() => window.open('#providers', '_self')}>
              <Plus className="w-4 h-4 mr-2" />
              Buy New Policy
            </Button>
          </div>

          <div className="grid gap-4">
            {policies.map((policy, index) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-lg">{policy.provider}</h3>
                          <p className="text-sm text-gray-600">{policy.policyNumber}</p>
                          <p className="text-xs text-gray-500">Agent: {policy.agentName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(policy.status)}>
                          {policy.status.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Expires: {new Date(policy.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Coverage</p>
                        <p className="text-lg font-bold">₹{(policy.coverage / 100000).toFixed(1)}L</p>
                        <p className="text-xs text-gray-500">
                          Used: ₹{(policy.claimsUsed / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Annual Premium</p>
                        <p className="text-lg font-bold">₹{(policy.premium / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-gray-500">
                          Monthly: ₹{Math.round(policy.premium / 12).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Type & Members</p>
                        <p className="text-sm font-medium">{policy.type}</p>
                        <p className="text-xs text-gray-500">
                          {policy.familyMembers} member{policy.familyMembers !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Deductible & Co-pay</p>
                        <p className="text-sm font-medium">₹{(policy.deductible / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-gray-500">{policy.coPayment}% co-payment</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Coverage Utilization</span>
                        <span className="text-sm text-gray-600">
                          {((policy.claimsUsed / policy.coverage) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(policy.claimsUsed / policy.coverage) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4" />
                        <span>{policy.networkHospitals.toLocaleString()} network hospitals</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedPolicy(policy)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleContactAgent(policy.agentPhone)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Contact Agent
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleNewClaim}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          File Claim
                        </Button>
                        {policy.status === 'active' && (
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handlePolicyRenewal(policy.id)}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Renew
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search claims..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="settled">Settled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleNewClaim}>
              <Plus className="w-4 h-4 mr-2" />
              New Claim
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredClaims.map((claim, index) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(claim.status)}
                        <div>
                          <h3 className="font-semibold text-lg">{claim.claimNumber}</h3>
                          <p className="text-sm text-gray-600">{claim.hospital}</p>
                          <p className="text-xs text-gray-500">Dr. {claim.doctorName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(claim.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Claim Amount</p>
                        <p className="text-xl font-bold">₹{claim.amount.toLocaleString()}</p>
                        {claim.approvedAmount && (
                          <p className="text-sm text-green-600">
                            Approved: ₹{claim.approvedAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Treatment Type</p>
                        <p className="text-sm font-medium">{claim.treatmentType}</p>
                        {claim.admissionDate && (
                          <p className="text-xs text-gray-500">
                            {new Date(claim.admissionDate).toLocaleDateString()} - 
                            {claim.dischargeDate ? new Date(claim.dischargeDate).toLocaleDateString() : 'Ongoing'}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Documents</p>
                        <p className="text-sm">{claim.documents.length} files</p>
                        {claim.estimatedSettlement && (
                          <p className="text-xs text-blue-600">
                            Est. Settlement: {new Date(claim.estimatedSettlement).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Description</p>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">{claim.description}</p>
                      {claim.rejectionReason && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            Rejection Reason: {claim.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {claim.documents.map((doc, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {doc}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedClaim(claim)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleFileUpload(claim.id)}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload Docs
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            const claimData = {
                              claimNumber: claim.claimNumber,
                              hospital: claim.hospital,
                              amount: claim.amount,
                              status: claim.status,
                              date: claim.date,
                              description: claim.description
                            };
                            const blob = new Blob([JSON.stringify(claimData, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `claim-${claim.claimNumber}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success('Claim details exported successfully');
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Coverage Tab */}
        <TabsContent value="coverage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Coverage Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {coverageCategories.map((category, index) => {
                    const percentage = (category.covered / category.total) * 100;
                    const IconComponent = category.icon;
                    return (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className={`w-4 h-4 ${category.color}`} />
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            ₹{(category.covered / 1000).toFixed(0)}K / ₹{(category.total / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-xs text-gray-500">
                          {category.details.join(' • ')}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Coverage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {((totalCoverage - totalClaimsUsed) / 100000).toFixed(1)}L
                      </p>
                      <p className="text-sm text-gray-600">Available Coverage</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {(((totalCoverage - totalClaimsUsed) / totalCoverage) * 100).toFixed(0)}%
                      </p>
                      <p className="text-sm text-gray-600">Coverage Remaining</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Network Hospitals</span>
                      <span className="font-semibold">{policies.reduce((sum, p) => sum + p.networkHospitals, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Average Deductible</span>
                      <span className="font-semibold">₹{Math.round(policies.reduce((sum, p) => sum + p.deductible, 0) / policies.length).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Average Co-payment</span>
                      <span className="font-semibold">{Math.round(policies.reduce((sum, p) => sum + p.coPayment, 0) / policies.length)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Pre-Authorization Tab */}
        <TabsContent value="preauth" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Pre-Authorization Requests</h3>
              <p className="text-sm text-gray-600">Manage your treatment pre-approvals</p>
            </div>
            <Button onClick={handlePreAuth}>
              <Plus className="w-4 h-4 mr-2" />
              New Pre-Auth Request
            </Button>
          </div>

          <div className="grid gap-4">
            {preAuthRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Zap className="w-8 h-8 text-orange-600" />
                        <div>
                          <h3 className="font-semibold text-lg">{request.hospitalName}</h3>
                          <p className="text-sm text-gray-600">{request.treatmentType}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Estimated Cost</p>
                        <p className="text-xl font-bold">₹{request.estimatedCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Request Date</p>
                        <p className="text-sm font-medium">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Valid Until</p>
                        <p className="text-sm font-medium">
                          {request.validUntil ? new Date(request.validUntil).toLocaleDateString() : 'Pending'}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      {request.status === 'pending' && (
                        <Button size="sm" variant="outline">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Check Status
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Providers Tab - Insurance Marketplace */}
        <TabsContent value="providers" className="space-y-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Insurance Marketplace</h3>
            <p className="text-sm text-gray-600">Compare and purchase health insurance from top providers in India</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600">{insuranceProviders.length}</div>
              <div className="text-sm text-gray-600">Insurance Providers</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(insuranceProviders.reduce((sum, p) => sum + p.claimSettlementRatio, 0) / insuranceProviders.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg Settlement Ratio</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(insuranceProviders.reduce((sum, p) => sum + p.networkHospitals, 0) / 1000)}K+
              </div>
              <div className="text-sm text-gray-600">Total Network Hospitals</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-orange-600">
                {insuranceProviders.filter(p => p.claimSettlementRatio > 90).length}
              </div>
              <div className="text-sm text-gray-600">High Settlement Providers</div>
            </Card>
          </div>

          <div className="grid gap-4">
            {insuranceProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{provider.logo}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{provider.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(provider.rating) 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-1">
                                {provider.rating}/5
                              </span>
                            </div>
                            {provider.claimSettlementRatio > 90 && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                High Settlement
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Button
                          onClick={() => window.open(provider.website, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Buy Now
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xl font-bold text-green-600">
                          {provider.claimSettlementRatio}%
                        </p>
                        <p className="text-xs text-gray-600">Claim Settlement</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-xl font-bold text-blue-600">
                          {(provider.networkHospitals / 1000).toFixed(0)}K+
                        </p>
                        <p className="text-xs text-gray-600">Network Hospitals</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm font-bold text-purple-600">
                          {provider.customerSupport}
                        </p>
                        <p className="text-xs text-gray-600">Customer Support</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm font-bold text-orange-600">
                          {provider.specialties.length} Features
                        </p>
                        <p className="text-xs text-gray-600">Key Benefits</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2 font-medium">Key Features & Benefits:</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleContactAgent(provider.customerSupport)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call Now
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(provider.website, '_blank')}
                        >
                          <Info className="w-4 h-4 mr-1" />
                          Learn More
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => {
                            toast.success(`Getting quote from ${provider.name}...`);
                            setTimeout(() => {
                              window.open(provider.website, '_blank');
                            }, 1000);
                          }}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Get Quote
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            toast.success(`Redirecting to ${provider.name} purchase page...`);
                            setTimeout(() => {
                              window.open(provider.website, '_blank');
                            }, 1000);
                          }}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Buy Policy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Insurance Comparison Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Quick Comparison Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-2">Best for Families</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    HDFC ERGO, Care Health, Star Health
                  </p>
                  <p className="text-xs text-gray-500">
                    High coverage, family floater plans, good network
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-2">Highest Settlement</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Care Health (98.5%), HDFC ERGO (92.8%)
                  </p>
                  <p className="text-xs text-gray-500">
                    Best claim approval rates and fast processing
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Building className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-2">Largest Network</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Star Health (14K+), HDFC ERGO (13K+)
                  </p>
                  <p className="text-xs text-gray-500">
                    Maximum cashless hospital options
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Policy Details Modal */}
      <AnimatePresence>
        {selectedPolicy && (
          <Dialog open={!!selectedPolicy} onOpenChange={() => setSelectedPolicy(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  {selectedPolicy.provider} - Policy Details
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-scroll pr-2 dialog-scroll force-scroll" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Policy Number</p>
                    <p className="font-semibold">{selectedPolicy.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Coverage Amount</p>
                    <p className="font-semibold">₹{(selectedPolicy.coverage / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Annual Premium</p>
                    <p className="font-semibold">₹{selectedPolicy.premium.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deductible</p>
                    <p className="font-semibold">₹{selectedPolicy.deductible.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Co-payment</p>
                    <p className="font-semibold">{selectedPolicy.coPayment}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Network Hospitals</p>
                    <p className="font-semibold">{selectedPolicy.networkHospitals.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Benefits Covered
                    </h4>
                    <ul className="space-y-2">
                      {selectedPolicy.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Exclusions
                    </h4>
                    <ul className="space-y-2">
                      {selectedPolicy.exclusions.map((exclusion, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          {exclusion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Agent Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Agent Name</p>
                      <p className="font-semibold">{selectedPolicy.agentName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Number</p>
                      <p className="font-semibold">{selectedPolicy.agentPhone}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => handleContactAgent(selectedPolicy.agentPhone)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Agent
                  </Button>
                  <Button onClick={() => handlePolicyRenewal(selectedPolicy.id)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Renew Policy
                  </Button>
                </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Claim Details Modal */}
      <AnimatePresence>
        {selectedClaim && (
          <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Claim Details - {selectedClaim.claimNumber}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-scroll pr-2 dialog-scroll force-scroll" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Hospital</p>
                    <p className="font-semibold">{selectedClaim.hospital}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Doctor</p>
                    <p className="font-semibold">Dr. {selectedClaim.doctorName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Treatment Type</p>
                    <p className="font-semibold">{selectedClaim.treatmentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Claim Amount</p>
                    <p className="font-semibold">₹{selectedClaim.amount.toLocaleString()}</p>
                  </div>
                  {selectedClaim.approvedAmount && (
                    <div>
                      <p className="text-sm text-gray-600">Approved Amount</p>
                      <p className="font-semibold text-green-600">₹{selectedClaim.approvedAmount.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className={getStatusColor(selectedClaim.status)}>
                      {selectedClaim.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {(selectedClaim.admissionDate || selectedClaim.dischargeDate) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedClaim.admissionDate && (
                      <div>
                        <p className="text-sm text-gray-600">Admission Date</p>
                        <p className="font-semibold">{new Date(selectedClaim.admissionDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedClaim.dischargeDate && (
                      <div>
                        <p className="text-sm text-gray-600">Discharge Date</p>
                        <p className="font-semibold">{new Date(selectedClaim.dischargeDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="bg-gray-50 p-4 rounded-lg">{selectedClaim.description}</p>
                </div>

                {selectedClaim.rejectionReason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      <strong>Rejection Reason:</strong> {selectedClaim.rejectionReason}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-3">Documents ({selectedClaim.documents.length})</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedClaim.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 border rounded-lg">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm truncate">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => handleFileUpload(selectedClaim.id)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Documents
                  </Button>
                  <Button 
                    onClick={() => {
                      const claimData = {
                        claimNumber: selectedClaim.claimNumber,
                        hospital: selectedClaim.hospital,
                        amount: selectedClaim.amount,
                        status: selectedClaim.status,
                        date: selectedClaim.date,
                        description: selectedClaim.description,
                        documents: selectedClaim.documents
                      };
                      const blob = new Blob([JSON.stringify(claimData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `claim-${selectedClaim.claimNumber}-details.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success('Claim details exported successfully');
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Details
                  </Button>
                </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}