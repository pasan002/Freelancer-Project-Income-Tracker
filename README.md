# FreelancePulse — Freelancer Project & Income Tracker

A full-stack, responsive web application designed for freelancers to effortlessly manage their client relationships, track active projects, monitor incoming payments, and visualize financial earnings.

Developed for the **Individual Assignment: Freelancer Project & Income Tracker** (Software Engineering Team - 405).

---

## 🌟 Key Features

### 1. Authentication & Security
- **JWT-Based Authentication**: Secure login and registration with token verification on protected routes.
- **Password Hashing**: Secure salted password encryption using `bcrypt.js`.
- **User Profile Management**: Support for user title/occupation, preferred currency, and customizable profile settings.
- **1-Click Demo Login**: Instantly autofill demo credentials on the login screen for testing and evaluation.

### 2. Comprehensive Dashboard
- **Real-Time KPIs**:
  - **Active Projects**: Real-time count of projects currently in progress.
  - **Total Income**: Sum of all verified completed payments.
  - **Pending Payments**: Total outstanding receivables across contracts and pending invoices.
  - **Total Clients**: Number of active clients in the roster.
- **Visual Analytics**:
  - **Monthly Income Bar Chart**: 6-month historical cash inflow representation powered by Recharts.
  - **Project Status Distribution Chart**: Visual doughnut chart showing the proportion of In Progress, Completed, Pending, On Hold, and Cancelled projects.
- **Recent Activity Feeds**: Quick view of latest projects and recent payment transactions with direct invoice preview links.

### 3. Project Management
- **Full CRUD Support**: Add, edit, update, and delete projects.
- **Search & Filters**: Instant live search by project title/scope, filtering by status (In Progress, Completed, Pending, On Hold, Cancelled) and filtering by client.
- **Financial Progress Tracking**: Dynamic progress bars showing percentage paid vs. contract fee, along with remaining balance due.
- **Priority & Due Date Badging**: Visual indicators for priority (High, Medium, Low) and deadline dates.
- **Pagination**: Smooth pagination controls for large project libraries.

### 4. Client Relationship Management (CRM)
- **Client Roster**: Add, edit, and manage client contact details (Email, Phone, Company, Address, Notes, Active/Inactive status).
- **Cumulative Financial Metrics**: Automatically calculates total projects count and total revenue earned per client.
- **Cascade Deletion**: Clean cascading cleanup of projects and payments when removing a client record.

### 5. Income & Payment Tracking
- **Payment Logging**: Record incoming payments linked to projects and clients.
- **Payment Methods**: Categorization by Bank Transfer, Credit Card, PayPal, Stripe, Cash, Crypto, or Other.
- **Invoice & Receipt Generation**: Auto-generated invoice numbers with dedicated print and PDF download support.
- **Automatic Balance Synchronization**: Recording or editing payments immediately updates the project's paid balance and dashboard financial statistics.

### 6. Reports & Export Capabilities (Bonus / Optional Features)
- **CSV Data Export**: One-click download of all payment transactions and financial logs as a formatted `.csv` file.
- **PDF Report Generation**: Instant export of official tax-ready financial statements using `jsPDF` and `jspdf-autotable`.
- **Printable Invoices**: Clean printable invoice view adhering to `@media print` stylesheets.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons, Recharts, Axios, React Router DOM 6, jsPDF, jspdf-autotable |
| **Backend** | Node.js, Express.js, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`, `morgan` |
| **Database** | MongoDB, Mongoose ODM |
| **Tooling** | npm, Git |

---

## 📁 Directory Structure

```text
gamage ind 2/
├── Individual_Assignment_Freelancer_Tracker.pdf
├── package.json                   # Root orchestrator scripts
├── .gitignore
├── README.md                      # Comprehensive documentation
├── Submission_Details_Template.md # Submission document guide
│
├── server/                        # Express & Node.js Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB Mongoose connection
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, Login, Profile
│   │   │   ├── clientController.js     # Client CRUD & aggregation
│   │   │   ├── projectController.js    # Project CRUD & filtering
│   │   │   ├── paymentController.js    # Payments CRUD & CSV export
│   │   │   └── dashboardController.js  # KPI stats & chart datasets
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT header verification
│   │   │   └── errorMiddleware.js      # Global error & 404 handler
│   │   ├── models/
│   │   │   ├── User.js            # User model with bcrypt pre-save
│   │   │   ├── Client.js          # Client schema
│   │   │   ├── Project.js         # Project schema with fee tracking
│   │   │   └── Payment.js         # Payment transaction schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── clientRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── utils/
│   │   │   └── seedData.js        # Realistic demo database seeder
│   │   └── index.js               # Express server entry point
│   ├── .env                       # Backend environment variables
│   ├── .env.example
│   └── package.json
│
└── client/                        # React (Vite) Frontend Application
    ├── src/
    │   ├── api/
    │   │   └── axios.js           # Axios instance with JWT interceptor
    │   ├── context/
    │   │   └── AuthContext.jsx    # User authentication provider
    │   ├── components/
    │   │   ├── Navbar.jsx         # Header navbar with user details
    │   │   ├── Sidebar.jsx        # Responsive navigation sidebar
    │   │   ├── StatCard.jsx       # Metric KPI card
    │   │   ├── ProjectModal.jsx   # Create/Edit project modal
    │   │   ├── ClientModal.jsx    # Create/Edit client modal
    │   │   ├── PaymentModal.jsx   # Record/Edit payment modal
    │   │   ├── InvoiceModal.jsx   # Printable invoice preview & PDF
    │   │   ├── ProtectedRoute.jsx # Route authentication guard
    │   │   └── Charts/
    │   │       ├── MonthlyIncomeChart.jsx  # Recharts Bar Chart
    │   │       └── ProjectStatusPieChart.jsx # Recharts Pie Chart
    │   ├── pages/
    │   │   ├── Login.jsx          # Sign-in page with 1-click demo button
    │   │   ├── Register.jsx       # Registration with validation
    │   │   ├── Dashboard.jsx      # Metrics, charts, and activity
    │   │   ├── Projects.jsx       # Project list, filters & search
    │   │   ├── Clients.jsx        # Client directory & relationship stats
    │   │   ├── Payments.jsx       # Income records, CSV export & invoice
    │   │   └── Reports.jsx        # Financial analytics & PDF exporter
    │   ├── App.jsx                # Layout & client routing
    │   ├── main.jsx               # Application root render
    │   └── index.css              # Tailwind base directives
    ├── index.html
    ├── vite.config.js             # Vite configuration with proxy
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **MongoDB** running locally on port `27017` OR a free cloud connection URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

