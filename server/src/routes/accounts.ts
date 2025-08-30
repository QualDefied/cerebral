import { Router } from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../controllers/accountController.js';

export const accountRoutes = Router();

const validateAccount = [
  body('name').notEmpty().trim(),
  body('type').isIn(['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'LOAN']),
  body('balance').optional().isNumeric(),
  body('currency').optional().isLength({ min: 3, max: 3 })
];

// No authentication required - direct access enabled

accountRoutes.get('/', getAccounts);
accountRoutes.post('/', validateAccount, createAccount);
accountRoutes.put('/:id', updateAccount);
accountRoutes.delete('/:id', deleteAccount);