import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';

interface SavingsSimulatorProps {
  isDarkMode: boolean;
}

export default function SavingsSimulator({ isDarkMode }: SavingsSimulatorProps) {
  const [initialBalance, setInitialBalance] = useState(10000);
  const [apr, setApr] = useState(4.5);
  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('monthly');

  const calculateGrowth = useMemo(() => {
    const monthlyRate = apr / 100 / 12;
    const periods = viewType === 'monthly' ? 12 : 10; // 12 months or 10 years
    
    const data = [];
    let balance = initialBalance;

    for (let i = 0; i <= periods; i++) {
      if (viewType === 'monthly') {
        data.push({
          period: `Month ${i}`,
          balance: Math.round(balance * 100) / 100,
          interest: i === 0 ? 0 : Math.round((balance - initialBalance) * 100) / 100
        });
        if (i < periods) {
          balance = balance * (1 + monthlyRate);
        }
      } else {
        const yearlyBalance = initialBalance * Math.pow(1 + apr / 100, i);
        data.push({
          period: `Year ${i}`,
          balance: Math.round(yearlyBalance * 100) / 100,
          interest: i === 0 ? 0 : Math.round((yearlyBalance - initialBalance) * 100) / 100
        });
      }
    }

    return data;
  }, [initialBalance, apr, viewType]);

  const finalBalance = calculateGrowth[calculateGrowth.length - 1]?.balance || 0;
  const totalInterest = finalBalance - initialBalance;
  const effectiveReturn = ((finalBalance / initialBalance) - 1) * 100;

  return (
    <div className={`min-h-screen p-8 transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Calculator className="w-8 h-8 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold">High Yield Savings Simulator</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Input Controls */}
          <div className={`p-6 rounded-xl shadow-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Initial Balance ($)
                </label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  APR (%)
                </label>
                <input
                  type="number"
                  value={apr}
                  onChange={(e) => setApr(Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  min="0"
                  max="15"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  View
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewType('monthly')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewType === 'monthly'
                        ? 'bg-green-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setViewType('yearly')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewType === 'yearly'
                        ? 'bg-green-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-6 rounded-xl shadow-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Final Balance</p>
                    <p className="text-2xl font-bold">${finalBalance.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Total Interest</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${totalInterest.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <Calculator className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">
                      {viewType === 'monthly' ? '1-Year' : '10-Year'} Return
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {effectiveReturn.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className={`p-6 rounded-xl shadow-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className="text-xl font-semibold mb-6">
            {viewType === 'monthly' ? 'Monthly' : 'Yearly'} Growth Projection
          </h2>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calculateGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="period" 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                    color: isDarkMode ? '#ffffff' : '#000000',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === 'balance' ? 'Balance' : 'Interest Earned'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interest Breakdown */}
        <div className={`mt-8 p-6 rounded-xl shadow-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className="text-xl font-semibold mb-6">Interest Earned by Period</h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calculateGrowth.slice(1)}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="period" 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                    color: isDarkMode ? '#ffffff' : '#000000',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Interest Earned']}
                />
                <Bar 
                  dataKey="interest" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}