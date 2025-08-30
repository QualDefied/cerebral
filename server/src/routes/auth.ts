import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController.js';

export const authRoutes = Router();

const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim()
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
];

authRoutes.post('/register', validateRegister, register);
authRoutes.post('/login', validateLogin, login);