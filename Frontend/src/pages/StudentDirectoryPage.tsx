import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Avatar } from 'primereact/avatar';
import type { StudentQueryParams, StudentStatus, StudentSummary } from '../types';
import { useStudentSearch } from '../hooks/useStudents';
import StatusUpdateDialog from '../components/StatusUpdateDialog';
import DocumentUploadDialog from '../components/DocumentUploadDialog';
import { useAuth } from '../context/AuthContext';

const STATUS_SEVERITY: Record<StudentStatus, 'success' | 'info' | 'warning' | 'danger'> = {
  Enrolled: 'info',
  Active: 'success',
  Inactive: 'warning',
  Transferred: 'warning',
  Suspended: 'danger',
  Graduated: 'info',
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useMemo(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return debounced;
}

export default function StudentDirectoryPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDescending, setSortDescending] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [uploadStudent, setUploadStudent] = useState<StudentSummary | null>(null);
  const [uploadDialogVisible, setUploadDialogVisible] = useState(false);

  const canManageStatus = role === 'REGISTRAR' || role === 'SYSTEM_ADMIN';
  const canUploadDocuments = role === 'REGISTRAR' || role === 'ADMISSIONS_ADMIN' || role === 'SYSTEM_ADMIN';

  const queryParams: StudentQueryParams = {
    searchQuery: debouncedSearch || undefined,
    pageNumber,
    pageSize,
    sortBy,
    sortDescending,
  };

  const { data, isFetching } = useStudentSearch(queryParams);

  const onPage = (event: DataTablePageEvent) => {
    setPageNumber((event.page ?? 0) + 1);
    setPageSize(event.rows);
  };

  const onSort = (event: DataTableSortEvent) => {
    setSortBy(event.sortField || undefined);
    setSortDescending(event.sortOrder === -1);
  };

  const nameBodyTemplate = (rowData: StudentSummary) => (
    <div className="flex items-center gap-3">
      <Avatar
        label={`${rowData.firstName.charAt(0)}${rowData.lastName.charAt(0)}`.toUpperCase()}
        shape="circle"
        style={{ backgroundColor: 'var(--brand-600)', color: '#fff' }}
      />
      <div className="leading-tight">
        <div className="font-medium text-gray-900">
          {rowData.firstName} {rowData.lastName}
        </div>
        <div className="text-xs text-gray-500">{rowData.studentCode}</div>
      </div>
    </div>
  );

  const statusBodyTemplate = (rowData: StudentSummary) => (
    <Tag value={rowData.status} severity={STATUS_SEVERITY[rowData.status]} />
  );

  const actionsBodyTemplate = (rowData: StudentSummary) => (
    <div className="flex gap-1 justify-end">
      {canManageStatus && (
        <Button
          icon="pi pi-sync"
          label="Status"
          size="small"
          text
          onClick={() => {
            setSelectedStudent(rowData);
            setDialogVisible(true);
          }}
        />
      )}
      {canUploadDocuments && (
        <Button
          icon="pi pi-upload"
          label="Document"
          size="small"
          text
          onClick={() => {
            setUploadStudent(rowData);
            setUploadDialogVisible(true);
          }}
        />
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.totalCount ?? 0} student{(data?.totalCount ?? 0) === 1 ? '' : 's'} across all grades and sections.
          </p>
        </div>
        <Button
          label="New Admission"
          icon="pi pi-plus"
          raised
          onClick={() => navigate('/students/new')}
        />
      </div>

      <div className="app-card p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <IconField iconPosition="left" className="w-full max-w-sm">
            <InputIcon className="pi pi-search" />
            <InputText
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPageNumber(1);
              }}
              placeholder="Search by name, code, or National ID"
              className="w-full"
            />
          </IconField>
        </div>

        <DataTable
          value={data?.items ?? []}
          lazy
          paginator
          first={(pageNumber - 1) * pageSize}
          rows={pageSize}
          totalRecords={data?.totalCount ?? 0}
          onPage={onPage}
          onSort={onSort}
          sortField={sortBy}
          sortOrder={sortDescending ? -1 : 1}
          loading={isFetching}
          dataKey="id"
          rowsPerPageOptions={[10, 20, 50]}
          emptyMessage="No students found."
          stripedRows
          className="text-sm"
        >
          <Column field="firstName" header="Student" body={nameBodyTemplate} sortable style={{ minWidth: '14rem' }} />
          <Column field="gradeName" header="Grade" />
          <Column field="sectionName" header="Section" />
          <Column field="rollNumber" header="Roll #" sortable />
          <Column field="nationalId" header="National ID" />
          <Column field="status" header="Status" body={statusBodyTemplate} />
          <Column header="" body={actionsBodyTemplate} style={{ width: '14rem' }} />
        </DataTable>
      </div>

      <StatusUpdateDialog
        student={selectedStudent}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
      />
      <DocumentUploadDialog
        student={uploadStudent}
        visible={uploadDialogVisible}
        onHide={() => setUploadDialogVisible(false)}
      />
    </div>
  );
}

