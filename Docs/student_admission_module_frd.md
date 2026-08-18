# Functional Requirements Document (FRD)

**Module Name:** Student Information & Admission Management  
**Application Name:** School Management Application  
**Document Version:** 1.0  
**Status:** Draft  

---

## 1. Introduction

### 1.1 Purpose of Documentation
This Functional Requirements Document (FRD) defines the functional, operational, and system-level specifications for the **Student Information & Admission Management** module within the custom School Management Application. It serves as the baseline for engineering, quality assurance, and product validation teams to implement and verify end-to-end enrollment, profile maintenance, and academic record management.

### 1.2 Problem Statement
Educational institutions frequently rely on fragmented paper records or disconnected legacy systems to register students, update emergency contacts, manage class section assignments, and store academic documents. This fragmentation leads to:
* High operational overhead during peak admission cycles.
* Data discrepancies across administration, finance, and academic departments.
* Lack of real-time visibility into enrollment capacity, demographic distribution, and student status changes (e.g., transfers, suspensions, graduations).

### 1.3 High Level User Stories
* **US-01 (School Registrar):** As a Registrar, I want to capture new student registration details and upload mandatory verification documents so that candidates are formally enrolled into the application.
* **US-02 (Admissions Officer):** As an Admissions Officer, I want to review submitted applications, verify documents, and assign roll numbers/sections so that incoming students are properly placed.
* **US-03 (System Administrator):** As a System Administrator, I want to manage student status transitions (Active, Inactive, Transferred, Suspended, Graduated) with complete audit logging to maintain regulatory compliance.
* **US-04 (Parent/Guardian):** As a Parent/Guardian, I want to view my child’s updated profile and update emergency contact information so that school authorities always have accurate contact info.

### 1.4 Objectives of the Solution
* **Centralization:** Maintain a unified single source of truth for all student demographic, guardian, and enrollment records.
* **Automation:** Streamline student onboarding, section allocation, and roll number generation.
* **Data Integrity:** Enforce strict field-level validation, mandatory document attachment checks, and duplicate detection mechanisms.
* **Auditability:** Log all modifications to sensitive student attributes (e.g., identity proof numbers, medical alerts, academic standing).

### 1.5 Out of Scope
* Direct payment gateway processing for admission/tuition fees (handled by the Finance/Billing Module).
* Timetable generation and classroom seating allocations (handled by the Academic Scheduling Module).
* Transportation route assignment and bus tracking (handled by the Logistics/Fleet Module).

### 1.6 Risks and Assumptions
* **Assumptions:**
  * Academic Year schedules and Class/Section masters are configured prior to opening student registration.
  * System Users (Registrars, Teachers, Admins) are provisioned via enterprise Single Sign-On (SSO) or Role-Based Access Control (RBAC).
* **Risks:**
  * Bulk student data ingestion from legacy CSVs may contain formatted invalid birth dates or duplicate national identifiers.
  * Unexpected spikes in application submissions on registration deadline days may impact database write performance if indexing is misconfigured.

---

## 2. System / Solution Overview

### 2.3 Dependencies and Change Impacts

#### 2.3.1 External Dependencies
* **SMS & Email Gateway Integration:** Required for sending registration acknowledgment, profile verification links, and enrollment updates to guardians.
* **Cloud Object Storage (Amazon S3 / Blob Storage):** Required for storing scanned student identity cards, medical certificates, and birth records.

#### 2.3.2 Internal Dependencies
* **Academic Master Data Module:** Supplies active Academic Years, Grade Levels, and Section configurations.
* **User & Role Management Module:** Dictates permission hierarchies for Write/Read privileges on student records.

#### 2.3.3 External Change Impacts
* Modifications to third-party SMS/Email API standards will require updates to notification hooks during student status transitions.

#### 2.3.4 Internal Change Impacts
* Updates to Class or Section structures in the Academic Master Module must validate existing active student assignments to prevent orphaned records.

---

## 3. Functional Specifications

### 3.1 Module Name: Student Information & Admission Management

#### 3.1.1 Use Cases

##### Use Case 1: New Student Registration & Admission

