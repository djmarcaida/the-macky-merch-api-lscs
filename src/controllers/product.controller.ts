import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../errors/AppError';
import { Prisma } from '@prisma/client';

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await prisma.product.create({
      data: req.body,
    });

    res.status(201).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, isAvailable, search, page, limit } = req.query as any;

    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.category = {
        equals: String(category),
      };
    }

    if (typeof isAvailable === 'boolean') {
      where.isAvailable = isAvailable;
    }

    if (search) {
      const searchTerm = String(search);
      where.OR = [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
      ];
    }

    const pageNum = Number(page) || 1;
    const take = Number(limit) || 10;
    const skip = (pageNum - 1) * take;

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / take) || 1;

    res.status(200).json({
      status: 'success',
      results: products.length,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    if (!req.body || Object.keys(req.body).length === 0) {
      throw new BadRequestError('Request body cannot be empty');
    }

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    const product = await prisma.product.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
