import { Decimal } from '@prisma/client/runtime/library';

export interface MinimumPaymentCalculation {
  minimumPayment: number;
  interestPortion: number;
  principalPortion: number;
  payoffTimeMonths?: number;
}

export function calculateCreditCardMinimumPayment(
  balance: number,
  apr: number,
  minimumPercentage: number = 0.02
): MinimumPaymentCalculation {
  if (balance <= 0) {
    return {
      minimumPayment: 0,
      interestPortion: 0,
      principalPortion: 0,
      payoffTimeMonths: 0
    };
  }

  const monthlyInterestRate = apr / 100 / 12;
  const monthlyInterestCharge = balance * monthlyInterestRate;
  
  const percentageBasedMinimum = balance * minimumPercentage;
  
  const minimumPayment = Math.max(
    percentageBasedMinimum,
    monthlyInterestCharge + 10,
    15
  );
  
  const principalPortion = Math.max(0, minimumPayment - monthlyInterestCharge);
  
  let payoffTimeMonths: number | undefined;
  if (principalPortion > 0) {
    payoffTimeMonths = Math.ceil(
      -Math.log(1 - (balance * monthlyInterestRate) / minimumPayment) / 
      Math.log(1 + monthlyInterestRate)
    );
  }

  return {
    minimumPayment: Math.round(minimumPayment * 100) / 100,
    interestPortion: Math.round(monthlyInterestCharge * 100) / 100,
    principalPortion: Math.round(principalPortion * 100) / 100,
    payoffTimeMonths
  };
}

export function calculateTotalInterestPaid(
  balance: number,
  apr: number,
  minimumPayment: number
): number {
  if (balance <= 0 || minimumPayment <= 0) return 0;
  
  const monthlyInterestRate = apr / 100 / 12;
  let currentBalance = balance;
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 500;
  
  while (currentBalance > 0.01 && months < maxMonths) {
    const interestPayment = currentBalance * monthlyInterestRate;
    const principalPayment = minimumPayment - interestPayment;
    
    if (principalPayment <= 0) {
      return Infinity;
    }
    
    totalInterest += interestPayment;
    currentBalance -= principalPayment;
    months++;
    
    if (currentBalance < minimumPayment) {
      totalInterest += currentBalance * monthlyInterestRate;
      break;
    }
  }
  
  return Math.round(totalInterest * 100) / 100;
}