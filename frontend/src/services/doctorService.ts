export interface Doctor {
  id: string; // UUID as string
  name: string;
  specialization: string;
  experience: string;
  hospital: string;
  fees: number;
  rating: number;
  availableSlots: string;
  isAvailable: boolean;
  verified: boolean;
  address: string;
  phone: string;
  email: string;
  qualifications: string;
  reviewCount: number;
  nextAvailable: string;
  languages: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

class DoctorService {
  private baseUrl = 'http://localhost:8080/api/doctors';

  async getAllDoctors(): Promise<Doctor[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch doctors');
    }
    return response.json();
  }

  async searchDoctors(specialization?: string, minFees?: number, maxFees?: number): Promise<Doctor[]> {
    const params = new URLSearchParams();
    
    if (specialization) {
      params.append('specialization', specialization);
    }
    if (minFees !== undefined) {
      params.append('minFees', minFees.toString());
    }
    if (maxFees !== undefined) {
      params.append('maxFees', maxFees.toString());
    }

    const url = params.toString() ? `${this.baseUrl}/search?${params}` : `${this.baseUrl}/search`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to search doctors');
    }
    return response.json();
  }

  async getTopRatedDoctors(): Promise<Doctor[]> {
    const response = await fetch(`${this.baseUrl}/top-rated`);
    if (!response.ok) {
      throw new Error('Failed to fetch top rated doctors');
    }
    return response.json();
  }

  async getSpecializations(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/specializations`);
    if (!response.ok) {
      throw new Error('Failed to fetch specializations');
    }
    return response.json();
  }

  async getHospitals(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/hospitals`);
    if (!response.ok) {
      throw new Error('Failed to fetch hospitals');
    }
    return response.json();
  }

  async getDoctorById(id: string): Promise<Doctor> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch doctor');
    }
    return response.json();
  }

  // Jitsi Meet Integration
  generateMeetingRoom(doctorId: string, patientId: number): string {
    return `pulsenet-consultation-${doctorId}-${patientId}-${Date.now()}`;
  }

  generateMeetingLink(roomName: string): string {
    return `https://meet.jit.si/${roomName}`;
  }
}

export const doctorService = new DoctorService();