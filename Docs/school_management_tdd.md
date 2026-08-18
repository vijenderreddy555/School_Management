# Technical Design Document

**Project Name:** School Management Application — Student Information & Admission Management  
**Version:** 1.0  
**Tech Stack:** ASP.NET Core 8 Web API, PostgreSQL, React.js, Tailwind CSS  

---

### 2. Technical Stack & Justification
* **2.1 Core Framework:** C# 12, .NET 8 / ASP.NET Core Web API (High performance, strong typing, clean architecture)
* **2.2 State Management & Data Fetching:** TanStack Query (React Query) v5 (Server state caching, async handling, automatic re-fetching)
* **2.3 Build Tool & Dev Server:** .NET CLI (Backend) / Vite (Frontend)
* **2.4 UI Component Library:** PrimeReact / Radix UI with Tailwind CSS (Accessible WCAG 2.1 AA compliant elements, high-performance DataTables)
* **2.5 Routing:** React Router v6
* **2.6 Form Management & Validation:** React Hook Form + Zod (Strict schema validation aligned with FRD field specifications)
* **2.7 Utility Libraries & Drivers:** Entity Framework Core 8 (ORM), Npgsql (PostgreSQL provider), FluentValidation (Backend DTO validation), AutoMapper (DTO projection), Axios (HTTP Client)

---

### 3. Application Architecture & Pattern
* **3.1 Design Pattern:** Clean Architecture / Layered Architecture (`Api` -> `Application` -> `Domain` -> `Infrastructure`)
* **3.2 State Management Flow:** REST API -> Axios -> TanStack Query -> React Hook Form -> PrimeReact Components
* **3.3 Authentication & Access Control:** JWT (JSON Web Tokens) with Role-Based Access Control (RBAC) enforcing `REGISTRAR`, `ADMISSIONS_ADMIN`, `SYSTEM_ADMIN`, and `TEACHER` scopes.
* **3.4 Project Folder Structure:**
    * **Backend:** `SchoolMgmt.Api/Controllers`, `SchoolMgmt.Application/Services`, `SchoolMgmt.Application/DTOs`, `SchoolMgmt.Domain/Entities`, `SchoolMgmt.Infrastructure/Persistence`
    * **Frontend:** `src/components`, `src/services`, `src/hooks`, `src/pages`, `src/types`, `src/validators`
* **3.5 Coding Standards:** PascalCase for C# classes/properties, camelCase for JSON fields/TypeScript variables, EF Core Fluent API for entity configurations.

---

### 4. Database Design (ER Model & Relations)
**[HIGH PRIORITY 1: Data Integrity]**

#### 4.1 Table: `academic_years`
* `id` (PK, UUID)
* `code` (String, Unique, e.g., "AY-2026")
* `start_date` (Date, Not Null)
* `end_date` (Date, Not Null)
* `is_active` (Boolean, Default: True)

#### 4.2 Table: `grades`
* `id` (PK, UUID)
* `name` (String, Max 50, e.g., "Grade 10")
* `code` (String, Unique, Max 20)

#### 4.3 Table: `sections`
* `id` (PK, UUID)
* `grade_id` (FK -> `grades.id`, Not Null)
* `name` (String, Max 10, e.g., "Section A")
* `capacity` (Integer, Default: 40)
* `enrolled_count` (Integer, Default: 0)

#### 4.4 Table: `guardians`
* `id` (PK, UUID)
* `full_name` (String, Max 100, Not Null)
* `relationship` (Enum: `FATHER`, `MOTHER`, `LEGAL_GUARDIAN`, `OTHER`)
* `mobile_phone` (String, Max 15, Not Null)
* `email_address` (String, Max 100)
* `address` (Text)

