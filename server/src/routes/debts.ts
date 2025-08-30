import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';

export const debtRoutes = Router();

debtRoutes.use(authenticateToken);

debtRoutes.get('/', (req, res) => {
  res.json({ message: 'Debt routes coming soon' });
});