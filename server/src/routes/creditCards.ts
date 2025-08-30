import { Router } from 'express';
import {
  getCreditCards,
  createCreditCard,
  updateCreditCard,
  deleteCreditCard
} from '../controllers/creditCardController.js';

export const creditCardRoutes = Router();

// No authentication required - direct access enabled

creditCardRoutes.get('/', getCreditCards);
creditCardRoutes.post('/', createCreditCard);
creditCardRoutes.put('/:id', updateCreditCard);
creditCardRoutes.delete('/:id', deleteCreditCard);