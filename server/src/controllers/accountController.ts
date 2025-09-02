import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../utils/database.js';

export const getAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createAccount = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, balance, currency } = req.body;

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: balance || 0,
        currency: currency || 'USD'
      }
    });

    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, balance, isActive } = req.body;

    const account = await prisma.account.update({
      where: { id },
      data: { name, balance, isActive }
    });

    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.account.delete({
      where: { id }
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};