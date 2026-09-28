# Project Run & Test Guide

This document contains setup, execution, and testing commands for the **Beginner Level**, **Intermediate Level**, and **Advanced Level** backend REST API projects.

---

## Service Ports & Links

| Level | Path | Default Port | Web Dashboard | Swagger API Docs | Test Command |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Beginner Level** | `Beginner Level` | `3001` | `http://localhost:3001` | `http://localhost:3001/api-docs` | `npm test` |
| **Intermediate Level** | `Intermediate Level` | `3002` | `http://localhost:3002` | `http://localhost:3002/api-docs` | `npm test` |
| **Advanced Level** | `Advanced Level` | `3003` | `http://localhost:3003` | `http://localhost:3003/api-docs` | `npm test` |

---

## 1. Beginner Level (Support Ticket API)

```bash
cd "Beginner Level"
npm run dev
```

- Web Interface: `http://localhost:3001`
- OpenAPI Specification: `http://localhost:3001/api-docs`
- Health Endpoint: `http://localhost:3001/health`
- Run Tests: `npm test`

---

## 2. Intermediate Level (E-Commerce & Inventory API)

```bash
cd "Intermediate Level"
npm run dev
```

- Web Interface: `http://localhost:3002`
- OpenAPI Specification: `http://localhost:3002/api-docs`
- Health Endpoint: `http://localhost:3002/health`
- Demo Users:
  - Customer: `customer@ecommerce.com` / `CustomerPass123!`
  - Admin: `admin@ecommerce.com` / `AdminPass123!`
- Run Tests: `npm test`

---

## 3. Advanced Level (Client Project Management API)

```bash
cd "Advanced Level"
npm run dev
```

- Web Interface: `http://localhost:3003`
- OpenAPI Specification: `http://localhost:3003/api-docs`
- Health Endpoint: `http://localhost:3003/health`
- Demo Users:
  - Agency Admin: `admin@agency.com` / `AdminPass123!`
  - Freelancer: `freelancer@agency.com` / `FreelancerPass123!`
  - Client: `client@acme.com` / `ClientPass123!`
- Run Tests: `npm test`

---

## Running Test Suites

To execute integration tests across all three projects:

```bash
cd "c:\Users\Admin\OneDrive\Desktop\Shadowfax task\Beginner Level" && npm test
cd "c:\Users\Admin\OneDrive\Desktop\Shadowfax task\Intermediate Level" && npm test
cd "c:\Users\Admin\OneDrive\Desktop\Shadowfax task\Advanced Level" && npm test
```
