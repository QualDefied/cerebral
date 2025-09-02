import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import SavingsSimulator from './pages/SavingsSimulator';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Navigation from './components/Navigation';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

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
          <Route path="/dashboard" element={<Dashboard isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
          <Route path="/savings-simulator" element={<SavingsSimulator isDarkMode={isDarkMode} />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;