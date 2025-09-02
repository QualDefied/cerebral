import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  Banknote,
  ArrowUpDown
} from 'lucide-react';

interface NavigationProps {
  isDarkMode: boolean;
}

export default function Navigation({ isDarkMode }: NavigationProps) {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/savings-simulator', icon: Calculator, label: 'Savings Simulator' },
    { path: '/accounts', icon: Banknote, label: 'Accounts' },
    { path: '/transactions', icon: ArrowUpDown, label: 'Transactions' },
  ];

    return (
    <div className={`fixed left-0 top-0 h-full w-64 shadow-lg border-r transition-colors duration-200 ${
      isDarkMode
        ? 'bg-gray-900/70 backdrop-blur-md border-gray-800'
        : 'glass-lux border-gray-200'
    }`}>
      <div className="p-6">
        <h1 className="text-2xl font-semibold tracking-wide bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
          Cerebral Dashboard
        </h1>
        <p className={`text-sm mt-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Financial Intelligence Platform
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
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-50 text-amber-700 border-r-2 border-amber-600 shadow-sm'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-amber-900/20 hover:text-amber-400'
                        : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
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