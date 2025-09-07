import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserGoals = async (req: Request, res: Response) => {
  try {
    const userGoals = await prisma.userGoals.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Return the most recent goals (in a real app, this would be user-specific)
    const currentGoals = userGoals[0] || null;
    res.json(currentGoals);
  } catch (error) {
    console.error('Error fetching user goals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUserGoals = async (req: Request, res: Response) => {
  try {
    const {
      primaryGoal,
      secondaryGoals,
      targetSavingsRate,
      emergencyFundTarget,
      debtPayoffTimeframe,
      riskTolerance,
      monthlyIncome,
      monthlyExpenses,
      retirementAge,
      majorPurchaseTarget,
      majorPurchaseAmount,
      majorPurchaseTimeframe,
      notes
    } = req.body;

    if (!primaryGoal) {
      return res.status(400).json({
        message: 'Primary goal is required'
      });
    }

    // Convert secondaryGoals array to JSON string if provided
    let secondaryGoalsString: string | undefined;
    if (secondaryGoals && Array.isArray(secondaryGoals)) {
      secondaryGoalsString = JSON.stringify(secondaryGoals);
    }

    const userGoals = await prisma.userGoals.create({
      data: {
        primaryGoal,
        secondaryGoals: secondaryGoalsString,
        targetSavingsRate,
        emergencyFundTarget,
        debtPayoffTimeframe,
        riskTolerance,
        monthlyIncome,
        monthlyExpenses,
        retirementAge,
        majorPurchaseTarget,
        majorPurchaseAmount,
        majorPurchaseTimeframe,
        notes
      }
    });

    res.status(201).json(userGoals);
  } catch (error) {
    console.error('Error creating user goals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserGoals = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingGoals = await prisma.userGoals.findUnique({
      where: { id }
    });

    if (!existingGoals) {
      return res.status(404).json({ message: 'User goals not found' });
    }

    const updateData = { ...req.body };
    delete updateData.id;

    // Convert secondaryGoals array to JSON string if provided
    if (updateData.secondaryGoals && Array.isArray(updateData.secondaryGoals)) {
      updateData.secondaryGoals = JSON.stringify(updateData.secondaryGoals);
    }

    const userGoals = await prisma.userGoals.update({
      where: { id },
      data: updateData
    });

    res.json(userGoals);
  } catch (error) {
    console.error('Error updating user goals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUserGoals = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingGoals = await prisma.userGoals.findUnique({
      where: { id }
    });

    if (!existingGoals) {
      return res.status(404).json({ message: 'User goals not found' });
    }

    await prisma.userGoals.delete({
      where: { id }
    });

    res.json({ message: 'User goals deleted successfully' });
  } catch (error) {
    console.error('Error deleting user goals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};