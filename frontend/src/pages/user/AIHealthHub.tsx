import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Camera, Upload, Mic, MicOff, Sparkles, Activity, Stethoscope, AlertCircle, CheckCircle, Clock, FileText, X, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import aiHealthService, { type AIAnalysisResult, type SymptomAnalysisResult, type AnalysisHistoryItem } from '@/services/aiHealthService';
import vapiService, { type VAPISession, VAPIService } from '@/services/vapiService';

interface UnifiedAnalysisResult {
  id?: string;
  userId?: number;
  condition: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendations: string[];
  analyzedAt: string;
  type?: 'image' | 'symptom' | 'voice';
}

interface AnalysisHistory {
  id: string;
  type: 'image' | 'symptom' | 'voice';
  result: UnifiedAnalysisResult;
  imageUrl?: string;
  symptoms?: string;
}

export default function AIHealthHub() {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<UnifiedAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('chest');
  const [selectedModel, setSelectedModel] = useState<string>('base');
  const [symptoms, setSymptoms] = useState('');
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [voiceSession, setVoiceSession] = useState<VAPISession | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Load analysis history on component mount
  useEffect(() => {
    loadAnalysisHistory();
    
    // Set up voice session update callback
    vapiService.setOnSessionUpdateCallback((updatedSession) => {
      setVoiceSession(updatedSession);
    });

    // Also set up polling to check for voice session results
    const pollForResults = setInterval(() => {
      if (!isRecording && vapiService.hasSessionResults()) {
        const sessionWithResults = vapiService.getCurrentSessionWithResults();
        if (sessionWithResults && sessionWithResults !== voiceSession) {
          setVoiceSession(sessionWithResults);
        }
      }
    }, 1000); // Check every second

    return () => {
      clearInterval(pollForResults);
    };
  }, [isRecording, voiceSession]);

  const loadAnalysisHistory = async () => {
    try {
      const userId = aiHealthService.getCurrentUserId();
      const history = await aiHealthService.getAnalysisHistory(userId);
      
      // Convert to unified format
      const formattedHistory: AnalysisHistory[] = history.map(item => ({
        id: item.id || Date.now().toString(),
        type: 'image', // Default to image for now
        result: {
          id: item.id,
          userId: item.userId,
          condition: item.condition,
          confidence: item.confidence,
          severity: item.severity as any,
          description: item.description,
          recommendations: item.recommendations || [],
          analyzedAt: item.analyzedAt,
          type: 'image'
        },
        imageUrl: item.imageUrl
      }));
      
      setAnalysisHistory(formattedHistory);
    } catch (error) {
      console.error('Failed to load analysis history:', error);
      toast.error('Failed to load analysis history');
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const userId = aiHealthService.getCurrentUserId();
      const result = await aiHealthService.analyzeImage(
        selectedImage,
        userId,
        selectedSpecialty,
        selectedModel
      );
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      // Convert to unified format
      const unifiedResult: UnifiedAnalysisResult = {
        id: result.id,
        userId: result.userId,
        condition: result.condition,
        confidence: result.confidence,
        severity: result.severity,
        description: result.description,
        recommendations: result.recommendations,
        analyzedAt: result.analyzedAt,
        type: 'image'
      };
      
      setAnalysisResult(unifiedResult);
      
      // Add to history
      const historyEntry: AnalysisHistory = {
        id: unifiedResult.id || Date.now().toString(),
        type: 'image',
        result: unifiedResult,
        imageUrl: imagePreview || undefined
      };
      setAnalysisHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10
      
      toast.success('Image analysis completed successfully!');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  // Simulate MedViT API response (replace with real API call)
  const simulateMedViTAPI = async (formData: FormData): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const specialty = formData.get('specialty') as string;
        const confidence = Math.floor(Math.random() * 30) + 70; // 70-99%
        
        const responses = {
          chest: {
            prediction: confidence > 85 ? "Normal Chest X-ray" : "Possible Pneumonia",
            confidence,
            severity: confidence > 85 ? 'low' : 'medium',
            description: confidence > 85 
              ? "The chest X-ray shows normal lung fields with no significant abnormalities detected."
              : "The analysis indicates possible pneumonia with consolidation in the lower lobe.",
            recommendations: confidence > 85
              ? ["Continue regular health checkups", "Maintain healthy lifestyle", "Monitor for respiratory symptoms"]
              : ["Consult a pulmonologist immediately", "Consider antibiotic treatment", "Follow up with chest CT if symptoms persist"]
          },
          dermatology: {
            prediction: confidence > 80 ? "Benign Lesion" : "Suspicious Lesion - Requires Evaluation",
            confidence,
            severity: confidence > 80 ? 'low' : 'high',
            description: confidence > 80
              ? "The skin lesion appears benign with regular borders and uniform coloration."
              : "The lesion shows irregular features that require immediate dermatological evaluation.",
            recommendations: confidence > 80
              ? ["Monitor for changes", "Annual skin check recommended", "Use sun protection"]
              : ["See dermatologist within 48 hours", "Biopsy may be required", "Avoid sun exposure"]
          },
          ophthalmology: {
            prediction: confidence > 85 ? "Normal Retina" : "Diabetic Retinopathy Signs",
            confidence,
            severity: confidence > 85 ? 'low' : 'medium',
            description: confidence > 85
              ? "Retinal examination shows normal blood vessels and optic disc."
              : "Early signs of diabetic retinopathy detected with microaneurysms present.",
            recommendations: confidence > 85
              ? ["Annual eye exams", "Maintain healthy diet", "Regular exercise"]
              : ["Ophthalmologist consultation needed", "Blood sugar control essential", "More frequent eye monitoring"]
          }
        };
        
        resolve(responses[specialty as keyof typeof responses] || responses.chest);
      }, 2000 + Math.random() * 3000); // 2-5 seconds
    });
  };

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 15, 90));
      }, 150);
      
      const userId = aiHealthService.getCurrentUserId();
      const result = await aiHealthService.analyzeSymptoms({
        userId,
        symptoms: symptoms.trim()
      });
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      // Convert to unified format for display
      const unifiedResult: UnifiedAnalysisResult = {
        id: result.id,
        userId: result.userId,
        condition: result.possibleConditions[0] || 'Health Concern',
        confidence: 85, // Default confidence for symptoms
        severity: result.riskLevel as any,
        description: `Based on your symptoms: ${result.symptoms}`,
        recommendations: result.recommendations,
        analyzedAt: result.analyzedAt,
        type: 'symptom'
      };
      
      setAnalysisResult(unifiedResult);
      
      // Add to history
      const historyEntry: AnalysisHistory = {
        id: unifiedResult.id || Date.now().toString(),
        type: 'symptom',
        result: unifiedResult,
        symptoms
      };
      setAnalysisHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      
      toast.success('Symptom analysis completed successfully!');
      
    } catch (error) {
      console.error('Symptom analysis failed:', error);
      toast.error('Symptom analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'high': case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const toggleVoiceRecording = async () => {
    if (!VAPIService.isSupported()) {
      toast.error('Voice recording is not supported in your browser');
      return;
    }

    try {
      if (isRecording) {
        // Stop recording
        const session = await vapiService.stopVoiceSession();
        setIsRecording(false);
        setVoiceSession(session);
        setLiveTranscript('');
        
        // Note: The actual results will be updated via the callback when processing completes
      } else {
        // Start recording
        const sessionId = await vapiService.startVoiceSession();
        setIsRecording(true);
        setVoiceSession(null);
        setLiveTranscript('');
        
        // Start live transcription simulation
        vapiService.simulateTranscription((text) => {
          setLiveTranscript(text);
        });
      }
    } catch (error) {
      console.error('Voice recording error:', error);
      setIsRecording(false);
      toast.error('Failed to start voice recording');
    }
  };

  const viewAnalysisDetails = (entry: AnalysisHistory) => {
    // Create a detailed view modal or navigate to details page
    const details = {
      id: entry.id,
      type: entry.type,
      condition: entry.result.condition || 'Unknown Condition',
      confidence: entry.result.confidence || 0,
      severity: entry.result.severity || 'unknown',
      description: entry.result.description || 'No description available',
      recommendations: entry.result.recommendations || [],
      analyzedAt: entry.result.analyzedAt || new Date().toISOString(),
      imageUrl: entry.imageUrl,
      symptoms: entry.symptoms
    };
    
    // For now, show details in console and toast
    console.log('Analysis Details:', details);
    toast.success(`Viewing details for: ${details.condition}`);
    
    // TODO: Implement modal or navigation to detailed view
    const recommendationsText = details.recommendations.length > 0 
      ? details.recommendations.join('\n- ') 
      : 'No recommendations available';
      
    alert(`Analysis Details:\n\nCondition: ${details.condition}\nConfidence: ${details.confidence}%\nSeverity: ${details.severity}\nDescription: ${details.description}\n\nRecommendations:\n- ${recommendationsText}`);
  };

  const exportAnalysis = (entry: AnalysisHistory) => {
    // Create exportable data
    const exportData = {
      analysisId: entry.id,
      patientId: entry.result.userId || 1,
      analysisType: entry.type,
      condition: entry.result.condition || 'Unknown Condition',
      confidence: entry.result.confidence || 0,
      severity: entry.result.severity || 'unknown',
      description: entry.result.description || 'No description available',
      recommendations: entry.result.recommendations || [],
      analyzedAt: entry.result.analyzedAt || new Date().toISOString(),
      exportedAt: new Date().toISOString()
    };

    // Convert to JSON and download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis_${entry.id || 'unknown'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Analysis exported successfully!');
  };

  const exportCurrentAnalysis = () => {
    if (!analysisResult) {
      toast.error('No analysis result to export');
      return;
    }

    const exportData = {
      analysisId: analysisResult.id,
      patientId: analysisResult.userId,
      analysisType: 'image',
      condition: analysisResult.condition,
      confidence: analysisResult.confidence,
      severity: analysisResult.severity,
      description: analysisResult.description,
      recommendations: analysisResult.recommendations,
      analyzedAt: analysisResult.analyzedAt,
      specialty: selectedSpecialty,
      model: selectedModel,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical_analysis_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Medical analysis report exported!');
  };

  const findSpecialist = () => {
    if (!analysisResult) {
      toast.error('No analysis result available');
      return;
    }

    // Create specialist recommendations based on analysis
    const specialistMap: { [key: string]: string[] } = {
      chest: ['Pulmonologist', 'Radiologist', 'Internal Medicine'],
      dermatology: ['Dermatologist', 'Oncologist', 'Plastic Surgeon'],
      ophthalmology: ['Ophthalmologist', 'Retinal Specialist', 'Optometrist']
    };

    const specialists = specialistMap[selectedSpecialty] || ['General Practitioner'];
    
    toast.success(`Recommended specialists: ${specialists.join(', ')}`);
    
    // TODO: Implement actual specialist finder/booking system
    console.log('Finding specialists for:', {
      condition: analysisResult.condition,
      severity: analysisResult.severity,
      specialty: selectedSpecialty,
      recommendedSpecialists: specialists
    });
  };

  const findDoctorForSymptoms = () => {
    if (!analysisResult) {
      toast.error('No symptom analysis available');
      return;
    }

    // Recommend doctors based on symptoms and severity
    const doctorTypes = {
      low: ['General Practitioner', 'Family Medicine'],
      medium: ['Internal Medicine', 'Specialist Consultation'],
      high: ['Emergency Medicine', 'Urgent Care'],
      critical: ['Emergency Room', 'Immediate Medical Attention']
    };

    const recommendedDoctors = doctorTypes[analysisResult.severity] || doctorTypes.low;
    
    toast.success(`Recommended: ${recommendedDoctors.join(' or ')}`);
    console.log('Doctor recommendations for symptoms:', {
      symptoms,
      condition: analysisResult.condition,
      severity: analysisResult.severity,
      recommendedDoctors
    });
  };

  const saveSymptomAnalysis = () => {
    if (!analysisResult) {
      toast.error('No symptom analysis to save');
      return;
    }

    // Add to analysis history
    const historyEntry: AnalysisHistory = {
      id: analysisResult.id || Date.now().toString(),
      type: 'symptom',
      result: analysisResult,
      symptoms
    };

    setAnalysisHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
    toast.success('Symptom analysis saved to history!');
  };

  const saveVoiceConsultation = () => {
    if (!voiceSession) {
      toast.error('No voice consultation to save');
      return;
    }

    // Convert voice session to analysis history format
    const historyEntry: AnalysisHistory = {
      id: voiceSession.sessionId,
      type: 'voice',
      result: {
        id: voiceSession.sessionId,
        condition: 'Voice Consultation',
        confidence: 85, // Default confidence for voice
        severity: 'medium' as any,
        description: `Voice consultation: ${voiceSession.transcript}`,
        recommendations: [voiceSession.response],
        analyzedAt: new Date().toISOString(),
        type: 'voice'
      }
    };

    setAnalysisHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
    toast.success('Voice consultation saved to history!');
  };

  const bookFollowUp = () => {
    if (!voiceSession) {
      toast.error('No voice consultation available');
      return;
    }

    toast.success('Follow-up appointment booking feature coming soon!');
    console.log('Booking follow-up for voice consultation:', {
      sessionId: voiceSession.sessionId,
      transcript: voiceSession.transcript,
      response: voiceSession.response
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Health Assistant</h1>
            <p className="text-sm text-muted-foreground">Advanced AI-powered health analysis and consultation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            AI Online
          </Badge>
          <Badge variant="outline">
            {analysisHistory.length} Analyses
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="disease-detection" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="disease-detection">🔬 Disease Detection</TabsTrigger>
          <TabsTrigger value="symptom-checker">🩺 Symptom Checker</TabsTrigger>
          <TabsTrigger value="voice-assistant">🎤 Voice Assistant</TabsTrigger>
          <TabsTrigger value="history">📋 History</TabsTrigger>
        </TabsList>

        {/* Disease Detection Tab */}
        <TabsContent value="disease-detection" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Medical Image Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Model and Specialty Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Specialty</label>
                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chest">Chest & Respiratory</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">AI Model</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (Fast)</SelectItem>
                        <SelectItem value="base">Base (Balanced)</SelectItem>
                        <SelectItem value="large">Large (Accurate)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Drag and Drop Area */}
                <div
                  ref={dropRef}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Selected medical image" 
                          className="max-w-full h-48 object-contain mx-auto rounded-lg border"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={clearImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">{selectedImage?.name}</p>
                      <p className="text-xs text-gray-500">
                        Size: {selectedImage ? (selectedImage.size / 1024 / 1024).toFixed(2) : 0} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium">Upload Medical Image</p>
                        <p className="text-sm text-gray-500">
                          Drag & drop or click to select<br />
                          X-rays, CT scans, MRI, or dermatology images
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Supported: JPEG, PNG, DICOM (Max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.dcm"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                    disabled={isAnalyzing}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                  <Button 
                    onClick={analyzeImage}
                    disabled={!selectedImage || isAnalyzing}
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze Image
                      </>
                    )}
                  </Button>
                </div>

                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing with {selectedModel} model...</span>
                      <span>{selectedSpecialty}</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                    <p className="text-xs text-gray-500 text-center">
                      {analysisProgress < 30 ? 'Uploading image...' :
                       analysisProgress < 60 ? 'Analyzing with AI...' :
                       analysisProgress < 90 ? 'Processing results...' :
                       'Almost done...'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {analysisResult ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      {/* Main Result */}
                      <div className={`p-4 rounded-lg border ${getSeverityColor(analysisResult.severity)}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityIcon(analysisResult.severity)}
                          <h3 className="font-semibold">{analysisResult.condition}</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">Confidence:</span>
                          <div className="flex-1 bg-white/50 rounded-full h-2">
                            <motion.div 
                              className="bg-current h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${analysisResult.confidence}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{Math.round(analysisResult.confidence)}%</span>
                        </div>
                        <Badge className={getSeverityColor(analysisResult.severity)}>
                          {analysisResult.severity.toUpperCase()} RISK
                        </Badge>
                      </div>
                      
                      {/* Description */}
                      <div>
                        <h4 className="font-medium mb-2">Analysis Description</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {analysisResult.description}
                        </p>
                      </div>
                      
                      {/* Recommendations */}
                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <ul className="space-y-2">
                          {analysisResult.recommendations.map((rec: string, index: number) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                              className="text-sm text-gray-600 flex items-start gap-2 bg-blue-50 p-2 rounded"
                            >
                              <span className="text-blue-600 mt-1 text-xs">•</span>
                              {rec}
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* Metadata */}
                      <div className="pt-4 border-t bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Model:</span> {aiHealthService.getModelDisplayName(selectedModel)}
                          </div>
                          <div>
                            <span className="font-medium">Specialty:</span> {aiHealthService.getSpecialtyDisplayName(selectedSpecialty)}
                          </div>
                          <div>
                            <span className="font-medium">Analysis ID:</span> {analysisResult.id || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Analyzed:</span> {new Date(analysisResult.analyzedAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t">
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            This is an AI-generated analysis. Please consult with a healthcare professional for proper diagnosis.
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => exportCurrentAnalysis()}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Export Report
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => findSpecialist()}
                        >
                          <Stethoscope className="w-4 h-4 mr-1" />
                          Find Specialist
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-gray-500"
                    >
                      <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Upload and analyze a medical image to see results here</p>
                      <p className="text-xs mt-2">Supports chest X-rays, skin images, and retinal scans</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Symptom Checker Tab */}
        <TabsContent value="symptom-checker" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                AI Symptom Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Describe your symptoms in detail
                  </label>
                  <Textarea 
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="resize-none h-32"
                    placeholder="Please describe your symptoms, when they started, their severity, and any other relevant details..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be as specific as possible for better analysis accuracy
                  </p>
                </div>
                
                <Button 
                  onClick={analyzeSymptoms}
                  disabled={!symptoms.trim() || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing Symptoms...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Symptoms
                    </>
                  )}
                </Button>

                {/* Symptom Analysis Results */}
                <AnimatePresence>
                  {analysisResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-6 space-y-4"
                    >
                      <div className={`p-4 rounded-lg border ${getSeverityColor(analysisResult.severity)}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityIcon(analysisResult.severity)}
                          <h3 className="font-semibold">{analysisResult.condition}</h3>
                        </div>
                        <p className="text-sm mb-3">{analysisResult.description}</p>
                        <Badge className={getSeverityColor(analysisResult.severity)}>
                          {analysisResult.severity.toUpperCase()} URGENCY
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recommended Actions</h4>
                        <ul className="space-y-2">
                          {analysisResult.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2 bg-blue-50 p-2 rounded">
                              <span className="text-blue-600 mt-1 text-xs">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => findDoctorForSymptoms()}
                        >
                          <Stethoscope className="w-4 h-4 mr-1" />
                          Find Doctor
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => saveSymptomAnalysis()}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Save Analysis
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Assistant Tab */}
        <TabsContent value="voice-assistant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice Health Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="relative">
                  <motion.div
                    className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center ${
                      isRecording ? 'bg-red-100' : 'bg-blue-100'
                    }`}
                    animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: isRecording ? Infinity : 0, duration: 1 }}
                  >
                    {isRecording ? (
                      <MicOff className="w-12 h-12 text-red-600" />
                    ) : (
                      <Mic className="w-12 h-12 text-blue-600" />
                    )}
                  </motion.div>
                  {isRecording && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-red-400"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {isRecording ? 'Listening...' : 'Voice Health Consultation'}
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    {isRecording 
                      ? 'Speak clearly about your health concerns. The AI will analyze your voice and provide insights.'
                      : 'Tap to start a voice conversation with our AI health assistant. Ask about symptoms, medications, or health concerns.'
                    }
                  </p>
                </div>
                
                {/* Live Transcription */}
                {isRecording && liveTranscript && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Live Transcription</span>
                    </div>
                    <p className="text-sm text-blue-700">{liveTranscript}</p>
                  </motion.div>
                )}

                {/* Voice Session Results */}
                {voiceSession && !isRecording && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto space-y-4"
                  >
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        What you said:
                      </h4>
                      <p className="text-sm text-gray-700">{voiceSession.transcript}</p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-800">
                        <Brain className="w-4 h-4" />
                        AI Health Assistant Response:
                      </h4>
                      <p className="text-sm text-blue-700">{voiceSession.response}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => saveVoiceConsultation()}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Save Consultation
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => bookFollowUp()}
                      >
                        <Stethoscope className="w-4 h-4 mr-1" />
                        Book Follow-up
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                <Button
                  onClick={toggleVoiceRecording}
                  size="lg"
                  className={isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-5 h-5 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Start Voice Chat
                    </>
                  )}
                </Button>

                {/* Browser Support Check */}
                {!VAPIService.isSupported() && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Browser Not Supported</span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      Voice recording requires a modern browser with microphone access. Please update your browser or try Chrome/Firefox.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Analysis History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisHistory.length > 0 ? (
                <div className="space-y-4">
                  {analysisHistory.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            entry.type === 'image' ? 'bg-blue-100' :
                            entry.type === 'symptom' ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            {entry.type === 'image' ? <Camera className="w-4 h-4 text-blue-600" /> :
                             entry.type === 'symptom' ? <Stethoscope className="w-4 h-4 text-green-600" /> :
                             <Mic className="w-4 h-4 text-purple-600" />}
                          </div>
                          <div>
                            <h4 className="font-medium">{entry.result.condition || 'Unknown Condition'}</h4>
                            <p className="text-sm text-gray-500">
                              {entry.type === 'image' ? 'Image Analysis' :
                               entry.type === 'symptom' ? 'Symptom Check' : 'Voice Consultation'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getSeverityColor(entry.result.severity || 'low')}>
                            {entry.result.confidence || 0}%
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {entry.result.analyzedAt ? new Date(entry.result.analyzedAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>

                      {entry.imageUrl && (
                        <div className="mb-3">
                          <img 
                            src={entry.imageUrl} 
                            alt="Analysis" 
                            className="w-20 h-20 object-cover rounded border"
                          />
                        </div>
                      )}

                      {entry.symptoms && (
                        <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                          <strong>Symptoms:</strong> {entry.symptoms.substring(0, 100)}{entry.symptoms.length > 100 ? '...' : ''}
                        </div>
                      )}

                      <p className="text-sm text-gray-600 mb-3">
                        {entry.result.description ? entry.result.description.substring(0, 150) : 'No description available'}{entry.result.description && entry.result.description.length > 150 ? '...' : ''}
                      </p>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => viewAnalysisDetails(entry)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportAnalysis(entry)}
                        >
                          Export
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No Analysis History</h3>
                  <p className="text-sm">
                    Your AI health analysis history will appear here after you perform your first analysis.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}