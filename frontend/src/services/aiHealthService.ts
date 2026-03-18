import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface AIAnalysisResult {
  id?: string;
  userId?: number;
  condition: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendations: string[];
  imageUrl?: string;
  analyzedAt: string;
}

export interface SymptomAnalysisRequest {
  userId: number;
  symptoms: string;
}

export interface SymptomAnalysisResult {
  id?: string;
  userId?: number;
  symptoms: string;
  possibleConditions: string[];
  riskLevel: string;
  recommendations: string[];
  requiresImmediateAttention: boolean;
  analyzedAt: string;
}

export interface VoiceAnalysisResult {
  id?: string;
  userId?: number;
  transcription: string;
  response: string;
  audioUrl?: string;
  analyzedAt: string;
}

export interface AnalysisHistoryItem {
  id: string;
  userId: number;
  condition: string;
  confidence: number;
  severity: string;
  description: string;
  recommendations: string[];
  imageUrl?: string;
  analyzedAt: string;
}

class AIHealthService {
  private baseURL = `${API_BASE_URL}/api/ai-health`;

  async analyzeImage(
    image: File,
    userId: number,
    specialty: string = 'chest',
    modelType: string = 'base'
  ): Promise<AIAnalysisResult> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('userId', userId.toString());
    formData.append('specialty', specialty);
    formData.append('model_type', modelType);

    const response = await fetch(`${this.baseURL}/analyze-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Image analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapAnalysisResponse(data);
  }

  async analyzeSymptoms(request: SymptomAnalysisRequest): Promise<SymptomAnalysisResult> {
    const response = await fetch(`${this.baseURL}/analyze-symptoms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Symptom analysis failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async analyzeVoice(audio: File, userId: number): Promise<VoiceAnalysisResult> {
    const formData = new FormData();
    formData.append('audio', audio);
    formData.append('userId', userId.toString());

    const response = await fetch(`${this.baseURL}/voice-analysis`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Voice analysis failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async getAnalysisHistory(userId: number): Promise<AnalysisHistoryItem[]> {
    const response = await fetch(`${this.baseURL}/analysis-history/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch analysis history: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map(this.mapAnalysisResponse);
  }

  private mapAnalysisResponse(data: any): AIAnalysisResult {
    return {
      id: data.id?.toString(),
      userId: data.userId,
      condition: data.condition,
      confidence: data.confidence,
      severity: data.severity,
      description: data.description,
      recommendations: data.recommendations || [],
      imageUrl: data.imageUrl,
      analyzedAt: data.analyzedAt,
    };
  }

  // Utility method to get mock user ID (replace with real auth)
  getCurrentUserId(): number {
    // TODO: Replace with real authentication
    return 1;
  }

  // Helper method to format confidence as percentage
  formatConfidence(confidence: number): string {
    return `${Math.round(confidence)}%`;
  }

  // Helper method to get severity color
  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  // Helper method to get specialty display name
  getSpecialtyDisplayName(specialty: string): string {
    switch (specialty) {
      case 'chest': return 'Chest & Respiratory';
      case 'dermatology': return 'Dermatology';
      case 'ophthalmology': return 'Ophthalmology';
      default: return specialty;
    }
  }

  // Helper method to get model display name
  getModelDisplayName(modelType: string): string {
    switch (modelType) {
      case 'small': return 'Small (Fast)';
      case 'base': return 'Base (Balanced)';
      case 'large': return 'Large (Accurate)';
      default: return modelType;
    }
  }
}

export const aiHealthService = new AIHealthService();
export default aiHealthService;