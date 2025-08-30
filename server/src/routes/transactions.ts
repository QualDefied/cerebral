import { Router } from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionController.js';

export const transactionRoutes = Router();

const validateTransaction = [
  body('accountId').notEmpty(),
  body('amount').isNumeric(),
  body('description').notEmpty().trim(),
  body('category').isIn(['FOOD_DINING', 'TRANSPORTATION', 'ENTERTAINMENT', 'SHOPPING', 'BILLS_UTILITIES', 'HEALTHCARE', 'TRAVEL', 'EDUCATION', 'INCOME_SALARY', 'INCOME_INVESTMENT', 'TRANSFER', 'OTHER']),
  body('type').isIn(['INCOME', 'EXPENSE', 'TRANSFER']),
  body('date').isISO8601()
];

// No authentication required - direct access enabled

transactionRoutes.get('/', getTransactions);
transactionRoutes.post('/', validateTransaction, createTransaction);
transactionRoutes.put('/:id', updateTransaction);
transactionRoutes.delete('/:id', deleteTransaction);