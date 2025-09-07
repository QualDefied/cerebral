import { Router } from 'express';
import {
  getFinancialProfile,
  getFinancialProfileForLLM,
  downloadFinancialProfile
} from '../controllers/financialProfileController.js';

export const financialProfileRoutes = Router();

// No authentication required for this demo - direct access enabled
// In production, you might want to add authentication

// Get structured financial profile
financialProfileRoutes.get('/', getFinancialProfile);

// Get LLM-optimized narrative profile
financialProfileRoutes.get('/llm', getFinancialProfileForLLM);
financialProfileRoutes.post('/llm', getFinancialProfileForLLM);

// Download profile as text file
financialProfileRoutes.get('/download', downloadFinancialProfile);