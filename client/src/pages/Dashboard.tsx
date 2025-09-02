import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, TrendingUp, TrendingDown, Plus, X, Edit, Target, Moon, Sun, Wallet, Star, Home, Bitcoin, Search, Bell, Settings } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip } from 'recharts';

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
}

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

export default function Dashboard({ isDarkMode, toggleTheme }: DashboardProps) {
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
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
  useEffect(() => {
    const fetchCreditCards = async () => {
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

    fetchCreditCards();
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
  const [loans, setLoans] = useState<Loan[]>([]);
  const [newLoan, setNewLoan] = useState({
    name: '',
    originalAmount: '',
    currentBalance: '',
    interestRate: '',
    monthlyPayment: '',
    loanType: '',
    originationDate: ''
  });

  const [showCryptoForm, setShowCryptoForm] = useState(false);
  const [editingCrypto, setEditingCrypto] = useState<CryptoAsset | null>(null);
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [newCrypto, setNewCrypto] = useState({
    symbol: '',
    quantity: '',
    averageCost: '',
    currentPrice: '',
    platform: '',
    walletAddress: ''
  });

  const [balances, setBalances] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0
  });

  const [creditScore, setCreditScore] = useState(0);

  // UI: header actions
  const [showSettings, setShowSettings] = useState(false);

  // Credit score ranges based on FICO scores
  const getCreditScoreRange = (score: number) => {
    if (score >= 800) return { range: 'Exceptional', color: '#10B981', percentage: 20 };
    if (score >= 740) return { range: 'Very Good', color: '#059669', percentage: 25 };
    if (score >= 670) return { range: 'Good', color: '#FBBF24', percentage: 21 };
    if (score >= 580) return { range: 'Fair', color: '#F59E0B', percentage: 17 };
    if (score >= 300) return { range: 'Poor', color: '#EF4444', percentage: 17 };
    return { range: 'Not Set', color: '#6B7280', percentage: 0 };
  };

  const creditScoreData = getCreditScoreRange(creditScore);

  // Generate a simple trend for balance sparkline (last 6 points)
  const generateBalanceTrend = () => {
    const base = Math.max(0, balances.totalBalance);
    const points = [0.82, 0.88, 0.94, 0.9, 0.96, 1.0];
    return points.map((p, i) => ({ idx: i, value: Math.round(base * p) }));
  };

  const balanceTrend = generateBalanceTrend();

  // Simple pie chart component
  const CreditScorePieChart = ({ score, data }: { score: number; data: any }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const scorePercentage = score > 0 ? ((score - 300) / (850 - 300)) * 100 : 0;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 144 144">
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={isDarkMode ? '#374151' : '#E5E7EB'}
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          {score > 0 && (
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke={data.color}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-in-out"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {score || '---'}
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {data.range}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calculate total credit card debt from all cards
  const totalCreditCardDebt = creditCards.reduce((total, card) => total + (card.currentBalance || card.debt || 0), 0);
  
  // Calculate total credit limit from all cards
  const totalCreditLimit = creditCards.reduce((total, card) => total + (card.creditLimit || 0), 0);
  
  // Calculate total loan debt from all loans
  const totalLoanDebt = loans.reduce((total, loan) => total + (loan.currentBalance || 0), 0);
  
  // Calculate total crypto value
  const totalCryptoValue = cryptoAssets.reduce((total, asset) => total + (asset.totalValue || 0), 0);
  
  // Calculate total minimum payments (credit cards + loans)
  const totalCreditCardMinPayments = creditCards.reduce((total, card) => total + (card.calculatedMinimumPayment || 0), 0);
  const totalLoanPayments = loans.reduce((total, loan) => total + (loan.monthlyPayment || 0), 0);
  const totalMinimumExpenses = totalCreditCardMinPayments + totalLoanPayments;

  const [showBalanceForm, setShowBalanceForm] = useState(false);
  const [editingBalance, setEditingBalance] = useState('');
  const [tempBalance, setTempBalance] = useState('');

  const [financialGoal, setFinancialGoal] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [tempGoal, setTempGoal] = useState('');


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

  const handleUpdateCreditCard = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updating card with data:', newCard);
    
    if (newCard.name && newCard.creditLimit && newCard.apr && newCard.dueDate && newCard.debt !== '') {
      try {
        const cardData = {
          name: newCard.name,
          creditLimit: parseFloat(newCard.creditLimit),
          apr: parseFloat(newCard.apr),
          currentBalance: parseFloat(newCard.debt),
          pointsBalance: parseInt(newCard.pointsBalance) || 0,
          rewardType: newCard.rewardType,
          bank: newCard.bank
        };

        console.log('Updating card data via API:', cardData);

        const response = await fetch(`http://127.0.0.1:9002/api/credit-cards/${editingCard?.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cardData)
        });
        
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const updatedCardData = await response.json();
          console.log('Updated card data received:', updatedCardData);
          setCreditCards(creditCards.map(card =>
            card.id === editingCard?.id ? updatedCardData : card
          ));
          setNewCard({ name: '', creditLimit: '', apr: '', dueDate: '', debt: '', pointsBalance: '', rewardType: 'points', bank: '' });
          setEditingCard(null);
          setShowCreditCardForm(false);
        } else {
          const errorData = await response.text();
          console.error('API error:', errorData);
        }
      } catch (error) {
        console.error('Error updating credit card:', error);
      }
    } else {
      console.log('Form validation failed for update');
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
        originationDate: newLoan.originationDate || undefined
      };
      setLoans([...loans, loan]);
      setNewLoan({ name: '', originalAmount: '', currentBalance: '', interestRate: '', monthlyPayment: '', loanType: '', originationDate: '' });
      setShowLoanForm(false);
    }
  };

  const handleEditBalance = (balanceType: string) => {
    // Don't allow editing auto-calculated values
    if (balanceType === 'creditCardDebt' || balanceType === 'totalCreditLimit' || balanceType === 'totalLoanDebt') {
      return;
    }
    
    // Handle credit score separately
    if (balanceType === 'creditScore') {
      setEditingBalance(balanceType);
      setTempBalance(creditScore.toString());
      setShowBalanceForm(true);
      return;
    }
    
    setEditingBalance(balanceType);
    setTempBalance((balances as any)[balanceType].toString());
    setShowBalanceForm(true);
  };

  const handleSaveBalance = () => {
    if (tempBalance !== '' && !isNaN(parseFloat(tempBalance))) {
      if (editingBalance === 'creditScore') {
        // Validate credit score range (300-850)
        const score = Math.max(300, Math.min(850, parseInt(tempBalance)));
        setCreditScore(score);
      } else {
        setBalances(prev => ({
          ...prev,
          [editingBalance as keyof typeof prev]: parseFloat(tempBalance)
        }));
      }
    }
    setShowBalanceForm(false);
    setEditingBalance('');
    setTempBalance('');
  };

  const handleEditGoal = () => {
    setTempGoal(financialGoal);
    setShowGoalForm(true);
  };

  const handleSaveGoal = () => {
    setFinancialGoal(tempGoal);
    setShowGoalForm(false);
    setTempGoal('');
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

  const handleWipeAllData = () => {
    if (window.confirm('Are you sure you want to wipe all data? This action cannot be undone.')) {
      setCreditCards([]);
      setLoans([]);
      setCryptoAssets([]);
      setBalances({
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0
      });
      setFinancialGoal('');
      setCreditScore(0);
      setShowCreditCardForm(false);
      setShowLoanForm(false);
      setShowCryptoForm(false);
      setShowBalanceForm(false);
      setShowGoalForm(false);
      setNewCard({ name: '', creditLimit: '', apr: '', dueDate: '', debt: '', pointsBalance: '', rewardType: 'points', bank: '' });
      setNewLoan({ name: '', originalAmount: '', currentBalance: '', interestRate: '', monthlyPayment: '', loanType: '', originationDate: '' });
      setNewCrypto({ symbol: '', quantity: '', averageCost: '', currentPrice: '', platform: '', walletAddress: '' });
      localStorage.clear();
      sessionStorage.clear();
    }
  };

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

  // Calculate totals by reward type
  const totalByType = creditCards.reduce((acc, card) => {
    const rewardType = card.rewardType || 'points';
    const points = card.pointsBalance || 0;
    acc[rewardType] = (acc[rewardType] || 0) + points;
    return acc;
  }, {} as Record<string, number>);

  const totalRewardPoints = creditCards.reduce((total, card) => total + (card.pointsBalance || 0), 0);

  // Credit utilization for donut chart
  const creditUtilization = totalCreditLimit > 0 ? Math.min(100, Math.max(0, Math.round((totalCreditCardDebt / totalCreditLimit) * 100))) : 0;
  const utilizationData = [
    { name: 'Used', value: creditUtilization },
    { name: 'Available', value: Math.max(0, 100 - creditUtilization) }
  ];

  // Financial goal progress (parse a target amount from the goal text)
  const parseGoalTarget = (text: string) => {
    const match = (text || '').replace(/[,\s]/g, '').match(/\$?(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };
  const goalTarget = parseGoalTarget(financialGoal);
  const goalProgress = goalTarget > 0 ? Math.min(1, balances.totalBalance / goalTarget) : 0;

  const stats = [
    {
      key: 'totalBalance',
      name: 'Total Balance',
      value: `$${balances.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      positive: balances.totalBalance >= 0
    },
    {
      key: 'monthlyIncome',
      name: 'Monthly Income',
      value: `$${balances.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      positive: true
    },
    {
      key: 'monthlyExpenses',
      name: 'Monthly Expenses',
      value: `$${balances.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingDown,
      positive: false
    },
    {
      key: 'creditCardDebt',
      name: 'Credit Card Debt',
      value: `$${totalCreditCardDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CreditCard,
      positive: totalCreditCardDebt <= 0
    },
    {
      key: 'totalCreditLimit',
      name: 'Total Credit Limit',
      value: `$${totalCreditLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
      value: `$${totalLoanDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Home,
      positive: totalLoanDebt <= 0
    },
    {
      key: 'totalCryptoValue',
      name: 'Crypto Portfolio Value',
      value: `$${totalCryptoValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Bitcoin,
      positive: true
    },
    {
      key: 'totalRewardPoints',
      name: 'Total Reward Points',
      value: totalRewardPoints === 0 ? 'No Points' : totalRewardPoints.toLocaleString(),
      icon: Star,
      positive: totalRewardPoints > 0
    },
    {
      key: 'totalMinimumExpenses',
      name: 'Total Minimum Payments',
      value: `$${totalMinimumExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingDown,
      positive: false
    }
  ];

  const overallPositive = (stats: any[]) => {
    const positiveCount = stats.filter(stat => stat.positive).length;
    return positiveCount > stats.length / 2;
  };

  const statSummaryDirectionClass = (stats: any[]) => {
    return overallPositive(stats)
      ? (isDarkMode ? 'text-green-400' : 'text-green-600')
      : (isDarkMode ? 'text-red-400' : 'text-red-600');
  };

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
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Welcome back</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Here’s an overview of your finances</p>
        </div>
        <div className="flex items-center space-x-3 relative">
          <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`} title="Search">
            <Search className="w-5 h-5" />
          </button>
          <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`} title="Notifications">
            <Bell className="w-5 h-5" />
          </button>
          <div className="relative">
            <button onClick={() => setShowSettings(v => !v)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`} title="Settings">
              <Settings className="w-5 h-5" />
            </button>
            {showSettings && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-50 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                <button onClick={handleWipeAllData} className={`w-full text-left px-3 py-2 text-sm rounded-lg ${isDarkMode ? 'text-red-300 hover:bg-gray-800' : 'text-red-600 hover:bg-gray-50'}`}>Reset Data</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Single clean panel replacing multiple stat cards */}
      <div
        className={`rounded-2xl border shadow-lg p-6 ${
          isDarkMode
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Financial Overview</h2>
          <span className={`text-xs ${statSummaryDirectionClass(stats)} font-medium`}>
            {overallPositive(stats) ? 'Overall ↗' : 'Overall ↘'}
          </span>
        </div>
        <ul className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            const canEdit = stat.key !== 'creditCardDebt' && stat.key !== 'totalCreditLimit' && stat.key !== 'totalLoanDebt' && stat.key !== 'totalCryptoValue' && stat.key !== 'totalMinimumExpenses';
            return (
              <li key={stat.name} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-orange-500/10 border-orange-500/30 text-orange-300'
                          : 'bg-orange-100 border-orange-300 text-orange-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>{stat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xl font-semibold bg-gradient-to-r ${
                        isDarkMode ? 'from-orange-400 to-orange-300' : 'from-orange-600 to-orange-500'
                      } bg-clip-text text-transparent`}
                    >
                      {stat.key === 'creditScore' && creditScore > 0 ? creditScore : stat.value}
                    </span>
                    <span className={`text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.positive ? '↗' : '↘'}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => handleEditBalance(stat.key)}
                        className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} p-1 rounded`}
                        title="Edit amount"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
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

      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg w-full max-w-md transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Financial Goal</h3>
              <button
                onClick={() => setShowGoalForm(false)}
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
                  Your Financial Goal
                </label>
                <textarea
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg focus:ring-primary-500 focus:border-primary-500 h-32 resize-none transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="e.g., Save $10,000 for emergency fund by end of year..."
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowGoalForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveGoal}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`p-6 rounded-lg shadow border mb-8 transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h2 className={`text-xl font-semibold ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Financial Goal</h2>
          </div>
          <button
            onClick={handleEditGoal}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Edit className="w-4 h-4 mr-2" />
            {financialGoal ? 'Edit Goal' : 'Set Goal'}
          </button>
        </div>
        <div className={`p-4 rounded-lg transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          {financialGoal ? (
            <>
              <p className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{financialGoal}</p>
              {goalTarget > 0 && (
                <div className="mt-4">
                  <div className={`w-full h-3 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div className="h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600" style={{ width: `${Math.round(goalProgress * 100)}%` }} />
                  </div>
                  <div className={`mt-1 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{Math.round(goalProgress * 100)}% towards $ {goalTarget.toLocaleString()}</div>
                </div>
              )}
            </>
          ) : (
            <p className={`italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No financial goal set yet. Click "Set Goal" to add one.</p>
          )}
        </div>
      </div>

      {/* Credit Reward Points Summary */}
      {creditCards.length > 0 && (
        <div className={`p-6 rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
          isDarkMode
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600'
            : 'bg-white border-gray-200 hover:border-gray-300'
        } backdrop-blur-sm mb-8`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-gray-700 to-gray-600 border border-gray-600'
                  : 'bg-gray-100 border border-gray-300'
              }`}>
                <Star className={`w-7 h-7 ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`} />
              </div>
              <h2 className={`text-xl font-semibold ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Credit Reward Points Summary</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Total Points by Type */}
            <div className="space-y-4">
              <h3 className={`text-md font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total by Reward Type</h3>
              {Object.entries(totalByType).map(([type, total]) => (
                <div key={type} className="flex items-center justify-between p-4 card-lux">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${
                      type === 'points' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      type === 'miles' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                      type === 'cashback' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                      type === 'hotel' ? 'bg-gradient-to-r from-purple-500 to-indigo-600' :
                      'bg-gradient-to-r from-pink-500 to-rose-600'
                    } shadow-sm`}></div>
                    <span className={`text-sm font-semibold capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {type}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-lg font-semibold numeric-lux ${
                      type === 'points' ? 'text-blue-600' :
                      type === 'miles' ? 'text-green-600' :
                      type === 'cashback' ? 'text-amber-600' :
                      type === 'hotel' ? 'text-purple-600' : 'text-pink-600'
                    }`}>
                      {total.toLocaleString()}
                    </span>
                    <span className={`ml-2 text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      pts
                    </span>
                  </div>
                </div>
              ))}
              {Object.keys(totalByType).length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white dark:from-gray-600 dark:to-gray-500 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-500">
                    <Star className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                    No reward points yet
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Add points to your credit cards to see them here
                  </p>
                </div>
              )}
            </div>

            {/* Points by Bank */}
            <div className="space-y-4">
              <h3 className={`text-md font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Points by Bank</h3>
              {Object.entries(rewardPointsByBank).map(([bank, types]) => (
                <div key={bank} className="p-4 card-lux">
                  <div className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 mr-2"></div>
                    {bank}
                  </div>
                  <div className="space-y-2">
                    {Object.entries(types).map(([type, points]) => (
                      <div key={type} className="flex items-center justify-between text-sm bg-white rounded-lg p-2 border border-gray-200 transition-colors duration-200 hover:bg-amber-50/40">
                        <span className={`capitalize font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {type}
                        </span>
                        <span className={`font-semibold numeric-lux ${
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
              ))}
              {Object.keys(rewardPointsByBank).length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white dark:from-gray-600 dark:to-gray-500 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-500">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🏦</span>
                    </div>
                  </div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    No bank data available
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Add bank information to your credit cards
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Overall Total */}
          <div className="mt-8 pt-6 border-t-2 border-gradient-to-r from-orange-300 to-orange-600">
            <div className="text-center bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className={`text-4xl font-extrabold numeric-lux bg-gradient-to-r ${
                isDarkMode
                  ? 'from-orange-300 to-orange-400'
                  : 'from-orange-600 to-orange-500'
              } bg-clip-text text-transparent mb-2`}>
                {totalRewardPoints.toLocaleString()}
              </div>
              <p className={`text-sm font-medium tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Total Reward Points
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Across {creditCards.filter(card => (card.pointsBalance || 0) > 0).length} credit cards
              </p>
            </div>
          </div>

          {/* Credit Utilization */}
          <div className="mt-6">
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
              <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Credit Utilization</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip contentStyle={{ background: isDarkMode ? '#111827' : '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
                    <Pie data={utilizationData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={75} paddingAngle={2} startAngle={90} endAngle={450}>
                      <Cell fill="#f59e0b" />
                      <Cell fill={isDarkMode ? '#1f2937' : '#e5e7eb'} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className={`text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{creditUtilization}% used of total credit</p>
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
              <form onSubmit={editingCard ? handleUpdateCreditCard : handleAddCreditCard} className="space-y-4">
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
                          onLoad={(e) => {
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
                      {/* Delete action removed from surface for cleaner UI */}
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

          <div className="space-y-4">
            {loans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No loans added yet</p>
                <p className="text-sm">Click "Add Loan" to get started</p>
              </div>
            ) : (
              loans.map((loan) => (
                <div key={loan.id} className={`p-4 border rounded-lg transition-colors duration-200 ${
                  isDarkMode ? 'border-gray-600 bg-white' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Home className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{loan.name}</p>
                        <p className="text-sm text-gray-500">{loan.loanType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Interest: {loan.interestRate}%</p>
                      <p className="text-sm text-gray-600">Payment: ${loan.monthlyPayment.toLocaleString()}/mo</p>
                      {loan.originationDate && (
                        <p className="text-sm text-gray-600">Started: {new Date(loan.originationDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">Original Amount</p>
                      <p className="font-bold text-blue-600">
                        ${loan.originalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current Balance</p>
                      <p className={`font-bold ${loan.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${loan.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Equity Built</p>
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
                      {/* Delete action removed from surface for cleaner UI */}
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
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}