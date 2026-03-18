import { useState, useEffect, useRef } from "react"
import { Search, Filter, Send, Phone, ExternalLink, RefreshCw, CheckCircle, FileText, MapPin, Activity, Building, MessageCircle, Grid3X3, CreditCard, Plus, Trash2, Shield, Star, Gift } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { mockSchemes, type GovernmentScheme } from "@/data/userData"
import SchemeCard from "@/components/user/SchemeCard"
import SchemeDrawer from "@/components/user/SchemeDrawer"
import SchemeFilterPanel from "@/components/user/SchemeFilterPanel"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface GovernmentSchemeData {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  descriptionHindi: string;
  eligibility: string[];
  eligibilityHindi: string[];
  benefits: string[];
  benefitsHindi: string[];
  applicationProcess: string[];
  applicationProcessHindi: string[];
  documents: string[];
  documentsHindi: string[];
  website: string;
  helpline: string;
  category: 'universal' | 'senior' | 'women' | 'children' | 'disability' | 'rural';
  coverage: string;
  coverageHindi: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  language: 'en' | 'hi';
}

interface UserCard {
  id: string;
  cardType: string;
  cardNumber: string;
  provider: string;
  holderName: string;
  isActive: boolean;
  isVerified: boolean;
  benefits: CardBenefit[];
}

interface CardBenefit {
  id: string;
  benefitType: string;
  serviceType: string;
  benefitValue: string;
  maxLimit: string;
  displayText: string;
  priorityLevel: number;
}

