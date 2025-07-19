export type UserRole = 'admin' | 'doctor' | 'nurse' | 'front-desk' | 'patient' | 'pharmacy';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  title: string;
  phone: string;
  isActive: boolean;
  isVerified: boolean;
  isGovernmentVerified: boolean;
  professionalVerificationStatus: string;
  lastLogin: string;
  specialization?: string;
  department?: string;
} 