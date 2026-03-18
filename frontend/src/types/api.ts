/**
 * PulseNet API Type Definitions
 * These interfaces match the Backend Integration Specification.
 */

export type UserRole = 'SYSTEM_ADMIN' | 'HOSPITAL_ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  hospitalId?: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

// --- Authentication ---

export interface SendOtpRequest {
  email: string;
}

export interface HospitalLoginRequest {
  identity: string;
  password: string;
  otp: string;
}

export interface AdminLoginRequest {
  identity: string;
  password: string;
}

// --- Hospital Registration ---

export interface BasicHospitalInfo {
  name: string;
  registrationNo: string;
  hospitalType: 'private' | 'government' | 'trust' | 'ngo';
  yearEstablished: number;
  ownershipType: 'individual' | 'corporate' | 'society';
}

export interface HospitalLocation {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  lat: string;
  lng: string;
}

export interface HospitalInfrastructure {
  icuBeds: number;
  generalBeds: number;
  emergencyBeds: number;
  ventilators: number;
  operatingRooms: number;
}

export interface HospitalContacts {
  emergencyContact: string;
  controlRoomNumber: string;
  hospitalEmail: string;
  adminPersonName: string;
  adminPhone: string;
}

export interface HospitalRegistrationRequest {
  basicInfo: BasicHospitalInfo;
  location: HospitalLocation;
  infrastructure: HospitalInfrastructure;
  specialties: string[];
  equipment: Record<string, boolean>;
  contacts: HospitalContacts;
  adminAccount: {
    email: string;
    password: string;
  };
}
