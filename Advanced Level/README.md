# Client Project & Milestone Management API (Advanced Level)

A requirement-driven backend REST API designed for managing agency client onboarding, project milestone contracts, deliverable reviews, automated invoicing, and compliance audit logging.

## Business Requirements Overview

Derived from the client brief ([`REQUIREMENT_BRIEF.md`](file:///c:/Users/Admin/OneDrive/Desktop/Shadowfax%20task/Advanced%20Level/REQUIREMENT_BRIEF.md)):
- **Multi-Role RBAC**: Enforces distinct access for `AGENCY_ADMIN`, `FREELANCER`, and `CLIENT` personas.
- **Milestone & Deliverable Lifecycle**: Freelancers submit deliverables linked to milestones (`UNDER_REVIEW`). Clients conduct formal reviews (`APPROVED` or `REVISION_REQUESTED`).
- **Automated Invoicing**: Deliverable approval automatically marks the milestone `COMPLETED` and generates a formal invoice record (`INV-...`).
- **Compliance Audit Logging**: All status transitions, deliverable submissions, and invoice creations record immutable entries in `audit_logs`.

## Architecture & Layout

```
Advanced Level/
├── REQUIREMENT_BRIEF.md            # Client specification document
├── DEPLOYMENT_GUIDE.md             # Hosting and submission guide
├── src/
│   ├── config/database.js          # Persistent JSON database with default seeds
│   ├── middleware/auth.js          # JWT authentication & role enforcement
│   ├── middleware/errorHandler.js  # Global error handling
│   ├── services/auditService.js    # Audit log recorder
│   ├── modules/
│   │   ├── auth/                   # Authentication handlers
│   │   ├── clients/                # Client profile onboarding
│   │   ├── projects/               # Projects & milestone planning
│   │   ├── deliverables/           # Deliverable submission & client reviews
│   │   ├── invoices/               # Automated invoicing & payments
│   │   └── audit/                  # Audit trail reader
│   ├── utils/apiResponse.js
│   ├── app.js
│   └── server.js
├── public/index.html               # Project portal interface
├── tests/advanced.test.js          # Integration test suite
├── docs/
│   ├── swagger.yaml
│   └── postman_collection.json
├── package.json
└── README.md
```

## Demo Accounts

The system seeds three default accounts:

- **Agency Admin**: `admin@agency.com` / `AdminPass123!`
- **Freelancer**: `freelancer@agency.com` / `FreelancerPass123!`
- **Client User**: `client@acme.com` / `ClientPass123!`

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The API server listens on `http://localhost:3003`.
- Web Interface: `http://localhost:3003/`
- OpenAPI Swagger Docs: `http://localhost:3003/api-docs`

### 3. Run Automated Integration Tests
```bash
npm test
```

## Primary Routes Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `POST` | `/api/clients` | `AGENCY_ADMIN` | Register new client profile |
| `POST` | `/api/projects` | `AGENCY_ADMIN` | Create project linked to client |
| `GET` | `/api/projects/:id` | Authenticated | View project & progress percentage |
| `POST` | `/api/projects/:id/milestones` | `AGENCY_ADMIN` | Add milestone to project |
| `POST` | `/api/milestones/:id/deliverables` | `FREELANCER`, `AGENCY_ADMIN` | Submit deliverable for milestone |
| `POST` | `/api/deliverables/:id/review` | `CLIENT`, `AGENCY_ADMIN` | Review deliverable (`APPROVED` auto-generates invoice) |
| `GET` | `/api/invoices` | `AGENCY_ADMIN`, `CLIENT` | List generated milestone invoices |
| `GET` | `/api/audit-logs` | `AGENCY_ADMIN` | View security & compliance audit logs |
