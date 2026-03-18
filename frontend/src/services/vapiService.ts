// VAPI Voice AI Integration Service
import { toast } from 'sonner';

interface VAPIConfig {
  publicKey: string;
  assistantId?: string;
}

interface VAPISession {
  sessionId: string;
  isActive: boolean;
  transcript: string;
  response: string;
}

class VAPIService {
  private config: VAPIConfig;
  private currentSession: VAPISession | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private onSessionUpdateCallback: ((session: VAPISession) => void) | null = null;

  constructor() {
    this.config = {
      publicKey: '8a673430-550f-4be7-92de-ba7671f85c38',
      assistantId: 'pulsenet-health-assistant'
    };
  }

  async startVoiceSession(): Promise<string> {
    try {
      // Request microphone permission
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Create session
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.currentSession = {
        sessionId,
        isActive: true,
        transcript: '',
        response: ''
      };

      // Set up MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        await this.processAudioBlob(audioBlob);
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second

      toast.success('Voice session started. Speak now...');
      return sessionId;

    } catch (error) {
      console.error('Failed to start voice session:', error);
      toast.error('Failed to access microphone. Please check permissions.');
      throw error;
    }
  }

  async stopVoiceSession(): Promise<VAPISession | null> {
    if (!this.currentSession || !this.mediaRecorder) {
      return null;
    }

    try {
      // Stop recording
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }

      this.currentSession.isActive = false;
      
      // Stop all tracks to release microphone immediately
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }
      
      toast.success('Voice session ended. Processing...');
      return this.currentSession;

    } catch (error) {
      console.error('Failed to stop voice session:', error);
      toast.error('Failed to stop voice session');
      return null;
    }
  }

  private async processAudioBlob(audioBlob: Blob): Promise<void> {
    if (!this.currentSession) return;

    try {
      // Convert blob to file for upload
      const audioFile = new File([audioBlob], `voice_${this.currentSession.sessionId}.webm`, {
        type: 'audio/webm'
      });

      // Send to backend for processing
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('userId', '1'); // TODO: Get real user ID

      const response = await fetch('/api/ai-health/voice-analysis', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Voice analysis failed');
      }

      const result = await response.json();
      
      console.log('🎤 Voice analysis result received:', result);
      
      // Update session with results
      this.currentSession.transcript = result.transcription;
      this.currentSession.response = result.response;

      console.log('🎤 Updated session:', this.currentSession);

      // Notify the UI component that the session has been updated
      if (this.onSessionUpdateCallback) {
        console.log('🎤 Calling session update callback');
        this.onSessionUpdateCallback(this.currentSession);
      } else {
        console.log('🎤 No session update callback set');
      }

      toast.success('Voice analysis completed!');

    } catch (error) {
      console.error('Failed to process audio:', error);
      toast.error('Failed to process voice input');
    }
  }

  // Get the current session and check if it has been updated with results
  getCurrentSessionWithResults(): VAPISession | null {
    return this.currentSession;
  }

  // Check if session has results
  hasSessionResults(): boolean {
    return !!(this.currentSession && this.currentSession.transcript && this.currentSession.response);
  }

  isSessionActive(): boolean {
    return this.currentSession?.isActive || false;
  }

  // Set callback to be notified when session is updated with results
  setOnSessionUpdateCallback(callback: (session: VAPISession) => void): void {
    this.onSessionUpdateCallback = callback;
  }

  // Simulate real-time transcription for UI feedback
  simulateTranscription(callback: (text: string) => void): void {
    if (!this.isSessionActive()) return;

    const samplePhrases = [
      "I've been having headaches...",
      "My throat feels sore and...",
      "I'm experiencing some chest discomfort...",
      "There's a rash on my arm that...",
      "I've been feeling tired lately and..."
    ];

    let currentPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (!this.isSessionActive() || currentIndex >= currentPhrase.length) {
        clearInterval(interval);
        return;
      }

      callback(currentPhrase.substring(0, currentIndex + 1));
      currentIndex++;
    }, 100);
  }

  // Check if browser supports required features
  static isSupported(): boolean {
    try {
      return !!(
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function' &&
        typeof window !== 'undefined' &&
        'MediaRecorder' in window
      );
    } catch {
      return false;
    }
  }

  // Get supported audio formats
  static getSupportedFormats(): string[] {
    if (typeof window === 'undefined' || !('MediaRecorder' in window)) {
      return [];
    }

    const formats = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ];

    try {
      return formats.filter(format => MediaRecorder.isTypeSupported(format));
    } catch {
      return [];
    }
  }
}

export const vapiService = new VAPIService();
export { VAPIService };
export default vapiService;
export type { VAPISession };