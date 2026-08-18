import { apiClient } from './apiClient';
import type {
  AcademicYear,
  CreateStudentInput,
  Grade,
  PagedResult,
  Section,
  StudentQueryParams,
  StudentResponse,
  StudentSummary,
  UpdateStudentStatusInput,
  UpdateStudentStatusResult,
  DocumentType,
} from '../types';

export const referenceDataApi = {
  getAcademicYears: async (): Promise<AcademicYear[]> => {
    const { data } = await apiClient.get<AcademicYear[]>('/academic-years');
    return data;
  },
  getGrades: async (): Promise<Grade[]> => {
    const { data } = await apiClient.get<Grade[]>('/grades');
    return data;
  },
  getSections: async (gradeId: string): Promise<Section[]> => {
    const { data } = await apiClient.get<Section[]>(`/grades/${gradeId}/sections`);
    return data;
  },
};

export const studentsApi = {
  create: async (input: CreateStudentInput): Promise<StudentResponse> => {
    const { data } = await apiClient.post<StudentResponse>('/students', input);
    return data;
  },
  search: async (params: StudentQueryParams): Promise<PagedResult<StudentSummary>> => {
    const { data } = await apiClient.get<PagedResult<StudentSummary>>('/students', { params });
    return data;
  },
  updateStatus: async (
    studentId: string,
    input: UpdateStudentStatusInput,
  ): Promise<UpdateStudentStatusResult> => {
    const { data } = await apiClient.put<UpdateStudentStatusResult>(
      `/students/${studentId}/status`,
      input,
    );
    return data;
  },
  uploadDocument: async (studentId: string, file: File, documentType: DocumentType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    const { data } = await apiClient.post(`/students/${studentId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export const authApi = {
  login: async (username: string, password: string) => {
    const { data } = await apiClient.post<{ token: string; role: string; expiresAtUtc: string }>(
      '/auth/login',
      { username, password },
    );
    return data;
  },
};