#### 4.5 Table: `students`
* `id` (PK, UUID)
* `student_code` (String, Unique, Formatted: `STU-YYYY-XXXXXX`)
* `first_name` (String, Max 50, Not Null)
* `last_name` (String, Max 50, Not Null)
* `date_of_birth` (Date, Not Null)
* `gender` (Enum: `MALE`, `FEMALE`, `NON_BINARY`, `PREFER_NOT_TO_SAY`)
* `national_id` (String, Unique, Max 20, Not Null)
* `academic_year_id` (FK -> `academic_years.id`, Not Null)
* `grade_id` (FK -> `grades.id`, Not Null)
* `section_id` (FK -> `sections.id`, Not Null)
* `roll_number` (Integer, Not Null)
* `primary_guardian_id` (FK -> `guardians.id`, Not Null)
* `emergency_contact_no` (String, Max 15, Not Null)
* `blood_group` (Enum: `A_PLUS`, `A_MINUS`, `B_PLUS`, `B_MINUS`, `O_PLUS`, `O_MINUS`, `AB_PLUS`, `AB_MINUS`, `UNKNOWN`)
* `medical_alerts` (Text)
* `status` (Enum: `ENROLLED`, `ACTIVE`, `INACTIVE`, `TRANSFERRED`, `SUSPENDED`, `GRADUATED`)
* `created_at` (Timestamp, Default: UTC Now)
* `updated_at` (Timestamp, Default: UTC Now)

#### 4.6 Table: `student_documents`
* `id` (PK, UUID)
* `student_id` (FK -> `students.id`, On Delete Cascade)
* `document_type` (Enum: `BIRTH_CERTIFICATE`, `ADDRESS_PROOF`, `PASSPORT`, `OTHER`)
* `file_url` (String, Not Null)
* `file_size_mb` (Decimal, Max 5.0)
* `uploaded_at` (Timestamp, Default: UTC Now)

#### 4.7 Table: `student_status_history`
* `id` (PK, UUID)
* `student_id` (FK -> `students.id`)
* `previous_status` (Enum)
* `new_status` (Enum)
* `change_reason` (Text, Not Null)
* `changed_by_user_id` (UUID, Not Null)
* `timestamp` (Timestamp, Default: UTC Now)

---

### 5. API Specifications (The Integration Contract)
**[HIGH PRIORITY 2: Frontend-Backend Alignment]**

#### 5.1 Base URL: `/api/v1`

#### 5.2 Endpoints

