export type UserRole = 'patient' | 'doctor' | 'staff';

export type BloodType = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

export type DonationType = 'whole_blood' | 'power_red' | 'platelets' | 'plasma';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  bloodGroup: BloodType;
  donorId?: string;
  donorTier?: 'Bronze Guardian' | 'Silver Life Saver' | 'Gold Champion' | 'Platinum Legend';
  lastDonationDate?: string;
  totalDonations?: number;
  livesSaved?: number;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  qrToken?: string;
  medicalLicense?: string;
  hospitalAffiliation?: string;
  department?: string;
  staffBadgeId?: string;
}

export interface Hospital {
  id: string;
  name: string;
  traumaLevel: 'Level 1 Trauma Center' | 'Level 2 Trauma Center' | 'Comprehensive Regional Center' | 'Apex Trauma Center' | 'Major Trauma Centre';
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  emergencyHotline: string;
  websiteUrl: string;
  mapsUrl: string;
  distanceMiles: number;
  availableSlotsToday: number;
  urgentNeeds: BloodType[];
  bloodBankDepartment: string;
  hoursOfOperation: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface BloodInventoryItem {
  bloodType: BloodType;
  packedRbcUnits: number;
  wholeBloodUnits: number;
  plateletUnits: number;
  plasmaUnits: number;
  minSafeThreshold: number;
  status: 'critical' | 'low' | 'optimal' | 'surplus';
  expiringIn48h: number;
  dailyConsumptionAvg: number;
}

export interface Appointment {
  id: string;
  referenceCode: string;
  donorId: string;
  donorName: string;
  bloodGroup: BloodType;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalMapsUrl: string;
  donationType: DonationType;
  appointmentDate: string;
  timeSlot: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  bookedAt: string;
  preScreeningCleared: boolean;
  notes?: string;
}

export interface HealthMetricRecord {
  id: string;
  date: string;
  hospitalName: string;
  hemoglobin: number; // g/dL
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number; // mmHg
  pulseRate: number; // bpm
  plateletCount: number; // x10^3/uL
  volumeDonatedMl: number;
  doctorNotes: string;
  ironStatus: 'Optimal' | 'Borderline' | 'Elevated';
  vitalsPassed: boolean;
}

export interface EligibilityResult {
  isEligible: boolean;
  clearanceCode?: string;
  status: 'ELIGIBLE' | 'DEFERRED_TEMPORARY' | 'REQUIRES_PHYSICIAN_REVIEW';
  headline: string;
  detailedReason: string;
  nextEligibleDate?: string;
  daysRemaining?: number;
  categoryChecks: {
    name: string;
    passed: boolean;
    detail: string;
  }[];
  clinicalAdvisory: string;
}

export interface DispatchLog {
  id: string;
  dispatchId: string;
  fromHospital: string;
  toHospital: string;
  bloodType: BloodType;
  component: string;
  units: number;
  priority: 'STAT_EMERGENCY' | 'URGENT_SURGICAL' | 'ROUTINE_TRANSFER';
  status: 'In Transit' | 'Dispatched' | 'Delivered';
  etaMinutes: number;
  tempCelsius: number;
  courier: string;
  timestamp: string;
}

export interface DemandPredictionScenario {
  id: string;
  name: string;
  description: string;
  patientSurgeEstimate: number;
  predictedDeficit: Record<BloodType, number>;
  recommendedActions: string[];
  severity: 'high' | 'moderate' | 'stable';
}
