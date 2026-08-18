import { useQuery } from '@tanstack/react-query';
import { referenceDataApi } from '../services/api';

export function useAcademicYears() {
  return useQuery({ queryKey: ['academicYears'], queryFn: referenceDataApi.getAcademicYears });
}

export function useGrades() {
  return useQuery({ queryKey: ['grades'], queryFn: referenceDataApi.getGrades });
}

export function useSections(gradeId: string | undefined) {
  return useQuery({
    queryKey: ['sections', gradeId],
    queryFn: () => referenceDataApi.getSections(gradeId!),
    enabled: !!gradeId,
  });
}
