# E-Commerce & Inventory Management API (Intermediate Level)

A modular RESTful backend application built with Node.js, Express, JWT authentication, and Role-Based Access Control (RBAC) to handle product catalog management, inventory stock tracking, shopping carts, and atomic order checkouts.

## Key Capabilities

- **Authentication & RBAC**: Stateless JWT auth with bcrypt password hashing. Differentiates access between `CUSTOMER` and `ADMIN` roles.
- **Product & Stock Control**: Public product catalog search/filter; Admin-only CRUD operations with inventory stock updates.
- **Cart & Order Workflows**: Real-time stock validation on cart modifications; atomic checkout flow that deducts stock count and clears cart in a single transaction.
- **Stock Restoration**: Order cancellation by an Admin automatically restores item stock levels back to the product inventory.
- **Documentation & Tests**: OpenAPI 3.0 (Swagger UI) served at `/api-docs` and full Jest integration test coverage.

## Project Structure

```
Intermediate Level/
├── src/
│   ├── config/database.js          # Persistent JSON database with default seeds
│   ├── middleware/
│   │   ├── auth.js                  # JWT and RBAC middleware
│   │   └── errorHandler.js          # Centralized error handler
│   ├── modules/
│   │   ├── auth/                    # Registration & login handlers
│   │   ├── products/                # Product catalog & stock CRUD
│   │   ├── cart/                    # Cart items & stock verification
│   │   └── orders/                  # Order placement & stock deduction
│   ├── utils/apiResponse.js
│   ├── app.js
│   └── server.js
├── public/index.html                # Web app interface
├── tests/ecommerce.test.js          # Integration tests
├── docs/
│   ├── swagger.yaml
│   └── postman_collection.json
├── package.json
└── README.md
```

## Demo Credentials

Upon startup, the database seeds default user accounts:

- **Admin Account**: `admin@ecommerce.com` / `AdminPass123!`
- **Customer Account**: `customer@ecommerce.com` / `CustomerPass123!`

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Server
```bash
npm run dev
```
The server runs on `http://localhost:3002`.
- Web App UI: `http://localhost:3002/`
- OpenAPI Swagger Docs: `http://localhost:3002/api-docs`

### 3. Run Automated Integration Tests
```bash
npm test
```

## API Endpoint Matrix

| Method | Endpoint | Access Control | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register customer or admin user |
| `POST` | `/api/auth/login` | Public | Login and receive Bearer token |
| `GET` | `/api/auth/me` | Authenticated | Get active user profile |
| `GET` | `/api/products` | Public | Search and filter products |
| `POST` | `/api/products` | `ADMIN` Only | Create product record |
| `PUT` | `/api/products/:id` | `ADMIN` Only | Update product details or stock |
| `DELETE` | `/api/products/:id` | `ADMIN` Only | Remove product |
| `GET` | `/api/cart` | Authenticated | Retrieve customer cart |
| `POST` | `/api/cart/items` | Authenticated | Add item with stock check |
| `PUT` | `/api/cart/items/:productId` | Authenticated | Update item quantity |
| `POST` | `/api/orders/checkout` | Authenticated | Place order & deduct stock |
| `GET` | `/api/orders` | Authenticated | List order records |
| `PATCH` | `/api/orders/:id/status` | `ADMIN` Only | Update order status |
