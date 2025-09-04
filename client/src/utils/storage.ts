// Central storage management for the application
export const STORAGE_KEYS = {
  LOANS: 'cerebral_loans',
  CRYPTO_ASSETS: 'cerebral_crypto_assets', 
  MONTHLY_INCOME: 'cerebral_monthly_income',
  CUSTOM_ASSETS: 'cerebral_custom_assets',
  CREDIT_SCORE: 'cerebral_credit_score',
  FINANCIAL_GOAL: 'cerebral_financial_goal',
  MONTHLY_EXPENSES: 'cerebral_monthly_expenses',
  BALANCES: 'cerebral_balances',
  TOTAL_BALANCE: 'cerebral_total_balance',
  EXPENSES: 'cerebral_expenses'
} as const;

export const clearAllLocalStorage = () => {
  // Clear all specific application keys
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Also clear session storage
  sessionStorage.clear();
};

export const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const loadFromStorage = (key: string, defaultValue: any = null) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};