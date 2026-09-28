# Enterprise Requirement Brief: ClientPulse Management Platform

**Document Version:** 1.0.0  
**Target Architecture:** Production-Ready RESTful API Service  
**Target Roles:** Agency Admin (`AGENCY_ADMIN`), Freelancer/Developer (`FREELANCER`), Client Representative (`CLIENT`)

---

## 1. Executive Summary & Business Objective

Software agencies and freelance teams struggle with fragmented communication, milestone scope creep, manual deliverable review tracking, and delayed invoicing. **ClientPulse** is designed as a centralized, backend-driven platform to manage the complete lifecycle of client engagements:

1. **Client & Project Onboarding**: Maintain structured client profiles, budget allocation, and milestone contracts.
2. **Deliverable & Milestone Tracking**: Submit work deliverables linked to specific project milestones for formal client review.
3. **Automated Status Workflow & Invoicing**: When a deliverable is approved by a client, the milestone automatically transitions to `COMPLETED` and a formal milestone invoice is generated.
4. **Security & Audit Compliance**: Every critical action (status change, deliverable review, role modification) must create an immutable audit record for compliance and SLA tracking.

---

## 2. Stakeholder Personas & Access Matrix

| Role | Description | Access Rights & Responsibilities |
| :--- | :--- | :--- |
| **`AGENCY_ADMIN`** | Agency Management & Operations Lead | Full administrative access: manage client profiles, create projects & milestones, view audit logs, manage invoice payments, assign team members. |
| **`FREELANCER`** | Project Developer or Consultant | Assigned project access: submit deliverables for assigned milestones, update milestone status to `UNDER_REVIEW`. |
| **`CLIENT`** | External Client Stakeholder | Client portal access: view assigned project progress, review deliverables (`APPROVED` / `REVISION_REQUESTED`), view & track invoices. |

---

## 3. Core Functional Requirements & State Machine

### A. Authentication & Access Control
- JWT-based authentication with role verification (`AGENCY_ADMIN`, `FREELANCER`, `CLIENT`).
- Passwords must be hashed using `bcrypt` (minimum 10 salt rounds).
- Protected endpoints return `401 Unauthorized` if token is missing/expired and `403 Forbidden` if role permissions are insufficient.

### B. Client & Project Management
- **Clients**: Create and retrieve client profiles (Company Name, Contact Email, Industry, Billing Address).
- **Projects**: Create projects linked to a client with defined total budget, start date, and target deadline.
- **Progress Tracking**: Calculate project completion percentage based on ratio of completed milestones to total milestones.

### C. Milestone & Deliverable Lifecycle
- **Milestones**: Created with title, due date, billing amount, and status (`PLANNED`, `IN_PROGRESS`, `UNDER_REVIEW`, `COMPLETED`).
- **Deliverables**: Freelancers submit deliverables containing deliverable URL/notes for a milestone.
- **Client Review Workflow**:
  - `APPROVED`: Automatically updates milestone status to `COMPLETED` and triggers automated invoice generation.
  - `REVISION_REQUESTED`: Updates milestone status back to `IN_PROGRESS` and logs client feedback.

### D. Automated Invoicing & Billing
- Automated invoice creation upon milestone approval with invoice code (`INV-...`), amount, status (`UNPAID`), and due date.
- Admin endpoint to record invoice payment (`PAID`).

### E. Audit Logging & Compliance
- Every milestone update, deliverable submission, client review decision, and invoice generation creates an entry in `audit_logs` table recording:
  - `user_id`: Who performed the action
  - `action`: e.g. `DELIVERABLE_APPROVED`, `MILESTONE_COMPLETED`, `INVOICE_GENERATED`
  - `entity_type`: `MILESTONE` | `DELIVERABLE` | `INVOICE`
  - `entity_id`: Target record ID
  - `details`: Context JSON payload
  - `timestamp`: UTC ISO timestamp

---

## 4. Technical Constraints & Design Principles

- **Architecture**: Strict Separation of Concerns (Controller -> Service -> Repository -> Database).
- **Persistence**: Relational database storage with foreign key constraints and transactional consistency.
- **Validation**: Strict input payload sanitization and validation.
- **Error Handling**: Centralized error middleware with standardized JSON format (`{ success: false, message, errors }`).
- **Testing & Verification**: 100% automated integration test coverage via Jest and Supertest.
- **Documentation**: OpenAPI 3.0 (Swagger UI) at `/api-docs` and exported Postman collection.
