import { useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { STATUS_OPTIONS } from '../types';
import type { StudentSummary } from '../types';
import { updateStatusSchema, type UpdateStatusFormValues } from '../validators/studentSchema';
import { useUpdateStudentStatus } from '../hooks/useStudents';

interface Props {
  student: StudentSummary | null;
  visible: boolean;
  onHide: () => void;
}

export default function StatusUpdateDialog({ student, visible, onHide }: Props) {
  const toast = useRef<Toast>(null);
  const updateStatus = useUpdateStudentStatus();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: { newStatus: student?.status ?? 'Active', changeReason: '' },
  });

  const onSubmit = (values: UpdateStatusFormValues) => {
    if (!student) return;
    updateStatus.mutate(
      { studentId: student.id, input: values },
      {
        onSuccess: () => {
          toast.current?.show({ severity: 'success', summary: 'Status Updated', life: 3000 });
          reset();
          onHide();
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            'Failed to update status.';
          toast.current?.show({ severity: 'error', summary: 'Error', detail: message, life: 5000 });
        },
      },
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={`Update Status - ${student?.firstName ?? ''} ${student?.lastName ?? ''}`}
        visible={visible}
        onHide={onHide}
        style={{ width: '32rem' }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="newStatus">New Status *</label>
            <Controller
              name="newStatus"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="newStatus"
                  value={field.value}
                  options={STATUS_OPTIONS}
                  onChange={(e) => field.onChange(e.value)}
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="changeReason">Change Reason *</label>
            <Controller
              name="changeReason"
              control={control}
              render={({ field }) => <InputTextarea id="changeReason" rows={3} {...field} />}
            />
            {errors.changeReason && <small className="text-red-500">{errors.changeReason.message}</small>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" outlined onClick={onHide} />
            <Button type="submit" label="Confirm Update" loading={updateStatus.isPending} raised />
          </div>
        </form>
      </Dialog>
    </>
  );
}
