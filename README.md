# AeroShop: Full-Stack E-Commerce Application

AeroShop is a modern, responsive, and secure full-stack e-commerce web application featuring high-fidelity glassmorphic design, JWT-based user authentication, role-based authorization, a persistent shopping cart, transaction-safe product purchasing, and an administrative control panel.

## Features & Specifications

1. **User Authentication & Roles**:
   - Secure login and registration with hashed passwords (`bcryptjs`).
   - Role-Based Access Control: **Admins** manage inventory, update statuses, and elevate users. **Users** browse, add to cart, checkout, and track orders.
2. **Product Catalog**:
   - Live filtering by category, search queries (against names/descriptions), price/time sorting, and pagination.
   - Beautiful, visual stock warnings ("Only 3 left!", "Out of stock").
3. **Shopping Cart**:
   - Add, subtract, remove items with real-time stock-cap validations.
   - Live invoice calculations (Subtotal, 10% tax, and total).
   - Session persistence using `localStorage`.
4. **Fulfillment Checkout Flow**:
   - Form capturing address coordinates and contact phones.
   - Credit card checkout form with sandboxed mock client-side validation.
   - Atomicity through database transactions: Placing an order verifies stock availability and decrements inventory.
   - Visual progress timeline.
5. **Interactive Order Tracking**:
   - Users view their individual order log and track fulfillment statuses (`PENDING` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `CANCELLED`).
   - Users can cancel pending/processing orders to refund products back to database inventory.
6. **Admin Dashboard**:
   - **Products**: Full CRUD controls to add, edit, and delete products (equipped with instant category setup).
   - **Orders**: View all client orders, expand items, and update status.
   - **Users**: View user database and promote/demote administrator rights.

---

## Technical Stack

- **Frontend**: React.js, Vite, React Router, Lucide Icons, Vanilla CSS Theme.
- **Backend**: Node.js, Express.js.
- **Database**: SQLite with **Prisma ORM** (zero-configuration local file DB).
- **Security**: JWT tokens, HTTP Authorization headers, and bcrypt password hashing.

---

## Local Setup & Launch Instructions

Ensure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### 1. Run the Backend Server
```bash
# Navigate to the backend directory
cd backend

# Install Node dependencies
npm install

# Run database migrations (initializes SQLite dev.db file and seeds data automatically)
npm run prisma:migrate

# Start the Express server in development mode (watches file changes with nodemon)
npm run dev
```
The server will start listening on **`http://localhost:5000`**.

### 2. Run the Frontend Client
```bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the Vite React development server
npm run dev
```
The client will start running on **`http://localhost:5173`**. Open it in your web browser.

---

## Quick Demo Credentials

For immediate testing, use the pre-seeded credentials:

* **Regular User Account**:
  - **Email**: `user@example.com`
  - **Password**: `user123`
* **Administrator Account**:
  - **Email**: `admin@example.com`
  - **Password**: `admin123`

---

## API Endpoints Listing

### User Authentication (`/api/users`)
* `POST /register`: Registers new customer (role `USER`).
* `POST /login`: Validates credentials, returns JWT token.
* `GET /profile`: Retrieves logged-in user profile (requires Bearer JWT).
* `GET /`: Lists all registered users (requires Bearer JWT + ADMIN role).
* `PUT /:id/role`: Toggles user roles (requires Bearer JWT + ADMIN role).

### Catalog Inventory (`/api`)
* `GET /categories`: Lists all categories.
* `POST /categories`: Creates a new category (requires Bearer JWT + ADMIN role).
* `GET /products`: Fetches paginated catalog with query params (`?page=1&search=headphone&category=1&sort=price_asc`).
* `GET /products/:id`: Detailed view.
* `POST /products`: Adds a product (requires Bearer JWT + ADMIN role).
* `PUT /products/:id`: Edits a product (requires Bearer JWT + ADMIN role).
* `DELETE /products/:id`: Deletes a product (requires Bearer JWT + ADMIN role).

### Orders & Tracking (`/api/orders`)
* `POST /`: Places an order. Verifies stocks and decrements database volumes (requires Bearer JWT).
* `GET /my-orders`: Lists past orders for current customer (requires Bearer JWT).
* `GET /`: Lists all customer orders for fulfillment (requires Bearer JWT + ADMIN role).
* `PUT /:id/status`: Updates order state (requires Bearer JWT + ADMIN role).
* `PUT /:id/cancel`: Cancels an order and refunds items to stock (requires Bearer JWT).
