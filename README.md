# Cerebral Finance

A comprehensive financial management web application designed for personal finance tracking and analysis. Features both local development with optional database persistence and session-only modes.

## 🔒 Privacy & Security

- **Local Development** - Runs entirely on your local machine (127.0.0.1)
- **Optional Database** - Choose between persistent database storage or session-only memory storage
- **No External Dependencies** - All data processing happens locally
- **Secure by Design** - Built with security best practices and OWASP guidelines

## Features

### 💳 Credit Card Management
- Add and track multiple credit cards with detailed information
- APR tracking and minimum payment calculations
- Due date management with calendar integration
- Balance tracking and utilization monitoring
- Rewards points and cashback tracking
- Payoff time estimation with different payment strategies

### 🏠 Debt Management
- Personal loan tracking with payment schedules
- Mortgage and auto loan management
- Debt consolidation planning
- Payment optimization strategies

### 💰 Expense Tracking
- Categorize and track monthly expenses
- Support for different frequencies (daily, weekly, monthly, yearly)
- Budget planning and monitoring
- Expense analytics and trends

### 📊 Financial Dashboard
- Comprehensive overview of all financial accounts
- Real-time calculations of total minimum payments
- Payment breakdown with detailed categorization
- Visual charts and analytics using Recharts
- Dark/light theme support

### 📅 Calendar Integration
- Credit card due date tracking
- Payment reminder system
- Financial event scheduling
- Calendar export functionality

### 💹 Investment Tracking
- Cryptocurrency portfolio management
- Stock and ETF tracking (planned)
- Performance analytics and reporting
- Wallet and exchange integration

### 🎯 Financial Planning
- Savings simulator with compound interest calculations
- Goal setting and progress tracking
- Retirement planning tools
- Budget optimization suggestions

## Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern, responsive styling
- **React Router** for client-side navigation
- **Recharts** for data visualization and charts
- **Lucide React** for consistent iconography
- **React Hook Form** with Zod validation for forms
- **Axios** for API communication

### Backend
- **Node.js** with Express.js for the API server
- **TypeScript** for type safety and better development experience
- **Prisma ORM** with database support
- **PostgreSQL** database (optional, can run in memory mode)
- **Express Rate Limiting** for API protection
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Express Validator** for input validation

## Setup & Installation

### Prerequisites
- **Node.js 18+**
- **npm** (comes with Node.js)
- **Optional**: PostgreSQL (if you want persistent database storage)

### Quick Start

1. **Install all dependencies** (from project root):
   ```bash
   npm run install:all
   ```

2. **Set up the database** (optional, for persistent storage):
   ```bash
   cd server
   npm run db:migrate
   ```

3. **Start the development servers**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   - Frontend: **http://127.0.0.1:5173**
   - Backend API: **http://127.0.0.1:5000**

### Development Scripts

#### Root Level Scripts
- `npm run dev` - Start both frontend and backend concurrently
- `npm run build` - Build both frontend and backend for production
- `npm run install:all` - Install dependencies for all packages
- `npm run client:dev` - Start only the frontend
- `npm run server:dev` - Start only the backend

#### Client Scripts (in `/client` directory)
- `npm run dev` - Start the React development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on the codebase

#### Server Scripts (in `/server` directory)
- `npm run dev` - Start the server in development mode with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start the production server
- `npm run test` - Run Jest tests
- `npm run lint` - Run ESLint on the codebase
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio for database management

### Database Configuration

The application supports two modes:

1. **Session-Only Mode** (Default)
   - No database required
   - Data stored in memory only
   - Data is lost when server restarts
   - Perfect for testing and temporary analysis

2. **Persistent Mode** (Optional)
   - Requires PostgreSQL database
   - Data persists between server restarts
   - Run `npm run db:migrate` to set up database
   - Configure connection string in `server/.env`

### Environment Variables

Create a `.env` file in the `/server` directory:
```
DATABASE_URL="postgresql://username:password@localhost:5432/cerebral_finance"
PORT=5000
NODE_ENV=development
```

## Project Structure

```
cerebral/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   └── Navigation.tsx       # Main navigation component
│   │   ├── pages/                   # Main application pages
│   │   │   ├── Dashboard.tsx        # Main financial dashboard
│   │   │   ├── Calendar.tsx         # Calendar with payment tracking
│   │   │   └── SavingsSimulator.tsx # Savings growth calculator
│   │   ├── utils/                   # Utility functions
│   │   │   └── storage.ts          # Local storage management
│   │   ├── App.tsx                  # Main application component
│   │   ├── main.tsx                 # Application entry point
│   │   └── index.css                # Global styles
│   ├── public/                      # Static assets
│   ├── index.html                   # HTML template
│   ├── package.json                 # Frontend dependencies
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── vite.config.ts               # Vite build configuration
├── server/                          # Node.js backend API
│   ├── src/
│   │   ├── controllers/             # Request handlers
│   │   │   ├── creditCardController.ts
│   │   │   ├── cryptoController.ts
│   │   │   ├── dataController.ts
│   │   │   ├── financialProfileController.ts
│   │   │   └── userGoalsController.ts
│   │   ├── routes/                  # API route definitions
│   │   │   ├── creditCards.ts
│   │   │   ├── crypto.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── data.ts
│   │   │   ├── debts.ts
│   │   │   ├── financialProfile.ts
│   │   │   ├── budgets.ts
│   │   │   └── userGoals.ts
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.ts              # Authentication middleware
│   │   │   └── errorHandler.ts      # Error handling
│   │   ├── services/                # Business logic layer
│   │   │   └── financialProfileService.ts
│   │   ├── utils/                   # Utility functions
│   │   │   ├── database.ts          # Database connection
│   │   │   └── financialCalculations.ts
│   │   ├── index.ts                 # Server entry point
│   │   └── types/                   # TypeScript type definitions
│   ├── prisma/                      # Database ORM and migrations
│   │   ├── schema.prisma            # Database schema
│   │   ├── migrations/              # Database migrations
│   │   └── dev.db                   # Development database
│   ├── package.json                 # Backend dependencies
│   └── tsconfig.json                # TypeScript configuration
├── docs/                            # Documentation
│   └── ai_agent_oneshot_prompt.md   # AI agent configuration
├── package.json                     # Root package configuration
├── README.md                        # Project documentation
├── SECURITY.md                      # Security policy
└── test-formatting.js               # Test formatting utility
```

## Recent Updates

### Expense Integration (2024-09-19)
- **Enhanced Monthly Minimums**: Expenses are now included in the total minimum payments calculation
- **Payment Breakdown**: Added expenses section to the payment breakdown dropdown
- **Dynamic Calculation**: Expenses with different frequencies (daily, weekly, monthly, yearly) are converted to monthly equivalents
- **Conditional Rendering**: Expenses section only shows when expenses exist with amounts > 0
- **Defensive Programming**: Added fallbacks for missing expense properties (id, name, frequency)

#### Technical Implementation
```javascript
// Total minimum payments now includes expenses
const totalMinimumPayments = totalCreditCardMinPayments + totalLoanPayments + totalMonthlyExpenses;

// Payment breakdown follows same conditional pattern as loans/credit cards
{expenses.length > 0 && totalMonthlyExpenses > 0 && (
  <div>
    {/* Expenses breakdown display */}
  </div>
)}
```

#### Files Modified
- `client/src/pages/Dashboard.tsx` - Main dashboard component with expense integration