---

### Step 1: Backend Setup

1. Open your terminal in the `server` directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   A pre-configured `.env` file is included in `server/`. You can edit it or verify its contents:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/freelancer_tracker
   JWT_SECRET=supersecretfreelancertrackerjwtkey2026
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```
   > **Note**: If using MongoDB Atlas, replace `MONGODB_URI` with your connection string:
   > `MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/freelancer_tracker?retryWrites=true&w=majority`

4. *(Recommended)* Seed the database with demo clients, projects, and payments:
   ```bash
   npm run seed
   ```
   This populates the database with realistic sample data across several months so you can immediately inspect the charts and features!

5. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend server will run on: **`http://localhost:5000`**

---

### Step 2: Frontend Setup

1. Open a new terminal in the `client` directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will run on: **`http://localhost:3000`**

---

### Step 3: Accessing the Application

Open your browser and navigate to:
👉 **`http://localhost:3000`**

#### 🔑 Demo Credentials:
- **Email**: `demo@freelancertracker.com`
- **Password**: `Password123!`
*(Or click the **"Fill Demo Credentials (1-Click)"** button on the Login page)*

---

## 📡 REST API Documentation

All routes except `/api/auth/register`, `/api/auth/login`, and `/api/health` require a Bearer token in the header:
`Authorization: Bearer <token>`

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | Private |
| `PUT` | `/api/auth/profile` | Update user title, name, or currency | Private |

### Dashboard Routes (`/api/dashboard`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Aggregated KPIs, Monthly Income & Project status charts | Private |

### Project Routes (`/api/projects`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | Get projects (supports `?search=`, `?status=`, `?client=`, `?page=`) | Private |
| `GET` | `/api/projects/:id` | Get single project with its payment history | Private |
| `POST` | `/api/projects` | Create a new project | Private |
| `PUT` | `/api/projects/:id` | Update project details (name, status, fee, etc.) | Private |
| `DELETE` | `/api/projects/:id` | Delete project and associated payments | Private |

### Client Routes (`/api/clients`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/clients` | Get clients with project counts & cumulative earnings | Private |
| `GET` | `/api/clients/:id` | Get single client details | Private |
| `POST` | `/api/clients` | Add a new client | Private |
| `PUT` | `/api/clients/:id` | Update client details | Private |
| `DELETE` | `/api/clients/:id` | Remove client and cascade delete records | Private |

### Payment & Income Routes (`/api/payments`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payments` | List payments with filters & pagination | Private |
| `GET` | `/api/payments/:id` | Fetch single payment transaction details | Private |
| `POST` | `/api/payments` | Record new payment & recalculate project balance | Private |
| `PUT` | `/api/payments/:id` | Update payment details | Private |
| `DELETE` | `/api/payments/:id` | Delete payment & recalculate project balance | Private |
| `GET` | `/api/payments/export/csv` | Download complete payment history as CSV file | Private |

---

## 📸 Main Features Walkthrough

1. **Dashboard Page**:
   - High-level KPI cards for Active Projects, Total Earned Income, Pending Receivables, and Total Clients.
   - Interactive Recharts Bar Chart showing monthly earnings across previous months.
   - Recharts Donut Chart breaking down active vs completed vs pending workloads.
   - Quick action shortcuts to record payments or launch projects.

2. **Projects Page**:
   - Filterable project grid with live search bar.
   - Status filters and client-specific filtering.
   - Visual fee progress bar indicating paid amount vs total contract value.
   - Modals for creating and editing projects.

3. **Clients Page**:
   - Complete contact roster with email, phone, and company affiliations.
   - Real-time aggregated financial stats showing total contracts and total income paid per client.

4. **Payments & Invoicing**:
   - Clear financial transaction table with status badges (Completed vs. Pending).
   - Instant invoice modal generator: view interactive invoice, click **"Download PDF"** to export as PDF via jsPDF, or print directly.
   - One-click **"Export CSV"** button.

5. **Reports Page**:
   - Comprehensive tax-ready summary view.
   - Client revenue distribution analysis.
   - Export official PDF summary report or download full CSV sheet.

---

## 👨‍💻 Submission Details Checklist

As requested in the assignment guidelines:
- [x] Full-stack application implemented using React.js, Node.js, Express.js, MongoDB, Mongoose, JWT & bcrypt.js.
- [x] Protected routes and authentication security enabled.
- [x] Dashboard displaying active projects, total income, and pending payments.
- [x] Full CRUD operations for clients and projects.
- [x] Search and filtering by status and client.
- [x] Interactive monthly income charts and project status charts.
- [x] Form validation and error handling across backend & frontend.
- [x] Responsive and modern user interface.
- [x] Optional features: Pagination, CSV export, PDF invoice & report generation.
- [x] Formatted and documented `README.md`.
