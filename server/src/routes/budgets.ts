import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';

export const budgetRoutes = Router();

budgetRoutes.use(authenticateToken);

budgetRoutes.get('/', (req, res) => {
  res.json({ message: 'Budget routes coming soon' });
});