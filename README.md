# Web-Based Banking System

**Academic Demonstration Project**  
**Student Name:** Athukorala A A C P  
**Student ID:** IT22139962  
**Project Type:** Individual University Project  

---

## 📌 Project Overview

The **Web-Based Banking System** is a full-stack financial management demonstration web application developed using the **MERN** technology stack (MongoDB, Express.js, React.js, Node.js). 

This platform simulates real-world core banking operations in an isolated, secure environment, featuring:
- Role-Based Access Control (RBAC) with 4 distinct user tiers.
- Atomic double-entry demo fund transfers.
- Real-time transaction history, tracking, and reference search.
- Multi-tier customer support ticket and complaint escalation workflow.
- Internal notification logging for security and customer visibility.

> [!IMPORTANT]
> **Academic Demonstration Notice:**  
> This system is strictly an academic demonstration project and does **NOT** connect to real bank networks, payment gateways, or transfer actual fiat currency. All monetary balances, accounts, and transactions are purely simulated data.

---

## 🚀 Key Features

### 1. Banking Transaction Management (Core Module)
- **Atomic Fund Transfers:** Atomic transactions ensure money is deducted from the sender and credited to the receiver simultaneously.
- **Reference Number Generation:** Format `TXN-YYYYMMDD-XXXXXX` generated systematically with uniqueness constraints.
- **Audit-Proof Immutability:** No customer or staff delete actions allowed on completed transaction ledgers.
- **Transaction Search & Filter:** Instant lookups via unique reference numbers, status (SUCCESSFUL, PENDING, FAILED), date ranges, or transaction direction (Sent vs. Received).

### 2. Role-Based Access Control (RBAC)
- **CUSTOMER:** View balances, execute transfers, inspect transaction ledgers, file complaints, monitor status, and view notifications.
- **CUSTOMER_SERVICE_OFFICER:** Manage assigned customer grievances, update inquiry statuses, log internal staff notes, and escalate complex cases.
- **BANK_MANAGER:** Supervise escalated tickets, review departmental reports, attach manager directives, and track complaint statistics.
- **SYSTEM_ADMIN:** Comprehensive user administration, account activation/deactivation, staff role provisioning, and audit oversight without editing financial values.

### 3. Complaint & Service Request Lifecycle
- Structured states: `OPEN` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `ESCALATED` ➔ `RESOLVED` ➔ `CLOSED`.
- Unique ticketing identifiers: `CMP-YYYY-XXXXXX`.
- Staff and supervisor audit trails with chronological timestamping.

### 4. Notification Management
- Internal event triggers for transfers, status changes, and complaint updates with read/unread markers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Axios, Bootstrap 5, React Icons, React Toastify, Context API |
| **Backend** | Node.js, Express.js (v5), Mongoose ODM, JWT (JSON Web Tokens), bcryptjs, CORS, dotenv, express-validator |
| **Database** | MongoDB Atlas (Cloud Managed NoSQL) |
| **Styling** | Custom Banking UI Theme (Navy `#0B3D60`, Teal `#176B87`, Amber `#F4A261`, Slate `#F5F7FA`) |

---

## 📂 Folder Structure

```
web-based-banking-system/
├── client/                               # Frontend React Application (Vite)
│   ├── src/
│   │   ├── components/                   # Reusable UI (Navbar, Sidebar, Layouts, Spinners)
│   │   ├── context/                      # AuthContext & State Management
│   │   ├── pages/
│   │   │   ├── admin/                    # Admin Dashboard & User Management
│   │   │   ├── auth/                     # Login & Registration Pages
│   │   │   ├── customer/                 # Core Banking, Transfers, Complaints
│   │   │   ├── manager/                  # Escalation Handling & Reports
│   │   │   └── officer/                  # Customer Service Workdesk
│   │   ├── services/                     # Centralized Axios API Services
│   │   ├── App.jsx                       # Client-side Route Configuration
│   │   ├── main.jsx                      # Entrypoint
│   │   └── index.css                     # Global Theme Stylesheet
│   └── package.json
│
└── server/                               # Backend REST API Server (Node / Express)
    ├── config/
    │   └── db.js                         # Mongoose MongoDB Connection
    ├── controllers/                      # Business Logic Handlers
    │   ├── accountController.js
    │   ├── authController.js
    │   ├── complaintController.js
    │   ├── dashboardController.js
    │   ├── notificationController.js
    │   ├── transactionController.js
    │   └── userController.js
    ├── middleware/                       # Auth, RBAC, Error Middlewares
    │   ├── authMiddleware.js
    │   ├── roleMiddleware.js
    │   └── errorMiddleware.js
    ├── models/                           # Mongoose Data Schemas
    │   ├── Account.js
    │   ├── Complaint.js
    │   ├── Notification.js
    │   ├── Transaction.js
    │   └── User.js
    ├── routes/                           # API Route Definitions
    │   ├── accountRoutes.js
    │   ├── adminRoutes.js
    │   ├── authRoutes.js
    │   ├── complaintRoutes.js
    │   ├── dashboardRoutes.js
    │   ├── notificationRoutes.js
    │   └── transactionRoutes.js
    ├── seed/
    │   └── seedData.js                   # Database Demo Seed Script
    ├── utils/                            # Identifiers & Number Generators
    │   ├── generateAccountNumber.js
    │   ├── generateComplaintNumber.js
    │   └── generateTransactionReference.js
    ├── .env                              # Environment Configuration (Git-Ignored)
    ├── .env.example                      # Template Configuration
    ├── server.js                         # Main Server Bootstrap File
    └── package.json
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Node.js (v18.x or higher recommended)
- npm (v9.x or higher)
- Active MongoDB Atlas Cluster or local MongoDB instance

### 2. Configure Environment Variables
Inside `server/.env`, verify and configure your settings:
```env
PORT=5000
MONGO_URI=mongodb+srv://chaminduathukorala:<DB_PASSWORD>@studentmanagement.i6j3dq6.mongodb.net/web_banking_system?retryWrites=true&w=majority&appName=StudentManagement
JWT_SECRET=banking_system_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
```
> **Note:** Replace `<DB_PASSWORD>` with your MongoDB Atlas database user password.

### 3. Seed Demo Data (Optional but Recommended)
Populates demo users, bank accounts with starting balances, sample transfers, complaints, and notifications:
```bash
cd server
npm run seed
```

### 4. Running the Application

#### Start Backend Server:
```bash
cd server
npm run dev
```
*API will run at:* `http://localhost:5000`  
*Health Check:* `http://localhost:5000/api/health`

