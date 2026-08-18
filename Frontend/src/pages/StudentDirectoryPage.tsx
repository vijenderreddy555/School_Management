import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import type { StudentQueryParams, StudentSummary } from '../types';
import { useStudentSearch } from '../hooks/useStudents';
import StatusUpdateDialog from '../components/StatusUpdateDialog';
import DocumentUploadDialog from '../components/DocumentUploadDialog';
import { useAuth } from '../context/AuthContext';

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

  const statusBodyTemplate = (rowData: StudentSummary) => (
    <Tag value={rowData.status} severity={rowData.status === 'Active' || rowData.status === 'Enrolled' ? 'success' : 'warning'} />
  );

  const actionsBodyTemplate = (rowData: StudentSummary) => (
    <div className="flex gap-2">
      {canManageStatus && (
        <Button
          label="Update Status"
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
          label="Upload Doc"
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
    <div className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Student Directory</h2>
        <div className="flex gap-3">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPageNumber(1);
              }}
              placeholder="Search by name, code, or National ID"
            />
          </span>
          <Button label="New Admission" icon="pi pi-plus" onClick={() => navigate('/students/new')} />
        </div>
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
      >
        <Column field="studentCode" header="Student Code" sortable />
        <Column field="firstName" header="First Name" sortable />
        <Column field="lastName" header="Last Name" sortable />
        <Column field="gradeName" header="Grade" />
        <Column field="sectionName" header="Section" />
        <Column field="rollNumber" header="Roll #" sortable />
        <Column field="nationalId" header="National ID" />
        <Column field="status" header="Status" body={statusBodyTemplate} />
        <Column header="Actions" body={actionsBodyTemplate} />
      </DataTable>

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
