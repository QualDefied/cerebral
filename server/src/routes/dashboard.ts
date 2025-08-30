import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticateToken);

dashboardRoutes.get('/', (req, res) => {
  res.json({ message: 'Dashboard routes coming soon' });
});