| Section | Description |
| :--- | :--- |
| **Goal** | Successfully register a new student, validate required documents, allocate Class/Section, and issue a unique Student ID. |
| **Actors (Write Access)** | School Registrar, Admissions Officer |
| **Actors (Read Access)** | School Registrar, Admissions Officer, System Administrator, Class Teacher |
| **Pre-Conditions** | 1. User is authenticated and possesses active `REGISTRAR` or `ADMISSIONS_ADMIN` permissions.<br>2. Target Academic Year, Grade, and Section exist in active states. |
| **Steps** | 1. User navigates to **Student Management > New Admission**.<br>2. User completes Demographic, Guardian, Emergency, and Medical detail forms.<br>3. User uploads required verification documents (Birth Certificate, Address Proof).<br>4. User selects target Grade Level and Section.<br>5. System runs duplicate check against National ID / Birth Certificate number.<br>6. System validates field formats and mandatory constraints.<br>7. User clicks **Submit Admission**.<br>8. System generates unique System Student ID and assigned Roll Number.<br>9. System updates status to `Enrolled` and stores audit record. |
| **Post-Conditions** | Student record is persisted in `Active` status, assigned to designated Section, and accessible across academic workflows. |
| **Summary** | Captures all required student parameters, validates uniqueness, uploads verification attachments, and assigns academic placement. |

##### Use Case 2: Student Status Update & Section Transfer

| Section | Description |
| :--- | :--- |
| **Goal** | Modify an existing student’s operational status (e.g., Active to Transferred/Suspended) or reassign Class/Section. |
| **Actors (Write Access)** | System Administrator, School Registrar |
| **Actors (Read Access)** | All Authorized Staff Roles |
| **Pre-Conditions** | 1. Student profile exists in `Active` or `On Hold` state.<br>2. Destination Section (if transferring) has available seat capacity. |
| **Steps** | 1. User searches for student profile by System Student ID or Name.<br>2. User selects **Actions > Change Status / Reassign Section**.<br>3. User selects target status/section and inputs mandatory reason for change.<br>4. System verifies that student has no blocking administrative flags.<br>5. User clicks **Confirm Update**.<br>6. System updates student master table and logs historical record in `Student_Status_History`. |
| **Post-Conditions** | Student reflects updated status/section across all linked class rosters and reports. |
| **Summary** | Allows administrative modifications to student placement and lifecycle status with strict audit logging. |

---

### 3.2.2 Functional Requirements

* **FR-01 (Unique Student Identification):** The system shall auto-generate an immutable, system-wide unique Student Identification Number (`STUDENT_ID`) upon creation, formatted as `STU-[YYYY]-[6-Digit Sequence]` (e.g., `STU-2026-000101`).
* **FR-02 (Duplicate Record Prevention):** The system shall perform pre-submission validation against `National Identity Number` and `Birth Certificate Number` to prevent dual enrollment of the same individual.
* **FR-03 (Mandatory Guardian Mapping):** Every student record must be linked to at least one primary Guardian profile containing full name, relationship type, phone number, and primary address.
* **FR-04 (Document Attachment Handling):** The system shall require PDF, PNG, or JPEG file attachments for identity and residence proof, enforcing a maximum file size limit of 5 MB per document.
* **FR-05 (Roll Number Allocation):** The system shall automatically compute or allow manual entry of Section Roll Numbers, ensuring no duplicate roll numbers exist within the same Grade/Section/Academic Year combination.
* **FR-06 (Audit Logging):** All creation, field updates, status changes, and section transfers must log the performing User ID, Timestamp, Old Value, New Value, and Change Reason.

---

### 3.2.3 Field Level Specifications

#### 3.2.3.1 Form Elements

