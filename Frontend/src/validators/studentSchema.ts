import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const nationalIdRegex = /^[A-Z0-9-]{8,20}$/;
const nameRegex = /^[A-Za-z\s]+$/;

export const guardianSchema = z.object({
  fullName: z.string().min(1, 'Guardian name is required').max(100).regex(nameRegex, 'Only letters and spaces are allowed'),
  relationship: z.enum(['Father', 'Mother', 'LegalGuardian', 'Other']),
  mobilePhone: z.string().regex(phoneRegex, 'Please enter a valid mobile phone number.'),
  emailAddress: z.string().email('Invalid email address').max(100).optional().or(z.literal('')),
  address: z.string().optional(),
});

export const createStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50).regex(nameRegex, 'Only letters and spaces are allowed'),
  lastName: z.string().min(1, 'Last name is required').max(50).regex(nameRegex, 'Only letters and spaces are allowed'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((value) => {
      const dob = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
      return age >= 3 && age <= 20;
    }, 'Student age must be between 3 and 20 years for the selected Academic Year.'),
  gender: z.enum(['Male', 'Female', 'NonBinary', 'PreferNotToSay']),
  nationalId: z.string().regex(nationalIdRegex, 'National ID must be 8-20 characters: A-Z, 0-9, or hyphens.'),
  academicYearId: z.string().min(1, 'Academic year is required'),
  gradeId: z.string().min(1, 'Grade is required'),
  sectionId: z.string().min(1, 'Section is required'),
  rollNumber: z.number().int().min(1).max(999).optional(),
  primaryGuardian: guardianSchema,
  emergencyContactNo: z.string().regex(phoneRegex, 'Please enter a valid emergency contact number.'),
  bloodGroup: z.enum(['Unknown', 'APlus', 'AMinus', 'BPlus', 'BMinus', 'OPlus', 'OMinus', 'ABPlus', 'ABMinus']),
  medicalAlerts: z.string().max(500).optional(),
});

export type CreateStudentFormValues = z.infer<typeof createStudentSchema>;

export const updateStatusSchema = z.object({
  newStatus: z.enum(['Enrolled', 'Active', 'Inactive', 'Transferred', 'Suspended', 'Graduated']),
  targetSectionId: z.string().optional(),
  changeReason: z.string().min(1, 'A change reason is required.'),
});

export type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;
