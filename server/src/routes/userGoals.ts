import { Router } from 'express';
import {
  getUserGoals,
  createUserGoals,
  updateUserGoals,
  deleteUserGoals
} from '../controllers/userGoalsController.js';

export const userGoalsRoutes = Router();

// No authentication required for this demo - direct access enabled

userGoalsRoutes.get('/', getUserGoals);
userGoalsRoutes.post('/', createUserGoals);
userGoalsRoutes.put('/:id', updateUserGoals);
userGoalsRoutes.delete('/:id', deleteUserGoals);