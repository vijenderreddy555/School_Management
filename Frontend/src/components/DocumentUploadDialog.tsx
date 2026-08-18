import { useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload, type FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { DOCUMENT_TYPE_OPTIONS, type DocumentType, type StudentSummary } from '../types';
import { studentsApi } from '../services/api';

interface Props {
  student: StudentSummary | null;
  visible: boolean;
  onHide: () => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export default function DocumentUploadDialog({ student, visible, onHide }: Props) {
  const toast = useRef<Toast>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('BirthCertificate');

  const handleUpload = async (event: FileUploadHandlerEvent) => {
    if (!student) return;
    const file = event.files[0];
    try {
      await studentsApi.uploadDocument(student.id, file, documentType);
      toast.current?.show({ severity: 'success', summary: 'Document Uploaded', life: 3000 });
      event.options.clear();
      onHide();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to upload document.';
      toast.current?.show({ severity: 'error', summary: 'Error', detail: message, life: 5000 });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={`Upload Document - ${student?.firstName ?? ''} ${student?.lastName ?? ''}`}
        visible={visible}
        onHide={onHide}
        style={{ width: '32rem' }}
      >
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="documentType">Document Type</label>
            <Dropdown
              id="documentType"
              value={documentType}
              options={DOCUMENT_TYPE_OPTIONS}
              onChange={(e) => setDocumentType(e.value)}
            />
          </div>
          <FileUpload
            name="file"
            accept=".pdf,.png,.jpeg,.jpg"
            maxFileSize={MAX_FILE_SIZE_BYTES}
            customUpload
            uploadHandler={handleUpload}
            chooseLabel="Choose File"
            uploadLabel="Upload"
          />
          <small className="text-gray-500">Max 5 MB. Allowed types: PDF, PNG, JPEG.</small>
        </div>
      </Dialog>
    </>
  );
}
