import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Operational application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: true,
      message: err.message,
    });
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: true,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Prisma specific known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      res.status(404).json({
        error: true,
        message: 'Product not found.',
      });
      return;
    }
    if (err.code === 'P2002') {
      res.status(409).json({
        error: true,
        message: 'A unique constraint was violated',
      });
      return;
    }
  }

  // Fallback for unhandled unexpected errors
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: true,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Internal server error',
  });
};
