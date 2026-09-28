# Support Ticket Management API (Beginner Level)

A RESTful API built with Node.js and Express to handle customer support ticket workflows, input validation, status state transitions, and persistent storage.

## Features

- RESTful Endpoint Architecture (`GET`, `POST`, `PATCH`, `DELETE`).
- Input validation and payload sanitization middleware.
- Enforced business logic (resolution notes required on resolve/close, state lock on closed tickets).
- Zero-dependency file-based persistent storage with test isolation.
- Interactive OpenAPI 3.0 (Swagger UI) documentation.
- Automated integration test suite using Jest and Supertest.

## Directory Structure

```
Beginner Level/
├── src/
│   ├── config/database.js         # Persistence layer
│   ├── controllers/ticketController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validateTicket.js
│   ├── models/ticketModel.js
│   ├── routes/ticketRoutes.js
│   ├── services/ticketService.js
│   ├── utils/apiResponse.js
│   ├── app.js
│   └── server.js
├── public/index.html              # Web dashboard UI
├── tests/tickets.test.js          # Jest test suite
├── docs/
│   ├── swagger.yaml               # OpenAPI specification
│   └── postman_collection.json    # Postman export
├── package.json
└── README.md
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The API server will listen on `http://localhost:3001`.
- Web Dashboard: `http://localhost:3001/`
- OpenAPI Swagger Docs: `http://localhost:3001/api-docs`
- Health Endpoint: `http://localhost:3001/health`

### 3. Run Automated Integration Tests
```bash
npm test
```

## API Endpoints Summary

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tickets` | Create a new support ticket | `201 Created` |
| `GET` | `/api/tickets` | List tickets with filters (`status`, `priority`, `category`) and pagination | `200 OK` |
| `GET` | `/api/tickets/:id` | Get ticket details by ID | `200 OK` |
| `GET` | `/api/tickets/code/:code` | Get ticket details by ticket code (`TCK-...`) | `200 OK` |
| `PATCH` | `/api/tickets/:id/status` | Update ticket status and resolution notes | `200 OK` |
| `DELETE` | `/api/tickets/:id` | Remove a ticket record | `200 OK` |
