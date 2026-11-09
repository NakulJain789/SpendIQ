# 💎 SpendIQ — Personal Finance Intelligence

> A high-performance, production-quality Personal Finance Tracker built with the **MERN** stack (MongoDB, Express, React, Node.js) paired with interactive 3D graphics (React Three Fiber / Three.js), dynamic data visualizations (Recharts), and modern fintech design (Revolut / Cred / Apple Wallet aesthetic).

---

## ⚡ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, React Three Fiber (`@react-three/fiber`), Three.js, `@react-three/drei`, Recharts, Framer Motion, Lucide React, React Hot Toast, Canvas Confetti, Axios |
| **Backend** | Node.js, Express.js, Mongoose, JSON Web Tokens (JWT), bcryptjs, express-validator, Helmet, CORS, express-rate-limit |
| **Database** | MongoDB (Atlas-ready via `MONGO_URI`, with automatic embedded memory server fallback for local testing) |
| **Currency** | Indian Rupee (**₹ INR**) with authentic Indian number formatting (`en-IN`) |

---

## ✨ Features

### 1. 🛡️ Authentication & User Isolation
- Secure JWT authentication with 7-day persistent login sessions.
- Bcrypt password hashing (10 salt rounds) and rigorous input validation.
- **Strict Data Isolation**: Every MongoDB transaction, category, and budget query is scoped exclusively to `req.user._id`.
- Rate limiting on authentication routes to mitigate brute-force attempts.
- Automatic seeding of 9 default categories (*Food & Dining, Transport, Rent, Bills, Shopping, Health, Entertainment, Salary, Other*) on new user registration.

### 2. 📊 Dynamic Real-Time Dashboard
- **3D Metal Card**: Interactive balance card with mouse tilt parallax, privacy toggle (mask/reveal balance), and cardholder personalization.
- **Dynamic Metrics**: Total Net Balance, Total Income, Total Expenses, and Savings Margin calculated dynamically on the fly from raw transactions (never statically stored).
- **Cashflow Analytics Chart**: Interactive Area & Bar chart toggle visualizing Income vs. Expenses over the past 6 months.
- **Category Donut Chart**: Hover-interactive distribution chart with category legend and percentage breakdown.
- **Recent Activity Ledger**: Instant view of latest transactions with inline category badges and amount chips.

### 3. 💳 Transactions Ledger & Smart Filtering
- Comprehensive table/card view responsive across all screen sizes (360px mobile up to 1440px+ ultra-wide).
- Multi-dimensional filtering:
  - Real-time text search across titles, merchants, and notes.
  - Type toggle pills (*All / Income / Expense*).
  - Category selector dropdown.
  - Custom Date Range picker (*Start Date to End Date*).
  - Multi-column sorting by Date (*Newest / Oldest*) or Amount (*Highest / Lowest*).
- Full CRUD operations with instant feedback and animated modal sheets.
- **Recurring Transactions**: Support for recurring subscriptions and bills (*Daily, Weekly, Monthly, Yearly*).
- **One-Click CSV Export**: Download transaction history directly into an formatted `.csv` spreadsheet.

### 4. 🎯 Budget & Category Planner
- **Month Selector**: Easily browse any historical or future month/year.
- **Spending Pace Gauge**: Animated circular progress ring that dynamically transitions colors:
  - 🟢 **Green (Emerald)**: `< 80%` of monthly budget spent (On Track).
  - 🟡 **Amber (Warning)**: `80% - 99%` of monthly budget spent (Nearing Limit).
  - 🔴 **Red (Danger)**: `≥ 100%` of budget spent with contextual over-budget warning banner.
- **Category Breakdown Bars**: Real-time spending vs. monthly category limit progress bars.
- **Category Management**: Create, edit, and delete custom categories with customizable color swatches and monthly caps.

### 5. 📱 Daily-Use & Fintech UI/UX Polish
- **Global Floating Action Button (FAB)**: Located on every page and accessible via mobile bottom bar, opening a fast-entry modal with today's date prefilled and remembering last-used type and category.
- **Celebration Feedback**: Confetti burst on adding transactions and reaching savings milestones.
- **Dark Fintech Aesthetic**: Deep navy-black palette (`#05070D`), subtle glassmorphism (`backdrop-blur-md`), ambient aurora glows, and custom typography (`Space Grotesk` for numbers, `Inter` for UI).
- **Mobile First**: Fixed bottom navigation bar with an elevated center "+" button and touch targets $\ge 44\text{px}$.

---

## 📁 Project Architecture

