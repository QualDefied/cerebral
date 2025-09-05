import { Request, Response, NextFunction } from 'express';

// Simple auth middleware for demo purposes
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // For demo purposes, allow all requests
  // In a real app, you would verify JWT tokens, API keys, etc.
  next();
};
