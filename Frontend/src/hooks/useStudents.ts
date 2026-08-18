import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '../services/api';
import type {
  CreateStudentInput,
  StudentQueryParams,
  UpdateStudentStatusInput,
} from '../types';

export function useStudentSearch(params: StudentQueryParams) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => studentsApi.search(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStudentInput) => studentsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useUpdateStudentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, input }: { studentId: string; input: UpdateStudentStatusInput }) =>
      studentsApi.updateStatus(studentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