#### Start Frontend Client:
```bash
cd client
npm run dev
```
*Web Application will run at:* `http://localhost:5173`

---

## 🔑 Demo Credentials

All accounts come pre-configured in the seed script (`seedData.js`) with the default password: `Password123!`

| Role | Email | Password | Starting Account / Notes |
|---|---|---|---|
| **CUSTOMER (Primary)** | `customer@bankdemo.com` | `Password123!` | Account: `ACC100001` (Balance: LKR 100,000.00) |
| **CUSTOMER (Secondary)** | `customer2@bankdemo.com` | `Password123!` | Account: `ACC100002` (Balance: LKR 50,000.00) |
| **SERVICE OFFICER** | `officer@bankdemo.com` | `Password123!` | Handling Assigned Inquiries |
| **BANK MANAGER** | `manager@bankdemo.com` | `Password123!` | Handling Escalations & Reports |
| **SYSTEM ADMIN** | `admin@bankdemo.com` | `Password123!` | Staff Provisioning & User Lifecycle |

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /register` — Register a customer and auto-provision bank account.
- `POST /login` — Authenticate and receive JWT.
- `GET /me` — Retrieve logged-in profile.
- `PUT /profile` — Update customer profile information.

### Accounts (`/api/accounts`)
- `GET /my-account` — Retrieve current user's bank account & balance.

### Transactions (`/api/transactions`)
- `POST /transfer` — Transfer funds to a valid receiver account.
- `GET /my-transactions` — Retrieve user's transaction history with filters.
- `GET /reference/:referenceNumber` — Fetch transaction by reference code.
- `GET /:id` — Fetch transaction by ID.

### Complaints (`/api/complaints`)
- `POST /` — Lodge new complaint.
- `GET /my-complaints` — Retrieve own complaints.
- `GET /assigned` — Service Officer assigned queue.
- `GET /escalated` — Manager escalated complaints queue.
- `PATCH /:id/status` — Update complaint status / notes.
- `PATCH /:id/escalate` — Escalate ticket to supervisor.
- `PATCH /:id/resolve` — Mark complaint resolved.
- `PATCH /:id/close` — Close complaint ticket.

### Notifications (`/api/notifications`)
- `GET /` — Fetch notifications.
- `PATCH /:id/read` — Mark notification as read.
- `PATCH /read-all` — Mark all user notifications as read.

### Administration (`/api/admin`)
- `GET /users` — Search and filter users.
- `POST /users` — Provision staff accounts.
- `PATCH /users/:id/role` — Update role permissions.
- `PATCH /users/:id/status` — Toggle active/inactive status.

---

## ⚠️ Academic Project Limitations

This software was engineered as an individual university project demonstrating academic principles of MERN stack software architecture, distributed state management, and role-based security.

**Explicitly Excluded Capabilities:**
- Real monetary or inter-bank settlements (e.g., SWIFT, SLIPS, CEFT).
- Hardware ATM network protocols or physical card readers.
- Real Payment Gateways (Stripe, PayPal, PayHere).
- Credit/Debit card processing and PCI-DSS certification.
- Complex credit facilities, loans, fixed deposits, investments, or insurance underwriting.
- Production-grade banking infrastructure and disaster recovery clustering.
