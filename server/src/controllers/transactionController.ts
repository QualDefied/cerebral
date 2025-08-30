import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/database.js';

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, accountId, category, type } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { userId: req.userId };
    if (accountId) where.accountId = accountId;
    if (category) where.category = category;
    if (type) where.type = type;

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: { name: true, type: true }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { accountId, amount, description, category, type, date } = req.body;

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: req.userId }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.userId!,
        accountId,
        amount,
        description,
        category,
        type,
        date: new Date(date)
      },
      include: {
        account: {
          select: { name: true, type: true }
        }
      }
    });

    const balanceChange = type === 'INCOME' ? Number(amount) : -Number(amount);
    
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: balanceChange
        }
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, description, category, date } = req.body;

    const transaction = await prisma.transaction.update({
      where: {
        id,
        userId: req.userId
      },
      data: { amount, description, category, date: new Date(date) },
      include: {
        account: {
          select: { name: true, type: true }
        }
      }
    });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.userId }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await prisma.transaction.delete({
      where: { id }
    });

    const balanceChange = transaction.type === 'INCOME' ? -Number(transaction.amount) : Number(transaction.amount);
    
    await prisma.account.update({
      where: { id: transaction.accountId },
      data: {
        balance: {
          increment: balanceChange
        }
      }
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};