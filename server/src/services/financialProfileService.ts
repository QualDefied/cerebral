import { PrismaClient } from '@prisma/client';
import { calculateCreditCardMinimumPayment, calculateTotalInterestPaid } from '../utils/financialCalculations.js';

const prisma = new PrismaClient();

export interface FinancialProfile {
  summary: string;
  assets: AssetProfile;
  liabilities: LiabilityProfile;
  cashFlow: CashFlowProfile;
  goals: GoalsProfile;
  recommendations: string[];
}

export interface AssetProfile {
  totalValue: number;
  breakdown: {
    crypto: CryptoBreakdown;
    emergency: number;
  };
  description: string;
}

export interface LiabilityProfile {
  totalDebt: number;
  creditCards: CreditCardBreakdown;
  otherDebts: DebtBreakdown;
  description: string;
}

export interface CashFlowProfile {
  monthlyIncome?: number;
  monthlyExpenses?: number;
  savingsRate?: number;
  debtServiceRatio: number;
  description: string;
}

export interface GoalsProfile {
  primary?: string;
  secondary?: string[];
  timeframes: Record<string, number>;
  description: string;
}

export interface CryptoBreakdown {
  totalValue: number;
  assets: Array<{
    symbol: string;
    quantity: number;
    currentValue: number;
    gainLoss: number;
    gainLossPercentage: number;
  }>;
}

export interface CreditCardBreakdown {
  totalBalance: number;
  totalMinimumPayment: number;
  totalInterestIfMinimum: number;
  averageAPR: number;
  totalCreditLimit: number;
  utilizationRate: number;
  cards: Array<{
    name: string;
    balance: number;
    limit: number;
    apr: number;
    minimumPayment: number;
    payoffTimeMonths?: number;
  }>;
}

export interface DebtBreakdown {
  totalBalance: number;
  totalMinimumPayment: number;
  debts: Array<{
    name: string;
    balance: number;
    interestRate: number;
    minimumPayment: number;
    type: string;
  }>;
}

export class FinancialProfileService {
  
  async generateLLMReadableProfile(): Promise<FinancialProfile> {
    const [creditCards, debts, cryptoAssets, budgets, userGoals] = await Promise.all([
      this.getCreditCardData(),
      this.getDebtData(),
      this.getCryptoData(),
      this.getBudgetData(),
      this.getUserGoals()
    ]);

    const assets = this.buildAssetProfile(cryptoAssets);
    const liabilities = this.buildLiabilityProfile(creditCards, debts);
    const cashFlow = this.buildCashFlowProfile(liabilities, userGoals);
    const goals = this.buildGoalsProfile(userGoals);
    const recommendations = this.generateRecommendations(assets, liabilities, cashFlow, goals);
    
    const summary = this.generateSummary(assets, liabilities, cashFlow, goals);

    return {
      summary,
      assets,
      liabilities,
      cashFlow,
      goals,
      recommendations
    };
  }

  private async getCreditCardData() {
    return await prisma.creditCard.findMany({
      where: { isActive: true }
    });
  }

  private async getDebtData() {
    return await prisma.debt.findMany();
  }

  private async getCryptoData() {
    return await prisma.cryptoAsset.findMany({
      where: { isActive: true }
    });
  }

  private async getBudgetData() {
    return await prisma.budget.findMany();
  }

