import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateCreditCardMinimumPayment, calculateTotalInterestPaid } from '../utils/financialCalculations.js';

const prisma = new PrismaClient();

export const getCreditCards = async (req: Request, res: Response) => {
  try {
    const creditCards = await prisma.creditCard.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    const creditCardsWithPayments = creditCards.map(card => {
      const balance = Number(card.currentBalance);
      const apr = Number(card.apr);
      const minPaymentPercentage = Number(card.minimumPaymentPercentage);

      const paymentInfo = calculateCreditCardMinimumPayment(balance, apr, minPaymentPercentage);
      const totalInterest = calculateTotalInterestPaid(balance, apr, paymentInfo.minimumPayment);

      return {
        ...card,
        currentBalance: balance,
        apr: apr,
        creditLimit: Number(card.creditLimit),
        pointsBalance: Number(card.pointsBalance),
        rewardType: card.rewardType,
        bank: card.bank,
        minimumPaymentPercentage: minPaymentPercentage,
        calculatedMinimumPayment: paymentInfo.minimumPayment,
        interestPortion: paymentInfo.interestPortion,
        principalPortion: paymentInfo.principalPortion,
        payoffTimeMonths: paymentInfo.payoffTimeMonths,
        totalInterestIfMinimumOnly: totalInterest,
        utilization: balance > 0 ? (balance / Number(card.creditLimit)) * 100 : 0,
        availableCredit: Number(card.creditLimit) - balance
      };
    });

    res.json(creditCardsWithPayments);
  } catch (error) {
    console.error('Error fetching credit cards:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCreditCard = async (req: Request, res: Response) => {
  try {
    const {
      name,
      lastFourDigits,
      creditLimit,
      currentBalance = 0,
      apr,
      rewardsProgram,
      cashbackRate = 0,
      annualFee = 0,
      minimumPaymentPercentage = 0.02,
      pointsBalance = 0,
      rewardType = 'points',
      bank
    } = req.body;

    if (!name || !lastFourDigits || !creditLimit || apr === undefined) {
      return res.status(400).json({
        message: 'Missing required fields: name, lastFourDigits, creditLimit, apr'
      });
    }

    const creditCard = await prisma.creditCard.create({
      data: {
        name,
        lastFourDigits,
        creditLimit,
        currentBalance,
        apr,
        rewardsProgram,
        cashbackRate,
        annualFee,
        minimumPaymentPercentage,
        pointsBalance,
        rewardType,
        bank
      }
    });

    const balance = Number(creditCard.currentBalance);
    const cardApr = Number(creditCard.apr);
    const minPaymentPercentage = Number(creditCard.minimumPaymentPercentage);
    
    const paymentInfo = calculateCreditCardMinimumPayment(balance, cardApr, minPaymentPercentage);
    const totalInterest = calculateTotalInterestPaid(balance, cardApr, paymentInfo.minimumPayment);
    
    const creditCardWithPayments = {
      ...creditCard,
      currentBalance: balance,
      apr: cardApr,
      creditLimit: Number(creditCard.creditLimit),
      pointsBalance: Number(creditCard.pointsBalance),
      rewardType: creditCard.rewardType,
      bank: creditCard.bank,
      calculatedMinimumPayment: paymentInfo.minimumPayment,
      interestPortion: paymentInfo.interestPortion,
      principalPortion: paymentInfo.principalPortion,
      payoffTimeMonths: paymentInfo.payoffTimeMonths,
      totalInterestIfMinimumOnly: totalInterest,
      utilization: balance > 0 ? (balance / Number(creditCard.creditLimit)) * 100 : 0,
      availableCredit: Number(creditCard.creditLimit) - balance
    };

    res.status(201).json(creditCardWithPayments);
  } catch (error) {
    console.error('Error creating credit card:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCreditCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingCard = await prisma.creditCard.findFirst({
      where: { id }
    });

    if (!existingCard) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    const updateData = { ...req.body };
    delete updateData.id;

    const creditCard = await prisma.creditCard.update({
      where: { id },
      data: updateData
    });

    const balance = Number(creditCard.currentBalance);
    const cardApr = Number(creditCard.apr);
    const minPaymentPercentage = Number(creditCard.minimumPaymentPercentage);
    
    const paymentInfo = calculateCreditCardMinimumPayment(balance, cardApr, minPaymentPercentage);
    const totalInterest = calculateTotalInterestPaid(balance, cardApr, paymentInfo.minimumPayment);
    
    const creditCardWithPayments = {
      ...creditCard,
      currentBalance: balance,
      apr: cardApr,
      creditLimit: Number(creditCard.creditLimit),
      pointsBalance: Number(creditCard.pointsBalance),
      rewardType: creditCard.rewardType,
      bank: creditCard.bank,
      calculatedMinimumPayment: paymentInfo.minimumPayment,
      interestPortion: paymentInfo.interestPortion,
      principalPortion: paymentInfo.principalPortion,
      payoffTimeMonths: paymentInfo.payoffTimeMonths,
      totalInterestIfMinimumOnly: totalInterest,
      utilization: balance > 0 ? (balance / Number(creditCard.creditLimit)) * 100 : 0,
      availableCredit: Number(creditCard.creditLimit) - balance
    };

    res.json(creditCardWithPayments);
  } catch (error) {
    console.error('Error updating credit card:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCreditCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingCard = await prisma.creditCard.findFirst({
      where: { id }
    });

    if (!existingCard) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    await prisma.creditCard.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'Credit card deleted successfully' });
  } catch (error) {
    console.error('Error deleting credit card:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};