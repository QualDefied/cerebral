import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import SavingsSimulator from './pages/SavingsSimulator';
import Navigation from './components/Navigation';

interface CreditCard {
  id: string;
  name: string;
  creditLimit: number;
  currentBalance?: number;
  debt?: number;
  apr: number;
  dueDate?: string;
  lastFourDigits?: string;
  pointsBalance?: number;
  rewardType?: 'points' | 'miles' | 'cashback' | 'hotel' | 'travel';
  bank?: string;
  calculatedMinimumPayment?: number;
  interestPortion?: number;
  principalPortion?: number;
  payoffTimeMonths?: number;
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-amber-50 via-white to-amber-100'
    }`}>
      <Navigation isDarkMode={isDarkMode} />
      <div className="ml-64 p-8">
        <Routes>
          <Route path="/dashboard" element={<Dashboard isDarkMode={isDarkMode} toggleTheme={toggleTheme} creditCards={creditCards} setCreditCards={setCreditCards} />} />
          <Route path="/calendar" element={<Calendar isDarkMode={isDarkMode} creditCards={creditCards} />} />
          <Route path="/savings-simulator" element={<SavingsSimulator isDarkMode={isDarkMode} />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;