export default function GovSchemes() {
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLanguage, setChatLanguage] = useState<'en' | 'hi'>('en')
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState('schemes')
  const [userCards, setUserCards] = useState<UserCard[]>([])
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const [newCard, setNewCard] = useState({
    cardType: '',
    cardNumber: '',
    provider: '',
    holderName: '',
    expiryDate: ''
  })
  const [availableCardTypes, setAvailableCardTypes] = useState<{[key: string]: string}>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  useEffect(() => {
    fetchUserCards()
    fetchAvailableCardTypes()
  }, [])

  const fetchUserCards = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/user-cards/1') // Mock user ID
      const data = await response.json()
      if (data.success) {
        setUserCards(data.cards)
      }
    } catch (error) {
      console.error('Error fetching user cards:', error)
    }
  }

  const fetchAvailableCardTypes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/user-cards/card-types')
      const data = await response.json()
      if (data.success) {
        setAvailableCardTypes(data.cardTypes)
      }
    } catch (error) {
      console.error('Error fetching card types:', error)
    }
  }

  const handleAddCard = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/user-cards/1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCard),
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success('Card added successfully!')
        setIsAddCardOpen(false)
        setNewCard({
          cardType: '',
          cardNumber: '',
          provider: '',
          holderName: '',
          expiryDate: ''
        })
        fetchUserCards()
      } else {
        toast.error(data.message || 'Failed to add card')
      }
    } catch (error) {
      toast.error('Error adding card')
    }
  }

  const handleRemoveCard = async (cardId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/user-cards/1/${cardId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success('Card removed successfully!')
        fetchUserCards()
      } else {
        toast.error(data.message || 'Failed to remove card')
      }
    } catch (error) {
      toast.error('Error removing card')
    }
  }

  const governmentSchemesData: GovernmentSchemeData[] = [
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
  ]

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: chatInput,
      timestamp: new Date(),
      language: chatLanguage
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsTyping(true)

    try {
      // Use the enhanced AI + Rule Engine service
      const response = await fetch('http://localhost:8080/api/ai-health/enhanced-scheme-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          language: chatLanguage
        }),
      })

      const data = await response.json()
      
      let botMessageText = data.response || 'I apologize, but I encountered an error. Please try again.'
      
      // Add scheme details if available
      if (data.eligibleSchemes && data.eligibleSchemes.length > 0) {
        botMessageText += '\n\n📋 **Eligible Schemes Summary:**\n'
        data.eligibleSchemes.forEach((scheme: any, index: number) => {
          botMessageText += `\n${index + 1}. **${scheme.schemeName}**\n`
          botMessageText += `   ${scheme.eligibilityStatus} - ${scheme.coverage}\n`
          botMessageText += `   Score: ${scheme.eligibilityScore}%\n`
        })
      }
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: botMessageText,
        timestamp: new Date(),
        language: chatLanguage
      }

      setChatMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: chatLanguage === 'hi' 
          ? 'क्षमा करें, मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।'
          : 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
        language: chatLanguage
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const clearChat = () => {
    setChatMessages([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Government Health Schemes</h2>
          <p className="text-sm text-muted-foreground mt-1">Discover schemes and get AI assistance</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schemes" className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Popular Schemes
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            My Cards ({userCards.length})
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        {/* Popular Schemes Tab */}
        <TabsContent value="schemes" className="space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto dialog-scroll">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input className="h-10 w-full sm:w-64 rounded-lg border border-border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#064E3B]/50 transition-all shadow-sm" placeholder="Search schemes..." />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="h-10 px-4 rounded-lg bg-card border border-border text-sm font-semibold flex items-center justify-center gap-2 hover:bg-accent transition-colors shadow-sm text-foreground shrink-0"
            >
              <Filter className="size-4" /> Filter <span className="bg-[#064E3B]/10 text-[#064E3B] px-1.5 py-0.5 rounded-md text-[10px] ml-1">2 Active</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSchemes.map((scheme, index) => (
              <SchemeCard 
                key={scheme.id} 
                scheme={scheme} 
                index={index} 
                onClick={setSelectedScheme} 
              />
            ))}
          </div>

          {/* Government Schemes Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {governmentSchemesData.map((scheme, index) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {chatLanguage === 'hi' ? scheme.nameHindi : scheme.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {chatLanguage === 'hi' ? scheme.descriptionHindi : scheme.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {chatLanguage === 'hi' ? scheme.coverageHindi : scheme.coverage}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        <span>{scheme.helpline}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(scheme.website, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {chatLanguage === 'hi' ? 'आवेदन करें' : 'Apply'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* My Cards Tab */}
        <TabsContent value="cards" className="space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto dialog-scroll">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Your Health Cards & Benefits</h3>
              <p className="text-sm text-muted-foreground">Manage your cards and view available benefits</p>
            </div>
            <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Card
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Card</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardType">Card Type</Label>
                    <Select value={newCard.cardType} onValueChange={(value) => setNewCard({...newCard, cardType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select card type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(availableCardTypes).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={newCard.cardNumber}
                      onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
                      placeholder="Enter card number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="holderName">Card Holder Name</Label>
                    <Input
                      id="holderName"
                      value={newCard.holderName}
                      onChange={(e) => setNewCard({...newCard, holderName: e.target.value})}
                      placeholder="Enter holder name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider">Provider (Optional)</Label>
                    <Input
                      id="provider"
                      value={newCard.provider}
                      onChange={(e) => setNewCard({...newCard, provider: e.target.value})}
                      placeholder="e.g., HDFC, Government of India"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                    <Input
                      id="expiryDate"
                      value={newCard.expiryDate}
                      onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
                      placeholder="MM/YY"
                    />
                  </div>
                  <Button onClick={handleAddCard} className="w-full">
                    Add Card
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {availableCardTypes[card.cardType] || card.cardType}
                          </h4>
                          <p className="text-xs text-gray-500">{card.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {card.isVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCard(card.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Card Number</p>
                        <p className="font-mono text-sm">{card.cardNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Holder Name</p>
                        <p className="text-sm">{card.holderName}</p>
                      </div>
                      
                      {/* Benefits Preview */}
                      {card.benefits && card.benefits.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Available Benefits</p>
                          <div className="space-y-1">
                            {card.benefits.slice(0, 3).map((benefit, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                <Gift className="w-3 h-3 text-green-500" />
                                <span className="text-gray-700">{benefit.displayText}</span>
                                {benefit.priorityLevel > 0 && (
                                  <Star className="w-3 h-3 text-yellow-500" />
                                )}
                              </div>
                            ))}
                            {card.benefits.length > 3 && (
                              <p className="text-xs text-blue-600">+{card.benefits.length - 3} more benefits</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {userCards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Cards Added Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Add your health insurance cards, government scheme cards, and other benefit cards to unlock automatic discounts and priority services.
              </p>
              <Button onClick={() => setIsAddCardOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Card
              </Button>
            </div>
          )}

          {/* Benefits Summary */}
          {userCards.length > 0 && (
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Gift className="w-5 h-5" />
                  Your Active Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{userCards.length}</div>
                    <div className="text-sm text-gray-600">Active Cards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {userCards.reduce((total, card) => total + (card.benefits?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Benefits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {userCards.filter(card => card.isVerified).length}
                    </div>
                    <div className="text-sm text-gray-600">Verified Cards</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Chatbot Tab - ChatGPT-like Interface */}
        <TabsContent value="chatbot" className="space-y-0 h-[calc(100vh-180px)]">
          <div className="h-full flex flex-col">
            {/* Chatbot Header */}
            <div className="flex-shrink-0 bg-white border-b">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {chatLanguage === 'hi' ? 'सरकारी योजना सहायक' : 'Government Scheme Assistant'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {chatLanguage === 'hi' 
                          ? 'आपकी सरकारी स्वास्थ्य योजनाओं की सहायता के लिए यहाँ हूँ'
                          : 'Here to help you with government health schemes'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={chatLanguage} onValueChange={(value: 'en' | 'hi') => setChatLanguage(value)}>
                      <SelectTrigger className="w-20 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇬🇧 EN</SelectItem>
                        <SelectItem value="hi">🇮🇳 हिं</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={clearChat}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center min-h-full text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {chatLanguage === 'hi' 
                        ? 'सरकारी स्वास्थ्य योजनाओं के बारे में पूछें!'
                        : 'Ask about Government Health Schemes!'
                      }
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md">
                      {chatLanguage === 'hi' 
                        ? 'मैं आपको सरकारी स्वास्थ्य योजनाओं के बारे में जानकारी देने और आवेदन प्रक्रिया में मदद करने के लिए यहाँ हूँ।'
                        : 'I\'m here to help you learn about government health schemes and guide you through the application process.'
                      }
                    </p>
                    
                    {/* Quick Start Questions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                      <button 
                        className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                        onClick={() => setChatInput(chatLanguage === 'hi' 
                          ? 'आयुष्मान भारत के लिए आवेदन कैसे करें?'
                          : 'How to apply for Ayushman Bharat?'
                        )}
                      >
                        <div className="font-medium text-blue-800 mb-1">
                          {chatLanguage === 'hi' ? 'आवेदन प्रक्रिया' : 'Application Process'}
                        </div>
                        <div className="text-sm text-blue-600">
                          {chatLanguage === 'hi' 
                            ? 'आयुष्मान भारत के लिए आवेदन कैसे करें?'
                            : 'How to apply for Ayushman Bharat?'
                          }
                        </div>
                      </button>
                      
                      <button 
                        className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                        onClick={() => setChatInput(chatLanguage === 'hi' 
                          ? 'JSY योजना के लिए कौन से दस्तावेज चाहिए?'
                          : 'What documents are needed for JSY scheme?'
                        )}
                      >
                        <div className="font-medium text-green-800 mb-1">
                          {chatLanguage === 'hi' ? 'आवश्यक दस्तावेज' : 'Required Documents'}
                        </div>
                        <div className="text-sm text-green-600">
                          {chatLanguage === 'hi' 
                            ? 'JSY योजना के लिए कौन से दस्तावेज चाहिए?'
                            : 'What documents are needed for JSY scheme?'
                          }
                        </div>
                      </button>
                      
                      <button 
                        className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                        onClick={() => setChatInput(chatLanguage === 'hi' 
                          ? 'मैं किस योजना के लिए पात्र हूं?'
                          : 'Which schemes am I eligible for?'
                        )}
                      >
                        <div className="font-medium text-purple-800 mb-1">
                          {chatLanguage === 'hi' ? 'पात्रता जांच' : 'Eligibility Check'}
                        </div>
                        <div className="text-sm text-purple-600">
                          {chatLanguage === 'hi' 
                            ? 'मैं किस योजना के लिए पात्र हूं?'
                            : 'Which schemes am I eligible for?'
                          }
                        </div>
                      </button>
                      
                      <button 
                        className="p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
                        onClick={() => setChatInput(chatLanguage === 'hi' 
                          ? 'निकटतम आवेदन केंद्र कहां है?'
                          : 'Where is the nearest application center?'
                        )}
                      >
                        <div className="font-medium text-orange-800 mb-1">
                          {chatLanguage === 'hi' ? 'आवेदन केंद्र' : 'Application Center'}
                        </div>
                        <div className="text-sm text-orange-600">
                          {chatLanguage === 'hi' 
                            ? 'निकटतम आवेदन केंद्र कहां है?'
                            : 'Where is the nearest application center?'
                          }
                        </div>
                      </button>
                    </div>
                  </div>
                )}
                
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gradient-to-br from-blue-500 to-green-500 text-white'
                      }`}>
                        {message.type === 'user' ? '👤' : '🤖'}
                      </div>
                      <div
                        className={`p-4 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message}</p>
                        <p className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white">
                        🤖
                      </div>
                      <div className="bg-white p-4 rounded-2xl rounded-bl-md shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="flex-shrink-0 border-t bg-white p-4">
                <div className="flex gap-3 items-end max-w-4xl mx-auto">
                  <div className="flex-1">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={chatLanguage === 'hi' 
                        ? 'सरकारी स्वास्थ्य योजनाओं के बारे में पूछें...'
                        : 'Ask about government health schemes...'
                      }
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      disabled={isTyping}
                      className="min-h-[48px] text-base"
                    />
                  </div>
                  <Button 
                    onClick={sendChatMessage} 
                    disabled={!chatInput.trim() || isTyping}
                    size="lg"
                    className="h-[48px] px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <SchemeDrawer 
        scheme={selectedScheme} 
        isOpen={!!selectedScheme} 
        onClose={() => setSelectedScheme(null)} 
      />
      
      <SchemeFilterPanel 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
      />
    </div>
  )
}
