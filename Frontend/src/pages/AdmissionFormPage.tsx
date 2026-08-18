import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { useNavigate } from 'react-router-dom';
import {
  createStudentSchema,
  type CreateStudentFormValues,
} from '../validators/studentSchema';
import {
  GENDER_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  RELATIONSHIP_OPTIONS,
} from '../types';
import { useAcademicYears, useGrades, useSections } from '../hooks/useReferenceData';
import { useCreateStudent } from '../hooks/useStudents';

export default function AdmissionFormPage() {
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  const { data: academicYears } = useAcademicYears();
  const { data: grades } = useGrades();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateStudentFormValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      bloodGroup: 'Unknown',
      primaryGuardian: { relationship: 'Father' },
    },
  });

  const selectedGradeId = watch('gradeId');
  const { data: sections } = useSections(selectedGradeId);

  useEffect(() => {
    setValue('sectionId', '');
  }, [selectedGradeId, setValue]);

  const createStudent = useCreateStudent();

  const onSubmit = (values: CreateStudentFormValues) => {
    createStudent.mutate(
      {
        ...values,
        primaryGuardian: {
          ...values.primaryGuardian,
          emailAddress: values.primaryGuardian.emailAddress || undefined,
        },
      },
      {
        onSuccess: (result) => {
          toast.current?.show({
            severity: 'success',
            summary: 'Admission Successful',
            detail: `Student code ${result.studentCode} created with roll number ${result.rollNumber}.`,
            life: 5000,
          });
          setTimeout(() => navigate('/students'), 1200);
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { data?: { error?: string; errors?: Record<string, string[]> } } })
              ?.response?.data?.error ?? 'Failed to submit admission.';
          toast.current?.show({ severity: 'error', summary: 'Error', detail: message, life: 6000 });
        },
      },
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Toast ref={toast} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Student Admission</h1>
        <p className="text-sm text-gray-500 mt-1">
          Capture demographic, guardian, and academic placement details to enroll a new student.
        </p>
      </div>
      <div className="app-card p-5 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-base text-gray-800 mb-4">
              <i className="pi pi-user text-indigo-600" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="firstName">First Name *</label>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => <InputText id="firstName" {...field} />}
                />
                {errors.firstName && <small className="text-red-500">{errors.firstName.message}</small>}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="lastName">Last Name *</label>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => <InputText id="lastName" {...field} />}
                />
                {errors.lastName && <small className="text-red-500">{errors.lastName.message}</small>}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <Calendar
                      id="dateOfBirth"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(e) =>
                        field.onChange(e.value ? (e.value as Date).toISOString().slice(0, 10) : '')
                      }
                      dateFormat="yy-mm-dd"
                      showIcon
                    />
                  )}
                />
                {errors.dateOfBirth && <small className="text-red-500">{errors.dateOfBirth.message}</small>}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="gender">Gender *</label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      id="gender"
                      value={field.value}
                      options={GENDER_OPTIONS}
                      onChange={(e) => field.onChange(e.value)}
                      placeholder="Select Gender"
                    />
                  )}
                />
                {errors.gender && <small className="text-red-500">{errors.gender.message}</small>}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="nationalId">National ID Number *</label>
                <Controller
                  name="nationalId"
                  control={control}
                  render={({ field }) => <InputText id="nationalId" {...field} />}
                />
                {errors.nationalId && <small className="text-red-500">{errors.nationalId.message}</small>}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="bloodGroup">Blood Group</label>
                <Controller
                  name="bloodGroup"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      id="bloodGroup"
                      value={field.value}
                      options={BLOOD_GROUP_OPTIONS}
                      onChange={(e) => field.onChange(e.value)}
                    />
                  )}
                />
              </div>
            </div>
          </section>

          <Divider />

          <section>
            <h3 className="flex items-center gap-2 font-semibold text-base text-gray-800 mb-4">
              <i className="pi pi-graduation-cap text-indigo-600" /> Academic Placement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="academicYearId">Academic Year *</label>
                <Controller
                  name="academicYearId"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      id="academicYearId"
                      value={field.value}
                      options={academicYears?.map((a) => ({ label: a.code, value: a.id }))}
                      onChange={(e) => field.onChange(e.value)}
                      placeholder="Select Academic Year"
                    />
                  )}
                />
                {errors.academicYearId && <small className="text-red-500">{errors.academicYearId.message}</small>}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="gradeId">Grade Level *</label>
                <Controller
                  name="gradeId"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      id="gradeId"
                      value={field.value}
                      options={grades?.map((g) => ({ label: g.name, value: g.id }))}
                      onChange={(e) => field.onChange(e.value)}
                      placeholder="Select Grade"
                    />
                  )}
                />
                {errors.gradeId && <small className="text-red-500">{errors.gradeId.message}</small>}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="sectionId">Section *</label>
                <Controller
                  name="sectionId"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      id="sectionId"
                      value={field.value}
                      options={sections?.map((s) => ({
                        label: `${s.name} (${s.availableSeats} seats left)`,
                        value: s.id,
                        disabled: s.availableSeats <= 0,
                      }))}
                      onChange={(e) => field.onChange(e.value)}
                      placeholder="Select Section"
                      disabled={!selectedGradeId}
                    />
                  )}
                />
                {errors.sectionId && <small className="text-red-500">{errors.sectionId.message}</small>}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="rollNumber">Roll Number (optional)</label>
                <Controller
                  name="rollNumber"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      id="rollNumber"
                      value={field.value ?? null}
                      onValueChange={(e) => field.onChange(e.value ?? undefined)}
                      min={1}
                      max={999}
                    />
                  )}
                />
              </div>
            </div>
          </section>

          <Divider />

          <section>
            <h3 className="flex items-center gap-2 font-semibold text-base text-gray-800 mb-4">
              <i className="pi pi-shield text-indigo-600" /> Guardian &amp; Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="guardianName">Primary Guardian Name *</label>
                <Controller
                  name="primaryGuardian.fullName"
                  control={control}
                  render={({ field }) => <InputText id="guardianName" {...field} />}
                />
                {errors.primaryGuardian?.fullName && (
                  <small className="text-red-500">{errors.primaryGuardian.fullName.message}</small>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="guardianRelationship">Guardian Relationship *</label>
                <Controller
                  name="primaryGuardian.relationship"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      id="guardianRelationship"
                      value={field.value}
                      options={RELATIONSHIP_OPTIONS}
                      onChange={(e) => field.onChange(e.value)}
                    />
                  )}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="guardianPhone">Guardian Mobile Phone *</label>
                <Controller
                  name="primaryGuardian.mobilePhone"
                  control={control}
                  render={({ field }) => <InputText id="guardianPhone" placeholder="+15551234567" {...field} />}
                />
                {errors.primaryGuardian?.mobilePhone && (
                  <small className="text-red-500">{errors.primaryGuardian.mobilePhone.message}</small>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="guardianEmail">Guardian Email Address</label>
                <Controller
                  name="primaryGuardian.emailAddress"
                  control={control}
                  render={({ field }) => <InputText id="guardianEmail" {...field} />}
                />
                {errors.primaryGuardian?.emailAddress && (
                  <small className="text-red-500">{errors.primaryGuardian.emailAddress.message}</small>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="emergencyContactNo">Emergency Contact No *</label>
                <Controller
                  name="emergencyContactNo"
                  control={control}
                  render={({ field }) => <InputText id="emergencyContactNo" placeholder="+15551234567" {...field} />}
                />
                {errors.emergencyContactNo && (
                  <small className="text-red-500">{errors.emergencyContactNo.message}</small>
                )}
              </div>
            </div>
          </section>

          <Divider />

          <section>
            <h3 className="flex items-center gap-2 font-semibold text-base text-gray-800 mb-4">
              <i className="pi pi-heart text-indigo-600" /> Medical Alerts
            </h3>
            <Controller
              name="medicalAlerts"
              control={control}
              render={({ field }) => (
                <InputTextarea id="medicalAlerts" rows={3} className="w-full" {...field} placeholder="e.g., Penicillin allergy" />
              )}
            />
          </section>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-2">
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              outlined
              onClick={() => navigate('/students')}
            />
            <Button type="submit" label="Submit Admission" icon="pi pi-check" loading={createStudent.isPending} raised />
          </div>
        </form>
      </div>
    </div>
  );
}
