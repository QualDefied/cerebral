# Cerebral Finance - Local Session-Only Version

A lightweight financial management web application designed for **LOCAL USE ONLY** with session-only storage. All data is wiped when the server restarts or when you click the "Wipe Data" button.

## 🔒 Privacy Features

- **NO DATABASE** - All data stored in memory only
- **SESSION-ONLY** - Data disappears when server restarts
- **LOCAL HOSTING** - Only accessible from your computer (127.0.0.1)
- **WIPE BUTTON** - Clear all data instantly with one click
- **NO PERSISTENCE** - Perfect for temporary financial planning

## Features

- 💳 **Credit Card Management** - Add credit cards with name, limit, APR, and due dates
- 🏠 **Loan Management** - Track loans with monthly payments and balances
- 💰 **Expense Tracking** - Add and categorize monthly expenses with different frequencies
- 📊 **Dashboard Overview** - View financial stats including total minimum payments
- 📋 **Payment Breakdown** - Detailed breakdown showing credit cards, loans, and expenses
- 🗑️ **Data Wipe** - Clear all session data with the red "Wipe Data" button

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling

### Backend
- Node.js with Express
- In-memory storage only
- No database, no persistence

## Local Setup (Session-Only)

### Prerequisites
- Node.js 18+
- npm

### Quick Start

1. Install dependencies:
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies  
   cd ../server
   npm install
   ```

2. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

3. In a new terminal, start the frontend:
   ```bash
   cd client
   npm run dev
   ```

4. Open your browser to: **http://127.0.0.1:5173**

### Important Notes
- Server runs on **127.0.0.1:5000** (local-only)
- Client runs on **127.0.0.1:5173** (local-only)
- All data is **temporary** and will be lost when you:
  - Restart the server
  - Click the "Wipe Data" button
  - Close the application

## Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run install:all` - Install dependencies for all packages

## Project Structure

```
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   └── contexts/
├── server/          # Node.js backend API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── utils/
│   │   └── types/
│   └── prisma/      # Database schema and migrations
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