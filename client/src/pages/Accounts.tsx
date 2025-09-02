import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CreditCard as CreditCardIcon, Banknote, TrendingUp } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
  isActive: boolean;
}

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'CHECKING',
    balance: '',
    currency: 'USD'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('/api/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/accounts', formData);
      setShowForm(false);
      setFormData({ name: '', type: 'CHECKING', balance: '', currency: 'USD' });
      fetchAccounts();
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'CREDIT_CARD':
        return CreditCardIcon;
      case 'INVESTMENT':
        return TrendingUp;
      default:
        return Banknote;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent mb-3">
          Financial Accounts
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage and track all your financial accounts in one centralized location
        </p>
      </div>

      <div className="flex justify-end mb-8">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </button>
      </div>

      {showForm && (
        <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-lg border border-gray-200 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Add New Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="INVESTMENT">Investment</option>
                  <option value="LOAN">Loan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => {
          const Icon = getAccountIcon(account.type);
          const balance = parseFloat(account.balance);
          const isNegative = balance < 0;

          return (
            <div key={account.id} className="group bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-lg border border-gray-200 hover:border-orange-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl shadow-lg border border-orange-300 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-orange-600" />
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  account.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {account.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {account.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {getAccountTypeLabel(account.type)}
              </p>
              <div className="text-3xl font-bold group-hover:scale-105 transition-transform duration-300">
                <span className={`bg-gradient-to-r ${
                  isNegative
                    ? 'from-red-600 to-red-500'
                    : 'from-orange-600 to-orange-500'
                } bg-clip-text text-transparent`}>
                  {account.currency === 'USD' ? '$' : account.currency + ' '}
                  {Math.abs(balance).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {accounts.length === 0 && !showForm && (
        <div className="text-center py-12">
          <div className="p-4 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full w-fit mx-auto mb-4">
            <CreditCardIcon className="w-16 h-16 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No accounts yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">Get started by adding your first account to begin tracking your finances</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Add Your First Account
          </button>
        </div>
      )}
    </div>
  );
}