  private async getUserGoals() {
    const goals = await prisma.userGoals.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1
    });
    return goals[0] || null;
  }

  private buildAssetProfile(cryptoAssets: any[]): AssetProfile {
    const cryptoBreakdown: CryptoBreakdown = {
      totalValue: 0,
      assets: cryptoAssets.map(asset => {
        const currentValue = Number(asset.quantity) * Number(asset.currentPrice);
        const costBasis = Number(asset.quantity) * Number(asset.averageCost);
        const gainLoss = currentValue - costBasis;
        const gainLossPercentage = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
        
        return {
          symbol: asset.symbol,
          quantity: Number(asset.quantity),
          currentValue,
          gainLoss,
          gainLossPercentage
        };
      })
    };

    cryptoBreakdown.totalValue = cryptoBreakdown.assets.reduce((sum, asset) => sum + asset.currentValue, 0);

    const totalValue = cryptoBreakdown.totalValue;
    
    let description = `Total assets: $${totalValue.toLocaleString()}. `;
    
    if (cryptoAssets.length > 0) {
      const totalGainLoss = cryptoBreakdown.assets.reduce((sum, asset) => sum + asset.gainLoss, 0);
      const overallGainLossPercentage = cryptoBreakdown.totalValue > 0 ? 
        (totalGainLoss / (cryptoBreakdown.totalValue - totalGainLoss)) * 100 : 0;
      
      description += `Crypto portfolio: ${cryptoAssets.length} assets worth $${cryptoBreakdown.totalValue.toLocaleString()} `;
      description += `(${overallGainLossPercentage >= 0 ? '+' : ''}${overallGainLossPercentage.toFixed(1)}% overall). `;
      
      const topAssets = cryptoBreakdown.assets
        .sort((a, b) => b.currentValue - a.currentValue)
        .slice(0, 3);
      
      if (topAssets.length > 0) {
        description += `Top holdings: ${topAssets.map(asset => 
          `${asset.symbol} ($${asset.currentValue.toLocaleString()})`
        ).join(', ')}. `;
      }
    }

    return {
      totalValue,
      breakdown: {
        crypto: cryptoBreakdown,
        emergency: 0 // This would need to be tracked separately
      },
      description
    };
  }

  private buildLiabilityProfile(creditCards: any[], debts: any[]): LiabilityProfile {
    // Process credit cards
    const creditCardBreakdown: CreditCardBreakdown = {
      totalBalance: 0,
      totalMinimumPayment: 0,
      totalInterestIfMinimum: 0,
      averageAPR: 0,
      totalCreditLimit: 0,
      utilizationRate: 0,
      cards: []
    };

    creditCards.forEach(card => {
      const balance = Number(card.currentBalance);
      const limit = Number(card.creditLimit);
      const apr = Number(card.apr);
      const minPaymentPercentage = Number(card.minimumPaymentPercentage);
      
      const paymentInfo = calculateCreditCardMinimumPayment(balance, apr, minPaymentPercentage);
      const totalInterest = calculateTotalInterestPaid(balance, apr, paymentInfo.minimumPayment);
      
      creditCardBreakdown.cards.push({
        name: card.name,
        balance,
        limit,
        apr,
        minimumPayment: paymentInfo.minimumPayment,
        payoffTimeMonths: paymentInfo.payoffTimeMonths
      });
      
      creditCardBreakdown.totalBalance += balance;
      creditCardBreakdown.totalMinimumPayment += paymentInfo.minimumPayment;
      creditCardBreakdown.totalInterestIfMinimum += totalInterest;
      creditCardBreakdown.totalCreditLimit += limit;
    });

    if (creditCards.length > 0) {
      creditCardBreakdown.averageAPR = creditCards.reduce((sum, card) => sum + Number(card.apr), 0) / creditCards.length;
      creditCardBreakdown.utilizationRate = creditCardBreakdown.totalCreditLimit > 0 ? 
        (creditCardBreakdown.totalBalance / creditCardBreakdown.totalCreditLimit) * 100 : 0;
    }

    // Process other debts
    const debtBreakdown: DebtBreakdown = {
      totalBalance: 0,
      totalMinimumPayment: 0,
      debts: debts.map(debt => ({
        name: debt.name,
        balance: Number(debt.balance),
        interestRate: Number(debt.interestRate),
        minimumPayment: Number(debt.minimumPayment),
        type: debt.type
      }))
    };

    debtBreakdown.totalBalance = debtBreakdown.debts.reduce((sum, debt) => sum + debt.balance, 0);
    debtBreakdown.totalMinimumPayment = debtBreakdown.debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

    const totalDebt = creditCardBreakdown.totalBalance + debtBreakdown.totalBalance;
    
    let description = `Total debt: $${totalDebt.toLocaleString()}. `;
    
    if (creditCards.length > 0) {
      description += `Credit cards: ${creditCards.length} cards with $${creditCardBreakdown.totalBalance.toLocaleString()} balance `;
      description += `(${creditCardBreakdown.utilizationRate.toFixed(1)}% utilization). `;
      description += `Average APR: ${creditCardBreakdown.averageAPR.toFixed(1)}%. `;
      description += `Monthly minimums: $${creditCardBreakdown.totalMinimumPayment.toLocaleString()}. `;
      
      if (creditCardBreakdown.totalInterestIfMinimum < Infinity) {
        description += `Total interest if paying minimums: $${creditCardBreakdown.totalInterestIfMinimum.toLocaleString()}. `;
      }
    }

    if (debts.length > 0) {
      description += `Other debts: ${debts.length} debts totaling $${debtBreakdown.totalBalance.toLocaleString()} `;
      description += `with $${debtBreakdown.totalMinimumPayment.toLocaleString()} monthly minimums. `;
    }

    return {
      totalDebt,
      creditCards: creditCardBreakdown,
      otherDebts: debtBreakdown,
      description
    };
  }

  private buildCashFlowProfile(liabilities: LiabilityProfile, userGoals: any): CashFlowProfile {
    const monthlyIncome = userGoals?.monthlyIncome ? Number(userGoals.monthlyIncome) : undefined;
    const monthlyExpenses = userGoals?.monthlyExpenses ? Number(userGoals.monthlyExpenses) : undefined;
    
    const totalDebtService = liabilities.creditCards.totalMinimumPayment + liabilities.otherDebts.totalMinimumPayment;
    
    let savingsRate: number | undefined;
    let debtServiceRatio = 0;
    
    if (monthlyIncome && monthlyIncome > 0) {
      debtServiceRatio = (totalDebtService / monthlyIncome) * 100;
      
      if (monthlyExpenses) {
        const availableForSavings = monthlyIncome - monthlyExpenses - totalDebtService;
        savingsRate = (availableForSavings / monthlyIncome) * 100;
      }
    }

    let description = '';
    
    if (monthlyIncome) {
      description += `Monthly income: $${monthlyIncome.toLocaleString()}. `;
      description += `Debt service ratio: ${debtServiceRatio.toFixed(1)}% `;
      description += `($${totalDebtService.toLocaleString()} in debt payments). `;
      
      if (monthlyExpenses) {
        description += `Monthly expenses: $${monthlyExpenses.toLocaleString()}. `;
        if (savingsRate !== undefined) {
          description += `Potential savings rate: ${savingsRate.toFixed(1)}%. `;
        }
      }
    } else {
      description += `Total monthly debt payments: $${totalDebtService.toLocaleString()}. `;
      description += 'Income and expense information not provided. ';
    }

    return {
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      debtServiceRatio,
      description
    };
  }

  private buildGoalsProfile(userGoals: any): GoalsProfile {
    if (!userGoals) {
      return {
        timeframes: {},
        description: 'No financial goals currently set.'
      };
    }

    const timeframes: Record<string, number> = {};
    let description = '';

    if (userGoals.primaryGoal) {
      description += `Primary goal: ${userGoals.primaryGoal.replace('_', ' ')}. `;
      
      if (userGoals.debtPayoffTimeframe) {
        timeframes.debt_payoff = userGoals.debtPayoffTimeframe;
        description += `Target debt payoff: ${userGoals.debtPayoffTimeframe} months. `;
      }
      
      if (userGoals.majorPurchaseTimeframe && userGoals.majorPurchaseAmount) {
        timeframes.major_purchase = userGoals.majorPurchaseTimeframe;
        description += `Major purchase: $${Number(userGoals.majorPurchaseAmount).toLocaleString()} in ${userGoals.majorPurchaseTimeframe} months`;
        if (userGoals.majorPurchaseTarget) {
          description += ` (${userGoals.majorPurchaseTarget})`;
        }
        description += '. ';
      }
    }

    if (userGoals.emergencyFundTarget) {
      description += `Emergency fund target: $${Number(userGoals.emergencyFundTarget).toLocaleString()}. `;
    }

    if (userGoals.riskTolerance) {
      description += `Risk tolerance: ${userGoals.riskTolerance}. `;
    }

    if (userGoals.targetSavingsRate) {
      description += `Target savings rate: ${Number(userGoals.targetSavingsRate)}%. `;
    }

    let secondary: string[] | undefined;
    if (userGoals.secondaryGoals) {
      try {
        secondary = JSON.parse(userGoals.secondaryGoals);
        if (secondary && secondary.length > 0) {
          description += `Secondary goals: ${secondary.join(', ')}. `;
        }
      } catch (e) {
        // Invalid JSON, ignore secondary goals
      }
    }

    if (userGoals.notes) {
      description += `Additional notes: ${userGoals.notes}. `;
    }

    return {
      primary: userGoals.primaryGoal,
      secondary,
      timeframes,
      description: description || 'Goals information available but details not provided.'
    };
  }

  private generateRecommendations(
    assets: AssetProfile,
    liabilities: LiabilityProfile,
    cashFlow: CashFlowProfile,
    goals: GoalsProfile
  ): string[] {
    const recommendations: string[] = [];

    // Debt recommendations
    if (liabilities.totalDebt > 0) {
      if (liabilities.creditCards.utilizationRate > 30) {
        recommendations.push('Credit utilization is high (>30%). Focus on paying down credit card balances to improve credit score.');
      }
      
      if (liabilities.creditCards.averageAPR > 20) {
        recommendations.push('High credit card APRs detected. Consider debt consolidation or balance transfer to lower interest cards.');
      }
      
      if (cashFlow.debtServiceRatio > 36) {
        recommendations.push('Debt-to-income ratio is concerning (>36%). Prioritize aggressive debt payoff.');
      }
    }

    // Savings recommendations
    if (cashFlow.savingsRate !== undefined) {
      if (cashFlow.savingsRate < 10) {
        recommendations.push('Savings rate is below recommended 10-15%. Look for ways to reduce expenses or increase income.');
      } else if (cashFlow.savingsRate > 20) {
        recommendations.push('Excellent savings rate! Consider optimizing investment allocation for better returns.');
      }
    }

    // Asset allocation recommendations
    if (assets.breakdown.crypto.totalValue > assets.totalValue * 0.1 && assets.totalValue > 10000) {
      recommendations.push('Crypto allocation may be high for diversified portfolio. Consider rebalancing into traditional investments.');
    }

    // Emergency fund recommendations
    if (goals.primary !== 'emergency_fund' && cashFlow.monthlyExpenses) {
      const emergencyFundNeeded = cashFlow.monthlyExpenses * 3;
      recommendations.push(`Build emergency fund: aim for $${emergencyFundNeeded.toLocaleString()} (3 months expenses).`);
    }

    return recommendations;
  }

  private generateSummary(
    assets: AssetProfile,
    liabilities: LiabilityProfile,
    cashFlow: CashFlowProfile,
    goals: GoalsProfile
  ): string {
    const netWorth = assets.totalValue - liabilities.totalDebt;
    
    let summary = `Financial Profile Summary: `;
    summary += `Net worth: $${netWorth.toLocaleString()} `;
    summary += `(Assets: $${assets.totalValue.toLocaleString()}, Debts: $${liabilities.totalDebt.toLocaleString()}). `;
    
    if (cashFlow.monthlyIncome) {
      summary += `Monthly income: $${cashFlow.monthlyIncome.toLocaleString()}. `;
    }
    
    if (liabilities.totalDebt > 0) {
      summary += `Debt service: $${(liabilities.creditCards.totalMinimumPayment + liabilities.otherDebts.totalMinimumPayment).toLocaleString()}/month `;
      summary += `(${cashFlow.debtServiceRatio.toFixed(1)}% of income). `;
    }
    
    if (goals.primary) {
      summary += `Primary financial goal: ${goals.primary.replace('_', ' ')}. `;
    }
    
    return summary;
  }

  async generateNaturalLanguageProfile(): Promise<string> {
    const profile = await this.generateLLMReadableProfile();
    
    let narrative = "FINANCIAL PROFILE FOR ADVISOR ANALYSIS\n\n";
    narrative += "EXECUTIVE SUMMARY\n";
    narrative += profile.summary + "\n\n";
    
    narrative += "ASSET DETAILS\n";
    narrative += profile.assets.description + "\n\n";
    
    narrative += "LIABILITY DETAILS\n";
    narrative += profile.liabilities.description + "\n\n";
    
    narrative += "CASH FLOW ANALYSIS\n";
    narrative += profile.cashFlow.description + "\n\n";
    
    narrative += "GOALS & OBJECTIVES\n";
    narrative += profile.goals.description + "\n\n";
    
    if (profile.recommendations.length > 0) {
      narrative += "PRELIMINARY OBSERVATIONS\n";
      profile.recommendations.forEach((rec, index) => {
        narrative += `${index + 1}. ${rec}\n`;
      });
    }
    
    return narrative;
  }

  async generateNaturalLanguageProfileWithClientData(clientData: any): Promise<string> {
    // Get database data
    const [creditCards, debts, cryptoAssets, budgets, userGoals] = await Promise.all([
      this.getCreditCardData(),
      this.getDebtData(),
      this.getCryptoData(),
      this.getBudgetData(),
      this.getUserGoals()
    ]);

    // Merge client data with database data
    const allLoans = [...debts, ...(clientData.loans || [])];
    const allExpenses = clientData.expenses || [];
    const balances = clientData.balances || {};
    const customAssets = clientData.customAssets || {};

    // Build enhanced profile
    const assets = this.buildEnhancedAssetProfile(cryptoAssets, customAssets);
    const liabilities = this.buildEnhancedLiabilityProfile(creditCards, allLoans);
    const cashFlow = this.buildEnhancedCashFlowProfile(liabilities, userGoals, balances, allExpenses);
    const goals = this.buildGoalsProfile(userGoals);
    const recommendations = this.generateRecommendations(assets, liabilities, cashFlow, goals);
    
    const summary = this.generateEnhancedSummary(assets, liabilities, cashFlow, goals, balances);

    let narrative = "COMPREHENSIVE FINANCIAL PROFILE FOR ADVISOR ANALYSIS\n\n";
    narrative += "EXECUTIVE SUMMARY\n";
    narrative += summary + "\n\n";
    
    narrative += "ASSET BREAKDOWN\n";
    narrative += assets.description;
    if (customAssets.bank > 0) {
      narrative += `Bank/Cash assets: $${customAssets.bank.toLocaleString()}. `;
    }
    narrative += "\n\n";
    
    narrative += "LIABILITY BREAKDOWN\n";
    narrative += liabilities.description + "\n\n";
    
    narrative += "CASH FLOW & BUDGET ANALYSIS\n";
    narrative += cashFlow.description;
    
    if (allExpenses.length > 0) {
      const monthlyExpensesByCategory = this.categorizeExpenses(allExpenses);
      narrative += `\n\nEXPENSE BREAKDOWN:\n`;
      Object.entries(monthlyExpensesByCategory).forEach(([category, amount]) => {
        narrative += `- ${category}: $${amount.toLocaleString()}/month\n`;
      });
    }
    narrative += "\n\n";
    
    narrative += "FINANCIAL GOALS & OBJECTIVES\n";
    narrative += goals.description + "\n\n";
    
    if (recommendations.length > 0) {
      narrative += "ADVISOR OBSERVATIONS & RECOMMENDATIONS\n";
      recommendations.forEach((rec, index) => {
        narrative += `${index + 1}. ${rec}\n`;
      });
    }
    
    return narrative;
  }

  private buildEnhancedAssetProfile(cryptoAssets: any[], customAssets: any): AssetProfile {
    const cryptoBreakdown = this.buildCryptoBreakdown(cryptoAssets);
    const bankAssets = customAssets.bank || 0;
    const totalValue = cryptoBreakdown.totalValue + bankAssets;
    
    let description = `Total assets: $${totalValue.toLocaleString()}. `;
    
    if (bankAssets > 0) {
      description += `Cash/Bank: $${bankAssets.toLocaleString()}. `;
    }
    
    if (cryptoAssets.length > 0) {
      const totalGainLoss = cryptoBreakdown.assets.reduce((sum, asset) => sum + asset.gainLoss, 0);
      const overallGainLossPercentage = cryptoBreakdown.totalValue > 0 ? 
        (totalGainLoss / (cryptoBreakdown.totalValue - totalGainLoss)) * 100 : 0;
      
      description += `Crypto portfolio: ${cryptoAssets.length} assets worth $${cryptoBreakdown.totalValue.toLocaleString()} `;
      description += `(${overallGainLossPercentage >= 0 ? '+' : ''}${overallGainLossPercentage.toFixed(1)}% overall). `;
      
      const topAssets = cryptoBreakdown.assets
        .sort((a, b) => b.currentValue - a.currentValue)
        .slice(0, 3);
      
      if (topAssets.length > 0) {
        description += `Top holdings: ${topAssets.map(asset => 
          `${asset.symbol} ($${asset.currentValue.toLocaleString()})`
        ).join(', ')}. `;
      }
    }

    return {
      totalValue,
      breakdown: {
        crypto: cryptoBreakdown,
        emergency: bankAssets
      },
      description
    };
  }

  private buildEnhancedLiabilityProfile(creditCards: any[], allLoans: any[]): LiabilityProfile {
    const creditCardBreakdown = this.buildCreditCardBreakdown(creditCards);
    
    const loanDebts = allLoans.filter(loan => !loan.type || loan.type !== 'credit_card');
    const debtBreakdown: DebtBreakdown = {
      totalBalance: 0,
      totalMinimumPayment: 0,
      debts: loanDebts.map(debt => ({
        name: debt.name,
        balance: Number(debt.currentBalance || debt.balance || 0),
        interestRate: Number(debt.interestRate || 0),
        minimumPayment: Number(debt.monthlyPayment || debt.minimumPayment || 0),
        type: debt.type || debt.loanType || 'loan'
      }))
    };

    debtBreakdown.totalBalance = debtBreakdown.debts.reduce((sum, debt) => sum + debt.balance, 0);
    debtBreakdown.totalMinimumPayment = debtBreakdown.debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

    const totalDebt = creditCardBreakdown.totalBalance + debtBreakdown.totalBalance;
    
    let description = `Total debt: $${totalDebt.toLocaleString()}. `;
    
    if (creditCards.length > 0) {
      description += `Credit cards: ${creditCards.length} cards with $${creditCardBreakdown.totalBalance.toLocaleString()} balance `;
      description += `(${creditCardBreakdown.utilizationRate.toFixed(1)}% utilization). `;
      description += `Average APR: ${creditCardBreakdown.averageAPR.toFixed(1)}%. `;
      description += `Monthly minimums: $${creditCardBreakdown.totalMinimumPayment.toLocaleString()}. `;
      
      if (creditCardBreakdown.totalInterestIfMinimum < Infinity) {
        description += `Total interest if paying minimums: $${creditCardBreakdown.totalInterestIfMinimum.toLocaleString()}. `;
      }
    }

    if (loanDebts.length > 0) {
      description += `Other loans: ${loanDebts.length} loans totaling $${debtBreakdown.totalBalance.toLocaleString()} `;
      description += `with $${debtBreakdown.totalMinimumPayment.toLocaleString()} monthly payments. `;
      
      const loanTypes = [...new Set(loanDebts.map(loan => loan.type || loan.loanType))];
      if (loanTypes.length > 0) {
        description += `Loan types: ${loanTypes.join(', ')}. `;
      }
    }

    return {
      totalDebt,
      creditCards: creditCardBreakdown,
      otherDebts: debtBreakdown,
      description
    };
  }

  private buildEnhancedCashFlowProfile(
    liabilities: LiabilityProfile, 
    userGoals: any, 
    balances: any, 
    expenses: any[]
  ): CashFlowProfile {
    const monthlyIncome = balances.monthlyIncome || (userGoals?.monthlyIncome ? Number(userGoals.monthlyIncome) : undefined);
    const monthlyExpenses = balances.monthlyExpenses || (userGoals?.monthlyExpenses ? Number(userGoals.monthlyExpenses) : undefined);
    
    const totalDebtService = liabilities.creditCards.totalMinimumPayment + liabilities.otherDebts.totalMinimumPayment;
    
    // Calculate actual expenses from expense list
    const totalCategorizedExpenses = expenses.reduce((sum, expense) => {
      const amount = Number(expense.amount || 0);
      const frequency = expense.frequency || 'monthly';
      let monthlyAmount = amount;
      
      switch (frequency) {
        case 'weekly':
          monthlyAmount = amount * 4.33;
          break;
        case 'yearly':
          monthlyAmount = amount / 12;
          break;
        case 'daily':
          monthlyAmount = amount * 30;
          break;
      }
      
      return sum + monthlyAmount;
    }, 0);
    
    const totalMonthlyExpenses = monthlyExpenses || totalCategorizedExpenses;
    
    let savingsRate: number | undefined;
    let debtServiceRatio = 0;
    
    if (monthlyIncome && monthlyIncome > 0) {
      debtServiceRatio = (totalDebtService / monthlyIncome) * 100;
      
      if (totalMonthlyExpenses > 0) {
        const availableForSavings = monthlyIncome - totalMonthlyExpenses - totalDebtService;
        savingsRate = (availableForSavings / monthlyIncome) * 100;
      }
    }

    let description = '';
    
    if (monthlyIncome) {
      description += `Monthly income: $${monthlyIncome.toLocaleString()}. `;
      description += `Debt service ratio: ${debtServiceRatio.toFixed(1)}% `;
      description += `($${totalDebtService.toLocaleString()} in debt payments). `;
      
      if (totalMonthlyExpenses > 0) {
        description += `Monthly expenses: $${totalMonthlyExpenses.toLocaleString()}. `;
        if (savingsRate !== undefined) {
          description += `Net cash flow: $${(monthlyIncome - totalMonthlyExpenses - totalDebtService).toLocaleString()}/month `;
          description += `(${savingsRate.toFixed(1)}% savings rate). `;
        }
      }
    } else {
      description += `Total monthly debt payments: $${totalDebtService.toLocaleString()}. `;
      if (totalCategorizedExpenses > 0) {
        description += `Categorized monthly expenses: $${totalCategorizedExpenses.toLocaleString()}. `;
      }
      description += 'Complete income information not provided. ';
    }

    return {
      monthlyIncome,
      monthlyExpenses: totalMonthlyExpenses,
      savingsRate,
      debtServiceRatio,
      description
    };
  }

  private buildCryptoBreakdown(cryptoAssets: any[]): CryptoBreakdown {
    const breakdown: CryptoBreakdown = {
      totalValue: 0,
      assets: cryptoAssets.map(asset => {
        const currentValue = Number(asset.quantity) * Number(asset.currentPrice);
        const costBasis = Number(asset.quantity) * Number(asset.averageCost);
        const gainLoss = currentValue - costBasis;
        const gainLossPercentage = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
        
        return {
          symbol: asset.symbol,
          quantity: Number(asset.quantity),
          currentValue,
          gainLoss,
          gainLossPercentage
        };
      })
    };

    breakdown.totalValue = breakdown.assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    return breakdown;
  }

  private buildCreditCardBreakdown(creditCards: any[]): CreditCardBreakdown {
    const breakdown: CreditCardBreakdown = {
      totalBalance: 0,
      totalMinimumPayment: 0,
      totalInterestIfMinimum: 0,
      averageAPR: 0,
      totalCreditLimit: 0,
      utilizationRate: 0,
      cards: []
    };

    creditCards.forEach(card => {
      const balance = Number(card.currentBalance);
      const limit = Number(card.creditLimit);
      const apr = Number(card.apr);
      const minPaymentPercentage = Number(card.minimumPaymentPercentage);
      
      const paymentInfo = calculateCreditCardMinimumPayment(balance, apr, minPaymentPercentage);
      const totalInterest = calculateTotalInterestPaid(balance, apr, paymentInfo.minimumPayment);
      
      breakdown.cards.push({
        name: card.name,
        balance,
        limit,
        apr,
        minimumPayment: paymentInfo.minimumPayment,
        payoffTimeMonths: paymentInfo.payoffTimeMonths
      });
      
      breakdown.totalBalance += balance;
      breakdown.totalMinimumPayment += paymentInfo.minimumPayment;
      breakdown.totalInterestIfMinimum += totalInterest;
      breakdown.totalCreditLimit += limit;
    });

    if (creditCards.length > 0) {
      breakdown.averageAPR = creditCards.reduce((sum, card) => sum + Number(card.apr), 0) / creditCards.length;
      breakdown.utilizationRate = breakdown.totalCreditLimit > 0 ? 
        (breakdown.totalBalance / breakdown.totalCreditLimit) * 100 : 0;
    }

    return breakdown;
  }

  private categorizeExpenses(expenses: any[]): Record<string, number> {
    return expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      const amount = Number(expense.amount || 0);
      const frequency = expense.frequency || 'monthly';
      
      let monthlyAmount = amount;
      switch (frequency) {
        case 'weekly':
          monthlyAmount = amount * 4.33;
          break;
        case 'yearly':
          monthlyAmount = amount / 12;
          break;
        case 'daily':
          monthlyAmount = amount * 30;
          break;
      }
      
      acc[category] = (acc[category] || 0) + monthlyAmount;
      return acc;
    }, {} as Record<string, number>);
  }

  private generateEnhancedSummary(
    assets: AssetProfile,
    liabilities: LiabilityProfile,
    cashFlow: CashFlowProfile,
    goals: GoalsProfile,
    balances: any
  ): string {
    const netWorth = assets.totalValue - liabilities.totalDebt;
    
    let summary = `Financial Profile Summary: `;
    summary += `Net worth: $${netWorth.toLocaleString()} `;
    summary += `(Assets: $${assets.totalValue.toLocaleString()}, Debts: $${liabilities.totalDebt.toLocaleString()}). `;
    
    if (cashFlow.monthlyIncome) {
      summary += `Monthly income: $${cashFlow.monthlyIncome.toLocaleString()}`;
      if (cashFlow.monthlyExpenses) {
        summary += `, expenses: $${cashFlow.monthlyExpenses.toLocaleString()}`;
        const netCashFlow = cashFlow.monthlyIncome - cashFlow.monthlyExpenses - (liabilities.creditCards.totalMinimumPayment + liabilities.otherDebts.totalMinimumPayment);
        summary += `, net cash flow: $${netCashFlow.toLocaleString()}`;
      }
      summary += `. `;
    }
    
    if (liabilities.totalDebt > 0) {
      summary += `Debt service: $${(liabilities.creditCards.totalMinimumPayment + liabilities.otherDebts.totalMinimumPayment).toLocaleString()}/month `;
      if (cashFlow.monthlyIncome) {
        summary += `(${cashFlow.debtServiceRatio.toFixed(1)}% of income). `;
      } else {
        summary += `. `;
      }
    }
    
    if (goals.primary) {
      summary += `Primary financial goal: ${goals.primary.replace('_', ' ')}. `;
    }
    
    return summary;
  }
}