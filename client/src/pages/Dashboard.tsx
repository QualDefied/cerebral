import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, TrendingDown, Plus, X, Edit, Target, Moon, Sun, Wallet, Star, Home, Bitcoin, Settings, Trash2, ChevronDown, ChevronUp, Building, Download, FileText } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Text } from 'recharts';
import { STORAGE_KEYS, clearAllLocalStorage, saveToStorage, loadFromStorage } from '../utils/storage';

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
  totalInterestIfMinimumOnly?: number;
}

interface Loan {
  id: string;
  name: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  monthlyPayment: number;
  loanType: string;
  originationDate?: string;
  paymentDate?: string;
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'monthly' | 'weekly' | 'daily' | 'yearly';
  isRecurring: boolean;
}

interface CryptoAsset {
  id: string;
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  platform?: string;
  walletAddress?: string;
  totalValue?: number;
  totalCost?: number;
  gainLoss?: number;
  gainLossPercentage?: number;
}

interface DashboardProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  creditCards: CreditCard[];
  setCreditCards: React.Dispatch<React.SetStateAction<CreditCard[]>>;
}

// Utility functions for number formatting
const formatNumber = (num: number, options?: { compact?: boolean; decimals?: number; forceDecimals?: boolean }) => {
  if (options?.compact) {
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    let suffixIndex = 0;
    let formattedNum = num;

    while (formattedNum >= 1000 && suffixIndex < suffixes.length - 1) {
      formattedNum /= 1000;
      suffixIndex++;
    }

    const decimals = options.decimals ?? 1;
    const formatted = formattedNum.toFixed(decimals);

    // Remove trailing zeros and decimal point if not needed
    return formatted.replace(/\.0+$/, '') + suffixes[suffixIndex];
  }

  const decimals = options?.decimals ?? 2;
  if (options?.forceDecimals) {
    return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
};

const getResponsiveTextSize = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1000000000) return 'text-lg'; // Billions
  if (absValue >= 1000000) return 'text-xl'; // Millions
  if (absValue >= 100000) return 'text-2xl'; // Hundred thousands
  return 'text-2xl'; // Default
};

const getInputWidth = (value: string): string => {
  const length = value.length;
  if (length <= 7) return 'w-20'; // Small numbers
  if (length <= 10) return 'w-24'; // Medium numbers
  if (length <= 15) return 'w-32'; // Large numbers
  return 'w-40'; // Very large numbers
};

// Credit card database for auto-suggestions
const creditCardDatabase = {
  chase: [
    'Chase Sapphire Preferred',
    'Chase Sapphire Reserve',
    'Chase Freedom Unlimited',
    'Chase Freedom Flex',
    'Chase Slate Edge',
    'Chase Amazon Prime Rewards',
    'Chase Southwest Rapid Rewards',
    'Chase United Explorer',
    'Chase Marriott Bonvoy'
  ],
  amex: [
    'American Express Gold Card',
    'American Express Platinum Card',
    'American Express Green Card',
    'American Express Blue Cash Preferred',
    'American Express Blue Cash Everyday',
    'American Express Delta SkyMiles Gold',
    'American Express Marriott Bonvoy',
    'American Express Hilton Honors'
  ],
  'american express': [
    'American Express Gold Card',
    'American Express Platinum Card',
    'American Express Green Card',
    'American Express Blue Cash Preferred',
    'American Express Blue Cash Everyday',
    'American Express Delta SkyMiles Gold',
    'American Express Marriott Bonvoy',
    'American Express Hilton Honors'
  ],
  citi: [
    'Citi Double Cash Card',
    'Citi Custom Cash Card',
    'Citi Premier Card',
    'Citi Rewards+ Card',
    'Citi Diamond Preferred',
    'Citi AAdvantage Platinum',
    'Citi Costco Anywhere',
    'Citi Simplicity'
  ],
  discover: [
    'Discover it Cash Back',
    'Discover it Miles',
    'Discover it Chrome',
    'Discover it Student Cash Back',
    'Discover it Secured'
  ],
  'capital one': [
    'Capital One Venture Rewards',
    'Capital One VentureOne Rewards',
    'Capital One Savor Cash Rewards',
    'Capital One SavorOne Cash Rewards',
    'Capital One Quicksilver Cash Rewards',
    'Capital One QuicksilverOne',
    'Capital One Platinum'
  ],
  wells: [
    'Wells Fargo Active Cash Card',
    'Wells Fargo Reflect Card',
    'Wells Fargo Propel Card',
    'Wells Fargo Platinum Card',
    'Wells Fargo Cash Wise'
  ],
  'wells fargo': [
    'Wells Fargo Active Cash Card',
    'Wells Fargo Reflect Card',
    'Wells Fargo Propel Card',
    'Wells Fargo Platinum Card',
    'Wells Fargo Cash Wise'
  ],
  'bank of america': [
    'Bank of America Travel Rewards',
    'Bank of America Cash Rewards',
    'Bank of America Unlimited Cash Rewards',
    'Bank of America Premium Rewards',
    'Bank of America Customized Cash Rewards'
  ],
  boa: [
    'Bank of America Travel Rewards',
    'Bank of America Cash Rewards',
    'Bank of America Unlimited Cash Rewards',
    'Bank of America Premium Rewards',
    'Bank of America Customized Cash Rewards'
  ],
  'navy federal': [
    'Navy Federal cashRewards Credit Card',
    'Navy Federal Platinum Credit Card',
    'Navy Federal More Rewards American Express Card',
    'Navy Federal GO REWARDS Credit Card',
    'Navy Federal Flagship Rewards Credit Card',
    'Navy Federal nRewards Secured Credit Card',
    'Navy Federal Business Credit Card'
  ],
  nfcu: [
    'Navy Federal cashRewards Credit Card',
    'Navy Federal Platinum Credit Card',
    'Navy Federal More Rewards American Express Card',
    'Navy Federal GO REWARDS Credit Card',
    'Navy Federal Flagship Rewards Credit Card',
    'Navy Federal nRewards Secured Credit Card',
    'Navy Federal Business Credit Card'
  ]
};

