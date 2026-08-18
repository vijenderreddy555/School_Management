// Mirrors backend enums (SchoolMgmt.Domain.Enums) — serialized as PascalCase strings via JsonStringEnumConverter.

export type Gender = 'Male' | 'Female' | 'NonBinary' | 'PreferNotToSay';

export type BloodGroup =
  | 'Unknown'
  | 'APlus'
  | 'AMinus'
  | 'BPlus'
  | 'BMinus'
  | 'OPlus'
  | 'OMinus'
  | 'ABPlus'
  | 'ABMinus';

export type StudentStatus =
  | 'Enrolled'
  | 'Active'
  | 'Inactive'
  | 'Transferred'
  | 'Suspended'
  | 'Graduated';

export type DocumentType = 'BirthCertificate' | 'AddressProof' | 'Passport' | 'Other';

export type Relationship = 'Father' | 'Mother' | 'LegalGuardian' | 'Other';

export const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Non-Binary', value: 'NonBinary' },
  { label: 'Prefer Not To Say', value: 'PreferNotToSay' },
];

export const BLOOD_GROUP_OPTIONS: { label: string; value: BloodGroup }[] = [
  { label: 'Unknown', value: 'Unknown' },
  { label: 'A+', value: 'APlus' },
  { label: 'A-', value: 'AMinus' },
  { label: 'B+', value: 'BPlus' },
  { label: 'B-', value: 'BMinus' },
  { label: 'O+', value: 'OPlus' },
  { label: 'O-', value: 'OMinus' },
  { label: 'AB+', value: 'ABPlus' },
  { label: 'AB-', value: 'ABMinus' },
];

export const RELATIONSHIP_OPTIONS: { label: string; value: Relationship }[] = [
  { label: 'Father', value: 'Father' },
  { label: 'Mother', value: 'Mother' },
  { label: 'Legal Guardian', value: 'LegalGuardian' },
  { label: 'Other', value: 'Other' },
];

export const DOCUMENT_TYPE_OPTIONS: { label: string; value: DocumentType }[] = [
  { label: 'Birth Certificate', value: 'BirthCertificate' },
  { label: 'Address Proof', value: 'AddressProof' },
  { label: 'Passport', value: 'Passport' },
  { label: 'Other', value: 'Other' },
];

export const STATUS_OPTIONS: { label: string; value: StudentStatus }[] = [
  { label: 'Enrolled', value: 'Enrolled' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Transferred', value: 'Transferred' },
  { label: 'Suspended', value: 'Suspended' },
  { label: 'Graduated', value: 'Graduated' },
];

export interface AcademicYear {
  id: string;
  code: string;
  startDate: string;
  endDate: string;
}

export interface Grade {
  id: string;
  name: string;
  code: string;
}

export interface Section {
  id: string;
  name: string;
  capacity: number;
  enrolledCount: number;
  availableSeats: number;
}

export interface GuardianInput {
  fullName: string;
  relationship: Relationship;
  mobilePhone: string;
  emailAddress?: string;
  address?: string;
}

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  nationalId: string;
  academicYearId: string;
  gradeId: string;
  sectionId: string;
  rollNumber?: number;
  primaryGuardian: GuardianInput;
  emergencyContactNo: string;
  bloodGroup: BloodGroup;
  medicalAlerts?: string;
}

export interface StudentResponse {
  studentId: string;
  studentCode: string;
  rollNumber: number;
  status: StudentStatus;
}

export interface StudentSummary {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  gradeName: string;
  sectionName: string;
  rollNumber: number;
  status: StudentStatus;
  medicalAlerts: string | null;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface StudentQueryParams {
  searchQuery?: string;
  gradeId?: string;
  sectionId?: string;
  academicYearId?: string;
  status?: string;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface UpdateStudentStatusInput {
  newStatus: StudentStatus;
  targetSectionId?: string;
  changeReason: string;
}

export interface UpdateStudentStatusResult {
  studentId: string;
  previousStatus: StudentStatus;
  newStatus: StudentStatus;
}