```
SpendIQ/
├── package.json                 # Monorepo root scripts (dev, install, start)
├── server/                      # Express REST API Backend
│   ├── config/
│   │   └── db.js                # MongoDB connection + resilient memory server fallback
│   ├── controllers/
│   │   ├── authController.js    # Register, login, me, category auto-seed
│   │   ├── transactionController.js # CRUD, filtering, search, CSV export
│   │   ├── categoryController.js    # CRUD category management
│   │   ├── budgetController.js      # Monthly budget targets & progress
│   │   └── dashboardController.js   # Dynamic calculated metrics & trends
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification & req.user attachment
│   │   ├── errorHandler.js      # Centralized error handler
│   │   └── validateRequest.js   # express-validator result handler
│   ├── models/
│   │   ├── User.js              # User schema with bcrypt methods
│   │   ├── Transaction.js       # Transactions collection
│   │   ├── Category.js          # Categories collection
│   │   └── Budget.js            # Monthly budget collection
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── budgetRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Express app entry, security headers & CORS
│
└── client/                      # React + Vite Frontend
    ├── public/
    │   └── manifest.json        # PWA installable manifest
    ├── src/
    │   ├── components/          # Reusable UI components
    │   │   ├── BudgetGauge.jsx
    │   │   ├── CategoryModal.jsx
    │   │   ├── CategoryPieChart.jsx
    │   │   ├── DeleteConfirmModal.jsx
    │   │   ├── EmptyState.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── BottomNav.jsx
    │   │   ├── QuickAddModal.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── SkeletonLoader.jsx
    │   │   ├── SpendingChart.jsx
    │   │   ├── StatCard.jsx
    │   │   ├── ThreeHeroScene.jsx   # 3D interactive floating coins & card
    │   │   ├── ThreeTiltCard.jsx    # 3D interactive balance card
    │   │   ├── TransactionItem.jsx
    │   │   └── TransactionModal.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx      # Auth state & token persistence
    │   │   └── FinanceContext.jsx   # Global transaction & budget state
    │   ├── pages/
    │   │   ├── AuthPage.jsx         # Sign in / Register with 3D hero
    │   │   ├── DashboardPage.jsx    # Summary, charts, quick actions
    │   │   ├── TransactionsPage.jsx # Full filtered ledger & CSV export
    │   │   ├── BudgetPage.jsx       # Month selector, gauge, categories
    │   │   ├── ReportsPage.jsx      # Financial statements & audit
    │   │   └── NotFoundPage.jsx
    │   ├── services/
    │   │   └── api.js               # Axios instance with auth interceptor
    │   ├── utils/
    │   │   └── formatters.js        # Indian Rupee (₹) & date formatters
    │   ├── App.jsx                  # Router & layout orchestration
    │   ├── index.css                # Design tokens & glassmorphic utilities
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance OR MongoDB Atlas connection string (an embedded fallback is provided if neither is present).

### 1. Installation
Clone the repository and install all dependencies:

```bash
# In the root repository directory:
npm run install:all
```
*Or manually:*
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Environment Variables Configuration

#### Server (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/spendiq?retryWrites=true&w=majority
JWT_SECRET=spendiq_super_secure_jwt_secret_key_2026_finance_tracker
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

#### Client (`client/.env`):
```env
VITE_API_URL=/api
```

### 3. Running Locally
Run both client and server concurrently with one command from the project root:

```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 📡 REST API Reference

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user and seed 9 default categories | No |
| `POST` | `/api/auth/login` | Authenticate with email & password, returns JWT | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | Yes (Bearer Token) |

### Transactions Routes (`/api/transactions`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/transactions` | Query transactions (filters: `type`, `category`, `startDate`, `endDate`, `month`, `year`, `search`, `sortBy`) | Yes |
| `POST` | `/api/transactions` | Create a new transaction | Yes |
| `PUT` | `/api/transactions/:id` | Update transaction (verifies ownership) | Yes |
| `DELETE` | `/api/transactions/:id` | Delete transaction (verifies ownership) | Yes |
| `GET` | `/api/transactions/export` | Download transactions matching filters as CSV | Yes |

### Categories Routes (`/api/categories`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/categories` | Get all user-specific categories | Yes |
| `POST` | `/api/categories` | Create custom category with color & monthly cap | Yes |
| `PUT` | `/api/categories/:id` | Update category name, color, or budget cap | Yes |
| `DELETE` | `/api/categories/:id` | Delete category (verifies ownership) | Yes |

### Budget Routes (`/api/budget`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/budget?month=X&year=Y` | Fetch budget & real-time spending progress for month/year | Yes |
| `PUT` | `/api/budget` | Set or update monthly budget target and category caps | Yes |

### Dashboard Routes (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Dynamic totals, past 6 months cashflow, category breakdown, recent items | Yes |

---

## 🔒 Security Best Practices
- **Password Protection**: Passwords salted and hashed with bcrypt; never stored or returned in plaintext.
- **Resource Ownership**: All CRUD controllers query using `{ user: req.user._id, _id: id }` to prevent unauthorized cross-tenant data access.
- **HTTP Hardening**: Helmet configured for secure headers; strict CORS controls enabled.
- **Brute-Force Mitigation**: `express-rate-limit` active on `/api/auth` endpoints.
- **Input Sanitization**: `express-validator` validates email formats, lengths, and numerical bounds before database queries execute.