// Function to generate CSS-based card image
const generateCardImage = (cardName: string, color1: string, color2: string): string => {
  const cardWidth = 300;
  const cardHeight = 190;
  const gradientId = `cardGradient${Math.random().toString(36).substr(2, 9)}`;
  
  // Create SVG with credit card design
  const svg = `<svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${cardWidth}" height="${cardHeight}" rx="15" ry="15" fill="url(#${gradientId})" />
      <rect x="20" y="30" width="260" height="20" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="20" y="60" width="80" height="40" rx="5" fill="rgba(255,255,255,0.3)" />
      <text x="25" y="130" font-family="monospace" font-size="16" font-weight="bold" fill="white">•••• •••• •••• ••••</text>
      <text x="25" y="155" font-family="sans-serif" font-size="12" font-weight="bold" fill="white">${cardName.substring(0, 18)}</text>
      <text x="220" y="155" font-family="sans-serif" font-size="10" fill="rgba(255,255,255,0.8)">CREDIT</text>
    </svg>`;
  
  try {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  } catch (e) {
    // Fallback if btoa fails
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
};

// Credit card image mapping - using CSS-generated card designs for reliability
const creditCardImages: { [key: string]: string } = {
  // Chase Cards - Blue theme
  'Chase Sapphire Preferred': generateCardImage('Chase Sapphire Preferred', '#003087', '#0066CC'),
  'Chase Sapphire Reserve': generateCardImage('Chase Sapphire Reserve', '#000000', '#1a1a1a'),
  'Chase Freedom Unlimited': generateCardImage('Chase Freedom Unlimited', '#003087', '#0066CC'),
  'Chase Freedom Flex': generateCardImage('Chase Freedom Flex', '#003087', '#0066CC'),
  'Chase Slate Edge': generateCardImage('Chase Slate Edge', '#666666', '#888888'),
  'Chase Amazon Prime Rewards': generateCardImage('Chase Amazon Prime', '#FF9900', '#FF6600'),
  'Chase Southwest Rapid Rewards': generateCardImage('Chase Southwest', '#304CB2', '#1E3A8A'),
  'Chase United Explorer': generateCardImage('Chase United', '#0F4C81', '#1E40AF'),
  'Chase Marriott Bonvoy': generateCardImage('Chase Marriott', '#8B0000', '#DC2626'),
  
  // American Express Cards - Gold/Green theme
  'American Express Gold Card': generateCardImage('Amex Gold', '#D4AF37', '#B8860B'),
  'American Express Platinum Card': generateCardImage('Amex Platinum', '#C0C0C0', '#A0A0A0'),
  'American Express Green Card': generateCardImage('Amex Green', '#228B22', '#006400'),
  'American Express Blue Cash Preferred': generateCardImage('Amex Blue Cash+', '#0066CC', '#004499'),
  'American Express Blue Cash Everyday': generateCardImage('Amex Blue Cash', '#4169E1', '#0000CD'),
  'American Express Delta SkyMiles Gold': generateCardImage('Amex Delta Gold', '#D4AF37', '#B8860B'),
  'American Express Marriott Bonvoy': generateCardImage('Amex Marriott', '#8B0000', '#DC2626'),
  'American Express Hilton Honors': generateCardImage('Amex Hilton', '#0066CC', '#004499'),
  
  // Citi Cards - Red theme
  'Citi Double Cash Card': generateCardImage('Citi Double Cash', '#DC143C', '#B91C1C'),
  'Citi Custom Cash Card': generateCardImage('Citi Custom Cash', '#DC143C', '#B91C1C'),
  'Citi Premier Card': generateCardImage('Citi Premier', '#000000', '#1a1a1a'),
  'Citi Rewards+ Card': generateCardImage('Citi Rewards+', '#DC143C', '#B91C1C'),
  'Citi Diamond Preferred': generateCardImage('Citi Diamond', '#C0C0C0', '#A0A0A0'),
  'Citi AAdvantage Platinum': generateCardImage('Citi AAdvantage', '#C0C0C0', '#A0A0A0'),
  'Citi Costco Anywhere': generateCardImage('Citi Costco', '#E31837', '#DC2626'),
  'Citi Simplicity': generateCardImage('Citi Simplicity', '#DC143C', '#B91C1C'),
  
  // Discover Cards - Orange theme
  'Discover it Cash Back': generateCardImage('Discover it Cash', '#FF6000', '#EA580C'),
  'Discover it Miles': generateCardImage('Discover it Miles', '#FF6000', '#EA580C'),
  'Discover it Chrome': generateCardImage('Discover it Chrome', '#C0C0C0', '#A0A0A0'),
  'Discover it Student Cash Back': generateCardImage('Discover Student', '#FF6000', '#EA580C'),
  'Discover it Secured': generateCardImage('Discover Secured', '#FF6000', '#EA580C'),
  
  // Capital One Cards - Red theme
  'Capital One Venture Rewards': generateCardImage('Capital One Venture', '#E31837', '#DC2626'),
  'Capital One VentureOne Rewards': generateCardImage('Capital One VentureOne', '#E31837', '#DC2626'),
  'Capital One Savor Cash Rewards': generateCardImage('Capital One Savor', '#E31837', '#DC2626'),
  'Capital One SavorOne Cash Rewards': generateCardImage('Capital One SavorOne', '#E31837', '#DC2626'),
  'Capital One Quicksilver Cash Rewards': generateCardImage('Capital One Quicksilver', '#C0C0C0', '#A0A0A0'),
  'Capital One QuicksilverOne': generateCardImage('Capital One QuicksilverOne', '#C0C0C0', '#A0A0A0'),
  'Capital One Platinum': generateCardImage('Capital One Platinum', '#C0C0C0', '#A0A0A0'),
  
  // Wells Fargo Cards - Red/Gold theme
  'Wells Fargo Active Cash Card': generateCardImage('Wells Fargo Active', '#D4001A', '#DC2626'),
  'Wells Fargo Reflect Card': generateCardImage('Wells Fargo Reflect', '#D4001A', '#DC2626'),
  'Wells Fargo Propel Card': generateCardImage('Wells Fargo Propel', '#D4001A', '#DC2626'),
  'Wells Fargo Platinum Card': generateCardImage('Wells Fargo Platinum', '#C0C0C0', '#A0A0A0'),
  'Wells Fargo Cash Wise': generateCardImage('Wells Fargo Cash Wise', '#D4001A', '#DC2626'),
  
  // Bank of America Cards - Red/Blue theme
  'Bank of America Travel Rewards': generateCardImage('BofA Travel', '#E31837', '#DC2626'),
  'Bank of America Cash Rewards': generateCardImage('BofA Cash', '#E31837', '#DC2626'),
  'Bank of America Unlimited Cash Rewards': generateCardImage('BofA Unlimited', '#E31837', '#DC2626'),
  'Bank of America Premium Rewards': generateCardImage('BofA Premium', '#000000', '#1a1a1a'),
  'Bank of America Customized Cash Rewards': generateCardImage('BofA Customized', '#E31837', '#DC2626'),
  
  // Navy Federal Cards - Navy blue theme
  'Navy Federal cashRewards Credit Card': generateCardImage('NFCU cashRewards', '#003366', '#1E40AF'),
  'Navy Federal Platinum Credit Card': generateCardImage('NFCU Platinum', '#C0C0C0', '#A0A0A0'),
  'Navy Federal More Rewards American Express Card': generateCardImage('NFCU More Rewards', '#003366', '#1E40AF'),
  'Navy Federal GO REWARDS Credit Card': generateCardImage('NFCU GO REWARDS', '#003366', '#1E40AF'),
  'Navy Federal Flagship Rewards Credit Card': generateCardImage('NFCU Flagship', '#000000', '#1a1a1a'),
  'Navy Federal nRewards Secured Credit Card': generateCardImage('NFCU nRewards', '#003366', '#1E40AF'),
  'Navy Federal Business Credit Card': generateCardImage('NFCU Business', '#003366', '#1E40AF'),
  
  // Default fallback images by issuer
  'chase': 'https://logos-world.net/wp-content/uploads/2021/02/Chase-Logo.png',
  'amex': 'https://logos-world.net/wp-content/uploads/2020/04/American-Express-Logo.png',
  'citi': 'https://logos-world.net/wp-content/uploads/2020/07/Citi-Logo.png',
  'discover': 'https://logos-world.net/wp-content/uploads/2020/04/Discover-Logo.png',
  'capital one': 'https://logos-world.net/wp-content/uploads/2021/02/Capital-One-Logo.png',
  'wells fargo': 'https://logos-world.net/wp-content/uploads/2020/04/Wells-Fargo-Logo.png',
  'bank of america': 'https://logos-world.net/wp-content/uploads/2020/04/Bank-of-America-Logo.png',
  'navy federal': 'https://www.navyfederal.org/content/dam/nfcu/branding/logos/nfcu-logo.png'
};

// Function to get credit card image URL
const getCreditCardImage = (cardName: string): string => {
  // First try exact match
  if (creditCardImages[cardName]) {
    return creditCardImages[cardName];
  }
  
  // Then try to match by issuer
  const cardNameLower = cardName.toLowerCase();
  const issuer = Object.keys(creditCardDatabase).find(key => 
    cardNameLower.includes(key) || key.includes(cardNameLower.split(' ')[0])
  );
  
  if (issuer && creditCardImages[issuer]) {
    return creditCardImages[issuer];
  }
  
  // Default credit card placeholder
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE5MCIgdmlld0JveD0iMCAwIDMwMCAxOTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTkwIiByeD0iMTUiIGZpbGw9IiM0Qzc5QTQiLz4KPHN2ZyB4PSI2MCIgeT0iNDAiIHdpZHRoPSIxODAiIGhlaWdodD0iMTEwIiB2aWV3Qm94PSIwIDAgMTgwIDExMCI+CjxyZWN0IHdpZHRoPSIxODAiIGhlaWdodD0iMjAiIGZpbGw9IiMzMzMiLz4KPHN2ZyB5PSI0MCI+Cjx0ZXh0IHg9IjEwIiB5PSIyMCIgZmlsbD0iI0ZGRiIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPuKXgOKXgOKXgOKXgCDilYDilYDilYAg4paE4paE4paE4paEPC90ZXh0Pgo8dGV4dCB4PSIxMCIgeT0iNDAiIGZpbGw9IiNGRkYiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIj5DUkVESVQgQ0FSRDY8L3RleHQ+CjwvZy4cL3N2Zz4KPC9zdmc+';
};

export default function Dashboard({ isDarkMode, toggleTheme, creditCards, setCreditCards }: DashboardProps) {
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [newCard, setNewCard] = useState({
    name: '',
    creditLimit: '',
    apr: '',
    dueDate: '',
    debt: '',
    pointsBalance: '',
    rewardType: 'points' as 'points' | 'miles' | 'cashback' | 'hotel' | 'travel',
    bank: ''
  });
  const [cardSuggestions, setCardSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch credit cards from API
  const fetchCreditCardsData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:9002/api/credit-cards');
      if (response.ok) {
        const data = await response.json();
        setCreditCards(data);
      }
    } catch (error) {
      console.error('Error fetching credit cards:', error);
    }
  };

  useEffect(() => {
    fetchCreditCardsData();
    fetchCryptoAssets();
  }, []);

  const handleCardNameChange = (value: string) => {
    setNewCard({ ...newCard, name: value });
    
    if (value.length > 2) {
      const searchKey = value.toLowerCase();
      const suggestions: string[] = [];
      
      // Search through credit card database
      Object.keys(creditCardDatabase).forEach(issuer => {
        if (issuer.includes(searchKey) || searchKey.includes(issuer)) {
          suggestions.push(...(creditCardDatabase as any)[issuer]);
        }
      });
      
      // Also search individual card names
      Object.values(creditCardDatabase).forEach(cards => {
        cards.forEach(card => {
          if (card.toLowerCase().includes(searchKey) && !suggestions.includes(card)) {
            suggestions.push(card);
          }
        });
      });
      
      setCardSuggestions(suggestions.slice(0, 8)); // Limit to 8 suggestions
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
      setCardSuggestions([]);
    }
  };

  const selectCardSuggestion = (cardName: string) => {
    setNewCard({ ...newCard, name: cardName });
    setShowSuggestions(false);
    setCardSuggestions([]);
  };

  // Fetch crypto assets from API
  const fetchCryptoAssets = async () => {
    try {
      const response = await fetch('http://127.0.0.1:9002/api/crypto-assets');
      if (response.ok) {
        const data = await response.json();
        setCryptoAssets(data);
      }
    } catch (error) {
      console.error('Error fetching crypto assets:', error);
    }
  };

  const [showLoanForm, setShowLoanForm] = useState(false);
  // Load loans from localStorage or default to empty array
  const loadLoansFromStorage = (): Loan[] => {
    const savedLoans = loadFromStorage(STORAGE_KEYS.LOANS, []);
    // Ensure proper date parsing and ID generation
    return savedLoans.map((loan: any) => ({
      ...loan,
      id: loan.id || `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originationDate: loan.originationDate ? new Date(loan.originationDate) : undefined
    }));
  };

  // Save loans to localStorage
  const saveLoansToStorage = (loansToSave: Loan[]) => {
    saveToStorage(STORAGE_KEYS.LOANS, loansToSave);
  };

  const [loans, setLoans] = useState<Loan[]>(loadLoansFromStorage);

  // Save loans to localStorage whenever loans change
  useEffect(() => {
    saveLoansToStorage(loans);
  }, [loans]);
  const [newLoan, setNewLoan] = useState({
    name: '',
    originalAmount: '',
    currentBalance: '',
    interestRate: '',
    monthlyPayment: '',
    loanType: '',
    originationDate: '',
    paymentDate: ''
  });

  const [showCryptoForm, setShowCryptoForm] = useState(false);
  const [editingCrypto, setEditingCrypto] = useState<CryptoAsset | null>(null);
  // Load crypto assets from localStorage or default to empty array
  const loadCryptoAssetsFromStorage = (): CryptoAsset[] => {
    return loadFromStorage(STORAGE_KEYS.CRYPTO_ASSETS, []);
  };

  // Save crypto assets to localStorage
  const saveCryptoAssetsToStorage = (assetsToSave: CryptoAsset[]) => {
    saveToStorage(STORAGE_KEYS.CRYPTO_ASSETS, assetsToSave);
  };

  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>(loadCryptoAssetsFromStorage);

  // Save crypto assets to localStorage whenever they change
  useEffect(() => {
    saveCryptoAssetsToStorage(cryptoAssets);
  }, [cryptoAssets]);
  const [newCrypto, setNewCrypto] = useState({
    symbol: '',
    quantity: '',
    averageCost: '',
    currentPrice: '',
    platform: '',
    walletAddress: ''
  });

  // Expense management state
  const loadExpensesFromStorage = (): Expense[] => {
    return loadFromStorage(STORAGE_KEYS.EXPENSES, []);
  };

  const saveExpensesToStorage = (expenses: Expense[]) => {
    saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
  };

  const [expenses, setExpenses] = useState<Expense[]>(loadExpensesFromStorage);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    category: 'food',
    frequency: 'monthly' as 'monthly' | 'weekly' | 'daily' | 'yearly',
    isRecurring: true
  });

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    saveExpensesToStorage(expenses);
  }, [expenses]);

  const [balances, setBalances] = useState(() => 
    loadFromStorage(STORAGE_KEYS.BALANCES, {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0
    })
  );

  const [creditScore, setCreditScore] = useState(() => loadFromStorage(STORAGE_KEYS.CREDIT_SCORE, 0));

  // UI: header actions
  const [showSettings, setShowSettings] = useState(false);
  const [showDebtBreakdown, setShowDebtBreakdown] = useState(false);
  const [showMinPaymentDropdown, setShowMinPaymentDropdown] = useState(false);






  // Calculate total credit card debt from all cards
  const totalCreditCardDebt = creditCards.reduce((total, card) => total + (card.currentBalance || card.debt || 0), 0);
  
  // Calculate total credit limit from all cards
  const totalCreditLimit = creditCards.reduce((total, card) => total + (card.creditLimit || 0), 0);
  
  // Calculate total loan debt from all loans
  const totalLoanDebt = loans.reduce((total, loan) => total + (loan.currentBalance || 0), 0);
  
  // Calculate total crypto value
  const totalCryptoValue = cryptoAssets.reduce((total, asset) => total + (asset.totalValue || 0), 0);
  
  // Calculate credit card and loan payments
  const totalCreditCardMinPayments = creditCards.reduce((total, card) => total + (card.calculatedMinimumPayment || 0), 0);
  const totalLoanPayments = loans.reduce((total, loan) => total + (loan.monthlyPayment || 0), 0);
  // Calculate total expenses 
  const calculateMonthlyExpenseAmount = (expense: Expense): number => {
    switch (expense.frequency) {
      case 'daily': return expense.amount * 30;
      case 'weekly': return expense.amount * 4.33;
      case 'monthly': return expense.amount;
      case 'yearly': return expense.amount / 12;
      default: return expense.amount;
    }
  };

  const totalMonthlyExpenses = expenses.reduce((total, expense) => 
    total + calculateMonthlyExpenseAmount(expense), 0
  );

  // Calculate total minimum payments (credit cards + loans + expenses)
  const totalMinimumPayments = totalCreditCardMinPayments + totalLoanPayments + totalMonthlyExpenses;

  const [showBalanceForm, setShowBalanceForm] = useState(false);
  const [editingBalance, setEditingBalance] = useState('');
  const [tempBalance, setTempBalance] = useState('');



  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [showLoanEditForm, setShowLoanEditForm] = useState(false);
  // Load monthly income from localStorage or default to 5000
  const loadMonthlyIncomeFromStorage = (): number => {
    return loadFromStorage(STORAGE_KEYS.MONTHLY_INCOME, 5000);
  };

  // Save monthly income to localStorage
  const saveMonthlyIncomeToStorage = (income: number) => {
    saveToStorage(STORAGE_KEYS.MONTHLY_INCOME, income);
  };

  const [monthlyIncome, setMonthlyIncome] = useState(loadMonthlyIncomeFromStorage);
  const [editingIncome, setEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState(monthlyIncome.toString());

  // Save monthly income to localStorage whenever it changes
  useEffect(() => {
    saveMonthlyIncomeToStorage(monthlyIncome);
  }, [monthlyIncome]);
  // Load custom assets from localStorage or default to zeros
  const loadCustomAssetsFromStorage = (): { crypto: number; bank: number } => {
    return loadFromStorage(STORAGE_KEYS.CUSTOM_ASSETS, { crypto: 0, bank: 0 });
  };

  // Save custom assets to localStorage
  const saveCustomAssetsToStorage = (assets: { crypto: number; bank: number }) => {
    saveToStorage(STORAGE_KEYS.CUSTOM_ASSETS, assets);
  };

  const [customAssets, setCustomAssets] = useState(loadCustomAssetsFromStorage);

  // Save custom assets to localStorage whenever they change
  useEffect(() => {
    saveCustomAssetsToStorage(customAssets);
  }, [customAssets]);

  // Save credit score to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CREDIT_SCORE, creditScore);
  }, [creditScore]);

  // Save balances to localStorage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.BALANCES, balances);
  }, [balances]);
  const [tempAssetValues, setTempAssetValues] = useState<{
    crypto: string;
    bank: string;
  }>({
    crypto: '0',
    bank: '0'
  });

  const handleEditAsset = (assetType: string, currentValue: number) => {
    setEditingAsset(assetType);
    setTempAssetValues({
      ...tempAssetValues,
      [assetType]: currentValue.toString()
    });
  };

  const handleSaveAsset = (assetType: string) => {
    const newValue = parseFloat(tempAssetValues[assetType as keyof typeof tempAssetValues]) || 0;
    setCustomAssets({
      ...customAssets,
      [assetType]: newValue
    });
    setEditingAsset(null);
  };

  const handleCancelAssetEdit = () => {
    setEditingAsset(null);
    setTempAssetValues({
      crypto: customAssets.crypto.toString(),
      bank: customAssets.bank.toString()
    });
  };

  const handleEditIncome = () => {
    setEditingIncome(true);
    setTempIncome(monthlyIncome.toString());
  };

  const handleSaveIncome = () => {
    const newIncome = parseFloat(tempIncome) || 0;
    setMonthlyIncome(newIncome);
    setEditingIncome(false);
  };

  const handleCancelIncomeEdit = () => {
    setEditingIncome(false);
    setTempIncome(monthlyIncome.toString());
  };

  // Update tempIncome when monthlyIncome changes
  useEffect(() => {
    setTempIncome(monthlyIncome.toString());
  }, [monthlyIncome]);

  const handleEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setNewLoan({
      name: loan.name,
      originalAmount: loan.originalAmount.toString(),
      currentBalance: loan.currentBalance.toString(),
      interestRate: loan.interestRate.toString(),
      monthlyPayment: loan.monthlyPayment.toString(),
      loanType: loan.loanType,
      originationDate: loan.originationDate || '',
      paymentDate: loan.paymentDate || ''
    });
    setShowLoanEditForm(true);
  };

  const handleSaveLoanEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoan) return;

    if (newLoan.name && newLoan.originalAmount && newLoan.currentBalance && newLoan.interestRate && newLoan.monthlyPayment && newLoan.loanType) {
      const updatedLoan: Loan = {
        ...editingLoan,
        name: newLoan.name,
        originalAmount: parseFloat(newLoan.originalAmount),
        currentBalance: parseFloat(newLoan.currentBalance),
        interestRate: parseFloat(newLoan.interestRate),
        monthlyPayment: parseFloat(newLoan.monthlyPayment),
        loanType: newLoan.loanType,
        originationDate: newLoan.originationDate || undefined,
        paymentDate: newLoan.paymentDate || undefined
      };

      const updatedLoans = loans.map(loan =>
        loan.id === editingLoan.id ? updatedLoan : loan
      );
      setLoans(updatedLoans);

      setNewLoan({
        name: '',
        originalAmount: '',
        currentBalance: '',
        interestRate: '',
        monthlyPayment: '',
        loanType: '',
        originationDate: '',
        paymentDate: ''
      });
      setEditingLoan(null);
      setShowLoanEditForm(false);
    }
  };

  const handleRemoveLoan = (loanId: string) => {
    if (window.confirm('Are you sure you want to remove this loan?')) {
      setLoans(loans.filter(loan => loan.id !== loanId));
    }
  };

  // Calculate debt-to-income ratio
  const debtToIncomeRatio = monthlyIncome > 0 ? (totalMinimumPayments / monthlyIncome) * 100 : 0;
  const incomeAfterDebt = monthlyIncome - totalMinimumPayments;

  // Pie chart data for debt-to-income
  const debtToIncomeData = [
    {
      name: 'Monthly Income',
      value: Math.max(0, incomeAfterDebt),
      color: isDarkMode ? '#10B981' : '#059669' // Green for income
    },
    {
      name: 'Monthly Debt Payments',
      value: totalMinimumPayments,
      color: isDarkMode ? '#EF4444' : '#DC2626' // Red for debt
    }
  ].filter(item => item.value > 0); // Only show items with values

  // Calculate display values (custom or calculated)
  const displayCryptoValue = customAssets.crypto || totalCryptoValue;
  const displayBankValue = customAssets.bank;
  const displayTotalAssets = displayCryptoValue + displayBankValue;

  const handleAddCreditCard = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', newCard);
    
    if (newCard.name && newCard.creditLimit && newCard.apr && newCard.dueDate && newCard.debt !== '') {
      try {
        const cardData = {
          name: newCard.name,
          creditLimit: parseFloat(newCard.creditLimit),
          apr: parseFloat(newCard.apr),
          currentBalance: parseFloat(newCard.debt),
          dueDate: newCard.dueDate,
          pointsBalance: parseInt(newCard.pointsBalance) || 0,
          rewardType: newCard.rewardType,
          bank: newCard.bank,
          lastFourDigits: '0000' // Default for demo
        };

        console.log('Sending card data to API:', cardData);

        const response = await fetch('http://127.0.0.1:9002/api/credit-cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cardData)
        });
        
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const newCardData = await response.json();
          console.log('New card data received:', newCardData);
          setCreditCards([...creditCards, newCardData]);
          setNewCard({ name: '', creditLimit: '', apr: '', dueDate: '', debt: '', pointsBalance: '', rewardType: 'points', bank: '' });
          setShowCreditCardForm(false);
        } else {
          const errorData = await response.text();
          console.error('API error:', errorData);
        }
      } catch (error) {
        console.error('Error adding credit card:', error);
      }
    } else {
      console.log('Form validation failed. Missing fields:');
      console.log('name:', !newCard.name);
      console.log('creditLimit:', !newCard.creditLimit);
      console.log('apr:', !newCard.apr);
      console.log('dueDate:', !newCard.dueDate);
      console.log('debt:', newCard.debt === '');
    }
  };

  const handleEditCreditCard = (card: CreditCard) => {
    setEditingCard(card);
    setNewCard({
      name: card.name,
      creditLimit: card.creditLimit.toString(),
      apr: card.apr.toString(),
      dueDate: card.dueDate || '',
      debt: card.currentBalance?.toString() || card.debt?.toString() || '0',
      pointsBalance: card.pointsBalance?.toString() || '0',
      rewardType: card.rewardType || 'points',
      bank: card.bank || ''
    });
    setShowCreditCardForm(true);
  };

  const handleUpdateCreditCard = async () => {
    if (newCard.name && newCard.creditLimit && newCard.apr && newCard.dueDate && newCard.debt !== '') {
      try {
        const cardData = {
          name: newCard.name,
          creditLimit: parseFloat(newCard.creditLimit),
          apr: parseFloat(newCard.apr),
          currentBalance: parseFloat(newCard.debt),
          dueDate: newCard.dueDate,
          pointsBalance: parseInt(newCard.pointsBalance) || 0,
          rewardType: newCard.rewardType,
          bank: newCard.bank
        };

        const response = await fetch(`http://127.0.0.1:9002/api/credit-cards/${editingCard?.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cardData)
        });

        if (response.ok) {
          const updatedCardData = await response.json();
          setCreditCards(creditCards.map(card =>
            card.id === editingCard?.id ? updatedCardData : card
          ));
          setNewCard({ name: '', creditLimit: '', apr: '', dueDate: '', debt: '', pointsBalance: '', rewardType: 'points', bank: '' });
          setEditingCard(null);
          setShowCreditCardForm(false);
        } else {
          console.error('Error updating credit card:', await response.text());
        }
      } catch (error) {
        console.error('Error updating credit card:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setNewCard({ name: '', creditLimit: '', apr: '', dueDate: '', debt: '', pointsBalance: '', rewardType: 'points', bank: '' });
    setShowCreditCardForm(false);
    setShowSuggestions(false);
    setCardSuggestions([]);
  };

  const handleDeleteCreditCard = async (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this credit card?')) {
      try {
        const response = await fetch(`http://127.0.0.1:9002/api/credit-cards/${cardId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setCreditCards(creditCards.filter(card => card.id !== cardId));
        } else {
          console.error('Error deleting credit card');
        }
      } catch (error) {
        console.error('Error deleting credit card:', error);
      }
    }
  };

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLoan.name && newLoan.originalAmount && newLoan.currentBalance && newLoan.interestRate && newLoan.monthlyPayment && newLoan.loanType) {
      const loan = {
        id: Date.now().toString(),
        name: newLoan.name,
        originalAmount: parseFloat(newLoan.originalAmount),
        currentBalance: parseFloat(newLoan.currentBalance),
        interestRate: parseFloat(newLoan.interestRate),
        monthlyPayment: parseFloat(newLoan.monthlyPayment),
        loanType: newLoan.loanType,
        originationDate: newLoan.originationDate || undefined,
        paymentDate: newLoan.paymentDate || undefined
      };
      setLoans([...loans, loan]);
      setNewLoan({ name: '', originalAmount: '', currentBalance: '', interestRate: '', monthlyPayment: '', loanType: '', originationDate: '', paymentDate: '' });
      setShowLoanForm(false);
    }
  };


  const handleSaveBalance = () => {
    if (tempBalance !== '' && !isNaN(parseFloat(tempBalance))) {
      if (editingBalance === 'creditScore') {
        // Validate credit score range (300-850)
        const score = Math.max(300, Math.min(850, parseInt(tempBalance)));
        setCreditScore(score);
      } else {
        setBalances((prev: typeof balances) => ({
          ...prev,
          [editingBalance as keyof typeof prev]: parseFloat(tempBalance)
        }));
      }
    }
    setShowBalanceForm(false);
    setEditingBalance('');
    setTempBalance('');
  };




  const handleAddCryptoAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding crypto asset with data:', newCrypto);
    
    if (newCrypto.symbol) {
      try {
        const cryptoData = {
          symbol: newCrypto.symbol.toUpperCase(),
          quantity: parseFloat(newCrypto.quantity) || 0,
          averageCost: parseFloat(newCrypto.averageCost) || 0,
          currentPrice: parseFloat(newCrypto.currentPrice) || 0,
          platform: newCrypto.platform,
          walletAddress: newCrypto.walletAddress
        };

        console.log('Sending crypto data to API:', cryptoData);

        const response = await fetch('http://127.0.0.1:9002/api/crypto-assets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cryptoData)
        });
        
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const newCryptoData = await response.json();
          console.log('New crypto data received:', newCryptoData);
          setCryptoAssets([...cryptoAssets, newCryptoData]);
          setNewCrypto({ symbol: '', quantity: '', averageCost: '', currentPrice: '', platform: '', walletAddress: '' });
          setShowCryptoForm(false);
        } else {
          const errorData = await response.text();
          console.error('API error:', errorData);
        }
      } catch (error) {
        console.error('Error adding crypto asset:', error);
      }
    } else {
      console.log('Form validation failed - missing symbol');
    }
  };

  const handleEditCryptoAsset = (asset: CryptoAsset) => {
    setEditingCrypto(asset);
    setNewCrypto({
      symbol: asset.symbol,
      quantity: asset.quantity.toString(),
      averageCost: asset.averageCost.toString(),
      currentPrice: asset.currentPrice.toString(),
      platform: asset.platform || '',
      walletAddress: asset.walletAddress || ''
    });
    setShowCryptoForm(true);
  };

  const handleUpdateCryptoAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newCrypto.symbol) {
      try {
        const cryptoData = {
          symbol: newCrypto.symbol.toUpperCase(),
          quantity: parseFloat(newCrypto.quantity) || 0,
          averageCost: parseFloat(newCrypto.averageCost) || 0,
          currentPrice: parseFloat(newCrypto.currentPrice) || 0,
          platform: newCrypto.platform,
          walletAddress: newCrypto.walletAddress
        };

        const response = await fetch(`http://127.0.0.1:9002/api/crypto-assets/${editingCrypto?.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cryptoData)
        });
        
        if (response.ok) {
          const updatedCryptoData = await response.json();
          setCryptoAssets(cryptoAssets.map(asset => 
            asset.id === editingCrypto?.id ? updatedCryptoData : asset
          ));
          setNewCrypto({ symbol: '', quantity: '', averageCost: '', currentPrice: '', platform: '', walletAddress: '' });
          setEditingCrypto(null);
          setShowCryptoForm(false);
        }
      } catch (error) {
        console.error('Error updating crypto asset:', error);
      }
    }
  };

  const handleCancelCryptoEdit = () => {
    setEditingCrypto(null);
    setNewCrypto({ symbol: '', quantity: '', averageCost: '', currentPrice: '', platform: '', walletAddress: '' });
    setShowCryptoForm(false);
  };

  const handleDeleteCryptoAsset = async (assetId: string) => {
    if (window.confirm('Are you sure you want to delete this crypto asset?')) {
      try {
        const response = await fetch(`http://127.0.0.1:9002/api/crypto-assets/${assetId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setCryptoAssets(cryptoAssets.filter(asset => asset.id !== assetId));
        }
      } catch (error) {
        console.error('Error deleting crypto asset:', error);
      }
    }
  };

  // Expense management functions
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.name && newExpense.amount) {
      const expense: Expense = {
        id: Date.now().toString(),
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        frequency: newExpense.frequency,
        isRecurring: newExpense.isRecurring
      };
      setExpenses([...expenses, expense]);
      setNewExpense({ name: '', amount: '', category: 'food', frequency: 'monthly', isRecurring: true });
      setShowExpenseForm(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpense({
      name: expense.name,
      amount: expense.amount.toString(),
      category: expense.category,
      frequency: expense.frequency,
      isRecurring: expense.isRecurring
    });
    setShowExpenseForm(true);
  };

  const handleUpdateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    if (newExpense.name && newExpense.amount) {
      const updatedExpense: Expense = {
        ...editingExpense,
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        frequency: newExpense.frequency,
        isRecurring: newExpense.isRecurring
      };
      setExpenses(expenses.map(expense => 
        expense.id === editingExpense.id ? updatedExpense : expense
      ));
      setNewExpense({ name: '', amount: '', category: 'food', frequency: 'monthly', isRecurring: true });
      setEditingExpense(null);
      setShowExpenseForm(false);
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(expense => expense.id !== expenseId));
    }
  };

  const handleCancelExpenseForm = () => {
    setEditingExpense(null);
    setNewExpense({ name: '', amount: '', category: 'food', frequency: 'monthly', isRecurring: true });
    setShowExpenseForm(false);
  };

  const handleWipeAllData = async () => {
    if (window.confirm('Are you sure you want to wipe all data? This action cannot be undone.')) {
      try {
        // Clear server data
        const response = await fetch('http://127.0.0.1:9002/api/data/wipe-all', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to wipe server data');
        }

        // Clear client-side state - ALL state variables
        setCreditCards([]);
        setLoans([]);
        setCryptoAssets([]);
        setExpenses([]);
        setBalances({
          totalBalance: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0
        });
        setCustomAssets({
          crypto: 0,
          bank: 0
        });

        // Refresh data from server after wipe (optional - don't fail if server is down)
        try {
          await fetchCreditCardsData();
          await fetchCryptoAssets();
        } catch (fetchError) {
          console.warn('Could not refresh data from server after wipe:', fetchError);
        }

        setCreditScore(0);
        setMonthlyIncome(0);
        setShowCreditCardForm(false);
        setShowLoanForm(false);
        setShowCryptoForm(false);
        setShowExpenseForm(false);
        setShowBalanceForm(false);
        setShowSettings(false);
        setShowDebtBreakdown(false);
        setShowMinPaymentDropdown(false);
        setShowAssetDropdown(false);
        setShowLoanEditForm(false);
        setShowSuggestions(false);

        // Reset editing states
        setEditingCard(null);
        setEditingCrypto(null);
        setEditingExpense(null);
        setEditingBalance('');
        setEditingAsset(null);
        setEditingLoan(null);
        setTempBalance('');

        // Reset form data
        setNewCard({ name: '', creditLimit: '', apr: '', dueDate: '', debt: '', pointsBalance: '', rewardType: 'points', bank: '' });
        setNewLoan({ name: '', originalAmount: '', currentBalance: '', interestRate: '', monthlyPayment: '', loanType: '', originationDate: '', paymentDate: '' });
        setNewCrypto({ symbol: '', quantity: '', averageCost: '', currentPrice: '', platform: '', walletAddress: '' });
        setNewExpense({ name: '', amount: '', category: 'food', frequency: 'monthly', isRecurring: true });

        // Reset suggestions and UI states
        setCardSuggestions([]);

        // Clear browser storage using centralized utility
        clearAllLocalStorage();

        console.log('All data has been wiped successfully');
      } catch (error) {
        console.error('Error wiping data:', error);
        alert('Failed to wipe all data. Please try again.');
      }
    }
  };

  const handleExportForLLM = async () => {
    try {
      // Prepare comprehensive client data
      const clientData = {
        loans: loans,
        expenses: expenses,
        balances: {
          totalBalance: balances.totalBalance,
          monthlyIncome: balances.monthlyIncome || monthlyIncome,
          monthlyExpenses: balances.monthlyExpenses
        },
        customAssets: customAssets,
        creditScore: creditScore
      };

      const response = await fetch('http://127.0.0.1:9002/api/financial-profile/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ clientData })
      });

      if (!response.ok) {
        throw new Error('Failed to generate financial profile');
      }

      const data = await response.json();
      
      // Copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(data.profile);
        alert('Complete financial profile copied to clipboard! This includes all your credit cards, loans, expenses, assets, and cash flow data. You can now paste it into your financial advisor LLM chat.');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = data.profile;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Complete financial profile copied to clipboard! This includes all your credit cards, loans, expenses, assets, and cash flow data. You can now paste it into your financial advisor LLM chat.');
      }
      
      setShowSettings(false);
    } catch (error) {
      console.error('Error exporting financial profile:', error);
      alert('Failed to export financial profile. Please try again.');
    }
  };

  const handleDownloadProfile = async () => {
    try {
      const response = await fetch('http://127.0.0.1:9002/api/financial-profile/download', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to download financial profile');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `financial-profile-${timestamp}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setShowSettings(false);
    } catch (error) {
      console.error('Error downloading financial profile:', error);
      alert('Failed to download financial profile. Please try again.');
    }
  };



  // Calculate totals by reward type
  const totalByType = creditCards.reduce((acc, card) => {
    const rewardType = card.rewardType || 'points';
    const points = card.pointsBalance || 0;
    acc[rewardType] = (acc[rewardType] || 0) + points;
    return acc;
  }, {} as Record<string, number>);

  // Calculate reward points by bank and type
  const rewardPointsByBank = creditCards.reduce((acc, card) => {
    const bank = card.bank || 'Unknown';
    const rewardType = card.rewardType || 'points';
    const points = card.pointsBalance || 0;

    if (!acc[bank]) {
      acc[bank] = {};
    }
    if (!acc[bank][rewardType]) {
      acc[bank][rewardType] = 0;
    }
    acc[bank][rewardType] += points;

    return acc;
  }, {} as Record<string, Record<string, number>>);

  const totalRewardPoints = creditCards.reduce((total, card) => total + (card.pointsBalance || 0), 0);

  // Credit utilization
  const creditUtilization = totalCreditLimit > 0 ? Math.min(100, Math.max(0, Math.round((totalCreditCardDebt / totalCreditLimit) * 100))) : 0;



  const stats = [
    {
      key: 'totalBalance',
      name: 'Total Balance',
      value: `$${formatNumber(balances.totalBalance, { compact: balances.totalBalance >= 1000000, decimals: 2 })}`,
      icon: DollarSign,
      positive: balances.totalBalance >= 0
    },
    {
      key: 'monthlyIncome',
      name: 'Monthly Income',
      value: `$${formatNumber(balances.monthlyIncome, { compact: balances.monthlyIncome >= 100000, decimals: 2 })}`,
      icon: DollarSign,
      positive: true
    },
    {
      key: 'monthlyExpenses',
      name: 'Monthly Expenses',
      value: `$${formatNumber(balances.monthlyExpenses, { compact: balances.monthlyExpenses >= 100000, decimals: 2 })}`,
      icon: TrendingDown,
      positive: false
    },
    {
      key: 'creditCardDebt',
      name: 'Credit Card Debt',
      value: `$${formatNumber(totalCreditCardDebt, { compact: totalCreditCardDebt >= 100000, decimals: 2 })}`,
      icon: CreditCard,
      positive: totalCreditCardDebt <= 0
    },
    {
      key: 'totalCreditLimit',
      name: 'Total Credit Limit',
      value: `$${formatNumber(totalCreditLimit, { compact: totalCreditLimit >= 1000000, decimals: 2 })}`,
      icon: Wallet,
      positive: true
    },
    {
      key: 'creditScore',
      name: 'Credit Score',
      value: creditScore === 0 ? 'Not Set' : creditScore.toString(),
      icon: Star,
      positive: creditScore >= 670 // "Good" credit starts at 670
    },
    {
      key: 'totalLoanDebt',
      name: 'Total Loan Debt',
      value: `$${formatNumber(totalLoanDebt, { compact: totalLoanDebt >= 1000000, decimals: 2 })}`,
      icon: Home,
      positive: totalLoanDebt <= 0
    },
    {
      key: 'totalCryptoValue',
      name: 'Crypto Portfolio Value',
      value: `$${formatNumber(totalCryptoValue, { compact: totalCryptoValue >= 1000000, decimals: 2 })}`,
      icon: Bitcoin,
      positive: true
    },
    {
      key: 'totalRewardPoints',
      name: 'Total Reward Points',
      value: totalRewardPoints === 0 ? 'No Points' : formatNumber(totalRewardPoints, { compact: totalRewardPoints >= 1000000 }),
      icon: Star,
      positive: totalRewardPoints > 0
    },
    {
      key: 'totalMinimumPayments',
      name: 'Total Minimum Payments',
      value: `$${formatNumber(totalMinimumPayments, { compact: totalMinimumPayments >= 100000, decimals: 2 })}`,
      icon: TrendingDown,
      positive: false
    }
  ];



  return (
    <div className="relative min-h-screen">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed bottom-6 right-6 p-3 rounded-full shadow-lg transition-all duration-200 z-40 ${
          isDarkMode
            ? 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white shadow-orange-500/25'
            : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-orange-600/25'
        } hover:shadow-xl hover:scale-105`}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="space-y-8 relative">
      {/* Header with greeting and actions */}
      <div className="flex items-center justify-between mb-10">
        <div>
        </div>
        <div className="flex items-center space-x-3 relative">
          <div className="relative">
            <button onClick={() => setShowSettings(v => !v)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`} title="Settings">
              <Settings className="w-5 h-5" />
            </button>
            {showSettings && (
              <div className={`absolute right-0 mt-2 w-64 rounded-lg border shadow-lg z-50 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="py-1">
                  <button 
                    onClick={handleExportForLLM} 
                    className={`w-full text-left px-3 py-2 text-sm rounded-t-lg flex items-center space-x-2 ${isDarkMode ? 'text-blue-300 hover:bg-gray-800' : 'text-blue-600 hover:bg-blue-50'}`}
                    title="Copy financial profile to clipboard for LLM"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Copy for Financial Advisor</span>
                  </button>
                  <button 
                    onClick={handleDownloadProfile} 
                    className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 ${isDarkMode ? 'text-green-300 hover:bg-gray-800' : 'text-green-600 hover:bg-green-50'}`}
                    title="Download financial profile as text file"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Profile</span>
                  </button>
                  <hr className={`my-1 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                  <button 
                    onClick={handleWipeAllData} 
                    className={`w-full text-left px-3 py-2 text-sm rounded-b-lg flex items-center space-x-2 ${isDarkMode ? 'text-red-300 hover:bg-gray-800' : 'text-red-600 hover:bg-red-50'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Reset Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Financial Overview - Rich Card Layout */}
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Financial Overview</h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your complete financial snapshot at a glance
            </p>
          </div>
        </div>

        {/* Key Metrics Cards - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Net Worth Card */}
          <div className={`p-6 rounded-xl border shadow-lg transition-all duration-200 hover:shadow-xl ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-orange-500/30'
              : 'bg-gradient-to-br from-white to-orange-50 border-gray-200 hover:border-orange-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'
              }`}>
                <Wallet className={`w-6 h-6 ${
                  isDarkMode ? 'text-orange-300' : 'text-orange-600'
                }`} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  totalCryptoValue > 0
                    ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                    : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  {totalCryptoValue > 0 ? 'Growing' : 'No Assets'}
                </span>
                <button
                  onClick={() => setShowAssetDropdown(!showAssetDropdown)}
                  className={`p-1 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-orange-400 hover:bg-orange-900/30'
                      : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                  title={showAssetDropdown ? 'Hide asset details' : 'Show asset details'}
                >
                  {showAssetDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Net Portfolio Value
              </p>
              <p className={`${getResponsiveTextSize(displayTotalAssets)} font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              } truncate`}>
                ${formatNumber(displayTotalAssets, { compact: displayTotalAssets >= 1000000, decimals: 2 })}
              </p>
              <p className={`text-xs mt-2 ${
                totalCryptoValue > 0 ? 'text-green-600' : 'text-gray-500'
              }`}>
                {totalCryptoValue > 0 ? '↗ Active investments' : 'No crypto assets'}
              </p>
            </div>

            {/* Asset Dropdown */}
            {showAssetDropdown && (
              <div className={`mt-4 pt-4 border-t ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <div className="space-y-3">
                  {/* Crypto Assets */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex items-center gap-2">
                      <Bitcoin className={`w-5 h-5 ${
                        isDarkMode ? 'text-orange-300' : 'text-orange-600'
                      }`} />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Cryptocurrency
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-3 w-full">
                      {editingAsset === 'crypto' ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={tempAssetValues.crypto}
                            onChange={(e) => setTempAssetValues({
                              ...tempAssetValues,
                              crypto: e.target.value
                            })}
                            className={`${getInputWidth(tempAssetValues.crypto)} px-3 py-2 text-sm rounded-lg border ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                            placeholder="0.00"
                          />
                          <button
                            onClick={() => handleSaveAsset('crypto')}
                            className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                            title="Save"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelAssetEdit}
                            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3 w-full">
                          <div className="flex-1 text-center">
                            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                              ${formatNumber(displayCryptoValue, { compact: displayCryptoValue >= 100000, decimals: 2 })}
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {cryptoAssets.length} asset{cryptoAssets.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditAsset('crypto', displayCryptoValue)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? 'text-gray-400 hover:text-orange-400 hover:bg-orange-900/30'
                                : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                            }`}
                            title="Edit crypto value"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank Accounts */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex items-center gap-2">
                      <Building className={`w-5 h-5 ${
                        isDarkMode ? 'text-green-300' : 'text-green-600'
                      }`} />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Bank Accounts
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-3 w-full">
                      {editingAsset === 'bank' ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={tempAssetValues.bank}
                            onChange={(e) => setTempAssetValues({
                              ...tempAssetValues,
                              bank: e.target.value
                            })}
                            className={`${getInputWidth(tempAssetValues.bank)} px-3 py-2 text-sm rounded-lg border ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                            placeholder="0.00"
                          />
                          <button
                            onClick={() => handleSaveAsset('bank')}
                            className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                            title="Save"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelAssetEdit}
                            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3 w-full">
                          <div className="flex-1 text-center">
                            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                              ${formatNumber(displayBankValue, { compact: displayBankValue >= 100000, decimals: 2 })}
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {displayBankValue > 0 ? 'Active' : 'No accounts'}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditAsset('bank', displayBankValue)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? 'text-gray-400 hover:text-green-400 hover:bg-green-900/30'
                                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title="Edit bank value"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Total Assets Summary */}
                  <div className={`pt-3 mt-3 border-t ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div className="flex flex-col items-center gap-2 py-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Total Assets
                      </span>
                      <span className={`${getResponsiveTextSize(displayTotalAssets)} font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                        ${formatNumber(displayTotalAssets, { compact: displayTotalAssets >= 1000000, decimals: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Credit Score Card */}
          <div className={`group p-6 rounded-xl border shadow-lg transition-all duration-200 hover:shadow-xl ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/30'
              : 'bg-gradient-to-br from-white to-blue-50 border-gray-200 hover:border-blue-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Star className={`w-6 h-6 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-600'
                }`} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  creditScore >= 670
                    ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                    : creditScore > 0
                      ? isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                      : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  {creditScore >= 670 ? 'Excellent' : creditScore > 0 ? 'Fair' : 'Not Set'}
                </span>
                <button
                  onClick={() => {
                    setEditingBalance('creditScore');
                    setTempBalance(creditScore.toString());
                    setShowBalanceForm(true);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30'
                      : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  title="Edit credit score"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Credit Score
              </p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {creditScore === 0 ? '—' : creditScore.toLocaleString()}
                </p>
                <button
                  onClick={() => {
                    setEditingBalance('creditScore');
                    setTempBalance(creditScore.toString());
                    setShowBalanceForm(true);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 ${
                    isDarkMode
                      ? 'hover:bg-blue-900/30 text-blue-400'
                      : 'hover:bg-blue-50 text-blue-600'
                  }`}
                  title="Click to edit credit score"
                >
                  <Edit className="w-3 h-3" />
                </button>
              </div>
              <p className={`text-xs mt-2 ${
                creditScore >= 670 ? 'text-green-600' : creditScore > 0 ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                {creditScore >= 670 ? 'Great credit health' : creditScore > 0 ? 'Room for improvement' : 'Set your credit score'}
              </p>
            </div>
            
            {/* Debt to Income Ratio */}
            <div className={`mt-4 pt-4 border-t ${
              isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className={`w-4 h-4 ${
                    isDarkMode ? 'text-purple-300' : 'text-purple-600'
                  }`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Debt-to-Income Ratio
                  </span>
                </div>
                <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {debtToIncomeRatio.toFixed(1)}%
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Debt</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${formatNumber(totalMinimumPayments, { compact: totalMinimumPayments >= 100000, decimals: 2 })}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Income</p>
                  <div className="flex items-center gap-2">
                    {editingIncome ? (
                      <div className="flex items-center gap-1">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                        <input
                          type="number"
                          step="100"
                          value={tempIncome}
                          onChange={(e) => setTempIncome(e.target.value)}
                          className={`w-20 px-2 py-1 text-xs rounded border ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                          placeholder="5000"
                        />
                        <button
                          onClick={handleSaveIncome}
                          className="p-1 rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
                          title="Save"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleCancelIncomeEdit}
                          className="p-1 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${formatNumber(monthlyIncome, { compact: monthlyIncome >= 100000, decimals: 2 })}
                        </span>
                        <button
                          onClick={handleEditIncome}
                          className={`p-1 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'text-gray-400 hover:text-purple-400 hover:bg-purple-900/30'
                              : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                          title="Edit monthly income"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Mini Pie Chart */}
              {debtToIncomeData.length > 0 && (
                <div className="flex justify-center">
                  <div className="w-16 h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={debtToIncomeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={15}
                          outerRadius={25}
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                        >
                          {debtToIncomeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                          labelFormatter={() => ''}
                        />
                        <Text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className={`text-xs font-bold ${
                            isDarkMode ? 'fill-white' : 'fill-gray-900'
                          }`}
                        >
                          {`${debtToIncomeRatio.toFixed(1)}%`}
                        </Text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-600'}`}></div>
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Income</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-red-400' : 'bg-red-600'}`}></div>
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Debt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Debt Card */}
          <div className={`p-6 rounded-xl border shadow-lg transition-all duration-200 hover:shadow-xl ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-red-500/30'
              : 'bg-gradient-to-br from-white to-red-50 border-gray-200 hover:border-red-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <CreditCard className={`w-6 h-6 ${
                  isDarkMode ? 'text-red-300' : 'text-red-600'
                }`} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  totalCreditCardDebt === 0
                    ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                    : isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                }`}>
                  {totalCreditCardDebt === 0 ? 'Debt Free' : 'Has Debt'}
                </span>
                {totalCreditCardDebt > 0 && (
                  <button
                    onClick={() => setShowDebtBreakdown(!showDebtBreakdown)}
                    className={`p-1 rounded-lg transition-colors ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={showDebtBreakdown ? 'Hide card breakdown' : 'Show card breakdown'}
                  >
                    {showDebtBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Credit Debt
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ${totalCreditCardDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-xs mt-2 ${
                totalCreditCardDebt === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalCreditCardDebt === 0 ? 'No credit card debt' : `$${totalCreditCardMinPayments.toFixed(2)}/mo minimum payments`}
              </p>
            </div>

            {/* Credit Card Debt Breakdown */}
            {showDebtBreakdown && totalCreditCardDebt > 0 && (
              <div className={`mt-4 pt-4 border-t ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Debt by Card
                </h4>
                <div className="space-y-1">
                  {creditCards
                    .filter(card => (card.currentBalance || card.debt || 0) > 0)
                    .sort((a, b) => (b.currentBalance || b.debt || 0) - (a.currentBalance || a.debt || 0))
                    .map((card) => {
                      const cardDebt = card.currentBalance || card.debt || 0;
                      return (
                        <div key={card.id} className={`flex items-center justify-between py-1 px-2 rounded ${
                          isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                        }`}>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {card.name}
                          </span>
                          <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ${cardDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Monthly Expenses Card */}
          <div className={`p-6 rounded-xl border shadow-lg transition-all duration-200 hover:shadow-xl ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-purple-500/30'
              : 'bg-gradient-to-br from-white to-purple-50 border-gray-200 hover:border-purple-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  totalMinimumPayments < 500
                    ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                    : totalMinimumPayments < 1000
                      ? isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                      : isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                }`}>
                  {totalMinimumPayments < 500 ? 'Low' : totalMinimumPayments < 1000 ? 'Moderate' : 'High'}
                </span>
                <button
                  onClick={() => setShowMinPaymentDropdown(!showMinPaymentDropdown)}
                  className={`p-1 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-purple-400 hover:bg-purple-900/30'
                      : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                  title={showMinPaymentDropdown ? 'Hide payment breakdown' : 'Show payment breakdown'}
                >
                  {showMinPaymentDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Monthly Minimums
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ${totalMinimumPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-xs mt-2 ${
                totalMinimumPayments < 500 ? 'text-green-600' : totalMinimumPayments < 1000 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                Combined credit, loan & expense payments
              </p>
            </div>

            {/* Minimum Payment Breakdown Dropdown */}
            {showMinPaymentDropdown && (
              <div className={`mt-4 pt-4 border-t ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Payment Breakdown
                </h4>
                <div className="space-y-3">
                  {/* Credit Card Minimum Payments */}
                  {creditCards.filter(card => (card.calculatedMinimumPayment || 0) > 0).length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className={`w-4 h-4 ${
                          isDarkMode ? 'text-purple-300' : 'text-purple-600'
                        }`} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Credit Cards
                        </span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${totalCreditCardMinPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {creditCards
                          .filter(card => (card.calculatedMinimumPayment || 0) > 0)
                          .map((card) => (
                            <div key={card.id} className={`flex items-center justify-between py-1 px-2 rounded ${
                              isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                            }`}>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {card.name}
                              </span>
                              <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                ${(card.calculatedMinimumPayment || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Loan Minimum Payments */}
                  {loans.filter(loan => (loan.monthlyPayment || 0) > 0).length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Home className={`w-4 h-4 ${
                          isDarkMode ? 'text-purple-300' : 'text-purple-600'
                        }`} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Loans
                        </span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${totalLoanPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {loans
                          .filter(loan => (loan.monthlyPayment || 0) > 0)
                          .map((loan) => (
                            <div key={loan.id} className={`flex items-center justify-between py-1 px-2 rounded ${
                              isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                            }`}>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {loan.name}
                              </span>
                              <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                ${(loan.monthlyPayment || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Monthly Expenses */}
                  {expenses.length > 0 && totalMonthlyExpenses > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className={`w-4 h-4 ${
                          isDarkMode ? 'text-purple-300' : 'text-purple-600'
                        }`} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Monthly Expenses
                        </span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${totalMonthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {expenses
                          .filter(expense => calculateMonthlyExpenseAmount(expense) > 0)
                          .map((expense) => (
                            <div key={expense.id || `expense-${expense.name}`} className={`flex items-center justify-between py-1 px-2 rounded ${
                              isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                            }`}>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {expense.name || 'Unnamed Expense'} ({expense.frequency || 'monthly'})
                              </span>
                              <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                ${calculateMonthlyExpenseAmount(expense).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* No Payments Message */}
                  {totalMinimumPayments === 0 && (
                    <div className={`text-center py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p className="text-sm">No minimum payments due</p>
                      <p className="text-xs mt-1">Add credit cards, loans, or expenses to see payment breakdown</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Metrics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Credit Utilization */}
          <div className={`p-6 rounded-xl border shadow-lg ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Credit Utilization
              </h3>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                creditUtilization < 30
                  ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                  : creditUtilization < 70
                    ? isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                    : isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
              }`}>
                {creditUtilization}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className={`w-full bg-gray-200 rounded-full h-3 mb-4 ${isDarkMode ? 'bg-gray-700' : ''}`}>
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  creditUtilization < 30 ? 'bg-green-500' :
                  creditUtilization < 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(creditUtilization, 100)}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Used</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${totalCreditCardDebt.toLocaleString()}
                </p>
              </div>
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${(totalCreditLimit - totalCreditCardDebt).toLocaleString()}
                </p>
              </div>
            </div>

            <p className={`text-xs mt-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              {creditUtilization < 30
                ? 'Excellent! Keep utilization under 30% for best credit scores.'
                : creditUtilization < 70
                  ? 'Moderate utilization. Consider paying down debt to improve your score.'
                  : 'High utilization! Pay down debt immediately to avoid credit score damage.'
              }
            </p>
          </div>

          {/* Additional Metrics */}
          <div className={`p-6 rounded-xl border shadow-lg ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Additional Metrics
            </h3>

            <div className="space-y-4">
              {/* Credit Limit */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                    <Wallet className={`w-4 h-4 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total Credit Limit
                  </span>
                </div>
                <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${totalCreditLimit.toLocaleString()}
                </span>
              </div>

              {/* Loan Debt */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                    <Home className={`w-4 h-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Loan Debt
                  </span>
                </div>
                <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${totalLoanDebt.toLocaleString()}
                </span>
              </div>

              {/* Reward Points */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <Star className={`w-4 h-4 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reward Points
                  </span>
                </div>
                <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {totalRewardPoints.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBalanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg w-full max-w-md transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit {stats.find(s => s.key === editingBalance)?.name}
              </h3>
              <button
                onClick={() => setShowBalanceForm(false)}
                className={`transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {editingBalance === 'creditScore' ? 'Credit Score (300-850)' : 'Amount ($)'}
                </label>
                <input
                  type="number"
                  step={editingBalance === 'creditScore' ? '1' : '0.01'}
                  min={editingBalance === 'creditScore' ? '300' : undefined}
                  max={editingBalance === 'creditScore' ? '850' : undefined}
                  value={tempBalance}
                  onChange={(e) => setTempBalance(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder={editingBalance === 'creditScore' ? '750' : '0.00'}
                  autoFocus
                />
                {editingBalance === 'creditScore' && (
                  <div className={`mt-2 text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Poor:</span> 300-579
                      </div>
                      <div>
                        <span className="font-medium">Fair:</span> 580-669
                      </div>
                      <div>
                        <span className="font-medium">Good:</span> 670-739
                      </div>
                      <div>
                        <span className="font-medium">Excellent:</span> 740-850
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBalanceForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBalance}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}





      {/* Credit Reward Points Summary */}
      {creditCards.length > 0 && (
        <div className={`p-4 rounded-lg shadow border transition-all duration-200 hover:shadow-lg ${
          isDarkMode
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-orange-500/30'
            : 'bg-gradient-to-br from-white to-orange-50 border-gray-200 hover:border-orange-300'
        } mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className={`w-5 h-5 ${
                isDarkMode ? 'text-orange-400' : 'text-orange-600'
              }`} />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reward Points</h2>
            </div>
            <div className={`text-xl font-bold ${
              isDarkMode ? 'text-orange-300' : 'text-orange-600'
            }`}>
              {totalRewardPoints.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(totalByType).map(([type, total]) => (
              <div key={type} className={`p-3 rounded-lg text-center transition-colors ${
                isDarkMode
                  ? 'bg-gray-700/50 hover:bg-gray-700'
                  : 'bg-white/70 hover:bg-gray-50'
              } border border-gray-200 dark:border-gray-600`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                  type === 'points' ? 'bg-blue-500' :
                  type === 'miles' ? 'bg-green-500' :
                  type === 'cashback' ? 'bg-amber-500' :
                  type === 'hotel' ? 'bg-purple-500' : 'bg-pink-500'
                }`}></div>
                <div className={`text-xs font-medium capitalize mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {type}
                </div>
                <div className={`text-sm font-bold ${
                  type === 'points' ? 'text-blue-600' :
                  type === 'miles' ? 'text-green-600' :
                  type === 'cashback' ? 'text-amber-600' :
                  type === 'hotel' ? 'text-purple-600' : 'text-pink-600'
                }`}>
                  {total.toLocaleString()}
                </div>
              </div>
            ))}
            {Object.keys(totalByType).length === 0 && (
              <div className="col-span-full text-center py-6">
                <Star className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No reward points yet
                </p>
              </div>
            )}
          </div>

          {/* Points by Bank/Carrier */}
          {Object.keys(rewardPointsByBank).length > 0 && (
            <div className="mt-4">
              <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Points by Bank/Carrier
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(rewardPointsByBank).map(([bank, types]) => {
                  const totalBankPoints = Object.values(types).reduce((sum, points) => sum + points, 0);
                  return (
                    <div key={bank} className={`p-3 rounded-lg border transition-colors ${
                      isDarkMode
                        ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                        : 'bg-white/70 border-gray-200 hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {bank}
                        </span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                          {totalBankPoints.toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(types).map(([type, points]) => (
                          <div key={type} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${
                                type === 'points' ? 'bg-blue-500' :
                                type === 'miles' ? 'bg-green-500' :
                                type === 'cashback' ? 'bg-amber-500' :
                                type === 'hotel' ? 'bg-purple-500' : 'bg-pink-500'
                              }`}></div>
                              <span className={`capitalize ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {type}
                              </span>
                            </div>
                            <span className={`font-medium ${
                              type === 'points' ? 'text-blue-600' :
                              type === 'miles' ? 'text-green-600' :
                              type === 'cashback' ? 'text-amber-600' :
                              type === 'hotel' ? 'text-purple-600' : 'text-pink-600'
                            }`}>
                              {points.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between text-sm">
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Across {creditCards.filter(card => (card.pointsBalance || 0) > 0).length} cards
              </span>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                creditUtilization < 10 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                creditUtilization < 30 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {creditUtilization}% utilization
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Credit Cards */}
        <div className="space-y-8">
          <div className={`p-6 rounded-lg shadow border transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Credit Cards</h2>
            <button
              onClick={() => setShowCreditCardForm(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </button>
          </div>

          {showCreditCardForm && (
            <div className={`mb-6 p-4 border rounded-lg transition-colors duration-200 ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingCard ? 'Edit Credit Card' : 'Add New Credit Card'}
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className={`transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingCard) {
                    handleUpdateCreditCard();
                  } else {
                    handleAddCreditCard(e);
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credit Card Name/Type
                    </label>
                    <input
                      type="text"
                      value={newCard.name}
                      onChange={(e) => handleCardNameChange(e.target.value)}
                      onFocus={() => newCard.name.length > 2 && cardSuggestions.length > 0 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      className="input-lux"
                      placeholder="e.g., Chase, Amex, Citi..."
                      required
                    />
                    {showSuggestions && cardSuggestions.length > 0 && (
                      <div className={`absolute top-full left-0 right-0 z-50 mt-1 border rounded-lg shadow-lg max-h-48 overflow-y-auto transition-colors ${
                        isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                      }`}>
                        {cardSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectCardSuggestion(suggestion)}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                              isDarkMode 
                                ? 'text-white hover:bg-gray-700' 
                                : 'text-gray-900 hover:bg-gray-100'
                            } ${index === 0 ? 'rounded-t-lg' : ''} ${index === cardSuggestions.length - 1 ? 'rounded-b-lg' : ''}`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credit Limit ($)
                    </label>
                    <input
                      type="number"
                      value={newCard.creditLimit}
                      onChange={(e) => setNewCard({ ...newCard, creditLimit: e.target.value })}
                      className="input-lux"
                      placeholder="10000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      APR (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCard.apr}
                      onChange={(e) => setNewCard({ ...newCard, apr: e.target.value })}
                      className="input-lux"
                      placeholder="18.99"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Debt ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCard.debt}
                      onChange={(e) => setNewCard({ ...newCard, debt: e.target.value })}
                      className="input-lux"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newCard.dueDate}
                      onChange={(e) => setNewCard({ ...newCard, dueDate: e.target.value })}
                      className="input-lux"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reward Points
                    </label>
                    <input
                      type="number"
                      value={newCard.pointsBalance}
                      onChange={(e) => setNewCard({ ...newCard, pointsBalance: e.target.value })}
                      className="input-lux"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reward Type
                    </label>
                    <select
                      value={newCard.rewardType}
                      onChange={(e) => setNewCard({ ...newCard, rewardType: e.target.value as 'points' | 'miles' | 'cashback' | 'hotel' | 'travel' })}
                      className="input-lux"
                    >
                      <option value="points">Points</option>
                      <option value="miles">Miles</option>
                      <option value="cashback">Cashback</option>
                      <option value="hotel">Hotel Points</option>
                      <option value="travel">Travel Credits</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank/Issuer
                    </label>
                    <select
                      value={newCard.bank}
                      onChange={(e) => setNewCard({ ...newCard, bank: e.target.value })}
                      className="input-lux"
                    >
                      <option value="">Select Bank</option>
                      <option value="American Express">American Express</option>
                      <option value="Chase">Chase</option>
                      <option value="Capital One">Capital One</option>
                      <option value="Discover">Discover</option>
                      <option value="Citi">Citi</option>
                      <option value="Wells Fargo">Wells Fargo</option>
                      <option value="Bank of America">Bank of America</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-200 border-gray-600 hover:bg-gray-700' 
                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {editingCard ? 'Update Card' : 'Add Card'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {creditCards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No credit cards added yet</p>
                <p className="text-sm">Click "Add Card" to get started</p>
              </div>
            ) : (
              creditCards.map((card) => (
                <div key={card.id} className={`p-4 border rounded-lg transition-colors duration-200 ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <img 
                          src={getCreditCardImage(card.name)} 
                          alt={card.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const icon = target.nextElementSibling as HTMLElement;
                            if (icon) icon.classList.remove('hidden');
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', card.name, getCreditCardImage(card.name));
                          }}
                        />
                        <CreditCard className="w-6 h-6 text-white hidden" />
                      </div>
                      <div className="ml-3">
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{card.name}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Limit: ${card.creditLimit.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-3">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>APR: {card.apr}%</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Due: {card.dueDate ? new Date(card.dueDate).toLocaleDateString() : 'Not set'}</p>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            card.rewardType === 'points' ? 'bg-blue-500' :
                            card.rewardType === 'miles' ? 'bg-green-500' :
                            card.rewardType === 'cashback' ? 'bg-amber-500' :
                            card.rewardType === 'hotel' ? 'bg-purple-500' : 'bg-pink-500'
                          }`}></div>
                          <p className={`text-sm font-medium ${
                            isDarkMode ? 'text-orange-300' : 'text-orange-600'
                          }`}>
                            {(card.pointsBalance || 0).toLocaleString()} {card.rewardType || 'points'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditCreditCard(card)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-orange-400 hover:bg-orange-900/30'
                            : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                        }`}
                        title="Edit credit card"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCreditCard(card.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
                            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete credit card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Debt</p>
                      <p className={`font-bold ${(card.currentBalance || card.debt || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${(card.currentBalance || card.debt || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Available Credit</p>
                      <p className="font-bold text-blue-600">
                        ${(card.creditLimit - (card.currentBalance || card.debt || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Utilization</p>
                      <p className={`font-bold ${
                        ((card.currentBalance || card.debt || 0) / card.creditLimit * 100) > 30 ? 'text-red-600' : 
                        ((card.currentBalance || card.debt || 0) / card.creditLimit * 100) > 10 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {(((card.currentBalance || card.debt || 0) / card.creditLimit) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Min Payment</p>
                      <p className="font-bold text-orange-600">
                        ${card.calculatedMinimumPayment ? card.calculatedMinimumPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {card.calculatedMinimumPayment && (card.currentBalance || card.debt || 0) > 0 && (
                    <div className={`mt-4 p-3 rounded-lg transition-colors duration-200 ${
                      isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                    }`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Interest Portion</p>
                          <p className="font-semibold text-red-500">
                            ${card.interestPortion ? card.interestPortion.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </p>
                        </div>
                        <div>
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Principal Portion</p>
                          <p className="font-semibold text-green-500">
                            ${card.principalPortion ? card.principalPortion.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </p>
                        </div>
                        <div>
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Payoff Time</p>
                          <p className="font-semibold text-blue-500">
                            {card.payoffTimeMonths ? `${card.payoffTimeMonths} months` : 'Never'}
                          </p>
                        </div>
                      </div>
                      {card.totalInterestIfMinimumOnly && card.totalInterestIfMinimumOnly !== Infinity && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Total interest if paying minimum only: 
                            <span className="font-semibold text-red-500 ml-1">
                              ${card.totalInterestIfMinimumOnly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        </div>

        {/* Right Column - Loans and Crypto */}
        <div className="space-y-8">
          <div className={`p-6 rounded-lg shadow border transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loans</h2>
            <button
              onClick={() => setShowLoanForm(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Loan
            </button>
          </div>

          {showLoanForm && (
            <div className={`mb-6 p-4 border rounded-lg transition-colors duration-200 ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add New Loan</h3>
                <button
                  onClick={() => setShowLoanForm(false)}
                  className={`transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddLoan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Loan Name
                    </label>
                    <input
                      type="text"
                      value={newLoan.name}
                      onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="e.g., Car Loan, Mortgage"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Loan Type
                    </label>
                    <select
                      value={newLoan.loanType}
                      onChange={(e) => setNewLoan({ ...newLoan, loanType: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Auto Loan">Auto Loan</option>
                      <option value="Mortgage">Mortgage</option>
                      <option value="Personal Loan">Personal Loan</option>
                      <option value="Student Loan">Student Loan</option>
                      <option value="Business Loan">Business Loan</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Original Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newLoan.originalAmount}
                      onChange={(e) => setNewLoan({ ...newLoan, originalAmount: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="25000"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Current Balance ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newLoan.currentBalance}
                      onChange={(e) => setNewLoan({ ...newLoan, currentBalance: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="18500"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newLoan.interestRate}
                      onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="4.5"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Monthly Payment ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newLoan.monthlyPayment}
                      onChange={(e) => setNewLoan({ ...newLoan, monthlyPayment: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="450"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Origination Date
                    </label>
                                        <input
                      type="date"
                      value={newLoan.originationDate}
                      onChange={(e) => setNewLoan({ ...newLoan, originationDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Payment Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={newLoan.paymentDate}
                      onChange={(e) => setNewLoan({ ...newLoan, paymentDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowLoanForm(false)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      isDarkMode
                        ? 'text-gray-200 border-gray-600 hover:bg-gray-700'
                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Add Loan
                  </button>
                </div>
              </form>
            </div>
          )}

          {showLoanEditForm && editingLoan && (
            <div className={`mb-6 p-4 border rounded-lg transition-colors duration-200 ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Loan</h3>
                <button
                  onClick={() => {
                    setShowLoanEditForm(false);
                    setEditingLoan(null);
                  }}
                  className={`transition-colors ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveLoanEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Loan Name
                    </label>
                    <input
                      type="text"
                      value={newLoan.name}
                      onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="e.g., Car Loan, Mortgage"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Loan Type
                    </label>
                    <select
                      value={newLoan.loanType}
                      onChange={(e) => setNewLoan({ ...newLoan, loanType: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    >
                      <option value="">Select type</option>
                      <option value="mortgage">Mortgage</option>
                      <option value="car">Car Loan</option>
                      <option value="student">Student Loan</option>
                      <option value="personal">Personal Loan</option>
                      <option value="business">Business Loan</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Original Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newLoan.originalAmount}
                      onChange={(e) => setNewLoan({ ...newLoan, originalAmount: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Current Balance
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newLoan.currentBalance}
                      onChange={(e) => setNewLoan({ ...newLoan, currentBalance: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newLoan.interestRate}
                      onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Monthly Payment
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newLoan.monthlyPayment}
                      onChange={(e) => setNewLoan({ ...newLoan, monthlyPayment: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Origination Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={newLoan.originationDate}
                      onChange={(e) => setNewLoan({ ...newLoan, originationDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Payment Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={newLoan.paymentDate}
                      onChange={(e) => setNewLoan({ ...newLoan, paymentDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoanEditForm(false);
                      setEditingLoan(null);
                    }}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      isDarkMode
                        ? 'text-gray-200 border-gray-600 hover:bg-gray-700'
                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Update Loan
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {loans.length === 0 ? (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Home className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p>No loans added yet</p>
                <p className="text-sm">Click "Add Loan" to get started</p>
              </div>
            ) : (
              loans.map((loan) => (
                <div key={loan.id} className={`p-4 border rounded-lg transition-colors duration-200 ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Home className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-3">
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{loan.name}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{loan.loanType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditLoan(loan)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30'
                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Edit loan"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveLoan(loan.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
                            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Remove loan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-right">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Interest: {loan.interestRate}%</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Payment: ${loan.monthlyPayment.toLocaleString()}/mo</p>
                        {loan.originationDate && (
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Started: {new Date(loan.originationDate).toLocaleDateString()}</p>
                        )}
                        {loan.paymentDate && (
                          <p className="text-sm text-blue-600 font-medium">Payment Due: {new Date(loan.paymentDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`grid grid-cols-3 gap-4 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Original Amount</p>
                      <p className="font-bold text-blue-600">
                        ${loan.originalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Balance</p>
                      <p className={`font-bold ${loan.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${loan.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Equity Built</p>
                      <p className="font-bold text-green-600">
                        ${(loan.originalAmount - loan.currentBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          </div>

          <div className={`p-6 rounded-lg shadow border transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Crypto Assets</h2>
            <button
              onClick={() => setShowCryptoForm(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </button>
          </div>

          {showCryptoForm && (
            <div className={`mb-6 p-4 border rounded-lg transition-colors duration-200 ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingCrypto ? 'Edit Crypto Asset' : 'Add New Crypto Asset'}
                </h3>
                <button
                  onClick={handleCancelCryptoEdit}
                  className={`transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={editingCrypto ? handleUpdateCryptoAsset : handleAddCryptoAsset} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Symbol (e.g., BTC, ETH)
                    </label>
                    <input
                      type="text"
                      value={newCrypto.symbol}
                      onChange={(e) => setNewCrypto({ ...newCrypto, symbol: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="BTC"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Quantity
                    </label>
                    <input
                      type="number"
                      step="0.00000001"
                      value={newCrypto.quantity}
                      onChange={(e) => setNewCrypto({ ...newCrypto, quantity: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="0.25"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Average Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCrypto.averageCost}
                      onChange={(e) => setNewCrypto({ ...newCrypto, averageCost: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Current Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCrypto.currentPrice}
                      onChange={(e) => setNewCrypto({ ...newCrypto, currentPrice: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="60000"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Platform/Exchange
                    </label>
                    <input
                      type="text"
                      value={newCrypto.platform}
                      onChange={(e) => setNewCrypto({ ...newCrypto, platform: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Coinbase, Binance, etc."
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Wallet Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={newCrypto.walletAddress}
                      onChange={(e) => setNewCrypto({ ...newCrypto, walletAddress: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Wallet address..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelCryptoEdit}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-200 border-gray-600 hover:bg-gray-700' 
                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {editingCrypto ? 'Update Asset' : 'Add Asset'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {cryptoAssets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bitcoin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No crypto assets added yet</p>
                <p className="text-sm">Click "Add Asset" to get started</p>
              </div>
            ) : (
              cryptoAssets.map((asset) => (
                <div key={asset.id} className={`p-4 border rounded-lg transition-colors duration-200 ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Bitcoin className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-3">
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {asset.symbol}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {asset.platform && `Platform: ${asset.platform}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-3">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Quantity: {asset.quantity}
                        </p>
                        <p className={`text-sm ${
                          (asset.gainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(asset.gainLoss || 0) >= 0 ? '+' : ''}${(asset.gainLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                          ({(asset.gainLossPercentage || 0) >= 0 ? '+' : ''}{(asset.gainLossPercentage || 0).toFixed(2)}%)
                        </p>
                      </div>
                      <button
                        onClick={() => handleEditCryptoAsset(asset)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-orange-400 hover:bg-orange-900/30'
                            : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                        }`}
                        title="Edit crypto asset"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCryptoAsset(asset.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
                            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete crypto asset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Average Cost</p>
                      <p className="font-bold text-blue-600">
                        ${(asset.averageCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Price</p>
                      <p className="font-bold text-green-600">
                        ${(asset.currentPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Cost</p>
                      <p className="font-bold text-gray-600">
                        ${(asset.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Value</p>
                      <p className={`font-bold ${
                        (asset.totalValue || 0) >= (asset.totalCost || 0) ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${(asset.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Expenses Section - Right Column */}
          <div className={`p-6 rounded-lg shadow border transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Expenses
              </h2>
              <div className="flex items-center gap-2">
                <div className={`text-sm px-3 py-1 rounded-full ${
                  isDarkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                }`}>
                  ${totalMonthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </button>
              </div>
            </div>

            {showExpenseForm && (
              <div className={`mb-6 p-4 border rounded-lg transition-colors duration-200 ${
                isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                  </h3>
                  <button
                    onClick={handleCancelExpenseForm}
                    className={`transition-colors ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Expense Name
                      </label>
                      <input
                        type="text"
                        value={newExpense.name}
                        onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="e.g., Rent, Groceries"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Amount ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Category
                      </label>
                      <select
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="food">Food</option>
                        <option value="housing">Housing</option>
                        <option value="transportation">Transportation</option>
                        <option value="utilities">Utilities</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="shopping">Shopping</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Frequency
                      </label>
                      <select
                        value={newExpense.frequency}
                        onChange={(e) => setNewExpense({ ...newExpense, frequency: e.target.value as 'monthly' | 'weekly' | 'daily' | 'yearly' })}
                        className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="daily">Daily</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={newExpense.isRecurring}
                      onChange={(e) => setNewExpense({ ...newExpense, isRecurring: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="isRecurring" className={`ml-2 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Recurring expense
                    </label>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCancelExpenseForm}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        isDarkMode
                          ? 'text-gray-200 border-gray-600 hover:bg-gray-700'
                          : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg shadow hover:shadow-md transition-all duration-200"
                    >
                      {editingExpense ? 'Update Expense' : 'Add Expense'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {expenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingDown className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No expenses added yet</p>
                  <p className="text-sm">Click "Add Expense" to get started</p>
                </div>
              ) : (
                expenses.map((expense) => (
                  <div key={expense.id} className={`p-4 border rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <TrendingDown className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {expense.name}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            {expense.category} • {expense.frequency}
                            {expense.isRecurring && ' • Recurring'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <div className="text-right">
                          <p className={`text-lg font-bold text-orange-600`}>
                            ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            /mo: ${calculateMonthlyExpenseAmount(expense).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className={`p-2 rounded transition-colors ${
                            isDarkMode
                              ? 'text-gray-400 hover:text-orange-400 hover:bg-orange-900/30'
                              : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                          }`}
                          title="Edit expense"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className={`p-2 rounded transition-colors ${
                            isDarkMode
                              ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
                              : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}