| Field Label | Field Type | Mandatory | Field Length | Data Type | Value Set | Default Value | Data Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **First Name** | Text Input | Yes | 50 chars | String | Alpha (A-Z, a-z, spaces) | None | User Input |
| **Last Name** | Text Input | Yes | 50 chars | String | Alpha (A-Z, a-z, spaces) | None | User Input |
| **Date of Birth** | Datepicker | Yes | 10 chars | Date | YYYY-MM-DD (Age 3-20) | None | User Input |
| **Gender** | Dropdown | Yes | N/A | Enum | `Male`, `Female`, `Non-Binary`, `Prefer Not To Say` | Select | System Master |
| **National ID Number** | Text Input | Yes | 20 chars | Alphanumeric | Regex `^[A-Z0-9-]{8,20}$` | None | User Input |
| **Academic Year** | Dropdown | Yes | N/A | String | Active Academic Years | Current Year | Academic Master |
| **Grade Level** | Dropdown | Yes | N/A | String | Configured Grades | Select | Academic Master |
| **Section** | Dropdown | Yes | N/A | String | Active Sections for Grade | Select | Academic Master |
| **Roll Number** | Numeric Input| No | 3 digits | Integer | 1 to 999 | Auto-computed | System Computed |
| **Primary Guardian Name** | Text Input | Yes | 100 chars | String | Alpha (A-Z, a-z, spaces) | None | User Input |
| **Guardian Relationship** | Dropdown | Yes | N/A | Enum | `Father`, `Mother`, `Legal Guardian`, `Other` | Select | System Master |
| **Guardian Mobile Phone**| Phone Input | Yes | 15 chars | String | Regex `^\+?[1-9]\d{1,14}$` | None | User Input |
| **Guardian Email Address**| Email Input | No | 100 chars | String | Standard Email Regex | None | User Input |
| **Emergency Contact No**| Phone Input | Yes | 15 chars | String | Regex `^\+?[1-9]\d{1,14}$` | None | User Input |
| **Blood Group** | Dropdown | No | N/A | Enum | `A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-` | Unknown | System Master |
| **Medical Alerts** | Textarea | No | 500 chars | String | Free Text | None | User Input |
| **Birth Certificate Doc**| File Upload | Yes | Max 5 MB | File | `.pdf`, `.png`, `.jpeg` | None | User File |

#### 3.2.3.2 Business Rules and Dependencies

| Field Label | Validation / Business Rule | Error Message | Data Dependencies | Additional Info / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Date of Birth** | Must result in an age between 3.0 and 20.0 years as of the Academic Year start date. | "Student age must be between 3 and 20 years for the selected Academic Year." | `Academic Year` start date | Prevents invalid enrollment ages. |
| **National ID Number** | Must be unique across all existing records in the system database. | "A student record with this National ID already exists." | Master DB database index | Triggered on field blur and submit. |
| **Section** | Option list dynamically filters based on selected Grade Level. Available seat count must be > 0. | "Selected section has reached maximum enrollment capacity." | `Grade Level`, `Section Master` | Prevents section over-allocation. |
| **Roll Number** | Must be unique within the specific Academic Year + Grade Level + Section scope. | "Roll Number already assigned to another student in this section." | `Academic Year`, `Grade Level`, `Section` | Checked during submission. |
| **Guardian Mobile Phone**| Must follow valid E.164 international phone number format. | "Please enter a valid mobile phone number." | None | Used for SMS alerts. |

#### 3.2.3.3 Buttons, Links, and Icons

| Button / Link / Icon Name | Tooltip | Visible | Enable / Disable Condition | Navigate To | Validations | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Submit Admission** | Submit Form | Always | Enabled when all mandatory fields are valid | Student View Screen | Form Validations | All mandatory fields |
| **Save as Draft** | Save Progress | Always | Enabled when at least First Name and Last Name are populated | Draft Application List | Minimal Syntax Check | Name Fields |
| **Cancel** | Discard Changes | Always | Always Enabled | Student List View | Confirmation Prompt | None |
| **Upload Document** | Attach File | Always | Enabled if file size <= 5 MB and format allowed | Modal Dialog | File type / Size | Client-side File Checker |
| **Reassign Section** | Change Section | Details View | Enabled only for `REGISTRAR` and `ADMIN` roles | Reassign Section Modal | Capacity Check | Section Seat Master |

#### 3.2.3.4 Inputs and Outputs

| Input Data | Output Generated | Dependency | Dependency Criteria | Remarks |
| :--- | :--- | :--- | :--- | :--- |
| Student Demographics & Documents | New Student Master Entry | DB Persistence Layer | Successful validation of all field constraints | Generates immutable `STUDENT_ID` |
| Grade & Section Selection | Updated Class Roster & Capacity Count | Academic Master | Target section seat count decrement | Capacity decremented in atomic transaction |
| Status Change (`Active` -> `Transferred`)| Inactive Roster Status & Audit Entry | Audit Logger | Authorization check & required change reason | Releases seat capacity in original section |

---

### 3.3 Non-Functional Requirements

#### 3.3.1 Performance
* **Response Time:** Form submittal and validation check operations shall complete within <= 1.5 seconds under normal load conditions.
* **Search Execution:** Student directory searches using Name or Student ID shall yield results within <= 800 ms for records up to 100,000 active profiles.

#### 3.3.2 Security
* **Data Encryption:** All sensitive personal data (e.g., National Identification Numbers, Medical Alerts) must be encrypted at rest using AES-256 and in transit using TLS 1.3.
* **Access Control:** Role-Based Access Control (RBAC) must restrict field-level visibility; Medical Alerts and National ID details are only visible to authorized administrative roles.