**1. Register New Student (Write - Core Flow)**
* **Method:** `POST`
* **Path:** `/students`
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body (CreateStudentDto):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2012-05-14",
  "gender": "MALE",
  "nationalId": "NAT-98765432",
  "academicYearId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "gradeId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
  "sectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
  "primaryGuardian": {
    "fullName": "Robert Doe",
    "relationship": "FATHER",
    "mobilePhone": "+12345678901",
    "emailAddress": "robert.doe@example.com"
  },
  "emergencyContactNo": "+12345678901",
  "bloodGroup": "O_PLUS",
  "medicalAlerts": "Penicillin allergy"
}
```
* **Success Response (201 Created):** Returns generated `studentId`, `studentCode`, assigned `rollNumber`, and `status`.
* **Error Response (400 Bad Request / 409 Conflict):** Triggered on age boundary failure or duplicate `nationalId`.

**2. Upload Student Verification Document (Write)**
* **Method:** `POST`
* **Path:** `/students/{studentId}/documents`
* **Content-Type:** `multipart/form-data`
* **Form Fields:** `file` (Binary), `documentType` (String)
* **Success Response (201 Created):** Returns document URL and metadata.
* **Error Response (400 Bad Request):** If file size > 5 MB or extension is not `.pdf`, `.png`, or `.jpeg`.

**3. Search Student Directory (Read)**
* **Method:** `GET`
* **Path:** `/students`
* **Query Params:** `searchQuery`, `gradeId`, `sectionId`, `academicYearId`, `status`, `pageNumber`, `pageSize`
* **Success Response (200 OK):** Paginated JSON array containing summary records for matching students.

**4. Update Student Status / Reassign Section (Write)**
* **Method:** `PUT`
* **Path:** `/students/{studentId}/status`
* **Request Body (UpdateStudentStatusDto):**
```json
{
  "newStatus": "TRANSFERRED",
  "targetSectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa9",
  "changeReason": "Relocated to another district"
}
```
* **Success Response (200 OK):** Returns updated student status and records entry in `student_status_history`.
* **Error Response (422 Unprocessable Entity):** If target section capacity is reached.

---

### 6. Frontend UI Component Mapping
**[HIGH PRIORITY 3: Exact Value Accuracy]**

| Feature / Field | PrimeReact / UI Component | Logic & Form Validation Constraint |
| :--- | :--- | :--- |
| **First/Last Name** | `InputText` | Bound to `react-hook-form` + Zod; Alpha characters only, max 50 chars. |
| **Date of Birth** | `Calendar` | Range restricted; calculates age (3 to 20 years) relative to Academic Year start date. |
| **Gender & Blood Group** | `Dropdown` | Single select mapping to Enum types. |
| **National ID Number** | `InputText` | Regex constraint `^[A-Z0-9-]{8,20}$`; triggers debounced uniqueness check on blur. |
| **Grade & Section** | `Dropdown` | Dynamic cascading selection; Section list filters based on selected Grade and seat capacity. |
| **Guardian Phone** | `InputText` | Enforces E.164 phone format regex `^\+?[1-9]\d{1,14}$`. |
| **Document Upload** | `FileUpload` | Restricted to `.pdf`, `.png`, `.jpeg` with client-side file size check <= 5 MB. |
| **Student Directory** | `DataTable` | Displays student list with server-side pagination, sorting, and debounced global search. |
| **Status Update Dialog** | `Dialog` | Requires non-empty `changeReason` before enabling submission. |

---

### 7. Security & Performance
* **7.1 Authentication & Data Security:**
    * JWT authentication with explicit role-based policy attributes (`[Authorize(Roles = "REGISTRAR,SYSTEM_ADMIN")]`).
    * Sensitive attributes (`national_id`, `medical_alerts`) encrypted at rest via PostgreSQL transparent data protection / AES-256 and restricted in field-level API serialization schemas based on caller permissions.
    * All API traffic encrypted in transit via TLS 1.3.
* **7.2 Data Integrity & Concurrency:**
    * Unique composite database index on `(academic_year_id, grade_id, section_id, roll_number)` prevents duplicate roll numbers under concurrent registrations.
    * Section allocation performed inside isolated PostgreSQL serializable database transactions to ensure seat capacities are respected.
* **7.3 Performance Targets:**
    * **Form Submissions:** Completed within <= 1.5 seconds under normal operational load.
    * **Directory Search:** Indexed query execution on `(national_id)`, `(first_name, last_name)`, and `(grade_id, section_id)` ensuring sub-800 ms response times for database size up to 100,000 active profiles.
* **7.4 Validation Layer:** Dual-layer validation via Zod schemas on the React client and FluentValidation middleware on the ASP.NET Core pipeline.

---

### 8. Implementation Roadmap (For Engineering / Copilot)

1. **Step 1: Database & Persistence Layer:** Define EF Core DbContext, PostgreSQL entity models, Fluent API configurations (indexes, keys, constraints), and run initial Entity Framework migrations for `students`, `guardians`, `sections`, `student_documents`, and `student_status_history`.
2. **Step 2: Core Application Services & Validations:** Implement `StudentService` with logic for auto-generating `student_code` (`STU-YYYY-XXXXXX`), atomic roll number computation, and section capacity checks. Add FluentValidation handlers for incoming DTOs.
3. **Step 3: Web API Controllers & Storage:** Build `StudentsController` exposing endpoint contracts (`POST /students`, `GET /students`, `PUT /students/{id}/status`). Integrate cloud document storage (S3 / Blob storage) for file handling (`POST /students/{id}/documents`).
4. **Step 4: Frontend UI & Integration:** Construct React form pages using React Hook Form, Zod schemas, PrimeReact controls, and TanStack Query. Ensure accessibility (WCAG 2.1 AA keyboard navigation) and integrate API error notifications.
