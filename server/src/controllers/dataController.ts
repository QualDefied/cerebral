import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const wipeAllData = async (req: Request, res: Response) => {
  try {
    // Delete all data from all tables
    await prisma.$transaction(async (tx) => {
      await tx.cryptoAsset.deleteMany();
      await tx.creditCard.deleteMany();
      await tx.debt.deleteMany();
      await tx.budget.deleteMany();
    });

    res.json({ message: 'All data has been successfully wiped from the database' });
  } catch (error) {
    console.error('Error wiping data:', error);
    res.status(500).json({ message: 'Internal server error while wiping data' });
  }
};