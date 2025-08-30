import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error.stack);

  if (error.code === 'P2002') {
    return res.status(400).json({
      error: 'Duplicate entry. This record already exists.',
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found.',
    });
  }

  res.status(500).json({
    error: 'Internal server error',
  });
};