#### 3.3.3 Accessibility
* **Compliance:** Web interfaces must comply with **WCAG 2.1 Level AA** standards.
* **Keyboard Navigation:** All form fields, file uploads, and action buttons must be fully navigable via keyboard controls (Tab/Shift+Tab/Enter/Space).

#### 3.3.4 Scalability
* **Horizontal Scaling:** The module services must support stateless deployment in containerized environments to handle seasonal concurrent admission peaks of up to 500 simultaneous user sessions.

---

### 3.4 Possible Edge Cases and How to Handle Them

| Edge Case | Frequency of Occurrence | Solution Possible (Yes/No) | Solution if Applicable | Workaround if Solution Not Possible |
| :--- | :--- | :--- | :--- | :--- |
| Concurrent submission causes duplicate Roll Number assignment in the same section. | Low | Yes | Enforce a unique database index constraint across `(academic_year_id, grade_id, section_id, roll_number)` and execute auto-increment in an isolated database transaction. | N/A |
| Student does not possess a National Identity Number (e.g., international student). | Low | Yes | Provide a toggle checkbox "International Student / No National ID", requiring Passport Number as an alternative mandatory identity proof. | N/A |
| Uploaded document file is corrupted or unreadable. | Medium | Yes | Implement client-side and server-side MIME type inspection and image rendering check prior to saving form state. | Admin manually requests document re-upload via parent communication channel. |
| Student is readmitted after being previously marked as `Transferred` or `Graduated`. | Low | Yes | System detects historical National ID match during registration and prompts admin to "Reactivate / Readmit" existing record rather than creating a duplicate entity. | Manual database merge performed by System Administrator. |

---

## 4. Appendix / Glossary

### 4.1 Definitions
* **Student Identification Number (`STUDENT_ID`):** An immutable, unique system-generated alphanumeric code assigned to each student upon initial registration.
* **Roll Number:** A sequential integer assigned to a student within a specific Grade Level and Section for an Academic Year.

### 4.2 Acronyms
* **FRD:** Functional Requirements Document
* **RBAC:** Role-Based Access Control
* **UI:** User Interface
* **E.164:** International Public Telecommunication Numbering Plan Format

### 4.3 Abbreviations
* **N/A:** Not Applicable
* **DB:** Database
* **MB:** Megabyte

### 4.4 References
* Enterprise Educational Data Governance Guidelines v2.4
* WCAG 2.1 Accessibility Guidelines (Level AA Standard)

### 4.5 Related Documents
* Academic Master Module System Architecture Specification
* User Management & Security Policy Document

---

## 5. Open Questions

| Item # | Open Question / Ambiguity | Impacted Section | Stakeholder / Owner | Proposed Resolution Path |
| :--- | :--- | :--- | :--- | :--- |
| **OQ-01** | Should the system allow custom auto-generation logic for Roll Numbers (e.g., alphabetical by Last Name vs. chronological by registration date)? | Section 3.2.3.1 (Roll Number) | School Operations / Registrar | Convene stakeholder review to decide if roll number generation logic should be configurable per school branch. |
| **OQ-02** | Is physical address verification required via third-party maps API, or is manual text input sufficient? | Section 3.2.3.1 (Form Elements) | Technical Lead / Business Analyst | Determine API cost vs. data quality trade-off for automated address validation. |
| **OQ-03** | How should the system handle mid-year section balance adjustments when a student drops out? Should roll numbers be re-sequenced automatically? | Section 3.1.1 (Use Case 2) | Academic Committee | Confirm whether automatic roll number re-sequencing affects historical attendance and grade records. |

---

## Summary of Self-Review & Coverage Assessment

* **Coverage Assessment:** All core requirements for the **Student Information & Admission Management** module have been detailed according to the requested framework structure. All user flows, functional requirements, field-level data dictionaries, button mappings, non-functional requirements, edge cases, and open questions are fully represented without external dependencies or placeholder text.
* **Validation & Business Logic:** Field types, character constraints, Regex validations, and capacity dependencies have been defined across all form elements and business rules to ensure technical alignment between business analysis and backend implementation teams.
* **Completeness:** Excluded sections (Business Process Model, Activity Flow, Role Matrix, Wireframes) were deliberately omitted per prompt instructions, while maintaining full integrity across all remaining mandatory sections.
