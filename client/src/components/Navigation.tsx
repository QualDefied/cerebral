import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowUpDown, 
  PieChart,
  Target,
  Banknote,
  Award,
  Calculator
} from 'lucide-react';

interface NavigationProps {
  isDarkMode: boolean;
}

export default function Navigation({ isDarkMode }: NavigationProps) {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/savings-simulator', icon: Calculator, label: 'Savings Simulator' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full w-64 shadow-lg border-r transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600">TeamShell Finance</h1>
        <p className={`text-sm mt-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Session-Only Local App
        </p>
      </div>
      
      <nav className="px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

    </div>
  );
}